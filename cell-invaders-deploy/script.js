const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score-display');
const levelDisplay = document.getElementById('level-display');
const healthDisplay = document.getElementById('health-display');
const finalScoreEl = document.getElementById('final-score');
const stealthOverlay = document.getElementById('stealth-overlay');
const cellNameEl = document.getElementById('cell-name');
const formulaInput = document.getElementById('formula-input');

// Grid Config
const CELL_WIDTH = 80;
const CELL_HEIGHT = 25;
const COLS = 10; // A to J
const ROWS = 20; // 1 to 20

// Resize canvas to fit grid
canvas.width = COLS * CELL_WIDTH;
canvas.height = ROWS * CELL_HEIGHT;

// Game State
let isPlaying = false;
let isStealth = false;
let score = 0;
let health = 100;
let level = 1;
let playerCol = 4; // Start in middle
let enemies = [];
let projectiles = [];
let powerups = []; // New: Powerups array
let gameLoopId;
let lastSpawnTime = 0; // New: For dynamic spawning
let spawnInterval = 2000;

// Init Headers
const colHeaders = document.getElementById('col-headers');
const rowHeaders = document.getElementById('row-headers');

for (let i = 0; i < COLS; i++) {
    let div = document.createElement('div');
    div.className = 'col-header';
    div.innerText = String.fromCharCode(65 + i);
    colHeaders.appendChild(div);
}

for (let i = 0; i < ROWS; i++) {
    let div = document.createElement('div');
    div.className = 'row-header';
    div.innerText = i + 1;
    rowHeaders.appendChild(div);
}

// Input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') toggleStealth();
    if (!isPlaying) return;

    if (e.code === 'ArrowLeft' && playerCol > 0) {
        playerCol--;
        updateSelection();
    }
    if (e.code === 'ArrowRight' && playerCol < COLS - 1) {
        playerCol++;
        updateSelection();
    }
    if (e.code === 'Space') shoot();
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

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

function updateSelection() {
    const colChar = String.fromCharCode(65 + playerCol);
    const rowNum = ROWS; // Player is at bottom
    cellNameEl.innerText = `${colChar}${rowNum}`;
    formulaInput.value = `=SHOOT(${colChar}${rowNum})`;
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isPlaying = true;
    score = 0;
    health = 100;
    level = 1;
    playerCol = Math.floor(COLS / 2);
    enemies = [];
    projectiles = [];
    powerups = [];
    lastSpawnTime = performance.now();
    
    updateUI();
    updateSelection();
    gameLoop(performance.now());
}

function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameLoopId);
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function spawnEnemy() {
    if (!isPlaying || isStealth) return;
    
    const col = Math.floor(Math.random() * COLS);
    const rand = Math.random();
    
    let type = 'normal';
    let text = '#REF!';
    let hp = 1;
    let speed = 0.5 + (level * 0.1);
    let color = '#c00000';

    // 5% chance for Powerup (AutoSum)
    if (Math.random() < 0.05) {
        powerups.push({
            col: Math.floor(Math.random() * COLS),
            y: 0,
            text: '∑',
            type: 'autosum',
            speed: 1.5
        });
        return; // Don't spawn enemy this time
    }

    if (level > 2 && rand < 0.2) {
        // Tank Enemy (20% chance after level 2)
        type = 'tank';
        text = 'CIRCULAR!';
        hp = 3;
        speed = 0.3 + (level * 0.05);
        color = '#800000'; // Darker red
    } else if (level > 4 && rand > 0.8) {
        // Fast Enemy (20% chance after level 4)
        type = 'fast';
        text = '#####';
        hp = 1;
        speed = 1.0 + (level * 0.15);
    } else {
        // Normal Enemy
        const types = ['#REF!', '#DIV/0!', '#VALUE!', '#NAME?', '#NULL!'];
        text = types[Math.floor(Math.random() * types.length)];
    }
    
    enemies.push({
        col: col,
        y: 0,
        text: text,
        type: type,
        hp: hp,
        maxHp: hp,
        speed: speed,
        color: color
    });
}

function shoot() {
    projectiles.push({
        col: playerCol,
        y: (ROWS - 1) * CELL_HEIGHT,
        text: Math.floor(Math.random() * 1000) // Shoot numbers
    });
}

function activatePowerup(type) {
    if (type === 'autosum') {
        // Clear all enemies
        score += enemies.length * 50;
        enemies = [];
        // Visual feedback
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(33, 115, 70, 0.3)'; // Excel Green
        flash.style.pointerEvents = 'none';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 200);
        updateUI();
    }
}

function update(timestamp) {
    if (isStealth) return;

    // Dynamic Spawning
    const currentSpawnRate = Math.max(500, 2000 - ((level - 1) * 150));
    
    if (timestamp - lastSpawnTime > currentSpawnRate) {
        spawnEnemy();
        lastSpawnTime = timestamp;
    }

    // Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.y -= 5; // Speed
        
        if (p.y < 0) {
            projectiles.splice(i, 1);
            continue;
        }
        
        let hit = false;

        // Check Powerups (Shoot to activate)
        for (let k = powerups.length - 1; k >= 0; k--) {
            let pu = powerups[k];
            if (p.col === pu.col && Math.abs(p.y - pu.y) < CELL_HEIGHT) {
                activatePowerup(pu.type);
                powerups.splice(k, 1);
                projectiles.splice(i, 1);
                hit = true;
                break;
            }
        }
        if (hit) continue;

        // Collision with Enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            let e = enemies[j];
            if (p.col === e.col && Math.abs(p.y - e.y) < CELL_HEIGHT) {
                e.hp--;
                projectiles.splice(i, 1);
                hit = true;
                
                if (e.hp <= 0) {
                    enemies.splice(j, 1);
                    score += (e.type === 'tank' ? 30 : 10);
                    updateUI();
                }
                break;
            }
        }
    }

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        let pu = powerups[i];
        pu.y += pu.speed;
        if (pu.y > (ROWS - 1) * CELL_HEIGHT) {
            powerups.splice(i, 1);
        }
    }

    // Update Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.y += e.speed;
        
        if (e.y > (ROWS - 1) * CELL_HEIGHT) {
            enemies.splice(i, 1);
            health -= 10;
            updateUI();
            if (health <= 0) gameOver();
        }
    }

    // Level up
    if (score > level * 200) {
        level++;
        updateUI();
    }
}

function draw() {
    // Clear
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid Lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_WIDTH, 0);
        ctx.lineTo(i * CELL_WIDTH, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_HEIGHT);
        ctx.lineTo(canvas.width, i * CELL_HEIGHT);
        ctx.stroke();
    }

    // Draw Player (Green Border Cell)
    ctx.strokeStyle = '#217346';
    ctx.lineWidth = 3;
    ctx.strokeRect(playerCol * CELL_WIDTH, (ROWS - 1) * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
    
    // Draw Powerups
    ctx.font = 'bold 16px Calibri';
    ctx.fillStyle = '#217346'; // Excel Green
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    powerups.forEach(pu => {
        ctx.fillText(pu.text, (pu.col * CELL_WIDTH) + (CELL_WIDTH / 2), pu.y + (CELL_HEIGHT / 2));
    });

    // Draw Enemies
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    enemies.forEach(e => {
        ctx.fillStyle = e.color || '#c00000';
        if (e.type === 'tank') ctx.font = 'bold 12px Calibri';
        else ctx.font = '12px Calibri';
        
        ctx.fillText(e.text, (e.col * CELL_WIDTH) + (CELL_WIDTH / 2), e.y + (CELL_HEIGHT / 2));
    });

    // Draw Projectiles
    ctx.fillStyle = '#000';
    ctx.font = '12px Calibri';
    projectiles.forEach(p => {
        ctx.fillText(p.text, (p.col * CELL_WIDTH) + (CELL_WIDTH / 2), p.y + (CELL_HEIGHT / 2));
    });
}

function updateUI() {
    scoreDisplay.innerText = score;
    levelDisplay.innerText = level;
    healthDisplay.innerText = health;
}

function gameLoop(timestamp) {
    if (!isPlaying) return;
    update(timestamp);
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Initial Draw
draw();
