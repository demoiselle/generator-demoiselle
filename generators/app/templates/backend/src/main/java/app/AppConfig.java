package app;

import br.gov.frameworkdemoiselle.annotation.Name;
import br.gov.frameworkdemoiselle.configuration.Configuration;

/**
 *
 * @author 70744416353
 */
@Configuration(resource = "app")
public class AppConfig {

    private String url;

    @Name("jwt.key")
    private String chave;

    @Name("jwt.minutes")
    private Float tempo;

    @Name("jwt.issuer")
    private String remetente;

    @Name("jwt.audience")
    private String destinatario;

    /**
     *
     */
    public AppConfig() {
        super();
    }

    /**
     *
     * @return
     */
    public String getUrl() {
        return url;
    }

    /**
     *
     * @return
     */
    public String getChave() {
        return chave;
    }

    /**
     *
     * @param chave
     */
    public void setChave(String chave) {
        this.chave = chave;
    }

    /**
     *
     * @return
     */
    public Float getTempo() {
        return tempo;
    }

    /**
     *
     * @param tempo
     */
    public void setTempo(Float tempo) {
        this.tempo = tempo;
    }

    /**
     *
     * @return
     */
    public String getRemetente() {
        return remetente;
    }

    /**
     *
     * @param remetente
     */
    public void setRemetente(String remetente) {
        this.remetente = remetente;
    }

    /**
     *
     * @return
     */
    public String getDestinatario() {
        return destinatario;
    }

    /**
     *
     * @param destinatario
     */
    public void setDestinatario(String destinatario) {
        this.destinatario = destinatario;
    }

}
