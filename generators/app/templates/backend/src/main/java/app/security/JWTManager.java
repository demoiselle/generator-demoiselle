package app.security;

import br.gov.frameworkdemoiselle.util.Beans;
import com.google.gson.Gson;

import java.io.Serializable;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import org.jose4j.jwk.JsonWebKey;
import org.jose4j.jwk.RsaJsonWebKey;
import org.jose4j.jwk.RsaJwkGenerator;
import org.jose4j.jws.AlgorithmIdentifiers;
import org.jose4j.jws.JsonWebSignature;
import org.jose4j.jwt.JwtClaims;
import org.jose4j.jwt.consumer.InvalidJwtException;
import org.jose4j.jwt.consumer.JwtConsumer;
import org.jose4j.jwt.consumer.JwtConsumerBuilder;
import org.jose4j.lang.JoseException;
import app.AppConfig;
import app.cover.UserCover;
import app.entity.User;

/**
 *
 * @author 70744416353
 */
@RequestScoped
public class JWTManager implements Serializable {

    private static final long serialVersionUID = 1L;

    @Inject
    private transient HttpServletRequest httpRequest;

    private final AppConfig appConfig = Beans.getReference(AppConfig.class);

    private final RsaJsonWebKey rsaJsonWebKey;

    /**
     *
     * @throws org.jose4j.lang.JoseException
     */
    public JWTManager() throws JoseException {

        if (appConfig.getChave() == null) {
            RsaJsonWebKey chave = RsaJwkGenerator.generateJwk(2048);
            appConfig.setChave(chave.toJson(JsonWebKey.OutputControlLevel.INCLUDE_PRIVATE));
            Logger.getLogger(JWTManager.class.getName()).log(Level.SEVERE, "Se você quiser usar sua app em cluster, coloque o parametro jwt.key no app.properties e reinicie a aplicacao");
            Logger.getLogger(JWTManager.class.getName()).log(Level.SEVERE, "jwt.key={0}", appConfig.getChave());
            Logger.getLogger(JWTManager.class.getName()).log(Level.SEVERE, "Se você não usar esse parametro, a cada reinicialização será gerada uma nova chave privada, isso inviabiliza o uso em cluster ");
        }
        rsaJsonWebKey = (RsaJsonWebKey) RsaJsonWebKey.Factory.newPublicJwk(appConfig.getChave());
        rsaJsonWebKey.setKeyId("DEMOISELLE");

    }

    /**
     *
     * @param user
     * @return
     */
    public String addToken(User user) {
        try {
            JwtClaims claims = new JwtClaims();
            claims.setIssuer(appConfig.getRemetente());
            claims.setAudience(appConfig.getDestinatario());
            claims.setExpirationTimeMinutesInTheFuture(appConfig.getTempo() == null ? 720 : appConfig.getTempo());
            claims.setGeneratedJwtId();
            claims.setIssuedAtToNow();
            claims.setNotBeforeMinutesInThePast(1);
            user.setIp(httpRequest.getRemoteAddr());
            claims.setClaim("user", new Gson().toJson(new UserCover(user)));

            JsonWebSignature jws = new JsonWebSignature();
            jws.setPayload(claims.toJson());
            jws.setKey(rsaJsonWebKey.getPrivateKey());
            jws.setKeyIdHeaderValue(rsaJsonWebKey.getKeyId());
            jws.setAlgorithmHeaderValue(AlgorithmIdentifiers.RSA_USING_SHA256);
            return jws.getCompactSerialization();
        } catch (JoseException ex) {
            Logger.getLogger(JWTManager.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }

    /**
     *
     * @param jwt
     * @return
     */
    public UserCover hasToken(String jwt) {
        UserCover usuario = null;
        if (jwt != null && !jwt.isEmpty()) {
            JwtConsumer jwtConsumer = new JwtConsumerBuilder()
                .setRequireExpirationTime() // the JWT must have an expiration time
                .setAllowedClockSkewInSeconds(60) // allow some leeway in validating time based claims to account for clock skew
                .setExpectedIssuer(appConfig.getRemetente()) // whom the JWT needs to have been issued by
                .setExpectedAudience(appConfig.getDestinatario()) // to whom the JWT is intended for
                .setVerificationKey(rsaJsonWebKey.getKey()) // verify the signature with the public key
                .build(); // create the JwtConsumer instance

            try {
                JwtClaims jwtClaims = jwtConsumer.processToClaims(jwt);
                usuario = new Gson().fromJson((String) jwtClaims.getClaimValue("user"), UserCover.class);

                if (!httpRequest.getRemoteAddr().equalsIgnoreCase(usuario.getIp())) {
                    usuario = null;
                }
            } catch (InvalidJwtException e) {
                //Logger.getLogger(TokenRepository.class.getName()).log(Level.SEVERE, null, e);
            }
        }
        return usuario;
    }
}
