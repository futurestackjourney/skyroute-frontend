import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Newsletter form with controlled state ────────────────────────────────────
const NewsletterForm = ({ onSubmit }) => {
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const btnRef = useRef(null);

  const handleSubmit = async () => {
    if (!email) return;
    setStatus("loading");
    try {
      await onSubmit?.({ email, phone });
      setStatus("success");
      setEmail("");
      setPhone("");
      // Pulse the button on success
      gsap.fromTo(
        btnRef.current,
        { scale: 0.95 },
        { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" }
      );
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-md space-y-4 mt-6">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your Email Address"
        required
        className="w-full py-2 px-3 rounded-lg border border-[#d9d9d9] text-base focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Your Phone Number (Optional)"
        className="w-full py-2 px-3 rounded-lg border border-[#d9d9d9] text-base focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <button
        ref={btnRef}
        onClick={handleSubmit}
        disabled={status === "loading" || status === "success"}
        className="w-full bg-pumpkin-100 hover:bg-pumpkin transition text-white py-2.5 rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Subscribing…" : status === "success" ? "✓ Subscribed!" : "Subscribe Now"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-500 text-center">Something went wrong. Please try again.</p>
      )}
    </div>
  );
};

// ── Main section ─────────────────────────────────────────────────────────────
const NewsletterSection = ({
  imageSrc = "/images/Wavy_Bus-38_Single-01.jpg",
  onSubscribe,
}) => {
  const sectionRef  = useRef(null);
  const headerRef   = useRef(null);
  const subheadRef  = useRef(null);
  const boxRef      = useRef(null);
  const imgRef      = useRef(null);
  const contentRef  = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header stagger
      gsap.from([headerRef.current, subheadRef.current], {
        y: 36,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // White box rises up
      gsap.from(boxRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: boxRef.current,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });

      // Image slides in from left inside the box
      gsap.from(imgRef.current, {
        x: -50,
        opacity: 0,
        scale: 1.05,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: boxRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // Content slides in from right, children staggered
      const contentChildren = contentRef.current
        ? Array.from(contentRef.current.children)
        : [];

      if (contentChildren.length) {
        gsap.from(contentChildren, {
          x: 40,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: boxRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }

      // Subtle image parallax while scrolling past
      gsap.to(imgRef.current, {
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef}>
      <div className="padding-x py-6 sm:py-12 bg-[#f1f1f1]">

        {/* Section header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 ref={headerRef} className="text-4xl font-semibold text-charcoal">
            Stay Updated &amp; Save!
          </h1>
          <p ref={subheadRef} className="mt-3 text-lg text-charcoal-100">
            Unlock exclusive deals, travel tips, and early access to special
            offers. Be the first to know about discounted flights and premium
            packages.
          </p>
        </div>

        {/* Main card */}
        <div
          ref={boxRef}
          className="rounded-2xl bg-white py-6 px-6 shadow-sm"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[35%_65%] gap-6">

            {/* Image */}
            <div className="h-full w-full overflow-hidden rounded-xl">
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Travel Newsletter"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                style={{ willChange: "transform, opacity" }}
              />
            </div>

            {/* Content */}
            <div
              ref={contentRef}
              className="flex justify-center items-center flex-col"
            >
              <h2 className="text-charcoal text-3xl font-medium">
                Subscribe to Our Newsletter
              </h2>

              <p className="mt-2 text-charcoal-100 text-base max-w-md">
                Join thousands of travelers who receive weekly updates on the
                best flight deals, hotel discounts, and exclusive promotions.
              </p>

              <NewsletterForm onSubmit={onSubscribe} />

              <p className="mt-3 text-xs text-charcoal-100">
                By subscribing you agree to our{" "}
                <span className="underline cursor-pointer">Privacy Policy</span>{" "}
                and{" "}
                <span className="underline cursor-pointer">Terms of Service</span>.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default NewsletterSection;