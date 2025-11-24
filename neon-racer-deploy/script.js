const canvas = document.getElementById('game-canvas');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const hud = document.getElementById('hud');
const stealthScreen = document.getElementById('stealth-screen');
const logOutput = document.getElementById('log-output');

// Game Config
const ROAD_WIDTH = 20;
const ROAD_HEIGHT = 25;
const FPS = 15; // Low FPS for retro feel
const PLAYER_CHAR = 'A';
const OBSTACLE_CHAR = '#';
const ROAD_CHAR = '.';
const BORDER_CHAR = '|';

let gameLoop;
let score = 0;
let playerX = Math.floor(ROAD_WIDTH / 2);
let road = [];
let isPlaying = false;
let isStealthMode = false;
let stealthInterval;

// Initialize Road
function initRoad() {
    road = [];
    for (let y = 0; y < ROAD_HEIGHT; y++) {
        let row = [];
        for (let x = 0; x < ROAD_WIDTH; x++) {
            row.push(ROAD_CHAR);
        }
        road.push(row);
    }
}

// Input Handling
document.addEventListener('keydown', (e) => {
    if (isStealthMode) {
        if (e.key === 'Escape') {
            toggleStealth();
        }
        return;
    }

    if (!isPlaying) {
        if (e.key === 'Enter') {
            if (gameOverScreen.classList.contains('hidden')) {
                startGame();
            } else {
                resetGame();
            }
        }
        return;
    }

    switch (e.key) {
        case 'ArrowLeft':
            if (playerX > 0) playerX--;
            break;
        case 'ArrowRight':
            if (playerX < ROAD_WIDTH - 1) playerX++;
            break;
        case 'Escape':
            toggleStealth();
            break;
    }
});

function startGame() {
    startScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    canvas.classList.remove('hidden');
    isPlaying = true;
    score = 0;
    playerX = Math.floor(ROAD_WIDTH / 2);
    initRoad();
    gameLoop = setInterval(update, 1000 / FPS);
}

function resetGame() {
    gameOverScreen.classList.add('hidden');
    startGame();
}

function gameOver() {
    isPlaying = false;
    clearInterval(gameLoop);
    canvas.classList.add('hidden');
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.innerText = score;
}

function update() {
    // Move Road (Scroll)
    road.pop(); // Remove last row
    
    // Generate new row
    let newRow = [];
    for (let x = 0; x < ROAD_WIDTH; x++) {
        newRow.push(ROAD_CHAR);
    }

    // Add Obstacles
    if (Math.random() < 0.3) { // 30% chance of obstacle per row
        let obstacleX = Math.floor(Math.random() * ROAD_WIDTH);
        newRow[obstacleX] = OBSTACLE_CHAR;
    }

    road.unshift(newRow); // Add to top

    // Collision Detection
    // The player is visually at the bottom, which is index ROAD_HEIGHT - 1
    // But we just popped the bottom row.
    // Actually, let's render the player at a fixed Y position, say ROAD_HEIGHT - 2
    const playerY = ROAD_HEIGHT - 2;
    
    if (road[playerY][playerX] === OBSTACLE_CHAR) {
        gameOver();
        return;
    }

    score++;
    scoreElement.innerText = score;
    render();
}

function render() {
    let output = '';
    for (let y = 0; y < ROAD_HEIGHT; y++) {
        output += BORDER_CHAR + ' ';
        for (let x = 0; x < ROAD_WIDTH; x++) {
            if (y === ROAD_HEIGHT - 2 && x === playerX) {
                output += PLAYER_CHAR;
            } else {
                output += road[y][x];
            }
            output += ' '; // Spacing
        }
        output += BORDER_CHAR + '\n';
    }
    canvas.innerText = output;
}

// Stealth Mode Logic
const fakeLogs = [
    "INFO: scanning ports...",
    "DEBUG: packet id 0x4F3A received",
    "WARN: latency spike detected on node 4",
    "INFO: synchronizing database...",
    "TRACE: /usr/bin/sys_diag --verbose",
    "Checking integrity of file system...",
    "Downloading update: 45%",
    "Downloading update: 78%",
    "Update complete.",
    "Restarting service daemon...",
    "Service status: ACTIVE",
    "Ping: 12ms",
    "Ping: 14ms",
    "Ping: 11ms"
];

function toggleStealth() {
    isStealthMode = !isStealthMode;
    if (isStealthMode) {
        clearInterval(gameLoop);
        stealthScreen.classList.remove('hidden');
        stealthInterval = setInterval(addFakeLog, 200);
    } else {
        stealthScreen.classList.add('hidden');
        clearInterval(stealthInterval);
        logOutput.innerText = ""; // Clear logs
        if (isPlaying) {
            gameLoop = setInterval(update, 1000 / FPS);
        }
    }
}

function addFakeLog() {
    const log = fakeLogs[Math.floor(Math.random() * fakeLogs.length)];
    const timestamp = new Date().toISOString();
    logOutput.innerText += `[${timestamp}] ${log}\n`;
    
    // Auto scroll
    if (logOutput.innerText.length > 2000) {
        logOutput.innerText = logOutput.innerText.substring(500);
    }
}

// Initial Render
initRoad();
render();
