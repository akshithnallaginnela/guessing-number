package com.guessinggame.config;

import javax.websocket.server.ServerEndpointConfig;
import javax.websocket.server.ServerContainer;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class WebSocketConfig implements ServletContextListener {
    
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        try {
            // Get the WebSocket container
            ServerContainer container = (ServerContainer) 
                sce.getServletContext().getAttribute("javax.websocket.server.ServerContainer");
            
            if (container != null) {
                // Configure the endpoint with the WebSocket container
                ServerEndpointConfig config = ServerEndpointConfig.Builder
                    .create(com.guessinggame.endpoint.GameEndpoint.class, "/game")
                    .configurator(new ServerEndpointConfig.Configurator())
                    .build();
                
                // Add the endpoint
                container.addEndpoint(config);
                System.out.println("WebSocket endpoint registered at /game");
            } else {
                System.err.println("Could not initialize WebSocket: ServerContainer not found");
            }
        } catch (Exception e) {
            System.err.println("Error initializing WebSocket: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // Cleanup if needed
    }
}
