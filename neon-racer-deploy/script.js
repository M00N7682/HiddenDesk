const canvas = document.getElementById('game-canvas');
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const hud = document.getElementById('hud');
const stealthScreen = document.getElementById('stealth-screen');
const logOutput = document.getElementById('log-output');

// Game Config
const ROAD_HEIGHT = 22;
const LANES = 5;
const LANE_WIDTH = 7;
const ROAD_WIDTH = LANES * LANE_WIDTH + 2; // +2 for borders

// Characters
const PLAYER_CHAR = '@';
const OBSTACLE_CHAR = '#';
const ROAD_CHAR = '.';
const BORDER_CHAR = '|';
const BOOST_CHAR = '>';
const COIN_CHAR = '$';
const SLOW_CHAR = '!';
const LANE_MARKER = ':';

// Game State
let gameLoop;
let score = 0;
let health = 100;
let currentLane = 2; // 0-4, start in middle
let road = [];
let isPlaying = false;
let isStealthMode = false;
let stealthInterval;

// Dynamic difficulty
let baseFPS = 12;
let currentFPS = 12;
let lastObstaclePositions = []; // Track last 3 obstacle positions to prevent impossible patterns

// Powerup states
let isBoostActive = false;
let boostTimer = 0;
let isSlowActive = false;
let slowTimer = 0;

// Lane change cooldown
let canChangeLane = true;
let laneCooldown = 150; // ms

// Get X position for a lane (center of lane)
function getLaneX(lane) {
    return 1 + (lane * LANE_WIDTH) + Math.floor(LANE_WIDTH / 2);
}

// Initialize Road
function initRoad() {
    road = [];
    for (let y = 0; y < ROAD_HEIGHT; y++) {
        road.push(createEmptyRow());
    }
    lastObstaclePositions = [-1, -1, -1];
}

function createEmptyRow() {
    let row = [];
    // Left border
    row.push(BORDER_CHAR);

    // Lanes with markers
    for (let lane = 0; lane < LANES; lane++) {
        for (let i = 0; i < LANE_WIDTH; i++) {
            if (i === 0 && lane > 0) {
                row.push(LANE_MARKER); // Lane divider
            } else {
                row.push(ROAD_CHAR);
            }
        }
    }

    // Right border
    row.push(BORDER_CHAR);
    return row;
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
            changeLane(-1);
            break;
        case 'ArrowRight':
            changeLane(1);
            break;
        case 'Escape':
            toggleStealth();
            break;
    }
});

function changeLane(direction) {
    if (!canChangeLane) return;

    const newLane = currentLane + direction;
    if (newLane >= 0 && newLane < LANES) {
        currentLane = newLane;
        canChangeLane = false;
        setTimeout(() => { canChangeLane = true; }, laneCooldown);
    }
}

function startGame() {
    startScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    canvas.classList.remove('hidden');
    isPlaying = true;
    score = 0;
    health = 100;
    currentLane = 2;
    currentFPS = baseFPS;
    isBoostActive = false;
    isSlowActive = false;
    initRoad();
    updateHUD();
    scheduleNextFrame();
}

function resetGame() {
    gameOverScreen.classList.add('hidden');
    startGame();
}

function scheduleNextFrame() {
    if (!isPlaying) return;

    let fps = currentFPS;
    if (isSlowActive) fps = Math.max(8, fps * 0.5);
    if (isBoostActive) fps = fps * 1.5;

    gameLoop = setTimeout(() => {
        update();
        scheduleNextFrame();
    }, 1000 / fps);
}

function gameOver() {
    isPlaying = false;
    clearTimeout(gameLoop);
    canvas.classList.add('hidden');
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.innerText = score;
}

function generateNewRow() {
    let row = createEmptyRow();

    // Spawn obstacle with smart placement
    if (Math.random() < 0.35) {
        let obstacleLane = chooseObstacleLane();
        if (obstacleLane !== -1) {
            placeObstacle(row, obstacleLane);
            lastObstaclePositions.push(obstacleLane);
            lastObstaclePositions.shift();
        }
    } else {
        lastObstaclePositions.push(-1);
        lastObstaclePositions.shift();
    }

    // Spawn items (lower chance)
    if (Math.random() < 0.08) {
        let itemLane = Math.floor(Math.random() * LANES);
        // Don't place item on obstacle
        let laneX = getLaneX(itemLane);
        if (row[laneX] === ROAD_CHAR || row[laneX] === LANE_MARKER) {
            let itemType = Math.random();
            if (itemType < 0.4) {
                row[laneX] = COIN_CHAR;
            } else if (itemType < 0.7) {
                row[laneX] = BOOST_CHAR;
            } else {
                row[laneX] = SLOW_CHAR;
            }
        }
    }

    return row;
}

function chooseObstacleLane() {
    // Get valid lanes (not creating impossible situations)
    let validLanes = [];

    for (let lane = 0; lane < LANES; lane++) {
        let isValid = true;

        // Check if this would create a wall with previous obstacles
        // If last 2 rows had obstacles in adjacent lanes, avoid completing the wall
        let recentObs = lastObstaclePositions.filter(p => p !== -1);

        if (recentObs.length >= 2) {
            // Check if placing here would block all paths
            let blocked = [...recentObs, lane];
            let uniqueBlocked = [...new Set(blocked)];

            // If blocking 3+ consecutive lanes in recent rows, invalid
            if (uniqueBlocked.length >= 3) {
                let sorted = uniqueBlocked.sort((a, b) => a - b);
                let consecutive = 1;
                for (let i = 1; i < sorted.length; i++) {
                    if (sorted[i] - sorted[i-1] === 1) {
                        consecutive++;
                    }
                }
                if (consecutive >= 3) {
                    isValid = false;
                }
            }
        }

        // Avoid placing in same lane as last obstacle (boring)
        if (lastObstaclePositions[2] === lane) {
            isValid = Math.random() < 0.3; // 30% chance to allow
        }

        // Slight bias away from player's current lane (give reaction time)
        if (lane === currentLane && Math.random() < 0.4) {
            isValid = false;
        }

        if (isValid) {
            validLanes.push(lane);
        }
    }

    if (validLanes.length === 0) {
        return -1; // No obstacle this row
    }

    return validLanes[Math.floor(Math.random() * validLanes.length)];
}

function placeObstacle(row, lane) {
    let startX = 1 + (lane * LANE_WIDTH);
    let width = Math.floor(Math.random() * 3) + 3; // 3-5 width

    for (let i = 1; i < LANE_WIDTH - 1 && i < width + 1; i++) {
        row[startX + i] = OBSTACLE_CHAR;
    }
}

function update() {
    // Update timers
    if (isBoostActive) {
        boostTimer--;
        if (boostTimer <= 0) isBoostActive = false;
    }
    if (isSlowActive) {
        slowTimer--;
        if (slowTimer <= 0) isSlowActive = false;
    }

    // Move Road (Scroll)
    road.pop();
    road.unshift(generateNewRow());

    // Check collision at player position
    const playerY = ROAD_HEIGHT - 3;
    const playerX = getLaneX(currentLane);
    const cell = road[playerY][playerX];

    // Handle collisions
    if (cell === OBSTACLE_CHAR) {
        if (isBoostActive) {
            // Boost mode: destroy obstacle, no damage
            road[playerY][playerX] = ROAD_CHAR;
            score += 5;
        } else {
            health -= 25;
            road[playerY][playerX] = ROAD_CHAR; // Remove obstacle after hit
            updateHUD();
            if (health <= 0) {
                gameOver();
                return;
            }
        }
    } else if (cell === COIN_CHAR) {
        score += 10;
        road[playerY][playerX] = ROAD_CHAR;
    } else if (cell === BOOST_CHAR) {
        isBoostActive = true;
        boostTimer = 30; // 30 frames
        road[playerY][playerX] = ROAD_CHAR;
    } else if (cell === SLOW_CHAR) {
        isSlowActive = true;
        slowTimer = 25; // 25 frames
        road[playerY][playerX] = ROAD_CHAR;
    }

    // Score increases per frame
    score++;

    // Dynamic FPS based on score
    if (score > 500) {
        currentFPS = 22;
    } else if (score > 300) {
        currentFPS = 18;
    } else if (score > 150) {
        currentFPS = 15;
    } else {
        currentFPS = baseFPS;
    }

    updateHUD();
    render();
}

function render() {
    const playerY = ROAD_HEIGHT - 3;
    const playerX = getLaneX(currentLane);

    let output = '';

    // Status line
    let statusLine = isBoostActive ? ' [BOOST ACTIVE] ' : isSlowActive ? ' [SLOW MODE] ' : '';
    if (statusLine) {
        output += statusLine + '\n';
    }

    for (let y = 0; y < ROAD_HEIGHT; y++) {
        for (let x = 0; x < road[y].length; x++) {
            if (y === playerY && x === playerX) {
                output += PLAYER_CHAR;
            } else {
                output += road[y][x];
            }
        }
        output += '\n';
    }

    // Speed indicator
    let speedBar = 'SPEED: ';
    let speedLevel = Math.min(5, Math.floor((currentFPS - baseFPS) / 2) + 1);
    if (isBoostActive) speedLevel = 5;
    if (isSlowActive) speedLevel = 1;
    for (let i = 0; i < 5; i++) {
        speedBar += i < speedLevel ? '=' : '-';
    }
    output += speedBar;

    canvas.innerText = output;
}

function updateHUD() {
    scoreElement.innerText = score;
    healthElement.innerText = health;
}

// Stealth Mode Logic
const fakeLogs = [
    "INFO: scanning ports 1-1024...",
    "DEBUG: packet id 0x4F3A received",
    "WARN: latency spike detected on node 4",
    "INFO: synchronizing database...",
    "TRACE: /usr/bin/sys_diag --verbose",
    "INFO: checking network interfaces...",
    "DEBUG: eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>",
    "INFO: MTU 1500, RX packets 847293, TX packets 623847",
    "TRACE: routing table updated",
    "INFO: DNS resolution: 8.8.8.8 -> dns.google",
    "DEBUG: TCP handshake completed in 23ms",
    "INFO: SSL certificate valid until 2025-12-31",
    "WARN: high CPU usage detected (78%)",
    "INFO: memory usage: 4.2GB / 16GB",
    "DEBUG: disk I/O: read 245MB/s, write 189MB/s",
    "INFO: firewall rules loaded: 47 active",
    "TRACE: netstat -an | grep ESTABLISHED",
    "INFO: active connections: 23",
    "DEBUG: checking for updates...",
    "INFO: system up to date"
];

function toggleStealth() {
    isStealthMode = !isStealthMode;
    if (isStealthMode) {
        clearTimeout(gameLoop);
        stealthScreen.classList.remove('hidden');
        stealthInterval = setInterval(addFakeLog, 150);
    } else {
        stealthScreen.classList.add('hidden');
        clearInterval(stealthInterval);
        logOutput.innerText = "";
        if (isPlaying) {
            scheduleNextFrame();
        }
    }
}

function addFakeLog() {
    const log = fakeLogs[Math.floor(Math.random() * fakeLogs.length)];
    const timestamp = new Date().toISOString();
    logOutput.innerText += `[${timestamp}] ${log}\n`;

    if (logOutput.innerText.length > 3000) {
        logOutput.innerText = logOutput.innerText.substring(800);
    }
}

// Initial Render
initRoad();
render();
