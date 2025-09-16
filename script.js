// Global variables
let timerInterval;
let currentTime = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let isBreak = false;
let pomodoroCount = 0;
let journalUnlocked = false;

// Motivational quotes array
const motivationalQuotes = [
    "शीलम् परम भूषणम्",
    "वीर भोग्या वसुंधरा",
    "नभः स्पृशं दीप्तम्",
    "Hazaron ki bheed me se ubhar ke aaunga, mujhe me kabiliyat hai mai kar ke dikhaunga",
    "Padhna hai, Phodna hai, Kehar macha dena hai, Aag laga deni hai.",
    "We are not part of the crowd. We are the reason of the crowd.",
    "Discipline is the highest virtue and the key to dominate.",
    "Every minute wasted is NLSIU moving away.",
    "There are many players. Be the game changer.",
    "Lifestyle is important. Live like a commander and you'll become one.",
    "To shine like the Sun, you must burn like the Sun.",
    "Frustrations, Failures, Falls are just preperation to reach the top.",
    "Manzil door hai, lekin jaana jaroor hai.",
    "लक्ष्य यदि सर्वोपरी हो तो आलोचना, विवेचना और प्रशंसा का कोई मूल्य नहीं है।",
    "Work while they waste, Study whole they sleep, prepare while they play and rise while they regret."
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadDailyQuote();
    loadSavedData();
    updateDashboard();
    updateProgressBars();
    createDailyChart();
    loadJournalDate();
    loadIdeas();
    loadTasks();
    
    // Set up timer display
    updateTimerDisplay();
});

// Tab functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Quote functionality
function loadDailyQuote() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const quoteIndex = Math.floor(dayOfYear / 15) % motivationalQuotes.length;
    
    document.getElementById('daily-quote').textContent = motivationalQuotes[quoteIndex];
}

// Shloka functionality
function saveShloka() {
    const shloka = document.getElementById('shloka-input').value;
    const today = new Date().toDateString();
    
    localStorage.setItem(`shloka_${today}`, shloka);
    showNotification('Shloka saved successfully!');
}

function loadSavedData() {
    const today = new Date().toDateString();
    const savedShloka = localStorage.getItem(`shloka_${today}`);
    
    if (savedShloka) {
        document.getElementById('shloka-input').value = savedShloka;
    }
}

// Timer functionality
function updateTimerDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    document.getElementById('timer-time').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        document.getElementById('timer-status').textContent = isBreak ? 'Break Time' : 'Focus Time';
        
        timerInterval = setInterval(() => {
            currentTime--;
            updateTimerDisplay();
            
            if (currentTime <= 0) {
                completeTimer();
            }
        }, 1000);
    }
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('timer-status').textContent = 'Paused';
}

function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    
    if (isBreak) {
        currentTime = parseInt(document.getElementById('break-duration').value) * 60;

    
