import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import {
  CellInvadersGameplay,
  NeonRacerGameplay,
  CodeDashGameplay,
  GitMergeGameplay,
} from "./GameplayScenes";

interface GameCardProps {
  name: string;
  disguise: string;
  GameComponent: React.FC;
}

const GameCard: React.FC<GameCardProps> = ({
  name,
  disguise,
  GameComponent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const cardOpacity = interpolate(frame, [0, 10], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f1a",
        padding: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 40,
          height: "100%",
          transform: `translateX(${(1 - slideIn) * 100}px)`,
          opacity: cardOpacity,
        }}
      >
        {/* Game Preview - 실제 게임 플레이 */}
        <div
          style={{
            width: "60%",
            height: "100%",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            border: "3px solid #333",
          }}
        >
          <GameComponent />
        </div>

        {/* Info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "#666",
              marginBottom: 8,
              fontFamily: "monospace",
            }}
          >
            위장 앱:
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#00ff88",
              fontWeight: "bold",
              marginBottom: 30,
              fontFamily: "Arial, sans-serif",
            }}
          >
            {disguise}
          </div>

          <div
            style={{
              fontSize: 48,
              color: "white",
              fontWeight: "bold",
              fontFamily: "Arial Black, sans-serif",
              marginBottom: 20,
            }}
          >
            {name}
          </div>

          <div
            style={{
              fontSize: 18,
              color: "#888",
              lineHeight: 1.6,
            }}
          >
            ESC 키를 누르면<br />
            진짜 {disguise}(으)로 변신!
          </div>

          {/* 실시간 플레이 뱃지 */}
          <div
            style={{
              marginTop: 30,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(255,0,0,0.2)",
              padding: "8px 16px",
              borderRadius: 20,
              width: "fit-content",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#ff4444",
                animation: "pulse 1s infinite",
              }}
            />
            <span style={{ color: "#ff6666", fontSize: 14 }}>LIVE GAMEPLAY</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 간단한 플레이스홀더 게임 (나머지 게임용)
const PaperReaderGameplay: React.FC = () => {
  const frame = useCurrentFrame();

  // 스네이크 움직임
  const snakeSegments = Array.from({ length: 8 }).map((_, i) => ({
    x: 200 + Math.sin((frame - i * 5) * 0.1) * 100,
    y: 250 + Math.cos((frame - i * 5) * 0.08) * 80,
  }));

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#525659", padding: 20 }}>
      {/* Toolbar */}
      <div style={{ height: 40, backgroundColor: "#323639", display: "flex", alignItems: "center", padding: "0 15px", marginBottom: 20 }}>
        <span style={{ color: "white", fontSize: 13 }}>📄 analysis_final_v2.pdf</span>
      </div>

      {/* Paper */}
      <div style={{ backgroundColor: "white", height: "calc(100% - 60px)", padding: 30, position: "relative" }}>
        {/* 가짜 텍스트 */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} style={{ height: 20, backgroundColor: "#f0f0f0", marginBottom: 8, width: `${70 + Math.random() * 30}%` }} />
        ))}

        {/* 스네이크 (형광펜) */}
        {snakeSegments.map((seg, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: seg.x,
              top: seg.y,
              width: 25,
              height: 25,
              backgroundColor: i === 0 ? "rgba(76, 175, 80, 0.8)" : "rgba(129, 199, 132, 0.6)",
              borderRadius: i === 0 ? 4 : 2,
              border: i === 0 ? "2px solid #2E7D32" : "none",
            }}
          />
        ))}

        {/* 음식 (파란 하이라이트) */}
        <div
          style={{
            position: "absolute",
            left: 350,
            top: 200,
            width: 25,
            height: 25,
            backgroundColor: "rgba(25, 118, 210, 0.3)",
            border: "2px solid #1976D2",
          }}
        />
      </div>
    </div>
  );
};

const NetworkFlowGameplay: React.FC = () => {
  const frame = useCurrentFrame();

  const pipes = [
    { x: 0, y: 0, rotation: 0, active: frame > 10 },
    { x: 1, y: 0, rotation: 90, active: frame > 20 },
    { x: 2, y: 0, rotation: 90, active: frame > 30 },
    { x: 0, y: 1, rotation: 0, active: frame > 15 },
    { x: 1, y: 1, rotation: 0, active: frame > 25 },
    { x: 2, y: 1, rotation: 180, active: frame > 35 },
  ];

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#1e1e1e", padding: 20 }}>
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div style={{ width: 50, backgroundColor: "#333", marginRight: 20 }}>
          {["🔀", "📊", "🛡️"].map((icon, i) => (
            <div key={i} style={{ padding: 10, textAlign: "center" }}>{icon}</div>
          ))}
        </div>

        {/* Grid */}
        <div>
          <div style={{ color: "white", marginBottom: 10, fontSize: 14 }}>System Status: <span style={{ color: frame > 35 ? "#00ff00" : "#ff4444" }}>{frame > 35 ? "ONLINE" : "OFFLINE"}</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: 4, backgroundColor: "#252526", padding: 10, borderRadius: 8 }}>
            {pipes.map((pipe, i) => (
              <div
                key={i}
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: "#1e1e1e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `rotate(${pipe.rotation + (frame * 2 % 360 === 0 && !pipe.active ? 90 : 0)}deg)`,
                  transition: "transform 0.3s",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 60,
                    backgroundColor: pipe.active ? "#00ff00" : "#555",
                    boxShadow: pipe.active ? "0 0 10px #00ff00" : "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PixelQuestGameplay: React.FC = () => {
  const frame = useCurrentFrame();

  // 플레이어 위치
  const playerX = 200 + Math.sin(frame * 0.1) * 50;
  const playerY = 250 + Math.cos(frame * 0.08) * 30;

  // 적들
  const enemies = [
    { x: 350 + Math.sin(frame * 0.05) * 100, y: 150 },
    { x: 150 + Math.cos(frame * 0.07) * 80, y: 350 },
    { x: 400, y: 300 + Math.sin(frame * 0.06) * 50 },
  ];

  // 총알
  const bullets = [
    { x: playerX + (frame % 30) * 15, y: playerY },
    { x: playerX + ((frame + 15) % 30) * 15, y: playerY - 20 },
  ];

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0" }}>
      {/* Paint toolbar */}
      <div style={{ height: 80, backgroundColor: "#f5f5f5", borderBottom: "1px solid #ccc", display: "flex", alignItems: "center", padding: "0 20px", gap: 10 }}>
        {["🖌️", "✏️", "🪣", "⬜", "⭕"].map((tool, i) => (
          <div key={i} style={{ padding: 10, backgroundColor: i === 0 ? "#ddd" : "transparent", borderRadius: 4 }}>{tool}</div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"].map((color) => (
            <div key={color} style={{ width: 25, height: 25, backgroundColor: color, border: "1px solid #999" }} />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position: "relative", height: "calc(100% - 80px)", backgroundColor: "white" }}>
        {/* 플레이어 */}
        <div
          style={{
            position: "absolute",
            left: playerX,
            top: playerY,
            width: 40,
            height: 40,
            backgroundColor: "#4CAF50",
            borderRadius: "50%",
            border: "3px solid #2E7D32",
          }}
        />

        {/* 적들 */}
        {enemies.map((enemy, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: enemy.x,
              top: enemy.y,
              width: 35,
              height: 35,
              backgroundColor: "#f44336",
              borderRadius: 4,
              transform: `rotate(${frame * 3}deg)`,
            }}
          />
        ))}

        {/* 총알 */}
        {bullets.map((bullet, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: bullet.x,
              top: bullet.y,
              width: 15,
              height: 8,
              backgroundColor: "#2196F3",
              borderRadius: 4,
            }}
          />
        ))}

        {/* 페인트 자국들 */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 100 + i * 80,
              top: 400 + Math.sin(i) * 30,
              width: 60,
              height: 60,
              backgroundColor: `hsl(${i * 60}, 70%, 60%)`,
              borderRadius: "50%",
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const games: { name: string; disguise: string; GameComponent: React.FC }[] = [
  {
    name: "Cell Invaders",
    disguise: "Excel 스프레드시트",
    GameComponent: CellInvadersGameplay,
  },
  {
    name: "Code Dash",
    disguise: "VS Code 에디터",
    GameComponent: CodeDashGameplay,
  },
  {
    name: "Neon Racer",
    disguise: "터미널 콘솔",
    GameComponent: NeonRacerGameplay,
  },
  {
    name: "Git Merge",
    disguise: "Git 클라이언트",
    GameComponent: GitMergeGameplay,
  },
  {
    name: "Paper Reader",
    disguise: "PDF 뷰어",
    GameComponent: PaperReaderGameplay,
  },
  {
    name: "Network Flow",
    disguise: "네트워크 모니터",
    GameComponent: NetworkFlowGameplay,
  },
  {
    name: "Pixel Quest",
    disguise: "그림판",
    GameComponent: PixelQuestGameplay,
  },
];

export const GameShowcase: React.FC = () => {
  const { fps } = useVideoConfig();
  const frameDuration = 2 * fps; // 2 seconds per game

  return (
    <AbsoluteFill>
      {games.map((game, index) => (
        <Sequence
          key={game.name}
          from={index * frameDuration}
          durationInFrames={frameDuration}
        >
          <GameCard {...game} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
