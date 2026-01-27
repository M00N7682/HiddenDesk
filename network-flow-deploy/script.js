const gridElement = document.getElementById('game-grid');
const statusText = document.getElementById('system-status');
const levelText = document.getElementById('level-display');
const overlay = document.getElementById('overlay-screen');
const levelCompleteOverlay = document.getElementById('level-complete-screen');
const stealthOverlay = document.getElementById('stealth-overlay');
const terminalOutput = document.getElementById('terminal-body');
const startBtn = document.getElementById('start-btn');
const nextLevelBtn = document.getElementById('next-level-btn');

// Game State
let level = 1;
let width = 5;
let height = 5;
let grid = [];
let isGameActive = false;
let sourcePosition = { x: 0, y: 0 };
let endpoints = [];

// Score System
let moveCount = 0;
let totalScore = 0;
let levelStartTime = 0;
let hintsUsed = 0;

// Difficulty
let difficulty = 'normal'; // easy, normal, hard

// Undo System
let moveHistory = [];
const MAX_HISTORY = 20;

// Locked tiles (correctly positioned)
let lockedTiles = new Set();

// Tile Types
const TILE_TYPES = {
    STRAIGHT: { id: 'straight', connections: [1, 0, 1, 0] },
    CORNER: { id: 'corner', connections: [1, 1, 0, 0] },
    T_SHAPE: { id: 't', connections: [1, 1, 1, 0] },
    CROSS: { id: 'cross', connections: [1, 1, 1, 1] },
    ENDPOINT: { id: 'endpoint', connections: [1, 0, 0, 0] }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setInterval(updateStealthTerminal, 1000);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleStealth();
        if (e.key.toLowerCase() === 'h' && isGameActive) showHint();
        if (e.key.toLowerCase() === 'z' && isGameActive) undoMove();
        if (e.key.toLowerCase() === 'r' && isGameActive) resetLevel();
    });

    if (startBtn) startBtn.addEventListener('click', () => showDifficultySelect());
    if (nextLevelBtn) nextLevelBtn.addEventListener('click', () => {
        levelCompleteOverlay.classList.add('hidden');
        nextLevel();
    });
});

function showDifficultySelect() {
    // Check if difficulty select already exists
    const existing = document.querySelector('.difficulty-select');
    if (existing) {
        existing.remove();
        startGame();
        return;
    }

    const modal = overlay.querySelector('.modal');
    const selectDiv = document.createElement('div');
    selectDiv.className = 'difficulty-select';
    selectDiv.innerHTML = `
        <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Select Difficulty:</strong></p>
        <div class="diff-buttons">
            <button class="diff-btn" data-diff="easy">🌱 Easy</button>
            <button class="diff-btn selected" data-diff="normal">⚡ Normal</button>
            <button class="diff-btn" data-diff="hard">🔥 Hard</button>
        </div>
        <p class="diff-desc" id="diff-desc">Standard 5x5 grid, hints available</p>
    `;

    modal.insertBefore(selectDiv, modal.querySelector('.stealth-hint'));

    // Update button text
    startBtn.textContent = 'Start Network';

    // Event listeners for difficulty buttons
    selectDiv.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectDiv.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            difficulty = btn.dataset.diff;

            const desc = document.getElementById('diff-desc');
            if (difficulty === 'easy') {
                desc.textContent = '4x4 grid, unlimited hints, auto-lock correct tiles';
            } else if (difficulty === 'normal') {
                desc.textContent = 'Standard 5x5 grid, hints available';
            } else {
                desc.textContent = '6x6 grid, no hints, faster scaling';
            }
        });
    });
}

function startGame() {
    overlay.classList.add('hidden');
    isGameActive = true;
    level = 1;
    totalScore = 0;

    // Set initial size based on difficulty
    if (difficulty === 'easy') {
        width = 4;
        height = 4;
    } else if (difficulty === 'normal') {
        width = 5;
        height = 5;
    } else {
        width = 6;
        height = 6;
    }

    generateLevel();
    updateUI();
}

function nextLevel() {
    level++;

    // Increase difficulty
    const maxSize = difficulty === 'easy' ? 7 : (difficulty === 'normal' ? 9 : 10);
    const growthRate = difficulty === 'hard' ? 1 : 2;

    if (level % growthRate === 0 && width < maxSize) {
        width++;
        height++;
    }

    generateLevel();
    updateUI();
}

function resetLevel() {
    moveCount = 0;
    hintsUsed = 0;
    moveHistory = [];
    lockedTiles.clear();
    levelStartTime = Date.now();

    // Randomize rotations again
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let cell = grid[y][x];
            let randomRot = Math.floor(Math.random() * 4);
            cell.rotation = (cell.correctRotation + randomRot) % 4;
        }
    }

    renderGrid();
    checkConnections();
    updateUI();
}

function toggleStealth() {
    stealthOverlay.classList.toggle('hidden');
}

// Level Generation
function generateLevel() {
    grid = [];
    moveCount = 0;
    hintsUsed = 0;
    moveHistory = [];
    lockedTiles.clear();
    levelStartTime = Date.now();

    gridElement.style.gridTemplateColumns = `repeat(${width}, 60px)`;
    gridElement.style.gridTemplateRows = `repeat(${height}, 60px)`;
    gridElement.innerHTML = '';

    // Initialize empty grid
    for (let y = 0; y < height; y++) {
        let row = [];
        for (let x = 0; x < width; x++) {
            row.push({
                x, y,
                visited: false,
                connections: [0, 0, 0, 0],
                type: null,
                rotation: 0,
                correctRotation: 0,
                isSource: false,
                isEndpoint: false,
                active: false
            });
        }
        grid.push(row);
    }

    // Generate Maze
    let startX = Math.floor(Math.random() * width);
    let startY = Math.floor(Math.random() * height);
    sourcePosition = { x: startX, y: startY };
    grid[startY][startX].isSource = true;

    carvePassages(startX, startY);

    // Determine Tile Types
    endpoints = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let cell = grid[y][x];
            let conns = cell.connections;
            let sum = conns.reduce((a, b) => a + b, 0);

            if (cell.isSource) {
                assignShape(cell, conns);
            } else if (sum === 1) {
                cell.isEndpoint = true;
                endpoints.push(cell);
                cell.type = TILE_TYPES.ENDPOINT;
                if (conns[0]) cell.rotation = 0;
                if (conns[1]) cell.rotation = 1;
                if (conns[2]) cell.rotation = 2;
                if (conns[3]) cell.rotation = 3;
            } else {
                assignShape(cell, conns);
            }
            // Store correct rotation
            cell.correctRotation = cell.rotation;
        }
    }

    // Scramble Rotations
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let cell = grid[y][x];
            let randomRot = Math.floor(Math.random() * 4);
            cell.rotation = (cell.rotation + randomRot) % 4;
        }
    }

    renderGrid();
    checkConnections();
}

function carvePassages(cx, cy) {
    grid[cy][cx].visited = true;

    const dirs = [
        { dx: 0, dy: -1, bit: 0, opp: 2 },
        { dx: 1, dy: 0, bit: 1, opp: 3 },
        { dx: 0, dy: 1, bit: 2, opp: 0 },
        { dx: -1, dy: 0, bit: 3, opp: 1 }
    ];

    dirs.sort(() => Math.random() - 0.5);

    for (let dir of dirs) {
        let nx = cx + dir.dx;
        let ny = cy + dir.dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !grid[ny][nx].visited) {
            grid[cy][cx].connections[dir.bit] = 1;
            grid[ny][nx].connections[dir.opp] = 1;
            carvePassages(nx, ny);
        }
    }
}

function assignShape(cell, conns) {
    const rotateArr = (arr, times) => {
        let a = [...arr];
        for (let i = 0; i < times; i++) {
            a.unshift(a.pop());
        }
        return a;
    };

    const types = [TILE_TYPES.STRAIGHT, TILE_TYPES.CORNER, TILE_TYPES.T_SHAPE, TILE_TYPES.CROSS, TILE_TYPES.ENDPOINT];

    for (let type of types) {
        for (let r = 0; r < 4; r++) {
            let rotated = rotateArr(type.connections, r);
            if (JSON.stringify(rotated) === JSON.stringify(conns)) {
                cell.type = type;
                cell.rotation = r;
                return;
            }
        }
    }
    cell.type = TILE_TYPES.CROSS;
}

// Rendering
function renderGrid() {
    gridElement.innerHTML = '';
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let cell = grid[y][x];
            let el = document.createElement('div');
            el.className = 'cell';
            el.dataset.x = x;
            el.dataset.y = y;

            const key = `${x},${y}`;
            if (lockedTiles.has(key)) {
                el.classList.add('locked');
            }

            el.onclick = () => rotateTile(x, y);

            let comp = document.createElement('div');
            comp.className = `component type-${cell.type.id}`;
            comp.style.transform = `rotate(${cell.rotation * 90}deg)`;
            comp.id = `cell-${x}-${y}`;

            if (cell.type === TILE_TYPES.STRAIGHT) {
                comp.innerHTML = '<div class="cable v"></div>';
            } else if (cell.type === TILE_TYPES.CORNER) {
                comp.innerHTML = '<div class="cable v"></div><div class="cable h"></div>';
            } else if (cell.type === TILE_TYPES.T_SHAPE) {
                comp.innerHTML = generateArms(cell.type.connections);
            } else if (cell.type === TILE_TYPES.CROSS) {
                comp.innerHTML = generateArms([1, 1, 1, 1]);
            } else if (cell.type === TILE_TYPES.ENDPOINT) {
                comp.innerHTML = '<div class="cable v" style="height: 50%; top: 0;"></div>';
            }

            if (cell.isSource) {
                el.classList.add('source');
                let icon = document.createElement('i');
                icon.className = 'fas fa-server device-icon';
                el.appendChild(icon);
            } else if (cell.isEndpoint) {
                el.classList.add('endpoint');
                let icon = document.createElement('i');
                icon.className = 'fas fa-desktop device-icon';
                el.appendChild(icon);
            }

            el.appendChild(comp);
            gridElement.appendChild(el);
        }
    }
}

function generateArms(conns) {
    let html = '';
    if (conns[0]) html += '<div class="cable" style="width: 8px; height: 50%; top: 0; left: 26px;"></div>';
    if (conns[1]) html += '<div class="cable" style="width: 50%; height: 8px; top: 26px; right: 0;"></div>';
    if (conns[2]) html += '<div class="cable" style="width: 8px; height: 50%; bottom: 0; left: 26px;"></div>';
    if (conns[3]) html += '<div class="cable" style="width: 50%; height: 8px; top: 26px; left: 0;"></div>';
    return html;
}

// Game Logic
function rotateTile(x, y) {
    if (!isGameActive) return;

    const key = `${x},${y}`;
    if (lockedTiles.has(key)) return; // Can't rotate locked tiles

    let cell = grid[y][x];

    // Save to history
    moveHistory.push({ x, y, prevRotation: cell.rotation });
    if (moveHistory.length > MAX_HISTORY) {
        moveHistory.shift();
    }

    cell.rotation = (cell.rotation + 1) % 4;
    moveCount++;

    let comp = document.getElementById(`cell-${x}-${y}`);
    comp.style.transform = `rotate(${cell.rotation * 90}deg)`;

    checkConnections();
    updateUI();
}

function undoMove() {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory.pop();
    let cell = grid[lastMove.y][lastMove.x];
    cell.rotation = lastMove.prevRotation;

    let comp = document.getElementById(`cell-${lastMove.x}-${lastMove.y}`);
    comp.style.transform = `rotate(${cell.rotation * 90}deg)`;

    checkConnections();
}

function showHint() {
    if (difficulty === 'hard') return; // No hints in hard mode

    // Find a tile that's not in correct position
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let cell = grid[y][x];
            const key = `${x},${y}`;

            if (!lockedTiles.has(key) && cell.rotation !== cell.correctRotation) {
                // Highlight this tile
                const el = gridElement.children[y * width + x];
                el.classList.add('hint');
                hintsUsed++;

                // Show correct rotation preview
                const rotationsNeeded = (cell.correctRotation - cell.rotation + 4) % 4;

                setTimeout(() => {
                    el.classList.remove('hint');
                }, 1500);

                return;
            }
        }
    }
}

function checkConnections() {
    // Reset active state
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            grid[y][x].active = false;
        }
    }

    // BFS from Source
    let queue = [sourcePosition];
    grid[sourcePosition.y][sourcePosition.x].active = true;

    while (queue.length > 0) {
        let curr = queue.shift();
        let cx = curr.x;
        let cy = curr.y;
        let cell = grid[cy][cx];
        let currConns = getEffectiveConnections(cell);

        const dirs = [
            { dx: 0, dy: -1, bit: 0, opp: 2 },
            { dx: 1, dy: 0, bit: 1, opp: 3 },
            { dx: 0, dy: 1, bit: 2, opp: 0 },
            { dx: -1, dy: 0, bit: 3, opp: 1 }
        ];

        for (let dir of dirs) {
            if (currConns[dir.bit]) {
                let nx = cx + dir.dx;
                let ny = cy + dir.dy;

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    let neighbor = grid[ny][nx];
                    if (!neighbor.active) {
                        let neighborConns = getEffectiveConnections(neighbor);
                        if (neighborConns[dir.opp]) {
                            neighbor.active = true;
                            queue.push({ x: nx, y: ny });
                        }
                    }
                }
            }
        }
    }

    // Auto-lock correctly positioned tiles (Easy mode only)
    if (difficulty === 'easy') {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let cell = grid[y][x];
                if (cell.active && cell.rotation === cell.correctRotation) {
                    lockedTiles.add(`${x},${y}`);
                    const el = gridElement.children[y * width + x];
                    if (el) el.classList.add('locked');
                }
            }
        }
    }

    updateVisuals();
    checkWinCondition();
}

function getEffectiveConnections(cell) {
    let arr = [...cell.type.connections];
    for (let i = 0; i < cell.rotation; i++) {
        arr.unshift(arr.pop());
    }
    return arr;
}

function updateVisuals() {
    let activeEndpoints = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let cell = grid[y][x];
            let el = gridElement.children[y * width + x];
            if (!el) continue;

            let cables = el.querySelectorAll('.cable');
            let icon = el.querySelector('.device-icon');

            if (cell.active) {
                cables.forEach(c => c.classList.add('active'));
                if (icon) icon.classList.add('active');
                if (cell.isEndpoint) activeEndpoints++;
            } else {
                cables.forEach(c => c.classList.remove('active'));
                if (icon) icon.classList.remove('active');
            }
        }
    }

    if (activeEndpoints === endpoints.length) {
        statusText.innerHTML = '<span class="online">ONLINE</span>';
    } else {
        statusText.innerHTML = '<span class="offline">OFFLINE</span>';
    }
}

function updateUI() {
    levelText.textContent = level;

    // Update score display if exists
    const scoreEl = document.getElementById('score-display');
    if (scoreEl) {
        scoreEl.textContent = totalScore;
    }

    const movesEl = document.getElementById('moves-display');
    if (movesEl) {
        movesEl.textContent = moveCount;
    }
}

function checkWinCondition() {
    let allEndpointsActive = endpoints.every(ep => ep.active);
    if (allEndpointsActive) {
        // Calculate score
        const timeBonus = Math.max(0, 1000 - Math.floor((Date.now() - levelStartTime) / 100));
        const moveBonus = Math.max(0, 500 - moveCount * 10);
        const hintPenalty = hintsUsed * 50;
        const difficultyMultiplier = difficulty === 'easy' ? 1 : (difficulty === 'normal' ? 1.5 : 2);

        const levelScore = Math.floor((timeBonus + moveBonus - hintPenalty) * difficultyMultiplier);
        totalScore += Math.max(levelScore, 100); // Minimum 100 points per level

        setTimeout(() => {
            // Update level complete screen
            const completeModal = levelCompleteOverlay.querySelector('.modal');
            if (completeModal) {
                const latency = Math.floor(Math.random() * 20) + 5;
                completeModal.innerHTML = `
                    <h1><i class="fas fa-check-circle"></i> Connection Established</h1>
                    <p>Zone ${level} Online. Latency: ${latency}ms</p>
                    <p class="score-detail">Moves: ${moveCount} | Time Bonus: +${timeBonus} | Level Score: +${levelScore}</p>
                    <p class="total-score">Total Score: ${totalScore}</p>
                    <button id="next-level-btn" class="primary-btn">Next Zone</button>
                `;

                // Re-attach event listener
                document.getElementById('next-level-btn').addEventListener('click', () => {
                    levelCompleteOverlay.classList.add('hidden');
                    nextLevel();
                });
            }

            levelCompleteOverlay.classList.remove('hidden');
        }, 500);
    }
}

// Stealth Mode
function updateStealthTerminal() {
    if (stealthOverlay.classList.contains('hidden')) return;

    const line = document.createElement('div');
    const ms = Math.floor(Math.random() * 50) + 10;
    line.textContent = `Reply from 8.8.8.8: bytes=32 time=${ms}ms TTL=64`;
    terminalOutput.appendChild(line);

    if (terminalOutput.children.length > 20) {
        terminalOutput.removeChild(terminalOutput.firstChild);
    }
}

// Expose for HTML
window.startGame = startGame;
