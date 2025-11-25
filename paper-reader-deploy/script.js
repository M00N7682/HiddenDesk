const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score');
const healthDisplay = document.getElementById('health');
const finalScoreEl = document.getElementById('final-score');
const stealthOverlay = document.getElementById('stealth-overlay');

// Canvas Size
canvas.width = 600;
canvas.height = 850;

// Game State
let isPlaying = false;
let isStealth = false;
let score = 0;
let health = 10.0; // Impact Factor
let speed = 2;
let gameLoopId;
let lastTime = 0;

// Player (Highlighter)
const player = {
    x: canvas.width / 2 - 50,
    y: 700,
    width: 100,
    height: 20,
    color: 'rgba(255, 255, 0, 0.5)', // Yellow highlighter
    speed: 300 // px per second
};

// Input
const keys = {
    ArrowLeft: false,
    ArrowRight: false
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') toggleStealth();
    if (e.code === 'Space' && !isPlaying && startScreen.classList.contains('overlay')) {
        startGame();
    }
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

restartBtn.addEventListener('click', startGame);

function toggleStealth() {
    isStealth = !isStealth;
    if (isStealth) {
        stealthOverlay.classList.remove('hidden');
        if (isPlaying) cancelAnimationFrame(gameLoopId);
    } else {
        stealthOverlay.classList.add('hidden');
        if (isPlaying) {
            lastTime = performance.now();
            gameLoop(lastTime);
        }
    }
}

// Content Generation
const lorem = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum";
const words = lorem.split(' ');

let lines = [];
const LINE_HEIGHT = 30;
const FONT_SIZE = 16;

function initLines() {
    lines = [];
    for (let y = 0; y < canvas.height + LINE_HEIGHT; y += LINE_HEIGHT) {
        generateLine(y);
    }
}

function generateLine(y) {
    let x = 40; // Left margin
    let lineWords = [];
    
    while (x < canvas.width - 40) {
        let text = words[Math.floor(Math.random() * words.length)];
        let width = ctx.measureText(text).width + 10;
        
        if (x + width > canvas.width - 40) break;

        let type = 'normal';
        // 10% chance for special word
        if (Math.random() < 0.1) {
            if (Math.random() < 0.5) {
                type = 'good'; // Keyword
                text = ['KEYWORD', 'DATA', 'RESULT', 'NOVEL', 'PROVEN'][Math.floor(Math.random() * 5)];
            } else {
                type = 'bad'; // Typo
                text = ['TYPO', 'ERROR', 'FAIL', 'WRONG', 'FALSE'][Math.floor(Math.random() * 5)];
            }
        }

        lineWords.push({
            text: text,
            x: x,
            width: width - 10, // Actual text width
            type: type,
            active: true
        });
        
        x += width;
    }

    lines.push({
        y: y,
        words: lineWords
    });
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isPlaying = true;
    score = 0;
    health = 10.0;
    speed = 2;
    
    updateUI();
    initLines();
    
    lastTime = performance.now();
    gameLoop(lastTime);
}

function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameLoopId);
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function update(dt) {
    if (isStealth) return;

    // Move Player
    if (keys.ArrowLeft && player.x > 40) player.x -= player.speed * dt;
    if (keys.ArrowRight && player.x + player.width < canvas.width - 40) player.x += player.speed * dt;

    // Scroll Lines
    for (let i = 0; i < lines.length; i++) {
        lines[i].y -= speed;
    }

    // Remove off-screen lines and add new ones
    if (lines[0].y < -LINE_HEIGHT) {
        lines.shift();
        generateLine(lines[lines.length - 1].y + LINE_HEIGHT);
        score += 1; // Survival points
        speed += 0.001; // Slowly increase speed
    }

    // Collision Detection
    // Check lines near player
    lines.forEach(line => {
        if (line.y > player.y - LINE_HEIGHT && line.y < player.y + player.height) {
            line.words.forEach(word => {
                if (!word.active) return;
                
                // Simple AABB collision
                if (player.x < word.x + word.width &&
                    player.x + player.width > word.x) {
                    
                    if (word.type === 'good') {
                        score += 50;
                        word.active = false; // Collected
                        // Visual feedback could go here
                    } else if (word.type === 'bad') {
                        health -= 1.0;
                        word.active = false; // Hit
                        if (health <= 0) gameOver();
                    }
                }
            });
        }
    });

    updateUI();
}

function draw() {
    // Clear
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Text
    ctx.font = `${FONT_SIZE}px "Times New Roman"`;
    ctx.textBaseline = 'top';

    lines.forEach(line => {
        line.words.forEach(word => {
            if (!word.active && word.type !== 'normal') return; // Don't draw collected items

            if (word.type === 'good') {
                ctx.fillStyle = '#000';
                ctx.font = `bold ${FONT_SIZE}px "Times New Roman"`;
            } else if (word.type === 'bad') {
                ctx.fillStyle = '#c00000'; // Red for typos
                ctx.font = `${FONT_SIZE}px "Times New Roman"`;
            } else {
                ctx.fillStyle = '#333';
                ctx.font = `${FONT_SIZE}px "Times New Roman"`;
            }
            
            ctx.fillText(word.text, word.x, line.y);
        });
    });

    // Draw Player (Highlighter)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function updateUI() {
    scoreDisplay.innerText = score;
    healthDisplay.innerText = health.toFixed(1);
}

function gameLoop(timestamp) {
    if (!isPlaying) return;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    update(dt);
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Initial render
ctx.font = `${FONT_SIZE}px "Times New Roman"`;
initLines();
draw();
