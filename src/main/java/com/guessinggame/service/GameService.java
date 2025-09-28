package com.guessinggame.service;

import com.guessinggame.model.GameMessage;
import com.guessinggame.util.GeminiAIClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.UUID;

@Service
public class GameService {
    
    private static final int MAX_ATTEMPTS = 10;
    private static final int MIN_NUMBER = 1;
    private static final int MAX_NUMBER = 100;
    
    @Autowired
    private GeminiAIClient geminiAIClient;
    
    private final Random random = new Random();
    
    public GameMessage startNewGame() {
        int secretNumber = generateRandomNumber();
        String gameId = UUID.randomUUID().toString();
        
        return GameMessage.builder()
                .type(GameMessage.MessageType.NEW_GAME)
                .gameId(gameId)
                .secretNumber(secretNumber)
                .attemptsLeft(MAX_ATTEMPTS)
                .message("New game started! Guess a number between 1 and 100.")
                .build();
    }
    
    public GameMessage processGuess(GameMessage guessMessage) {
        try {
            int guess = guessMessage.getGuess();
            int secretNumber = guessMessage.getSecretNumber();
            int attemptsLeft = guessMessage.getAttemptsLeft() - 1;
            
            if (guess == secretNumber) {
                return GameMessage.builder()
                        .type(GameMessage.MessageType.GAME_OVER)
                        .gameId(guessMessage.getGameId())
                        .isCorrect(true)
                        .message("Congratulations! You've guessed the number!")
                        .score(attemptsLeft * 10) // More points for fewer attempts
                        .build();
            }
            
            if (attemptsLeft <= 0) {
                return GameMessage.builder()
                        .type(GameMessage.MessageType.GAME_OVER)
                        .gameId(guessMessage.getGameId())
                        .isCorrect(false)
                        .secretNumber(secretNumber)
                        .message("Game Over! The number was: " + secretNumber)
                        .score(0)
                        .build();
            }
            
            // Get AI hint
            String hint = geminiAIClient.getHint(secretNumber, guess, attemptsLeft);
            
            return GameMessage.builder()
                    .type(GameMessage.MessageType.HINT)
                    .gameId(guessMessage.getGameId())
                    .guess(guess)
                    .attemptsLeft(attemptsLeft)
                    .hint(hint)
                    .message(guess < secretNumber ? "Too low!" : "Too high!")
                    .build();
                    
        } catch (Exception e) {
            return GameMessage.builder()
                    .type(GameMessage.MessageType.ERROR)
                    .message("An error occurred: " + e.getMessage())
                    .build();
        }
    }
    
    private int generateRandomNumber() {
        return random.nextInt(MAX_NUMBER - MIN_NUMBER + 1) + MIN_NUMBER;
    }
}
