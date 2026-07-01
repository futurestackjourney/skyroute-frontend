import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Gear SVG extracted once — not re-created per card ───────────────────────
const GearSVG = () => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    aria-hidden="true"
  >
    <path
      stroke="#f2f2f2"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13.905 3.379A.5.5 0 0114.39 3h3.22a.5.5 0 01.485.379l.689 2.757a.515.515 0 00.341.362c.383.126.755.274 1.115.443a.515.515 0 00.449-.003l2.767-1.383a.5.5 0 01.577.093l2.319 2.319a.5.5 0 01.093.577l-1.383 2.767a.515.515 0 00-.003.449c.127.271.243.549.346.833.053.148.17.265.319.315l2.934.978a.5.5 0 01.342.474v3.28a.5.5 0 01-.342.474l-2.934.978a.515.515 0 00-.32.315 9.937 9.937 0 01-.345.833.515.515 0 00.003.449l1.383 2.767a.5.5 0 01-.093.577l-2.319 2.319a.5.5 0 01-.577.093l-2.767-1.383a.515.515 0 00-.449-.003c-.271.127-.549.243-.833.346a.515.515 0 00-.315.319l-.978 2.934a.5.5 0 01-.474.342h-3.28a.5.5 0 01-.474-.342l-.978-2.934a.515.515 0 00-.315-.32 9.95 9.95 0 01-1.101-.475.515.515 0 00-.498.014l-2.437 1.463a.5.5 0 01-.611-.075l-2.277-2.277a.5.5 0 01-.075-.61l1.463-2.438a.515.515 0 00.014-.498 9.938 9.938 0 01-.573-1.383.515.515 0 00-.362-.341l-2.757-.69A.5.5 0 013 17.61v-3.22a.5.5 0 01.379-.485l2.757-.689a.515.515 0 00.362-.341c.157-.478.35-.94.573-1.383a.515.515 0 00-.014-.498L5.594 8.557a.5.5 0 01.075-.611l2.277-2.277a.5.5 0 01.61-.075l2.438 1.463c.152.091.34.094.498.014a9.938 9.938 0 011.382-.573.515.515 0 00.342-.362l.69-2.757z"
    />
    <circle
      cx="16"
      cy="16"
      r="5"
      stroke="#535358"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

// ── Single work card ─────────────────────────────────────────────────────────
const WorkCard = ({ work, cardRef }) => (
  <div
    ref={cardRef}
    className="flex flex-col items-center justify-center text-center py-6 px-8 rounded-xl shadow-lg relative"
    style={{ willChange: "transform, opacity" }}
  >
    {/* Connector arrow — hidden on non-lg */}
    {work.icon2 && (
      <div className="absolute top-20 -right-10 w-20 hidden lg:block" aria-hidden="true">
        <img src={work.icon2} alt="" loading="lazy" decoding="async" />
      </div>
    )}

    {/* Icon badge over gear */}
    <div className="relative mb-2">
      <div className="w-30 p-6 rounded-full absolute top-7 left-8 text-pumpkin bg-[#f7f9fb] z-10">
        <img src={work.icon1} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="size-45">
        <GearSVG />
      </div>
    </div>

    {/* Text content */}
    <div>
      <div className="flex items-center justify-center gap-2 text-center mb-2">
        <span className="text-pumpkin text-6xl font-bold">{work.count}</span>
        <h3 className="text-charcoal text-2xl font-bold tracking-wide">
          {work.title}
        </h3>
      </div>
      <p className="text-charcoal-100 text-base">{work.desc}</p>
    </div>
  </div>
);

// ── Main section ─────────────────────────────────────────────────────────────
const HowItWorksSection = ({ works = [] }) => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subheadRef = useRef(null);

  const cardRefs = useRef([]);
  cardRefs.current = useMemo(
    () =>
      Array.from(
        { length: works.length },
        (_, i) => cardRefs.current[i] ?? { current: null }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [works.length]
  );

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading slides up
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

      if (cardEls.length) {
        // Cards fan in with a slight Y + scale
        gsap.from(cardEls, {
          y: 50,
          opacity: 0,
          scale: 0.94,
          duration: 0.65,
          ease: "power2.out",
          stagger: { amount: 0.45, from: "start" },
          scrollTrigger: {
            trigger: cardEls[0],
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });

        // Spin the gear SVG inside each card once on entry
        cardEls.forEach((card) => {
          const gear = card.querySelector("svg");
          if (!gear) return;
          gsap.from(gear, {
            rotate: -120,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            transformOrigin: "50% 50%",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
        });

        // Count number ticker animation
        cardEls.forEach((card, i) => {
          const countEl = card.querySelector("[data-count]");
          if (!countEl) return;
          const target = works[i]?.countValue ?? parseInt(works[i]?.count, 10);
          if (isNaN(target)) return;

          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.2,
            ease: "power1.out",
            snap: { val: 1 },
            onUpdate: () => {
              countEl.textContent = obj.val;
            },
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [works]);

  return (
    <section ref={sectionRef}>
      <div className="padding-x py-4 sm:py-10">
        <div className="text-center mb-10">
          <h1 ref={headingRef} className="text-charcoal text-4xl text-center uppercase">
            How it Works
          </h1>
          <p ref={subheadRef} className="text-xl text-charcoal-100">
            Your journey starts with these simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {works.map((work, i) => (
            <WorkCard
              key={work.id ?? i}
              work={work}
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

export default HowItWorksSection;