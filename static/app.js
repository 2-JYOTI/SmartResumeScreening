const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const storedTheme = localStorage.getItem("smart-resume-theme");

if (storedTheme) {
    root.dataset.theme = storedTheme;
}

themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    localStorage.setItem("smart-resume-theme", nextTheme);
});

const textarea = document.querySelector("[data-job-textarea]");
const counter = document.querySelector("[data-char-counter]");

const updateCounter = () => {
    if (!textarea || !counter) return;
    const count = textarea.value.length;
    counter.textContent = `${count.toLocaleString()} character${count === 1 ? "" : "s"}`;
};

textarea?.addEventListener("input", updateCounter);
updateCounter();

const dropZone = document.querySelector("[data-drop-zone]");
const fileInput = document.querySelector("[data-file-input]");
const fileName = document.querySelector("[data-file-name]");

const setFileName = () => {
    if (!fileInput?.files?.length || !fileName) return;
    fileName.textContent = fileInput.files[0].name;
};

["dragenter", "dragover"].forEach((eventName) => {
    dropZone?.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.add("is-dragging");
    });
});

["dragleave", "drop"].forEach((eventName) => {
    dropZone?.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.remove("is-dragging");
    });
});

dropZone?.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer.files;
    if (!file || !fileInput) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.files = transfer.files;
    setFileName();
});

fileInput?.addEventListener("change", setFileName);

const form = document.querySelector("#analysis-form");
const submitButton = document.querySelector("[data-submit-button]");
const processingPanel = document.querySelector("[data-processing-panel]");
const progressMessage = document.querySelector("[data-progress-message]");
const messages = ["Analyzing Resume...", "Extracting Skills...", "Calculating Match Score..."];

form?.addEventListener("submit", () => {
    document.body.classList.add("is-processing");
    submitButton?.classList.add("is-loading");
    submitButton?.setAttribute("aria-busy", "true");

    if (processingPanel) {
        processingPanel.hidden = false;
    }

    let index = 0;
    if (progressMessage) {
        progressMessage.textContent = messages[index];
        window.setInterval(() => {
            index = (index + 1) % messages.length;
            progressMessage.textContent = messages[index];
        }, 1200);
    }
});

const scoreCounter = document.querySelector("[data-score-counter]");

if (scoreCounter) {
    const target = Number(scoreCounter.textContent) || 0;
    const duration = 900;
    const startedAt = performance.now();

    const animateScore = (timestamp) => {
        const progress = Math.min((timestamp - startedAt) / duration, 1);
        const value = target * progress;
        scoreCounter.textContent = value.toFixed(target % 1 === 0 ? 0 : 2);

        if (progress < 1) {
            requestAnimationFrame(animateScore);
        } else {
            scoreCounter.textContent = target.toFixed(target % 1 === 0 ? 0 : 2);
        }
    };

    requestAnimationFrame(animateScore);
}

document.querySelector("[data-download-report]")?.addEventListener("click", () => {
    window.print();
});

const historyList = document.querySelector("[data-history-list]");
const result = window.resumeAnalysisResult;

if (historyList && result) {
    const historyKey = "smart-resume-history";
    const existingHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
    const entry = {
        score: result.score,
        resumeSkills: result.resumeSkills,
        missingSkills: result.missingSkills,
        createdAt: new Date().toLocaleString()
    };

    const updatedHistory = [entry, ...existingHistory].slice(0, 5);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

    historyList.innerHTML = updatedHistory.map((item) => `
        <div class="history-item">
            <div>
                <strong>${Number(item.score).toFixed(2)}% match</strong>
                <span>${item.createdAt}</span>
            </div>
            <span>${item.resumeSkills} skills found · ${item.missingSkills} missing</span>
        </div>
    `).join("");
}
