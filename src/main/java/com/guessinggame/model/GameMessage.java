package com.guessinggame.model;

public class GameMessage {
    private String type;  // "GUESS", "NEW_GAME", "JOIN"
    private String playerName;
    private Integer guess;
    private String gameId;

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }
    
    public Integer getGuess() { return guess; }
    public void setGuess(Integer guess) { this.guess = guess; }
    
    public String getGameId() { return gameId; }
    public void setGameId(String gameId) { this.gameId = gameId; }
}
