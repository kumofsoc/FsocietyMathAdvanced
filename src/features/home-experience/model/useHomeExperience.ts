import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject, useLayoutEffect, useState } from "react";
import {
  getHomeMotionMode,
  shouldUsePointerDepth,
  type HomeMotionEnvironment,
  type HomeMotionTier,
} from "./homeExperience";

gsap.registerPlugin(ScrollTrigger);

function readEnvironment(): HomeMotionEnvironment {
  const profile = (document.documentElement.dataset.motionProfile || "balanced") as HomeMotionEnvironment["profile"];
  return {
    profile,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    mobile: window.matchMedia("(max-width: 820px)").matches,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
  };
}

export function useHomeExperience(root: RefObject<HTMLDivElement | null>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [motionTier, setMotionTier] = useState<HomeMotionTier>(() =>
    typeof window === "undefined" ? "static" : getHomeMotionMode(readEnvironment()),
  );
  const [motionEpoch, setMotionEpoch] = useState(0);

  useLayoutEffect(() => {
    const onMotionChange = () => setMotionEpoch((value) => value + 1);
    window.addEventListener("fsociety-motion-change", onMotionChange);
    return () => window.removeEventListener("fsociety-motion-change", onMotionChange);
  }, []);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;

    const env = readEnvironment();
    const tier = getHomeMotionMode(env);
    setMotionTier(tier);
    element.dataset.motionTier = tier;

    const panels = gsap.utils.toArray<HTMLElement>("[data-home-scene]", element);
    const ctx = gsap.context(() => {
      panels.forEach((panel, index) => {
        ScrollTrigger.create({
          trigger: panel,
          start: "top 58%",
          end: "bottom 42%",
          onEnter: () => setActiveIndex(index),
          onEnterBack: () => setActiveIndex(index),
        });

        const reveal = panel.querySelectorAll<HTMLElement>("[data-reveal]");
        if (reveal.length && tier !== "static") {
          gsap.fromTo(
            reveal,
            { y: tier === "cinematic" ? 64 : 28, filter: tier === "cinematic" ? "blur(7px)" : "blur(0px)" },
            {
              y: 0,
              filter: "blur(0px)",
              duration: tier === "cinematic" ? 1.05 : 0.6,
              stagger: tier === "cinematic" ? 0.075 : 0.035,
              ease: "power3.out",
              scrollTrigger: {
                trigger: panel,
                start: "top 82%",
                once: true,
              },
            },
          );
        }

        const parallax = panel.querySelectorAll<HTMLElement>("[data-parallax]");
        if (parallax.length && tier === "cinematic") {
          gsap.to(parallax, {
            yPercent: index % 2 ? -9 : 9,
            rotate: index % 2 ? 1.3 : -1.3,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.75,
            },
          });
        }
      });

      if (tier !== "static") {
        gsap.utils.toArray<HTMLElement>("[data-ambient='drift']", element).forEach((node, index) => {
          gsap.to(node, {
            y: index % 2 ? -12 : 12,
            x: index % 3 ? 7 : -7,
            rotate: index % 2 ? 1.8 : -1.8,
            duration: 4.2 + (index % 4) * 0.7,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-ambient='orbit']", element).forEach((node, index) => {
          gsap.to(node, {
            rotate: index % 2 ? 360 : -360,
            duration: tier === "cinematic" ? 22 + index * 4 : 38 + index * 5,
            repeat: -1,
            ease: "none",
            transformOrigin: "50% 50%",
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-ambient='pulse']", element).forEach((node) => {
          gsap.to(node, {
            scale: 1.06,
            opacity: 0.68,
            duration: tier === "cinematic" ? 2.6 : 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-ambient='ticker']", element).forEach((node) => {
          gsap.to(node, {
            xPercent: -50,
            duration: tier === "cinematic" ? 30 : 52,
            repeat: -1,
            ease: "none",
          });
        });
      }

      if (!env.mobile && panels.length > 1 && tier !== "static") {
        ScrollTrigger.create({
          trigger: element,
          start: "top top",
          end: "bottom bottom",
          snap: {
            snapTo: (progressValue, self) => {
              const maxScroll = Math.max(1, element.scrollHeight - window.innerHeight);
              const points = panels.map((panel) =>
                Math.min(1, Math.max(0, panel.offsetTop / maxScroll)),
              );
              return ScrollTrigger.snapDirectional(points)(progressValue, self?.direction ?? 1);
            },
            duration: { min: 0.18, max: 0.42 },
            delay: 0.035,
            ease: "power2.out",
            inertia: false,
          },
        });
      }
    }, element);

    let pointerFrame = 0;
    const usePointer = shouldUsePointerDepth(env);
    const onPointerMove = (event: PointerEvent) => {
      if (!usePointer) return;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const x = event.clientX / Math.max(1, window.innerWidth);
        const y = event.clientY / Math.max(1, window.innerHeight);
        element.style.setProperty("--future-mx", event.clientX + "px");
        element.style.setProperty("--future-my", event.clientY + "px");
        element.style.setProperty("--future-rx", ((y - 0.5) * -5).toFixed(2) + "deg");
        element.style.setProperty("--future-ry", ((x - 0.5) * 7).toFixed(2) + "deg");
      });
    };
    if (usePointer) window.addEventListener("pointermove", onPointerMove, { passive: true });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(pointerFrame);
      window.removeEventListener("pointermove", onPointerMove);
      ctx.revert();
      element.style.removeProperty("--future-mx");
      element.style.removeProperty("--future-my");
      element.style.removeProperty("--future-rx");
      element.style.removeProperty("--future-ry");
    };
  }, [root, motionEpoch]);

  return { activeIndex, motionTier };
}
