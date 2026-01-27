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
const COLS = 10;
const ROWS = 20;

canvas.width = COLS * CELL_WIDTH;
canvas.height = ROWS * CELL_HEIGHT;

// Game State
let isPlaying = false;
let isStealth = false;
let score = 0;
let health = 100;
let level = 1;

// Player (can now move in bottom 4 rows)
let player = {
    col: 4,
    row: ROWS - 1,
    minRow: ROWS - 4,
    maxRow: ROWS - 1
};

let enemies = [];
let projectiles = [];
let powerups = [];
let particles = [];
let gameLoopId;
let lastSpawnTime = 0;

// Special attack gauge
let formulaGauge = 0;
const MAX_FORMULA_GAUGE = 100;

// Cooldowns
let horizontalCooldown = 0;
let diagonalCooldown = 0;

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
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    if (e.code === 'Escape') toggleStealth();
    if (!isPlaying || isStealth) return;

    // Movement
    if (e.code === 'ArrowLeft') movePlayer(-1, 0);
    if (e.code === 'ArrowRight') movePlayer(1, 0);
    if (e.code === 'ArrowUp') movePlayer(0, -1);
    if (e.code === 'ArrowDown') movePlayer(0, 1);

    // Attacks
    if (e.code === 'Space') {
        e.preventDefault();
        shootNormal();
    }
    if (e.code === 'KeyQ') {
        e.preventDefault();
        shootHorizontal();
    }
    if (e.code === 'KeyE') {
        e.preventDefault();
        shootDiagonal();
    }
    if (e.code === 'KeyR') {
        e.preventDefault();
        useFormula();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function movePlayer(dx, dy) {
    const newCol = player.col + dx;
    const newRow = player.row + dy;

    if (newCol >= 0 && newCol < COLS) player.col = newCol;
    if (newRow >= player.minRow && newRow <= player.maxRow) player.row = newRow;

    updateSelection();
}

function toggleStealth() {
    isStealth = !isStealth;
    if (isStealth) {
        stealthOverlay.classList.remove('hidden');
        if (isPlaying) cancelAnimationFrame(gameLoopId);
    } else {
        stealthOverlay.classList.add('hidden');
        if (isPlaying) gameLoop(performance.now());
    }
}

function updateSelection() {
    const colChar = String.fromCharCode(65 + player.col);
    cellNameEl.innerText = `${colChar}${player.row + 1}`;

    // Show different formula based on gauge
    if (formulaGauge >= MAX_FORMULA_GAUGE) {
        formulaInput.value = `=SUM(DESTROY_ALL) [R to activate]`;
    } else {
        formulaInput.value = `=DEFEND(${colChar}${player.row + 1}) | Gauge: ${Math.floor(formulaGauge)}%`;
    }
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isPlaying = true;
    score = 0;
    health = 100;
    level = 1;
    formulaGauge = 0;
    player.col = Math.floor(COLS / 2);
    player.row = ROWS - 1;
    enemies = [];
    projectiles = [];
    powerups = [];
    particles = [];
    horizontalCooldown = 0;
    diagonalCooldown = 0;
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

// Normal attack - shoots upward
function shootNormal() {
    projectiles.push({
        col: player.col,
        y: player.row * CELL_HEIGHT,
        dx: 0,
        dy: -6,
        text: Math.floor(Math.random() * 1000),
        type: 'normal',
        damage: 1
    });
}

// Horizontal attack - shoots left and right
function shootHorizontal() {
    if (horizontalCooldown > 0) return;
    horizontalCooldown = 90; // 1.5 seconds

    for (let i = 0; i < COLS; i++) {
        if (i !== player.col) {
            projectiles.push({
                col: i,
                y: player.row * CELL_HEIGHT,
                dx: 0,
                dy: -4,
                text: '─',
                type: 'horizontal',
                damage: 1
            });
        }
    }
}

// Diagonal attack - shoots diagonally
function shootDiagonal() {
    if (diagonalCooldown > 0) return;
    diagonalCooldown = 60; // 1 second

    // Left diagonal
    projectiles.push({
        col: player.col,
        y: player.row * CELL_HEIGHT,
        dx: -3,
        dy: -5,
        text: '╲',
        type: 'diagonal',
        damage: 1
    });

    // Right diagonal
    projectiles.push({
        col: player.col,
        y: player.row * CELL_HEIGHT,
        dx: 3,
        dy: -5,
        text: '╱',
        type: 'diagonal',
        damage: 1
    });
}

// Special formula attack - clears screen
function useFormula() {
    if (formulaGauge < MAX_FORMULA_GAUGE) return;

    formulaGauge = 0;

    // Create particles for each enemy
    enemies.forEach(e => {
        createParticles(e.col * CELL_WIDTH + CELL_WIDTH / 2, e.y, '#217346', 5);
        score += 15;
    });

    enemies = [];

    // Flash effect
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(33, 115, 70, 0.4);
        pointer-events: none;
        z-index: 1000;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 200);

    updateUI();
    updateSelection();
}

function spawnEnemy() {
    if (!isPlaying || isStealth) return;

    const col = Math.floor(Math.random() * COLS);
    const rand = Math.random();

    // Powerup chance
    if (Math.random() < 0.04) {
        const puType = Math.random() < 0.5 ? 'autosum' : 'heal';
        powerups.push({
            col: Math.floor(Math.random() * COLS),
            y: 0,
            text: puType === 'autosum' ? '∑' : '+HP',
            type: puType,
            speed: 1.2
        });
        return;
    }

    let type = 'normal';
    let text = '#REF!';
    let hp = 1;
    let speed = 0.6 + (level * 0.08);
    let color = '#c00000';
    let behavior = 'straight';

    if (level > 2 && rand < 0.15) {
        // Tank
        type = 'tank';
        text = 'CIRCULAR!';
        hp = 3;
        speed = 0.35 + (level * 0.04);
        color = '#800000';
    } else if (level > 3 && rand > 0.85) {
        // Fast
        type = 'fast';
        text = '#####';
        hp = 1;
        speed = 1.2 + (level * 0.1);
    } else if (level > 4 && rand > 0.7 && rand <= 0.85) {
        // Zigzag
        type = 'zigzag';
        text = '#N/A';
        hp = 1;
        speed = 0.8;
        behavior = 'zigzag';
    } else if (level > 5 && rand > 0.55 && rand <= 0.7) {
        // Teleporter
        type = 'teleport';
        text = '#WARP!';
        hp = 1;
        speed = 0.5;
        behavior = 'teleport';
        color = '#6600cc';
    } else {
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
        color: color,
        behavior: behavior,
        zigzagDir: 1,
        teleportTimer: 0
    });
}

function activatePowerup(type) {
    if (type === 'autosum') {
        score += enemies.length * 30;
        enemies.forEach(e => {
            createParticles(e.col * CELL_WIDTH + CELL_WIDTH / 2, e.y, '#217346', 3);
        });
        enemies = [];
        updateUI();
    } else if (type === 'heal') {
        health = Math.min(100, health + 25);
        updateUI();
    }
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            color: color
        });
    }
}

function update(timestamp) {
    if (isStealth) return;

    // Cooldowns
    if (horizontalCooldown > 0) horizontalCooldown--;
    if (diagonalCooldown > 0) diagonalCooldown--;

    // Dynamic Spawning
    const spawnRate = Math.max(400, 1800 - ((level - 1) * 120));
    if (timestamp - lastSpawnTime > spawnRate) {
        spawnEnemy();
        lastSpawnTime = timestamp;
    }

    // Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.y += p.dy;

        // For diagonal projectiles, update x position
        if (p.dx !== 0) {
            const pixelX = p.col * CELL_WIDTH + CELL_WIDTH / 2 + p.dx;
            p.col = Math.floor(pixelX / CELL_WIDTH);
            if (p.col < 0 || p.col >= COLS) {
                projectiles.splice(i, 1);
                continue;
            }
        }

        if (p.y < 0) {
            projectiles.splice(i, 1);
            continue;
        }

        let hit = false;

        // Check Powerups
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
                e.hp -= p.damage;
                projectiles.splice(i, 1);
                hit = true;
                createParticles(e.col * CELL_WIDTH + CELL_WIDTH / 2, e.y, '#ff6600', 2);

                if (e.hp <= 0) {
                    enemies.splice(j, 1);
                    const points = e.type === 'tank' ? 30 : (e.type === 'teleport' ? 25 : 10);
                    score += points;
                    formulaGauge = Math.min(MAX_FORMULA_GAUGE, formulaGauge + 5);
                    createParticles(e.col * CELL_WIDTH + CELL_WIDTH / 2, e.y, e.color, 5);
                    updateUI();
                    updateSelection();
                }
                break;
            }
        }
    }

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        let pu = powerups[i];
        pu.y += pu.speed;
        if (pu.y > ROWS * CELL_HEIGHT) {
            powerups.splice(i, 1);
        }
    }

    // Update Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];

        // Behavior patterns
        switch (e.behavior) {
            case 'zigzag':
                e.col += e.zigzagDir * 0.05;
                if (e.col <= 0 || e.col >= COLS - 1) {
                    e.zigzagDir *= -1;
                }
                e.col = Math.max(0, Math.min(COLS - 1, e.col));
                break;

            case 'teleport':
                e.teleportTimer++;
                if (e.teleportTimer > 60) {
                    e.col = Math.floor(Math.random() * COLS);
                    e.teleportTimer = 0;
                    createParticles(e.col * CELL_WIDTH + CELL_WIDTH / 2, e.y, '#6600cc', 3);
                }
                break;
        }

        e.y += e.speed;

        // Check if enemy reached player zone
        if (e.y > player.minRow * CELL_HEIGHT) {
            // Check collision with player
            if (Math.floor(e.col) === player.col && Math.abs(e.y - player.row * CELL_HEIGHT) < CELL_HEIGHT) {
                enemies.splice(i, 1);
                health -= 20;
                updateUI();
                if (health <= 0) gameOver();
                continue;
            }
        }

        // Enemy escaped
        if (e.y > ROWS * CELL_HEIGHT) {
            enemies.splice(i, 1);
            health -= 10;
            updateUI();
            if (health <= 0) gameOver();
        }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Level up
    if (score > level * 250) {
        level++;
        updateUI();
    }
}

function draw() {
    // Clear
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_WIDTH, 0);
        ctx.lineTo(i * CELL_WIDTH, canvas.height);
        ctx.stroke();
    }

    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_HEIGHT);
        ctx.lineTo(canvas.width, i * CELL_HEIGHT);
        ctx.stroke();
    }

    // Highlight player zone (bottom 4 rows)
    ctx.fillStyle = 'rgba(33, 115, 70, 0.05)';
    ctx.fillRect(0, player.minRow * CELL_HEIGHT, canvas.width, 4 * CELL_HEIGHT);

    // Draw Player
    ctx.strokeStyle = '#217346';
    ctx.lineWidth = 3;
    ctx.strokeRect(
        player.col * CELL_WIDTH,
        player.row * CELL_HEIGHT,
        CELL_WIDTH,
        CELL_HEIGHT
    );

    // Player fill
    ctx.fillStyle = 'rgba(33, 115, 70, 0.2)';
    ctx.fillRect(
        player.col * CELL_WIDTH + 2,
        player.row * CELL_HEIGHT + 2,
        CELL_WIDTH - 4,
        CELL_HEIGHT - 4
    );

    // Draw Powerups
    ctx.font = 'bold 14px Calibri';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    powerups.forEach(pu => {
        ctx.fillStyle = pu.type === 'autosum' ? '#217346' : '#0066cc';
        ctx.fillText(pu.text, (pu.col * CELL_WIDTH) + (CELL_WIDTH / 2), pu.y + (CELL_HEIGHT / 2));
    });

    // Draw Enemies
    enemies.forEach(e => {
        ctx.fillStyle = e.color || '#c00000';
        ctx.font = e.type === 'tank' ? 'bold 11px Calibri' : '11px Calibri';

        // HP bar for tanks
        if (e.maxHp > 1) {
            const barWidth = CELL_WIDTH - 10;
            const hpPercent = e.hp / e.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(e.col * CELL_WIDTH + 5, e.y - 3, barWidth, 3);
            ctx.fillStyle = '#c00000';
            ctx.fillRect(e.col * CELL_WIDTH + 5, e.y - 3, barWidth * hpPercent, 3);
        }

        ctx.fillStyle = e.color || '#c00000';
        ctx.fillText(e.text, (Math.floor(e.col) * CELL_WIDTH) + (CELL_WIDTH / 2), e.y + (CELL_HEIGHT / 2));
    });

    // Draw Projectiles
    ctx.font = '11px Calibri';
    projectiles.forEach(p => {
        ctx.fillStyle = p.type === 'horizontal' ? '#217346' : (p.type === 'diagonal' ? '#0066cc' : '#000');
        ctx.fillText(p.text, (p.col * CELL_WIDTH) + (CELL_WIDTH / 2), p.y + (CELL_HEIGHT / 2));
    });

    // Draw Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;

    // Draw HUD
    drawHUD();
}

function drawHUD() {
    // Formula gauge bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 120, 25);

    ctx.fillStyle = '#333';
    ctx.fillRect(15, 15, 100, 15);

    const gaugeColor = formulaGauge >= MAX_FORMULA_GAUGE ? '#217346' : '#0066cc';
    ctx.fillStyle = gaugeColor;
    ctx.fillRect(15, 15, formulaGauge, 15);

    ctx.fillStyle = '#fff';
    ctx.font = '10px Calibri';
    ctx.textAlign = 'left';
    ctx.fillText(formulaGauge >= MAX_FORMULA_GAUGE ? 'R: =SUM()' : `Gauge: ${Math.floor(formulaGauge)}%`, 18, 26);

    // Cooldown indicators
    ctx.textAlign = 'right';
    ctx.fillStyle = horizontalCooldown > 0 ? '#888' : '#217346';
    ctx.fillText(`Q: Row${horizontalCooldown > 0 ? ` (${Math.ceil(horizontalCooldown / 60)}s)` : ''}`, canvas.width - 10, 20);

    ctx.fillStyle = diagonalCooldown > 0 ? '#888' : '#0066cc';
    ctx.fillText(`E: Diag${diagonalCooldown > 0 ? ` (${Math.ceil(diagonalCooldown / 60)}s)` : ''}`, canvas.width - 10, 35);

    ctx.textAlign = 'left';
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
