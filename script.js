/* --- DATA GAME (KATA-KATA) --- */
// Kata-kata dikelompokkan berdasarkan panjang/kesulitan
const words = [
    "apel", "buku", "bola", "kue", "topi", "jam", "tas",
    "kursi", "meja", "lampu", "pintu", "kasur", "rumah", "mobil",
    "laptop", "kertas", "pensil", "sepatu", "dompet", "kamera",
    "bantal", "cermin", "jendela", "sepeda", "balon",
    "televisi", "komputer", "internet", "program", "belajar",
    "semangat", "matahari", "pesawat", "pelangi", "sahabat",
    "indonesia", "nusantara", "teknologi", "kesehatan", "pendidikan"
];

/* --- VARIABEL STATE --- */
let currentWord = "";
let scrambledWord = "";
let score = 0;
let level = 1;
let timeLeft = 30; // Detik awal
let maxTime = 30;
let timerInterval;
let combo = 0;
let isPlaying = false;

/* --- ELEMEN DOM --- */
const wordDisplay = document.getElementById("scrambled-word");
const inputField = document.getElementById("user-input");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const highScoreDisplay = document.getElementById("high-score");
const timerBar = document.getElementById("timer-bar");
const messageDisplay = document.getElementById("message");
const checkBtn = document.getElementById("check-btn");
const refreshBtn = document.getElementById("refresh-word");
const comboDisplay = document.getElementById("combo-display");
const modal = document.getElementById("game-over-modal");
const finalScoreDisplay = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");

/* --- SISTEM START --- */
function init() {
    // Load High Score dari LocalStorage
    const savedScore = localStorage.getItem("candyWordHighScore");
    if (savedScore) {
        highScoreDisplay.innerText = savedScore;
    }

    resetGame();
    setupEvents();
}

function resetGame() {
    score = 0;
    level = 1;
    combo = 0;
    timeLeft = 30;
    maxTime = 30;
    isPlaying = true;
    
    scoreDisplay.innerText = score;
    levelDisplay.innerText = level;
    updateComboDisplay();
    modal.classList.add("hidden");
    inputField.value = "";
    inputField.focus();
    messageDisplay.innerText = "";
    
    startTimer();
    nextLevel();
}

/* --- LOGIKA GAMEPLAY --- */
function nextLevel() {
    // Pilih kata acak
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];
    scrambledWord = shuffleWord(currentWord);
    
    // Pastikan hasil acak tidak sama dengan kata asli
    while (scrambledWord === currentWord) {
        scrambledWord = shuffleWord(currentWord);
    }

    // Render ke layar
    wordDisplay.innerText = scrambledWord;
    wordDisplay.classList.remove("correct-anim");
}

function shuffleWord(word) {
    let arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
}

function checkAnswer() {
    if (!isPlaying) return;

    let userGuess = inputField.value.toLowerCase().trim();

    if (userGuess === currentWord) {
        // JAWABAN BENAR
        handleSuccess();
    } else {
        // JAWABAN SALAH
        handleFail();
    }
}

function handleSuccess() {
    // 1. Hitung Skor
    combo++;
    let basePoints = 10;
    let comboBonus = (combo > 1) ? (combo * 5) : 0;
    score += basePoints + comboBonus;

    // 2. Tambah Level & Waktu Sedikit (Reward)
    if (score % 50 === 0) {
        level++;
        timeLeft += 5; // Bonus waktu saat naik level
        triggerConfetti();
    }
    timeLeft += 2; // Bonus waktu setiap benar
    if (timeLeft > maxTime) timeLeft = maxTime;

    // 3. Update UI
    scoreDisplay.innerText = score;
    levelDisplay.innerText = level;
    messageDisplay.innerText = "HEBAT! 🎉";
    messageDisplay.style.color = "#2ed573";
    wordDisplay.classList.add("correct-anim");
    updateComboDisplay();

    // 4. Reset Input & Kata Baru
    inputField.value = "";
    setTimeout(() => {
        messageDisplay.innerText = "";
        nextLevel();
    }, 500);
}

function handleFail() {
    // Reset Combo
    combo = 0;
    updateComboDisplay();
    
    // Animasi Shake
    inputField.classList.add("shake-anim");
    messageDisplay.innerText = "COBA LAGI! ❌";
    messageDisplay.style.color = "#ff4757";
    
    setTimeout(() => {
        inputField.classList.remove("shake-anim");
        messageDisplay.innerText = "";
    }, 400);
}

function updateComboDisplay() {
    if (combo > 1) {
        comboDisplay.innerText = `COMBO x${combo} 🔥`;
        comboDisplay.classList.remove("combo-hidden");
        comboDisplay.classList.add("combo-visible");
    } else {
        comboDisplay.classList.add("combo-hidden");
        comboDisplay.classList.remove("combo-visible");
    }
}

/* --- TIMER SYSTEM --- */
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            let percentage = (timeLeft / maxTime) * 100;
            timerBar.style.width = percentage + "%";
            
            // Ubah warna timer jika mau habis
            if (percentage < 20) {
                timerBar.style.backgroundColor = "red";
            } else {
                timerBar.style.backgroundColor = "#ff4757";
            }
        } else {
            gameOver();
        }
    }, 1000);
}

function gameOver() {
    isPlaying = false;
    clearInterval(timerInterval);
    
    // Cek High Score
    let currentHigh = localStorage.getItem("candyWordHighScore") || 0;
    if (score > currentHigh) {
        localStorage.setItem("candyWordHighScore", score);
        highScoreDisplay.innerText = score;
    }

    finalScoreDisplay.innerText = score;
    modal.classList.remove("hidden");
}

/* --- EVENT LISTENERS --- */
function setupEvents() {
    // Submit saat tekan Enter
    inputField.addEventListener("keyup", (e) => {
        if (e.key === "Enter") checkAnswer();
    });

    // Tombol Tebak
    checkBtn.addEventListener("click", checkAnswer);

    // Tombol Refresh Kata (Tidak ada penalti, cuma visual)
    refreshBtn.addEventListener("click", () => {
        // Animasi putar
        refreshBtn.style.transform = "rotate(360deg)";
        setTimeout(() => refreshBtn.style.transform = "rotate(0deg)", 300);
        
        // Acak ulang kata yang sama
        scrambledWord = shuffleWord(currentWord);
        wordDisplay.innerText = scrambledWord;
        inputField.focus();
    });

    // Tombol Restart
    restartBtn.addEventListener("click", resetGame);
}

/* --- VISUAL EFFECTS (CONFETTI SEDERHANA) --- */
function triggerConfetti() {
    for (let i = 0; i < 30; i++) {
        let conf = document.createElement("div");
        conf.classList.add("confetti");
        document.body.appendChild(conf);
        
        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;
        
        conf.style.left = x + "px";
        conf.style.top = y + "px";
        conf.style.backgroundColor = ["#ff4757", "#2ed573", "#ffa502", "#3742fa"][Math.floor(Math.random() * 4)];
        
        // Animasi jatuh simple
        let animDuration = Math.random() * 2 + 1;
        conf.style.transition = `top ${animDuration}s ease-out, opacity ${animDuration}s`;
        
        setTimeout(() => {
            conf.style.top = (y + 200) + "px";
            conf.style.opacity = 0;
        }, 10);
        
        setTimeout(() => {
            conf.remove();
        }, animDuration * 1000);
    }
}

// Jalankan Game
init();