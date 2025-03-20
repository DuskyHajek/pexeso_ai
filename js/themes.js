// Themes configuration
const themes = {
  classic: {
    name: 'Classic',
    background: 'linear-gradient(to bottom, #e6f7ff, #b3e0ff)',
    cardBackground: '#ffd166',
    cardBorder: '#ff9a3c',
    matchedCardBackground: '#a0e7a0',
    matchedCardBorder: '#4caf50',
    textColor: '#5f27cd',
    headerColor: '#ff6b6b'
  },
  darkMode: {
    name: 'Dark Mode',
    background: 'linear-gradient(to bottom, #2d3436, #636e72)',
    cardBackground: '#2c3e50',
    cardBorder: '#34495e',
    matchedCardBackground: '#27ae60',
    matchedCardBorder: '#2ecc71',
    textColor: '#ecf0f1',
    headerColor: '#e74c3c'
  },
  pastel: {
    name: 'Pastel',
    background: 'linear-gradient(to bottom, #ffeaa7, #fab1a0)',
    cardBackground: '#fdcb6e',
    cardBorder: '#e17055',
    matchedCardBackground: '#55efc4',
    matchedCardBorder: '#00b894',
    textColor: '#6c5ce7',
    headerColor: '#d63031'
  },
  ocean: {
    name: 'Ocean',
    background: 'linear-gradient(to bottom, #3498db, #2980b9)',
    cardBackground: '#34495e',
    cardBorder: '#2c3e50',
    matchedCardBackground: '#27ae60',
    matchedCardBorder: '#2ecc71',
    textColor: '#ecf0f1',
    headerColor: '#e67e22'
  }
};

// Current theme tracking
let currentThemeKey = 'classic';

// Function to apply theme
function applyTheme(themeName) {
  const theme = themes[themeName];
  
  // Apply theme to CSS variables
  document.documentElement.style.setProperty('--background', theme.background);
  document.body.style.backgroundImage = theme.background;
  
  // Update card-related styles
  document.documentElement.style.setProperty('--card-background', theme.cardBackground);
  document.documentElement.style.setProperty('--card-border', theme.cardBorder);
  document.documentElement.style.setProperty('--matched-card-background', theme.matchedCardBackground);
  document.documentElement.style.setProperty('--matched-card-border', theme.matchedCardBorder);
  
  // Update text and header colors
  document.documentElement.style.setProperty('--text-color', theme.textColor);
  document.documentElement.style.setProperty('--header-color', theme.headerColor);
  
  // Update theme button text
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.textContent = `Theme: ${theme.name}`;
  }
}

// Function to cycle through themes
function cycleTheme() {
  const themeKeys = Object.keys(themes);
  const currentIndex = themeKeys.indexOf(currentThemeKey);
  const nextIndex = (currentIndex + 1) % themeKeys.length;
  currentThemeKey = themeKeys[nextIndex];
  
  applyTheme(currentThemeKey);
}

// Initialize theme
function initThemes() {
  // Add theme toggle event listener
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', cycleTheme);
  }
  
  // Apply initial theme
  applyTheme(currentThemeKey);
}

export { initThemes, applyTheme }; 