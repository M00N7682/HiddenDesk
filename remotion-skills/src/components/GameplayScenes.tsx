import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

// ============================================
// CELL INVADERS - 진짜 Excel처럼
// ============================================
export const CellInvadersGameplay: React.FC = () => {
  const frame = useCurrentFrame();

  // 플레이어 위치
  const playerCol = Math.floor(5 + Math.sin(frame * 0.1) * 3);
  const playerRow = 16;

  // 총알들 (여러 발)
  const bullets = [
    { active: frame % 30 < 20, row: playerRow - Math.floor((frame % 30) * 0.6), col: playerCol },
    { active: (frame + 15) % 30 < 20, row: playerRow - Math.floor(((frame + 15) % 30) * 0.6), col: playerCol },
  ];

  // 적들 (#ERROR!) - 움직이며 내려옴
  const baseEnemies = [
    { col: 2, row: 2 }, { col: 4, row: 2 }, { col: 6, row: 2 }, { col: 8, row: 2 }, { col: 10, row: 2 },
    { col: 3, row: 4 }, { col: 5, row: 4 }, { col: 7, row: 4 }, { col: 9, row: 4 },
    { col: 2, row: 6 }, { col: 4, row: 6 }, { col: 6, row: 6 }, { col: 8, row: 6 }, { col: 10, row: 6 },
  ];

  const enemies = baseEnemies.map((e, i) => {
    const offsetRow = Math.floor(frame * 0.03);
    const sideMove = Math.floor(Math.sin(frame * 0.05) * 1);
    const actualRow = e.row + offsetRow;
    const actualCol = e.col + sideMove;

    const isHit = bullets.some(b =>
      b.active && b.col === actualCol && b.row <= actualRow && b.row >= actualRow - 1
    );

    return {
      ...e,
      row: actualRow,
      col: actualCol,
      destroyed: isHit || (frame > 50 + i * 10 && Math.random() > 0.9)
    };
  });

  const CELL_WIDTH = 72;
  const CELL_HEIGHT = 24;
  const score = Math.floor(frame * 10);

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#217346", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "98%", height: "95%", backgroundColor: "#fff", display: "flex", flexDirection: "column", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", borderRadius: 2 }}>

        {/* Title Bar */}
        <div style={{ height: 28, backgroundColor: "#217346", display: "flex", alignItems: "center", padding: "0 10px", gap: 15 }}>
          <span style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>📊</span>
          <span style={{ color: "white", fontSize: 12 }}>Cell Invaders - Excel</span>
          <div style={{ marginLeft: "auto", display: "flex" }}>
            {["─", "□", "×"].map((c, i) => (
              <div key={i} style={{ width: 40, height: 28, display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: 12 }}>{c}</div>
            ))}
          </div>
        </div>

        {/* Ribbon Tabs */}
        <div style={{ backgroundColor: "#217346", display: "flex", padding: "0 10px", fontSize: 12 }}>
          {["File", "Home", "Insert", "Page Layout", "Formulas", "Data", "Review", "View", "Help"].map((tab, i) => (
            <div
              key={tab}
              style={{
                padding: "6px 12px",
                color: i === 1 ? "#217346" : "rgba(255,255,255,0.9)",
                backgroundColor: i === 1 ? "#fff" : "transparent",
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                fontWeight: i === 1 ? 500 : 400,
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Ribbon Toolbar */}
        <div style={{ backgroundColor: "#f3f2f1", padding: "8px 15px", borderBottom: "1px solid #e1dfdd", display: "flex", alignItems: "center", gap: 15 }}>
          {/* Clipboard Group */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderRight: "1px solid #d0d0d0", paddingRight: 15 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 8px", borderRadius: 3 }}>
              <span style={{ fontSize: 22 }}>📋</span>
              <span style={{ fontSize: 10, color: "#333" }}>Paste</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button style={{ border: "none", background: "none", padding: "2px 6px", fontSize: 11, textAlign: "left", cursor: "pointer" }}>✂️ Cut</button>
              <button style={{ border: "none", background: "none", padding: "2px 6px", fontSize: 11, textAlign: "left", cursor: "pointer" }}>📄 Copy</button>
            </div>
          </div>

          {/* Font Group */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, borderRight: "1px solid #d0d0d0", paddingRight: 15 }}>
            <select style={{ padding: "3px 5px", fontSize: 11, border: "1px solid #ccc", borderRadius: 2, width: 100 }}>
              <option>Calibri</option>
            </select>
            <select style={{ padding: "3px 5px", fontSize: 11, border: "1px solid #ccc", borderRadius: 2, width: 40 }}>
              <option>11</option>
            </select>
            <div style={{ display: "flex", gap: 1, marginLeft: 5 }}>
              <button style={{ fontWeight: "bold", padding: "3px 7px", border: "1px solid transparent", background: "none", fontSize: 12 }}>B</button>
              <button style={{ fontStyle: "italic", padding: "3px 7px", border: "1px solid transparent", background: "none", fontSize: 12 }}>I</button>
              <button style={{ textDecoration: "underline", padding: "3px 7px", border: "1px solid transparent", background: "none", fontSize: 12 }}>U</button>
            </div>
          </div>

          {/* Alignment */}
          <div style={{ display: "flex", gap: 1 }}>
            <button style={{ padding: "3px 6px", border: "1px solid transparent", background: "none", fontSize: 11 }}>≡</button>
            <button style={{ padding: "3px 6px", border: "1px solid transparent", background: "none", fontSize: 11 }}>☰</button>
            <button style={{ padding: "3px 6px", border: "1px solid transparent", background: "none", fontSize: 11 }}>≡</button>
          </div>
        </div>

        {/* Formula Bar */}
        <div style={{ display: "flex", alignItems: "center", padding: "3px 10px", borderBottom: "1px solid #e1dfdd", backgroundColor: "#fff" }}>
          <div style={{ width: 60, padding: "3px 8px", border: "1px solid #ccc", borderRadius: 2, fontSize: 11, backgroundColor: "#fff", textAlign: "center" }}>
            {String.fromCharCode(65 + playerCol)}{playerRow + 1}
          </div>
          <span style={{ margin: "0 8px", color: "#666", fontSize: 12 }}>fx</span>
          <input
            style={{ flexGrow: 1, border: "1px solid #ccc", borderRadius: 2, padding: "3px 8px", fontFamily: "Consolas, monospace", fontSize: 11, backgroundColor: "#fff" }}
            value={`=VLOOKUP("player", A1:K20, ${playerCol + 1}, FALSE)`}
            readOnly
          />
        </div>

        {/* Spreadsheet */}
        <div style={{ flexGrow: 1, display: "grid", gridTemplateColumns: "35px 1fr", gridTemplateRows: "22px 1fr", overflow: "hidden" }}>
          {/* Corner */}
          <div style={{ backgroundColor: "#f3f2f1", borderRight: "1px solid #b4b4b4", borderBottom: "1px solid #b4b4b4" }} />

          {/* Column Headers */}
          <div style={{ backgroundColor: "#f3f2f1", display: "flex", borderBottom: "1px solid #b4b4b4", overflow: "hidden" }}>
            {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map((col, i) => (
              <div
                key={col}
                style={{
                  width: CELL_WIDTH,
                  minWidth: CELL_WIDTH,
                  borderRight: "1px solid #b4b4b4",
                  textAlign: "center",
                  lineHeight: "22px",
                  fontSize: 11,
                  color: "#333",
                  backgroundColor: i === playerCol ? "#e8f0e8" : "#f3f2f1",
                }}
              >
                {col}
              </div>
            ))}
          </div>

          {/* Row Headers */}
          <div style={{ backgroundColor: "#f3f2f1", borderRight: "1px solid #b4b4b4", overflow: "hidden" }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: CELL_HEIGHT,
                  borderBottom: "1px solid #b4b4b4",
                  textAlign: "center",
                  lineHeight: `${CELL_HEIGHT}px`,
                  fontSize: 11,
                  color: "#333",
                  backgroundColor: i === playerRow ? "#e8f0e8" : "#f3f2f1",
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ position: "relative", backgroundColor: "#fff", overflow: "hidden" }}>
            {/* Grid Lines */}
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={`h${i}`} style={{ position: "absolute", top: i * CELL_HEIGHT, left: 0, right: 0, height: 1, backgroundColor: "#e0e0e0" }} />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`v${i}`} style={{ position: "absolute", left: i * CELL_WIDTH, top: 0, bottom: 0, width: 1, backgroundColor: "#e0e0e0" }} />
            ))}

            {/* 일반 셀 데이터 (배경 디테일) */}
            {[
              { col: 0, row: 0, value: "ID", bold: true },
              { col: 1, row: 0, value: "Name", bold: true },
              { col: 2, row: 0, value: "Score", bold: true },
              { col: 0, row: 1, value: "1" },
              { col: 1, row: 1, value: "Player" },
              { col: 2, row: 1, value: score.toString() },
            ].map((cell, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: cell.col * CELL_WIDTH + 4,
                  top: cell.row * CELL_HEIGHT + 4,
                  fontSize: 11,
                  color: "#333",
                  fontWeight: cell.bold ? "bold" : "normal",
                }}
              >
                {cell.value}
              </div>
            ))}

            {/* 적들 (#ERROR!) */}
            {enemies.filter(e => !e.destroyed && e.row > 0 && e.row < 18).map((enemy, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: enemy.col * CELL_WIDTH + 2,
                  top: enemy.row * CELL_HEIGHT + 1,
                  width: CELL_WIDTH - 4,
                  height: CELL_HEIGHT - 2,
                  backgroundColor: "#ffc7ce",
                  border: "1px solid #9c0006",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "#9c0006",
                  fontWeight: "bold",
                  fontFamily: "Calibri, sans-serif",
                }}
              >
                #ERROR!
              </div>
            ))}

            {/* 플레이어 (선택된 셀) */}
            <div
              style={{
                position: "absolute",
                left: playerCol * CELL_WIDTH - 1,
                top: playerRow * CELL_HEIGHT - 1,
                width: CELL_WIDTH,
                height: CELL_HEIGHT,
                border: "2px solid #217346",
                backgroundColor: "rgba(33, 115, 70, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: "bold",
                color: "#217346",
                boxShadow: "0 0 0 1px #217346",
              }}
            >
              ▲
            </div>

            {/* 총알들 */}
            {bullets.map((bullet, i) =>
              bullet.active && bullet.row > 0 && bullet.row < 18 && (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: bullet.col * CELL_WIDTH + CELL_WIDTH / 2 - 2,
                    top: bullet.row * CELL_HEIGHT + 2,
                    width: 4,
                    height: 16,
                    backgroundColor: "#217346",
                    borderRadius: 2,
                    boxShadow: "0 0 4px #217346",
                  }}
                />
              )
            )}

            {/* 폭발 이펙트 */}
            {enemies.filter(e => e.destroyed && e.row > 0 && e.row < 18).slice(0, 3).map((enemy, i) => (
              <div
                key={`exp${i}`}
                style={{
                  position: "absolute",
                  left: enemy.col * CELL_WIDTH + CELL_WIDTH / 2 - 15,
                  top: enemy.row * CELL_HEIGHT - 5,
                  width: 30,
                  height: 30,
                  backgroundColor: "rgba(255, 200, 0, 0.6)",
                  borderRadius: "50%",
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
        </div>

        {/* Sheet Tabs */}
        <div style={{ backgroundColor: "#f3f2f1", display: "flex", alignItems: "center", paddingLeft: 5, borderTop: "1px solid #ccc", height: 26 }}>
          <button style={{ border: "none", background: "none", fontSize: 10, padding: "0 5px", color: "#666" }}>◀</button>
          <button style={{ border: "none", background: "none", fontSize: 10, padding: "0 5px", color: "#666" }}>▶</button>
          {["Sheet1", "Sheet2", "Sheet3"].map((sheet, i) => (
            <div
              key={sheet}
              style={{
                padding: "4px 12px",
                backgroundColor: i === 0 ? "#fff" : "transparent",
                border: i === 0 ? "1px solid #b4b4b4" : "1px solid transparent",
                borderBottom: i === 0 ? "1px solid #fff" : "none",
                marginBottom: i === 0 ? -1 : 0,
                fontSize: 11,
                color: i === 0 ? "#217346" : "#666",
                fontWeight: i === 0 ? 500 : 400,
                cursor: "pointer",
              }}
            >
              {sheet}
            </div>
          ))}
          <div style={{ padding: "4px 8px", fontSize: 11, color: "#666", cursor: "pointer" }}>⊕</div>
        </div>

        {/* Status Bar */}
        <div style={{ backgroundColor: "#217346", color: "white", padding: "2px 12px", fontSize: 11, display: "flex", alignItems: "center", height: 22 }}>
          <span>Ready</span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
            <span>Average: {Math.floor(score / 10)}</span>
            <span>Count: {enemies.filter(e => !e.destroyed).length}</span>
            <span>Sum: {score}</span>
          </span>
          <span style={{ marginLeft: 20, display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ width: 60, height: 3, backgroundColor: "rgba(255,255,255,0.3)", display: "inline-block" }}>
              <span style={{ width: "70%", height: "100%", backgroundColor: "white", display: "block" }} />
            </span>
            <span>100%</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CODE DASH - 실제 게임과 동일하게
// ============================================

// 실제 VS Code 색상 (codedash/style.css에서 가져옴)
const VSCodeColors = {
  keyword: "#569cd6",
  variable: "#9cdcfe",
  string: "#ce9178",
  comment: "#6a9955",
  class: "#4ec9b0",
  function: "#dcdcaa",
  number: "#b5cea8",
  tag: "#808080",
  accent: "#007acc",
  playerCursor: "#007acc",
  obstacle: "#f14c4c",
  powerup: "#4ec9b0",
};

export const CodeDashGameplay: React.FC = () => {
  const frame = useCurrentFrame();

  // 플레이어 위치 (점프)
  const jumpCycle = frame % 45;
  const isJumping = jumpCycle < 22;
  const playerY = isJumping ? Math.sin((jumpCycle / 22) * Math.PI) * 50 : 0;

  // 장애물들 (빨간 wavy underline 텍스트)
  const obstacles = [
    { x: 700 - (frame * 6) % 900, text: "undefined" },
    { x: 1000 - (frame * 6) % 900, text: "null" },
    { x: 1300 - (frame * 6) % 900, text: "error" },
  ];

  // 파워업 (녹색)
  const powerups = [
    { x: 550 - (frame * 6) % 700, text: "+10" },
    { x: 850 - (frame * 6) % 700, text: "⚡" },
  ];

  const score = Math.floor(frame * 8);
  const health = Math.max(40, 100 - Math.floor(frame * 0.3) % 60);
  const combo = 1 + Math.floor(frame / 30) % 5;

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#1e1e1e", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Title Bar */}
      <div style={{ height: 30, backgroundColor: "#3c3c3c", display: "flex", alignItems: "center", padding: "0 8px", fontSize: 12 }}>
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23007ACC' d='M95 20v60L75 95V75L60 80l-5-10 20-10V40L55 50l-5-10 45-20z'/%3E%3Cpath fill='%23007ACC' d='M5 20l20-5 50 35v35l-15-5V50L10 80z'/%3E%3C/svg%3E" alt="" style={{ height: 16, marginRight: 10 }} />
        <div style={{ display: "flex", gap: 0, color: "#ccc", fontSize: 13 }}>
          {["File", "Edit", "Selection", "View", "Go", "Run", "Terminal", "Help"].map(m => (
            <span key={m} style={{ padding: "0 8px", cursor: "pointer" }}>{m}</span>
          ))}
        </div>
        <div style={{ flexGrow: 1, textAlign: "center", color: "#ccc", fontSize: 12 }}>index.html - vscode-stealth-game - Visual Studio Code</div>
        <div style={{ display: "flex" }}>
          <div style={{ width: 46, height: 30, display: "flex", justifyContent: "center", alignItems: "center", color: "#ccc" }}>─</div>
          <div style={{ width: 46, height: 30, display: "flex", justifyContent: "center", alignItems: "center", color: "#ccc" }}>□</div>
          <div style={{ width: 46, height: 30, display: "flex", justifyContent: "center", alignItems: "center", color: "#ccc" }}>×</div>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>

        {/* Activity Bar - 실제 아이콘 */}
        <div style={{ width: 48, backgroundColor: "#333333", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {[
            { icon: "📄", active: true },
            { icon: "🔍", active: false },
            { icon: "⑃", active: false },
            { icon: "▶", active: false },
            { icon: "⧉", active: false },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                width: 48,
                height: 48,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 22,
                color: item.active ? "#fff" : "#858585",
                opacity: item.active ? 1 : 0.6,
                borderLeft: item.active ? "2px solid #fff" : "2px solid transparent",
              }}
            >
              {item.icon}
            </div>
          ))}
          <div style={{ flexGrow: 1 }} />
          <div style={{ width: 48, height: 48, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 22, color: "#858585", opacity: 0.6 }}>👤</div>
          <div style={{ width: 48, height: 48, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 22, color: "#858585", opacity: 0.6 }}>⚙</div>
        </div>

        {/* Sidebar - 실제 게임과 동일 */}
        <div style={{ width: 250, backgroundColor: "#252526", borderRight: "1px solid #3e3e42", fontSize: 13, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 20px", fontSize: 11, fontWeight: "bold", color: "#bbb", height: 35, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>EXPLORER</span>
            <span style={{ color: "#858585" }}>⋯</span>
          </div>
          <div style={{ padding: "4px 20px", fontWeight: "bold", color: "#ccc", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10 }}>▼</span> FAKEVSCODE
          </div>
          <div style={{ padding: "3px 20px 3px 28px", color: "#ccc", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10 }}>▼</span> vscode-stealth-game
          </div>

          {/* 게임 스탯 (파일로 위장) */}
          <div style={{ padding: "3px 20px 3px 48px", color: "#fff", backgroundColor: "#37373d", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <span style={{ color: "#e34c26" }}>🔶</span>
            <span style={{ flexGrow: 1 }}>Score</span>
            <span style={{ color: VSCodeColors.number }}>{score}</span>
          </div>
          <div style={{ padding: "3px 20px 3px 48px", color: "#ccc", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <span style={{ color: "#ffd700" }}>🏆</span>
            <span style={{ flexGrow: 1 }}>High Score</span>
            <span style={{ color: VSCodeColors.number }}>{Math.max(score, 1200)}</span>
          </div>
          <div style={{ padding: "3px 20px 3px 48px", color: "#ccc", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <span style={{ color: VSCodeColors.class }}>🎖</span>
            <span style={{ flexGrow: 1 }}>Rank</span>
            <span style={{ color: VSCodeColors.number }}>Senior Dev</span>
          </div>
          <div style={{ padding: "3px 20px 3px 48px", color: "#ccc", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <span style={{ color: "#f44747" }}>❤</span>
            <span style={{ flexGrow: 1 }}>Health</span>
            <span style={{ color: VSCodeColors.number }}>{health}</span>
          </div>
          <div style={{ padding: "3px 20px 3px 48px", color: "#ccc", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <span style={{ color: "#f1e05a" }}>📄</span>
            <span>script.js</span>
          </div>
          <div style={{ padding: "3px 20px 3px 48px", color: "#ccc", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <span style={{ color: "#519aba" }}>📄</span>
            <span>style.css</span>
          </div>

          <div style={{ marginTop: 10, padding: "4px 20px", fontWeight: "bold", color: "#ccc", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10 }}>▼</span> OUTLINE
          </div>
          {["GameLoop", "Player", "Obstacles"].map((item, i) => (
            <div key={i} style={{ padding: "3px 20px 3px 28px", color: "#ccc", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <span style={{ color: "#519aba" }}>◆</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Editor Area */}
        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", backgroundColor: "#1e1e1e" }}>

          {/* Tabs */}
          <div style={{ height: 35, backgroundColor: "#252526", display: "flex" }}>
            <div style={{ padding: "0 10px", display: "flex", alignItems: "center", gap: 6, backgroundColor: "#1e1e1e", borderTop: "1px solid #007acc", color: "#fff", fontSize: 13, minWidth: 120 }}>
              <span style={{ color: "#e34c26" }}>🔶</span> index.html <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0 }}>×</span>
            </div>
            <div style={{ padding: "0 10px", display: "flex", alignItems: "center", gap: 6, backgroundColor: "#2d2d2d", color: "#969696", fontSize: 13, borderRight: "1px solid #3e3e42" }}>
              <span style={{ color: "#f1e05a" }}>📄</span> script.js
            </div>
          </div>

          {/* Breadcrumbs */}
          <div style={{ height: 22, display: "flex", alignItems: "center", paddingLeft: 16, fontSize: 13, color: "#999", backgroundColor: "#1e1e1e" }}>
            vscode-stealth-game &gt; <span style={{ color: "#e34c26", margin: "0 4px" }}>🔶</span> index.html
          </div>

          {/* Editor Content - 게임 영역 */}
          <div style={{ flexGrow: 1, display: "flex", position: "relative", overflow: "hidden" }}>
            {/* Line Numbers */}
            <div style={{ width: 60, textAlign: "right", paddingRight: 20, paddingTop: 10, color: "#858585", lineHeight: 1.5, fontFamily: "Consolas, monospace", fontSize: 14 }}>
              {Array.from({ length: 20 }).map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>

            {/* 게임 캔버스 영역 */}
            <div style={{ flexGrow: 1, position: "relative", backgroundColor: "#1e1e1e", overflow: "hidden" }}>
              {/* 콤보 미터 */}
              {combo > 1 && (
                <div style={{
                  position: "absolute",
                  top: 10,
                  right: 80,
                  fontFamily: "Consolas, monospace",
                  fontWeight: "bold",
                  color: VSCodeColors.class,
                  fontSize: 16,
                }}>
                  COMBO x{combo}.0
                </div>
              )}

              {/* 게임 라인들 (코드처럼 보이는 배경) */}
              <div style={{ paddingTop: 10, paddingLeft: 10, fontFamily: "Consolas, monospace", fontSize: 14, lineHeight: 1.5, color: "#ccc" }}>
                <div><span style={{ color: VSCodeColors.tag }}>&lt;!</span><span style={{ color: VSCodeColors.keyword }}>DOCTYPE</span> <span style={{ color: VSCodeColors.variable }}>html</span><span style={{ color: VSCodeColors.tag }}>&gt;</span></div>
                <div><span style={{ color: VSCodeColors.tag }}>&lt;</span><span style={{ color: VSCodeColors.keyword }}>html</span> <span style={{ color: VSCodeColors.variable }}>lang</span>=<span style={{ color: VSCodeColors.string }}>"en"</span><span style={{ color: VSCodeColors.tag }}>&gt;</span></div>
                <div><span style={{ color: VSCodeColors.tag }}>&lt;</span><span style={{ color: VSCodeColors.keyword }}>head</span><span style={{ color: VSCodeColors.tag }}>&gt;</span></div>
                <div>  <span style={{ color: VSCodeColors.tag }}>&lt;</span><span style={{ color: VSCodeColors.keyword }}>title</span><span style={{ color: VSCodeColors.tag }}>&gt;</span>CodeDash<span style={{ color: VSCodeColors.tag }}>&lt;/</span><span style={{ color: VSCodeColors.keyword }}>title</span><span style={{ color: VSCodeColors.tag }}>&gt;</span></div>
                <div><span style={{ color: VSCodeColors.tag }}>&lt;/</span><span style={{ color: VSCodeColors.keyword }}>head</span><span style={{ color: VSCodeColors.tag }}>&gt;</span></div>
                <div><span style={{ color: VSCodeColors.tag }}>&lt;</span><span style={{ color: VSCodeColors.keyword }}>body</span><span style={{ color: VSCodeColors.tag }}>&gt;</span></div>
              </div>

              {/* 실제 게임 오버레이 */}
              <div style={{ position: "absolute", top: 150, left: 70, right: 70, height: 180 }}>
                {/* 플레이어 커서 */}
                <div
                  style={{
                    position: "absolute",
                    left: 50,
                    bottom: 20 + playerY,
                    backgroundColor: VSCodeColors.playerCursor,
                    color: "white",
                    padding: "2px 8px",
                    fontFamily: "Consolas, monospace",
                    fontSize: 14,
                    outline: "1px solid #fff",
                    minWidth: 60,
                    textAlign: "center",
                  }}
                >
                  player
                </div>

                {/* 장애물 (빨간 wavy underline) */}
                {obstacles.filter(o => o.x > -50 && o.x < 500).map((obs, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: obs.x,
                      bottom: 20,
                      backgroundColor: "rgba(241, 76, 76, 0.2)",
                      color: VSCodeColors.obstacle,
                      padding: "2px 6px",
                      fontFamily: "Consolas, monospace",
                      fontSize: 14,
                      textDecoration: "underline wavy #f14c4c",
                    }}
                  >
                    {obs.text}
                  </div>
                ))}

                {/* 파워업 (녹색) */}
                {powerups.filter(p => p.x > -50 && p.x < 500).map((pu, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: pu.x,
                      bottom: 40 + Math.sin(frame * 0.2 + i) * 10,
                      backgroundColor: "rgba(78, 201, 176, 0.2)",
                      color: VSCodeColors.powerup,
                      padding: "2px 8px",
                      fontFamily: "Consolas, monospace",
                      fontSize: 14,
                      fontWeight: "bold",
                      border: `1px solid ${VSCodeColors.powerup}`,
                    }}
                  >
                    {pu.text}
                  </div>
                ))}

                {/* 바닥선 */}
                <div style={{ position: "absolute", bottom: 15, left: 0, right: 0, height: 1, backgroundColor: "#3e3e42" }} />
              </div>
            </div>

            {/* Minimap */}
            <div style={{ width: 60, backgroundColor: "#1e1e1e", opacity: 0.5, borderLeft: "1px solid #333" }} />
          </div>

          {/* Panel (Terminal) */}
          <div style={{ height: 150, borderTop: "1px solid #3e3e42", backgroundColor: "#1e1e1e", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 25, padding: "8px 20px", fontSize: 11, borderBottom: "1px solid #3e3e42", textTransform: "uppercase", fontWeight: 600, alignItems: "center" }}>
              <span style={{ color: "#969696" }}>PROBLEMS</span>
              <span style={{ color: "#969696" }}>OUTPUT</span>
              <span style={{ color: "#969696" }}>DEBUG CONSOLE</span>
              <span style={{ color: "#e7e7e7", borderBottom: "1px solid #e7e7e7", paddingBottom: 4 }}>TERMINAL</span>
              <span style={{ color: "#969696" }}>PORTS</span>
              <div style={{ flexGrow: 1 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#ccc" }}>Build Status:</span>
                <div style={{ width: 150, height: 10, backgroundColor: "#3c3c3c", border: "1px solid #3e3e42" }}>
                  <div style={{ width: `${health}%`, height: "100%", backgroundColor: health > 50 ? VSCodeColors.class : health > 25 ? "#cca700" : VSCodeColors.obstacle, transition: "all 0.3s" }} />
                </div>
              </div>
            </div>
            <div style={{ padding: "10px 20px", fontFamily: "Consolas, monospace", fontSize: 14 }}>
              <div style={{ color: "#ccc" }}>Windows PowerShell</div>
              <div style={{ color: "#ccc" }}>Copyright (C) Microsoft Corporation. All rights reserved.</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ color: VSCodeColors.number }}>PS C:\Users\dev\Desktop\codedash&gt;</span>
                <span style={{ color: VSCodeColors.function }}> npm run dev</span>
              </div>
              <div style={{ color: "#ccc" }}>Starting development server... Score: {score}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ height: 22, backgroundColor: "#007acc", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px", fontSize: 12 }}>
        <div style={{ display: "flex", gap: 15 }}>
          <span>⑃ main*</span>
          <span>⟳ 0</span>
          <span>✕ 0  ⚠ 0</span>
        </div>
        <div style={{ display: "flex", gap: 15 }}>
          <span>Ln 3, Col 1</span>
          <span>Spaces: 4</span>
          <span>UTF-8</span>
          <span>CRLF</span>
          <span>{"{ }"} HTML</span>
          <span>🔔</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// NEON RACER - 진짜 터미널처럼
// ============================================
export const NeonRacerGameplay: React.FC = () => {
  const frame = useCurrentFrame();

  const playerLane = Math.floor(2 + Math.sin(frame * 0.12) * 1.8);
  const score = Math.floor(frame * 15);
  const speed = 120 + Math.floor(Math.sin(frame * 0.05) * 20);
  const hp = Math.max(60, 100 - Math.floor(frame * 0.1) % 40);

  // 장애물
  const obstacles = [
    { lane: 0, y: (frame * 12) % 380 },
    { lane: 3, y: ((frame * 12) + 120) % 380 },
    { lane: 4, y: ((frame * 12) + 200) % 380 },
    { lane: 1, y: ((frame * 12) + 280) % 380 },
    { lane: 2, y: ((frame * 12) + 350) % 380 },
  ];

  // 아이템
  const items = [
    { lane: 3, y: ((frame * 12) + 80) % 380, type: "coin" },
    { lane: 1, y: ((frame * 12) + 180) % 380, type: "boost" },
    { lane: 4, y: ((frame * 12) + 300) % 380, type: "coin" },
  ];

  const hpBars = Math.floor(hp / 10);

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#1a1a2e", fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace", color: "#eee" }}>
      {/* Terminal Header - macOS style */}
      <div style={{ height: 32, background: "linear-gradient(180deg, #3d3d3d 0%, #2a2a2a 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderBottom: "1px solid #000" }}>
        <div style={{ position: "absolute", left: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "linear-gradient(180deg, #ff6058 0%, #e04040 100%)", border: "1px solid #cf4c44" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "linear-gradient(180deg, #ffbd2e 0%, #dea023 100%)", border: "1px solid #c69322" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "linear-gradient(180deg, #27c940 0%, #1db233 100%)", border: "1px solid #14a126" }} />
        </div>
        <span style={{ fontSize: 13, color: "#a0a0a0", fontWeight: 500 }}>bash — 80×24</span>
      </div>

      <div style={{ padding: "15px 20px", backgroundColor: "#0d0d1a" }}>
        {/* 이전 명령어들 */}
        <div style={{ marginBottom: 8, opacity: 0.5, fontSize: 13 }}>
          <span style={{ color: "#50fa7b" }}>➜</span> <span style={{ color: "#8be9fd" }}>~</span> <span style={{ color: "#f8f8f2" }}>cd games && ls</span>
        </div>
        <div style={{ marginBottom: 8, opacity: 0.5, fontSize: 13, color: "#6272a4" }}>
          neon-racer.sh  readme.txt  scores.db
        </div>

        {/* 현재 명령어 */}
        <div style={{ marginBottom: 15, fontSize: 13 }}>
          <span style={{ color: "#50fa7b" }}>➜</span> <span style={{ color: "#8be9fd" }}>~/games</span> <span style={{ color: "#f8f8f2" }}>./neon-racer.sh --mode=turbo</span>
        </div>

        {/* 게임 시작 메시지 */}
        <div style={{ marginBottom: 5, fontSize: 12, color: "#ff79c6" }}>
          ╔══════════════════════════════════════════════════════════════╗
        </div>
        <div style={{ marginBottom: 5, fontSize: 12, color: "#ff79c6", textAlign: "center" }}>
          ║&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;N E O N&nbsp;&nbsp;R A C E R&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║
        </div>
        <div style={{ marginBottom: 10, fontSize: 12, color: "#ff79c6" }}>
          ╚══════════════════════════════════════════════════════════════╝
        </div>

        {/* Game Stats - 터미널 스타일 */}
        <div style={{ marginBottom: 8, fontSize: 13, display: "flex", gap: 40 }}>
          <span><span style={{ color: "#50fa7b" }}>SCORE:</span> <span style={{ color: "#f1fa8c" }}>{score.toString().padStart(8, "0")}</span></span>
          <span><span style={{ color: "#50fa7b" }}>SPEED:</span> <span style={{ color: "#ff5555" }}>{speed} km/h</span></span>
          <span>
            <span style={{ color: "#50fa7b" }}>HP:</span>{" "}
            <span style={{ color: hp > 50 ? "#50fa7b" : hp > 25 ? "#f1fa8c" : "#ff5555" }}>
              {"█".repeat(hpBars)}{"░".repeat(10 - hpBars)}
            </span>
            <span style={{ color: "#6272a4" }}> {hp}%</span>
          </span>
        </div>

        {/* Game Area - ASCII 스타일 */}
        <div style={{
          border: "1px solid #44475a",
          padding: "5px 10px",
          height: 320,
          position: "relative",
          backgroundColor: "#0a0a15",
          borderRadius: 4,
          overflow: "hidden",
        }}>
          {/* 도로 */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)", width: 280 }}>
            {/* 외곽선 */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, backgroundColor: "#bd93f9", boxShadow: "0 0 15px #bd93f9" }} />
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 3, backgroundColor: "#bd93f9", boxShadow: "0 0 15px #bd93f9" }} />

            {/* 중앙선 애니메이션 */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`center${i}`}
                style={{
                  position: "absolute",
                  left: 138,
                  top: ((i * 25 + frame * 10) % 350) - 20,
                  width: 4,
                  height: 12,
                  backgroundColor: "#f1fa8c",
                  boxShadow: "0 0 8px #f1fa8c",
                }}
              />
            ))}

            {/* 레인 구분선 */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`lane1_${i}`}
                style={{
                  position: "absolute",
                  left: 55,
                  top: ((i * 25 + frame * 10) % 350) - 20,
                  width: 2,
                  height: 8,
                  backgroundColor: "#6272a4",
                }}
              />
            ))}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`lane2_${i}`}
                style={{
                  position: "absolute",
                  left: 222,
                  top: ((i * 25 + frame * 10) % 350) - 20,
                  width: 2,
                  height: 8,
                  backgroundColor: "#6272a4",
                }}
              />
            ))}

            {/* 장애물 - ASCII 스타일 */}
            {obstacles.map((obs, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: obs.lane * 55 + 15,
                  top: obs.y,
                  color: "#ff5555",
                  fontSize: 16,
                  fontWeight: "bold",
                  textShadow: "0 0 10px #ff5555",
                  whiteSpace: "pre",
                }}
              >
                {"[X]"}
              </div>
            ))}

            {/* 아이템 */}
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: item.lane * 55 + 18,
                  top: item.y,
                  color: item.type === "coin" ? "#f1fa8c" : "#8be9fd",
                  fontSize: 14,
                  textShadow: `0 0 10px ${item.type === "coin" ? "#f1fa8c" : "#8be9fd"}`,
                }}
              >
                {item.type === "coin" ? "◆" : "»»"}
              </div>
            ))}

            {/* 플레이어 - ASCII 차 */}
            <div
              style={{
                position: "absolute",
                left: playerLane * 55 + 5,
                bottom: 15,
                color: "#50fa7b",
                fontSize: 11,
                textShadow: "0 0 15px #50fa7b",
                whiteSpace: "pre",
                lineHeight: 1.1,
              }}
            >
              {"  ╱▔▔╲\n"}
              {"╔═╧══╧═╗\n"}
              {"║ ▓▓▓▓ ║\n"}
              {"║ ▓▓▓▓ ║\n"}
              {"╚╦════╦╝\n"}
              {" ╰────╯"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ marginTop: 10, fontSize: 12, color: "#6272a4", display: "flex", gap: 20 }}>
          <span><span style={{ color: "#8be9fd" }}>[←/→]</span> Move</span>
          <span><span style={{ color: "#8be9fd" }}>[SPACE]</span> Nitro</span>
          <span><span style={{ color: "#8be9fd" }}>[ESC]</span> Pause</span>
          <span style={{ marginLeft: "auto", color: "#44475a" }}>Press Ctrl+C to quit</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// GIT MERGE - Git 클라이언트처럼 (GitHub Desktop 스타일)
// ============================================
export const GitMergeGameplay: React.FC = () => {
  const frame = useCurrentFrame();

  // Git 커밋 그래프 노드
  const commits = [
    { id: "abc1234", branch: "main", x: 100, y: 60, message: "Initial commit", author: "dev", time: "2 days ago" },
    { id: "def5678", branch: "main", x: 100, y: 120, message: "Add login feature", author: "dev", time: "1 day ago" },
    { id: "ghi9012", branch: "feature", x: 200, y: 150, message: "Start payment module", author: "alice", time: "1 day ago" },
    { id: "jkl3456", branch: "feature", x: 200, y: 210, message: "Add PayPal integration", author: "alice", time: "20 hours ago" },
    { id: "mno7890", branch: "main", x: 100, y: 180, message: "Fix security issue", author: "bob", time: "18 hours ago" },
    { id: "pqr1234", branch: "hotfix", x: 300, y: 200, message: "Emergency fix", author: "dev", time: "15 hours ago" },
    { id: "stu5678", branch: "main", x: 100, y: 240, message: "Merge feature branch", author: "dev", time: "10 hours ago" },
    { id: "vwx9012", branch: "main", x: 100, y: 300, message: "Release v2.0", author: "dev", time: "5 hours ago" },
  ];

  // 연결선 - 프레임에 따라 나타남
  const connections = [
    { from: 0, to: 1, color: "#6e7681" },
    { from: 1, to: 2, color: "#3fb950" },
    { from: 2, to: 3, color: "#3fb950" },
    { from: 1, to: 4, color: "#6e7681" },
    { from: 4, to: 5, color: "#f78166" },
    { from: 3, to: 6, color: "#3fb950" },
    { from: 4, to: 6, color: "#6e7681" },
    { from: 5, to: 6, color: "#f78166" },
    { from: 6, to: 7, color: "#6e7681" },
  ];

  const activeConnections = connections.filter((_, i) => frame > i * 8);
  const mergeProgress = Math.min(100, Math.floor(frame * 1.2));
  const conflictsResolved = Math.floor(frame / 20);

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#0d1117", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#c9d1d9", display: "flex" }}>
      {/* Sidebar - GitHub Desktop 스타일 */}
      <div style={{ width: 250, backgroundColor: "#161b22", borderRight: "1px solid #30363d", display: "flex", flexDirection: "column" }}>
        {/* Repository Header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #30363d" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>📁</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>hidden-desk</div>
              <div style={{ fontSize: 11, color: "#8b949e" }}>~/projects/hidden-desk</div>
            </div>
          </div>
        </div>

        {/* Branch Info */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #30363d" }}>
          <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 8 }}>Current Branch</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", backgroundColor: "#21262d", borderRadius: 6, border: "1px solid #30363d" }}>
            <span style={{ color: "#3fb950" }}>⎇</span>
            <span style={{ fontWeight: 500, fontSize: 13 }}>main</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#8b949e" }}>↑2 ↓0</span>
          </div>
        </div>

        {/* Changes */}
        <div style={{ padding: "12px 16px", flex: 1 }}>
          <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 8 }}>Changes</div>
          {[
            { file: "payment.ts", status: "M", color: "#d29922" },
            { file: "auth.ts", status: "M", color: "#d29922" },
            { file: "api.ts", status: "A", color: "#3fb950" },
          ].map((change, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", fontSize: 12, borderRadius: 4, marginBottom: 2, backgroundColor: frame % 60 < 30 && i === 0 ? "#1f6feb33" : "transparent" }}>
              <span style={{ color: change.color, fontWeight: "bold", fontSize: 10, width: 14 }}>{change.status}</span>
              <span style={{ color: "#c9d1d9" }}>{change.file}</span>
            </div>
          ))}
        </div>

        {/* Commit Button */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #30363d" }}>
          <button style={{
            width: "100%",
            padding: "8px 16px",
            backgroundColor: "#238636",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}>
            Commit to main
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Toolbar */}
        <div style={{ height: 48, backgroundColor: "#161b22", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, borderBottom: "1px solid #30363d" }}>
          <button style={{ padding: "5px 12px", backgroundColor: "#21262d", color: "#c9d1d9", border: "1px solid #30363d", borderRadius: 6, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span>🔄</span> Fetch origin
          </button>
          <button style={{ padding: "5px 12px", backgroundColor: "#21262d", color: "#c9d1d9", border: "1px solid #30363d", borderRadius: 6, fontSize: 12 }}>
            ⬇️ Pull
          </button>
          <button style={{ padding: "5px 12px", backgroundColor: "#21262d", color: "#c9d1d9", border: "1px solid #30363d", borderRadius: 6, fontSize: 12 }}>
            ⬆️ Push
          </button>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#8b949e" }}>Merge Progress:</span>
            <div style={{ width: 100, height: 6, backgroundColor: "#21262d", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${mergeProgress}%`, height: "100%", backgroundColor: "#3fb950", transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 12, color: "#3fb950" }}>{mergeProgress}%</span>
          </div>
        </div>

        {/* History Tab */}
        <div style={{ display: "flex", borderBottom: "1px solid #30363d", backgroundColor: "#0d1117" }}>
          <div style={{ padding: "10px 16px", fontSize: 13, color: "#c9d1d9", borderBottom: "2px solid #f78166" }}>History</div>
          <div style={{ padding: "10px 16px", fontSize: 13, color: "#8b949e" }}>Changes</div>
        </div>

        {/* Git Graph */}
        <div style={{ flex: 1, padding: 20, position: "relative", overflow: "hidden" }}>
          {/* SVG for connections */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            {activeConnections.map((conn, i) => {
              const from = commits[conn.from];
              const to = commits[conn.to];
              return (
                <path
                  key={i}
                  d={`M ${from.x + 8} ${from.y + 20} Q ${(from.x + to.x) / 2 + 8} ${(from.y + to.y) / 2 + 20} ${to.x + 8} ${to.y}`}
                  fill="none"
                  stroke={conn.color}
                  strokeWidth={2}
                  style={{ filter: `drop-shadow(0 0 3px ${conn.color})` }}
                />
              );
            })}
          </svg>

          {/* Commit nodes */}
          {commits.map((commit, i) => {
            const isActive = frame > i * 6;
            const branchColor = commit.branch === "main" ? "#6e7681" : commit.branch === "feature" ? "#3fb950" : "#f78166";

            return isActive ? (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: commit.x,
                  top: commit.y,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Commit circle */}
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: branchColor,
                  border: `2px solid ${branchColor}`,
                  boxShadow: `0 0 8px ${branchColor}`,
                }} />

                {/* Commit info */}
                <div style={{
                  backgroundColor: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: 6,
                  padding: "6px 10px",
                  minWidth: 200,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: "#58a6ff" }}>{commit.id}</span>
                    <span style={{ fontSize: 10, padding: "1px 6px", backgroundColor: branchColor + "33", color: branchColor, borderRadius: 10 }}>{commit.branch}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#c9d1d9", marginBottom: 2 }}>{commit.message}</div>
                  <div style={{ fontSize: 10, color: "#8b949e" }}>{commit.author} • {commit.time}</div>
                </div>
              </div>
            ) : null;
          })}

          {/* Merge conflict indicator */}
          {frame > 40 && frame < 80 && (
            <div style={{
              position: "absolute",
              top: 170,
              left: 150,
              backgroundColor: "#f8514966",
              border: "1px solid #f85149",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              color: "#f85149",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              ⚠️ Merge conflict in payment.ts
              <span style={{ fontSize: 10, padding: "2px 6px", backgroundColor: "#238636", color: "white", borderRadius: 4, marginLeft: 8 }}>
                {conflictsResolved}/3 resolved
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
