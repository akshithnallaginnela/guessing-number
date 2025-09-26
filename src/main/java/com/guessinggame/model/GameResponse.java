package com.guessinggame.model;

import java.util.Set;

public class GameResponse {
    private String type;  // "GAME_UPDATE", "GAME_OVER", "ERROR"
    private String message;
    private String status; // "IN_PROGRESS", "WON", "LOST"
    private int attempts;
    private int maxAttempts;
    private int score;
    private int round;
    private int secretNumber;
    private Set<Integer> previousGuesses;
    private String hint;

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
    
    public int getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(int maxAttempts) { this.maxAttempts = maxAttempts; }
    
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    
    public int getRound() { return round; }
    public void setRound(int round) { this.round = round; }
    
    public int getSecretNumber() { return secretNumber; }
    public void setSecretNumber(int secretNumber) { this.secretNumber = secretNumber; }
    
    public Set<Integer> getPreviousGuesses() { return previousGuesses; }
    public void setPreviousGuesses(Set<Integer> previousGuesses) { this.previousGuesses = previousGuesses; }
    
    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
}
