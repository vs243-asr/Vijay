// --- CONSTANTS AND INITIAL DATA LOAD ---

const PASSWORD = 'jai bhavani';
const MOTIVATIONAL_MESSAGES = [
    "शीलम् परम भूषणम्",
    "वीर भोग्या वसुंधरा",
    "नभः स्पृशं दीप्तम्",
    "Hazaron ki bheed me se ubhar ke aaunga, mujhe me kabiliyat hai mai kar ke dikhaunga",
    "Padhan hai, Phodna hai, Kehar macha dena hai, Aag laga deni hai.",
    "We are not part of the crowd. We are the reason for the crowd.",
    "Discipline is the highest virtue and the key to dominate.",
    "Every minute wasted is NLSIU moving away.",
    "There are many players. Be the game changer.",
    "Lifestyle is important. Live like a commander and you'll become one.",
    "To shine like the Sun, you must burn like the Sun.",
    "Frustrations, Failures, Falls are just preparation to reach the top.",
    "Manzil door hai, lekin jaana jaroor hai.",
    "लक्ष्य यदि सर्वोपरी हो तो आलोचना, विवेचना और प्रशंसा का कोई मूल्य नहीं है।",
    "Work while they waste, Study while they sleep, prepare while they play and rise while they regret."
];

let tasks = loadFromLocal('tasks', []);
let subjects = loadFromLocal('subjects', []);
let journalEntries = loadFromLocal('journalEntries', []);
let notes = loadFromLocal('notes', []);
let shloka = loadFromLocal('shloka', null);
let focusSessions = loadFromLocal('focusSessions', {
    today: 0,
    daily: {} // Stores completed sessions by date: { '2025-11-24': 5 }
});
let customBars = loadFromLocal('customBars', {
    weeklyHours: 0,
    weeklyTasks: 0,
    monthlyHours: 0,
    monthlyTasks: 0,
    consistency: 0
});

// Timer State
let timerInterval = null;
let isFocusMode = true;
let isPaused = true;
let duration = 25 * 60; // Default focus time in seconds
let originalDuration = 25 * 60; // Used for progress bar calculation
const CIRCLE_RADIUS = 45;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// Chart Instances
let syllabusPieChart, focusLineChart, tasksLineChart;

// Current Task Filter
let currentTaskFilter = 'All';

// --- LOCAL STORAGE FUNCTIONS ---

function loadFromLocal(key, defaultValue) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

function saveToLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- NAVIGATION AND INITIALIZATION ---

function showSection(sectionId) {
    document.querySelectorAll('.page').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    // Trigger specific updates when navigating
    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'timer') updateTimerDisplay();
    if (sectionId === 'todo') renderTasks();
    if (sectionId === 'syllabus') renderSubjects();
    if (sectionId === 'notes') renderNotes();
    if (sectionId === 'analysis') setupCharts();
    if (sectionId === 'journal') checkJournalLock();
}

function checkJournalLock() {
    if (localStorage.getItem('journalUnlocked') === 'true') {
        document.getElementById('journal-login').classList.add('hidden');
        document.getElementById('journal-content').classList.remove('hidden');
        renderJournalEntries();
    } else {
        document.getElementById('journal-login').classList.remove('hidden');
        document.getElementById('journal-content').classList.add('hidden');
        document.getElementById('journal-password').value = '';
    }
}

function initializeApp() {
    showSection('dashboard');
    setDailyMotivation();
    updateDashboard();
    renderShloka();
    initCustomBars();
    // Setting up the initial timer display
    updateTimerDisplay();
}

// --- DAILY MOTIVATION ---

function setDailyMotivation() {
    const today = new Date().toDateString();
    let lastUpdate = localStorage.getItem('motivationLastUpdate');
    let index = parseInt(localStorage.getItem('motivationIndex')) || 0;

    if (lastUpdate !== today) {
        // Calculate new index (15 day reset)
        if (index >= MOTIVATIONAL_MESSAGES.length - 1) {
            index = 0;
        } else {
            index = (index + 1) % MOTIVATIONAL_MESSAGES.length;
        }
        
        localStorage.setItem('motivationLastUpdate', today);
        localStorage.setItem('motivationIndex', index.toString());
    }

    document.getElementById('daily-motivation').textContent = MOTIVATIONAL_MESSAGES[index];
}

// --- DASHBOARD UPDATES ---

function updateDashboard() {
    // 1. Task Counts
    const todayTasks = tasks.filter(t => 
        t.deadline === new Date().toISOString().slice(0, 10) && t.status !== 'Complete'
    );
    document.getElementById('today-tasks-count').textContent = todayTasks.length;
    
    // Render dashboard tasks
    const dashList = document.getElementById('dashboard-today-tasks');
    dashList.innerHTML = '';
    if (todayTasks.length === 0) {
        dashList.innerHTML = '<li>You are all clear!</li>';
    } else {
        todayTasks.slice(0, 5).forEach(task => {
            const li = document.createElement('li');
            const statusClass = task.status === 'Complete' ? 'dashboard-task-complete' : 
                                task.status === 'HalfFinished' ? 'dashboard-task-inprogress' : 
                                'dashboard-task-notstarted';
            li.innerHTML = `<span class="${statusClass}">• ${task.title}</span>`;
            dashList.appendChild(li);
        });
    }

    // 2. Syllabus Progress
    let totalTopics = 0;
    let completedTopics = 0;
    subjects.forEach(sub => {
        totalTopics += sub.topics.length;
        completedTopics += sub.topics.filter(t => t.completed).length;
    });
    const syllabusPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    document.getElementById('stats-syllabus-overall').textContent = `${syllabusPercent}%`;

    // 3. Productivity Stats
    const todayDate = new Date().toISOString().slice(0, 10);
    const completedTasksThisWeek = tasks.filter(t => t.status === 'Complete' && isThisWeek(new Date(t.completedDate)));
    
    document.getElementById('stats-focus-today').textContent = focusSessions.daily[todayDate] || 0;
    document.getElementById('stats-tasks-week').textContent = completedTasksThisWeek.length;
    
    // 4. Timer Status
    document.getElementById('timer-status').textContent = isPaused ? "Ready to Focus" : 
        isFocusMode ? "Focusing" : "On Break";
    document.getElementById('timer-display-dashboard').textContent = formatTime(duration);
    
    // 5. Long Term Goal Progress (Simple Mock based on syllabus/tasks)
    const longTermBar = document.getElementById('long-term-progress');
    const averageProgress = Math.min(100, Math.round((syllabusPercent + (completedTasksThisWeek.length / 10) * 10) / 2)); // Mock calculation
    longTermBar.innerHTML = `<div class="progress-bar-container"><div class="progress-bar" style="width: ${averageProgress}%;">GOAL: ${averageProgress}%</div></div>`;
}

function isThisWeek(date) {
    const now = new Date();
    const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const lastDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

// --- TIMER FUNCTIONALITY (Pomodoro) ---

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    document.getElementById('timer-display').textContent = formatTime(duration);
    document.getElementById('timer-mode').textContent = isFocusMode ? "Focus Mode" : "Break Mode";
    updateTimerProgress();
    // Also update dashboard
    if (document.getElementById('dashboard').classList.contains('active')) {
        updateDashboard();
    }
}

function updateTimerProgress() {
    const percentage = 1 - (duration / originalDuration);
    const offset = CIRCLE_CIRCUMFERENCE * percentage;
    const svg = document.getElementById('timer-progress-svg');
    svg.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE}`;
    svg.style.strokeDashoffset = `${offset}`;
}

function startTimer() {
    if (!isPaused) return;

    isPaused = false;
    document.getElementById('start-pause-button').textContent = 'Pause';

    timerInterval = setInterval(() => {
        duration--;
        updateTimerDisplay();

        if (duration <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            
            if (isFocusMode) {
                // Focus session complete
                const todayDate = new Date().toISOString().slice(0, 10);
                focusSessions.daily[todayDate] = (focusSessions.daily[todayDate] || 0) + 1;
                focusSessions.today = (focusSessions.daily[todayDate] || 0);
                saveToLocal('focusSessions', focusSessions);
                
                // Switch to break mode
                isFocusMode = false;
                originalDuration = parseInt(document.getElementById('break-duration').value) * 60;
                duration = originalDuration;
                alert('Focus Session Complete! Time for a break.');
            } else {
                // Break session complete
                isFocusMode = true;
                originalDuration = parseInt(document.getElementById('focus-duration').value) * 60;
                duration = originalDuration;
                alert('Break is over! Time to focus.');
            }
            
            isPaused = true;
            document.getElementById('start-pause-button').textContent = 'Start';
            updateTimerDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    if (isPaused) return;
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = true;
    document.getElementById('start-pause-button').textContent = 'Start';
}

function resetTimer() {
    pauseTimer();
    isFocusMode = true;
    originalDuration = parseInt(document.getElementById('focus-duration').value) * 60;
    duration = originalDuration;
    document.getElementById('start-pause-button').textContent = 'Start';
    updateTimerDisplay();
}

document.getElementById('start-pause-button').addEventListener('click', () => {
    isPaused ? startTimer() : pauseTimer();
});

document.getElementById('reset-button').addEventListener('click', resetTimer);

document.getElementById('apply-timer-settings').addEventListener('click', () => {
    pauseTimer();
    const focusMin = parseInt(document.getElementById('focus-duration').value);
    const breakMin = parseInt(document.getElementById('break-duration').value);
    
    if (focusMin < 1 || breakMin < 1 || isNaN(focusMin) || isNaN(breakMin)) {
        alert('Please enter valid durations (> 0).');
        return;
    }
    
    // Only reset duration if in the mode that's being changed
    if (isFocusMode) {
        originalDuration = focusMin * 60;
        duration = originalDuration;
    } else {
        originalDuration = breakMin * 60;
        duration = originalDuration;
    }
    
    updateTimerDisplay();
    alert('Timer settings applied.');
});

// --- TO-DO LIST ---

document.getElementById('add-task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const deadline = document.getElementById('task-deadline').value;
    const subject = document.getElementById('task-subject').value;

    const newTask = {
        id: Date.now(),
        title,
        deadline,
        subject,
        status: 'Not Started',
        completedDate: null
    };

    tasks.push(newTask);
    saveToLocal('tasks', tasks);
    renderTasks();
    this.reset();
});

function filterTasks(filter) {
    currentTaskFilter = filter;
    document.getElementById('active-task-filter').textContent = filter;
    
    document.querySelectorAll('.small-button').forEach(btn => btn.classList.remove('active-filter'));
    document.getElementById(`filter-${filter.toLowerCase()}`).classList.add('active-filter');

    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    
    const today = new Date().toISOString().slice(0, 10);
    
    let filteredTasks = tasks;
    
    if (currentTaskFilter === 'Today') {
        filteredTasks = tasks.filter(t => t.deadline === today || !t.deadline);
    } else if (currentTaskFilter === 'Upcoming') {
        filteredTasks = tasks.filter(t => t.deadline > today);
    }
    
    // Sort: Not Completed first, then by deadline
    filteredTasks.sort((a, b) => {
        if (a.status !== 'Complete' && b.status === 'Complete') return -1;
        if (a.status === 'Complete' && b.status !== 'Complete') return 1;
        if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
        return 0;
    });

    if (filteredTasks.length === 0) {
        list.innerHTML = `<li>No ${currentTaskFilter.toLowerCase()} tasks found.</li>`;
        return;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.status === 'Complete' ? 'complete' : ''}`;
        
        const deadlineText = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Deadline';

        li.innerHTML = `
            <div class="task-info">
                <strong>${task.title}</strong>
                <p><small>Subject: ${task.subject || 'General'} | Due: ${deadlineText}</small></p>
            </div>
            <div>
                <select class="task-status status-${task.status.replace(/\s/g, '')}" onchange="updateTaskStatus(${task.id}, this.value)">
                    <option value="Not Started" ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                    <option value="Half Finished" ${task.status === 'Half Finished' ? 'selected' : ''}>Half Finished</option>
                    <option value="Complete" ${task.status === 'Complete' ? 'selected' : ''}>Complete</option>
                </select>
                <button onclick="deleteTask(${task.id})" class="small-button secondary-button">Delete</button>
            </div>
        `;
        list.appendChild(li);
    });
    
    updateDashboard(); // Keep dashboard stats fresh
}

function updateTaskStatus(id, newStatus) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        tasks[taskIndex].status = newStatus;
        if (newStatus === 'Complete') {
            tasks[taskIndex].completedDate = new Date().toISOString().slice(0, 10);
        } else {
            tasks[taskIndex].completedDate = null;
        }
        saveToLocal('tasks', tasks);
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveToLocal('tasks', tasks);
    renderTasks();
}

document.getElementById('clear-completed-button').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear ALL completed tasks?')) {
        tasks = tasks.filter(t => t.status !== 'Complete');
        saveToLocal('tasks', tasks);
        renderTasks();
    }
});

// --- SYLLABUS TRACKER ---

document.getElementById('add-subject-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('subject-name').value;
    const topicsText = document.getElementById('subject-topics').value;
    
    const topics = topicsText.split('\n')
                             .map(t => t.trim())
                             .filter(t => t.length > 0)
                             .map((topic, index) => ({
                                 id: index,
                                 name: topic,
                                 completed: false
                             }));

    const newSubject = {
        id: Date.now(),
        name,
        topics
    };

    subjects.push(newSubject);
    saveToLocal('subjects', subjects);
    renderSubjects();
    this.reset();
});

function renderSubjects() {
    const list = document.getElementById('syllabus-list');
    list.innerHTML = '';

    if (subjects.length === 0) {
        list.innerHTML = '<p>No subjects added yet.</p>';
        return;
    }

    subjects.forEach(subject => {
        const completedCount = subject.topics.filter(t => t.completed).length;
        const totalCount = subject.topics.length;
        const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const div = document.createElement('div');
        div.className = 'syllabus-subject card';
        
        let topicsHtml = subject.topics.map(topic => `
            <li>
                <input type="checkbox" id="topic-${subject.id}-${topic.id}" 
                       ${topic.completed ? 'checked' : ''} 
                       onclick="toggleTopicCompletion(${subject.id}, ${topic.id})">
                <label for="topic-${subject.id}-${topic.id}">${topic.name}</label>
            </li>
        `).join('');

        div.innerHTML = `
            <h3>${subject.name} <button onclick="deleteSubject(${subject.id})" class="small-button secondary-button">Delete</button></h3>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%;">
                    ${percentage}%
                </div>
            </div>
            <ul class="topics-list">
                ${topicsHtml}
            </ul>
        `;
        list.appendChild(div);
    });
    
    updateDashboard(); // Update overall progress on the dashboard
}

function toggleTopicCompletion(subjectId, topicId) {
    const subjectIndex = subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex > -1) {
        const topic = subjects[subjectIndex].topics.find(t => t.id === topicId);
        if (topic) {
            topic.completed = !topic.completed;
            saveToLocal('subjects', subjects);
            renderSubjects();
        }
    }
}

function deleteSubject(id) {
    if (confirm('Are you sure you want to delete this subject and all its progress?')) {
        subjects = subjects.filter(s => s.id !== id);
        saveToLocal('subjects', subjects);
        renderSubjects();
    }
}

// --- LOCKED JOURNAL ---

function loginJournal() {
    const input = document.getElementById('journal-password').value;
    if (input === PASSWORD) {
        localStorage.setItem('journalUnlocked', 'true');
        checkJournalLock();
    } else {
        alert('Incorrect Password. Try again.');
    }
}

document.getElementById('add-journal-entry-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const text = document.getElementById('journal-entry-text').value.trim();
    if (text) {
        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            content: text
        };
        journalEntries.unshift(newEntry); // Add to the start
        saveToLocal('journalEntries', journalEntries);
        renderJournalEntries();
        this.reset();
    }
});

function renderJournalEntries() {
    const list = document.getElementById('journal-entries-list');
    list.innerHTML = '';
    
    journalEntries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'journal-entry';
        
        div.innerHTML = `
            <small>${entry.timestamp}</small>
            <p>${entry.content}</p>
            <div class="entry-actions">
                <button onclick="editJournalEntry(${entry.id})" class="small-button">Edit</button>
                <button onclick="deleteJournalEntry(${entry.id})" class="small-button secondary-button">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function editJournalEntry(id) {
    const entryIndex = journalEntries.findIndex(e => e.id === id);
    i
