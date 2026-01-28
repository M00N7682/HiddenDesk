import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { CellInvadersGameplay } from "./GameplayScenes";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textOpacity = interpolate(frame, [fps * 2, fps * 3], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [fps * 2, fps * 3], [30, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* 실제 Cell Invaders 게임 플레이 */}
      <CellInvadersGameplay />

      {/* Overlay Text */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.85)",
            padding: "20px 50px",
            borderRadius: 12,
            color: "white",
            fontSize: 36,
            fontFamily: "Arial Black, sans-serif",
            textAlign: "center",
            border: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          그냥 Excel 아닙니다
        </div>
      </div>

      {/* 상단 힌트 */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 30,
          opacity: interpolate(frame, [fps * 1, fps * 1.5], [0, 1]),
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: "10px 20px",
            borderRadius: 8,
            color: "#00ff88",
            fontSize: 14,
            fontFamily: "monospace",
          }}
        >
          🎮 실제 플레이 화면
        </div>
      </div>
    </AbsoluteFill>
  );
};
