package com.guessinggame.util;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.generativeai.ContentMaker;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.PartMaker;
import com.google.cloud.vertexai.generativeai.ResponseHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

@Component
public class GeminiAIClient {
    
    @Value("${gemini.project.id}")
    private String projectId;
    
    @Value("${gemini.location:us-central1}")
    private String location;
    
    @Value("${gemini.model.name:gemini-1.5-pro}")
    private String modelName;
    
    private GenerativeModel model;
    
    @PostConstruct
    public void init() {
        try (VertexAI vertexAI = new VertexAI(projectId, location)) {
            this.model = new GenerativeModel(modelName, vertexAI);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize Gemini AI client", e);
        }
    }
    
    public String getHint(int secretNumber, int guess, int attemptsLeft) {
        try (VertexAI vertexAI = new VertexAI(projectId, location)) {
            String prompt = String.format("""
                    You are a helpful assistant for a number guessing game.
                    The secret number is %d.
                    The player guessed %d.
                    They have %d attempts left.
                    
                    Provide a creative and helpful hint without giving away the number.
                    Make it encouraging and fun!
                    """, secretNumber, guess, attemptsLeft);
            
            GenerateContentResponse response = model.generateContent(ContentMaker.fromMultiModalData(
                    PartMaker.fromText(prompt)
            ));
            
            return ResponseHandler.getText(response);
        } catch (Exception e) {
            // Fallback to simple hint if AI service is unavailable
            if (guess < secretNumber) {
                return "The number is higher than " + guess + ". Keep trying!";
            } else {
                return "The number is lower than " + guess + ". You can do it!";
            }
        }
    }
}
