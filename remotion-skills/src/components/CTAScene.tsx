import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  const urlOpacity = interpolate(frame, [fps * 1, fps * 1.5], [0, 1]);

  const pulseScale = 1 + Math.sin(frame * 0.15) * 0.03;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0a1a1e 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)",
          transform: `scale(${pulseScale})`,
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: "bold",
            fontFamily: "Arial Black, sans-serif",
            background: "linear-gradient(135deg, #00ff88, #00ccff, #8844ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 20,
          }}
        >
          HiddenDesk
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#888",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 3,
          }}
        >
          회사에서 몰래 즐기는 게임
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          position: "absolute",
          bottom: 150,
          opacity: urlOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            color: "white",
            fontFamily: "monospace",
            backgroundColor: "rgba(0,255,136,0.2)",
            padding: "20px 50px",
            borderRadius: 15,
            border: "2px solid #00ff88",
          }}
        >
          hiddendesk.io
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 24,
            color: "#666",
          }}
        >
          지금 바로 플레이하세요
        </div>
      </div>

      {/* Decorative corners */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 50,
          width: 100,
          height: 100,
          borderTop: "3px solid #00ff88",
          borderLeft: "3px solid #00ff88",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 50,
          right: 50,
          width: 100,
          height: 100,
          borderBottom: "3px solid #00ccff",
          borderRight: "3px solid #00ccff",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};
