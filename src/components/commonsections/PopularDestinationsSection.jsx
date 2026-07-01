import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Single destination card ──────────────────────────────────────────────────
const DestinationCard = ({ pop, cardRef }) => (
  <div
    ref={cardRef}
    className="overflow-hidden w-full sm:h-80 relative rounded-2xl"
    style={{ willChange: "transform, opacity" }}
  >
    <img
      src={pop.image}
      alt={pop.title}
      className="w-full h-full object-cover rounded-2xl"
      loading="lazy"
      decoding="async"
      style={{ willChange: "transform" }}
    />

    {/* Gradient overlay for text legibility */}
    <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

    <div className="absolute z-10 bottom-6 px-4 text-zinc-200">
      <h3 className="text-lg font-semibold leading-tight">{pop.title}</h3>
      {pop.description && (
        <p className="text-sm text-zinc-300 mt-0.5">{pop.description}</p>
      )}
    </div>
  </div>
);

// ── Main section ─────────────────────────────────────────────────────────────
const PopularDestinationsSection = ({ Popular = [] }) => {
  const sectionRef  = useRef(null);
  const headingRef  = useRef(null);
  const subheadRef  = useRef(null);

  const cardRefs = useRef([]);
  cardRefs.current = useMemo(
    () =>
      Array.from(
        { length: Popular.length },
        (_, i) => cardRefs.current[i] ?? { current: null }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Popular.length]
  );

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading + subhead
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

      // Cards: staggered clip reveal (top → bottom wipe feel)
      gsap.from(cardEls, {
        clipPath: "inset(100% 0% 0% 0% round 1rem)",
        opacity: 0,
        duration: 0.75,
        ease: "power3.out",
        stagger: { amount: 0.55, from: "start" },
        scrollTrigger: {
          trigger: cardEls[0],
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });

      // Subtle image parallax on scroll — image moves slower than card
      cardEls.forEach((card) => {
        const img = card.querySelector("img");
        if (!img) return;
        gsap.to(img, {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });

      // Hover: zoom image in, lift card
      cardEls.forEach((card) => {
        const img = card.querySelector("img");

        const enter = () => {
          gsap.to(card, { y: -6, duration: 0.3, ease: "power2.out" });
          gsap.to(img,  { scale: 1.06, duration: 0.5, ease: "power2.out" });
        };
        const leave = () => {
          gsap.to(card, { y: 0, duration: 0.3, ease: "power2.inOut" });
          gsap.to(img,  { scale: 1, duration: 0.5, ease: "power2.inOut" });
        };

        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        card._gsapEnter = enter;
        card._gsapLeave = leave;
      });
    }, sectionRef);

    return () => {
      cardRefs.current.forEach(({ current: card }) => {
        if (!card) return;
        card.removeEventListener("mouseenter", card._gsapEnter);
        card.removeEventListener("mouseleave", card._gsapLeave);
      });
      ctx.revert();
    };
  }, [Popular.length]);

  return (
    <section ref={sectionRef}>
      <div className="padding-x h-max my-10">
        <div className="mb-10">
          <h1 ref={headingRef} className="text-charcoal text-4xl mb-1">
            Popular Destinations
          </h1>
          <p ref={subheadRef} className="text-base text-charcoal-100">
            Discover the most loved travel spots around the world
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Popular.map((pop, i) => (
            <DestinationCard
              key={pop.id ?? i}
              pop={pop}
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

export default PopularDestinationsSection;