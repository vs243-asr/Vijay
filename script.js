/* ============================
   LAKSHYA STUDY APP SCRIPT
   ============================ */

/* ---------- GLOBAL DATA ---------- */
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let subjects = JSON.parse(localStorage.getItem("subjects")) || {};
let journalEntries = JSON.parse(localStorage.getItem("journal")) || [];
let ideas = JSON.parse(localStorage.getItem("ideas")) || [];
let shloka = localStorage.getItem("shloka") || "";
let quotesHistory = JSON.parse(localStorage.getItem("quotesHistory")) || [];

let studyLogs = JSON.parse(localStorage.getItem("studyLogs")) || [];
let streak = JSON.parse(localStorage.getItem("streak")) || { current: 0, longest: 0, lastUsed: null };

const motivationalQuotes = [
  "You either want it, or you don’t…",
  "Touch the sky with glory",
  "Survival of the fittest - Darwin",
  "Veer Bhogya Vasundhara",
  "Sheelam Param Bhooshanam",
  "Every move must have a purpose",
  "Without error there is no brilliancy",
  "The world obeys only one law: POWER",
  "Hazaron ki bheed se ubhar ke aaunga, Mujh me kabiliyat hai mai kar ke dikhaunga",
  "If you want to rise like the Sun, first burn like the Sun."
];

/* ---------- TAB SWITCHING ---------- */
const tabs = document.querySelectorAll(".tabs button");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    contents.forEach(c => c.classList.remove("active"));
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

/* ---------- MOTIVATIONAL QUOTES ---------- */
function showQuote() {
  let available = motivationalQuotes.filter(q => !quotesHistory.includes(q));
  if (available.length === 0) {
    quotesHistory = [];
    available = motivationalQuotes;
  }
  const quote = available[Math.floor(Math.random() * available.length)];
  document.getElementById("quote").textContent = quote;
  quotesHistory.push(quote);
  if (quotesHistory.length > 10) quotesHistory.shift();
  localStorage.setItem("quotesHistory", JSON.stringify(quotesHistory));
}
showQuote();

/* ---------- SHLOKA ---------- */
const shlokaInput = document.getElementById("shloka-input");
if (shloka) shlokaInput.value = shloka;
shlokaInput.addEventListener("input", () => {
  localStorage.setItem("shloka", shlokaInput.value);
});

/* ---------- TASKS ---------- */
function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";
  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<input type="checkbox" ${t.done ? "checked" : ""}>
                    <span>${t.text}</span>
                    <button class="delete-task">❌</button>`;
    li.querySelector("input").addEventListener("change", e => {
      tasks[i].done = e.target.checked;
      saveTasks();
    });
    li.querySelector("button").addEventListener("click", () => {
      tasks.splice(i, 1);
      saveTasks();
    });
    list.appendChild(li);
  });
  updateTaskProgress();
}
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}
document.getElementById("add-task").addEventListener("click", () => {
  const val = document.getElementById("task-input").value.trim();
  if (!val) return;
  tasks.push({ text: val, done: false });
  document.getElementById("task-input").value = "";
  saveTasks();
});
document.getElementById("clear-tasks").addEventListener("click", () => {
  tasks = [];
  saveTasks();
});
function updateTaskProgress() {
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const percent = total ? (done / total) * 100 : 0;
  document.getElementById("task-progress").value = percent;
  document.getElementById("week-tasks").textContent = "Tasks Done: " + done;
}
renderTasks();

/* ---------- SYLLABUS ---------- */
function renderSubjects() {
  const container = document.getElementById("subjects");
  container.innerHTML = "";
  for (let sub in subjects) {
    const div = document.createElement("div");
    div.className = "box";
    div.innerHTML = `<h3>${sub}</h3>
      <input type="text" placeholder="Add Chapter" data-subject="${sub}" class="chapter-input">
      <button data-subject="${sub}" class="add-chapter">Add</button>
      <div class="chapters"></div>`;
    const chaptersDiv = div.querySelector(".chapters");
    subjects[sub].forEach((ch, i) => {
      const chDiv = document.createElement("div");
      chDiv.innerHTML = `<strong>${ch.name}</strong>
        <label><input type="checkbox" ${ch.lecture ? "checked" : ""}> Lecture</label>
        <label><input type="checkbox" ${ch.notes ? "checked" : ""}> Notes</label>
        <label><input type="checkbox" ${ch.questions ? "checked" : ""}> Questions</label>
        <label><input type="checkbox" ${ch.revision ? "checked" : ""}> Revision</label>`;
      const checks = chDiv.querySelectorAll("input");
      checks[0].addEventListener("change", e => { ch.lecture = e.target.checked; saveSubjects(); });
      checks[1].addEventListener("change", e => { ch.notes = e.target.checked; saveSubjects(); });
      checks[2].addEventListener("change", e => { ch.questions = e.target.checked; saveSubjects(); });
      checks[3].addEventListener("change", e => { ch.revision = e.target.checked; saveSubjects(); });
      chaptersDiv.appendChild(chDiv);
    });
    container.appendChild(div);
  }
}
function saveSubjects() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  renderSubjects();
}
document.getElementById("add-subject").addEventListener("click", () => {
  const val = document.getElementById("subject-input").value.trim();
  if (!val) return;
  subjects[val] = [];
  document.getElementById("subject-input").value = "";
  saveSubjects();
});
document.getElementById("subjects").addEventListener("click", e => {
  if (e.target.classList.contains("add-chapter")) {
    const sub = e.target.dataset.subject;
    const input = e.target.parentElement.querySelector(".chapter-input");
    if (input.value.trim()) {
      subjects[sub].push({
        name: input.value.trim(),
        lecture: false,
        notes: false,
        questions: false,
        revision: false
      });
      input.value = "";
      saveSubjects();
    }
  }
});
renderSubjects();

/* ---------- JOURNAL ---------- */
document.getElementById("unlock-journal").addEventListener("click", () => {
  const pwd = document.getElementById("journal-password").value;
  if (pwd === "jai bhavani") {
    document.getElementById("journal").classList.remove("hidden");
  } else {
    alert("Wrong password!");
  }
});
function renderJournal() {
  const container = document.getElementById("journal-entries");
  container.innerHTML = "";
  journalEntries.forEach(e => {
    const div = document.createElement("div");
    div.className = "box";
    div.textContent = `${e.date}: ${e.text}`;
    container.appendChild(div);
  });
}
document.getElementById("save-journal").addEventListener("click", () => {
  const text = document.getElementById("journal-entry").value.trim();
  if (!text) return;
  const entry = { date: new Date().toLocaleDateString(), text };
  journalEntries.push(entry);
  localStorage.setItem("journal", JSON.stringify(journalEntries));
  document.getElementById("journal-entry").value = "";
  renderJournal();
});
renderJournal();

/* ---------- IDEAS ---------- */
function renderIdeas() {
  const container = document.getElementById("ideas");
  container.innerHTML = "";
  ideas.forEach(e => {
    const div = document.createElement("div");
    div.className = "box";
    div.textContent = `${e.date}: ${e.text}`;
    container.appendChild(div);
  });
}
document.getElementById("save-idea").addEventListener("click", () => {
  const text = document.getElementById("idea-input").value.trim();
  if (!text) return;
  ideas.push({ date: new Date().toLocaleDateString(), text });
  localStorage.setItem("ideas", JSON.stringify(ideas));
  document.getElementById("idea-input").value = "";
  renderIdeas();
});
renderIdeas();

/* ---------- TIMER ---------- */
let timer, timerSeconds = 0, currentSubject = "";
function updateTimerDisplay() {
  let m = Math.floor(timerSeconds / 60).toString().padStart(2, "0");
  let s = (timerSeconds % 60).toString().padStart(2, "0");
  document.getElementById("timer-display").textContent = `${m}:${s}`;
  document.getElementById("timer-status").textContent = `${m}:${s}`;
}
document.getElementById("start-timer").addEventListener("click", () => {
  if (timer) return;
  const mins = parseInt(document.getElementById("timer-minutes").value);
  currentSubject = document.getElementById("timer-subject").value || "General";
  timerSeconds = mins * 60;
  updateTimerDisplay();
  timer = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timer);
      timer = null;
      logStudySession(mins, currentSubject);
      alert("Pomodoro finished!");
    }
  }, 1000);
});
document.getElementById("reset-timer").addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  timerSeconds = parseInt(document.getElementById("timer-minutes").value) * 60;
  updateTimerDisplay();
});
function logStudySession(mins, subject) {
  const today = new Date().toLocaleDateString();
  studyLogs.push({ date: today, subject, minutes: mins });
  localStorage.setItem("studyLogs", JSON.stringify(studyLogs));
  updateStreak();
  updateCharts();
}

/* ---------- STREAK ---------- */
function updateStreak() {
  const today = new Date().toLocaleDateString();
  if (streak.lastUsed !== today) {
    if (new Date(streak.lastUsed).getDate() === new Date().getDate() - 1) {
      streak.current++;
    } else {
      streak.current = 1;
    }
    if (streak.current > streak.longest) streak.longest = streak.current;
    streak.lastUsed = today;
    localStorage.setItem("streak", JSON.stringify(streak));
  }
  document.getElementById("current-streak").textContent = "Current Streak: " + streak.current;
  document.getElementById("longest-streak").textContent = "Longest Streak: " + streak.longest;
}
updateStreak();

/* ---------- CHARTS ---------- */
let dailyChart, subjectChart;
function updateCharts() {
  // Aggregate studyLogs
  const dailyData = {};
  const subjectData = {};
  studyLogs.forEach(l => {
    dailyData[l.date] = (dailyData[l.date] || 0) + l.minutes;
    subjectData[l.subject] = (subjectData[l.subject] || 0) + l.minutes;
  });
  const dailyLabels = Object.keys(dailyData);
  const dailyMinutes = Object.values(dailyData);
  const subjectLabels = Object.keys(subjectData);
  const subjectMinutes = Object.values(subjectData);

  // Daily Hours Chart
  const ctx1 = document.getElementById("dailyHoursChart").getContext("2d");
  if (dailyChart) dailyChart.destroy();
  dailyChart = new Chart(ctx1, {
    type: "bar",
    data: { labels: dailyLabels, datasets: [{ label: "Minutes", data: dailyMinutes, backgroundColor: "#007acc" }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  // Subject Progress Chart
  const ctx2 = document.getElementById("subjectProgressChart").getContext("2d");
  if (subjectChart) subjectChart.destroy();
  subjectChart = new Chart(ctx2, {
    type: "pie",
    data: { labels: subjectLabels, datasets: [{ data: subjectMinutes, backgroundColor: ["#005f99","#3399ff","#66b3ff","#99ccff","#cce7ff"] }] },
    options: { responsive: true }
  });

  // Update Week & Month Stats
  const totalMinutes = dailyMinutes.reduce((a,b)=>a+b,0);
  document.getElementById("week-hours").textContent = "Study Hours: " + (totalMinutes/60).toFixed(1);
  document.getElementById("monthly-hours").textContent = "Study Hours: " + (totalMinutes/60).toFixed(1) + "/120";
  document.getElementById("monthly-tasks").textContent = "Tasks Completed: " + tasks.filter(t=>t.done).length + "/100";
  document.getElementById("monthly-consistency").textContent = "Consistency: " + streak.current + "/30";
}
updateCharts();
