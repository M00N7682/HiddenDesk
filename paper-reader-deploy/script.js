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

// Game Config (Snake)
const GRID_SIZE = 25; // Matches line height roughly
const COLS = Math.floor(canvas.width / GRID_SIZE);
const ROWS = Math.floor(canvas.height / GRID_SIZE);

// Game State
let isPlaying = false;
let isStealth = false;
let score = 0;
let health = 10.0; // Not used in Snake but kept for UI compatibility
let gameLoopId;
let lastTime = 0;
let moveInterval = 150; // ms per move
let timeSinceLastMove = 0;

// Snake State
let snake = [];
let obstacles = []; // New: Obstacles (Typos)
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = null;
let foodsEaten = 0; // Track for difficulty

// Input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') toggleStealth();
    if (e.code === 'Space' && !isPlaying && startScreen.classList.contains('overlay')) {
        startGame();
    }
    
    if (!isPlaying) return;

    switch(e.code) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            break;
    }
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

// Content Generation (Static Background Text)
const lorem = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum";
const words = lorem.split(' ');
let backgroundText = [];

function initBackground() {
    backgroundText = [];
    let y = GRID_SIZE;
    while (y < canvas.height) {
        let x = GRID_SIZE;
        while (x < canvas.width - GRID_SIZE) {
            let text = words[Math.floor(Math.random() * words.length)];
            let width = ctx.measureText(text).width + 10;
            if (x + width > canvas.width - GRID_SIZE) break;
            
            backgroundText.push({
                text: text,
                x: x,
                y: y
            });
            x += width;
        }
        y += GRID_SIZE;
    }
}

function isOccupied(x, y) {
    // Check snake
    for (let segment of snake) {
        if (segment.x === x && segment.y === y) return true;
    }
    // Check obstacles
    for (let obs of obstacles) {
        if (obs.x === x && obs.y === y) return true;
    }
    // Check food (if spawning obstacle)
    if (food && food.x === x && food.y === y) return true;
    
    return false;
}

function spawnFood() {
    let valid = false;
    let attempts = 0;
    
    while (!valid && attempts < 100) {
        let x = Math.floor(Math.random() * (COLS - 2)) + 1;
        let y = Math.floor(Math.random() * (ROWS - 2)) + 1;
        
        if (!isOccupied(x, y)) {
            food = { x, y };
            valid = true;
        }
        attempts++;
    }
    
    // Fallback: Linear search if random fails
    if (!valid) {
        for (let y = 1; y < ROWS - 1; y++) {
            for (let x = 1; x < COLS - 1; x++) {
                if (!isOccupied(x, y)) {
                    food = { x, y };
                    return;
                }
            }
        }
    }
}

function spawnObstacle() {
    let valid = false;
    let attempts = 0;
    
    while (!valid && attempts < 50) {
        let x = Math.floor(Math.random() * (COLS - 2)) + 1;
        let y = Math.floor(Math.random() * (ROWS - 2)) + 1;
        
        // Don't spawn too close to snake head
        const head = snake[0];
        const dist = Math.abs(head.x - x) + Math.abs(head.y - y);
        
        if (!isOccupied(x, y) && dist > 5) {
            obstacles.push({ x, y });
            valid = true;
        }
        attempts++;
    }
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isPlaying = true;
    score = 0;
    health = 10.0;
    moveInterval = 150;
    foodsEaten = 0;
    
    // Init Snake
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    obstacles = [];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    
    initBackground();
    spawnFood();
    updateUI();
    
    lastTime = performance.now();
    gameLoop(lastTime);
}

function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameLoopId);
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
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
        gameOver();
        return;
    }
    
    // Self Collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    // Obstacle Collision
    for (let obs of obstacles) {
        if (head.x === obs.x && head.y === obs.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Eat Food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        foodsEaten++;
        
        // Speed up slightly
        moveInterval = Math.max(50, moveInterval - 1);
        
        // Spawn Obstacle every 3 foods
        if (foodsEaten % 3 === 0) {
            spawnObstacle();
        }

        spawnFood();
        updateUI();
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Background Text
    ctx.font = '16px "Times New Roman"';
    ctx.fillStyle = '#333';
    ctx.textBaseline = 'top';
    
    backgroundText.forEach(word => {
        ctx.fillText(word.text, word.x, word.y);
    });

    // Draw Obstacles (Red Highlight - Typos)
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x * GRID_SIZE, obs.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });

    // Draw Food (Blue Highlight)
    if (food) {
        ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
        ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        ctx.strokeStyle = 'blue';
        ctx.strokeRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }

    // Draw Snake (Yellow Highlight)
    ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });
    
    // Draw Snake Head Border
    if (snake.length > 0) {
        ctx.strokeStyle = '#d4a017';
        ctx.strokeRect(snake[0].x * GRID_SIZE, snake[0].y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
}

function updateUI() {
    scoreDisplay.innerText = score;
    healthDisplay.innerText = "N/A"; // Not used in Snake
}

function gameLoop(timestamp) {
    if (!isPlaying) return;
    update(timestamp);
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Initial render
ctx.font = '16px "Times New Roman"';
initBackground();
draw();

