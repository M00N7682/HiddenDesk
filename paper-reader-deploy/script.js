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

// Game Config
const GRID_SIZE = 25;
const COLS = Math.floor(canvas.width / GRID_SIZE);
const ROWS = Math.floor(canvas.height / GRID_SIZE);

// Game State
let isPlaying = false;
let isStealth = false;
let score = 0;
let gameLoopId;
let lastTime = 0;
let moveInterval = 150;
let timeSinceLastMove = 0;

// Game Mode
let gameMode = 'classic'; // classic, timeattack, zen
let timeRemaining = 60; // For time attack mode
let timerInterval = null;

// Snake State
let snake = [];
let obstacles = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = null;
let foodsEaten = 0;

// Power-ups
let powerUp = null;
let activeEffects = {
    shield: false,
    slow: false,
    double: false
};
let effectTimers = {};

// Academic Keywords (학술 테마)
const academicKeywords = [
    // Research Terms
    "Abstract", "Methodology", "Hypothesis", "Analysis", "Results",
    "Discussion", "Conclusion", "References", "Citation", "Bibliography",
    // Statistical Terms
    "p-value", "σ=0.05", "n=100", "R²=0.87", "μ±σ",
    "95%CI", "ANOVA", "t-test", "χ²", "regression",
    // Science Terms
    "quantum", "entropy", "algorithm", "neural", "genome",
    "protein", "synthesis", "catalyst", "equation", "theorem",
    // Academic Phrases
    "et al.", "Fig.1", "Table 2", "Eq.(3)", "[1-5]",
    "viz.", "i.e.", "e.g.", "cf.", "ibid.",
    // Subject Terms
    "empirical", "theoretical", "qualitative", "quantitative", "paradigm",
    "framework", "variable", "correlation", "significance", "deviation"
];

let backgroundText = [];

// Power-up Types
const POWERUP_TYPES = {
    SHIELD: { color: '#4FC3F7', symbol: '🛡', name: 'Shield' },
    SLOW: { color: '#81C784', symbol: '⏱', name: 'Slow-mo' },
    DOUBLE: { color: '#FFD54F', symbol: '×2', name: '2x Points' },
    SHRINK: { color: '#F48FB1', symbol: '↓', name: 'Shrink' }
};

// Input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') toggleStealth();
    if (e.code === 'Space' && !isPlaying && startScreen.classList.contains('overlay')) {
        // Check if mode selection is visible
        return;
    }

    if (!isPlaying) return;

    switch(e.code) {
        case 'ArrowUp':
        case 'KeyW':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            break;
    }
});

restartBtn.addEventListener('click', () => showModeSelect());

function toggleStealth() {
    isStealth = !isStealth;
    if (isStealth) {
        stealthOverlay.classList.remove('hidden');
        if (isPlaying) {
            cancelAnimationFrame(gameLoopId);
            if (timerInterval) clearInterval(timerInterval);
        }
    } else {
        stealthOverlay.classList.add('hidden');
        if (isPlaying) {
            lastTime = performance.now();
            gameLoop(lastTime);
            if (gameMode === 'timeattack') startTimer();
        }
    }
}

function initBackground() {
    backgroundText = [];
    let y = GRID_SIZE;
    while (y < canvas.height) {
        let x = GRID_SIZE;
        while (x < canvas.width - GRID_SIZE) {
            let text = academicKeywords[Math.floor(Math.random() * academicKeywords.length)];
            ctx.font = '14px "Times New Roman"';
            let width = ctx.measureText(text).width + 15;
            if (x + width > canvas.width - GRID_SIZE) break;

            backgroundText.push({
                text: text,
                x: x,
                y: y,
                isHighlight: Math.random() < 0.1 // 10% chance to be "important"
            });
            x += width;
        }
        y += GRID_SIZE;
    }
}

function isOccupied(x, y) {
    for (let segment of snake) {
        if (segment.x === x && segment.y === y) return true;
    }
    for (let obs of obstacles) {
        if (obs.x === x && obs.y === y) return true;
    }
    if (food && food.x === x && food.y === y) return true;
    if (powerUp && powerUp.x === x && powerUp.y === y) return true;

    return false;
}

function spawnFood() {
    let valid = false;
    let attempts = 0;

    while (!valid && attempts < 100) {
        let x = Math.floor(Math.random() * (COLS - 2)) + 1;
        let y = Math.floor(Math.random() * (ROWS - 2)) + 1;

        if (!isOccupied(x, y)) {
            // Determine food type based on mode
            let value = 10;
            let type = 'normal';

            if (Math.random() < 0.15) {
                // Bonus food
                type = 'bonus';
                value = 25;
            }

            food = { x, y, type, value };
            valid = true;
        }
        attempts++;
    }

    if (!valid) {
        for (let y = 1; y < ROWS - 1; y++) {
            for (let x = 1; x < COLS - 1; x++) {
                if (!isOccupied(x, y)) {
                    food = { x, y, type: 'normal', value: 10 };
                    return;
                }
            }
        }
    }
}

function spawnPowerUp() {
    if (powerUp) return; // Only one at a time
    if (Math.random() > 0.3) return; // 30% chance when called

    let valid = false;
    let attempts = 0;

    const types = Object.keys(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];

    while (!valid && attempts < 50) {
        let x = Math.floor(Math.random() * (COLS - 4)) + 2;
        let y = Math.floor(Math.random() * (ROWS - 4)) + 2;

        const head = snake[0];
        const dist = Math.abs(head.x - x) + Math.abs(head.y - y);

        if (!isOccupied(x, y) && dist > 3) {
            powerUp = { x, y, type, timer: 10 }; // Disappears after 10 moves
            valid = true;
        }
        attempts++;
    }
}

function spawnObstacle() {
    if (gameMode === 'zen') return; // No obstacles in zen mode

    let valid = false;
    let attempts = 0;

    while (!valid && attempts < 50) {
        let x = Math.floor(Math.random() * (COLS - 2)) + 1;
        let y = Math.floor(Math.random() * (ROWS - 2)) + 1;

        const head = snake[0];
        const dist = Math.abs(head.x - x) + Math.abs(head.y - y);

        if (!isOccupied(x, y) && dist > 5) {
            obstacles.push({ x, y });
            valid = true;
        }
        attempts++;
    }
}

function showModeSelect() {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

function startGame(mode = 'classic') {
    gameMode = mode;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isPlaying = true;
    score = 0;
    moveInterval = 150;
    foodsEaten = 0;
    timeRemaining = 60;

    // Clear effects
    activeEffects = { shield: false, slow: false, double: false };
    Object.keys(effectTimers).forEach(key => clearTimeout(effectTimers[key]));
    effectTimers = {};
    powerUp = null;

    // Init Snake
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    obstacles = [];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    // Mode-specific settings
    if (gameMode === 'timeattack') {
        moveInterval = 100; // Faster
        startTimer();
    } else if (gameMode === 'zen') {
        moveInterval = 180; // Slower, relaxing
    }

    initBackground();
    spawnFood();
    updateUI();

    lastTime = performance.now();
    gameLoop(lastTime);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPlaying || isStealth) return;
        timeRemaining--;
        updateUI();
        if (timeRemaining <= 0) {
            gameOver();
        }
    }, 1000);
}

function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameLoopId);
    if (timerInterval) clearInterval(timerInterval);

    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function applyPowerUp(type) {
    const duration = 8000; // 8 seconds

    switch(type) {
        case 'SHIELD':
            activeEffects.shield = true;
            if (effectTimers.shield) clearTimeout(effectTimers.shield);
            effectTimers.shield = setTimeout(() => {
                activeEffects.shield = false;
            }, duration);
            break;

        case 'SLOW':
            activeEffects.slow = true;
            moveInterval = Math.min(200, moveInterval + 50);
            if (effectTimers.slow) clearTimeout(effectTimers.slow);
            effectTimers.slow = setTimeout(() => {
                activeEffects.slow = false;
                moveInterval = Math.max(50, moveInterval - 50);
            }, duration);
            break;

        case 'DOUBLE':
            activeEffects.double = true;
            if (effectTimers.double) clearTimeout(effectTimers.double);
            effectTimers.double = setTimeout(() => {
                activeEffects.double = false;
            }, duration);
            break;

        case 'SHRINK':
            // Remove last 3 segments (but keep at least 3)
            const removeCount = Math.min(3, snake.length - 3);
            for (let i = 0; i < removeCount; i++) {
                snake.pop();
            }
            break;
    }
}

function update(timestamp) {
    if (isStealth) return;

    timeSinceLastMove += (timestamp - lastTime);
    lastTime = timestamp;

    if (timeSinceLastMove > moveInterval) {
        timeSinceLastMove = 0;
        move();
    }
}

function move() {
    direction = nextDirection;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Wall Collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        if (activeEffects.shield) {
            activeEffects.shield = false;
            // Wrap around instead
            if (head.x < 0) head.x = COLS - 1;
            if (head.x >= COLS) head.x = 0;
            if (head.y < 0) head.y = ROWS - 1;
            if (head.y >= ROWS) head.y = 0;
        } else {
            gameOver();
            return;
        }
    }

    // Self Collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            if (activeEffects.shield) {
                activeEffects.shield = false;
                return; // Skip this move
            }
            gameOver();
            return;
        }
    }

    // Obstacle Collision
    for (let obs of obstacles) {
        if (head.x === obs.x && head.y === obs.y) {
            if (activeEffects.shield) {
                activeEffects.shield = false;
                // Remove the obstacle
                obstacles = obstacles.filter(o => o !== obs);
            } else {
                gameOver();
                return;
            }
        }
    }

    snake.unshift(head);

    // Check Power-up
    if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        applyPowerUp(powerUp.type);
        powerUp = null;
    }

    // Update power-up timer
    if (powerUp) {
        powerUp.timer--;
        if (powerUp.timer <= 0) powerUp = null;
    }

    // Eat Food
    if (food && head.x === food.x && head.y === food.y) {
        let points = food.value;
        if (activeEffects.double) points *= 2;
        if (gameMode === 'timeattack') points = Math.floor(points * 1.5);

        score += points;
        foodsEaten++;

        // Speed up (except zen mode)
        if (gameMode !== 'zen') {
            moveInterval = Math.max(50, moveInterval - 1);
        }

        // Spawn obstacle every 3 foods (classic/timeattack only)
        if (foodsEaten % 3 === 0 && gameMode !== 'zen') {
            spawnObstacle();
        }

        // Chance to spawn power-up every 5 foods
        if (foodsEaten % 5 === 0) {
            spawnPowerUp();
        }

        spawnFood();
        updateUI();
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear with paper white
    ctx.fillStyle = '#FFFEF8'; // Slight cream for paper feel
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw margin line (academic paper style)
    ctx.strokeStyle = '#FFE4E4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, canvas.height);
    ctx.stroke();

    // Draw Background Text
    ctx.font = '14px "Times New Roman"';
    ctx.textBaseline = 'top';

    backgroundText.forEach(word => {
        if (word.isHighlight) {
            ctx.fillStyle = '#FFE066';
            ctx.fillRect(word.x - 2, word.y - 2, ctx.measureText(word.text).width + 4, 18);
        }
        ctx.fillStyle = '#444';
        ctx.fillText(word.text, word.x, word.y);
    });

    // Draw Obstacles (Red - "Typo" marks)
    obstacles.forEach(obs => {
        // Red underline style (like spelling error)
        ctx.fillStyle = 'rgba(220, 53, 69, 0.25)';
        ctx.fillRect(obs.x * GRID_SIZE, obs.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

        // Wavy underline
        ctx.strokeStyle = '#DC3545';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const baseY = (obs.y + 1) * GRID_SIZE - 3;
        for (let i = 0; i < GRID_SIZE; i += 4) {
            ctx.lineTo(obs.x * GRID_SIZE + i, baseY + (i % 8 < 4 ? 0 : 3));
        }
        ctx.stroke();
    });

    // Draw Power-up
    if (powerUp) {
        const pu = POWERUP_TYPES[powerUp.type];
        ctx.fillStyle = pu.color;
        ctx.beginPath();
        ctx.arc(
            powerUp.x * GRID_SIZE + GRID_SIZE/2,
            powerUp.y * GRID_SIZE + GRID_SIZE/2,
            GRID_SIZE/2 - 2,
            0, Math.PI * 2
        );
        ctx.fill();

        // Symbol
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            pu.symbol,
            powerUp.x * GRID_SIZE + GRID_SIZE/2,
            powerUp.y * GRID_SIZE + GRID_SIZE/2
        );
        ctx.textAlign = 'left';
    }

    // Draw Food (Blue highlight - "Selected text")
    if (food) {
        if (food.type === 'bonus') {
            ctx.fillStyle = 'rgba(255, 193, 7, 0.5)'; // Gold for bonus
            ctx.strokeStyle = '#FFA000';
        } else {
            ctx.fillStyle = 'rgba(25, 118, 210, 0.3)';
            ctx.strokeStyle = '#1976D2';
        }
        ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        ctx.lineWidth = 2;
        ctx.strokeRect(food.x * GRID_SIZE + 1, food.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    }

    // Draw Snake (Green highlight - "Reviewed text")
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head - darker green with border
            ctx.fillStyle = activeEffects.shield ? 'rgba(129, 199, 132, 0.9)' : 'rgba(76, 175, 80, 0.8)';
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

            // Head border
            ctx.strokeStyle = '#2E7D32';
            ctx.lineWidth = 3;
            ctx.strokeRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);

            // Direction indicator (eyes)
            ctx.fillStyle = '#1B5E20';
            const eyeOffset = 6;
            let eyeX1, eyeY1, eyeX2, eyeY2;

            if (direction.x === 1) {
                eyeX1 = segment.x * GRID_SIZE + GRID_SIZE - 8;
                eyeY1 = segment.y * GRID_SIZE + 6;
                eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - 8;
                eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - 10;
            } else if (direction.x === -1) {
                eyeX1 = segment.x * GRID_SIZE + 5;
                eyeY1 = segment.y * GRID_SIZE + 6;
                eyeX2 = segment.x * GRID_SIZE + 5;
                eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - 10;
            } else if (direction.y === -1) {
                eyeX1 = segment.x * GRID_SIZE + 6;
                eyeY1 = segment.y * GRID_SIZE + 5;
                eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - 10;
                eyeY2 = segment.y * GRID_SIZE + 5;
            } else {
                eyeX1 = segment.x * GRID_SIZE + 6;
                eyeY1 = segment.y * GRID_SIZE + GRID_SIZE - 8;
                eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - 10;
                eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - 8;
            }

            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, 3, 0, Math.PI * 2);
            ctx.arc(eyeX2, eyeY2, 3, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // Body - lighter green
            const alpha = 0.7 - (index * 0.02);
            ctx.fillStyle = `rgba(129, 199, 132, ${Math.max(0.3, alpha)})`;
            ctx.fillRect(segment.x * GRID_SIZE + 2, segment.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        }
    });

    // Draw active effects indicator
    let effectY = 10;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    if (activeEffects.shield) {
        ctx.fillStyle = POWERUP_TYPES.SHIELD.color;
        ctx.fillText('🛡 Shield Active', 10, effectY);
        effectY += 18;
    }
    if (activeEffects.slow) {
        ctx.fillStyle = POWERUP_TYPES.SLOW.color;
        ctx.fillText('⏱ Slow-mo Active', 10, effectY);
        effectY += 18;
    }
    if (activeEffects.double) {
        ctx.fillStyle = POWERUP_TYPES.DOUBLE.color;
        ctx.fillText('×2 Double Points', 10, effectY);
        effectY += 18;
    }

    // Draw mode indicator
    ctx.fillStyle = '#888';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    const modeText = gameMode === 'timeattack' ? `TIME: ${timeRemaining}s` :
                     gameMode === 'zen' ? 'ZEN MODE' : 'CLASSIC';
    ctx.fillText(modeText, canvas.width - 10, canvas.height - 10);
}

function updateUI() {
    scoreDisplay.innerText = score;
    healthDisplay.innerText = gameMode === 'timeattack' ? `${timeRemaining}s` : snake.length;
}

function gameLoop(timestamp) {
    if (!isPlaying) return;
    update(timestamp);
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Expose startGame for HTML buttons
window.startGame = startGame;

// Initial render
ctx.font = '14px "Times New Roman"';
initBackground();
draw();
