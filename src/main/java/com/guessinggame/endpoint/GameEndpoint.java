package com.guessinggame.endpoint;

import com.guessinggame.model.GameMessage;
import com.guessinggame.model.GameResponse;
import com.guessinggame.model.GameState;
import com.google.gson.Gson;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/game")
public class GameEndpoint {
    private static final Set<Session> sessions = Collections.synchronizedSet(new HashSet<>());
    private static final ConcurrentHashMap<String, GameState> games = new ConcurrentHashMap<>();
    private static final Gson gson = new Gson();

    @OnOpen
    public void onOpen(Session session) {
        sessions.add(session);
        System.out.println("New session opened: " + session.getId());
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        try {
            GameMessage gameMessage = gson.fromJson(message, GameMessage.class);
            String playerName = gameMessage.getPlayerName();
            String gameId = gameMessage.getGameId();
            GameState gameState;

            if ("JOIN".equals(gameMessage.getType())) {
                // Create a new game or join existing one
                if (gameId == null || gameId.isEmpty()) {
                    gameState = new GameState(playerName);
                    games.put(gameState.getGameId(), gameState);
                    session.getUserProperties().put("gameId", gameState.getGameId());
                    sendGameState(gameState, session);
                } else if (games.containsKey(gameId)) {
                    gameState = games.get(gameId);
                    session.getUserProperties().put("gameId", gameId);
                    sendGameState(gameState, session);
                } else {
                    sendError("Game not found", session);
                }
            } else {
                // Handle game actions
                gameId = (String) session.getUserProperties().get("gameId");
                if (gameId == null || !games.containsKey(gameId)) {
                    sendError("No active game found", session);
                    return;
                }

                gameState = games.get(gameId);

                if ("GUESS".equals(gameMessage.getType())) {
                    handleGuess(gameMessage, gameState, session);
                } else if ("NEW_GAME".equals(gameMessage.getType())) {
                    gameState.startNewGame();
                    sendGameState(gameState, session);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendError("Invalid message format", session);
        }
    }

    private void handleGuess(GameMessage gameMessage, GameState gameState, Session session) {
        if (gameState.isGameOver()) {
            sendError("Game is already over. Start a new game.", session);
            return;
        }

        Integer guess = gameMessage.getGuess();
        if (guess == null) {
            sendError("No guess provided", session);
            return;
        }

        String result = gameState.makeGuess(guess);
        GameResponse response = createResponse(gameState);

        switch (result) {
            case "CORRECT":
                response.setType("GAME_UPDATE");
                response.setMessage("Congratulations! You guessed the number!");
                break;
            case "TOO_LOW":
                response.setType("GAME_UPDATE");
                response.setMessage("Too low! Try again.");
                break;
            case "TOO_HIGH":
                response.setType("GAME_UPDATE");
                response.setMessage("Too high! Try again.");
                break;
            case "GAME_OVER":
                response.setType("GAME_OVER");
                response.setMessage("Game Over! The number was " + gameState.getSecretNumber());
                break;
            case "DUPLICATE":
                response.setType("ERROR");
                response.setMessage("You've already guessed that number!");
                break;
        }

        sendResponse(response, session);
    }

    private GameResponse createResponse(GameState gameState) {
        GameResponse response = new GameResponse();
        response.setAttempts(gameState.getAttempts());
        response.setMaxAttempts(gameState.getMaxAttempts());
        response.setScore(gameState.getScore());
        response.setRound(gameState.getRound());
        response.setStatus(gameState.getStatus());
        response.setPreviousGuesses(gameState.getPreviousGuesses());
        
        // Add a hint if needed (every 3rd attempt)
        if (gameState.getAttempts() > 0 && gameState.getAttempts() % 3 == 0) {
            response.setHint(generateHint(gameState.getSecretNumber()));
        }
        
        return response;
    }

    private String generateHint(int secretNumber) {
        // Simple hint generation - you can make this more sophisticated
        if (secretNumber % 2 == 0) {
            return "The number is even.";
        } else {
            return "The number is odd.";
        }
    }

    private void sendGameState(GameState gameState, Session session) {
        GameResponse response = createResponse(gameState);
        response.setType("GAME_UPDATE");
        response.setMessage("Game started! Guess a number between " + 
                          gameState.getLowerBound() + " and " + gameState.getUpperBound());
        sendResponse(response, session);
    }

    private void sendError(String message, Session session) {
        GameResponse response = new GameResponse();
        response.setType("ERROR");
        response.setMessage(message);
        sendResponse(response, session);
    }

    private void sendResponse(GameResponse response, Session session) {
        try {
            String jsonResponse = gson.toJson(response);
            session.getBasicRemote().sendText(jsonResponse);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @OnClose
    public void onClose(Session session) {
        String gameId = (String) session.getUserProperties().get("gameId");
        if (gameId != null) {
            // Clean up game if no more players
            // In a real app, you might want to implement a more sophisticated cleanup
            games.remove(gameId);
        }
        sessions.remove(session);
        System.out.println("Session closed: " + session.getId());
    }

    @OnError
    public void onError(Throwable error) {
        error.printStackTrace();
    }
}
