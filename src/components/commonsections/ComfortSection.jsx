import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CLIP_ID = "comfortClip";

const ClipPathDef = () => (
  <svg
    width="0"
    height="0"
    style={{ position: "absolute", pointerEvents: "none" }}
    aria-hidden="true"
  >
    <defs>
      <clipPath id={CLIP_ID} clipPathUnits="objectBoundingBox">
        <path d="M 0.375 0 H 1 V 1 H 0 V 0.409 q 0 -0.136 0.125 -0.136 q 0.125 0 0.125 -0.136 M 0.375 0 q -0.125 0 -0.125 0.136 Z" />
      </clipPath>
    </defs>
  </svg>
);

const ComfortSection = ({
  imageSrc = "/images/51147.jpg",
  imageAlt = "Comfortable cabin interior",
}) => {
  const sectionRef = useRef(null);
  const imgRef     = useRef(null);
  const paraRef    = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Image: slide in from the left
      gsap.from(imgRef.current, {
        x: -80,
        opacity: 0,
        scale: 1.04,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      // Subtle parallax on the image as you scroll past
      gsap.to(imgRef.current, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // Text block: slide in from the right, stagger paragraphs
      const textEls = paraRef.current
        ? [
            paraRef.current.querySelector("h2"),
            ...paraRef.current.querySelectorAll("p"),
          ].filter(Boolean)
        : [];

      if (textEls.length) {
        gsap.from(textEls, {
          x: 60,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.14,
          scrollTrigger: {
            trigger: paraRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef}>
      <ClipPathDef />

      <div className="padding-x my-10 py-10 bg-[#f1f1f1]">
        <div className="flex gap-4 md:flex-row flex-col md:max-h-100 overflow-hidden">

          {/* ── Clipped image ─────────────────────────────────────────────── */}
          <div className="relative shrink-0">
            <div
              className="w-full md:w-2xl md:h-full overflow-hidden"
              style={{
                clipPath: `url(#${CLIP_ID})`,
                WebkitClipPath: `url(#${CLIP_ID})`,
              }}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt={imageAlt}
                className="rounded-3xl h-full w-full object-cove"
                loading="lazy"
                decoding="async"
                style={{ willChange: "transform, opacity" }}
              />
            </div>
          </div>

          {/* ── Text content ───────────────────────────────────────────────── */}
          <div ref={paraRef} className="my-auto">
            <h2 className="text-pumpkin text-xl font-semibold mb-3">
              Experience Ultimate Comfort
            </h2>
            <p className="text-sm text-charcoal-100 mb-4">
              Traveling with SkyRoute means enjoying a journey designed around
              your comfort. From spacious seating to adjustable ergonomic
              chairs, every passenger can relax and stretch out during their
              flight. Our cabins are thoughtfully arranged to provide personal
              space and a sense of calm, letting you focus on your journey
              instead of feeling cramped or rushed.
            </p>
            <p className="text-sm text-charcoal-100 mb-4">
              We understand that a comfortable flight is more than just a seat.
              That's why we provide premium amenities such as soft lighting,
              noise-reducing cabins, and easy access to refreshments. Every
              detail, from cabin temperature to onboard service, is carefully
              considered to ensure that your time in the air feels effortless
              and rejuvenating.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ComfortSection;