import { ArrowRight, Cog, Search, Star } from "lucide-react";
import { useState, useRef, useEffect, use } from "react";
import api from "../../api/api";
import { Link, useNavigate } from "react-router-dom";
import { Popular, features, works, deals, testimonials } from "../../constants";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRevealAnimation } from "../../animations/useRevealAnimation ";
import { useStaggerReveal } from "../../animations/useStaggerReveal";
import SectionSkeleton from "../../components/skeleton/SectionSkeleton";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { showError } from "../../utils/toast";
import {getHotels } from "../../api/hotels";
import DealsSection from "../../components/commonsections/DealsSection";
import TestimonialsSection from "../../components/commonsections/TestimonialsSection";
import HowItWorksSection from "../../components/commonsections/HowItWorksSection";
import WhyChooseSection from "../../components/commonsections/WhyChooseSection";
import PopularDestinationsSection from "../../components/commonsections/PopularDestinationsSection";
import ComfortSection from "../../components/commonsections/ComfortSection";
import NewsletterSection from "../../components/commonsections/NewsletterSection";
import HeroSection from "../../components/commonsections/HeroSection";

gsap.registerPlugin(ScrollTrigger);
const Home = () => {
  // ----- STATES -----
  // const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  // === FETCH POPULAR DESTINATION ===
  const fetchPopularDestinations = async () => {
    try {
      setSectionLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPopularDestinations(Popular);
    } catch (err) {
      showError("Fail to load Popupar Destinations");
      console.error("Error loading popular destinations:", err);
    } finally {
      setSectionLoading(false);
    }
  };

  // === FETCH DEALS ===
  const FetchDeals = async () => {
    try {
      setSectionLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOffers(deals);
    } catch (err) {
      showError("Fail to load Deals ");
      console.error("Error Loading Deals", err);
    } finally {
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularDestinations();
    FetchDeals();
  }, []);



  return (
    <>
      {/* ===== Hero Section ===== */}
      <HeroSection
        
      />
      
      {/* ===== Popular Destinations Section ===== */}
      {sectionLoading ? (
        <SectionSkeleton type="card" count={3} />
        ) : (
          <PopularDestinationsSection Popular={Popular} />
        )}

      {/* ===== Comfort & Experience Section ===== */}
      <ComfortSection  />
      

      {/* ===== Why Choose SkyRoute Section ===== */}
      <WhyChooseSection features={features} />

      {/* ===== How It Works Section ===== */}
      {sectionLoading ? (
        <SectionSkeleton type="card" count={3} />
      ) : (
        <HowItWorksSection works={works} />
      )}
      
      {/* ===== Deals Sectiion ===== */}
      <DealsSection deals={deals} />

      {/* ===== Testimonials Section ===== */}
      <TestimonialsSection
        testimonials={testimonials}
        onReadMore={() => navigate("/reviews")}
      />

      {/* ===== Newsletter Section ===== */}
      <NewsletterSection
        onSubscribe={async ({ email, phone }) => {
          await api.subscribe({ email, phone });
        }}
      />
    </>
  );
};

export default Home;
