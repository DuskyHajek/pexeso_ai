import { initDOMElements, initGame, toggleDifficulty, addResizeListeners, setupKeyboardControls } from './game.js';
import { initSounds, toggleSound } from './audio.js';
import { initLeaderboard } from './leaderboard.js';
import { initThemes } from './themes.js';
import { emojiSets, getEmojiSetKeys, config } from './config.js';

// Main initialization function to run when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize game elements
  initDOMElements();
  
  // Set up event listeners for buttons
  document.getElementById('new-game').addEventListener('click', initGame);
  document.getElementById('difficulty').addEventListener('click', toggleDifficulty);
  document.getElementById('sound-toggle').addEventListener('click', toggleSound);
  document.getElementById('sound-init').addEventListener('click', initSounds);
  
  // Create emoji set selector
  createEmojiSetSelector();
  
  // Initialize leaderboard
  initLeaderboard();
  
  // Initialize themes
  initThemes();
  
  // Add resize event listeners
  addResizeListeners();
  
  // Setup keyboard controls
  setupKeyboardControls();
  
  // Initialize the game
  initGame();
  
  // Initialize share button
  initShareButton();
});

// Create emoji set selector
function createEmojiSetSelector() {
  // Create container for emoji set selector
  const emojiSetContainer = document.createElement('div');
  emojiSetContainer.id = 'emoji-set-selector';

  // Create select element
  const emojiSetSelect = document.createElement('select');
  emojiSetSelect.id = 'emoji-set-select';

  // Get emoji set keys (including 'random')
  const emojiSetKeys = getEmojiSetKeys();

  // Create options for the select element
  emojiSetKeys.forEach(setKey => {
    const option = document.createElement('option');
    option.value = setKey;
    
    // For 'random', use a special text
    if (setKey === 'random') {
      option.textContent = '🎲 Random';
    } else {
      // Get first emoji from the set to preview
      const previewEmoji = emojiSets[setKey][0];
      option.textContent = `${previewEmoji} ${setKey.charAt(0).toUpperCase() + setKey.slice(1)}`;
    }
    
    emojiSetSelect.appendChild(option);
  });

  // Set initial value to 'random'
  emojiSetSelect.value = 'random';

  // Add event listener for selection change
  emojiSetSelect.addEventListener('change', () => {
    selectEmojiSet(emojiSetSelect.value);
  });

  // Append select to container
  emojiSetContainer.appendChild(emojiSetSelect);

  // Insert the emoji set selector into the controls
  const controlsContainer = document.getElementById('controls');
  controlsContainer.appendChild(emojiSetContainer);
}

// Function to select emoji set
function selectEmojiSet(setKey) {
  // Update config
  config.currentEmojiSet = setKey;
  
  // Restart game with new emoji set
  initGame();
}

// Share Game Functionality
function initShareButton() {
  const shareButton = document.getElementById('share-button');
  const gameUrl = window.location.href;

  // Create a better copied message element
  const copiedMessage = document.createElement('div');
  copiedMessage.id = 'copied-message';
  copiedMessage.textContent = 'Link copied!';
  document.body.appendChild(copiedMessage);

  // Show copied/shared success message
  function showSuccessMessage(message = 'Link copied!') {
    copiedMessage.textContent = message;
    copiedMessage.style.opacity = '1';
    setTimeout(() => {
      copiedMessage.style.opacity = '0';
    }, 2000);
  }

  // Add a small animation/feedback when the button is clicked
  function buttonFeedback() {
    shareButton.classList.add('active');
    setTimeout(() => shareButton.classList.remove('active'), 200);
  }

  shareButton.addEventListener('click', async () => {
    try {
      buttonFeedback();
      
      // Try to use the Web Share API first (better for mobile)
      if (navigator.share) {
        await navigator.share({
          title: 'Play Pexeso - Memory Matching Game',
          text: 'Check out this fun memory game!',
          url: gameUrl
        });
        showSuccessMessage('Shared successfully!');
        return;
      }
      
      // Fallback to clipboard
      await navigator.clipboard.writeText(gameUrl);
      showSuccessMessage('Link copied!');
    } catch (err) {
      console.error('Error sharing:', err);
      
      // Try clipboard API as a last resort
      try {
        await navigator.clipboard.writeText(gameUrl);
        showSuccessMessage('Link copied!');
      } catch (clipboardErr) {
        console.error('Clipboard error:', clipboardErr);
        
        // Ultimate fallback - create a temporary input element
        const tempInput = document.createElement('input');
        tempInput.value = gameUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        
        let copySuccess = false;
        try {
          copySuccess = document.execCommand('copy');
        } catch (e) {
          console.error('execCommand error:', e);
        }
        
        document.body.removeChild(tempInput);
        
        if (copySuccess) {
          showSuccessMessage('Link copied!');
        } else {
          alert('Unable to share. Please copy this link manually:\n' + gameUrl);
        }
      }
    }
  });
} 