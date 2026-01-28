import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Glitch effect
  const glitchIntensity = frame < fps * 0.5 ? Math.sin(frame * 2) * 10 : 0;

  // Text reveal
  const scale = spring({
    frame: frame - fps * 0.5,
    fps,
    config: {
      damping: 12,
      stiffness: 200,
    },
  });

  const rotation = interpolate(frame, [0, fps * 0.5], [180, 0], {
    extrapolateRight: "clamp",
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
      {frame < fps * 0.5 && (
        <>
          <div
            style={{
              position: "absolute",
              top: `${30 + glitchIntensity}%`,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: "#00ff00",
              opacity: 0.8,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: `${60 - glitchIntensity}%`,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: "#ff0000",
              opacity: 0.6,
            }}
          />
        </>
      )}

      {/* Main Text */}
      <div
        style={{
          transform: `scale(${scale}) rotateX(${rotation}deg)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Arial Black, sans-serif",
            textShadow: "0 0 30px rgba(0, 255, 100, 0.5)",
          }}
        >
          사실은...
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: "bold",
            background: "linear-gradient(135deg, #00ff88, #00ccff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "Arial Black, sans-serif",
            marginTop: 20,
          }}
        >
          게임입니다
        </div>
      </div>

      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          opacity: interpolate(frame, [fps * 1.5, fps * 2], [0, 1]),
          fontSize: 28,
          color: "#888",
          fontFamily: "monospace",
        }}
      >
        // 상사 몰래 플레이하세요
      </div>
    </AbsoluteFill>
  );
};
