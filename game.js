// Game state
let gameState = {
    playerName: '',
    level: 1,
    score: 0,
    highScore: localStorage.getItem('highScore') || 0,
    round: 1,
    maxRounds: 5,
    secretNumber: 0,
    attempts: 0,
    maxAttempts: 10,
    lowerBound: 1,
    upperBound: 100,
    previousGuesses: [],
    status: 'IN_PROGRESS', // IN_PROGRESS, WON, LOST, LEVEL_COMPLETE
    enemies: [],
    currentEnemy: null,
    difficulty: 'NORMAL', // EASY, NORMAL, HARD
    gameOver: false,
    hintsUsed: 0,
    lastHint: '',
    hintCooldown: 0
};

// Enemy configurations
const ENEMIES = {
    EASY: [
        { id: 1, name: 'Rookie Bot', avatar: '🤖', difficulty: 'EASY', maxScore: 100 },
        { id: 2, name: 'Lazy Bot', avatar: '😴', difficulty: 'EASY', maxScore: 150 }
    ],
    NORMAL: [
        { id: 3, name: 'Smart Bot', avatar: '🤓', difficulty: 'NORMAL', maxScore: 200 },
        { id: 4, name: 'Quick Bot', avatar: '⚡', difficulty: 'NORMAL', maxScore: 250 }
    ],
    HARD: [
        { id: 5, name: 'Master Bot', avatar: '👑', difficulty: 'HARD', maxScore: 350 },
        { id: 6, name: 'AI Overlord', avatar: '🤖', difficulty: 'HARD', maxScore: 500 }
    ]
};

// Level configurations
const LEVELS = {
    1: { maxAttempts: 10, range: 100, scoreMultiplier: 1 },
    2: { maxAttempts: 8, range: 200, scoreMultiplier: 1.5 },
    3: { maxAttempts: 6, range: 300, scoreMultiplier: 2 },
    4: { maxAttempts: 5, range: 400, scoreMultiplier: 2.5 },
    5: { maxAttempts: 4, range: 500, scoreMultiplier: 3 }
};

// DOM Elements
const loginForm = document.getElementById('loginForm');
const gameArea = document.getElementById('gameArea');
const playerNameInput = document.getElementById('playerName');
const startGameBtn = document.getElementById('startGameBtn');
const submitGuessBtn = document.getElementById('submitBtn');
const newGameBtn = document.getElementById('newGameBtn');
const guessInput = document.getElementById('guessInput');
const messageEl = document.getElementById('message');
const attemptsEl = document.getElementById('attempts');
const scoreEl = document.getElementById('score');
const roundEl = document.getElementById('round');
const previousGuessesEl = document.getElementById('previousGuesses');
const hintArea = document.getElementById('hintArea');
const hintText = document.getElementById('hintText');
const gameOverModal = document.getElementById('gameOverModal');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const shareScoreBtn = document.getElementById('shareScoreBtn');
const shareModal = document.getElementById('shareModal');
const shareLink = document.getElementById('shareLink');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const closeShareModal = document.getElementById('closeShareModal');

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing game...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize game state
    initGameState();
    
    // Focus the name input when the page loads
    if (playerNameInput) {
        playerNameInput.focus();
    }
});

// Helper function to get color based on difficulty
function getDifficultyColor(difficulty) {
    const colors = {
        'EASY': 'bg-green-100 text-green-800',
        'NORMAL': 'bg-blue-100 text-blue-800',
        'HARD': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
}

// Initialize game state
function initGameState() {
    gameState = {
        ...gameState,
        level: 1,
        score: 0,
        highScore: Math.max(gameState.highScore, parseInt(localStorage.getItem('highScore')) || 0),
        round: 1,
        maxRounds: 5,
        secretNumber: 0,
        attempts: 0,
        maxAttempts: LEVELS[1].maxAttempts,
        lowerBound: 1,
        upperBound: 100,
        previousGuesses: [],
        status: 'IN_PROGRESS',
        enemies: [],
        currentEnemy: null,
        difficulty: 'NORMAL',
        gameOver: false,
        hintsUsed: 0,
        lastHint: '',
        hintCooldown: 0
    };
    
    // Generate initial secret number
    generateSecretNumber();
    
    // Select initial enemy
    selectEnemy();
    
    // Update UI
    updateUI();
    
    // Show welcome message
    showMessage(`Welcome, ${gameState.playerName}! I'm thinking of a number between ${gameState.lowerBound} and ${gameState.upperBound}...`, 'text-blue-600');
}

// Set up all event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Start Game button
    if (startGameBtn) {
        console.log('Found startGameBtn');
        startGameBtn.addEventListener('click', handleStartGame);
    } else {
        console.error('Start Game button not found!');
    }
    
    // Player name input - handle Enter key
    if (playerNameInput) {
        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && startGameBtn) {
                startGameBtn.click();
            }
        });
    }
    
    // Submit guess button
    if (submitGuessBtn) {
        submitGuessBtn.addEventListener('click', handleGuess);
    }
    
    // Guess input - handle Enter key
    if (guessInput) {
        guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleGuess();
            }
        });
    }
    
    // New game button
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            if (confirm('Start a new game? Your current score will be reset.')) {
                startNewGame();
            }
        });
    }
    
    // Play again button
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', startNewGame);
    }
    
    // Share score button
    if (shareScoreBtn) {
        shareScoreBtn.addEventListener('click', showShareModal);
    }
    
    // Copy link button
    if (copyLinkBtn && shareLink) {
        copyLinkBtn.addEventListener('click', () => {
            shareLink.select();
            document.execCommand('copy');
            showMessage('Link copied to clipboard!', 'text-green-600');
        });
    }
    
    // Close share modal
    if (closeShareModal) {
        closeShareModal.addEventListener('click', hideShareModal);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === gameOverModal) {
            hideGameOverModal();
        }
        if (e.target === shareModal) {
            hideShareModal();
        }
    });
    
    console.log('Finished setting up event listeners');
}

// Handle Start Game button click
function handleStartGame() {
    console.log('Start Game button clicked');
    const playerName = playerNameInput ? playerNameInput.value.trim() : '';
    
    if (!playerName) {
        showMessage('Please enter your name', 'text-red-600');
        return;
    }
    
    gameState.playerName = playerName;
    
    // Initialize or reset game state
    initGameState();
    
    // Generate a new secret number
    generateSecretNumber();
    
    // Select an enemy for this round
    selectEnemy();
    
    // Hide login form and show game area
    if (loginForm) loginForm.classList.add('hidden');
    if (gameArea) gameArea.classList.remove('hidden');
    
    // Update UI
    updateUI();
    
    // Show welcome message
    showMessage(`Welcome, ${playerName}! I'm thinking of a number between ${gameState.lowerBound} and ${gameState.upperBound}. Can you guess it?`);
}

// Generate a random secret number based on current level
function generateSecretNumber() {
    const levelConfig = LEVELS[gameState.level];
    gameState.secretNumber = Math.floor(Math.random() * levelConfig.range) + 1;
    gameState.upperBound = levelConfig.range;
    gameState.maxAttempts = levelConfig.maxAttempts;
    gameState.attempts = 0;
    gameState.previousGuesses.clear();
    
    console.log(`New secret number generated: ${gameState.secretNumber} (1-${levelConfig.range})`);
}

// Select a random enemy for the current level
function selectEnemy() {
    let availableEnemies = [];
    
    // Add enemies based on difficulty
    if (gameState.level <= 2) {
        availableEnemies = [...ENEMIES.EASY];
    } else if (gameState.level <= 4) {
        availableEnemies = [...ENEMIES.NORMAL];
    } else {
        availableEnemies = [...ENEMIES.HARD];
    }
    
    // Select a random enemy
    const randomIndex = Math.floor(Math.random() * availableEnemies.length);
    gameState.currentEnemy = { ...availableEnemies[randomIndex] };
    
    console.log(`Selected enemy: ${gameState.currentEnemy.name} (${gameState.currentEnemy.difficulty})`);
}

// Handle player's guess
function handleGuess() {
    const guessInput = document.getElementById('guessInput');
    const guess = parseInt(guessInput.value.trim());
    
    // Validate input
    if (isNaN(guess) || guess < gameState.lowerBound || guess > gameState.upperBound) {
        showMessage(`Please enter a number between ${gameState.lowerBound} and ${gameState.upperBound}`, 'text-red-600');
        return;
    }
    
    // Check if already guessed
    if (gameState.previousGuesses.has(guess)) {
        showMessage(`You've already guessed ${guess}. Try a different number.`, 'text-yellow-600');
        return;
    }
    
    // Add to previous guesses
    gameState.previousGuesses.add(guess);
    gameState.attempts++;
    
    // Check the guess
    if (guess === gameState.secretNumber) {
        handleCorrectGuess();
    } else {
        handleIncorrectGuess(guess);
    }
    
    // Update UI
    updateUI();
    guessInput.value = '';
    guessInput.focus();
}

// Handle correct guess
function handleCorrectGuess() {
    const levelConfig = LEVELS[gameState.level];
    const baseScore = 100 * levelConfig.scoreMultiplier;
    const attemptBonus = (gameState.maxAttempts - gameState.attempts + 1) * 10 * levelConfig.scoreMultiplier;
    const roundBonus = gameState.round * 20 * levelConfig.scoreMultiplier;
    
    const scoreEarned = baseScore + attemptBonus + roundBonus;
    gameState.score += Math.floor(scoreEarned);
    
    // Update high score if needed
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
    }
    
    // Check if level is complete
    if (gameState.level < Object.keys(LEVELS).length) {
        gameState.status = 'LEVEL_COMPLETE';
        showMessage(
            `🎉 Correct! The number was ${gameState.secretNumber}. ` +
            `+${scoreEarned} points! Level ${gameState.level} complete!`,
            'text-green-600'
        );
        
        // Show level complete modal
        setTimeout(() => {
            startNextLevel();
        }, 2000);
    } else {
        // Game completed
        gameState.status = 'WON';
        showMessage(
            `🏆 Congratulations! You've completed all levels with a final score of ${gameState.score}!`,
            'text-green-600'
        );
        showGameOver(true);
    }
}

// Handle incorrect guess
function handleIncorrectGuess(guess) {
    const hint = guess < gameState.secretNumber ? 'higher' : 'lower';
    const attemptsLeft = gameState.maxAttempts - gameState.attempts;
    
    // Add guess to previous guesses display
    const guessBubble = document.createElement('div');
    guessBubble.className = `guess-bubble px-3 py-1 rounded-full text-sm font-medium ${guess < gameState.secretNumber ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`;
    guessBubble.textContent = `${guess} (${hint})`;
    document.getElementById('previousGuesses').appendChild(guessBubble);
    
    // Check if out of attempts
    if (attemptsLeft <= 0) {
        gameState.status = 'LOST';
        showMessage(
            `Game Over! The number was ${gameState.secretNumber}. Better luck next time!`,
            'text-red-600'
        );
        showGameOver(false);
    } else {
        showMessage(
            `Try again! The number is ${hint} than ${guess}. ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left.`,
            'text-yellow-600'
        );
    }
}

// Start the next level
function startNextLevel() {
    gameState.level++;
    gameState.round++;
    gameState.status = 'IN_PROGRESS';
    
    // Generate new secret number for the next level
    generateSecretNumber();
    
    // Select a new enemy
    selectEnemy();
    
    // Update UI
    updateUI();
    
    // Show level start message
    showMessage(
        `Level ${gameState.level}: I'm thinking of a number between 1 and ${gameState.upperBound}. ` +
        `Can you guess it in ${gameState.maxAttempts} attempts?`
    );
}

// Show game over modal
function showGameOver(isWinner) {
    gameState.gameOver = true;
    
    const modal = document.getElementById('gameOverModal');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const shareScoreBtn = document.getElementById('shareScoreBtn');
    
    if (isWinner) {
        title.textContent = '🎉 You Won!';
        message.textContent = `Congratulations! You've completed the game with a score of ${gameState.score}.`;
    } else {
        title.textContent = '😢 Game Over';
        message.textContent = `The number was ${gameState.secretNumber}. Your score: ${gameState.score}`;
    }
    
    // Set up event listeners for modal buttons
    playAgainBtn.onclick = () => {
        modal.classList.add('hidden');
        startNewGame();
    };
    
    shareScoreBtn.onclick = showShareModal;
    
    // Show the modal
    modal.classList.remove('hidden');
}

// Update the UI based on game state
function updateUI() {
    // Update score and attempts
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('highScore').textContent = gameState.highScore;
    document.getElementById('attempts').textContent = `${gameState.attempts}/${gameState.maxAttempts}`;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('round').textContent = gameState.round;
    
    // Update player name display
    const playerNameDisplay = document.getElementById('playerNameDisplay');
    if (playerNameDisplay) {
        playerNameDisplay.textContent = gameState.playerName;
    }
    
    // Update enemy info
    const enemyInfo = document.getElementById('enemyInfo');
    if (enemyInfo && gameState.currentEnemy) {
        enemyInfo.innerHTML = `
            <span class="font-medium">VS</span>
            <span class="ml-2">${gameState.currentEnemy.avatar} ${gameState.currentEnemy.name}</span>
            <span class="text-xs bg-gray-200 px-2 py-0.5 rounded-full ml-2">${gameState.currentEnemy.difficulty}</span>
        `;
    }
    
    // Clear previous guesses
    const previousGuesses = document.getElementById('previousGuesses');
    if (previousGuesses) {
        previousGuesses.innerHTML = '';
    }
    
    // Update input field attributes
    const guessInput = document.getElementById('guessInput');
    if (guessInput) {
        guessInput.min = gameState.lowerBound;
        guessInput.max = gameState.upperBound;
        guessInput.placeholder = `Enter a number (${gameState.lowerBound}-${gameState.upperBound})`;
    }
}

// Show a message to the player
function showMessage(message, textColor = 'text-gray-700') {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `text-center text-lg font-medium mb-6 min-h-12 ${textColor}`;
    }
    console.log(`[MESSAGE] ${message}`);
}

// Start a new game
function startNewGame() {
    initGameState();
    generateSecretNumber();
    selectEnemy();
    
    // Show game area if not already shown
    if (loginForm && !loginForm.classList.contains('hidden')) {
        loginForm.classList.add('hidden');
    }
    if (gameArea) {
        gameArea.classList.remove('hidden');
    }
    
    // Focus the guess input
    const guessInput = document.getElementById('guessInput');
    if (guessInput) {
        guessInput.focus();
    }
    
    // Show welcome message
    showMessage(`Welcome back, ${gameState.playerName}! I'm thinking of a number between ${gameState.lowerBound} and ${gameState.upperBound}. Can you guess it?`);
    
    // Update UI
    updateUI();
}
// Initialize WebSocket connection
function initWebSocket() {
    // Not needed for the current implementation
    console.log('WebSocket initialization not required for single-player mode');
}

// Show share modal
function showShareModal() {
    const modal = document.getElementById('shareModal');
    const shareLink = document.getElementById('shareLink');
    
    if (shareLink) {
        const gameUrl = `${window.location.origin}${window.location.pathname}?player=${encodeURIComponent(gameState.playerName)}&score=${gameState.score}`;
        shareLink.value = gameUrl;
    }
    
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Hide share modal
function hideShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Set up event listeners for the share modal
if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
        const shareLink = document.getElementById('shareLink');
        if (shareLink) {
            shareLink.select();
            document.execCommand('copy');
            showMessage('Link copied to clipboard!', 'text-green-600');
            hideShareModal();
        }
    });
}

if (closeShareModal) {
    closeShareModal.addEventListener('click', hideShareModal);
}
// Handle window unload
document.addEventListener('DOMContentLoaded', () => {
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('player');
    const score = urlParams.get('score');
    
    if (playerName) {
        document.getElementById('playerName').value = playerName;
    }
    
    if (score) {
        gameState.highScore = Math.max(gameState.highScore, parseInt(score));
        localStorage.setItem('highScore', gameState.highScore);
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && gameState.status === 'IN_PROGRESS') {
        // Focus the input field when returning to the tab
        const guessInput = document.getElementById('guessInput');
        if (guessInput) {
            guessInput.focus();
        }
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Focus the input field when pressing any key on the document
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        const guessInput = document.getElementById('guessInput');
        if (guessInput && !gameState.gameOver) {
            guessInput.focus();
        }
    }
    
    // Handle Enter key on guess input
    if (e.key === 'Enter' && document.activeElement.id === 'guessInput') {
        handleGuess();
    }
});
// Start the game when the page loads
window.onload = () => {
    // Check if there's a saved game in localStorage
    const savedGame = localStorage.getItem('savedGame');
    if (savedGame) {
        try {
            const parsedGame = JSON.parse(savedGame);
            if (confirm('Would you like to continue your previous game?')) {
                gameState = { ...gameState, ...parsedGame };
                startNewGame();
                return;
            }
        } catch (e) {
            console.error('Error loading saved game:', e);
        }
    }
    
    // Otherwise, show the login form
    if (loginForm) {
        loginForm.classList.remove('hidden');
    }
    
    // Focus the name input
    if (playerNameInput) {
        playerNameInput.focus();
    }
};

// Save game state to localStorage when the page is about to unload
window.onbeforeunload = () => {
    if (gameState.status === 'IN_PROGRESS') {
        localStorage.setItem('savedGame', JSON.stringify({
            playerName: gameState.playerName,
            level: gameState.level,
            score: gameState.score,
            secretNumber: gameState.secretNumber,
            attempts: gameState.attempts,
            maxAttempts: gameState.maxAttempts,
            lowerBound: gameState.lowerBound,
            upperBound: gameState.upperBound,
            previousGuesses: Array.from(gameState.previousGuesses),
            status: gameState.status,
            currentEnemy: gameState.currentEnemy,
            difficulty: gameState.difficulty,
            round: gameState.round
        }));
    } else {
        localStorage.removeItem('savedGame');
    }
};
// Add animation to guess bubbles when added
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('guess-bubble')) {
                    node.style.opacity = '0';
                    node.style.transform = 'translateY(10px)';
                    node.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    
                    // Trigger reflow
                    void node.offsetWidth;
                    
                    // Animate in
                    node.style.opacity = '1';
                    node.style.transform = 'translateY(0)';
                }
            });
        }
    });
});

// Start observing the previous guesses container
const previousGuesses = document.getElementById('previousGuesses');
if (previousGuesses) {
    observer.observe(previousGuesses, { childList: true });
}

// Add confetti effect for correct guesses
function showConfetti() {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Since particles fall down, start a bit higher than random
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

// Add confetti to the handleCorrectGuess function
function handleCorrectGuess() {
    const levelConfig = LEVELS[gameState.level];
    const baseScore = 100 * levelConfig.scoreMultiplier;
    const attemptBonus = (gameState.maxAttempts - gameState.attempts + 1) * 10 * levelConfig.scoreMultiplier;
    const roundBonus = gameState.round * 20 * levelConfig.scoreMultiplier;
    
    const scoreEarned = baseScore + attemptBonus + roundBonus;
    gameState.score += Math.floor(scoreEarned);
    
    // Update high score if needed
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
    }
    
    // Show confetti
    showConfetti();
    
    // Check if level is complete
    if (gameState.level < Object.keys(LEVELS).length) {
        gameState.status = 'LEVEL_COMPLETE';
        showMessage(
            `🎉 Correct! The number was ${gameState.secretNumber}. ` +
            `+${Math.floor(scoreEarned)} points! Level ${gameState.level} complete!`,
            'text-green-600'
        );
        
        // Show level complete modal
        setTimeout(() => {
            startNextLevel();
        }, 2000);
    } else {
        // Game completed
        gameState.status = 'WON';
        showMessage(
            `🏆 Congratulations! You've completed all levels with a final score of ${gameState.score}!`,
            'text-green-600'
        );
        showGameOver(true);
    }
}

// Add confetti to the game over screen for winners
function showGameOver(isWinner) {
    gameState.gameOver = true;
    
    const modal = document.getElementById('gameOverModal');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const shareScoreBtn = document.getElementById('shareScoreBtn');
    
    if (isWinner) {
        title.textContent = '🎉 You Won!';
        message.textContent = `Congratulations! You've completed the game with a score of ${gameState.score}.`;
        showConfetti();
    } else {
        title.textContent = '😢 Game Over';
        message.textContent = `The number was ${gameState.secretNumber}. Your score: ${gameState.score}`;
    }
    
    // Set up event listeners for modal buttons
    playAgainBtn.onclick = () => {
        modal.classList.add('hidden');
        startNewGame();
    };
    
    shareScoreBtn.onclick = showShareModal;
    
    // Show the modal
    modal.classList.remove('hidden');
}
    
    
    gameState.socket.onerror = function(error) {
        console.error('WebSocket error:', error);
        showMessage('Connection error. Please try again later.', 'text-red-600');
    };

// Update game state from server response
function updateGameState(response) {
    gameState.attempts = response.attempts || 0;
    gameState.maxAttempts = response.maxAttempts || 10;
    gameState.score = response.score || 0;
    gameState.round = response.round || 1;
    gameState.status = response.status || 'IN_PROGRESS';
    gameState.gameOver = gameState.status !== 'IN_PROGRESS';
    
    if (response.secretNumber) {
        gameState.secretNumber = response.secretNumber;
    }
    
    if (response.previousGuesses) {
        gameState.previousGuesses = new Set(response.previousGuesses);
    }
}

// Update the UI based on game state
function updateUI(response) {
    // Update game info
    roundEl.textContent = gameState.round;
    scoreEl.textContent = gameState.score;
    attemptsEl.textContent = gameState.maxAttempts - gameState.attempts;
    
    // Update message
    if (response.message) {
        showMessage(response.message);
    }
    
    // Update previous guesses
    updatePreviousGuesses();
    
    // Show/hide hint
    if (response.hint) {
        showHint(response.hint);
    }
    
    // Enable/disable input based on game state
    guessInput.disabled = gameState.gameOver;
    submitGuessBtn.disabled = gameState.gameOver;
    
    // Update game ID display
    gameIdDisplay.textContent = gameState.gameId;
}

// Update the previous guesses display
function updatePreviousGuesses() {
    previousGuessesEl.innerHTML = '';
    
    gameState.previousGuesses.forEach(guess => {
        const bubble = document.createElement('div');
        bubble.className = 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium guess-bubble';
        bubble.textContent = guess;
        
        if (guess < gameState.secretNumber) {
            bubble.className = 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium guess-bubble';
        } else if (guess > gameState.secretNumber) {
            bubble.className = 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium guess-bubble';
        } else {
            bubble.className = 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium guess-bubble';
        }
        
        previousGuessesEl.appendChild(bubble);
    });
}

// Show a hint
function showHint(hint) {
    hintText.textContent = hint;
    hintArea.classList.remove('hidden');
}

// Show game over modal
function showGameOver(response) {
    if (gameState.status === 'WON') {
        gameOverTitle.textContent = 'You Won!';
        gameOverMessage.textContent = `Congratulations! You guessed the number ${gameState.secretNumber} in ${gameState.attempts} attempts.`;
    } else {
        gameOverTitle.textContent = 'Game Over';
        gameOverMessage.textContent = `The number was ${gameState.secretNumber}. Better luck next time!`;
    }
    
    gameOverModal.classList.remove('hidden');
}

// Hide game over modal
function hideGameOverModal() {
    gameOverModal.classList.add('hidden');
}

// Show share modal
function showShareModal() {
    shareLink.value = 'Check out my score in the Number Guessing Game!';
    shareModal.classList.remove('hidden');
    shareLink.select();
}

// Hide share modal
function hideShareModal() {
    shareModal.classList.add('hidden');
}

// Show message to user
function showMessage(message, className = '') {
    messageEl.textContent = message;
    messageEl.className = `text-center text-lg font-medium mb-6 min-h-12 ${className}`;
}

// Handle guess submission
function handleGuess() {
    const guess = parseInt(guessInput.value.trim());
    
    if (isNaN(guess) || guess < 1 || guess > 100) {
        showMessage('Please enter a number between 1 and 100', 'text-red-600');
        return;
    }
    
    if (gameState.previousGuesses.has(guess)) {
        showMessage('You already guessed that number!', 'text-yellow-600');
        return;
    }
    
    if (gameState.socket && gameState.socket.readyState === WebSocket.OPEN) {
        const guessMessage = {
            type: 'GUESS',
            guess: guess
        };
        
        gameState.socket.send(JSON.stringify(guessMessage));
        guessInput.value = '';
    } else {
        showMessage('Not connected to server. Please refresh the page.', 'text-red-600');
    }
}

// Start a new game
function startNewGame() {
    if (gameState.socket && gameState.socket.readyState === WebSocket.OPEN) {
        const newGameMessage = {
            type: 'NEW_GAME',
            playerName: gameState.playerName
        };
        
        gameState.socket.send(JSON.stringify(newGameMessage));
        hideGameOverModal();
        
        // Reset game state
        gameState.attempts = 0;
        gameState.score = 0;
        gameState.round = 1;
        gameState.previousGuesses.clear();
        gameState.gameOver = false;
        gameState.status = 'IN_PROGRESS';
        
        // Clear previous guesses display
        previousGuessesEl.innerHTML = '';
        
        // Clear and focus guess input
        guessInput.value = '';
        guessInput.focus();
    } else {
        // If socket is not open, reinitialize the connection
        initWebSocket();
    }
}

// Initialize the game
function initGame() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize WebSocket connection when starting a new game
    startGameBtn.addEventListener('click', () => {
        gameState.playerName = playerNameInput.value.trim();
        
        if (!gameState.playerName) {
            showMessage('Please enter your name', 'text-red-600');
            return;
        }
        
        // Hide login form and show game area
        loginForm.classList.add('hidden');
        gameArea.classList.remove('hidden');
        
        initWebSocket();
    });
    
    // Focus the name input when the page loads
    playerNameInput.focus();
    
    // Submit on Enter in the name input
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGameBtn.click();
        }
    });
}

// No longer need to check for game ID in URL
function checkForGameId() {
    // This function is kept for compatibility but does nothing now
}

    
    // New game button
    if (newGameBtn) {
        console.log('Found newGameBtn');
        newGameBtn.addEventListener('click', () => {
            if (confirm('Start a new game? Your current score will be reset.')) {
                startNewGame();
            }
        });
    }
    
    // Play again button
    if (playAgainBtn) {
        console.log('Found playAgainBtn');
        playAgainBtn.addEventListener('click', startNewGame);
    }
    
    // Share score button
    if (shareScoreBtn) {
        console.log('Found shareScoreBtn');
        shareScoreBtn.addEventListener('click', showShareModal);
    }
    
    // Copy link button
    if (copyLinkBtn && shareLink) {
        console.log('Found copyLinkBtn and shareLink');
        copyLinkBtn.addEventListener('click', () => {
            shareLink.select();
            document.execCommand('copy');
            showMessage('Link copied to clipboard!', 'text-green-600');
        });
    }
    
    // Close share modal
    if (closeShareModal) {
        console.log('Found closeShareModal');
        closeShareModal.addEventListener('click', hideShareModal);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === gameOverModal) {
            hideGameOverModal();
        }
        if (e.target === shareModal) {
            hideShareModal();
        }
    });
    
    console.log('Finished setting up event listeners');


// Initialize the WebSocket connection when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners for the game
    setupEventListeners();
});
