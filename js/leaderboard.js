import { config, SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { playSound } from './audio.js';

// Initialize Supabase client
let supabaseClient;

// DOM Elements for Leaderboard
let leaderboardModal;
let leaderboardBody;
let submitScoreForm;
let playerNameInput;
let submitScoreBtn;

// Initialize leaderboard elements
function initLeaderboard() {
  // Initialize Supabase client
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // DOM Elements for Leaderboard
  leaderboardModal = document.getElementById('leaderboard-modal');
  leaderboardBody = document.getElementById('leaderboard-body');
  submitScoreForm = document.getElementById('submit-score-form');
  playerNameInput = document.getElementById('player-name');
  submitScoreBtn = document.getElementById('submit-score');
  
  // Add event listeners
  document.getElementById('show-leaderboard').addEventListener('click', () => {
    fetchLeaderboard(config.difficulty);
  });
  
  // Close Leaderboard when clicking outside
  leaderboardModal.addEventListener('click', (e) => {
    if (e.target === leaderboardModal) {
      leaderboardModal.style.display = 'none';
    }
  });
  
  // Submit Score event listener
  submitScoreBtn.addEventListener('click', submitScore);
}

// Fetch Leaderboard from Supabase
async function fetchLeaderboard(difficulty) {
  try {
    const { data, error } = await supabaseClient
      .from('pexeso_leaderboard')
      .select('*')
      .eq('difficulty', difficulty)
      .order('time', { ascending: true })
      .limit(7);

    if (error) throw error;

    // Clear previous leaderboard
    leaderboardBody.innerHTML = '';

    // Populate leaderboard
    data.forEach((entry, index) => {
      const row = leaderboardBody.insertRow();
      row.insertCell(0).textContent = index + 1;
      row.insertCell(1).textContent = entry.name;
      row.insertCell(2).textContent = `${entry.time}s`;
      row.insertCell(3).textContent = entry.difficulty;
    });

    // Update leaderboard title
    document.getElementById('leaderboard-title').textContent = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode Leaderboard`;

    // Hide score submission form by default when showing leaderboard
    submitScoreForm.style.display = 'none';

    // Show modal
    leaderboardModal.style.display = 'flex';
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    alert('Failed to fetch leaderboard');
  }
}

// Submit Score to Supabase
async function submitScore() {
  const playerName = playerNameInput.value.trim();
  
  if (!playerName) {
    alert('Please enter a name');
    playerNameInput.focus();
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('pexeso_leaderboard')
      .insert([{
        name: playerName,
        time: config.currentGameScore.time,
        difficulty: config.currentGameScore.difficulty
      }]);

    if (error) throw error;

    // Hide score submission form
    submitScoreForm.style.display = 'none';
    
    // Automatically show leaderboard for the current game's difficulty
    await fetchLeaderboard(config.currentGameScore.difficulty);
  } catch (error) {
    console.error('Error submitting score:', error);
    alert('Failed to submit score');
  }
}

// Handle game end and show score submission
function handleGameEnd() {
  // Store current game score
  config.currentGameScore = {
    time: config.timeElapsed,
    difficulty: config.difficulty
  };

  // Show win message
  document.getElementById('win-message').style.display = 'block';
  playSound('win');
  
  // Stop the timer
  clearInterval(config.timerInterval);

  // Clear previous leaderboard entries
  leaderboardBody.innerHTML = '';

  // Update leaderboard title
  document.getElementById('leaderboard-title').textContent = 'Submit Your Score';

  // Show leaderboard modal
  leaderboardModal.style.display = 'flex';

  // Show score submission form
  submitScoreForm.style.display = 'flex';
  playerNameInput.value = ''; // Clear any previous input
  playerNameInput.focus(); // Automatically focus on name input
}

export { initLeaderboard, fetchLeaderboard, handleGameEnd }; 