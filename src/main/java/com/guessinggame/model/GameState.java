package com.guessinggame.model;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;

public class GameState {
    private String gameId;
    private int secretNumber;
    private int attempts;
    private int maxAttempts = 10;
    private int score = 0;
    private int round = 1;
    private int lowerBound = 1;
    private int upperBound = 100;
    private boolean gameOver = false;
    private Set<Integer> previousGuesses = new HashSet<>();
    private String playerName;
    private String status = "IN_PROGRESS"; // IN_PROGRESS, WON, LOST

    public GameState(String playerName) {
        this.playerName = playerName;
        this.gameId = "GAME-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
        startNewRound();
    }

    public void startNewRound() {
        Random random = new Random();
        this.secretNumber = random.nextInt(upperBound - lowerBound + 1) + lowerBound;
        this.attempts = 0;
        this.gameOver = false;
        this.status = "IN_PROGRESS";
        this.previousGuesses.clear();
        System.out.println("New round started. Secret number: " + secretNumber); // For debugging
    }

    public String makeGuess(int guess) {
        if (gameOver) {
            return "GAME_OVER";
        }

        if (previousGuesses.contains(guess)) {
            return "DUPLICATE";
        }

        attempts++;
        previousGuesses.add(guess);

        if (guess == secretNumber) {
            score++;
            gameOver = true;
            status = "WON";
            return "CORRECT";
        } else if (attempts >= maxAttempts) {
            gameOver = true;
            status = "LOST";
            return "GAME_OVER";
        } else {
            return guess < secretNumber ? "TOO_LOW" : "TOO_HIGH";
        }
    }

    public boolean startNewGame() {
        round++;
        startNewRound();
        return true;
    }

    // Getters and Setters
    public String getGameId() { return gameId; }
    public int getSecretNumber() { return secretNumber; }
    public int getAttempts() { return attempts; }
    public int getMaxAttempts() { return maxAttempts; }
    public int getScore() { return score; }
    public int getRound() { return round; }
    public int getLowerBound() { return lowerBound; }
    public int getUpperBound() { return upperBound; }
    public boolean isGameOver() { return gameOver; }
    public String getPlayerName() { return playerName; }
    public String getStatus() { return status; }
    public Set<Integer> getPreviousGuesses() { return previousGuesses; }
}
