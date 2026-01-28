import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// ESC 변환 데모 컴포넌트
const EscTransformDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ESC 키 누르는 타이밍 (1.5초쯤)
  const escPressFrame = fps * 1.5;
  const isAfterEsc = frame > escPressFrame;

  // 게임 → 업무 전환 애니메이션
  const transitionProgress = interpolate(
    frame,
    [escPressFrame, escPressFrame + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const escKeyScale = frame > escPressFrame - 5 && frame < escPressFrame + 5
    ? 1.2
    : 1;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30, marginBottom: 40 }}>
      {/* 미니 게임 화면 */}
      <div
        style={{
          width: 280,
          height: 180,
          borderRadius: 12,
          overflow: "hidden",
          border: "3px solid #333",
          position: "relative",
        }}
      >
        {/* 게임 화면 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#217346",
            opacity: 1 - transitionProgress,
          }}
        >
          <div style={{ height: 25, backgroundColor: "#185c37" }} />
          <div style={{ backgroundColor: "white", height: "calc(100% - 25px)", position: "relative", padding: 8 }}>
            {/* 그리드 */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: "flex" }}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    style={{
                      width: 60,
                      height: 25,
                      border: "1px solid #e0e0e0",
                      fontSize: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: i === 2 && j === 1 ? "#cc0000" : "#333",
                      backgroundColor: i === 2 && j === 1 ? "#ffcccc" : "white",
                    }}
                  >
                    {i === 2 && j === 1 ? "#ERR!" : `$${Math.floor(Math.random() * 900)}`}
                  </div>
                ))}
              </div>
            ))}
            {/* 플레이어 */}
            <div
              style={{
                position: "absolute",
                bottom: 15,
                left: 100 + Math.sin(frame * 0.15) * 30,
                width: 50,
                height: 22,
                backgroundColor: "rgba(255,255,0,0.8)",
                border: "2px solid #d4a017",
                fontSize: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              =SUM()
            </div>
          </div>
        </div>

        {/* 업무 화면 (ESC 후) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#217346",
            opacity: transitionProgress,
          }}
        >
          <div style={{ height: 25, backgroundColor: "#185c37" }} />
          <div style={{ backgroundColor: "white", height: "calc(100% - 25px)", padding: 8 }}>
            {/* 진짜 엑셀처럼 보이는 데이터 */}
            {[
              ["분기", "매출", "비용", "이익"],
              ["Q1", "$12,500", "$8,200", "$4,300"],
              ["Q2", "$15,800", "$9,100", "$6,700"],
              ["Q3", "$18,200", "$10,500", "$7,700"],
              ["Q4", "$22,100", "$12,300", "$9,800"],
            ].map((row, i) => (
              <div key={i} style={{ display: "flex" }}>
                {row.map((cell, j) => (
                  <div
                    key={j}
                    style={{
                      width: 60,
                      height: 25,
                      border: "1px solid #e0e0e0",
                      fontSize: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: i === 0 ? "bold" : "normal",
                      backgroundColor: i === 0 ? "#f0f0f0" : "white",
                    }}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 플래시 이펙트 */}
        {frame > escPressFrame - 2 && frame < escPressFrame + 5 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              opacity: interpolate(frame, [escPressFrame, escPressFrame + 5], [0.8, 0]),
            }}
          />
        )}
      </div>

      {/* ESC 키 */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            backgroundColor: "#333",
            color: "white",
            padding: "12px 24px",
            borderRadius: 10,
            fontSize: 28,
            fontFamily: "monospace",
            border: "3px solid #555",
            boxShadow: "0 6px 0 #222",
            transform: `scale(${escKeyScale})`,
            transition: "transform 0.1s",
          }}
        >
          ESC
        </div>
        <div style={{ color: "#888", fontSize: 16, marginTop: 10 }}>
          {isAfterEsc ? "😎 안전!" : "누르면..."}
        </div>
      </div>

      {/* 화살표 & 설명 */}
      <div style={{ fontSize: 48, color: "#00ff88" }}>→</div>
      <div style={{ color: "white", fontSize: 22 }}>
        <div style={{ fontWeight: "bold", marginBottom: 5 }}>
          {isAfterEsc ? "진짜 업무화면!" : "게임 플레이 중..."}
        </div>
        <div style={{ color: "#888", fontSize: 16 }}>
          {isAfterEsc ? "상사가 와도 걱정 없음 ㅋㅋ" : "상사 접근 감지!"}
        </div>
      </div>
    </div>
  );
};

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
        gap: 20,
        transform: `translateX(${(1 - appear) * 100}px)`,
        opacity,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontSize: 40,
          width: 70,
          height: 70,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 15,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 28,
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
    { icon: "🆓", text: "100% 무료 & 설치 불필요" },
    { icon: "🌐", text: "브라우저에서 바로 플레이" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        padding: "60px 80px",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 48,
          fontWeight: "bold",
          color: "white",
          marginBottom: 30,
          opacity: titleOpacity,
          fontFamily: "Arial Black, sans-serif",
        }}
      >
        왜 <span style={{ color: "#00ff88" }}>HiddenDesk</span>인가?
      </div>

      {/* ESC 변환 데모 */}
      <EscTransformDemo />

      {/* Features */}
      <div style={{ marginLeft: 30, marginTop: 20 }}>
        {features.map((feature, index) => (
          <FeatureItem
            key={index}
            icon={feature.icon}
            text={feature.text}
            delay={index * 12 + fps * 2.5}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
