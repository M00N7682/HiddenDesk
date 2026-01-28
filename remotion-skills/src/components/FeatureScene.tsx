import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface FeatureItemProps {
  icon: string;
  text: string;
  delay: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        transform: `translateX(${(1 - appear) * 100}px)`,
        opacity,
        marginBottom: 30,
      }}
    >
      <div
        style={{
          fontSize: 60,
          width: 100,
          height: 100,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 20,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 36,
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const FeatureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1]);

  const features = [
    { icon: "🎭", text: "완벽한 업무 위장" },
    { icon: "⌨️", text: "ESC 키 = 즉시 숨기기" },
    { icon: "🆓", text: "100% 무료 & 설치 불필요" },
    { icon: "🌐", text: "브라우저에서 바로 플레이" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        padding: 100,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 64,
          fontWeight: "bold",
          color: "white",
          marginBottom: 60,
          opacity: titleOpacity,
          fontFamily: "Arial Black, sans-serif",
        }}
      >
        왜 <span style={{ color: "#00ff88" }}>HiddenDesk</span>인가?
      </div>

      {/* Features */}
      <div style={{ marginLeft: 50 }}>
        {features.map((feature, index) => (
          <FeatureItem
            key={index}
            icon={feature.icon}
            text={feature.text}
            delay={index * 15 + 10}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
