// Global variables
let currentTab = 'dashboard';
let timerInterval;
let timerTime = 25 * 60;
let isRunning = false;
let isFocus = true;
let journalUnlocked = false;
let todoView = 'today';

// LocalStorage keys
const STORAGE_KEYS = {
    tasks: 'lakshya_tasks',
    subjects: 'lakshya_subjects',
    journal: 'lakshya_journal',
    shloka: 'lakshya_shloka',
    ideas: 'lakshya_ideas',
    history: 'lakshya_history'
};

// Motivational messages (15-day cycle)
const motivations = [
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

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    showTab('dashboard');
    loadAllData();
    updateMotivation();
    updateDashboard();
    updateTimerStatus();
    updateWeeklyAnalysis();
    updateProgressBars();
    updateCharts();
});

// Tab switching
function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    currentTab = tab;
    if (tab === 'todo') renderTodoList();
    if (tab === 'syllabus') renderSubjects();
    if (tab === 'journal' && journalUnlocked) renderEntries();
    if (tab === 'shloka') renderShloka();
    if (tab === 'ideas') renderIdeas();
    if (tab === 'analysis') updateWeeklyAnalysis();
    if (tab === 'progress') updateCharts();
}

// Load all data from localStorage
function loadAllData() {
    loadTasks();
    loadSubjects();
    loadJournal();
    loadShloka();
    loadIdeas();
    loadHistory();
}

// Update motivation
function updateMotivation() {
    const today = new Date().getDate();
    const msg = motivations[(today - 1) % 15];
    document.getElementById('motivation').textContent = msg;
}

// Timer functions
function startTimer() {
    if (isRunning) return;
    const focusMin = parseInt(document.getElementById('focus-min').value) || 25;
    const breakMin = parseInt(document.getElementById('break-min').value) || 5;
    timerTime = isFocus ? focusMin * 60 : breakMin * 60;
    isRunning = true;
    timerInterval = setInterval(updateTimer, 1000);
}

function pauseTimer() {
    isRunning = false;
    if (timerInterval) clearInterval(timerInterval);
}

function resetTimer() {
    pauseTimer();
    isFocus = true;
    timerTime = parseInt(document.getElementById('focus-min').value) * 60 || 1500;
    updateTimerDisplay();
    updateTimerProgress();
}

function updateTimer() {
    if (timerTime <= 0) {
        isRunning = false;
        clearInterval(timerInterval);
        isFocus = !isFocus;
        if (!isFocus) {
            // Log focus session
            logHistory('focus');
        }
        resetTimer();
        return;
    }
    timerTime--;
    updateTimerDisplay();
    updateTimerProgress();
}

function updateTimerDisplay() {
    const mins = Math.floor(timerTime / 60);
    const secs = timerTime % 60;
    document.getElementById('timer-display').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('timer-status').textContent = document.getElementById('timer-display').textContent;
}

function updateTimerProgress() {
    const maxTime = isFocus ? parseInt(document.getElementById('focus-min').value) * 60 : parseInt(document.getElementById('break-min').value) * 60;
    const progress = ((maxTime - timerTime) / maxTime) * 100;
    const circumference = 282.74;
    document.getElementById('timer-circle').style.strokeDashoffset = circumference - (progress / 100) * circumference;
    document.getElementById('timer-progress').style.width = progress + '%';
}

// To-Do functions
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks)) || [];

function addTask() {
    const title = document.getElementById('task-title').value;
    const deadline = document.getElementById('task-deadline').value;
    const subject = document.getElementById('task-subject').value;
    if (title) {
        tasks.push({ title, deadline, subject, status: 'Not Started', id: Date.now() });
        saveTasks();
        renderTodoList();
        document.getElementById('task-title').value = '';
        document.getElementById('task-deadline').value = '';
        document.getElementById('task-subject').value = '';
    }
}

function renderTodoList() {
    const list = document.getElementById('todo-list');
    let filtered = tasks;
    const today = new Date().toISOString().split('T')[0];
    if (todoView === 'today') filtered = tasks.filter(t => t.deadline === today || !t.deadline);
    else if (todoView === 'upcoming') filtered = tasks.filter(t => t.deadline > today);
    list.innerHTML = filtered.map(task => `
        <li>
            <strong>${task.title}</strong> - ${task.subject} ${task.deadline ? `(Due: ${task.deadline})` : ''}
            <select onchange="updateTaskStatus(${task.id}, this.value)">
                <option ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option ${task.status === 'Half Finished' ? 'selected' : ''}>Half Finished</option>
                <option ${task.status === 'Complete' ? 'selected' : ''}>Complete</option>
            </select>
        </li>
    `).join('');
    updateDashboard();
}

function updateTaskStatus(id, status) {
    const task = tasks.find(t => t.id === id);
    if (task) task.status = status;
    saveTasks();
    renderTodoList();
    if (status === 'Complete') logHistory('task');
}

function showTodoView(view) {
    todoView = view;
    renderTodoList();
}

function clearCompleted() {
    tasks = tasks.filter(t => t.status !== 'Complete');
    saveTasks();
    renderTodoList();
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

function loadTasks() {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks)) || [];
}

// Dashboard update
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => (t.deadline === today || !t.deadline) && t.status === 'Complete').length;
    document.getElementById('tasks-today').textContent = todayTasks;
    // Focus today from history
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history)) || [];
    const todayFocus = history.filter(h => h.date === today).reduce((sum, h) => sum + (h.focus || 0), 0) / 60;
    document.getElementById('focus-today').textContent = todayFocus.toFixed(1);
    // Today's tasks list
    const todayList = document.getElementById('today-tasks');
    const pendingToday = tasks.filter(t => (t.deadline === today || !t.deadline) && t.status !== 'Complete');
    todayList.innerHTML = pendingToday.map(t => `<li>${t.title} - ${t.status}</li>`).join('');
}

// Syllabus functions
let subjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.subjects)) || [];

function addSubject() {
    const name = document.getElementById('new-subject').value;
    if (name) {
        subjects.push({ name, topics: [], id: Date.now() });
        saveSubjects();
        renderSubjects();
        document.getElementById('new-subject').value = '';
    }
}

function renderSubjects() {
    const container = document.getElementById('subjects-list');
    container.innerHTML = subjects.map(sub => {
        const completed = sub.topics.filter(t => t.completed).length;
        const total = sub.topics.length;
        const progress = total > 0 ? (completed / total * 100) : 0;
        return `
            <div>
                <h3>${sub.name}</h3>
                <div class="progress-bar"><div style="width:${progress}%"></div></div>
                <p>${completed}/${total} completed</p>
                <input type="text" placeholder="Add topic" id="topic-${sub.id}">
                <button onclick="addTopic(${sub.id})">Add Topic</button>
                <ul>
                    ${sub.topics.map((topic, idx) => `
                        <li>
                            <input type="checkbox" ${topic.completed ? 'checked' : ''} onchange="toggleTopic(${sub.id}, ${idx})">
                            ${topic.name}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }).join('');
}

function addTopic(subId) {
    const input = document.getElementById(`topic-${subId}`);
    const name = input.value;
    if (name) {
        const sub = subjects.find(s => s.id === subId);
        sub.topics.push({ name, completed: false });
        saveSubjects();
        renderSubjects();
        input.value = '';
    }
}

function toggleTopic(subId, idx) {
    const sub = subjects.find(s => s.id === subId);
    sub.topics[idx].completed = !sub.topics[idx].completed;
    saveSubjects();
    renderSubjects();
    updateWeeklyAnalysis();
    updateCharts();
}

function saveSubjects() {
    localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(subjects));
}

function loadSubjects() {
    subjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.subjects)) || [];
}

// Journal
function unlockJournal() {
    const pass = prompt('Enter password:');
    if (pass === 'jai bhavani') {
        journalUnlocked = true;
        document.getElementById('journal-content').style.display = 'block';
        renderEntries();
    } else {
        alert('Incorrect password');
    }
}

let entries = [];

function loadJournal() {
    if (journalUnlocked) {
        entries = JSON.parse(localStorage.getItem(STORAGE_KEYS.journal)) || [];
    }
}

function saveEntry() {
    const text = document.getElementById('journal-entry').value;
    if (text) {
        entries.push({ text, date: new Date().toISOString(), id: Date.now() });
        localStorage.setItem(STORAGE_KEYS.journal, JSON.stringify(entries));
        document.getElementById('journal-entry').value = '';
        renderEntries();
    }
}

function renderEntries() {
    const list = document.getElementById('entries-list');
    list.innerHTML = entries.map(entry => `
        <li>
            <p>${entry.text}</p>
            <small>${new Date(entry.date).toLocaleDateString()}</small>
            <button onclick="deleteEntry(${entry.id})">Delete</button>
        </li>
    `).join('');
}

function deleteEntry(id) {
    entries = entries.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.journal, JSON.stringify(entries));
    renderEntries();
}

// Shloka
function renderShloka() {
    const text = localStorage.getItem(STORAGE_KEYS.shloka) || '';
    document.getElementById('shloka-text').value = text;
    document.getElementById('shloka-display').textContent = text;
}

document.getElementById('shloka-text').addEventListener('input', function(e) {
    localStorage.setItem(STORAGE_KEYS.shloka, e.target.value);
    renderShloka();
});

// Ideas
let ideas = JSON.parse(localStorage.getItem(STORAGE_KEYS.ideas)) || [];

function addIdea() {
    const text = document.getElementById('idea-note').value;
    const pinned = document.getElementById('pin-idea').checked;
    if (text) {
        ideas.push({ text, date: new Date().toISOString(), pinned, id: Date.now() });
        saveIdeas();
        document.getElementById('idea-note').value = '';
        document.getElementById('pin-idea').checked = false;
        renderIdeas();
    }
}

function renderIdeas() {
    let sorted = [...ideas];
    const sortBy = document.querySelector('.sort-ideas button.active')?.textContent || 'By Time';
    if (sortBy === 'Pinned First') {
        sorted.sort((a, b) => b.pinned - a.pinned || new Date(b.date) - new Date(a.date));
    } else {
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    const list = document.getElementById('ideas-list');
    list.innerHTML = sorted.map(idea => `
        <li ${idea.pinned ? 'style="background:#2196F3;color:white;"' : ''}>
            <p>${idea.text}</p>
            <small>${new Date(idea.date).toLocaleDateString()}</small>
            ${idea.pinned ? '<strong>Pinned</strong>' : ''}
        </li>
    `).join('');
}

function sortIdeas(type) {
    document.querySelectorAll('.sort-ideas button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderIdeas();
}

function saveIdeas() {
    localStorage.setItem(STORAGE_KEYS.ideas, JSON.stringify(ideas));
}

function loadIdeas() {
    ideas = JSON.parse(localStorage.getItem(STORAGE_KEYS.ideas)) || [];
}

// History for analysis and progress
let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history)) || [];

function logHistory(type) {
    const today = new Date().toISOString().split('T')[0];
    let entry = history.find(h => h.date === today);
    if (!entry) {
        entry = { date: today, tasks: 0, focus: 0 };
        history.push(entry);
    }
    if (type === 'task') entry.tasks++;
    if (type === 'focus') entry.focus += (isFocus ? parseInt(document.getElementById('focus-min').value) * 60 : 0);
    saveHistory();
}

function saveHistory() {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

function loadHistory() {
    history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history)) || [];
}

// Weekly Analysis
function updateWeeklyAnalysis() {
    const now = new Date();
    const weekStart = new Date(now.getTime() - (now.getDay() - 1) * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    const weekHistory = history.filter(h => {
        const d = new Date(h.date);
        return d >= weekStart && d <= weekEnd;
    });
    const weeklyTasks = weekHistory.reduce((sum, h) => sum + h.tasks, 0);
    const weeklyFocus = weekHistory.reduce((sum, h) => sum + h.focus, 0) / 60;
    const totalTopics = subjects.reduce((sum, s) => sum + s.topics.length, 0);
    const completedTopics = subjects.reduce((sum, s) => sum + s.topics.filter(t => t.completed).length, 0);
    const weeklySyllabus = totalTopics > 0 ? (completedTopics / totalTopics * 100) : 0;
    document.getElementById('weekly-tasks').textContent = weeklyTasks;
    document.getElementById('weekly-focus').textContent = weeklyFocus.toFixed(1);
    document.getElementById('weekly-syllabus').textContent = weeklySyllabus.toFixed(1);
    // Horizontal bars (assume max 40 hours, 50 tasks)
    document.getElementById('hours-bar').style.width = Math.min(weeklyFocus / 40 * 100, 100) + '%';
    document.getElementById('tasks-bar').style.width = Math.min(weeklyTasks / 50 * 100, 100) + '%';
}

// Progress bars (monthly)
function updateProgressBars() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthHistory = history.filter(h => h.date >= monthStart);
    const monthlyHours = monthHistory.reduce((sum, h) => sum + h.focus / 60, 0);
    const monthlyTasks = monthHistory.reduce((sum, h) => sum + h.tasks, 0);
    const activeDays = new Set(monthHistory.map(h => h.date)).size;
    const consistency = (activeDays / 30 * 100);
    document.getElementById('monthly-hours').style.width = Math.min(monthlyHours / 200 * 100, 100) + '%'; // assume max 200h
    document.getElementById('monthly-tasks').style.width = Math.min(monthlyTasks / 200 * 100, 100) + '%'; // max 200
    document.getElementById('consistency-bar').style.width = consistency + '%';
}

// Charts
let syllabusPie, pomodoroLine, tasksLine;

function updateCharts() {
    // Syllabus Pie
    const totalTopics = subjects.reduce((sum, s) => sum + s.topics.length, 0);
    const completedTopics = subjects.reduce((sum, s) => sum + s.topics.filter(t => t.completed).length, 0);
    const ctxPie = document.getElementById('syllabus-pie').getContext('2d');
    if (syllabusPie) syllabusPie.destroy();
    syllabusPie = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{ data: [completedTopics, totalTopics - completedTopics], backgroundColor: ['#2196F3', '#E3F2FD'] }]
        },
        options: { responsive: true }
    });

    // Pomodoro Line (focus sessions per day last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const sessions = history.filter(h => h.date === dateStr).length; // each focus log as session
        last7Days.push(sessions);
    }
    const ctxPom = document.getElementById('pomodoro-line').getContext('2d');
    if (pomodoroLine) pomodoroLine.destroy();
    pomodoroLine = new Chart(ctxPom, {
        type: 'line',
        data: {
            labels: last7Days.map((_, i) => `Day ${7-i}`),
            datasets: [{ label: 'Sessions', data: last7Days, borderColor: '#2196F3' }]
        },
        options: { responsive: true }
    });

    // Tasks Line (tasks per week last 4 weeks)
    const last4Weeks = [];
    for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + i * 7));
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        const weekTasks = history.filter(h => {
            const d = new Date(h.date);
            return d >= weekStart && d <= weekEnd;
        }).reduce((sum, h) => sum + h.tasks, 0);
        last4Weeks.push(weekTasks);
    }
    const ctxTasks = document.getElementById('tasks-line').getContext('2d');
    if (tasksLine) tasksLine.destroy();
    tasksLine = new Chart(ctxTasks, {
        type: 'line',
        data: {
            labels: last4Weeks.map((_, i) => `Week ${4-i}`),
            datasets: [{ label: 'Tasks', data: last4Weeks, borderColor: '#2196F3' }]
        },
        options: { responsive: true }
    });
}

function updateTimerStatus() {
    updateTimerDisplay();
}
