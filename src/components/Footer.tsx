import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaShieldAlt,
  FaAward,
  FaCreditCard,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="text-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              StayFinder
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover unique places to stay around the world. From cozy
              apartments to luxury villas, find your perfect home away from
              home.
            </p>
            <div className="space-y-2">
              <Link
                to="/about"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/careers"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Careers
              </Link>
              <Link
                to="/blog"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Blog
              </Link>
            </div>
          </div>

          {/* Destinations & Travel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Explore</h3>
            <div className="space-y-2">
              <Link
                to="/destinations"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Popular Destinations
              </Link>
              <Link
                to="/travel-guides"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Travel Guides
              </Link>
              <Link
                to="/experiences"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Unique Experiences
              </Link>
              <Link
                to="/host"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Become a Host
              </Link>
              <Link
                to="/host-resources"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Host Resources
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Support</h3>
            <div className="space-y-2">
              <Link
                to="/help"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Help Center
              </Link>
              <Link
                to="/contact"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/safety"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Safety Center
              </Link>
              <Link
                to="/cancellation"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Cancellation Options
              </Link>
              <Link
                to="/disability-support"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Disability Support
              </Link>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Stay Updated
            </h3>
            <p className="text-sm text-muted-foreground">
              Get travel tips, deals, and inspiration delivered to your inbox.
            </p>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="text-sm"
              />
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Elements & Social Media */}
        <div className="border-t border-border pt-8 mb-8 text-black">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="h-5 w-5" />
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <FaAward className="h-5 w-5" />
                <span className="text-sm font-medium">Trusted by Millions</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCreditCard className="h-5 w-5" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-black hover:text-black/75 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <FaFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-black hover:text-black/75 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-black hover:text-black/75 transition-colors"
                aria-label="Follow us on Twitter"
              >
                <FaTwitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>© 2024 StayFinder, Inc.</span>
              <a
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/cookies"
                className="hover:text-foreground transition-colors"
              >
                Cookie Policy
              </a>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>English</span>
              <span>INR</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
