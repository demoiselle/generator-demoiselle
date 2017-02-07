package <%= package.lower %>.service;

import io.swagger.jaxrs.config.BeanConfig;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

@ApplicationPath("api")
public class ApplicationConfig extends Application {

    public ApplicationConfig() {
        BeanConfig beanConfig = new BeanConfig();
        beanConfig.setBasePath("/api");
        beanConfig.setContact("demoiselle.framework@gmail.com");
        beanConfig.setDescription("Sistema base gerado pelo generetor-demoiselle https://github.com/demoiselle/generator-demoiselle ");
        beanConfig.setHost("localhost:8080");
        beanConfig.setLicense("LGPL v2");
        beanConfig.setVersion("3.0.0");
        beanConfig.setTermsOfServiceUrl("https://demoiselle.gitbooks.io/documentacao-jee/");
        beanConfig.setTitle("generetor-demoiselle");
        beanConfig.setResourcePackage("<%= package.lower %>.service");
        beanConfig.setScan(true);
    }
}
