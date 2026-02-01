const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const terminalOutput = document.getElementById('terminal-output');
const scoreElement = document.getElementById('score-value');
const healthElement = document.getElementById('health-value');
const highScoreElement = document.getElementById('high-score-value');
const rankElement = document.getElementById('rank-value');

// Game Configuration
const LINE_HEIGHT = 24;
const FONT_SIZE = 16;
const BASE_SCROLL_INTERVAL = 18;

// Player
let player = {
    x: 100,
    y: 300,
    width: 12,
    height: 24,
    speed: 6,
    dashSpeed: 15,
    isDashing: false,
    dashCooldown: 0,
    dashDuration: 0,
    invincible: false,
    invincibleTimer: 0
};

// Game State
let codeLines = [];
let score = 0;
let highScore = localStorage.getItem('vscode-runner-highscore') || 0;
let health = 100;
let gameRunning = true;
let frameCount = 0;
let scrollTimer = 0;
let currentScrollInterval = BASE_SCROLL_INTERVAL;
let difficultyMultiplier = 1;

// Mission System
let currentMission = null;
let missionProgress = 0;
let stage = 1;
let stageScore = 0;

// Item collection stats
let itemsCollected = {
    fix: 0,
    coffee: 0,
    comment: 0,
    semicolon: 0,
    commit: 0
};

// Checkpoint system
let lastCheckpoint = { score: 0, health: 100, stage: 1 };
let hasCheckpoint = false;

// Mission definitions
const MISSIONS = [
    { type: 'survive', target: 30, desc: 'Survive 30 lines', reward: 50 },
    { type: 'collect_fix', target: 3, desc: 'Collect 3 FIX patches', reward: 40 },
    { type: 'survive', target: 50, desc: 'Survive 50 lines', reward: 60 },
    { type: 'collect_coffee', target: 2, desc: 'Collect 2 Coffee items', reward: 50 },
    { type: 'no_damage', target: 25, desc: 'No damage for 25 lines', reward: 80 },
    { type: 'collect_any', target: 5, desc: 'Collect 5 items', reward: 60 },
    { type: 'survive', target: 80, desc: 'Survive 80 lines', reward: 100 },
    { type: 'collect_semicolon', target: 3, desc: 'Collect 3 Semicolons', reward: 70 },
    { type: 'no_damage', target: 40, desc: 'No damage for 40 lines', reward: 120 },
    { type: 'boss', target: 1, desc: 'Survive the Bug Storm!', reward: 150 }
];

// Code Generation Data
const keywords = ['const', 'let', 'var', 'function', 'class', 'import', 'export', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'async', 'await', 'public', 'private'];
const variables = ['data', 'user', 'result', 'index', 'count', 'config', 'options', 'item', 'element', 'node', 'ctx', 'canvas', 'response', 'error', 'value', 'key', 'state', 'props'];
const methods = ['toString', 'parseInt', 'map', 'filter', 'reduce', 'forEach', 'push', 'pop', 'getElementById', 'querySelector', 'addEventListener'];

// Resize canvas
function resizeCanvas() {
    const container = document.querySelector('.code-area');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    player.x = Math.min(player.x, canvas.width - player.width);
    player.y = Math.min(player.y, canvas.height - player.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Generate Code Line
function generateCodeLine(y) {
    const indentLevel = Math.floor(Math.random() * 4);
    const indent = '    '.repeat(indentLevel);

    const type = Math.random();
    const v1 = variables[Math.floor(Math.random() * variables.length)];
    const v2 = variables[Math.floor(Math.random() * variables.length)];
    const m1 = methods[Math.floor(Math.random() * methods.length)];
    const k1 = keywords[Math.floor(Math.random() * keywords.length)];

    let text = '';
    if (type < 0.25) {
        text = `${k1} ${v1} = ${v2}.${m1}() || null;`;
    } else if (type < 0.5) {
        text = `${v1}.${m1}(${v2} => ${v2}.id);`;
    } else if (type < 0.75) {
        text = `${k1} (${v1} && ${v1}.${v2}) {`;
    } else {
        text = `${k1} ${v1} = async () => { return ${v2}; };`;
    }

    if (Math.random() < 0.2) {
        text += ` // TODO: refactor`;
    }

    const lineObj = {
        y: y,
        text: indent + text,
        rects: []
    };

    // Boss wave has more obstacles
    const isBossWave = currentMission && currentMission.type === 'boss';
    const obstacleChance = isBossWave ? 0.5 : 0.22 * difficultyMultiplier;

    // Obstacles
    if (Math.random() < obstacleChance) {
        generateObstacles(lineObj, y);
    }
    // Items (not during boss)
    else if (!isBossWave && Math.random() < 0.12) {
        generateItem(lineObj, y);
    }

    return lineObj;
}

function generateObstacles(lineObj, y) {
    const mode = Math.random();

    if (mode < 0.3) {
        // Left wall
        const width = Math.random() * (canvas.width * 0.35) + 60;
        lineObj.rects.push({ x: 0, y: y, width: width, height: LINE_HEIGHT, type: 'error' });
    } else if (mode < 0.6) {
        // Right wall
        const width = Math.random() * (canvas.width * 0.35) + 60;
        lineObj.rects.push({ x: canvas.width - width, y: y, width: width, height: LINE_HEIGHT, type: 'error' });
    } else {
        // Scattered blocks
        const numBlocks = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numBlocks; i++) {
            const width = Math.random() * 70 + 50;
            const x = Math.random() * (canvas.width - width);
            lineObj.rects.push({ x: x, y: y, width: width, height: LINE_HEIGHT, type: 'error' });
        }
    }
}

function generateItem(lineObj, y) {
    const itemX = Math.random() * (canvas.width - 60) + 10;
    const itemRoll = Math.random();

    let itemType;
    if (itemRoll < 0.30) {
        itemType = 'fix';        // FIX - heal
    } else if (itemRoll < 0.50) {
        itemType = 'coffee';     // Coffee - speed boost
    } else if (itemRoll < 0.70) {
        itemType = 'comment';    // Comment - invincible
    } else if (itemRoll < 0.88) {
        itemType = 'semicolon';  // Semicolon - 2x score
    } else {
        itemType = 'commit';     // Git commit - checkpoint
    }

    lineObj.rects.push({
        x: itemX,
        y: y,
        width: 45,
        height: LINE_HEIGHT,
        type: itemType
    });
}

// Initialize World
function initWorld() {
    codeLines = [];
    for (let y = 0; y < canvas.height + LINE_HEIGHT; y += LINE_HEIGHT) {
        const line = generateCodeLine(y);
        line.rects = []; // Safe start
        codeLines.push(line);
    }
}

// Mission System
function startMission(missionIndex) {
    if (missionIndex >= MISSIONS.length) {
        // Loop back with harder versions
        missionIndex = missionIndex % MISSIONS.length;
    }

    currentMission = { ...MISSIONS[missionIndex], index: missionIndex };
    missionProgress = 0;
    stageScore = 0;

    logToTerminal(`Mission ${stage}: ${currentMission.desc}`, 'info');
    showMissionPopup(currentMission.desc);
}

function updateMission() {
    if (!currentMission) return;

    switch (currentMission.type) {
        case 'survive':
        case 'no_damage':
        case 'boss':
            // Progress on each line scrolled
            break;
        case 'collect_fix':
        case 'collect_coffee':
        case 'collect_semicolon':
        case 'collect_any':
            // Progress on item collection (handled in collectItem)
            break;
    }

    // Check completion
    if (missionProgress >= currentMission.target) {
        completeMission();
    }
}

function completeMission() {
    score += currentMission.reward;
    scoreElement.innerText = score;

    logToTerminal(`Mission Complete! +${currentMission.reward} points`, 'success');
    showMissionPopup('Mission Complete!', true);

    stage++;
    setTimeout(() => {
        startMission(stage - 1);
    }, 1500);
}

function failMission(reason) {
    if (currentMission && currentMission.type === 'no_damage') {
        logToTerminal(`Mission Failed: ${reason}`, 'error');
        missionProgress = 0; // Reset progress
    }
}

function showMissionPopup(text, isComplete = false) {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: ${isComplete ? '#4ec9b0' : '#ffffff'};
        padding: 20px 40px;
        font-size: 18px;
        font-family: Consolas, monospace;
        border: 2px solid ${isComplete ? '#4ec9b0' : '#007acc'};
        z-index: 100;
        pointer-events: none;
    `;
    popup.innerText = text;
    canvas.parentElement.appendChild(popup);

    setTimeout(() => popup.remove(), 2000);
}

// Item Collection
function collectItem(itemType) {
    itemsCollected[itemType]++;

    switch (itemType) {
        case 'fix':
            health = Math.min(100, health + 20);
            updateHealthBar();
            logToTerminal('Bug fixed! Health restored.', 'success');
            break;

        case 'coffee':
            player.speed = 10;
            setTimeout(() => { player.speed = 6; }, 5000);
            logToTerminal('Coffee boost! Speed increased.', 'success');
            break;

        case 'comment':
            player.invincible = true;
            player.invincibleTimer = 180; // 3 seconds at 60fps
            logToTerminal('// Comment shield activated!', 'success');
            break;

        case 'semicolon':
            score += 25;
            scoreElement.innerText = score;
            logToTerminal('Semicolon; bonus points!', 'success');
            break;

        case 'commit':
            lastCheckpoint = { score: score, health: health, stage: stage };
            hasCheckpoint = true;
            logToTerminal('git commit -m "checkpoint saved"', 'success');
            break;
    }

    // Update mission progress
    if (currentMission) {
        if (currentMission.type === 'collect_any') {
            missionProgress++;
        } else if (currentMission.type === 'collect_fix' && itemType === 'fix') {
            missionProgress++;
        } else if (currentMission.type === 'collect_coffee' && itemType === 'coffee') {
            missionProgress++;
        } else if (currentMission.type === 'collect_semicolon' && itemType === 'semicolon') {
            missionProgress++;
        }
    }
}

function logToTerminal(message, type = 'info') {
    const line = document.createElement('div');
    line.className = 'terminal-line';

    const timestamp = new Date().toLocaleTimeString();
    let color = '#cccccc';
    if (type === 'error') color = '#f44747';
    if (type === 'success') color = '#4ec9b0';

    line.innerHTML = `<span style="color: #569cd6">[${timestamp}]</span> <span style="color: ${color}">${message}</span>`;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;

    if (terminalOutput.children.length > 20) {
        terminalOutput.removeChild(terminalOutput.firstChild);
    }
}

function updateHealthBar() {
    const healthBar = document.getElementById('health-bar-inner');
    healthBar.style.width = `${health}%`;

    if (health > 60) healthBar.style.backgroundColor = '#4ec9b0';
    else if (health > 30) healthBar.style.backgroundColor = '#cca700';
    else healthBar.style.backgroundColor = '#f44747';

    healthElement.innerText = Math.floor(health);
}

function updateRank() {
    let rank = 'Intern';
    let color = '#cccccc';

    if (score > 1500) { rank = 'CTO'; color = '#dcdcaa'; }
    else if (score > 1000) { rank = 'AI Overlord'; color = '#c586c0'; }
    else if (score > 600) { rank = 'Tech Lead'; color = '#4ec9b0'; }
    else if (score > 300) { rank = 'Senior Dev'; color = '#569cd6'; }
    else if (score > 100) { rank = 'Junior Dev'; color = '#9cdcfe'; }

    rankElement.innerText = rank;
    rankElement.style.color = color;
}

function checkCollision(rect1, rect2) {
    return (rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y);
}

function gameOver() {
    gameRunning = false;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('vscode-runner-highscore', highScore);
        highScoreElement.innerText = highScore;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f44747';
    ctx.font = 'bold 28px Consolas';
    ctx.textAlign = 'center';
    ctx.fillText('FATAL ERROR', canvas.width / 2, canvas.height / 2 - 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Consolas';
    ctx.fillText(`Score: ${score} | Stage: ${stage}`, canvas.width / 2, canvas.height / 2);

    if (hasCheckpoint) {
        ctx.fillStyle = '#4ec9b0';
        ctx.fillText('Press R to restore checkpoint', canvas.width / 2, canvas.height / 2 + 30);
    }

    ctx.fillStyle = '#888888';
    ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 60);

    logToTerminal('Process terminated with exit code 1', 'error');
}

function resetGame(fromCheckpoint = false) {
    if (fromCheckpoint && hasCheckpoint) {
        score = lastCheckpoint.score;
        health = lastCheckpoint.health;
        stage = lastCheckpoint.stage;
        logToTerminal('git checkout -- . (restored from checkpoint)', 'info');
    } else {
        score = 0;
        health = 100;
        stage = 1;
        hasCheckpoint = false;
        itemsCollected = { fix: 0, coffee: 0, comment: 0, semicolon: 0, commit: 0 };
        logToTerminal('System rebooted.', 'info');
    }

    player.x = canvas.width / 2;
    player.y = canvas.height / 3;
    player.speed = 6;
    player.invincible = false;
    player.invincibleTimer = 0;
    player.dashCooldown = 0;

    currentScrollInterval = BASE_SCROLL_INTERVAL;
    scrollTimer = 0;
    difficultyMultiplier = 1;
    gameRunning = true;

    scoreElement.innerText = score;
    updateHealthBar();
    updateRank();
    initWorld();
    startMission(stage - 1);
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameRunning) {
        if (keys['Space']) resetGame(false);
        else if (keys['KeyR'] && hasCheckpoint) resetGame(true);
        else requestAnimationFrame(gameLoop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update difficulty (much smoother curve)
    currentScrollInterval = Math.max(12, BASE_SCROLL_INTERVAL - Math.floor(score / 80));
    difficultyMultiplier = 1 + (score / 1000);

    // Update invincibility
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }

    // Dash cooldown
    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.isDashing) {
        player.dashDuration--;
        if (player.dashDuration <= 0) player.isDashing = false;
    }

    // Player Movement
    let moveSpeed = player.isDashing ? player.dashSpeed : player.speed;

    if (keys['ArrowLeft'] && player.x > 0) player.x -= moveSpeed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += moveSpeed;
    if (keys['ArrowUp'] && player.y > 0) player.y -= moveSpeed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += moveSpeed;

    // Dash (Shift)
    if ((keys['ShiftLeft'] || keys['ShiftRight']) && player.dashCooldown === 0 && !player.isDashing) {
        player.isDashing = true;
        player.dashDuration = 8;
        player.dashCooldown = 45;
    }

    // Scroll World
    scrollTimer++;
    if (scrollTimer >= currentScrollInterval) {
        scrollTimer = 0;
        score++;
        stageScore++;
        scoreElement.innerText = score;

        if (score > highScore) {
            highScore = score;
            highScoreElement.innerText = highScore;
        }
        updateRank();

        // Mission progress for survive/no_damage
        if (currentMission) {
            if (currentMission.type === 'survive' || currentMission.type === 'no_damage' || currentMission.type === 'boss') {
                missionProgress++;
            }
        }

        // Move lines up
        for (let i = codeLines.length - 1; i >= 0; i--) {
            codeLines[i].y -= LINE_HEIGHT;
            if (codeLines[i].y < -LINE_HEIGHT) {
                codeLines.splice(i, 1);
            }
        }

        // Add new line at bottom
        let maxY = -100;
        codeLines.forEach(l => maxY = Math.max(maxY, l.y));
        if (maxY < canvas.height) {
            codeLines.push(generateCodeLine(maxY + LINE_HEIGHT));
        }

        updateMission();
    }

    // Draw & Collision
    ctx.font = `${FONT_SIZE}px Consolas`;
    ctx.textBaseline = 'top';

    codeLines.forEach(line => {
        // Draw code text
        ctx.fillStyle = '#d4d4d4';
        if (line.text.includes('//')) ctx.fillStyle = '#6a9955';
        else if (line.text.includes('const') || line.text.includes('let')) ctx.fillStyle = '#569cd6';
        else if (line.text.includes('return') || line.text.includes('if')) ctx.fillStyle = '#c586c0';

        ctx.fillText(line.text, 10, line.y);

        // Draw objects
        line.rects.forEach((rect, rIndex) => {
            rect.y = line.y;

            if (rect.type === 'error') {
                drawError(rect);

                if (!player.invincible && !player.isDashing && checkCollision(player, rect)) {
                    health -= 8;
                    updateHealthBar();
                    failMission('Took damage');

                    if (frameCount % 15 === 0) {
                        logToTerminal(`Error at line ${Math.floor(rect.y / LINE_HEIGHT)}`, 'error');
                    }
                    if (health <= 0) gameOver();
                }
            } else {
                drawItem(rect);

                if (checkCollision(player, rect)) {
                    collectItem(rect.type);
                    line.rects.splice(rIndex, 1);
                }
            }
        });
    });

    // Draw Player
    drawPlayer();

    // Draw HUD
    drawHUD();

    frameCount++;
    requestAnimationFrame(gameLoop);
}

function drawError(rect) {
    ctx.fillStyle = 'rgba(244, 71, 71, 0.25)';
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    // Squiggly underline
    ctx.beginPath();
    ctx.strokeStyle = '#f44747';
    ctx.lineWidth = 2;
    for (let i = 0; i < rect.width; i += 6) {
        ctx.moveTo(rect.x + i, rect.y + rect.height - 2);
        ctx.lineTo(rect.x + i + 3, rect.y + rect.height + 1);
        ctx.lineTo(rect.x + i + 6, rect.y + rect.height - 2);
    }
    ctx.stroke();
}

function drawItem(rect) {
    const colors = {
        fix: { bg: 'rgba(78, 201, 176, 0.3)', text: '#4ec9b0', label: 'FIX' },
        coffee: { bg: 'rgba(206, 145, 120, 0.3)', text: '#ce9178', label: '☕' },
        comment: { bg: 'rgba(106, 153, 85, 0.3)', text: '#6a9955', label: '//' },
        semicolon: { bg: 'rgba(220, 220, 170, 0.3)', text: '#dcdcaa', label: ';' },
        commit: { bg: 'rgba(86, 156, 214, 0.3)', text: '#569cd6', label: 'GIT' }
    };

    const style = colors[rect.type] || colors.fix;

    ctx.fillStyle = style.bg;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    ctx.strokeStyle = style.text;
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    ctx.fillStyle = style.text;
    ctx.font = 'bold 14px Consolas';
    ctx.fillText(style.label, rect.x + 8, rect.y + 5);
}

function drawPlayer() {
    // Glow effect when invincible or dashing
    if (player.invincible || player.isDashing) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = player.invincible ? '#6a9955' : '#007acc';
    }

    // Player cursor shape
    ctx.fillStyle = player.invincible ? '#6a9955' : (player.isDashing ? '#007acc' : '#ffffff');

    // Main cursor line
    ctx.fillRect(player.x + 4, player.y, 3, player.height);

    // Top bracket
    ctx.fillRect(player.x, player.y, player.width, 3);

    // Bottom bracket
    ctx.fillRect(player.x, player.y + player.height - 3, player.width, 3);

    // Highlight
    ctx.fillStyle = 'rgba(0, 122, 204, 0.3)';
    ctx.fillRect(player.x - 2, player.y, player.width + 4, player.height);

    ctx.shadowBlur = 0;
}

function drawHUD() {
    // Mission display
    if (currentMission) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 10, 250, 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Consolas';
        ctx.textAlign = 'left';
        ctx.fillText(`Stage ${stage}: ${currentMission.desc}`, 20, 28);

        // Progress bar
        const progress = Math.min(1, missionProgress / currentMission.target);
        ctx.fillStyle = '#333';
        ctx.fillRect(20, 38, 200, 8);
        ctx.fillStyle = '#4ec9b0';
        ctx.fillRect(20, 38, 200 * progress, 8);

        ctx.fillStyle = '#888';
        ctx.fillText(`${missionProgress}/${currentMission.target}`, 225, 46);
    }

    // Dash cooldown indicator
    if (player.dashCooldown > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(canvas.width - 70, 10, 60, 20);
        ctx.fillStyle = '#888';
        ctx.font = '11px Consolas';
        ctx.textAlign = 'right';
        ctx.fillText(`DASH: ${Math.ceil(player.dashCooldown / 15)}s`, canvas.width - 15, 24);
    } else {
        ctx.fillStyle = '#007acc';
        ctx.font = '11px Consolas';
        ctx.textAlign = 'right';
        ctx.fillText('SHIFT=DASH', canvas.width - 15, 24);
    }

    ctx.textAlign = 'left';
}

// Start
initWorld();
highScoreElement.innerText = highScore;
updateRank();
logToTerminal('Code Dash v3.0 - Mission Mode', 'info');
logToTerminal('Arrow keys to move, SHIFT to dash', 'info');
logToTerminal('Press SPACE to start', 'info');

gameRunning = false;
ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#ffffff';
ctx.font = '22px Consolas';
ctx.textAlign = 'center';
ctx.fillText('Code Dash', canvas.width / 2, canvas.height / 2 - 40);
ctx.font = '14px Consolas';
ctx.fillStyle = '#888888';
ctx.fillText('Arrow Keys: Move | SHIFT: Dash', canvas.width / 2, canvas.height / 2);
ctx.fillText('Collect items, complete missions!', canvas.width / 2, canvas.height / 2 + 25);
ctx.fillStyle = '#4ec9b0';
ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2 + 60);
requestAnimationFrame(gameLoop);
