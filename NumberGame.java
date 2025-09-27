import java.util.Random;
import java.util.Scanner;

public class NumberGame {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Random random = new Random();
        
        boolean playAgain = true;
        
        while (playAgain) {
            System.out.println("\n🎮 Welcome to the Number Guessing Game! 🎮");
            System.out.println("I'm thinking of a number between 1 and 100.");
            System.out.println("You have 10 attempts to guess it.\n");
            
            int secretNumber = random.nextInt(100) + 1;
            int attempts = 0;
            final int maxAttempts = 10;
            boolean guessed = false;
            
            while (attempts < maxAttempts && !guessed) {
                System.out.print("Enter your guess (1-100): ");
                
                try {
                    int guess = Integer.parseInt(scanner.nextLine());
                    attempts++;
                    
                    if (guess < 1 || guess > 100) {
                        System.out.println("Please enter a number between 1 and 100!");
                        continue;
                    }
                    
                    if (guess == secretNumber) {
                        System.out.println("\n🎉 Congratulations! You've guessed the number in " + attempts + " attempts!");
                        guessed = true;
                    } else if (guess < secretNumber) {
                        System.out.println("Too low! Attempts left: " + (maxAttempts - attempts));
                    } else {
                        System.out.println("Too high! Attempts left: " + (maxAttempts - attempts));
                    }
                } catch (NumberFormatException e) {
                    System.out.println("Please enter a valid number!");
                }
            }
            
            if (!guessed) {
                System.out.println("\nGame Over! The number was: " + secretNumber);
            }
            
            System.out.print("\nWould you like to play again? (yes/no): ");
            String playAgainInput = scanner.nextLine().toLowerCase();
            playAgain = playAgainInput.startsWith("y");
        }
        
        System.out.println("\nThanks for playing! Goodbye! 👋");
        scanner.close();
    }
}
