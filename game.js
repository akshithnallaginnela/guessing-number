// Game state
let gameState = {
    gameId: '',
    playerName: '',
    socket: null,
    isConnected: false,
    gameOver: false,
    secretNumber: 0,
    attempts: 0,
    maxAttempts: 10,
    score: 0,
    round: 1,
    lowerBound: 1,
    upperBound: 100,
    previousGuesses: new Set(),
    status: 'IN_PROGRESS' // IN_PROGRESS, WON, LOST
};

// DOM Elements
const loginForm = document.getElementById('loginForm');
const gameArea = document.getElementById('gameArea');
const playerNameInput = document.getElementById('playerName');
const gameIdInput = document.getElementById('gameId');
const startGameBtn = document.getElementById('startGameBtn');
const submitGuessBtn = document.getElementById('submitGuess');
const newGameBtn = document.getElementById('newGameBtn');
const shareGameBtn = document.getElementById('shareGameBtn');
const guessInput = document.getElementById('guessInput');
const messageEl = document.getElementById('message');
const attemptsEl = document.getElementById('attempts');
const scoreEl = document.getElementById('score');
const roundEl = document.getElementById('round');
const gameIdDisplay = document.getElementById('gameIdDisplay');
const previousGuessesEl = document.getElementById('previousGuesses');
const hintArea = document.getElementById('hintArea');
const hintText = document.getElementById('hintText');

// Modals
const gameOverModal = document.getElementById('gameOverModal');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const newGameModalBtn = document.getElementById('newGameModalBtn');
const shareScoreBtn = document.getElementById('shareScoreBtn');
const shareModal = document.getElementById('shareModal');
const shareLink = document.getElementById('shareLink');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const closeShareModal = document.getElementById('closeShareModal');

// Initialize the WebSocket connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = protocol + window.location.host + '/guessing-game/game';
    
    gameState.socket = new WebSocket(wsUrl);
    
    gameState.socket.onopen = function() {
        console.log('WebSocket connection established');
        gameState.isConnected = true;
        
        // Join the game
        const joinMessage = {
            type: 'JOIN',
            playerName: gameState.playerName,
            gameId: gameState.gameId || ''
        };
        
        gameState.socket.send(JSON.stringify(joinMessage));
    };
    
    gameState.socket.onmessage = function(event) {
        const response = JSON.parse(event.data);
        console.log('Received message:', response);
        
        switch (response.type) {
            case 'GAME_UPDATE':
                updateGameState(response);
                updateUI(response);
                break;
                
            case 'GAME_OVER':
                gameState.gameOver = true;
                gameState.status = response.status;
                showGameOver(response);
                updateUI(response);
                break;
                
            case 'ERROR':
                showMessage(response.message, 'text-red-600');
                console.error('Error from server:', response.message);
                break;
        }
    };
    
    gameState.socket.onclose = function() {
        console.log('WebSocket connection closed');
        gameState.isConnected = false;
        showMessage('Connection lost. Please refresh the page to reconnect.', 'text-red-600');
    };
    
    gameState.socket.onerror = function(error) {
        console.error('WebSocket error:', error);
        showMessage('Connection error. Please try again later.', 'text-red-600');
    };
}

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
    const gameUrl = `${window.location.origin}${window.location.pathname}?gameId=${gameState.gameId}`;
    shareLink.value = gameUrl;
    shareModal.classList.remove('hidden');
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
            type: 'NEW_GAME'
        };
        
        gameState.socket.send(JSON.stringify(newGameMessage));
        hideGameOverModal();
    }
}

// Initialize the game
function initGame() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize WebSocket connection
    initWebSocket();
}

// Set up event listeners
function setupEventListeners() {
    // Start game button
    startGameBtn.addEventListener('click', () => {
        const name = playerNameInput.value.trim();
        const gameId = gameIdInput.value.trim();
        
        if (!name) {
            alert('Please enter your name');
            return;
        }
        
        gameState.playerName = name;
        gameState.gameId = gameId;
        
        // Show game area and hide login form
        loginForm.classList.add('hidden');
        gameArea.classList.remove('hidden');
        
        // Initialize the game
        initGame();
    });
    
    // Submit guess on button click
    submitGuessBtn.addEventListener('click', handleGuess);
    
    // Submit guess on Enter key
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGuess();
        }
    });
    
    // New game button
    newGameBtn.addEventListener('click', startNewGame);
    
    // Share game button
    shareGameBtn.addEventListener('click', showShareModal);
    
    // Game over modal buttons
    playAgainBtn.addEventListener('click', startNewGame);
    newGameModalBtn.addEventListener('click', () => {
        window.location.reload();
    });
    shareScoreBtn.addEventListener('click', showShareModal);
    
    // Share modal buttons
    copyLinkBtn.addEventListener('click', () => {
        shareLink.select();
        document.execCommand('copy');
        copyLinkBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyLinkBtn.textContent = 'Copy';
        }, 2000);
    });
    
    closeShareModal.addEventListener('click', hideShareModal);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === gameOverModal) {
            hideGameOverModal();
        }
        if (e.target === shareModal) {
            hideShareModal();
        }
    });
}

// Check for game ID in URL parameters
function checkForGameId() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId');
    
    if (gameId) {
        gameIdInput.value = gameId;
    }
}

// Show a hint
function showHint(hint) {
    if (gameState.gameOver) return;
    
    // In our WebSocket implementation, hints are sent from the server
    // This function is kept for compatibility but the logic is now server-side
    console.log('Hint requested:', hint);
}

// Show message with optional class
function showMessage(msg, className = '') {
    messageEl.textContent = msg;
    messageEl.className = `text-center text-lg font-medium mb-6 min-h-8 ${className}`;
}

// Initialize DOM elements
function initDOM() {
    // DOM elements are already initialized at the top of the file
    // This function is kept for compatibility
    console.log('DOM initialized');
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
