import {
  Plane,
  Globe,
  Clock,
  DollarSign,
  Headphones,
  Layers,
} from "lucide-react";

const Popular = [
  {
    title: "Paris France",
    description: "Book flights in just a few clicks with our simple interface.",
    image:
      "https://plus.unsplash.com/premium_photo-1661919210043-fd847a58522d?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Dubai UAE",
    description: "Book flights in just a few clicks with our simple interface.",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "NewYork USA",
    description: "Book flights in just a few clicks with our simple interface.",
    image:
      "https://plus.unsplash.com/premium_photo-1682656220562-32fde8256295?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Fuji Japan",
    description: "Book flights in just a few clicks with our simple interface.",
    image:
      "https://images.unsplash.com/photo-1576675466684-456bcdeccfbf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const features = [
  {
    title: "Easy Booking",
    para1: "Book flights quickly",
    para2: "Simple and hassle-free",
    icon1: Plane,
    icon2: Layers,
  },
  {
    title: "Global Network",
    para1: "Connect worldwide easily",
    para2: "Flights to all continents",
    icon1: Globe,
    icon2: Plane,
  },
  {
    title: "24/7 Support",
    para1: "Help anytime anywhere",
    para2: "We are always ready",
    icon1: Headphones,
    icon2: Clock,
  },
  {
    title: "Flexible Deals",
    para1: "Affordable and convenient",
    para2: "Choose what suits you",
    icon1: DollarSign,
    icon2: Layers,
  },
];

const works = [
  {
    icon1: "/images/search_11316310.png",
    icon2: "/images/right-down_12857929.png",
    count: 1,
    title: "Search Flight",
    desc: "Search and compare flights easily with the best available prices.",
  },
  {
    icon1: "/images/approved_2792245.png",
    icon2: "/images/right-down_12857929.png",
    count: 2,
    title: "Book & Pay",
    desc: "Book your tickets quickly using secure and trusted payment methods.",
  },
  {
    icon1: "/images/travel_12996681.png",
    count: 3,
    title: "Relax & Fly",
    desc: "Relax and enjoy a comfortable journey with complete peace of mind.",
  },
];

const deals = [
  {
    image:
      // "/images/breathtaking-shot-colosseum-amphitheatre-located-rome-italy.jpg",
      "https://images.pexels.com/photos/32199907/pexels-photo-32199907.jpeg",
    title: "European City Explorer",
    desc: "Flight + 5 Nights Hotel",
    price: "$550 - 799",
    url: "",
  },
  {
    image: 
    // "/images/beautiful-diamond-beach-penida-island-bali-indonesia.jpg",
    "https://images.pexels.com/photos/36137288/pexels-photo-36137288.jpeg",
    title: "Summer Getaway to bali",
    desc: "Flight + 5 Nights Hotel",
    price: "$1200 - 799",
    url: "",
  },
  {
    image: 
    // "/images/camping-milky-way-serene-adventure-generated-by-ai.jpg",
    "https://images.pexels.com/photos/32543650/pexels-photo-32543650.jpeg",
    title: "Desert Adventure Dubai",
    desc: "Flight + 5 Nights Hotel + Desert Safari",
    price: "$450 - 680",
    url: "",
  },
];

const testimonials = [
  {
    image:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGVvcGxlfGVufDB8fDB8fHww",
    name: "Mariam Khan",
    title: "Best Travel Experience",
    desc: "SkyRoute made my Europe trip completely stress-free. From booking to hotel arrangements, everything was smooth and well-organized. Highly recommended for travelers who want comfort and reliability.",
    rating:5
  },
  {
    image:"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVvcGxlfGVufDB8fDB8fHww",
    name: "Usman Malik",
    title: "Affordable & Reliable",
    desc: "I booked my Bali vacation through SkyRoute and got an amazing deal. The support team was very responsive and helped me at every step. Definitely using SkyRoute again.",
    rating:4
  },
  {
    image:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D",
    name: "Rebecca Jesper",
    title: "Excellent Customer Support",
    desc: "What impressed me most was the customer service. They guided me properly and customized my trip according to my budget. SkyRoute truly cares about its customers.",
    rating:4
  }
];

export { Popular, features, works,deals, testimonials };
