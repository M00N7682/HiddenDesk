import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { IntroScene } from "../components/IntroScene";
import { RevealScene } from "../components/RevealScene";
import { GameShowcase } from "../components/GameShowcase";
import { FeatureScene } from "../components/FeatureScene";
import { CTAScene } from "../components/CTAScene";

export const HiddenDeskPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Scene 1: Intro - "평범한 회사 화면" (0-5초) */}
      <Sequence from={0} durationInFrames={5 * fps}>
        <IntroScene />
      </Sequence>

      {/* Scene 2: Reveal - "사실은..." (5-8초) */}
      <Sequence from={5 * fps} durationInFrames={3 * fps}>
        <RevealScene />
      </Sequence>

      {/* Scene 3: Game Showcase (8-22초) */}
      <Sequence from={8 * fps} durationInFrames={14 * fps}>
        <GameShowcase />
      </Sequence>

      {/* Scene 4: Features (22-26초) */}
      <Sequence from={22 * fps} durationInFrames={4 * fps}>
        <FeatureScene />
      </Sequence>

      {/* Scene 5: CTA (26-30초) */}
      <Sequence from={26 * fps} durationInFrames={4 * fps}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
