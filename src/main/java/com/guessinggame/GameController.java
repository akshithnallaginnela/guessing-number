package com.guessinggame;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
public class GameController {
    private final Game game;
    
    public GameController() {
        this.game = new Game();
    }
    
    @PostMapping("/guess")
    public GameResponse makeGuess(@RequestParam int number) {
        String message = game.makeGuess(number);
        return new GameResponse(
            message,
            game.getAttempts(),
            game.isGameOver(),
            game.getScore()
        );
    }
    
    @GetMapping("/hint")
    public String getHint() {
        return game.getHint();
    }
    
    @PostMapping("/new")
    public GameResponse newGame() {
        game.startNewGame();
        return new GameResponse(
            game.getMessage(),
            game.getAttempts(),
            game.isGameOver(),
            game.getScore()
        );
    }
    
    @GetMapping("/status")
    public GameResponse getStatus() {
        return new GameResponse(
            game.getMessage(),
            game.getAttempts(),
            game.isGameOver(),
            game.getScore()
        );
    }
    
    private static class GameResponse {
        private final String message;
        private final int attempts;
        private final boolean gameOver;
        private final int score;
        
        public GameResponse(String message, int attempts, boolean gameOver, int score) {
            this.message = message;
            this.attempts = attempts;
            this.gameOver = gameOver;
            this.score = score;
        }
        
        // Getters
        public String getMessage() { return message; }
        public int getAttempts() { return attempts; }
        public boolean isGameOver() { return gameOver; }
        public int getScore() { return score; }
    }
}
