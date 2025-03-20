import { initDOMElements, initGame, toggleDifficulty, addResizeListeners, setupKeyboardControls } from './game.js';
import { initSounds, toggleSound } from './audio.js';
import { initLeaderboard } from './leaderboard.js';

// Main initialization function to run when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize game elements
  initDOMElements();
  
  // Set up event listeners for buttons
  document.getElementById('new-game').addEventListener('click', initGame);
  document.getElementById('difficulty').addEventListener('click', toggleDifficulty);
  document.getElementById('sound-toggle').addEventListener('click', toggleSound);
  document.getElementById('sound-init').addEventListener('click', initSounds);
  
  // Initialize leaderboard
  initLeaderboard();
  
  // Add resize event listeners
  addResizeListeners();
  
  // Setup keyboard controls
  setupKeyboardControls();
  
  // Initialize the game
  initGame();
}); 