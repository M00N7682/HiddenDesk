import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// 세로 버전 Cell Invaders
const CellInvadersVertical: React.FC = () => {
  const frame = useCurrentFrame();

  const playerX = 150 + Math.sin(frame * 0.12) * 80;
  const bulletY = frame % 25 < 18 ? 500 - (frame % 25) * 30 : -100;

  const enemies = [
    { x: 80, y: 100 + (frame * 0.5) % 200 },
    { x: 180, y: 150 + (frame * 0.5) % 200 },
    { x: 280, y: 120 + (frame * 0.5) % 200 },
    { x: 130, y: 200 + (frame * 0.5) % 200 },
    { x: 230, y: 180 + (frame * 0.5) % 200 },
  ];

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#217346" }}>
      {/* Ribbon */}
      <div style={{ height: 50, backgroundColor: "#185c37", display: "flex", alignItems: "center", padding: "0 15px", gap: 12 }}>
        {["File", "Home", "Insert"].map((t, i) => (
          <span key={t} style={{ color: "white", fontSize: 14, opacity: i === 1 ? 1 : 0.7 }}>{t}</span>
        ))}
      </div>

      {/* Grid */}
      <div style={{ backgroundColor: "white", height: "calc(100% - 50px)", position: "relative" }}>
        {/* Grid lines */}
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={`h${i}`} style={{ position: "absolute", top: i * 35, left: 0, right: 0, height: 1, backgroundColor: "#e8e8e8" }} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`v${i}`} style={{ position: "absolute", left: i * 50, top: 0, bottom: 0, width: 1, backgroundColor: "#e8e8e8" }} />
        ))}

        {/* Enemies */}
        {enemies.map((e, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: e.x,
              top: e.y,
              backgroundColor: "#ffcccc",
              border: "1px solid #ff6666",
              padding: "5px 10px",
              fontSize: 13,
              color: "#cc0000",
              fontWeight: "bold",
            }}
          >
            #ERROR!
          </div>
        ))}

        {/* Player */}
        <div
          style={{
            position: "absolute",
            left: playerX,
            top: 550,
            width: 60,
            height: 30,
            backgroundColor: "rgba(255, 255, 0, 0.7)",
            border: "2px solid #d4a017",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          =SUM()
        </div>

        {/* Bullet */}
        {bulletY > 0 && (
          <div
            style={{
              position: "absolute",
              left: playerX + 26,
              top: bulletY,
              width: 8,
              height: 25,
              backgroundColor: "#007acc",
              borderRadius: 4,
            }}
          />
        )}
      </div>
    </div>
  );
};

// Scene 1: Hook with actual gameplay
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textOpacity = interpolate(frame, [fps * 0.3, fps * 0.8], [0, 1]);
  const textY = interpolate(frame, [fps * 0.3, fps * 0.8], [30, 0]);

  return (
    <AbsoluteFill>
      {/* 실제 게임 플레이 배경 */}
      <CellInvadersVertical />

      {/* 오버레이 텍스트 */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.85)",
            padding: "20px 30px",
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 42, fontWeight: "bold", color: "white", fontFamily: "Arial Black" }}>
            회사에서
          </div>
          <div style={{ fontSize: 52, fontWeight: "bold", color: "#00ff88", fontFamily: "Arial Black" }}>
            게임하는 법
          </div>
        </div>
      </div>

      {/* 하단 힌트 */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [fps * 1.5, fps * 2], [0, 1]),
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: "12px 24px",
            borderRadius: 30,
            color: "white",
            fontSize: 20,
          }}
        >
          👆 이거 뭘로 보여요?
        </div>
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
      {/* Glitch lines */}
      {frame < 15 && (
        <>
          <div style={{ position: "absolute", top: "30%", left: 0, right: 0, height: 3, backgroundColor: "#00ff00", opacity: 0.6 }} />
          <div style={{ position: "absolute", top: "60%", left: 0, right: 0, height: 2, backgroundColor: "#ff0000", opacity: 0.4 }} />
        </>
      )}

      <div style={{ transform: `scale(${scale})`, textAlign: "center", padding: 40 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Arial Black",
            marginBottom: 20,
          }}
        >
          엑셀 아님
        </div>
        <div
          style={{
            fontSize: 80,
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

// Scene 3: Quick showcase with actual gameplay
const QuickShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 4개 게임 순환
  const games = [
    { name: "Cell Invaders", disguise: "Excel", color: "#217346" },
    { name: "Code Dash", disguise: "VS Code", color: "#007ACC" },
    { name: "Neon Racer", disguise: "Terminal", color: "#0c0c0c" },
    { name: "Git Merge", disguise: "Git", color: "#F05032" },
  ];

  const cycleLength = fps * 1.5; // 1.5초씩
  const currentIndex = Math.floor(frame / cycleLength) % games.length;
  const game = games[currentIndex];
  const localFrame = frame % cycleLength;

  const slideIn = spring({
    frame: localFrame,
    fps,
    config: { damping: 15 },
  });

  // 간단한 게임 미리보기
  const GamePreview = () => {
    const f = frame;
    if (currentIndex === 0) {
      // Excel
      return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#217346" }}>
          <div style={{ height: 30, backgroundColor: "#185c37" }} />
          <div style={{ backgroundColor: "white", height: "calc(100% - 30px)", position: "relative", padding: 10 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: "flex", marginBottom: 2 }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} style={{ width: 50, height: 22, border: "1px solid #e0e0e0", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {i === 2 && j === 2 ? <span style={{ color: "red", fontWeight: "bold" }}>#ERR</span> : "$" + Math.floor(Math.random() * 900)}
                  </div>
                ))}
              </div>
            ))}
            <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", width: 40, height: 20, backgroundColor: "rgba(255,255,0,0.7)", border: "2px solid #d4a017" }} />
          </div>
        </div>
      );
    } else if (currentIndex === 1) {
      // VS Code
      return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#1e1e1e", display: "flex" }}>
          <div style={{ width: 30, backgroundColor: "#333" }} />
          <div style={{ flex: 1, padding: 10 }}>
            <div style={{ height: 20, backgroundColor: "#2d2d2d", marginBottom: 10 }} />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ color: "#569cd6", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: "#666", marginRight: 10 }}>{i + 1}</span>
                const x = {Math.floor(Math.random() * 100)};
              </div>
            ))}
            <div style={{ position: "absolute", bottom: 30, left: 50, color: "#4EC9B0", fontSize: 16 }}>
              {"\\o/"}<br />{"/ \\"}
            </div>
          </div>
        </div>
      );
    } else if (currentIndex === 2) {
      // Terminal
      return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#0c0c0c", padding: 15, fontFamily: "monospace" }}>
          <div style={{ color: "#4EC9B0", fontSize: 12, marginBottom: 10 }}>$ neon-racer</div>
          <div style={{ color: "#666", marginBottom: 20 }}>SCORE: {f * 10}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 15 }}>
            {[0, 1, 2].map((lane) => (
              <div key={lane} style={{ width: 40, height: 150, borderLeft: "2px solid #333", borderRight: "2px solid #333", position: "relative" }}>
                {lane === 1 && <div style={{ position: "absolute", bottom: 10, left: 10, color: "#00ff00", fontSize: 20 }}>▲</div>}
                {lane === (f % 3) && <div style={{ position: "absolute", top: (f * 3) % 100, left: 10, color: "#ff4444", fontSize: 16 }}>▼</div>}
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      // Git
      return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#1e1e1e", padding: 15 }}>
          <div style={{ color: "white", fontSize: 12, marginBottom: 15 }}>Git Merge - Level 3</div>
          <svg width="100%" height="200">
            <circle cx="60" cy="40" r="20" fill="#e06c75" />
            <circle cx="180" cy="40" r="20" fill="#e06c75" />
            <circle cx="120" cy="100" r="20" fill="#98c379" />
            <circle cx="120" cy="160" r="20" fill="#61afef" />
            {f > 20 && <line x1="60" y1="40" x2="180" y2="40" stroke="#e06c75" strokeWidth="3" />}
            {f > 35 && <line x1="60" y1="40" x2="120" y2="100" stroke="#98c379" strokeWidth="3" />}
            {f > 35 && <line x1="180" y1="40" x2="120" y2="100" stroke="#98c379" strokeWidth="3" />}
          </svg>
        </div>
      );
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 28, color: "#888", marginBottom: 10 }}>7가지 위장 게임</div>
        <div style={{ fontSize: 36, color: "#00ff88", fontWeight: "bold" }}>{game.name}</div>
        <div style={{ fontSize: 18, color: "#666", marginTop: 5 }}>위장: {game.disguise}</div>
      </div>

      {/* Game Preview */}
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 40,
          right: 40,
          height: 350,
          borderRadius: 20,
          overflow: "hidden",
          border: "3px solid #333",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          transform: `scale(${slideIn})`,
        }}
      >
        <GamePreview />
      </div>

      {/* Live badge */}
      <div
        style={{
          position: "absolute",
          top: 220,
          right: 60,
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "rgba(255,0,0,0.3)",
          padding: "6px 12px",
          borderRadius: 20,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#ff4444" }} />
        <span style={{ color: "#ff6666", fontSize: 12 }}>LIVE</span>
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
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)",
        }}
      />

      <div style={{ textAlign: "center", transform: `scale(${scale})`, padding: 40 }}>
        <div
          style={{
            fontSize: 64,
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
            fontSize: 24,
            color: "#888",
            marginTop: 10,
            marginBottom: 60,
          }}
        >
          회사에서 몰래 즐기는 게임
        </div>

        <div
          style={{
            fontSize: 32,
            color: "white",
            backgroundColor: "rgba(0,255,136,0.2)",
            padding: "18px 40px",
            borderRadius: 20,
            border: "2px solid #00ff88",
            transform: `scale(${pulse})`,
            marginBottom: 30,
          }}
        >
          hiddendesk.io
        </div>

        <div
          style={{
            fontSize: 22,
            color: "#00ff88",
            marginTop: 20,
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
      {/* Hook with gameplay - 0~3초 */}
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
