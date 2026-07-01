import {
  Facebook,
  FacebookIcon,
  Instagram,
  Linkedin,
  Twitter,
  TwitterIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <footer>
        <div className="padding-x py-4 sm:py-10 bg-[#f1f1f1]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col ">
              <div className="flex p-2 bg-linear-to-l from-orange-100 to bg-blue-200 w-max rounded-4xl">
                <img src="/images/logo.png" width={100} alt="" />
              </div>
              <p className="text-charcoal-100 my-4 text-sm">
                SkyRoute is your trusted partner for seamless travel experiences.
               
              </p>
              <p className=""></p>
              <div className="flex justify-start items-center gap-2">
                <div className="p-2 bg-pumpkin rounded-full text-creame hover:bg-pumpkin-100">
                  <Facebook />
                </div>
                <div className="p-2 bg-pumpkin rounded-full text-creame hover:bg-pumpkin-100">
                  <Twitter />
                </div>
                <div className="p-2 bg-pumpkin rounded-full text-creame hover:bg-pumpkin-100">
                  <Linkedin />
                </div>
                <div className="p-2 bg-pumpkin rounded-full text-creame hover:bg-pumpkin-100">
                  <Instagram />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-charcoal font-semibold mb-3">Quicks Links</h3>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                Home
              </Link>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                About Us
              </Link>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                Services
              </Link>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                How It Works
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-charcoal font-semibold mb-3">Support</h3>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                Help Center
              </Link>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                FAQs
              </Link>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                Contact Us
              </Link>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                Privacy & Policy
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-charcaol font-semibold mb-3">Explore</h3>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                Deals & Offers
              </Link>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                Gift Cards
              </Link>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                Booking Flight
              </Link>
              <Link className="text-charcoal-100 hover:text-charcoal" to="/">
                Booking Hotel
              </Link>
            </div>
          </div>
          <div>
            <hr className="my-6 sm:mb-10  border-[#d9d9d9]" />
            <p className="text-center text-charcoal-100 text-sm">
              &copy; {new Date().getFullYear()} SkyRoute. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
