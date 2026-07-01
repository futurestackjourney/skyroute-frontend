import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useStaggerReveal = (options = {}) => {
  const refs = useRef([]);

  const addToRefs = (el) => {
    if (el && !refs.current.includes(el)) {
      refs.current.push(el);
    }
  };

  useGSAP(() => {
    if (!refs.current.length) return;

    // ✅ Set initial state (important)
    gsap.set(refs.current, {
      autoAlpha: 0,
      y: options.y || 50,
    });

    gsap.to(refs.current, {
      autoAlpha: 1,
      y: 0,
      duration: options.duration || 1,
      stagger: options.stagger || 0.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: refs.current[0].parentElement, // ✅ better trigger
        start: options.start || "top 85%",
        once: options.once ?? true,
      },
    });
  });

  return addToRefs;
};