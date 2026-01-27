const gridContainer = document.getElementById('grid-container');
const startScreen = document.getElementById('start-screen');
const levelCompleteScreen = document.getElementById('level-complete-screen');
const startBtn = document.getElementById('start-btn');
const nextLevelBtn = document.getElementById('next-level-btn');
const levelDisplay = document.getElementById('level-display');
const movesDisplay = document.getElementById('moves-display');
const progressDisplay = document.getElementById('progress-display');
const stealthOverlay = document.getElementById('stealth-overlay');

// Game Config
let gridSize = 5;
let level = 1;
let moves = 0;
let score = 0;
let hintsUsed = 0;
let isPlaying = false;
let isStealth = false;

// Level Data
let grid = []; // { color: int, type: 'node'|'path'|'empty'|'blocked', fixed: bool }
let currentPath = null;
let endpoints = {}; // color -> [{x,y}, {x,y}]

// Colors for branches
const COLORS = ['#e06c75', '#98c379', '#61afef', '#e5c07b', '#c678dd', '#56b6c2', '#d19a66'];
const COLOR_NAMES = ['red', 'green', 'blue', 'yellow', 'purple', 'cyan', 'orange'];

// Input Handling
let isDragging = false;

document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') toggleStealth();
    if (e.code === 'KeyH' && isPlaying && !isStealth) {
        useHint();
    }
    if (e.code === 'KeyR' && isPlaying && !isStealth) {
        resetCurrentLevel();
    }
});

startBtn.addEventListener('click', startGame);
nextLevelBtn.addEventListener('click', nextLevel);

function toggleStealth() {
    isStealth = !isStealth;
    if (isStealth) {
        stealthOverlay.classList.remove('hidden');
    } else {
        stealthOverlay.classList.add('hidden');
    }
}

function startGame() {
    startScreen.classList.add('hidden');
    level = 1;
    score = 0;
    hintsUsed = 0;
    loadLevel(level);
}

function nextLevel() {
    levelCompleteScreen.classList.add('hidden');
    level++;
    loadLevel(level);
}

function getLevelConfig(lvl) {
    // Dynamic difficulty scaling
    let size, pairs, blocked;

    if (lvl <= 3) {
        size = 5;
        pairs = 3;
        blocked = 0;
    } else if (lvl <= 6) {
        size = 5;
        pairs = 4;
        blocked = Math.floor((lvl - 3) / 2);
    } else if (lvl <= 10) {
        size = 6;
        pairs = 4 + Math.floor((lvl - 6) / 2);
        blocked = Math.floor((lvl - 5) / 2);
    } else if (lvl <= 15) {
        size = 6;
        pairs = 5;
        blocked = Math.min(4, Math.floor((lvl - 8) / 2));
    } else if (lvl <= 20) {
        size = 7;
        pairs = 5 + Math.floor((lvl - 15) / 3);
        blocked = Math.min(5, Math.floor((lvl - 12) / 2));
    } else {
        // Endless mode: gradually increase
        size = Math.min(8, 7 + Math.floor((lvl - 20) / 10));
        pairs = Math.min(7, 6 + Math.floor((lvl - 20) / 5));
        blocked = Math.min(8, 5 + Math.floor((lvl - 20) / 4));
    }

    return { size, pairs, blocked };
}

function loadLevel(lvl) {
    const config = getLevelConfig(lvl);
    gridSize = config.size;
    moves = 0;
    isPlaying = true;

    // Generate procedural level
    generateProceduralLevel(config.size, config.pairs, config.blocked);

    updateUI();
    renderGrid();
}

function generateProceduralLevel(size, numPairs, numBlocked) {
    // Initialize empty grid
    grid = [];
    for (let y = 0; y < size; y++) {
        let row = [];
        for (let x = 0; x < size; x++) {
            row.push({ color: 0, type: 'empty', fixed: false });
        }
        grid.push(row);
    }

    endpoints = {};

    // Place blocked cells (obstacles)
    let blockedPlaced = 0;
    let attempts = 0;
    while (blockedPlaced < numBlocked && attempts < 100) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);

        if (grid[y][x].type === 'empty') {
            // Don't block corners (common endpoint locations)
            const isCorner = (x === 0 || x === size - 1) && (y === 0 || y === size - 1);
            if (!isCorner) {
                grid[y][x].type = 'blocked';
                blockedPlaced++;
            }
        }
        attempts++;
    }

    // Place endpoint pairs using a solvable strategy
    // We'll use a simple placement that ensures paths can exist
    for (let color = 1; color <= numPairs; color++) {
        let placed = false;
        attempts = 0;

        while (!placed && attempts < 200) {
            // Try to place two endpoints for this color
            const pos1 = getRandomEmptyCell(size);
            const pos2 = getRandomEmptyCell(size);

            if (pos1 && pos2 && (pos1.x !== pos2.x || pos1.y !== pos2.y)) {
                // Check minimum distance (at least 2 cells apart)
                const dist = Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
                if (dist >= 2) {
                    grid[pos1.y][pos1.x] = { color: color, type: 'node', fixed: true };
                    grid[pos2.y][pos2.x] = { color: color, type: 'node', fixed: true };
                    endpoints[color] = [pos1, pos2];
                    placed = true;
                }
            }
            attempts++;
        }

        if (!placed) {
            // Fallback: force place somewhere
            const emptyCells = [];
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (grid[y][x].type === 'empty') {
                        emptyCells.push({ x, y });
                    }
                }
            }

            if (emptyCells.length >= 2) {
                const idx1 = Math.floor(Math.random() * emptyCells.length);
                let idx2 = Math.floor(Math.random() * emptyCells.length);
                while (idx2 === idx1 && emptyCells.length > 1) {
                    idx2 = Math.floor(Math.random() * emptyCells.length);
                }

                const pos1 = emptyCells[idx1];
                const pos2 = emptyCells[idx2];
                grid[pos1.y][pos1.x] = { color: color, type: 'node', fixed: true };
                grid[pos2.y][pos2.x] = { color: color, type: 'node', fixed: true };
                endpoints[color] = [pos1, pos2];
            }
        }
    }
}

function getRandomEmptyCell(size) {
    const emptyCells = [];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (grid[y][x].type === 'empty') {
                emptyCells.push({ x, y });
            }
        }
    }

    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function renderGrid() {
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            const cellData = grid[y][x];

            if (cellData.type === 'blocked') {
                cell.classList.add('blocked');
            } else if (cellData.type === 'node') {
                const node = document.createElement('div');
                node.className = `node color-${cellData.color}`;
                cell.appendChild(node);
            }

            // Event Listeners
            cell.addEventListener('mousedown', handleInputStart);
            cell.addEventListener('mouseenter', handleInputMove);
            cell.addEventListener('mouseup', handleInputEnd);

            // Touch support
            cell.addEventListener('touchstart', handleTouchStart, { passive: false });
            cell.addEventListener('touchmove', handleTouchMove, { passive: false });
            cell.addEventListener('touchend', handleInputEnd);

            gridContainer.appendChild(cell);
        }
    }
}

function getCell(x, y) {
    return gridContainer.children[y * gridSize + x];
}

function handleInputStart(e) {
    if (!isPlaying || isStealth) return;
    e.preventDefault();

    const x = parseInt(this.dataset.x);
    const y = parseInt(this.dataset.y);
    const cellData = grid[y][x];

    if (cellData.color > 0 && cellData.type !== 'blocked') {
        isDragging = true;

        // Clear existing path of this color
        clearPath(cellData.color);

        currentPath = {
            color: cellData.color,
            cells: [{ x, y }]
        };
    }
}

function handleInputMove(e) {
    if (!isPlaying || !isDragging || !currentPath || isStealth) return;

    const x = parseInt(this.dataset.x);
    const y = parseInt(this.dataset.y);
    const cellData = grid[y][x];

    const lastCell = currentPath.cells[currentPath.cells.length - 1];

    // Check adjacency (must be directly adjacent)
    if (Math.abs(x - lastCell.x) + Math.abs(y - lastCell.y) !== 1) return;

    // Check if backtracking
    if (currentPath.cells.length > 1) {
        const prevCell = currentPath.cells[currentPath.cells.length - 2];
        if (prevCell.x === x && prevCell.y === y) {
            // Backtrack: remove last cell
            const removed = currentPath.cells.pop();
            clearCellVisual(removed.x, removed.y);
            if (!grid[removed.y][removed.x].fixed) {
                grid[removed.y][removed.x].color = 0;
                grid[removed.y][removed.x].type = 'empty';
            }
            return;
        }
    }

    // Check if blocked
    if (cellData.type === 'blocked') return;

    // Check collision with other paths
    if (cellData.fixed && cellData.color !== currentPath.color) return;
    if (!cellData.fixed && cellData.color !== 0 && cellData.color !== currentPath.color) return;

    // Check if already in current path (no loops)
    for (let i = 0; i < currentPath.cells.length - 1; i++) {
        if (currentPath.cells[i].x === x && currentPath.cells[i].y === y) return;
    }

    // Add to path
    currentPath.cells.push({ x, y });

    // Update grid data
    if (!cellData.fixed) {
        grid[y][x].color = currentPath.color;
        grid[y][x].type = 'path';
    }

    // Draw visual
    drawPathSegment(lastCell, { x, y }, currentPath.color);

    // Check if reached end node
    if (cellData.fixed && cellData.color === currentPath.color && currentPath.cells.length > 1) {
        // Path complete!
        isDragging = false;
        moves++;
        checkWin();
    }
}

function handleInputEnd() {
    isDragging = false;
    currentPath = null;
    updateUI();
}

function handleTouchStart(e) {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.classList.contains('cell')) {
        handleInputStart.call(target, e);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.classList.contains('cell')) {
        handleInputMove.call(target, e);
    }
}

function clearPath(color) {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (!grid[y][x].fixed && grid[y][x].color === color) {
                grid[y][x].color = 0;
                grid[y][x].type = 'empty';
                clearCellVisual(x, y);
            }
        }
    }
}

function clearCellVisual(x, y) {
    const cell = getCell(x, y);
    const paths = cell.querySelectorAll('.path');
    paths.forEach(p => p.remove());
}

function drawPathSegment(from, to, color) {
    const fromCell = getCell(from.x, from.y);
    const toCell = getCell(to.x, to.y);

    // Create connecting lines
    if (from.x < to.x) { // Right
        createPathElement(fromCell, color, 'horizontal', 'right');
        createPathElement(toCell, color, 'horizontal', 'left');
    } else if (from.x > to.x) { // Left
        createPathElement(fromCell, color, 'horizontal', 'left');
        createPathElement(toCell, color, 'horizontal', 'right');
    } else if (from.y < to.y) { // Down
        createPathElement(fromCell, color, 'vertical', 'down');
        createPathElement(toCell, color, 'vertical', 'up');
    } else if (from.y > to.y) { // Up
        createPathElement(fromCell, color, 'vertical', 'up');
        createPathElement(toCell, color, 'vertical', 'down');
    }

    // Add center dots
    createCenterDot(fromCell, color);
    createCenterDot(toCell, color);
}

function createPathElement(cell, color, orientation, direction) {
    const div = document.createElement('div');
    div.className = `path color-${color} ${orientation}`;

    if (orientation === 'horizontal') {
        if (direction === 'right') div.style.left = '20px';
        else div.style.left = '-20px';
    } else {
        if (direction === 'down') div.style.top = '20px';
        else div.style.top = '-20px';
    }

    cell.appendChild(div);
}

function createCenterDot(cell, color) {
    // Only add if not already present
    if (!cell.querySelector('.path.center')) {
        const center = document.createElement('div');
        center.className = `path center color-${color}`;
        cell.appendChild(center);
    }
}

function checkWin() {
    let filled = 0;
    let total = 0;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x].type !== 'blocked') {
                total++;
                if (grid[y][x].color > 0) filled++;
            }
        }
    }

    const percent = Math.floor((filled / total) * 100);
    progressDisplay.innerText = `${percent}%`;

    // Check if all endpoints are connected
    let allConnected = true;
    for (const color in endpoints) {
        if (!isColorConnected(parseInt(color))) {
            allConnected = false;
            break;
        }
    }

    if (filled === total && allConnected) {
        // Calculate score
        const baseScore = 100 * level;
        const moveBonus = Math.max(0, 50 - moves) * 2;
        const hintPenalty = hintsUsed * 20;
        const levelScore = baseScore + moveBonus - hintPenalty;

        score += Math.max(10, levelScore);

        setTimeout(() => {
            showLevelComplete();
        }, 300);
    }
}

function isColorConnected(color) {
    const eps = endpoints[color];
    if (!eps || eps.length !== 2) return false;

    // BFS to check if endpoints are connected
    const start = eps[0];
    const end = eps[1];
    const visited = new Set();
    const queue = [start];
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.x === end.x && current.y === end.y) {
            return true;
        }

        // Check neighbors
        const neighbors = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];

        for (const n of neighbors) {
            if (n.x >= 0 && n.x < gridSize && n.y >= 0 && n.y < gridSize) {
                const key = `${n.x},${n.y}`;
                if (!visited.has(key) && grid[n.y][n.x].color === color) {
                    visited.add(key);
                    queue.push(n);
                }
            }
        }
    }

    return false;
}

function showLevelComplete() {
    const completeScreen = document.getElementById('level-complete-screen');
    completeScreen.querySelector('h1').innerText = 'Merge Successful!';
    completeScreen.querySelector('p').innerText = `Conflicts resolved in ${moves} moves. Score: ${score}`;
    completeScreen.classList.remove('hidden');
}

function useHint() {
    // Find an unconnected color and show one cell of its solution path
    // For simplicity, just highlight an endpoint that isn't connected
    for (const color in endpoints) {
        if (!isColorConnected(parseInt(color))) {
            const eps = endpoints[color];
            const cell = getCell(eps[0].x, eps[0].y);
            const node = cell.querySelector('.node');
            if (node) {
                node.classList.add('pulse');
                setTimeout(() => node.classList.remove('pulse'), 500);
            }
            hintsUsed++;
            break;
        }
    }
}

function resetCurrentLevel() {
    // Clear all non-fixed cells
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (!grid[y][x].fixed && grid[y][x].type !== 'blocked') {
                grid[y][x].color = 0;
                grid[y][x].type = 'empty';
            }
        }
    }
    moves = 0;
    renderGrid();
    updateUI();
}

function updateUI() {
    levelDisplay.innerText = level;
    movesDisplay.innerText = moves;

    // Calculate progress
    let filled = 0;
    let total = 0;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x].type !== 'blocked') {
                total++;
                if (grid[y][x].color > 0) filled++;
            }
        }
    }
    const percent = Math.floor((filled / total) * 100);
    progressDisplay.innerText = `${percent}%`;
}
