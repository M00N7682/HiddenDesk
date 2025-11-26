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
const GRID_SIZE = 5;
let level = 1;
let moves = 0;
let isPlaying = false;
let isStealth = false;

// Level Data (Simple 5x5 levels)
// 0: Empty, 1-5: Color Pairs
const levels = [
    [
        [1, 0, 0, 0, 2],
        [0, 0, 3, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 2, 0, 1, 0],
        [3, 0, 0, 0, 0]
    ],
    [
        [1, 0, 0, 2, 0],
        [0, 0, 0, 0, 0],
        [0, 3, 0, 0, 0],
        [0, 1, 0, 2, 0],
        [3, 0, 0, 0, 0]
    ],
    [
        [1, 2, 3, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [1, 2, 3, 0, 0]
    ]
];

let grid = []; // Stores current state: { color: int, type: 'node'|'path', direction: 'h'|'v'|'c' }
let currentPath = null; // { color: int, cells: [] }

// Input Handling
let isDragging = false;

document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') toggleStealth();
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
    loadLevel(level - 1);
}

function nextLevel() {
    levelCompleteScreen.classList.add('hidden');
    level++;
    if (level > levels.length) level = 1; // Loop
    loadLevel(level - 1);
}

function loadLevel(lvlIdx) {
    const levelData = levels[lvlIdx];
    grid = [];
    moves = 0;
    updateUI();
    
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 60px)`;

    for (let y = 0; y < GRID_SIZE; y++) {
        let row = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            const val = levelData[y][x];
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            // Event Listeners
            cell.addEventListener('mousedown', handleInputStart);
            cell.addEventListener('mouseenter', handleInputMove);
            cell.addEventListener('mouseup', handleInputEnd);
            
            // Touch support
            cell.addEventListener('touchstart', handleTouchStart, {passive: false});
            cell.addEventListener('touchmove', handleTouchMove, {passive: false});
            cell.addEventListener('touchend', handleInputEnd);

            if (val > 0) {
                const node = document.createElement('div');
                node.className = `node color-${val}`;
                cell.appendChild(node);
                row.push({ color: val, type: 'node', fixed: true });
            } else {
                row.push({ color: 0, type: 'empty' });
            }
            gridContainer.appendChild(cell);
        }
        grid.push(row);
    }
    isPlaying = true;
}

function getCell(x, y) {
    return gridContainer.children[y * GRID_SIZE + x];
}

function handleInputStart(e) {
    if (!isPlaying) return;
    e.preventDefault();
    
    const x = parseInt(this.dataset.x);
    const y = parseInt(this.dataset.y);
    const cellData = grid[y][x];

    if (cellData.color > 0) {
        isDragging = true;
        // If starting on a path, clear it first? No, just overwrite.
        // If starting on a node, start new path.
        currentPath = {
            color: cellData.color,
            cells: [{x, y}]
        };
        
        // Clear existing path of this color
        clearPath(cellData.color);
        
        // Re-add start node to path logic visually if needed (it's fixed though)
    }
}

function handleInputMove(e) {
    if (!isPlaying || !isDragging || !currentPath) return;
    
    const x = parseInt(this.dataset.x);
    const y = parseInt(this.dataset.y);
    const cellData = grid[y][x];
    
    const lastCell = currentPath.cells[currentPath.cells.length - 1];
    
    // Check adjacency
    if (Math.abs(x - lastCell.x) + Math.abs(y - lastCell.y) !== 1) return;
    
    // Check if backtracking
    if (currentPath.cells.length > 1) {
        const prevCell = currentPath.cells[currentPath.cells.length - 2];
        if (prevCell.x === x && prevCell.y === y) {
            // Backtrack: remove last cell
            const removed = currentPath.cells.pop();
            updateGridCell(removed.x, removed.y, 0, 'empty');
            return;
        }
    }

    // Check collision
    if (cellData.fixed && cellData.color !== currentPath.color) return; // Hit other node
    if (!cellData.fixed && cellData.color !== 0 && cellData.color !== currentPath.color) return; // Hit other path
    
    // Add to path
    currentPath.cells.push({x, y});
    
    // Update Visuals
    drawPathSegment(lastCell, {x, y}, currentPath.color);
    
    // Check if reached end node
    if (cellData.fixed && cellData.color === currentPath.color) {
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

// Touch helpers
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
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (!grid[y][x].fixed && grid[y][x].color === color) {
                updateGridCell(x, y, 0, 'empty');
            }
        }
    }
}

function updateGridCell(x, y, color, type) {
    grid[y][x].color = color;
    grid[y][x].type = type;
    
    const cell = getCell(x, y);
    // Remove existing paths
    const paths = cell.querySelectorAll('.path');
    paths.forEach(p => p.remove());
}

function drawPathSegment(from, to, color) {
    // Update grid data
    if (!grid[to.y][to.x].fixed) {
        grid[to.y][to.x].color = color;
        grid[to.y][to.x].type = 'path';
    }

    // Draw visual on 'from' cell connecting to 'to'
    const fromCell = getCell(from.x, from.y);
    const toCell = getCell(to.x, to.y);
    
    const div = document.createElement('div');
    div.className = `path color-${color}`;
    
    if (from.x < to.x) { // Right
        div.classList.add('horizontal');
        div.style.left = '20px';
        fromCell.appendChild(div);
        
        const div2 = document.createElement('div');
        div2.className = `path color-${color} horizontal`;
        div2.style.left = '-20px';
        toCell.appendChild(div2);
    } else if (from.x > to.x) { // Left
        div.classList.add('horizontal');
        div.style.left = '-20px';
        fromCell.appendChild(div);
        
        const div2 = document.createElement('div');
        div2.className = `path color-${color} horizontal`;
        div2.style.left = '20px';
        toCell.appendChild(div2);
    } else if (from.y < to.y) { // Down
        div.classList.add('vertical');
        div.style.top = '20px';
        fromCell.appendChild(div);
        
        const div2 = document.createElement('div');
        div2.className = `path color-${color} vertical`;
        div2.style.top = '-20px';
        toCell.appendChild(div2);
    } else if (from.y > to.y) { // Up
        div.classList.add('vertical');
        div.style.top = '-20px';
        fromCell.appendChild(div);
        
        const div2 = document.createElement('div');
        div2.className = `path color-${color} vertical`;
        div2.style.top = '20px';
        toCell.appendChild(div2);
    }
    
    // Add center dots to make corners look smooth
    const center1 = document.createElement('div');
    center1.className = `path center color-${color}`;
    fromCell.appendChild(center1);
    
    const center2 = document.createElement('div');
    center2.className = `path center color-${color}`;
    toCell.appendChild(center2);
}

function checkWin() {
    let filled = 0;
    let total = GRID_SIZE * GRID_SIZE;
    
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (grid[y][x].color > 0) filled++;
        }
    }
    
    const percent = Math.floor((filled / total) * 100);
    progressDisplay.innerText = `${percent}%`;
    
    if (filled === total) {
        // Check if all colors are connected (simplified: just check if full)
        // In a real game, we'd traverse the graph.
        // For now, if board is full, assume win.
        setTimeout(() => {
            levelCompleteScreen.classList.remove('hidden');
        }, 500);
    }
}

function updateUI() {
    levelDisplay.innerText = level;
    movesDisplay.innerText = moves;
    progressDisplay.innerText = '0%';
}
