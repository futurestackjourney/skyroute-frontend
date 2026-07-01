import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ── Clip path rendered once, outside the grid ───────────────────────────────
const CLIP_ID = "testimonialClip";

const ClipPathDef = () => (
  <svg
    width="0"
    height="0"
    style={{ position: "absolute", pointerEvents: "none" }}
    aria-hidden="true"
  >
    <defs>
      <clipPath id={CLIP_ID} clipPathUnits="objectBoundingBox">
        <path d="M 0.719 0 H 0 V 1 H 1 V 0.375 Q 1 0.25 0.906 0.25 Q 0.813 0.25 0.813 0.125 Q 0.813 0 0.719 0 Z" />
      </clipPath>
    </defs>
  </svg>
);

// ── Star rating — memoised, no array allocation on every render ──────────────
const StarRating = ({ rating }) =>
  Array.from({ length: rating }, (_, i) => (
    <Star key={i} className="size-4 text-amber-400 fill-amber-400" />
  ));

// ── Single review card ───────────────────────────────────────────────────────
const ReviewCard = ({ review, cardRef }) => (
  <div
    ref={cardRef}
    className="py-4 px-6 text-center rounded-2xl flex justify-center items-center flex-col
               bg-[url(https://media.istockphoto.com/id/1309531348/vector/white-hexagon-5.jpg?s=612x612&w=0&k=20&c=yfDPUlZQJlu4L_dy0lVMD0x7mpEe6jgp2EsdKstRY_k=)]
               bg-cover bg-no-repeat bg-center"
    style={{
      clipPath: `url(#${CLIP_ID})`,
      WebkitClipPath: `url(#${CLIP_ID})`,
      willChange: "transform, opacity",
    }}
  >
    <div className="w-18 h-18 rounded-full overflow-hidden">
      <img
        className="w-full"
        src={review.image}
        alt={review.name}
        loading="lazy"
        decoding="async"
      />
    </div>

    <h3 className="text-sm mt-2 text-charcoal-100">— {review.name}</h3>

    <div>
      <div className="flex gap-1 justify-center items-center mt-4">
        <StarRating rating={review.rating} />
      </div>
      <h3 className="text-charcoal text-lg md:text-xl">{review.title}</h3>
      <p className="text-charcoal-100 text-sm 2xl:text-base">{review.desc}</p>
    </div>
  </div>
);

// ── Main section ─────────────────────────────────────────────────────────────
const TestimonialsSection = ({ testimonials = [], onReadMore }) => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subheadRef = useRef(null);
  const btnRef = useRef(null);

  // Stable array of refs, sized to match data
  const cardRefs = useRef([]);
  cardRefs.current = useMemo(
    () =>
      Array.from(
        { length: testimonials.length },
        (_, i) => cardRefs.current[i] ?? { current: null }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [testimonials.length]
  );

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading stagger
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

      // Cards: staggered fan-in from below
      const cardEls = cardRefs.current.map((r) => r.current).filter(Boolean);

      if (cardEls.length) {
        gsap.from(cardEls, {
          y: 50,
          opacity: 0,
          scale: 0.96,
          duration: 0.6,
          ease: "power2.out",
          stagger: {
            amount: 0.5,      // total stagger spread across all cards
            from: "start",
          },
          scrollTrigger: {
            trigger: cardEls[0],
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      }

      // CTA button
      gsap.from(btnRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: btnRef.current,
          start: "top 95%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [testimonials.length]);

  return (
    <section ref={sectionRef}>
      {/* Single shared clip-path */}
      <ClipPathDef />

      <div className="padding-x py-4 sm:py-10">
        <div className="mb-10 text-center">
          <h1 ref={headingRef} className="text-4xl text-charcoal">
            Testimonials &amp; Reviews
          </h1>
          <p ref={subheadRef} className="text-lg text-charcoal-100">
            Hear From Our Happy Customers!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((review, i) => (
            <ReviewCard
              key={review.id ?? i}
              review={review}
              cardRef={(el) => {
                if (!cardRefs.current[i]) cardRefs.current[i] = { current: null };
                cardRefs.current[i].current = el;
              }}
            />
          ))}
        </div>

        <div ref={btnRef} className="flex justify-center mt-8">
          <button
            onClick={onReadMore}
            className="py-3 px-6 border-2 border-charcoal text-charcoal rounded-2xl hover:text-creame hover:bg-charcoal transition-colors"
          >
            Read More Reviews
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;