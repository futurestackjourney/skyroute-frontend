import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";

/* ─────────────────────────── DATA ─────────────────────────── */
const quickLinks = [
  { icon: "🔄", label: "Change Flight" },
  { icon: "💸", label: "Request Refund" },
  { icon: "🧳", label: "Lost Baggage" },
  { icon: "📄", label: "Get Invoice" },
  { icon: "🔑", label: "Manage Booking" },
  { icon: "✈️", label: "Flight Status" },
];

const topics = [
  { icon: "🎫", title: "Bookings & Reservations", desc: "Modify dates, upgrade seats, add extras, or cancel a reservation with step-by-step guidance.", articles: "24 articles" },
  { icon: "💳", title: "Payments & Refunds", desc: "Understand our refund policy, dispute a charge, or track the status of your reimbursement.", articles: "18 articles" },
  { icon: "🧳", title: "Baggage & Check-in", desc: "Allowances, excess fees, special items, and online check-in walkthroughs for every airline.", articles: "31 articles" },
  { icon: "✈️", title: "Flight Disruptions", desc: "Delays, cancellations, diversions — know your rights and how SkyRoute advocates for you.", articles: "12 articles" },
  { icon: "👤", title: "Account & Profile", desc: "Update your details, manage saved cards, loyalty programs, and security settings.", articles: "9 articles" },
  { icon: "🌍", title: "Travel Requirements", desc: "Visa policies, passport rules, health documentation, and destination-specific entry rules.", articles: "41 articles" },
];

const faqCategories = ["All", "Bookings", "Refunds", "Baggage", "Account"];

const faqs = {
  All: [
    { q: "How do I change my flight date or destination?", a: "Log in to My Bookings, select your trip, and click 'Modify Flight'. Date changes are free within 24 hours of booking. Destination changes may incur a fare difference. Changes beyond 24 hours are subject to airline policies." },
    { q: "When will my refund appear in my account?", a: "Refunds to credit/debit cards typically take 5–10 business days. Bank transfers can take up to 14 days. Once processed on our end, you'll receive a confirmation email with the transaction reference." },
    { q: "What's included in my baggage allowance?", a: "Baggage allowance depends on your fare class and airline. Economy usually includes one cabin bag (7–10 kg). Checked luggage varies from 20–30 kg. You can view your allowance in your booking confirmation or under 'My Trips'." },
    { q: "Can I transfer my ticket to someone else?", a: "Most airline tickets are non-transferable. However, some carriers allow name changes for a fee. Contact our support team and we'll check the rules for your specific booking." },
    { q: "How do I add special meal preferences?", a: "Go to 'Manage Booking', select your flight, and choose 'Special Services'. Meal preferences must be added at least 48 hours before departure. Options include vegetarian, vegan, halal, kosher, and more." },
  ],
  Bookings: [
    { q: "How do I change my flight date or destination?", a: "Log in to My Bookings, select your trip, and click 'Modify Flight'. Date changes are free within 24 hours of booking." },
    { q: "Can I hold a fare without paying immediately?", a: "Yes! SkyRoute FareHold lets you lock in a price for up to 48 hours for a small fee. Available on select routes and airlines." },
    { q: "How do I add special meal preferences?", a: "Go to 'Manage Booking', select your flight, and choose 'Special Services'. Meal preferences must be added at least 48 hours before departure." },
  ],
  Refunds: [
    { q: "When will my refund appear in my account?", a: "Refunds to credit/debit cards typically take 5–10 business days. Bank transfers can take up to 14 days." },
    { q: "My flight was cancelled. Am I entitled to a full refund?", a: "Yes. If the airline cancels your flight, you're entitled to a full refund under IATA guidelines. SkyRoute will process this automatically within 3–5 business days." },
  ],
  Baggage: [
    { q: "What's included in my baggage allowance?", a: "Economy usually includes one cabin bag (7–10 kg). Checked luggage varies from 20–30 kg. View your allowance in your booking confirmation." },
    { q: "What happens if my luggage is lost?", a: "Report it immediately at the airline's baggage desk before leaving the airport. Get a PIR reference number, then file a claim with us within 21 days. We'll liaise directly with the airline." },
  ],
  Account: [
    { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page. A secure reset link will be emailed to you and expires in 30 minutes. If you don't receive it, check your spam folder." },
    { q: "Can I transfer my ticket to someone else?", a: "Most airline tickets are non-transferable. Some carriers allow name changes for a fee. Contact support and we'll check rules for your specific booking." },
  ],
};

const initialMessages = [
  { from: "agent", text: "Hi there! 👋 I'm Maya from SkyRoute Support. How can I help you today?", time: "Just now" },
  { from: "agent", text: "I can help with bookings, refunds, flight changes, baggage — or anything else travel-related!", time: "Just now" },
];

const botReplies = [
  "Great question! Let me pull that up for you right away. Can you share your booking reference?",
  "I understand your concern. Our team will look into this within the next few minutes.",
  "Thanks for that detail! It looks like your booking is confirmed and on schedule. ✈️",
  "I've flagged this for our specialist team. You'll get a follow-up email within 2 hours.",
  "Absolutely! You can also track this anytime under 'My Trips' in your account.",
];

const statusItems = [
  { icon: "🔍", name: "Search Engine", state: "Operational" },
  { icon: "💳", name: "Payment Gateway", state: "Operational" },
  { icon: "📧", name: "Email Notifications", state: "Operational" },
  { icon: "📱", name: "Mobile App", state: "Operational" },
];

/* ── Injected keyframe styles (minimal — only what Tailwind can't do) ── */
const globalStyles = `
  .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
  .reveal.visible { opacity: 1; transform: none; }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
  .reveal-delay-4 { transition-delay: 0.4s; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  .dot-pulse { animation: pulse 2s infinite; }
  @keyframes typingBounce { 0%,60%,100% { transform:translateY(0); } 30% { transform:translateY(-6px); } }
  .typing-dot { width:7px; height:7px; border-radius:50%; background:var(--color-charcoal-100); animation: typingBounce 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay:0.2s; }
  .typing-dot:nth-child(3) { animation-delay:0.4s; }
  .faq-answer { max-height:0; overflow:hidden; transition: max-height 0.4s ease, padding 0.3s ease; padding: 0 1.5rem; }
  .faq-answer.open { max-height:400px; padding: 0 1.5rem 1.25rem; }
  .faq-chevron-icon { transition: transform 0.3s, background 0.2s; }
  .faq-chevron-icon.open { transform: rotate(180deg); background: var(--color-pumpkin) !important; color: #fff; }
  .contact-arrow { transition: transform 0.2s; }
  .contact-card-wrap:hover .contact-arrow { transform: translateX(3px); }
`;

/* ─────────────────────────── COMPONENT ─────────────────────────── */
export default function SupportPage() {
  const [searchVal, setSearchVal] = useState("");
  const [activeFaqCat, setActiveFaqCat] = useState("All");
  const [openFaq, setOpenFaq] = useState(null);
  const [messages, setMessages] = useState(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  /* scroll reveal */
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* auto-scroll chat */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { from: "user", text, time: now }]);
    setChatInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
      setMessages(prev => [...prev, { from: "agent", text: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1800);
  };

  const currentFaqs = faqs[activeFaqCat] || faqs["All"];

  return (
    <>
      <style>{globalStyles}</style>

      {/* ── HERO ── */}
      <section className="relative min-h-[52vh] flex flex-col items-center justify-center text-center px-12 pt-32 pb-16 bg-card overflow-hidden">
        {/* Rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[280, 480, 700, 960].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-yellow-200 animateping"
              style={{ width: size, height: size }}
            />
          ))}
        </div>
        {/* Glow */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 500, height: 300, background: "oklch(73% 0.17 49 / 0.18)", filter: "blur(80px)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
        />

        {/* Eyebrow */}
        <div className="relative inline-flex items-center gap-2 bg-white/80 border border-black/12 text-charcoal-100 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
          <img src="/icons/help-svgrepo-com.svg" width="20" height="20" alt="" />
           Support Centre
        </div>

        {/* Title */}
        <h1
          className="relative font-black text-creame leading-[1.05] tracking-wide mb-5 text-5xl "
        >
          We're Here for <em className="italic text-pumpkin">Every</em><br />
          Step of Your Journey
        </h1>
        <p className="relative text-[1.05rem] text-charcoal-100 max-w-120 leading-relaxed mb-10">
          Search our help centre, chat with a specialist, or browse guides — real help, not runarounds.
        </p>

        {/* Search */}
        <div className="relative w-full max-w-145">
          <span className="absolute left-[1.1rem] top-1/2 -translate-y-1/2 text-charcoal-100 pointer-events-none text-lg"><Search /></span>
          <input
            className="search-input w-full border-[1.5px] border-black/9 rounded-full px-12 py-4 text-sm text-charcoal outline-none focus:border-pumpkin transition-colors duration-200"
            placeholder="e.g. change my flight, refund status, baggage rules…"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setSearchVal("")}
          />
          <button
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-pumpkin hover:bg-pumpkin-50 text-white border-none cursor-pointer rounded-full px-5 py-2.5 font-[DM_Sans,sans-serif] text-sm font-semibold transition-colors duration-200"
          >
            Search
          </button>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <div className="bg-pumpkin/20 px-12 py-10 flex justify-center gap-4 flex-wrap">
        {quickLinks.map((q, i) => (
          <button
            key={i}
            className="flex items-center gap-2 bg-white border-[1.5px] border-black/[0.07] rounded-full px-5 py-2.5 cursor-pointer text-sm font-medium text-[var(--color-charcoal)] whitespace-nowrap transition-all duration-150 hover:border-[var(--color-pumpkin)] hover:text-[var(--color-pumpkin)] hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="text-base">{q.icon}</span>
            {q.label}
          </button>
        ))}
      </div>

      {/* ── TOPICS ── */}
      <section className="py-20 px-12 bg-surface">
        <div className="max-w-275 mx-auto">
          <div className="reveal">
            <span className="block text-xs font-semibold tracking-widest uppercase text-[var(--color-pumpkin)] mb-3">
              Help Topics
            </span>
            <h2 className="font-black leading-[1.15] tracking-tight text-[var(--color-charcoal)]" style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", letterSpacing: "-0.02em" }}>
              Browse by Category
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {topics.map((t, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${(i % 3) + 1} bg-white rounded-[20px] p-8 border-[1.5px] border-black/[0.06] flex flex-col gap-2.5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-pumpkin-100)]`}
              >
                <div className="w-13 h-13 rounded-[14px] bg-[var(--color-card)] flex items-center justify-center text-[1.6rem] mb-1 w-[52px] h-[52px] transition-colors duration-200 hover:bg-orange-100">
                  {t.icon}
                </div>
                <div className="font-bold text-[1.05rem] text-[var(--color-charcoal)]" style={{ fontFamily: "'Playfair Display',serif" }}>
                  {t.title}
                </div>
                <p className="text-[0.85rem] text-[var(--color-charcoal-100)] leading-relaxed">{t.desc}</p>
                <div className="text-[0.78rem] text-[var(--color-pumpkin)] font-semibold mt-auto">→ {t.articles}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-12 bg-[var(--color-card)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="reveal">
            <span className="block text-xs font-semibold tracking-widest uppercase text-[var(--color-pumpkin)] mb-3">
              FAQ
            </span>
            <h2 className="font-black leading-[1.15] tracking-tight text-[var(--color-charcoal)]" style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", letterSpacing: "-0.02em" }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-20 items-start mt-10">
            {/* Sidebar */}
            <div className="reveal reveal-delay-1 lg:sticky lg:top-20">
              <div className="font-black text-[var(--color-charcoal)] leading-[1.2] mb-4 text-[1.8rem]" style={{ fontFamily: "'Playfair Display',serif" }}>
                Find your answer fast.
              </div>
              <p className="text-[0.9rem] text-[var(--color-charcoal-100)] leading-relaxed mb-6">
                Filter by topic or scroll through our most commonly asked questions. Most answers are right here.
              </p>
              <div className="flex flex-col gap-1.5 lg:flex-col flex-wrap">
                {faqCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveFaqCat(cat); setOpenFaq(null); }}
                    className={`text-left bg-none border-none cursor-pointer px-4 py-2.5 rounded-[10px] font-[DM_Sans,sans-serif] text-sm font-medium transition-all duration-150
                      ${activeFaqCat === cat
                        ? "bg-[var(--color-pumpkin)] text-white"
                        : "text-[var(--color-charcoal-100)] hover:bg-[var(--color-pumpkin)] hover:text-white"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="reveal reveal-delay-2 flex flex-col gap-3">
              {currentFaqs.map((item, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-2xl overflow-hidden border-[1.5px] transition-all duration-200
                    ${openFaq === i ? "border-[var(--color-pumpkin-100)] shadow-lg" : "border-black/[0.06]"}`}
                >
                  <button
                    className="w-full flex items-center justify-between px-6 py-5 bg-transparent border-none cursor-pointer font-[DM_Sans,sans-serif] text-[0.95rem] font-semibold text-[var(--color-charcoal)] text-left gap-4"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{item.q}</span>
                    <span
                      className={`faq-chevron-icon flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[0.7rem] bg-[var(--color-surface)] ${openFaq === i ? "open" : ""}`}
                    >
                      ▼
                    </span>
                  </button>
                  <div className={`faq-answer text-[0.9rem] text-[var(--color-charcoal-100)] leading-relaxed ${openFaq === i ? "open" : ""}`}>
                    {item.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-20 px-12 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="reveal text-center max-w-[480px] mx-auto">
            <span className="block text-xs font-semibold tracking-widest uppercase text-[var(--color-pumpkin)] mb-3">
              Get in Touch
            </span>
            <h2 className="font-black leading-[1.15] tracking-tight text-[var(--color-charcoal)]" style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", letterSpacing: "-0.02em" }}>
              Prefer Talking to a Person?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-10">
            {/* Phone — dark */}
            <div className="contact-card-wrap reveal reveal-delay-1 relative rounded-[20px] p-9 bg-[var(--color-charcoal)] flex flex-col gap-2.5 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.06] pointer-events-none" />
              <div className="text-[2rem] mb-1">📞</div>
              <div className="font-bold text-[1.2rem] text-white" style={{ fontFamily: "'Playfair Display',serif" }}>Phone Support</div>
              <p className="text-sm text-white/75 leading-relaxed">Speak directly with a travel specialist. Available 24/7 for urgent travel disruptions.</p>
              <div className="mt-3 text-sm font-semibold text-white flex items-center gap-1.5">
                +92 21 111 759 768
                <span className="contact-arrow inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-[0.7rem]">→</span>
              </div>
            </div>

            {/* Chat — warm */}
            <div className="contact-card-wrap reveal reveal-delay-2 relative rounded-[20px] p-9 bg-[var(--color-pumpkin)] flex flex-col gap-2.5 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.06] pointer-events-none" />
              <div className="text-[2rem] mb-1">💬</div>
              <div className="font-bold text-[1.2rem] text-white" style={{ fontFamily: "'Playfair Display',serif" }}>Live Chat</div>
              <p className="text-sm text-white/75 leading-relaxed">Average response under 2 minutes. Our agents handle everything from rebooking to refunds.</p>
              <div className="mt-3 text-sm font-semibold text-white flex items-center gap-1.5">
                Start a chat
                <span className="contact-arrow inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-[0.7rem]">→</span>
              </div>
            </div>

            {/* Email — light */}
            <div className="contact-card-wrap reveal reveal-delay-3 relative rounded-[20px] p-9 bg-white border-[1.5px] border-black/[0.07] flex flex-col gap-2.5 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-black/[0.03] pointer-events-none" />
              <div className="text-[2rem] mb-1">✉️</div>
              <div className="font-bold text-[1.2rem] text-[var(--color-charcoal)]" style={{ fontFamily: "'Playfair Display',serif" }}>Email Us</div>
              <p className="text-sm text-[var(--color-charcoal-100)] leading-relaxed">Non-urgent queries handled within 4 business hours. Attach your booking reference for faster help.</p>
              <div className="mt-3 text-sm font-semibold text-[var(--color-pumpkin)] flex items-center gap-1.5">
                support@skyroute.com
                <span className="contact-arrow inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-card)] text-[0.7rem]">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE CHAT DEMO ── */}
      <section className="py-20 px-12 bg-[var(--color-surface)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="reveal text-center max-w-[520px] mx-auto">
            <span className="block text-xs font-semibold tracking-widest uppercase text-[var(--color-pumpkin)] mb-3">
              Live Chat
            </span>
            <h2 className="font-black leading-[1.15] tracking-tight text-[var(--color-charcoal)]" style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", letterSpacing: "-0.02em" }}>
              Chat With Our Team Right Now
            </h2>
          </div>

          <div className="reveal reveal-delay-1 max-w-[780px] mx-auto mt-10 bg-white rounded-3xl border-[1.5px] border-black/[0.07] shadow-2xl overflow-hidden">
            {/* Top bar */}
            <div className="bg-[var(--color-charcoal)] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-full bg-[var(--color-pumpkin)] flex items-center justify-center text-lg shrink-0">
                  👩🏽‍💼
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">Maya — SkyRoute Support</div>
                  <div className="flex items-center gap-1.5 text-xs text-white/55 mt-0.5">
                    <span className="dot-pulse w-[7px] h-[7px] rounded-full bg-green-400 inline-block" />
                    Online · Avg. reply 90 sec
                  </div>
                </div>
              </div>
              <button className="bg-white/10 hover:bg-white/20 border-none cursor-pointer text-white/60 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors duration-200">
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="p-6 flex flex-col gap-4 min-h-[300px] max-h-[380px] overflow-y-auto bg-[var(--color-surface)]">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 items-end ${m.from === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-[30px] h-[30px] rounded-full shrink-0 flex items-center justify-center text-sm ${m.from === "user" ? "bg-[var(--color-pumpkin)]" : "bg-[var(--color-card)]"}`}>
                    {m.from === "agent" ? "👩🏽‍💼" : "🧑"}
                  </div>
                  <div className={`flex flex-col ${m.from === "user" ? "items-end" : ""}`}>
                    <div
                      className={`max-w-[72%] px-4 py-3 text-sm leading-relaxed
                        ${m.from === "user"
                          ? "bg-[var(--color-charcoal)] text-white rounded-[18px] rounded-br-[4px]"
                          : "bg-white text-[var(--color-charcoal)] rounded-[18px] rounded-bl-[4px] shadow-sm"
                        }`}
                    >
                      {m.text}
                    </div>
                    <div className={`text-[0.7rem] text-[var(--color-charcoal-100)] mt-1 ${m.from === "user" ? "text-right" : ""}`}>
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 items-end">
                  <div className="w-[30px] h-[30px] rounded-full bg-[var(--color-card)] flex items-center justify-center text-sm">👩🏽‍💼</div>
                  <div className="bg-white rounded-[18px] rounded-bl-[4px] shadow-sm px-4 py-3 flex gap-1.5 items-center">
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="flex gap-3 px-5 py-4 border-t border-black/[0.07] bg-white items-center">
              <input
                className="flex-1 border-[1.5px] border-black/[0.09] rounded-full px-5 py-2.5 font-[DM_Sans,sans-serif] text-sm text-[var(--color-charcoal)] outline-none focus:border-[var(--color-pumpkin)] transition-colors duration-200"
                placeholder="Type your message…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="w-10 h-10 rounded-full bg-[var(--color-pumpkin)] border-none cursor-pointer text-white text-base flex items-center justify-center shrink-0 transition-transform duration-150 hover:scale-110"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SYSTEM STATUS ── */}
      <div className="bg-[var(--color-card)] px-12 py-12 border-t border-black/[0.06]">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="font-bold text-[1.4rem] text-[var(--color-charcoal)]" style={{ fontFamily: "'Playfair Display',serif" }}>
              System Status
            </div>
            <div
              className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold border"
              style={{ background: "oklch(70% 0.15 145 / 0.12)", border: "1px solid oklch(70% 0.15 145 / 0.25)", color: "oklch(35% 0.12 145)" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: "oklch(65% 0.15 145)" }} />
              All systems operational
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusItems.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl px-5 py-4 flex items-center gap-3 border border-black/[0.06]">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-charcoal)]">{s.name}</div>
                  <div className="text-xs font-medium" style={{ color: "oklch(50% 0.12 145)" }}>✓ {s.state}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}