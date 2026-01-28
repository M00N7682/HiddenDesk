import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

interface GameCardProps {
  name: string;
  disguise: string;
  description: string;
  color: string;
  icon: string;
}

const GameCard: React.FC<GameCardProps> = ({
  name,
  disguise,
  description,
  color,
  icon,
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
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 60,
          alignItems: "center",
          transform: `translateX(${(1 - slideIn) * 200}px)`,
          opacity: cardOpacity,
        }}
      >
        {/* Game Preview Box */}
        <div
          style={{
            width: 700,
            height: 500,
            backgroundColor: color,
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: `0 20px 60px ${color}40`,
            border: `3px solid ${color}`,
          }}
        >
          <div style={{ fontSize: 120, marginBottom: 20 }}>{icon}</div>
          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: "white",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {name}
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 24,
              color: "#666",
              marginBottom: 10,
              fontFamily: "monospace",
            }}
          >
            위장:
          </div>
          <div
            style={{
              fontSize: 42,
              color: color,
              fontWeight: "bold",
              marginBottom: 30,
              fontFamily: "Arial, sans-serif",
            }}
          >
            {disguise}
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#ccc",
              lineHeight: 1.5,
              fontFamily: "Arial, sans-serif",
            }}
          >
            {description}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const games: GameCardProps[] = [
  {
    name: "Cell Invaders",
    disguise: "Excel 스프레드시트",
    description: "엑셀처럼 보이는 슈팅 게임\n#ERROR를 제거하세요",
    color: "#217346",
    icon: "📊",
  },
  {
    name: "Code Dash",
    disguise: "VS Code 에디터",
    description: "코드 에디터 속 러너 게임\n버그를 피해 달리세요",
    color: "#007ACC",
    icon: "💻",
  },
  {
    name: "Neon Racer",
    disguise: "터미널 콘솔",
    description: "터미널에서 레이싱\nASCII 아트 드라이빙",
    color: "#4EC9B0",
    icon: "🏎️",
  },
  {
    name: "Git Merge",
    disguise: "Git 클라이언트",
    description: "커밋을 연결하는 퍼즐\n브랜치를 머지하세요",
    color: "#F05032",
    icon: "🔀",
  },
  {
    name: "Paper Reader",
    disguise: "PDF 뷰어",
    description: "논문 속 스네이크 게임\n인용을 수집하세요",
    color: "#FF6B6B",
    icon: "📄",
  },
  {
    name: "Network Flow",
    disguise: "네트워크 모니터",
    description: "파이프 연결 퍼즐\n서버를 연결하세요",
    color: "#845EC2",
    icon: "🌐",
  },
  {
    name: "Pixel Quest",
    disguise: "그림판",
    description: "페인트 앱 속 슈터\n캔버스를 지키세요",
    color: "#FF9F1C",
    icon: "🎨",
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
