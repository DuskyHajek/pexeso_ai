import { config, emojiSets } from './config.js';
import { playSound } from './audio.js';
import { handleGameEnd } from './leaderboard.js';

// Game state variables
let flippedCards = [];
let isChecking = false;
let matchesFound = 0;
let currentEmojiSet = emojiSets.animals;
let pairsToMatch = 8;

// DOM elements
let gameBoard;
let scoreDisplay;
let timerDisplay;
let winMessage;
let difficultyBtn;

// Initialize DOM elements
function initDOMElements() {
  gameBoard = document.getElementById('game-board');
  scoreDisplay = document.getElementById('score-display');
  timerDisplay = document.getElementById('timer');
  winMessage = document.getElementById('win-message');
  difficultyBtn = document.getElementById('difficulty');
}

// Initialize the game
function initGame() {
  // Clear previous game state
  gameBoard.innerHTML = '';
  flippedCards = [];
  isChecking = false;
  matchesFound = 0;
  winMessage.style.display = 'none';
  
  // Reset and start timer
  clearInterval(config.timerInterval);
  config.timeElapsed = 0;
  updateTimerDisplay();
  config.timerInterval = setInterval(() => {
    config.timeElapsed++;
    updateTimerDisplay();
  }, 1000);
  
  // Update score display
  updateScoreDisplay();
  
  // Randomly select emoji set
  const emojiSetKeys = Object.keys(emojiSets);
  const randomSetKey = emojiSetKeys[Math.floor(Math.random() * emojiSetKeys.length)];
  currentEmojiSet = emojiSets[randomSetKey];
  
  // Set number of pairs based on difficulty
  if (config.difficulty === 'easy') {
    pairsToMatch = 6;
  } else if (config.difficulty === 'medium') {
    pairsToMatch = 8;
  } else {
    pairsToMatch = 10;
  }
  
  // Get emojis for this game
  const gameEmojis = currentEmojiSet.slice(0, pairsToMatch);
  const allEmojis = [...gameEmojis, ...gameEmojis];
  const shuffledEmojis = shuffle(allEmojis);

  // Set up grid layout based on device orientation and difficulty
  setGridLayout();

  // Create and add cards to the game board
  shuffledEmojis.forEach(emoji => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('data-emoji', emoji);
    card.addEventListener('click', handleCardClick);
    gameBoard.appendChild(card);
  });
}

// Set grid layout
function setGridLayout() {
  const totalCards = pairsToMatch * 2;
  const isLandscape = window.innerWidth > window.innerHeight;
  
  // Determine optimal grid layout based on screen dimensions and difficulty
  let numColumns;
  
  if (pairsToMatch === 6) {
    // Easy mode: 3x4 grid in portrait, 4x3 in landscape
    numColumns = isLandscape ? 4 : 3;
  } else if (pairsToMatch === 8) {
    // Medium mode: 4x4 grid in either orientation
    numColumns = 4;
  } else {
    // Hard mode: 4x5 in portrait, 5x4 in landscape
    numColumns = isLandscape ? 5 : 4;
  }
  
  // Adjust layout based on aspect ratio of viewport
  gameBoard.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
  
  // Calculate appropriate card size to fit within the viewport
  const viewportWidth = Math.min(window.innerWidth * 0.9, 500);
  const viewportHeight = window.innerHeight * 0.6; // Use only 60% of viewport height to avoid scrolling
  
  // Determine maximum card size based on grid dimensions and viewport
  const maxCardWidth = (viewportWidth - ((numColumns - 1) * 10)) / numColumns; // Account for grid gap
  const numRows = Math.ceil(totalCards / numColumns);
  const maxCardHeight = (viewportHeight - ((numRows - 1) * 10)) / numRows;
  
  // Set maximum card size based on the smaller dimension to maintain aspect ratio
  const maxCardSize = Math.min(maxCardWidth, maxCardHeight);
  
  // Apply sizing to cards (use CSS variables to control card size)
  document.documentElement.style.setProperty('--card-size', `${maxCardSize}px`);
}

// Shuffle function to randomize card positions
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Handle card clicks
function handleCardClick(event) {
  const card = event.target;
    
  // Ignore clicks if checking or card is already flipped
  if (isChecking || card.classList.contains('flipped') || 
      card.classList.contains('matched')) {
    return;
  }
    
  // Play flip sound
  playSound('flip');
    
  // Flip the card
  card.classList.add('flipped');
  flippedCards.push(card);

  // Check for a match when two cards are flipped
  if (flippedCards.length === 2) {
    checkForMatch();
  }
}

// Check if the two flipped cards match
function checkForMatch() {
  const [card1, card2] = flippedCards;
    
  if (card1.getAttribute('data-emoji') === card2.getAttribute('data-emoji')) {
    // Match found
    setTimeout(() => {
      card1.classList.add('matched');
      card2.classList.add('matched');
      card1.classList.add('celebrate');
      card2.classList.add('celebrate');
      
      // Remove the animation class after it completes
      setTimeout(() => {
        card1.classList.remove('celebrate');
        card2.classList.remove('celebrate');
      }, 500);
      
      playSound('match');
    }, 300);
      
    matchesFound++;
    updateScoreDisplay();
    flippedCards = [];
      
    // Check if all pairs are found
    if (matchesFound === pairsToMatch) {
      setTimeout(() => {
        handleGameEnd();
      }, 500);
    }
  } else {
    // No match, flip back after a delay
    isChecking = true;
    setTimeout(() => {
      playSound('wrong');
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
      isChecking = false;
    }, 1000);
  }
}

// Toggle difficulty level
function toggleDifficulty() {
  if (config.difficulty === 'easy') {
    config.difficulty = 'medium';
    difficultyBtn.textContent = 'Medium Mode';
  } else if (config.difficulty === 'medium') {
    config.difficulty = 'hard';
    difficultyBtn.textContent = 'Hard Mode';
  } else {
    config.difficulty = 'easy';
    difficultyBtn.textContent = 'Easy Mode';
  }
  
  initGame();
}

// Update score display
function updateScoreDisplay() {
  scoreDisplay.textContent = `Matches: ${matchesFound} / ${pairsToMatch}`;
}

// Update timer display
function updateTimerDisplay() {
  timerDisplay.textContent = `Time: ${config.timeElapsed}s`;
}

// Add event listeners for window resize
function addResizeListeners() {
  // Handle both orientation change and resize events
  window.addEventListener('orientationchange', handleScreenChange);
  window.addEventListener('resize', handleScreenChange);
  
  // Initial layout setup
  setGridLayout();
}

// Handle screen size or orientation changes
function handleScreenChange() {
  // Use debouncing to avoid too many layout calculations in a short period
  clearTimeout(window.resizeTimer);
  window.resizeTimer = setTimeout(() => {
    setGridLayout();
  }, 250);
}

// Setup keyboard controls
function setupKeyboardControls() {
  document.addEventListener('keydown', function(event) {
    if (event.key === 'r' || event.key === 'R') {
      // R key for restart
      initGame();
    } else if (event.key === 'd' || event.key === 'D') {
      // D key for difficulty
      toggleDifficulty();
    } else if (event.key === 's' || event.key === 'S') {
      // S key for sound toggle
      import('./audio.js').then(audio => {
        audio.toggleSound();
      });
    }
  });
}

export { 
  initDOMElements, 
  initGame, 
  toggleDifficulty, 
  addResizeListeners, 
  setupKeyboardControls,
  handleScreenChange 
}; 