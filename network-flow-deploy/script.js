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
let width = 6;
let height = 6;
let grid = []; // 2D array of tile objects
let isGameActive = false;
let sourcePosition = { x: 0, y: 0 };
let endpoints = [];

// Tile Types (defined by connections: [Top, Right, Bottom, Left])
const TILE_TYPES = {
    STRAIGHT: { id: 'straight', connections: [1, 0, 1, 0] }, // |
    CORNER: { id: 'corner', connections: [1, 1, 0, 0] },     // └
    T_SHAPE: { id: 't', connections: [1, 1, 1, 0] },         // ├
    CROSS: { id: 'cross', connections: [1, 1, 1, 1] },       // +
    ENDPOINT: { id: 'endpoint', connections: [1, 0, 0, 0] }  // ╵
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Start stealth loop
    setInterval(updateStealthTerminal, 1000);
    
    // Event Listeners
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleStealth();
    });

    if (startBtn) startBtn.addEventListener('click', startGame);
    if (nextLevelBtn) nextLevelBtn.addEventListener('click', () => {
        levelCompleteOverlay.classList.add('hidden');
        nextLevel();
    });
});

function startGame() {
    overlay.classList.add('hidden');
    isGameActive = true;
    generateLevel();
}

function nextLevel() {
    level++;
    levelText.textContent = level;
    // Increase difficulty
    if (level % 2 === 0 && width < 10) {
        width++;
        height++;
    }
    generateLevel();
}

function toggleStealth() {
    stealthOverlay.classList.toggle('hidden');
}

// --- Level Generation (Recursive Backtracker for Spanning Tree) ---
function generateLevel() {
    grid = [];
    gridElement.style.gridTemplateColumns = `repeat(${width}, 60px)`;
    gridElement.style.gridTemplateRows = `repeat(${height}, 60px)`;
    gridElement.innerHTML = '';

    // 1. Initialize empty grid
    for (let y = 0; y < height; y++) {
        let row = [];
        for (let x = 0; x < width; x++) {
            row.push({
                x, y,
                visited: false,
                connections: [0, 0, 0, 0], // N, E, S, W
                type: null,
                rotation: 0,
                isSource: false,
                isEndpoint: false,
                active: false
            });
        }
        grid.push(row);
    }

    // 2. Generate Maze (Spanning Tree)
    // Start from random point
    let startX = Math.floor(Math.random() * width);
    let startY = Math.floor(Math.random() * height);
    sourcePosition = { x: startX, y: startY };
    grid[startY][startX].isSource = true;

    carvePassages(startX, startY);

    // 3. Determine Tile Types based on connections
    endpoints = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let cell = grid[y][x];
            let conns = cell.connections;
            let sum = conns.reduce((a, b) => a + b, 0);

            if (cell.isSource) {
                // Source is special, but visually it needs a pipe shape underneath
                // We'll assign a shape that fits its connections
                assignShape(cell, conns);
            } else if (sum === 1) {
                cell.isEndpoint = true;
                endpoints.push(cell);
                cell.type = TILE_TYPES.ENDPOINT;
                // Rotate endpoint to match connection
                if (conns[0]) cell.rotation = 0; // Up
                if (conns[1]) cell.rotation = 1; // Right
                if (conns[2]) cell.rotation = 2; // Down
                if (conns[3]) cell.rotation = 3; // Left
            } else {
                assignShape(cell, conns);
            }
        }
    }

    // 4. Scramble Rotations
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let cell = grid[y][x];
            // Random rotation 0-3
            let randomRot = Math.floor(Math.random() * 4);
            cell.rotation = (cell.rotation + randomRot) % 4;
        }
    }

    // 5. Render
    renderGrid();
    checkConnections(); // Initial check
}

function carvePassages(cx, cy) {
    grid[cy][cx].visited = true;
    
    // Directions: N, E, S, W
    const dirs = [
        { dx: 0, dy: -1, bit: 0, opp: 2 }, // North
        { dx: 1, dy: 0, bit: 1, opp: 3 },  // East
        { dx: 0, dy: 1, bit: 2, opp: 0 },  // South
        { dx: -1, dy: 0, bit: 3, opp: 1 }  // West
    ];

    // Shuffle directions
    dirs.sort(() => Math.random() - 0.5);

    for (let dir of dirs) {
        let nx = cx + dir.dx;
        let ny = cy + dir.dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !grid[ny][nx].visited) {
            // Carve connection
            grid[cy][cx].connections[dir.bit] = 1;
            grid[ny][nx].connections[dir.opp] = 1;
            carvePassages(nx, ny);
        }
    }
}

function assignShape(cell, conns) {
    // conns is [N, E, S, W] (1 or 0)
    // We need to find a base shape and a rotation that matches 'conns'
    
    // Helper to rotate array
    const rotateArr = (arr, times) => {
        let a = [...arr];
        for(let i=0; i<times; i++) {
            a.unshift(a.pop());
        }
        return a;
    };

    // Try to match with base types
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
    // Fallback (shouldn't happen in a perfect maze)
    cell.type = TILE_TYPES.CROSS; 
}

// --- Rendering ---
function renderGrid() {
    gridElement.innerHTML = '';
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let cell = grid[y][x];
            let el = document.createElement('div');
            el.className = 'cell';
            el.dataset.x = x;
            el.dataset.y = y;
            el.onclick = () => rotateTile(x, y);

            // Inner component for rotation
            let comp = document.createElement('div');
            comp.className = `component type-${cell.type.id}`;
            comp.style.transform = `rotate(${cell.rotation * 90}deg)`;
            comp.id = `cell-${x}-${y}`;

            // Cables
            if (cell.type === TILE_TYPES.STRAIGHT) {
                comp.innerHTML = '<div class="cable v"></div>';
            } else if (cell.type === TILE_TYPES.CORNER) {
                comp.innerHTML = '<div class="cable v"></div><div class="cable h"></div>';
            } else if (cell.type === TILE_TYPES.T_SHAPE) {
                comp.innerHTML = '<div class="cable v"></div><div class="cable h"></div>'; // T needs specific CSS or multiple divs? 
                // Actually, let's simplify CSS for T and Cross.
                // T: Top, Right, Bottom. 
                // We can use a center block and arms.
                // For simplicity in this CSS-based rendering, let's use 4 arms for everything and hide based on type.
                comp.innerHTML = generateArms(cell.type.connections);
            } else if (cell.type === TILE_TYPES.CROSS) {
                comp.innerHTML = generateArms([1,1,1,1]);
            } else if (cell.type === TILE_TYPES.ENDPOINT) {
                comp.innerHTML = '<div class="cable v" style="height: 50%; top: 0;"></div>'; // Just a stub
            }

            // Icons
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
    // conns: [N, E, S, W]
    let html = '';
    if (conns[0]) html += '<div class="cable" style="width: 8px; height: 50%; top: 0; left: 26px;"></div>';
    if (conns[1]) html += '<div class="cable" style="width: 50%; height: 8px; top: 26px; right: 0;"></div>';
    if (conns[2]) html += '<div class="cable" style="width: 8px; height: 50%; bottom: 0; left: 26px;"></div>';
    if (conns[3]) html += '<div class="cable" style="width: 50%; height: 8px; top: 26px; left: 0;"></div>';
    return html;
}

// --- Game Logic ---
function rotateTile(x, y) {
    if (!isGameActive) return;
    
    let cell = grid[y][x];
    cell.rotation = (cell.rotation + 1) % 4;
    
    // Update visual
    let comp = document.getElementById(`cell-${x}-${y}`);
    comp.style.transform = `rotate(${cell.rotation * 90}deg)`;

    checkConnections();
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

        // Get current effective connections (after rotation)
        let currConns = getEffectiveConnections(cell);

        // Check neighbors
        const dirs = [
            { dx: 0, dy: -1, bit: 0, opp: 2 }, // N
            { dx: 1, dy: 0, bit: 1, opp: 3 },  // E
            { dx: 0, dy: 1, bit: 2, opp: 0 },  // S
            { dx: -1, dy: 0, bit: 3, opp: 1 }  // W
        ];

        for (let dir of dirs) {
            // If current cell has a connection in this direction
            if (currConns[dir.bit]) {
                let nx = cx + dir.dx;
                let ny = cy + dir.dy;

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    let neighbor = grid[ny][nx];
                    if (!neighbor.active) {
                        let neighborConns = getEffectiveConnections(neighbor);
                        // Check if neighbor connects back
                        if (neighborConns[dir.opp]) {
                            neighbor.active = true;
                            queue.push({ x: nx, y: ny });
                        }
                    }
                }
            }
        }
    }

    updateVisuals();
    checkWinCondition();
}

function getEffectiveConnections(cell) {
    // Rotate the base connections array 'rotation' times
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

    // Update Status
    if (activeEndpoints === endpoints.length) {
        statusText.innerHTML = '<span class="online">ONLINE</span>';
    } else {
        statusText.innerHTML = '<span class="offline">OFFLINE</span>';
    }
}

function checkWinCondition() {
    let allEndpointsActive = endpoints.every(ep => ep.active);
    if (allEndpointsActive) {
        setTimeout(() => {
            // Show Level Complete Overlay
            levelCompleteOverlay.classList.remove('hidden');
        }, 500);
    }
}

// --- Stealth Mode ---
function updateStealthTerminal() {
    if (stealthOverlay.classList.contains('hidden')) return;

    const line = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    const ms = Math.floor(Math.random() * 50) + 10;
    line.textContent = `Reply from 192.168.1.${Math.floor(Math.random()*255)}: bytes=32 time=${ms}ms TTL=64`;
    terminalOutput.appendChild(line);

    if (terminalOutput.children.length > 20) {
        terminalOutput.removeChild(terminalOutput.firstChild);
    }
}
