// Game state
let gameState = {
    secretNumber: 0,
    attempts: 0,
    maxAttempts: 5, // Reduced from 10 to 5
    score: 0,
    round: 1,
    gameOver: false,
    lowerBound: 1,
    upperBound: 100,
    timeLeft: 5 * 60, // 5 minutes in seconds
    timer: null,
    hintsUsed: 0,
    maxHints: 2,
    hint1: '',
    hint2: ''
};

// DOM Elements
let guessInput, submitBtn, newGameBtn, messageEl, attemptsEl, scoreEl, roundEl;
const previousGuessesEl = document.getElementById('previousGuesses');

// Initialize the game
function initGame() {
    // Make sure DOM elements are initialized
    if (!guessInput || !submitBtn || !messageEl || !attemptsEl || !scoreEl || !roundEl || !previousGuessesEl) {
        initDOM();
    }

    gameState.secretNumber = generateRandomNumber(gameState.lowerBound, gameState.upperBound);
    gameState.attempts = 0;
    gameState.gameOver = false;
    gameState.hintsUsed = 0;
    gameState.timeLeft = 5 * 60; // Reset timer to 5 minutes
    
    // Clear any existing timer
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    // Start the timer
    gameState.timer = setInterval(updateTimer, 1000);
    updateTimer();
    
    // Update UI
    if (attemptsEl) attemptsEl.textContent = gameState.maxAttempts - gameState.attempts;
    if (previousGuessesEl) previousGuessesEl.innerHTML = '';
    if (guessInput) {
        guessInput.value = '';
        guessInput.disabled = false;
    }
    if (submitBtn) submitBtn.disabled = false;
    
    const hintBtn = document.getElementById('hintBtn');
    if (hintBtn) {
        hintBtn.disabled = false;
        hintBtn.textContent = `Get Hint (${gameState.maxHints - gameState.hintsUsed} left)`;
    }
    
    // Generate initial hints
    gameState.hint1 = generateHint(gameState.secretNumber);
    gameState.hint2 = generateHint(gameState.secretNumber);
    
    // Make sure hints are different
    while (gameState.hint2 === gameState.hint1) {
        gameState.hint2 = generateHint(gameState.secretNumber);
    }
    
    const hint1El = document.getElementById('hint1');
    const hint2El = document.getElementById('hint2');
    
    if (hint1El) hint1El.textContent = 'Click to reveal hint 1';
    if (hint2El) hint2El.textContent = 'Click to reveal hint 2';
    
    if (messageEl) {
        messageEl.textContent = `I'm thinking of a number between ${gameState.lowerBound} and ${gameState.upperBound}...`;
        messageEl.className = 'text-center text-lg font-medium text-gray-700 mb-6 min-h-8';
    }
    
    console.log('Secret number:', gameState.secretNumber); // For debugging
}

// Handle guess submission
function handleGuess() {
    if (gameState.gameOver) return;
    
    const guess = parseInt(guessInput.value);
    
    // Validate input
    if (isNaN(guess) || guess < gameState.lowerBound || guess > gameState.upperBound) {
        showMessage(`Please enter a number between ${gameState.lowerBound} and ${gameState.upperBound}`, 'text-red-600');
        return;
    }
    
    gameState.attempts++;
    attemptsEl.textContent = Math.max(0, gameState.maxAttempts - gameState.attempts);
    
    // Add to previous guesses
    const guessBubble = document.createElement('div');
    guessBubble.textContent = guess;
    guessBubble.className = 'guess-bubble';
    
    // Check the guess
    if (guess < gameState.secretNumber) {
        guessBubble.classList.add('guess-too-low');
        showMessage('Too low! Try a higher number.', 'text-blue-600');
    } else if (guess > gameState.secretNumber) {
        guessBubble.classList.add('guess-too-high');
        showMessage('Too high! Try a lower number.', 'text-red-600');
    } else {
        // Correct guess
        guessBubble.classList.add('guess-correct');
        gameState.score += Math.ceil((gameState.timeLeft / (5 * 60)) * 100); // Higher score for faster completion
        scoreEl.textContent = gameState.score;
        showMessage(`Congratulations! You guessed the number in ${gameState.attempts} attempts with ${Math.floor(gameState.timeLeft / 60)}:${gameState.timeLeft % 60 < 10 ? '0' : ''}${gameState.timeLeft % 60} remaining!`, 'text-green-600 font-semibold');
        messageEl.classList.add('correct-guess');
        endGame(true);
    }
    
    previousGuessesEl.prepend(guessBubble);
    guessInput.value = '';
    
    // Check if game over (out of attempts)
    if (!gameState.gameOver && gameState.attempts >= gameState.maxAttempts) {
        showMessage(`Game Over! The number was ${gameState.secretNumber}.`, 'text-red-600 font-semibold');
        endGame(false);
    }
}

// Show a hint
function showHint(hintNum) {
    if (gameState.gameOver) return;
    
    const hintElement = document.getElementById(`hint${hintNum}`);
    if (hintElement.textContent.includes('Click to reveal')) {
        const hintText = hintNum === 1 ? gameState.hint1 : gameState.hint2;
        hintElement.textContent = `Hint ${hintNum}: ${hintText}`;
        gameState.hintsUsed++;
        
        // Update the hint button text
        const hintsLeft = gameState.maxHints - gameState.hintsUsed;
        document.getElementById('hintBtn').textContent = `Get Hint (${hintsLeft} left)`;
        
        // Disable the hint button if all hints are used
        if (gameState.hintsUsed >= gameState.maxHints) {
            document.getElementById('hintBtn').disabled = true;
        }
    }
}

// Show message with optional class
function showMessage(msg, className = '') {
    messageEl.textContent = msg;
    messageEl.className = `text-center text-lg font-medium mb-6 min-h-8 ${className}`;
}

// Initialize DOM elements
function initDOM() {
    guessInput = document.getElementById('guessInput');
    submitBtn = document.getElementById('submitBtn');
    newGameBtn = document.getElementById('newGameBtn');
    messageEl = document.getElementById('message');
    attemptsEl = document.getElementById('attempts');
    scoreEl = document.getElementById('score');
    roundEl = document.getElementById('round');
    previousGuessesEl = document.getElementById('previousGuesses');
    
    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Submit guess
    submitBtn.addEventListener('click', handleGuess);
    
    // Handle Enter key
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGuess();
        }
    });
    
    // New game button
    newGameBtn.addEventListener('click', () => {
        if (confirm('Start a new game? Your current score will be reset.')) {
            newGame();
        }
    });
    
    // Hint button
    const hintBtn = document.getElementById('hintBtn');
    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            if (gameState.hintsUsed < gameState.maxHints) {
                showHint(gameState.hintsUsed + 1);
            }
        });
    }
    
    // Click on hint to reveal
    const hint1 = document.getElementById('hint1');
    const hint2 = document.getElementById('hint2');
    
    if (hint1) {
        hint1.addEventListener('click', () => {
            if (gameState.hintsUsed === 0) {
                showHint(1);
            }
        });
    }
    
    if (hint2) {
        hint2.addEventListener('click', () => {
            if (gameState.hintsUsed === 1) {
                showHint(2);
            }
        });
    }
    
    // Prevent form submission
    const forms = document.forms;
    if (forms.length > 0) {
        forms[0].addEventListener('submit', (e) => {
            e.preventDefault();
            handleGuess();
        });
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements and event listeners
    initDOM();
    
    // Initialize the game
    initGame();
});
