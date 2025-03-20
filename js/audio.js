import { config } from './config.js';

// Sound effects using Web Audio API
const sounds = {};

// Initialize sounds using Web Audio API
function initSounds() {
  try {
    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    
    // Create different sounds
    sounds.flip = createBeepSound(audioCtx, 220, 0.1); // A3 note, short
    sounds.match = createBeepSound(audioCtx, 440, 0.2); // A4 note, medium
    sounds.wrong = createBeepSound(audioCtx, 165, 0.2); // E3 note, medium
    sounds.win = createFanfareSound(audioCtx); // Victory fanfare
    
    // Test sound
    playSound('flip');
    
    // Update UI
    config.soundsInitialized = true;
    document.getElementById('sound-init').style.display = 'none';
    console.log('Sounds initialized successfully');
  } catch (error) {
    console.error('Error initializing sounds:', error);
    document.getElementById('sound-init').textContent = 'Sound not supported in your browser';
  }
}

// Create a simple beep sound
function createBeepSound(audioCtx, frequency, duration) {
  return function() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Add fade in/out to avoid clicks
    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    oscillator.start();
    oscillator.stop(now + duration + 0.01);
  };
}

// Create a victory fanfare sound
function createFanfareSound(audioCtx) {
  return function() {
    const notes = [
      { freq: 440, duration: 0.1 }, // A4
      { freq: 554, duration: 0.1 }, // C#5
      { freq: 659, duration: 0.1 }, // E5
      { freq: 880, duration: 0.3 }  // A5
    ];
    
    notes.forEach((note, index) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.value = note.freq;
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      const startTime = now + index * 0.15;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, startTime + note.duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + note.duration + 0.01);
    });
  };
}

// Play sound if enabled
function playSound(soundName) {
  if (config.soundEnabled && config.soundsInitialized && sounds[soundName]) {
    try {
      sounds[soundName]();
    } catch (e) {
      console.log('Error playing sound:', e);
    }
  }
}

// Toggle sound on/off
function toggleSound() {
  config.soundEnabled = !config.soundEnabled;
  document.getElementById('sound-toggle').textContent = `Sound: ${config.soundEnabled ? 'On' : 'Off'}`;
  
  // Initialize sounds if they haven't been yet
  if (config.soundEnabled && !config.soundsInitialized) {
    initSounds();
  }
}

export { initSounds, playSound, toggleSound }; 