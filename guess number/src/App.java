import java.util.Random;
import java.util.Scanner;

public class App {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Random random = new Random();
        int lowerBound = 1;
        int upperBound = 100;
        int maxAttempts = 10;
        int score = 0;
        int rounds = 0;

        while (true) {
            int secretNumber = random.nextInt(upperBound - lowerBound + 1) + lowerBound;
            int attempts = 0;
            System.out.println("\nRound " + (rounds + 1) + ":");
            System.out.println("Guess the number between " + lowerBound + " and " + upperBound + ".");

            while (attempts < maxAttempts) {
                System.out.print("Enter your guess: ");
                int guess = scanner.nextInt();
                attempts++;

                if (guess < secretNumber) {
                    System.out.println("Too low!");
                } else if (guess > secretNumber) {
                    System.out.println("Too high!");
                } else {
                    System.out.println("Congratulations! You guessed the number.");
                    score++;
                    break;
                }
            }

            if (attempts == maxAttempts) {
                System.out.println("Sorry, you've used all your attempts. The number was " + secretNumber + ".");
            }

            rounds++;
            System.out.println("Score: " + score);
            System.out.print("Do you want to play another round? (yes/no): ");
            String playAgain = scanner.next().toLowerCase();
            if (!playAgain.equals("yes")) {
                break;
            }
        }

        System.out.println("\nGame Over! You played " + rounds + " rounds with a score of " + score + ".");
        scanner.close();
    }
}