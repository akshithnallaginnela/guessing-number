package com.guessinggame;

import lombok.Data;
import java.util.Random;

@Data
public class Game {
    private int secretNumber;
    private int attempts;
    private int maxAttempts = 10;
    private int minRange = 1;
    private int maxRange = 100;
    private boolean gameOver;
    private String message;
    private int score;
    
    public Game() {
        startNewGame();
    }
    
    public void startNewGame() {
        Random random = new Random();
        this.secretNumber = random.nextInt(maxRange - minRange + 1) + minRange;
        this.attempts = 0;
        this.gameOver = false;
        this.message = "I'm thinking of a number between " + minRange + " and " + maxRange + "...";
    }
    
    public String makeGuess(int guess) {
        if (gameOver) {
            return "Game over! Start a new game.";
        }
        
        attempts++;
        
        if (guess < minRange || guess > maxRange) {
            return "Please enter a number between " + minRange + " and " + maxRange + "!";
        }
        
        if (guess == secretNumber) {
            score += calculateScore();
            gameOver = true;
            return "Congratulations! You guessed the number in " + attempts + " attempts!";
        } else if (guess < secretNumber) {
            return "Too low! Try a higher number.";
        } else {
            return "Too high! Try a lower number.";
        }
    }
    
    private int calculateScore() {
        int maxScore = 1000;
        int attemptPenalty = attempts * 10;
        return Math.max(0, maxScore - attemptPenalty);
    }
    
    public String getHint() {
        if (attempts == 0) {
            return "Make your first guess to get a hint!";
        }
        
        String hint = "";
        if (secretNumber % 2 == 0) {
            hint += "The number is even. ";
        } else {
            hint += "The number is odd. ";
        }
        
        if (secretNumber > 50) {
            hint += "It's greater than 50.";
        } else {
            hint += "It's 50 or lower.";
        }
        
        return hint;
    }
}
