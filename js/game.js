import { config, emojiSets, getEmojiSetKeys } from './config.js';
import { playSound } from './audio.js';
import { handleGameEnd } from './leaderboard.js';

// Game state variables
let flippedCards = [];
let isChecking = false;
let matchesFound = 0;
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
  
  // Determine emoji set
  let currentSet;
  if (config.currentEmojiSet === 'random' || !config.currentEmojiSet) {
    // Random set if not specified or random is selected
    const emojiSetKeys = Object.keys(emojiSets);
    const randomSetKey = emojiSetKeys[Math.floor(Math.random() * emojiSetKeys.length)];
    currentSet = emojiSets[randomSetKey];
    config.currentEmojiSet = randomSetKey;
  } else if (emojiSets[config.currentEmojiSet]) {
    // Use specified emoji set
    currentSet = emojiSets[config.currentEmojiSet];
  } else {
    // Fallback to random if something goes wrong
    const emojiSetKeys = Object.keys(emojiSets);
    const randomSetKey = emojiSetKeys[Math.floor(Math.random() * emojiSetKeys.length)];
    currentSet = emojiSets[randomSetKey];
    config.currentEmojiSet = randomSetKey;
  }
  
  // Set number of pairs based on difficulty and device
  const isMobile = window.innerWidth < 768;
  const isLandscape = window.innerWidth > window.innerHeight;
  
  if (config.difficulty === 'easy') {
    pairsToMatch = 6;
  } else if (config.difficulty === 'medium') {
    pairsToMatch = 8;
  } else {
    // Always use 10 pairs for hard mode, regardless of device
    pairsToMatch = 10;
  }
  
  // Get emojis for this game
  const gameItems = currentSet.slice(0, pairsToMatch);
  const allItems = [...gameItems, ...gameItems];
  const shuffledItems = shuffle(allItems);

  // Set up grid layout based on device orientation and difficulty
  setGridLayout();

  // Create and add cards to the game board
  shuffledItems.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('data-emoji', item);
    
    card.addEventListener('click', handleCardClick);
    gameBoard.appendChild(card);
  });
}

// Set grid layout
function setGridLayout() {
  const totalCards = pairsToMatch * 2;
  const isLandscape = window.innerWidth > window.innerHeight;
  const isMobile = window.innerWidth < 768;
  
  // Determine optimal grid layout based on screen dimensions and difficulty
  let numColumns;
  
  if (isMobile) {
    // Mobile-specific layouts
    if (pairsToMatch === 6) {
      // Easy mode: 3x4 grid in portrait, 4x3 in landscape for mobile
      numColumns = isLandscape ? 4 : 3;
    } else if (pairsToMatch === 8) {
      // Medium mode: Always 4x4 grid for better symmetry
      numColumns = 4;
    } else {
      // Hard mode: 5x4 in landscape, 4x5 in portrait for mobile
      numColumns = isLandscape ? 5 : 4;
    }
  } else {
    // Desktop/tablet layouts
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
  }
  
  // Set grid template columns
  gameBoard.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
  
  // Calculate appropriate card size to fit within the viewport
  const containerWidth = Math.min(window.innerWidth * 0.95, 500);
  const numRows = Math.ceil(totalCards / numColumns);
  
  // Determine available height for game board
  // Account for other UI elements to prevent scrolling
  const headerHeight = document.querySelector('h1').offsetHeight;
  const controlsHeight = document.getElementById('controls').offsetHeight;
  const scoreTimerHeight = document.getElementById('score-display').offsetHeight + 
                           document.getElementById('timer').offsetHeight;
  const footerHeight = document.querySelector('footer').offsetHeight;
  
  // Calculate available viewport height for the game board
  const availableHeight = window.innerHeight - headerHeight - controlsHeight - 
                          scoreTimerHeight - footerHeight - 40; // Add padding
  
  // Calculate grid gap based on available space
  let gridGap;
  if (isMobile) {
    gridGap = isLandscape ? 6 : 5;
  } else {
    gridGap = Math.min(10, Math.max(5, Math.floor(availableHeight * 0.025)));
  }
  gameBoard.style.gap = `${gridGap}px`;
  
  // Calculate maximum possible card size based on available space
  const totalHorizontalGap = gridGap * (numColumns - 1);
  const totalVerticalGap = gridGap * (numRows - 1);
  const maxCardWidth = (containerWidth - totalHorizontalGap) / numColumns;
  const maxCardHeight = (availableHeight - totalVerticalGap) / numRows;
  
  // Set card size to maintain aspect ratio (1:1)
  const maxCardSize = Math.min(maxCardWidth, maxCardHeight);
  
  // Ensure minimum and maximum card sizes for usability
  let cardSize;
  if (isMobile) {
    // For mobile, allow smaller cards but ensure they're not too small
    const minCardSize = isLandscape ? 50 : 45;
    cardSize = Math.max(minCardSize, Math.floor(maxCardSize));
  } else {
    // For desktop/tablet, keep cards larger for better interaction
    cardSize = Math.max(60, Math.floor(maxCardSize));
  }
  
  // Apply sizing to cards
  document.documentElement.style.setProperty('--card-size', `${cardSize}px`);
  
  // Set font size for emojis based on card size
  const emojiSize = Math.max(Math.floor(cardSize * 0.6), 24);
  document.documentElement.style.setProperty('--emoji-size', `${emojiSize}px`);
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

// Toggle difficulty
function toggleDifficulty() {
  const difficulties = ['easy', 'medium', 'hard'];
  const currentIndex = difficulties.indexOf(config.difficulty);
  const nextIndex = (currentIndex + 1) % difficulties.length;
  
  config.difficulty = difficulties[nextIndex];
  difficultyBtn.textContent = `${config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)} Mode`;
  
  // Restart game with new difficulty
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

// Add resize event listeners
function addResizeListeners() {
  window.addEventListener('resize', () => {
    // Debounce resize to prevent excessive calculations
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
      setGridLayout();
    }, 250);
  });
}

// Setup keyboard controls
function setupKeyboardControls() {
  document.addEventListener('keydown', (event) => {
    switch(event.key.toLowerCase()) {
      case 'r':
        initGame();
        break;
      case 'd':
        toggleDifficulty();
        break;
      case 's':
        document.getElementById('sound-toggle').click();
        break;
    }
  });
}

export { 
  initDOMElements, 
  initGame, 
  toggleDifficulty, 
  addResizeListeners, 
  setupKeyboardControls
}; 