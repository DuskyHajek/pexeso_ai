// Game configuration
const config = {
  difficulty: 'easy', // 'easy', 'medium', 'hard'
  soundEnabled: true,
  soundsInitialized: false,
  timeElapsed: 0,
  timerInterval: null,
  currentGameScore: null,
  currentEmojiSet: null,
  lastRandomEmojiSet: null  // New property to track last random emoji set
};

// Different emoji sets for variety
const emojiSets = {
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🦄'],
  food: ['🍎', '🍌', '🍓', '🍕', '🍦', '🍩', '🍪', '🍫', '🍭', '🍔', '🥨', '🧁'],
  faces: ['😀', '😎', '🥳', '😍', '🤩', '😊', '🤔', '🤗', '😴', '🥺', '😂', '😋'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '⛳'],
  travel: ['🚗', '✈️', '🚢', '🚂', '🚁', '🚀', '🛵', '🚲', '🛴', '🛺', '🚕', '🚜'],
  nature: ['🌵', '🌲', '🌴', '🌿', '🍀', '🍄', '🌺', '🌻', '🌼', '🌷', '🌹', '🌸'],
  space: ['🌎', '🌑', '🪐', '🌟', '✨', '☄️', '🚀', '🛸', '🔭', '🌌', '👨‍🚀', '👽'],
  music: ['🎸', '🎹', '🥁', '🎺', '🎻', '🎤', '🎼', '🎵', '🎶', '🎷', '🎙️', '🎚️'],
  tech: ['💻', '📱', '🖥️', '🖨️', '🎮', '📷', '🕹️', '💾', '📡', '🤖', '💡', '🔬']
};

// Function to get emoji set keys
function getEmojiSetKeys() {
  return ['random', ...Object.keys(emojiSets)];
}

// Supabase configuration
const SUPABASE_URL = 'https://qycndlxjcstluyktdviq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5Y25kbHhqY3N0bHV5a3RkdmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjM1MTgsImV4cCI6MjA1NjMzOTUxOH0.1AlGbEu7_RsKo74YOTVco1VHNFACrQ4JMk6mSDrLl18';

export { config, emojiSets, getEmojiSetKeys, SUPABASE_URL, SUPABASE_ANON_KEY }; 