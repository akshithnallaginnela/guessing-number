document.addEventListener('DOMContentLoaded', () => {
    const guessInput = document.getElementById('guessInput');
    const guessButton = document.getElementById('guessButton');
    const hintButton = document.getElementById('hintButton');
    const newGameButton = document.getElementById('newGameButton');
    const messageElement = document.getElementById('message');
    const attemptsElement = document.getElementById('attempts').querySelector('span');
    const scoreElement = document.getElementById('score').querySelector('span');

    // Focus the input field when the page loads
    guessInput.focus();

    // Make a guess
    guessButton.addEventListener('click', makeGuess);
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            makeGuess();
        }
    });

    // Get a hint
    hintButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/game/hint');
            const hint = await response.text();
            messageElement.textContent = hint;
            messageElement.className = 'text-center font-medium text-yellow-700';
        } catch (error) {
            console.error('Error getting hint:', error);
            messageElement.textContent = 'Failed to get hint. Please try again.';
            messageElement.className = 'text-center font-medium text-red-600';
        }
    });

    // Start a new game
    newGameButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/game/new', { method: 'POST' });
            const data = await response.json();
            updateUI(data);
            guessInput.value = '';
            guessInput.focus();
        } catch (error) {
            console.error('Error starting new game:', error);
            messageElement.textContent = 'Failed to start a new game. Please try again.';
            messageElement.className = 'text-center font-medium text-red-600';
        }
    });

    // Make a guess
    async function makeGuess() {
        const guess = parseInt(guessInput.value);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            messageElement.textContent = 'Please enter a valid number between 1 and 100';
            messageElement.className = 'text-center font-medium text-red-600';
            return;
        }

        try {
            const response = await fetch(`/api/game/guess?number=${guess}`, { method: 'POST' });
            const data = await response.json();
            updateUI(data);
            
            if (data.gameOver) {
                guessInput.disabled = true;
                guessButton.disabled = true;
            } else {
                guessInput.value = '';
                guessInput.focus();
            }
        } catch (error) {
            console.error('Error making guess:', error);
            messageElement.textContent = 'Failed to process your guess. Please try again.';
            messageElement.className = 'text-center font-medium text-red-600';
        }
    }

    // Update the UI with game state
    function updateUI(data) {
        messageElement.textContent = data.message;
        attemptsElement.textContent = data.attempts;
        scoreElement.textContent = data.score;

        if (data.gameOver) {
            messageElement.className = 'text-center font-bold text-green-600 text-xl animate-bounce-slow';
        } else if (data.message.includes('high') || data.message.includes('low')) {
            messageElement.className = 'text-center font-medium text-red-600';
        } else {
            messageElement.className = 'text-center font-medium text-indigo-800';
        }
    }

    // Initialize the game
    fetch('/api/game/status')
        .then(response => response.json())
        .then(data => updateUI(data))
        .catch(error => {
            console.error('Error initializing game:', error);
            messageElement.textContent = 'Failed to initialize the game. Please refresh the page.';
            messageElement.className = 'text-center font-medium text-red-600';
        });
});
