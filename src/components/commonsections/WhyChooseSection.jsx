import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Single feature card ──────────────────────────────────────────────────────
const FeatureCard = ({ feature, cardRef }) => {
  const Icon1 = feature.icon1;
  const Icon2 = feature.icon2;

  return (
    <div
      ref={cardRef}
      className="p-4 rounded-xl shadow-lg"
      style={{ willChange: "transform, opacity" }}
    >
      <div className="flex items-center gap-2 text-pumpkin">
        <div className="bg-charcoal/10 p-2 rounded-full">
          <Icon1 className="size-6 sm:size-10" />
        </div>
        <Icon2 className="size-6 sm:size-10" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-charcoal mt-4 mb-2">
          {feature.title}
        </h3>
        {feature.para1 && (
          <p className="text-sm text-charcoal-100">{feature.para1}</p>
        )}
        {feature.para2 && (
          <p className="text-sm text-charcoal-100">{feature.para2}</p>
        )}
      </div>
    </div>
  );
};

// ── Main section ─────────────────────────────────────────────────────────────
const WhyChooseSection = ({ features = [] }) => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subheadRef = useRef(null);

  const cardRefs = useRef([]);
  cardRefs.current = useMemo(
    () =>
      Array.from(
        { length: features.length },
        (_, i) => cardRefs.current[i] ?? { current: null }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [features.length]
  );

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading + subhead slide up
      gsap.from([headingRef.current, subheadRef.current], {
        y: 36,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      const cardEls = cardRefs.current.map((r) => r.current).filter(Boolean);
      if (!cardEls.length) return;

      // Cards: staggered fade + rise
      gsap.from(cardEls, {
        y: 48,
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.out",
        stagger: { amount: 0.5, from: "start" },
        scrollTrigger: {
          trigger: cardEls[0],
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });

      // Icon bounce on entry — targets first icon inside each card
      cardEls.forEach((card) => {
        const icon = card.querySelector(".text-pumpkin");
        if (!icon) return;
        gsap.from(icon, {
          scale: 0.4,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      });

      // Hover: lift & shadow via GSAP (no extra CSS needed)
      cardEls.forEach((card) => {
        const enter = () =>
          gsap.to(card, { y: -6, scale: 1.02, duration: 0.25, ease: "power2.out" });
        const leave = () =>
          gsap.to(card, { y: 0, scale: 1, duration: 0.25, ease: "power2.inOut" });

        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);

        // store for cleanup
        card._gsapEnter = enter;
        card._gsapLeave = leave;
      });
    }, sectionRef);

    return () => {
      // Clean up hover listeners before reverting context
      cardRefs.current.forEach(({ current: card }) => {
        if (!card) return;
        card.removeEventListener("mouseenter", card._gsapEnter);
        card.removeEventListener("mouseleave", card._gsapLeave);
      });
      ctx.revert();
    };
  }, [features.length]);

  return (
    <section ref={sectionRef}>
      <div className="padding-x py-4 sm:py-10">
        <div className="mb-10">
          <h1
            ref={headingRef}
            className="text-charcoal text-4xl mb-1 tracking-wide"
          >
            Why Choose SkyRoute
          </h1>
          <p ref={subheadRef} className="text-base text-charcoal-100">
            Experience comfort, reliability, and convenience on every journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.id ?? i}
              feature={feature}
              cardRef={(el) => {
                if (!cardRefs.current[i]) cardRefs.current[i] = { current: null };
                cardRefs.current[i].current = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;