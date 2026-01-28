import { Composition } from "remotion";
import { HiddenDeskPromo } from "./compositions/HiddenDeskPromo";
import { ShortPromo } from "./compositions/ShortPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main Promo Video - 30 seconds */}
      <Composition
        id="HiddenDeskPromo"
        component={HiddenDeskPromo}
        durationInFrames={30 * 30} // 30 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Short Version for TikTok/Reels - 15 seconds */}
      <Composition
        id="ShortPromo"
        component={ShortPromo}
        durationInFrames={15 * 30} // 15 seconds at 30fps
        fps={30}
        width={1080}
        height={1920} // Vertical for shorts
      />
    </>
  );
};
