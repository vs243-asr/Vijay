// Motivation Quotes
const quotes = [
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
    "Frustrations, Failures, Falls are just preparation to reach the top.",
    "Manzil door hai, lekin jaana jaroor hai.",
    "लक्ष्य यदि सर्वोपरी हो तो आलोचना, विवेचना और प्रशंसा का कोई मूल्य नहीं है।",
    "Work while they waste, Study whole they sleep, prepare while they play and rise while they regret."
];

// Load Quote
let lastQuoteIndex = parseInt(localStorage.getItem('lastQuoteIndex') || "-1");
let quoteIndex = (lastQuoteIndex + 1) % quotes.length;
document.getElementById('quoteDisplay').innerText = quotes[quoteIndex];
localStorage.setItem('lastQuoteIndex', quoteIndex.toString());

// Timer
let timerInterval;
document.getElementById('startTimer').addEventListener('click', () => {
    clearInterval(timerInterval);
    let studyTime = parseInt(document.getElementById('studyMinutes').value) * 60;
    let breakTime = parseInt(document.getElementById('breakMinutes').value) * 60;
    let time = studyTime;
    let isBreak = false;
    updateTimerDisplay(time);
    timerInterval = setInterval(() => {
        time--;
        updateTimerDisplay(time);
        if (time <= 0) {
            isBreak = !isBreak;
            time = isBreak ? breakTime : studyTime;
            alert(isBreak ? "Break time!" : "Back to study!");
        }
    }, 1000);
});

function updateTimerDisplay(seconds) {
    let min = Math.floor(seconds / 60).toString().padStart(2, "0");
    let sec = (seconds % 60).toString().padStart(2, "0");
    document.getElementById('timerDisplay').innerText = `${min}:${sec}`;
}

// Journal
document.getElementById('journalPassword').addEventListener('input', () => {
    const pass = document.getElementById('journalPassword').value;
    const journalText = document.getElementById('journalText');
    if(pass === "jai bhavani") {
        journalText.disabled = false;
        const saved = localStorage.getItem('journal');
        journalText.value = saved || "";
    } else {
        journalText.disabled = true;
    }
});

document.getElementById('saveJournal').addEventListener('click', () => {
    const journalText = document.getElementById('journalText').value;
    localStorage.setItem('journal', journalText);
    alert("Journal saved!");
});

// Ideas
function loadIdeas() {
    const ideaList = document.getElementById('ideaList');
    ideaList.innerHTML = "";
    const ideas = JSON.parse(localStorage.getItem('ideas') || "[]");
    ideas.forEach(item => {
        const li = document.createElement('li');
        li.innerText = `${item.text} (${item.date})`;
        ideaList.appendChild(li);
    });
}
document.getElementById('addIdea').addEventListener('click', () => {
    const input = document.getElementById('ideaInput');
    const text = input.value.trim();
    if(text) {
        const ideas = JSON.parse(localStorage.getItem('ideas') || "[]");
        ideas.push({ text, date: new Date().toLocaleDateString() });
        localStorage.setItem('ideas', JSON.stringify(ideas));
        input.value = "";
        loadIdeas();
    }
});
loadIdeas();

// Checklist
function loadTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = "";
    const tasks = JSON.parse(localStorage.getItem('tasks') || "[]");
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" ${task.status === "Complete" ? "checked" : ""}/> ${task.text}`;
        li.querySelector('input').addEventListener('change', () => {
            task.status = li.querySelector('input').checked ? "Complete" : "Half Finished";
            saveTasks(tasks);
        });
        taskList.appendChild(li);
    });
}
function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
document.getElementById('addTask').addEventListener('click', () => {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if(text) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || "[]");
        tasks.push({ text, status: "Not Started" });
        saveTasks(tasks);
        input.value = "";
        loadTasks();
    }
});
document.getElementById('refreshTasks').addEventListener('click', () => {
    let tasks = JSON.parse(localStorage.getItem('tasks') || "[]");
    tasks = tasks.filter(task => task.status !== "Complete");
    saveTasks(tasks);
    loadTasks();
});
loadTasks();

// Trackers
function loadTrackers() {
    document.getElementById('studyHours').value = localStorage.getItem('studyHours') || 0;
    document.getElementById('tasksDone').value = localStorage.getItem('tasksDone') || 0;
    updateBars();
}
function updateBars() {
    const hours = parseInt(localStorage.getItem('studyHours') || 0);
    const tasks = parseInt(localStorage.getItem('tasksDone') || 0);
    document.getElementById('barStudy').style.width = Math.min(hours * 10, 100) + "%";
    document.getElementById('barTasks').style.width = Math.min(tasks * 10, 100) + "%";
}
document.getElementById('saveTrackers').addEventListener('click', () => {
    const hours = parseInt(document.getElementById('studyHours').value) || 0;
    const tasks = parseInt(document.getElementById('tasksDone').value) || 0;
    localStorage.setItem('studyHours', hours);
    localStorage.setItem('tasksDone', tasks);
    updateBars();
});
loadTrackers();

// Progress
function loadProgress() {
    const daily = JSON.parse(localStorage.getItem('dailyProgress') || "{}");
    const today = new Date().toLocaleDateString();
    if (!daily[today]) daily[today] = 0;
    daily[today]++;
    localStorage.setItem('dailyProgress', JSON.stringify(daily));
    let progressText = "Today's activity count: " + daily[today];
    document.getElementById('dailyProgress').innerText = progressText;

    const monthly = JSON.parse(localStorage.getItem('monthlySummary') || "{}");
    const month = new Date().toLocaleDateString().slice(3, 10);
    if (!monthly[month]) monthly[month] = 0;
    monthly[month]++;
    localStorage.setItem('monthlySummary', JSON.stringify(monthly));
    let summary = `This month active days: ${monthly[month]}`;
    document.getElementById('monthlySummary').innerText = summary;
}
loadProgress();

// Shloka
document.getElementById('shlokaText').value = "ॐ सर्वे भवन्तु सुखिनः।";
document.getElementById('copyShloka').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('shlokaText').value);
    alert("Copied!");
});
