package senberg.random;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.util.resource.PathResource;
import org.eclipse.jetty.util.resource.Resource;

import java.nio.file.Paths;

public class Random {
    public static void main(String[] args) throws Exception {
        ResourceHandler resourceHandler = new ResourceHandler();
        resourceHandler.setDirectoriesListed(false);

        Resource pathResource = new PathResource(Paths.get("src/main/webapp"));

        ContextHandler contextHandler = new ContextHandler();
        contextHandler.setContextPath("/");
        contextHandler.setBaseResource(pathResource);
        contextHandler.setHandler(resourceHandler);

        Server server = new Server(80);
        server.setHandler(contextHandler);
        server.start();
        server.join();
    }
}