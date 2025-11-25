const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const inkLevelEl = document.getElementById('ink-level');
const levelDisplayEl = document.getElementById('level-display');
const finalScoreEl = document.getElementById('final-score');
const stealthOverlay = document.getElementById('stealth-overlay');
const coordinatesEl = document.getElementById('coordinates');

// Game Constants
const GRID_SIZE = 20; // Size of each "pixel"
const COLS = canvas.width / GRID_SIZE;
const ROWS = canvas.height / GRID_SIZE;

// Game State
let isPlaying = false;
let isStealth = false;
let score = 0;
let ink = 100;
let level = 1;
let player = { x: 10, y: 10 };
let enemies = [];
let projectiles = [];
let particles = [];
let gameLoopId;
let spawnInterval;

// Input
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Escape') toggleStealth();
    if (e.code === 'Space' && isPlaying && !isStealth) shoot();
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);

function toggleStealth() {
    isStealth = !isStealth;
    if (isStealth) {
        stealthOverlay.classList.remove('hidden');
        if (isPlaying) cancelAnimationFrame(gameLoopId);
    } else {
        stealthOverlay.classList.add('hidden');
        if (isPlaying) gameLoop();
    }
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isPlaying = true;
    score = 0;
    ink = 100;
    level = 1;
    player = { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };
    enemies = [];
    projectiles = [];
    particles = [];
    
    updateUI();
    gameLoop();
    
    // Spawn enemies
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnEnemy, 2000);
}

function resetGame() {
    startGame();
}

function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameLoopId);
    clearInterval(spawnInterval);
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function spawnEnemy() {
    if (!isPlaying || isStealth) return;
    
    // Spawn at edges
    let ex, ey;
    if (Math.random() < 0.5) {
        ex = Math.random() < 0.5 ? 0 : COLS - 1;
        ey = Math.floor(Math.random() * ROWS);
    } else {
        ex = Math.floor(Math.random() * COLS);
        ey = Math.random() < 0.5 ? 0 : ROWS - 1;
    }
    
    enemies.push({ x: ex, y: ey, type: 'glitch' });
}

function shoot() {
    if (ink < 5) return;
    ink -= 5;
    updateUI();
    
    // Shoot in 4 directions
    projectiles.push({ x: player.x, y: player.y, dx: 1, dy: 0 });
    projectiles.push({ x: player.x, y: player.y, dx: -1, dy: 0 });
    projectiles.push({ x: player.x, y: player.y, dx: 0, dy: 1 });
    projectiles.push({ x: player.x, y: player.y, dx: 0, dy: -1 });
}

function update() {
    if (isStealth) return;

    // Player Movement (Grid based but smooth-ish feel? No, let's do step based with delay or just slow continuous)
    // Let's do simple delay for grid movement
    if (keys['ArrowUp'] || keys['KeyW']) movePlayer(0, -1);
    else if (keys['ArrowDown'] || keys['KeyS']) movePlayer(0, 1);
    else if (keys['ArrowLeft'] || keys['KeyA']) movePlayer(-1, 0);
    else if (keys['ArrowRight'] || keys['KeyD']) movePlayer(1, 0);

    // Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.dx;
        p.y += p.dy;
        
        if (p.x < 0 || p.x >= COLS || p.y < 0 || p.y >= ROWS) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Hit detection
        for (let j = enemies.length - 1; j >= 0; j--) {
            let e = enemies[j];
            if (Math.round(p.x) === Math.round(e.x) && Math.round(p.y) === Math.round(e.y)) {
                enemies.splice(j, 1);
                projectiles.splice(i, 1);
                score += 10;
                ink = Math.min(ink + 2, 100); // Recover ink
                createParticles(e.x, e.y, '#ff0000');
                updateUI();
                break;
            }
        }
    }

    // Update Enemies
    // Move towards player slowly
    if (Math.random() < 0.05 + (level * 0.01)) { // Speed increases with level
        enemies.forEach(e => {
            if (e.x < player.x) e.x += 0.5;
            if (e.x > player.x) e.x -= 0.5;
            if (e.y < player.y) e.y += 0.5;
            if (e.y > player.y) e.y -= 0.5;
            
            // Collision with player
            if (Math.abs(e.x - player.x) < 0.8 && Math.abs(e.y - player.y) < 0.8) {
                gameOver();
            }
        });
    }

    // Level up
    if (score > level * 100) {
        level++;
        updateUI();
    }
}

let lastMoveTime = 0;
function movePlayer(dx, dy) {
    const now = Date.now();
    if (now - lastMoveTime < 100) return; // Move delay
    
    let newX = player.x + dx;
    let newY = player.y + dy;
    
    if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS) {
        player.x = newX;
        player.y = newY;
        lastMoveTime = now;
        coordinatesEl.innerText = `${player.x}, ${player.y}`;
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 0.5,
            dy: (Math.random() - 0.5) * 0.5,
            life: 1.0,
            color: color
        });
    }
}

function draw() {
    // Clear Canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid (Lightly)
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw Player (Cursor/Pencil)
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x * GRID_SIZE, player.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    
    // Draw Enemies (Glitches)
    ctx.fillStyle = '#ff0000';
    enemies.forEach(e => {
        ctx.fillRect(Math.round(e.x) * GRID_SIZE, Math.round(e.y) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });
    
    // Draw Projectiles (Ink)
    ctx.fillStyle = '#0000ff';
    projectiles.forEach(p => {
        ctx.fillRect(Math.round(p.x) * GRID_SIZE + 5, Math.round(p.y) * GRID_SIZE + 5, GRID_SIZE - 10, GRID_SIZE - 10);
    });

    // Draw Particles
    particles.forEach((p, index) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x * GRID_SIZE, p.y * GRID_SIZE, GRID_SIZE/2, GRID_SIZE/2);
        ctx.globalAlpha = 1.0;
        
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.05;
        if (p.life <= 0) particles.splice(index, 1);
    });
}

function gameLoop() {
    if (!isPlaying) return;
    update();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function updateUI() {
    inkLevelEl.innerText = Math.floor(ink);
    levelDisplayEl.innerText = level;
}
