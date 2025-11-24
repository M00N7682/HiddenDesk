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
const BASE_SCROLL_INTERVAL = 20; // Frames between scrolls (Faster start)

// Game State
let player = {
    x: 100,
    y: 300,
    width: 10,
    height: 20,
    speed: 5,
    color: '#ffffff' // White cursor
};

let codeLines = [];
let score = 0;
let highScore = localStorage.getItem('vscode-runner-highscore') || 0;
let health = 100;
let gameRunning = true;
let frameCount = 0;
let scrollTimer = 0;
let currentScrollInterval = BASE_SCROLL_INTERVAL;
let difficultyMultiplier = 1;

// Code Generation Data
const keywords = ['const', 'let', 'var', 'function', 'class', 'import', 'export', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'async', 'await', 'public', 'private', 'readonly'];
const variables = ['data', 'user', 'result', 'index', 'count', 'config', 'options', 'item', 'element', 'node', 'ctx', 'canvas', 'response', 'error', 'value', 'key', 'id', 'list', 'map', 'state', 'props', 'children', 'context', 'event', 'handler', 'callback', 'manager', 'service', 'utils', 'helper'];
const methods = ['toString', 'parseInt', 'map', 'filter', 'reduce', 'forEach', 'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'join', 'split', 'replace', 'match', 'test', 'exec', 'getElementById', 'querySelector', 'addEventListener', 'removeEventListener', 'preventDefault', 'stopPropagation'];
const operators = ['=', '==', '===', '!=', '!==', '+', '-', '*', '/', '+=', '-=', '++', '--', '&&', '||', '=>', '?', ':'];

// Resize canvas
function resizeCanvas() {
    const container = document.querySelector('.code-area');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Helper: Generate Random Code Line (Longer Version)
function generateCodeLine(y) {
    const indentLevel = Math.floor(Math.random() * 4);
    const indent = '    '.repeat(indentLevel);
    let text = '';
    
    const type = Math.random();
    const v1 = variables[Math.floor(Math.random() * variables.length)];
    const v2 = variables[Math.floor(Math.random() * variables.length)];
    const v3 = variables[Math.floor(Math.random() * variables.length)];
    const m1 = methods[Math.floor(Math.random() * methods.length)];
    const k1 = keywords[Math.floor(Math.random() * keywords.length)];

    if (type < 0.25) {
        // Complex Variable declaration
        text = `${k1} ${v1} = ${v2}.${m1}(${v3}) || ${v2}.length > 0 ? ${v3} : null;`;
    } else if (type < 0.5) {
        // Method Chaining
        text = `${v1}.${m1}(${v2}).${methods[Math.floor(Math.random() * methods.length)]}(${v3} => ${v3}.id);`;
    } else if (type < 0.75) {
        // Control flow with condition
        text = `${k1} (${v1} && ${v1}.${v2} !== undefined && ${v3} > 100) {`;
    } else {
        // Function definition
        text = `${k1} ${v1} = async (${v2}, ${v3}) => { return await ${v2}.${m1}(); };`;
    }

    // Occasionally add a comment at the end to make it even longer
    if (Math.random() < 0.3) {
        text += ` // TODO: Fix ${v1} logic`;
    }

    const lineObj = {
        y: y,
        text: indent + text,
        isError: false,
        isItem: false,
        rects: [] // Collision rectangles
    };

    // Chance to be an Error (Obstacle)
    if (Math.random() < 0.25 * difficultyMultiplier) {
        lineObj.isError = true;
        
        // Improved Obstacle Generation:
        // 1. Fix wall invincibility by explicitly targeting edges
        // 2. Split big blocks into smaller chunks
        const mode = Math.random();
        
        if (mode < 0.3) {
            // Left Wall Block (Forces player right)
            const width = Math.random() * (canvas.width * 0.4) + 50;
            lineObj.rects.push({ x: 0, y: y, width: width, height: LINE_HEIGHT, type: 'error' });
        } else if (mode < 0.6) {
            // Right Wall Block (Forces player left)
            const width = Math.random() * (canvas.width * 0.4) + 50;
            lineObj.rects.push({ x: canvas.width - width, y: y, width: width, height: LINE_HEIGHT, type: 'error' });
        } else {
            // Scattered Blocks (Forces player to weave)
            const numBlocks = Math.floor(Math.random() * 3) + 1; // 1 to 3 blocks
            for(let i=0; i<numBlocks; i++) {
                const width = Math.random() * 80 + 40; // Smaller, fragmented errors
                const x = Math.random() * (canvas.width - width);
                lineObj.rects.push({ x: x, y: y, width: width, height: LINE_HEIGHT, type: 'error' });
            }
        }
    } 
    // Chance to be an Item (Fix)
    else if (Math.random() < 0.05) {
        lineObj.isItem = true;
        const itemX = Math.random() * (canvas.width - 50);
        lineObj.rects.push({
            x: itemX,
            y: y,
            width: 40,
            height: LINE_HEIGHT,
            type: 'item'
        });
    }

    return lineObj;
}

// Initialize World
function initWorld() {
    codeLines = [];
    // Fill screen with code initially
    for (let y = 0; y < canvas.height + LINE_HEIGHT; y += LINE_HEIGHT) {
        const line = generateCodeLine(y);
        line.isError = false; // Safe start
        line.isItem = false;
        line.rects = [];
        codeLines.push(line);
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
    
    if (score > 1000) { rank = 'AI Overlord'; color = '#dcdcaa'; }
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
    localStorage.setItem('vscode-runner-highscore', highScore);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#f44747';
    ctx.font = 'bold 30px Consolas';
    ctx.textAlign = 'center';
    ctx.fillText('FATAL ERROR', canvas.width/2, canvas.height/2 - 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Consolas';
    ctx.fillText(`Lines Scrolled: ${Math.floor(score)}`, canvas.width/2, canvas.height/2 + 10);
    ctx.fillText('Press SPACE to Reboot System', canvas.width/2, canvas.height/2 + 40);
    
    logToTerminal('System crash. Stack trace dumped.', 'error');
}

function resetGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 3;
    score = 0;
    health = 100;
    currentScrollInterval = BASE_SCROLL_INTERVAL;
    scrollTimer = 0;
    difficultyMultiplier = 1;
    gameRunning = true;
    scoreElement.innerText = score;
    updateHealthBar();
    updateRank();
    initWorld();
    logToTerminal('System rebooted. Safe mode disabled.', 'info');
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameRunning) {
        if (keys['Space']) resetGame();
        else requestAnimationFrame(gameLoop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Update Difficulty
    // Interval decreases (gets faster) as score increases
    // Minimum interval is 3 frames (very fast)
    currentScrollInterval = Math.max(3, BASE_SCROLL_INTERVAL - Math.floor(score / 20));
    difficultyMultiplier = 1 + (score / 300);

    // 2. Player Movement
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;

    // 3. Update World (Step-by-Step Scrolling)
    scrollTimer++;
    if (scrollTimer >= currentScrollInterval) {
        scrollTimer = 0;
        score++; // Score increases per line scrolled
        scoreElement.innerText = score;

        if (score > highScore) {
            highScore = score;
            highScoreElement.innerText = highScore;
        }
        updateRank();

        // Move all lines UP by one line height
        for (let i = codeLines.length - 1; i >= 0; i--) {
            let line = codeLines[i];
            line.y -= LINE_HEIGHT;

            // Remove lines that are off screen top
            if (line.y < -LINE_HEIGHT) {
                codeLines.splice(i, 1);
            }
        }

        // Add new line at the bottom
        // We need to ensure we fill up to the bottom
        let lastLine = codeLines[codeLines.length - 1];
        // If the last line moved up, we need a new one at the bottom
        // The last line's Y is now (canvas.height - LINE_HEIGHT) or less
        // We want the new line to be at the bottom-most slot
        // Actually, simpler logic: just always add a line at the bottom if there's space
        // But since we moved everything by exactly LINE_HEIGHT, we just add one line at the bottom.
        
        // Calculate Y for new line. It should be aligned to grid.
        // If we just moved everything up by LINE_HEIGHT, the new line goes at the bottom.
        // Let's assume the grid is aligned.
        // Find the max Y
        let maxY = -100;
        codeLines.forEach(l => maxY = Math.max(maxY, l.y));
        
        if (maxY < canvas.height) {
             codeLines.push(generateCodeLine(maxY + LINE_HEIGHT));
        }
    }

    // 4. Draw World & Collision
    ctx.font = `${FONT_SIZE}px Consolas`;
    ctx.textBaseline = 'top';

    codeLines.forEach(line => {
        // Draw Text
        ctx.fillStyle = '#d4d4d4'; 
        if (line.text.includes('//')) ctx.fillStyle = '#6a9955'; 
        else if (line.text.includes('const') || line.text.includes('let') || line.text.includes('import')) ctx.fillStyle = '#569cd6';
        else if (line.text.includes('return') || line.text.includes('if')) ctx.fillStyle = '#c586c0';
        
        ctx.fillText(line.text, 10, line.y);

        // Draw Objects (Errors/Items)
        line.rects.forEach((rect, rIndex) => {
            rect.y = line.y; // Sync Y

            if (rect.type === 'error') {
                // Draw Error Box
                ctx.fillStyle = 'rgba(244, 71, 71, 0.3)';
                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                
                // Squiggly line
                ctx.beginPath();
                ctx.strokeStyle = '#f44747';
                ctx.lineWidth = 1;
                for(let i = 0; i < rect.width; i+=5) {
                    ctx.moveTo(rect.x + i, rect.y + rect.height);
                    ctx.lineTo(rect.x + i + 2.5, rect.y + rect.height + 2);
                    ctx.lineTo(rect.x + i + 5, rect.y + rect.height);
                }
                ctx.stroke();

                // Collision
                if (checkCollision(player, rect)) {
                    health -= 5; // Higher damage for step-scrolling
                    updateHealthBar();
                    if (frameCount % 20 === 0) { 
                        logToTerminal('ReferenceError: ' + rect.x, 'error');
                    }
                    if (health <= 0) gameOver();
                }

            } else if (rect.type === 'item') {
                // Draw Item
                ctx.fillStyle = 'rgba(78, 201, 176, 0.3)';
                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                ctx.fillStyle = '#4ec9b0';
                ctx.fillText('FIX', rect.x + 5, rect.y + 2);

                // Collision
                if (checkCollision(player, rect)) {
                    health = Math.min(100, health + 15);
                    updateHealthBar();
                    logToTerminal('Patch applied.', 'success');
                    line.rects.splice(rIndex, 1);
                }
            }
        });
    });

    // 5. Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, 2, 20); 
    ctx.fillRect(player.x - 3, player.y, 8, 2); 
    ctx.fillRect(player.x - 3, player.y + 18, 8, 2); 
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(player.x - 2, player.y, 6, 20);

    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Start
initWorld();
highScoreElement.innerText = highScore;
updateRank();
logToTerminal('VS Code Scroll Runner v2.0 initialized...', 'info');
logToTerminal('Press SPACE to start coding', 'info');

// Initial wait
gameRunning = false;
ctx.fillStyle = '#ffffff';
ctx.font = '20px Consolas';
ctx.textAlign = 'center';
ctx.fillText('Press SPACE to Start Coding', canvas.width/2, canvas.height/2);
requestAnimationFrame(gameLoop);