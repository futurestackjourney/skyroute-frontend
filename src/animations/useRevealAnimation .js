import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useRevealAnimation = (ref, options = {}) => {
  useGSAP(() => {
    if (!ref.current) return;

    // 🎯 Direction logic
    let fromVars = { autoAlpha: 0 };

    switch (options.direction) {
      case "top":
        fromVars.y = -50;
        break;
      case "bottom":
        fromVars.y = 50;
        break;
      case "left":
        fromVars.x = -50;
        break;
      case "right":
        fromVars.x = 50;
        break;
      case "scale":
        fromVars.scale = 0.8;
        break;
      default:
        fromVars.y = 50; // default = bottom
    }

    gsap.fromTo(
      ref.current,
      fromVars,
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: options.duration || 1,
        ease: options.ease || "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: options.start || "top 80%",
          toggleActions: "play none none reverse",
          once: options.once ?? true,
        },
      }
    );
  }, { scope: ref });
};