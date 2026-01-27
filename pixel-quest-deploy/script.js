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
const GRID_SIZE = 20;
const COLS = canvas.width / GRID_SIZE;
const ROWS = canvas.height / GRID_SIZE;

// Game State
let isPlaying = false;
let isStealth = false;
let score = 0;
let ink = 100;
let wave = 1;
let gameLoopId;

// Player
let player = { x: 16, y: 12 };

// Enemies and projectiles
let enemies = [];
let projectiles = [];
let particles = [];
let paintTrails = []; // Color trails left on canvas

// Wave system
let waveEnemies = [];
let waveInProgress = false;
let waveBreakTimer = 0;
let enemiesKilledInWave = 0;
let totalEnemiesInWave = 0;

// Enemy types configuration
const ENEMY_TYPES = {
    chaser: {
        color: '#ff4444',
        speed: 0.03,
        hp: 1,
        score: 10,
        behavior: 'chase'
    },
    flanker: {
        color: '#ff8800',
        speed: 0.04,
        hp: 1,
        score: 15,
        behavior: 'flank'
    },
    sniper: {
        color: '#aa00ff',
        speed: 0.01,
        hp: 1,
        score: 20,
        behavior: 'snipe'
    },
    splitter: {
        color: '#00cc44',
        speed: 0.025,
        hp: 2,
        score: 25,
        behavior: 'chase',
        splits: true
    },
    ghost: {
        color: '#888888',
        speed: 0.035,
        hp: 1,
        score: 30,
        behavior: 'ghost'
    },
    boss: {
        color: '#220000',
        speed: 0.015,
        hp: 15,
        score: 100,
        behavior: 'boss',
        size: 2
    }
};

// Wave definitions
function generateWave(waveNum) {
    let enemies = [];

    if (waveNum % 5 === 0) {
        // Boss wave every 5 waves
        enemies.push({ type: 'boss', count: 1 });
        enemies.push({ type: 'chaser', count: Math.floor(waveNum / 2) });
    } else {
        // Normal waves with increasing difficulty
        enemies.push({ type: 'chaser', count: 3 + Math.floor(waveNum / 2) });

        if (waveNum >= 2) {
            enemies.push({ type: 'flanker', count: Math.min(2 + Math.floor(waveNum / 3), 5) });
        }
        if (waveNum >= 3) {
            enemies.push({ type: 'sniper', count: Math.min(1 + Math.floor(waveNum / 4), 3) });
        }
        if (waveNum >= 4) {
            enemies.push({ type: 'splitter', count: Math.min(1 + Math.floor(waveNum / 5), 3) });
        }
        if (waveNum >= 6) {
            enemies.push({ type: 'ghost', count: Math.min(Math.floor(waveNum / 6), 3) });
        }
    }

    return enemies;
}

// Input
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Escape') toggleStealth();
    if (e.code === 'Space' && isPlaying && !isStealth) {
        e.preventDefault();
        shoot();
    }
    // Bomb attack with Q
    if (e.code === 'KeyQ' && isPlaying && !isStealth) {
        e.preventDefault();
        bombAttack();
    }
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
    wave = 1;
    player = { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };
    enemies = [];
    projectiles = [];
    particles = [];
    paintTrails = [];
    waveInProgress = false;
    waveBreakTimer = 0;

    updateUI();
    startWave(wave);
    gameLoop();
}

function resetGame() {
    startGame();
}

function startWave(waveNum) {
    waveEnemies = generateWave(waveNum);
    waveInProgress = true;
    enemiesKilledInWave = 0;
    totalEnemiesInWave = waveEnemies.reduce((sum, e) => sum + e.count, 0);

    // Spawn enemies from wave definition
    waveEnemies.forEach(enemyDef => {
        for (let i = 0; i < enemyDef.count; i++) {
            setTimeout(() => {
                if (isPlaying) spawnEnemy(enemyDef.type);
            }, i * 500 + Math.random() * 300);
        }
    });
}

function spawnEnemy(type) {
    const config = ENEMY_TYPES[type];

    // Spawn at edges
    let ex, ey;
    const side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0: ex = Math.random() * COLS; ey = -1; break; // Top
        case 1: ex = COLS; ey = Math.random() * ROWS; break; // Right
        case 2: ex = Math.random() * COLS; ey = ROWS; break; // Bottom
        case 3: ex = -1; ey = Math.random() * ROWS; break; // Left
    }

    const enemy = {
        x: ex,
        y: ey,
        type: type,
        hp: config.hp,
        maxHp: config.hp,
        color: config.color,
        speed: config.speed * (1 + wave * 0.05), // Speed increases with waves
        behavior: config.behavior,
        size: config.size || 1,
        splits: config.splits || false,
        score: config.score,
        // Behavior-specific state
        targetX: player.x,
        targetY: player.y,
        flanking: false,
        flankSide: Math.random() < 0.5 ? -1 : 1,
        chargeTimer: 0,
        visible: type !== 'ghost',
        ghostTimer: 0
    };

    enemies.push(enemy);
}

function shoot() {
    if (ink < 5) return;
    ink -= 5;
    updateUI();

    // 4-directional attack
    const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];

    dirs.forEach(dir => {
        projectiles.push({
            x: player.x,
            y: player.y,
            dx: dir.dx * 0.5,
            dy: dir.dy * 0.5,
            color: '#0066ff',
            damage: 1
        });
    });
}

function bombAttack() {
    if (ink < 30) return;
    ink -= 30;
    updateUI();

    // 8-directional powerful attack
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        projectiles.push({
            x: player.x,
            y: player.y,
            dx: Math.cos(angle) * 0.4,
            dy: Math.sin(angle) * 0.4,
            color: '#ffcc00',
            damage: 2,
            size: 1.5
        });
    }

    // Screen flash effect
    createParticles(player.x, player.y, '#ffcc00', 15);
}

function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameLoopId);
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function update() {
    if (isStealth) return;

    // Player movement
    let moved = false;
    if (keys['ArrowUp'] || keys['KeyW']) { moved = movePlayer(0, -1); }
    else if (keys['ArrowDown'] || keys['KeyS']) { moved = movePlayer(0, 1); }
    else if (keys['ArrowLeft'] || keys['KeyA']) { moved = movePlayer(-1, 0); }
    else if (keys['ArrowRight'] || keys['KeyD']) { moved = movePlayer(1, 0); }

    // Ink regeneration (slow)
    if (ink < 100) {
        ink = Math.min(100, ink + 0.05);
    }

    // Update projectiles
    updateProjectiles();

    // Update enemies
    updateEnemies();

    // Update particles
    updateParticles();

    // Check wave completion
    checkWaveStatus();

    // Wave break timer
    if (!waveInProgress && waveBreakTimer > 0) {
        waveBreakTimer--;
        if (waveBreakTimer <= 0) {
            wave++;
            startWave(wave);
        }
    }

    updateUI();
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.dx;
        p.y += p.dy;

        // Out of bounds
        if (p.x < 0 || p.x >= COLS || p.y < 0 || p.y >= ROWS) {
            projectiles.splice(i, 1);
            continue;
        }

        // Hit detection with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            let e = enemies[j];
            if (!e.visible && e.behavior === 'ghost') continue; // Can't hit invisible ghosts

            const hitRange = e.size || 1;
            if (Math.abs(p.x - e.x) < hitRange && Math.abs(p.y - e.y) < hitRange) {
                e.hp -= p.damage || 1;
                projectiles.splice(i, 1);

                // Create hit particles
                createParticles(e.x, e.y, e.color, 3);

                if (e.hp <= 0) {
                    handleEnemyDeath(e, j);
                }
                break;
            }
        }
    }
}

function handleEnemyDeath(enemy, index) {
    score += enemy.score;
    ink = Math.min(100, ink + 5); // Ink recovery on kill
    enemiesKilledInWave++;

    // Leave paint trail
    paintTrails.push({
        x: Math.round(enemy.x),
        y: Math.round(enemy.y),
        color: enemy.color,
        alpha: 0.6
    });

    // Splitter spawns 2 smaller enemies
    if (enemy.splits && enemy.type === 'splitter') {
        for (let k = 0; k < 2; k++) {
            const miniEnemy = {
                x: enemy.x + (Math.random() - 0.5) * 2,
                y: enemy.y + (Math.random() - 0.5) * 2,
                type: 'chaser',
                hp: 1,
                maxHp: 1,
                color: '#88ff88',
                speed: ENEMY_TYPES.chaser.speed * 1.3,
                behavior: 'chase',
                size: 0.7,
                score: 5,
                splits: false
            };
            enemies.push(miniEnemy);
            totalEnemiesInWave++;
        }
    }

    createParticles(enemy.x, enemy.y, enemy.color, 8);
    enemies.splice(index, 1);
}

function updateEnemies() {
    enemies.forEach(e => {
        // Behavior-specific AI
        switch (e.behavior) {
            case 'chase':
                // Direct chase towards player
                moveTowards(e, player.x, player.y);
                break;

            case 'flank':
                // Move to player's side, then charge
                if (!e.flanking) {
                    // Calculate flank position
                    const flankX = player.x + e.flankSide * 8;
                    const flankY = player.y;

                    if (Math.abs(e.x - flankX) < 2 && Math.abs(e.y - flankY) < 3) {
                        e.flanking = true;
                    } else {
                        moveTowards(e, flankX, flankY, 1.5);
                    }
                } else {
                    // Charge at player
                    moveTowards(e, player.x, player.y, 2);
                }
                break;

            case 'snipe':
                // Stay at distance, then dash
                const distToPlayer = Math.sqrt(
                    Math.pow(e.x - player.x, 2) + Math.pow(e.y - player.y, 2)
                );

                if (distToPlayer > 10) {
                    // Move closer
                    moveTowards(e, player.x, player.y, 0.5);
                } else if (distToPlayer < 6) {
                    // Too close, back off
                    moveTowards(e, player.x, player.y, -0.5);
                } else {
                    // In range, charge timer
                    e.chargeTimer++;
                    if (e.chargeTimer > 60) {
                        // Dash at player
                        moveTowards(e, player.x, player.y, 5);
                        e.chargeTimer = 0;
                    }
                }
                break;

            case 'ghost':
                // Periodically become visible/invisible
                e.ghostTimer++;
                if (e.ghostTimer > 90) {
                    e.visible = !e.visible;
                    e.ghostTimer = 0;
                }

                if (e.visible) {
                    moveTowards(e, player.x, player.y, 1.2);
                } else {
                    // Move faster when invisible
                    moveTowards(e, player.x, player.y, 2);
                }
                break;

            case 'boss':
                // Boss behavior: slow but spawns minions
                moveTowards(e, player.x, player.y, 0.5);

                // Occasionally spawn a chaser
                if (Math.random() < 0.005 && enemies.length < 15) {
                    const minion = {
                        x: e.x,
                        y: e.y,
                        type: 'chaser',
                        hp: 1,
                        maxHp: 1,
                        color: '#ff6666',
                        speed: ENEMY_TYPES.chaser.speed,
                        behavior: 'chase',
                        size: 0.8,
                        score: 5
                    };
                    enemies.push(minion);
                }
                break;
        }

        // Collision with player
        const hitRange = (e.size || 1) * 0.8;
        if (e.visible !== false && Math.abs(e.x - player.x) < hitRange && Math.abs(e.y - player.y) < hitRange) {
            gameOver();
        }
    });
}

function moveTowards(entity, targetX, targetY, speedMult = 1) {
    const dx = targetX - entity.x;
    const dy = targetY - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0.1) {
        entity.x += (dx / dist) * entity.speed * speedMult;
        entity.y += (dy / dist) * entity.speed * speedMult;
    }
}

function checkWaveStatus() {
    if (waveInProgress && enemies.length === 0 && enemiesKilledInWave >= totalEnemiesInWave) {
        waveInProgress = false;
        waveBreakTimer = 120; // 2 seconds break between waves

        // Bonus ink for completing wave
        ink = Math.min(100, ink + 20);

        // Bonus score for wave clear
        score += wave * 50;
    }
}

let lastMoveTime = 0;
function movePlayer(dx, dy) {
    const now = Date.now();
    if (now - lastMoveTime < 80) return false;

    let newX = player.x + dx;
    let newY = player.y + dy;

    if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS) {
        player.x = newX;
        player.y = newY;
        lastMoveTime = now;
        coordinatesEl.innerText = `${Math.round(player.x * GRID_SIZE)}, ${Math.round(player.y * GRID_SIZE)}`;
        return true;
    }
    return false;
}

function createParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 0.8,
            dy: (Math.random() - 0.5) * 0.8,
            life: 1.0,
            color: color,
            size: Math.random() * 0.5 + 0.3
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.03;
        p.dx *= 0.95;
        p.dy *= 0.95;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Fade paint trails slowly
    for (let i = paintTrails.length - 1; i >= 0; i--) {
        paintTrails[i].alpha -= 0.0005;
        if (paintTrails[i].alpha <= 0) {
            paintTrails.splice(i, 1);
        }
    }
}

function draw() {
    // Clear Canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw paint trails
    paintTrails.forEach(trail => {
        ctx.globalAlpha = trail.alpha;
        ctx.fillStyle = trail.color;
        ctx.fillRect(trail.x * GRID_SIZE, trail.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });
    ctx.globalAlpha = 1.0;

    // Draw Player (Cursor/Pencil)
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x * GRID_SIZE + 2, player.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    // Player highlight
    ctx.strokeStyle = '#0066ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x * GRID_SIZE + 1, player.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);

    // Draw Enemies
    enemies.forEach(e => {
        if (e.visible === false) {
            // Ghost invisible - draw faint outline
            ctx.strokeStyle = e.color;
            ctx.globalAlpha = 0.2;
            ctx.strokeRect(
                Math.round(e.x) * GRID_SIZE + 2,
                Math.round(e.y) * GRID_SIZE + 2,
                GRID_SIZE * (e.size || 1) - 4,
                GRID_SIZE * (e.size || 1) - 4
            );
            ctx.globalAlpha = 1.0;
        } else {
            ctx.fillStyle = e.color;
            const size = GRID_SIZE * (e.size || 1);
            ctx.fillRect(
                Math.round(e.x) * GRID_SIZE + 2,
                Math.round(e.y) * GRID_SIZE + 2,
                size - 4,
                size - 4
            );

            // HP bar for multi-hp enemies
            if (e.maxHp > 1) {
                const barWidth = size - 4;
                const barHeight = 3;
                const hpPercent = e.hp / e.maxHp;

                ctx.fillStyle = '#333';
                ctx.fillRect(
                    Math.round(e.x) * GRID_SIZE + 2,
                    Math.round(e.y) * GRID_SIZE - 2,
                    barWidth,
                    barHeight
                );
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(
                    Math.round(e.x) * GRID_SIZE + 2,
                    Math.round(e.y) * GRID_SIZE - 2,
                    barWidth * hpPercent,
                    barHeight
                );
            }
        }
    });

    // Draw Projectiles
    projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        const size = (p.size || 1) * (GRID_SIZE - 12);
        ctx.fillRect(
            Math.round(p.x) * GRID_SIZE + (GRID_SIZE - size) / 2,
            Math.round(p.y) * GRID_SIZE + (GRID_SIZE - size) / 2,
            size,
            size
        );
    });

    // Draw Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        const size = GRID_SIZE * p.size;
        ctx.fillRect(p.x * GRID_SIZE, p.y * GRID_SIZE, size, size);
    });
    ctx.globalAlpha = 1.0;

    // Wave info overlay
    if (!waveInProgress && waveBreakTimer > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 30, 200, 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Wave ${wave} Clear!`, canvas.width / 2, canvas.height / 2);
        ctx.font = '14px Arial';
        ctx.fillText(`Next wave in ${Math.ceil(waveBreakTimer / 60)}...`, canvas.width / 2, canvas.height / 2 + 20);
    }

    // Wave indicator
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Wave ${wave}`, 10, 20);
    ctx.fillText(`Enemies: ${enemies.length}`, 10, 35);
    ctx.fillText(`Score: ${score}`, 10, 50);
}

function gameLoop() {
    if (!isPlaying) return;
    update();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function updateUI() {
    inkLevelEl.innerText = Math.floor(ink);
    levelDisplayEl.innerText = wave;
}
