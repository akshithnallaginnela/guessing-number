package com.guessinggame.controller;

import com.guessinggame.model.GameMessage;
import com.guessinggame.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private GameService gameService;

    @MessageMapping("/game/guess")
    public void handleGuess(@Payload GameMessage message) {
        GameMessage response = gameService.processGuess(message);
        messagingTemplate.convertAndSend("/topic/game", response);
    }

    @MessageMapping("/game/start")
    public void startNewGame() {
        GameMessage response = gameService.startNewGame();
        messagingTemplate.convertAndSend("/topic/game", response);
    }
}
