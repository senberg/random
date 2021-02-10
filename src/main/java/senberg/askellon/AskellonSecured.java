package senberg.askellon;

import org.eclipse.jetty.http.HttpVersion;
import org.eclipse.jetty.server.*;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.util.resource.PathResource;
import org.eclipse.jetty.util.resource.Resource;
import org.eclipse.jetty.util.ssl.SslContextFactory;

import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class AskellonSecured {
    public static void main(String[] args) throws Exception {
        Path keystorePath = Paths.get("src/main/resources/keystore.jks");
        checkExists(keystorePath);

        HttpConfiguration httpConfiguration = new HttpConfiguration();
        httpConfiguration.setSecurePort(443);

        Server server = new Server(80);
        ServerConnector httpConnector = new ServerConnector(server, new HttpConnectionFactory(httpConfiguration));
        httpConnector.setPort(80);

        SslContextFactory sslContextFactory = new SslContextFactory.Server();
        sslContextFactory.setKeyStorePath(keystorePath.toString());
        sslContextFactory.setKeyStorePassword("OBF:1iun1j1u1toq1toq1to61u2w1x1b1u2e1too1to41to41iz01irz");

        HttpConfiguration httpsConfiguration = new HttpConfiguration(httpConfiguration);
        SecureRequestCustomizer secureRequestCustomizer = new SecureRequestCustomizer();
        secureRequestCustomizer.setStsMaxAge(2000);
        secureRequestCustomizer.setStsIncludeSubDomains(true);
        httpsConfiguration.addCustomizer(secureRequestCustomizer);

        SslConnectionFactory connectionFactory = new SslConnectionFactory(sslContextFactory, HttpVersion.HTTP_1_1.asString());
        ServerConnector httpsConnector = new ServerConnector(server, connectionFactory, new HttpConnectionFactory(httpsConfiguration));
        httpsConnector.setPort(443);
        httpsConnector.setIdleTimeout(300000);

        ResourceHandler resourceHandler = new ResourceHandler();
        resourceHandler.setDirectoriesListed(false);

        Path rootPath = Paths.get("src/main/webapp");
        checkExists(rootPath);
        Resource root = new PathResource(rootPath);

        ContextHandler contextHandler = new ContextHandler();
        contextHandler.setContextPath("/");
        contextHandler.setBaseResource(root);
        contextHandler.setHandler(resourceHandler);

        server.setConnectors(new Connector[]{httpConnector, httpsConnector});
        server.setHandler(contextHandler);
        server.start();
        server.join();
    }

    private static void checkExists(Path path) throws FileNotFoundException {
        if (!Files.exists(path)) {
            throw new FileNotFoundException(path.toString());
        }
    }
}