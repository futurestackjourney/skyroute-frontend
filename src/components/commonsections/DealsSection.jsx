import { useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// SVG clip path defined ONCE outside the component — not re-rendered per card
const CLIP_PATH_ID = "dealCardClip";

const ClipPathDef = () => (
  <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
    <defs>
      <clipPath id={CLIP_PATH_ID} clipPathUnits="objectBoundingBox">
        <path d="M 0 0 V 1 H 0.676 Q 0.784 1 0.784 0.833 Q 0.784 0.667 0.892 0.667 Q 1 0.667 1 0.5 V 0 H 0 Z" />
      </clipPath>
    </defs>
  </svg>
);

const DealCard = ({ deal, cardRef }) => (
  <div
    ref={cardRef}
    className="rounded-xl flex gap-4 md:flex-row md:max-h-100"
    style={{ willChange: "transform, opacity" }}
  >
    <div
      className="w-full md:w-2xl md:h-full overflow-hidden"
      style={{
        clipPath: `url(#${CLIP_PATH_ID})`,
        WebkitClipPath: `url(#${CLIP_PATH_ID})`,
      }}
    >
      <img
        loading="lazy"
        src={deal.image}
        className="rounded-3xl h-full w-full "
        alt={deal.title}
        decoding="async"
      />
    </div>

    <div>
      <h2 className="text-xl sm:text-3xl text-charcoal">{deal.title}</h2>
      <p className="text-base text-charcoal-100">{deal.desc}</p>
      <h4 className="text-2xl text-black line-through decoration-red-600">
        {deal.price}
      </h4>
      <button className="deal-book-btn">Book Now</button>
    </div>
  </div>
);

const DealsSection = ({ deals = [] }) => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subheadRef = useRef(null);
  const viewAllRef = useRef(null);
  // One ref per card
  const cardRefs = useRef([]);

  // Keep cardRefs array sized correctly without mutating on each render
  cardRefs.current = useMemo(
    () => Array.from({ length: deals.length }, (_, i) => cardRefs.current[i] ?? { current: null }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deals.length]
  );

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ── Heading: fade + slide up on scroll ──────────────────────────────
      gsap.from([headingRef.current, subheadRef.current], {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // ── Cards: staggered reveal ──────────────────────────────────────────
      const cardEls = cardRefs.current
        .map((r) => r.current)
        .filter(Boolean);

      if (cardEls.length) {
        gsap.from(cardEls, {
          y: 60,
          opacity: 0,
          duration: 0.65,
          ease: "power2.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: cardEls[0],
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });

        // ── Image parallax on scroll (subtle depth) ──────────────────────
        cardEls.forEach((card) => {
          const img = card.querySelector("img");
          if (!img) return;
          gsap.to(img, {
            yPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        });
      }

      // ── "View All" button: fade in last ─────────────────────────────────
      gsap.from(viewAllRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: viewAllRef.current,
          start: "top 95%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert(); // Cleans up all ScrollTriggers & tweens
  }, [deals.length]);

  return (
    <section ref={sectionRef}>
      {/* Single shared SVG clip-path — rendered once */}
      <ClipPathDef />

      <div className="padding-x py-4 sm:py-10 bg-creame">
        <div className="mb-10">
          <h1 ref={headingRef} className="text-4xl text-charcoal">
            Deals &amp; Offers
          </h1>
          <p ref={subheadRef} className="text-lg text-charcoal-100">
            Unlock Exclusive Savings &amp; Limited-Time Deals!
          </p>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-2 space-y-2 sm:space-y-8">
          {deals.map((deal, i) => (
            <DealCard
              key={deal.id ?? i}
              deal={deal}
              cardRef={(el) => {
                if (!cardRefs.current[i]) cardRefs.current[i] = { current: null };
                cardRefs.current[i].current = el;
              }}
            />
          ))}
        </div>

        <div ref={viewAllRef} className="flex justify-center mt-8">
          <Link
            to="/deals"
            className="py-3 px-6 border-2 border-charcoal text-charcoal rounded-2xl hover:text-creame hover:bg-charcoal transition-colors"
          >
            View All Deals
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DealsSection;