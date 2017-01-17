package app.service;

import io.swagger.jaxrs.config.BeanConfig;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;


/**
 * Application Config
 *
 * @author Demoiselle Generator
 */
@ApplicationPath("api")
public class ApplicationConfig extends Application {

    public ApplicationConfig() {
        BeanConfig beanConfig = new BeanConfig();
        beanConfig.setVersion("1.0.0");
        beanConfig.setBasePath("/todo/api");
        beanConfig.setResourcePackage("app.service");
        beanConfig.setScan(true);
    }
}
