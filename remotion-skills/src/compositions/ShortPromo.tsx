import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Compact Excel mock for vertical video
const MiniExcel: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: 500,
        backgroundColor: "#217346",
        borderRadius: 20,
        overflow: "hidden",
        margin: "0 40px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          height: 40,
          backgroundColor: "#185c37",
          display: "flex",
          alignItems: "center",
          padding: "0 15px",
          gap: 10,
        }}
      >
        {["File", "Home", "Insert"].map((t) => (
          <span key={t} style={{ color: "white", fontSize: 12 }}>
            {t}
          </span>
        ))}
      </div>
      {/* Grid */}
      <div style={{ backgroundColor: "white", padding: 10 }}>
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} style={{ display: "flex" }}>
            <div
              style={{
                width: 30,
                height: 28,
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                borderRight: "1px solid #ccc",
                borderBottom: "1px solid #ccc",
              }}
            >
              {row}
            </div>
            {["A", "B", "C", "D"].map((col) => (
              <div
                key={col}
                style={{
                  width: 80,
                  height: 28,
                  borderRight: "1px solid #e0e0e0",
                  borderBottom: "1px solid #e0e0e0",
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 5px",
                }}
              >
                {row === 1 ? col : `$${Math.floor(Math.random() * 900 + 100)}`}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Scene 1: Hook
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textOpacity = interpolate(frame, [fps * 0.5, fps * 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f1a",
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Arial Black",
            opacity: textOpacity,
          }}
        >
          회사에서
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: "bold",
            color: "#00ff88",
            fontFamily: "Arial Black",
            opacity: textOpacity,
          }}
        >
          게임하는 법
        </div>
      </div>
      <MiniExcel />
      <div
        style={{
          marginTop: 40,
          fontSize: 24,
          color: "#666",
          opacity: textOpacity,
        }}
      >
        이게 뭘로 보여요?
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: Reveal
const RevealShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Arial Black",
          }}
        >
          엑셀 아님
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: "bold",
            background: "linear-gradient(135deg, #00ff88, #00ccff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "Arial Black",
          }}
        >
          게임임 ㅋㅋ
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: Quick showcase
const QuickShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const games = [
    { name: "Cell Invaders", icon: "📊", color: "#217346" },
    { name: "Code Dash", icon: "💻", color: "#007ACC" },
    { name: "Neon Racer", icon: "🏎️", color: "#4EC9B0" },
    { name: "Git Merge", icon: "🔀", color: "#F05032" },
  ];

  const currentIndex = Math.floor(frame / (fps * 0.75)) % games.length;
  const game = games[currentIndex];

  const bounceScale = spring({
    frame: frame % (fps * 0.75),
    fps,
    config: { damping: 12 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f1a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 32,
          color: "#888",
          marginBottom: 30,
          fontFamily: "Arial",
        }}
      >
        7가지 위장 게임
      </div>
      <div
        style={{
          width: 300,
          height: 300,
          backgroundColor: game.color,
          borderRadius: 30,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${bounceScale})`,
          boxShadow: `0 20px 60px ${game.color}60`,
        }}
      >
        <div style={{ fontSize: 100 }}>{game.icon}</div>
        <div
          style={{
            fontSize: 28,
            color: "white",
            fontWeight: "bold",
            marginTop: 15,
          }}
        >
          {game.name}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: CTA
const CTAShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const pulse = 1 + Math.sin(frame * 0.2) * 0.05;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0f0f1a 0%, #1a0a2e 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", transform: `scale(${scale})` }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            background: "linear-gradient(135deg, #00ff88, #00ccff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "Arial Black",
          }}
        >
          HiddenDesk
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#888",
            marginTop: 10,
            marginBottom: 50,
          }}
        >
          회사에서 몰래 즐기는 게임
        </div>
        <div
          style={{
            fontSize: 36,
            color: "white",
            backgroundColor: "rgba(0,255,136,0.2)",
            padding: "15px 40px",
            borderRadius: 15,
            border: "2px solid #00ff88",
            transform: `scale(${pulse})`,
          }}
        >
          hiddendesk.io
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: "#00ff88",
          }}
        >
          👆 바이오 링크 클릭
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ShortPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Hook - 0~3초 */}
      <Sequence from={0} durationInFrames={3 * fps}>
        <HookScene />
      </Sequence>

      {/* Reveal - 3~5초 */}
      <Sequence from={3 * fps} durationInFrames={2 * fps}>
        <RevealShort />
      </Sequence>

      {/* Quick Showcase - 5~11초 */}
      <Sequence from={5 * fps} durationInFrames={6 * fps}>
        <QuickShowcase />
      </Sequence>

      {/* CTA - 11~15초 */}
      <Sequence from={11 * fps} durationInFrames={4 * fps}>
        <CTAShort />
      </Sequence>
    </AbsoluteFill>
  );
};
