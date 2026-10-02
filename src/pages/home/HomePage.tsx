import { useRef } from "react";
import { useHomeExperience } from "@/features/home-experience/model/useHomeExperience";
import { HomeArchiveScene } from "@/features/home-experience/ui/HomeArchiveScene";
import { HomeCourseUniverse } from "@/features/home-experience/ui/HomeCourseUniverse";
import { HomeGrowthScene } from "@/features/home-experience/ui/HomeGrowthScene";
import { HomeHeroScene } from "@/features/home-experience/ui/HomeHeroScene";
import { HomeInterfaceDNA } from "@/features/home-experience/ui/HomeInterfaceDNA";
import { HomeMotionLab } from "@/features/home-experience/ui/HomeMotionLab";
import { HomePersonalSystem } from "@/features/home-experience/ui/HomePersonalSystem";
import { HomePortalScene } from "@/features/home-experience/ui/HomePortalScene";
import { HomeSectionRail } from "@/features/home-experience/ui/HomeSectionRail";
import { HomeSystemStatus } from "@/features/home-experience/ui/HomeSystemStatus";
import { HomeSiteOverview } from "@/features/home-experience/ui/HomeSiteOverview";
import "@/features/home-experience/styles/home-experience.css";
import { mockUserGrowth } from "./home.data";

export function HomePage({
  progress,
  resumeTopic,
}: {
  progress: number;
  resumeTopic?: { id: string; number: string; title: string };
}) {
  const root = useRef<HTMLDivElement>(null);
  const { activeIndex, motionTier } = useHomeExperience(root);

  const openPrimary = () => {
    window.location.hash = resumeTopic?.id ?? "matrices";
  };

  const openMap = () => {
    window.location.hash = "map";
  };

  const openAccount = () => {
    window.location.hash = "account";
  };

  return (
    <div className="future-home" ref={root}>
      <HomeSectionRail activeIndex={activeIndex} />

      <HomeHeroScene
        progress={progress}
        resumeTopic={resumeTopic}
        motionTier={motionTier}
        onPrimary={openPrimary}
        onMap={openMap}
      />

      <HomeSystemStatus
        progress={progress}
        resumeTopic={resumeTopic}
      />

      <HomeCourseUniverse onOpenMap={openMap} />

      <HomeGrowthScene data={mockUserGrowth} />

      <HomeInterfaceDNA />

      <HomeSiteOverview
        onAction={(action) => {
          if (action === "map") window.location.hash = "map";
          else if (action === "academy") window.location.hash = "academy";
          else if (action === "review") window.location.hash = "review";
          else if (action === "account") window.location.hash = "account";
          else openPrimary();
        }}
      />

      <HomeMotionLab motionTier={motionTier} />

      <HomeArchiveScene />

      <HomePersonalSystem progress={progress} onAccount={openAccount} />

      <HomePortalScene
        resumeTopic={resumeTopic}
        onPrimary={openPrimary}
        onMap={openMap}
      />
    </div>
  );
}
