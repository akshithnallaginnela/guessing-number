package com.guessinggame;

import java.util.Random;
import java.util.Scanner;

public class NumberGame {
    private final int secretNumber;
    private int attempts;
    private final int maxAttempts = 10;
    private boolean gameOver;
    private final Scanner scanner;
    private final Random random;

    public NumberGame() {
        this.random = new Random();
        this.scanner = new Scanner(System.in);
        this.secretNumber = random.nextInt(100) + 1; // 1-100
        this.attempts = 0;
        this.gameOver = false;
    }

    public void start() {
        System.out.println("Welcome to the Number Guessing Game!");
        System.out.println("I'm thinking of a number between 1 and 100.");
        System.out.println("You have " + maxAttempts + " attempts to guess it.\n");

        while (!gameOver && attempts < maxAttempts) {
            System.out.print("Enter your guess (1-100): ");
            
            try {
                int guess = scanner.nextInt();
                attempts++;

                if (guess < 1 || guess > 100) {
                    System.out.println("Please enter a number between 1 and 100!\n");
                    continue;
                }

                if (guess == secretNumber) {
                    System.out.println("\n🎉 Congratulations! You've guessed the number in " + attempts + " attempts!");
                    gameOver = true;
                } else if (guess < secretNumber) {
                    System.out.println("Too low! Try a higher number. Attempts left: " + (maxAttempts - attempts) + "\n");
                } else {
                    System.out.println("Too high! Try a lower number. Attempts left: " + (maxAttempts - attempts) + "\n");
                }
            } catch (Exception e) {
                System.out.println("Please enter a valid number!\n");
                scanner.nextLine(); // Clear the invalid input
            }
        }

        if (!gameOver) {
            System.out.println("\nGame Over! The number was: " + secretNumber);
        }

        scanner.close();
    }

    public static void main(String[] args) {
        while (true) {
            NumberGame game = new NumberGame();
            game.start();
            
            System.out.print("\nWould you like to play again? (yes/no): ");
            String playAgain = new Scanner(System.in).nextLine().toLowerCase();
            
            if (!playAgain.startsWith("y")) {
                System.out.println("\nThanks for playing! Goodbye! 👋");
                break;
            }
            System.out.println();
        }
    }
}
