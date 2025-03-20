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
  
  // Set number of pairs based on difficulty and device
  const isMobile = window.innerWidth < 768;
  const isLandscape = window.innerWidth > window.innerHeight;
  
  if (config.difficulty === 'easy') {
    pairsToMatch = 6;
  } else if (config.difficulty === 'medium') {
    pairsToMatch = 8;
  } else {
    // For hard mode on small portrait mobile, limit to 8 pairs
    if (isMobile && !isLandscape && window.innerWidth < 400) {
      pairsToMatch = 8;
    } else {
      pairsToMatch = 10;
    }
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
  
  // Handle visibility changes (when user switches tabs/apps and returns)
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
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

// Handle visibility change (when user returns to the tab/app)
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    // Recalculate layout when returning to the game
    setGridLayout();
  }
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

// Export functions
export { initDOMElements, initGame, toggleDifficulty, addResizeListeners, setupKeyboardControls, setGridLayout, handleVisibilityChange }; 