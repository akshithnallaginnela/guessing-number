package com.guessinggame.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameMessage {
    public enum MessageType {
        NEW_GAME,
        GUESS,
        HINT,
        GAME_OVER,
        ERROR
    }

    private MessageType type;
    private String playerName;
    private Integer guess;
    private String gameId;
    private String message;
    private Integer attemptsLeft;
    private Integer secretNumber;
    private Boolean isCorrect;
    private String hint;
    private Integer score;
}
