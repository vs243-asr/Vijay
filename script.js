// Global variables
let timerInterval;
let currentTime = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let isBreak = false;
let pomodoroCount = 0;
let journalUnlocked = false;
let dailyStudyTime = 0;
let dailyTasksCompleted = 0;

// Motivational quotes array
const motivationalQuotes = [
    "शीलम् परम भूषणम्",
    "वीर भोग्या वसुंधरा",
    "नभः स्पृशं दीप्तम्",
    "Hazaron ki bheed me se ubhar ke aaunga, mujhe me kabiliyat hai mai kar ke dikhaunga",
    "Padhan hai, Phodna hai, Kehar macha dena hai, Aag laga deni hai.",
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
    
    // Add event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Timer settings change listeners
    document.getElementById('study-duration').addEventListener('change', function() {
        if (!isRunning && !isBreak) {
            currentTime = parseInt(this.value) * 60;
            updateTimerDisplay();
        }
    });
    
    document.getElementById('break-duration').addEventListener('change', function() {
        if (!isRunning && isBreak) {
            currentTime = parseInt(this.value) * 60;
            updateTimerDisplay();
        }
    });
    
    // Journal password enter key
    document.getElementById('journal-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            unlockJournal();
        }
    });
    
    // New task enter key
    document.getElementById('new-task').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // New idea enter key
    document.getElementById('new-idea').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addIdea();
        }
    });
}

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
            
            // Update specific tab content when switched
            if (targetTab === 'progress') {
                createDailyChart();
                updateMonthlyStats();
            }
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
    
    if (shloka.trim()) {
        localStorage.setItem(`shloka_${today}`, shloka);
        showNotification('Shloka saved successfully!');
    } else {
        showNotification('Please enter a shloka first!');
    }
}

function loadSavedData() {
    const today = new Date().toDateString();
    const savedShloka = localStorage.getItem(`shloka_${today}`);
    
    if (savedShloka) {
        document.getElementById('shloka-input').value = savedShloka;
    }
    
    // Load daily stats
    dailyStudyTime = parseInt(localStorage.getItem(`study_time_${today}`)) || 0;
    dailyTasksCompleted = parseInt(localStorage.getItem(`tasks_completed_${today}`)) || 0;
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
        
        document.getElementById('start-timer').textContent = 'Running...';
        document.getElementById('start-timer').disabled = true;
    }
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('timer-status').textContent = 'Paused';
    document.getElementById('start-timer').textContent = 'Resume';
    document.getElementById('start-timer').disabled = false;
}

function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    
    if (isBreak) {
        currentTime = parseInt(document.getElementById('break-duration').value) * 60;
    } else {
        currentTime = parseInt(document.getElementById('study-duration').value) * 60;
    }
    
    updateTimerDisplay();
    document.getElementById('timer-status').textContent = 'Ready to Focus';
    document.getElementById('start-timer').textContent = 'Start';
    document.getElementById('start-timer').disabled = false;
}

function completeTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    
    if (!isBreak) {
        // Study session completed
        pomodoroCount++;
        const studyDuration = parseInt(document.getElementById('study-duration').value);
        dailyStudyTime += studyDuration;
        
        // Save study time
        const today = new Date().toDateString();
        localStorage.setItem(`study_time_${today}`, dailyStudyTime.toString());
        
        showNotification('Study session completed! Time for a break.');
        
        // Switch to break
        isBreak = true;
        if (pomodoroCount % 4 === 0) {
            currentTime = parseInt(document.getElementById('long-break-duration').value) * 60;
            showNotification('Long break time!');
        } else {
            currentTime = parseInt(document.getElementById('break-duration').value) * 60;
        }
    } else {
        // Break completed
        showNotification('Break over! Ready for another study session?');
        isBreak = false;
        currentTime = parseInt(document.getElementById('study-duration').value) * 60;
    }
    
    updateTimerDisplay();
    updateDashboard();
    updateProgressBars();
    document.getElementById('timer-status').textContent = isBreak ? 'Break Time - Ready' : 'Ready to Focus';
    document.getElementById('start-timer').textContent = 'Start';
    document.getElementById('start-timer').disabled = false;
}

// Journal functionality
function loadJournalDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('journal-date').textContent = today.toLocaleDateString('en-US', options);
}

function unlockJournal() {
    const password = document.getElementById('journal-password').value;
    
    if (password === 'jai bhavani') {
        journalUnlocked = true;
        document.getElementById('journal-login').classList.add('hidden');
        document.getElementById('journal-content').classList.remove('hidden');
        
        // Load existing journal entry
        const today = new Date().toDateString();
        const savedEntry = localStorage.getItem(`journal_${today}`);
        if (savedEntry) {
            document.getElementById('journal-entry').value = savedEntry;
        }
        
        showNotification('Journal unlocked successfully!');
    } else {
        showNotification('Incorrect password!');
        document.getElementById('journal-password').value = '';
    }
}

function lockJournal() {
    journalUnlocked = false;
    document.getElementById('journal-login').classList.remove('hidden');
    document.getElementById('journal-content').classList.add('hidden');
    document.getElementById('journal-password').value = '';
    showNotification('Journal locked.');
}

function saveJournal() {
    const entry = document.getElementById('journal-entry').value;
    const today = new Date().toDateString();
    
    localStorage.setItem(`journal_${today}`, entry);
    showNotification('Journal entry saved!');
}

// Ideas functionality
function addIdea() {
    const ideaText = document.getElementById('new-idea').value.trim();
    
    if (ideaText) {
        const idea = {
            text: ideaText,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };
        
        let ideas = JSON.parse(localStorage.getItem('ideas')) || [];
        ideas.unshift(idea);
        localStorage.setItem('ideas', JSON.stringify(ideas));
        
        document.getElementById('new-idea').value = '';
        loadIdeas();
        showNotification('Idea added successfully!');
    }
}

function loadIdeas() {
    const ideas = JSON.parse(localStorage.getItem('ideas')) || [];
    const ideasList = document.getElementById('ideas-list');
    
    ideasList.innerHTML = '';
    
    ideas.forEach((idea, index) => {
        const ideaDiv = document.createElement('div');
        ideaDiv.className = 'idea-item';
        ideaDiv.innerHTML = `
            <div class="idea-date">${idea.date}</div>
            <div class="idea-text">• ${idea.text}</div>
        `;
        ideasList.appendChild(ideaDiv);
    });
}

// Tasks functionality
function addTask() {
    const taskText = document.getElementById('new-task').value.trim();
    
    if (taskText) {
        const task = {
            text: taskText,
            status: 'not-started',
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };
        
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.unshift(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        document.getElementById('new-task').value = '';
        loadTasks();
        showNotification('Task added successfully!');
    }
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const tasksList = document.getElementById('tasks-list');
    
    tasksList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        
        let statusClass = '';
        let statusText = '';
        
        switch(task.status) {
            case 'not-started':
                statusClass = 'status-not-started';
                statusText = 'Not Started';
                break;
            case 'half-finished':
                statusClass = 'status-half-finished';
                statusText = 'Half Finished';
                break;
            case 'complete':
                statusClass = 'status-complete';
                statusText = 'Complete';
                break;
        }
        
        taskDiv.innerHTML = `
            <div class="task-text">${task.text}</div>
            <div class="task-status ${statusClass}" onclick="changeTaskStatus(${index})">
                ${statusText}
            </div>
        `;
        
        tasksList.appendChild(taskDiv);
    });
}

function changeTaskStatus(index) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    if (tasks[index]) {
        switch(tasks[index].status) {
            case 'not-started':
                tasks[index].status = 'half-finished';
                break;
            case 'half-finished':
                tasks[index].status = 'complete';
                // Increment daily tasks completed
                dailyTasksCompleted++;
                const today = new Date().toDateString();
                localStorage.setItem(`tasks_completed_${today}`, dailyTasksCompleted.toString());
                updateDashboard();
                break;
            case 'complete':
                tasks[index].status = 'not-started';
                // Decrement daily tasks completed
                dailyTasksCompleted = Math.max(0, dailyTasksCompleted - 1);
                const todayDecrement = new Date().toDateString();
                localStorage.setItem(`tasks_completed_${todayDecrement}`, dailyTasksCompleted.toString());
                updateDashboard();
                break;
        }
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
        updateProgressBars();
    }
}

function clearCompleted() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.status !== 'complete');
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    showNotification('Completed tasks cleared!');
}

// Dashboard functionality
function updateDashboard() {
    // Update study hours
    const hours = Math.floor(dailyStudyTime / 60);
    const minutes = dailyStudyTime % 60;
    document.getElementById('today-hours').textContent = `${hours}h ${minutes}m`;
    
    // Update tasks completed
    document.getElementById('today-tasks').textContent = dailyTasksCompleted;
    
    // Update streak (simplified - you can enhance this)
    const streak = calculateStreak();
    document.getElementById('current-streak').textContent = `${streak} days`;
}

function calculateStreak() {
    // Simple streak calculation based on daily activity
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();
        
        const studyTime = parseInt(localStorage.getItem(`study_time_${dateString}`)) || 0;
        const tasksCompleted = parseInt(localStorage.getItem(`tasks_completed_${dateString}`)) || 0;
        
        if (studyTime > 0 || tasksCompleted > 0) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Progress bars functionality
function updateProgressBars() {
    // Weekly hours (target: 40 hours)
    const weeklyHours = getWeeklyStudyHours();
    const weeklyHoursPercent = Math.min((weeklyHours / 40) * 100, 100);
    document.getElementById('weekly-hours-progress').style.width = weeklyHoursPercent + '%';
    document.getElementById('weekly-hours-text').textContent = `${weeklyHours}/40 hours`;
    
    // Weekly tasks (target: 20 tasks)
    const weeklyTasks = getWeeklyTasksCompleted();
    const weeklyTasksPercent = Math.min((weeklyTasks / 20) * 100, 100);
    document.getElementById('weekly-tasks-progress').style.width = weeklyTasksPercent + '%';
    document.getElementById('weekly-tasks-text').textContent = `${weeklyTasks}/20 tasks`;
}

function getWeeklyStudyHours() {
    let totalHours = 0;
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();
        
        const studyTime = parseInt(localStorage.getItem(`study_time_${dateString}`)) || 0;
        totalHours += studyTime;
    }
    
    return Math.floor(totalHours / 60);
}

function getWeeklyTasksCompleted() {
    let totalTasks = 0;
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();
        
        const tasksCompleted = parseInt(localStorage.getItem(`tasks_completed_${dateString}`)) || 0;
        totalTasks += tasksCompleted;
    }
    
    return totalTasks;
}

// Daily chart functionality
function createDailyChart() {
    const chartContainer = document.getElementById('daily-chart');
    chartContainer.innerHTML = '';
    
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();
        
        const studyTime = parseInt(localStorage.getItem(`study_time_${dateString}`)) || 0;
        const hours = studyTime / 60;
        
        const barDiv = document.createElement('div');
        barDiv.className = 'chart-bar';
        barDiv.style.height = Math.max((hours / 8) * 250, 5) + 'px'; // Max 8 hours = 250px height
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'chart-label';
        labelDiv.textContent = checkDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        const barContainer = document.createElement('div');
        barContainer.style.position = 'relative';
        barContainer.appendChild(barDiv);
        barContainer.appendChild(labelDiv);
        
        chartContainer.appendChild(barContainer);
    }
}

// Monthly stats functionality
function updateMonthlyStats() {
    const monthlyHours = getMonthlyStudyHours();
    const monthlyTasks = getMonthlyTasksCompleted();
    const monthlyConsistency = getMonthlyConsistency();
    
    // Monthly hours (target: 120 hours)
    const monthlyHoursPercent = Math.min((monthlyHours / 120) * 100, 100);
    document.getElementById('monthly-hours-progress').style.width = monthlyHoursPercent + '%';
    document.getElementById('monthly-hours-text').textContent = `${monthlyHours}/120 hours`;
    
    // Monthly tasks (target: 80 tasks)
    const monthlyTasksPercent = Math.min((monthlyTasks / 80) * 100, 100);
    document.getElementById('monthly-tasks-progress').style.width = monthlyTasksPercent + '%';
    document.getElementById('monthly-tasks-text').textContent = `${monthlyTasks}/80 tasks`;
    
    // Monthly consistency (target: 30 days)
    const monthlyConsistencyPercent = Math.min((monthlyConsistency / 30) * 100, 100);
    document.getElementById('monthly-consistency-progress').style.width = monthlyConsistencyPercent + '%';
    document.getElementById('monthly-consistency-text').textContent = `${monthlyConsistency}/30 days`;
}

function getMonthlyStudyHours() {
    let totalHours = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();
        
        const studyTime = parseInt(localStorage.getItem(`study_time_${dateString}`)) || 0;
        totalHours += studyTime;
    }
    
    return Math.floor(totalHours / 60);
}

function getMonthlyTasksCompleted() {
    let totalTasks = 0;
    const today = new Date();
    
    for (let i = 0; i
