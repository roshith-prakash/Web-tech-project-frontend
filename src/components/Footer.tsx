import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              StayFinder
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your trusted platform for finding and booking unique accommodations worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            <div className="space-y-2">
              <Link
                to="/properties"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Browse Properties
              </Link>
              <Link
                to="/profile"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                My Account
              </Link>
              <Link
                to="/property-listing"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                List Your Property
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Support</h3>
            <div className="space-y-2">
              <Link
                to="/contact-support"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                to="/help"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span>© 2024 StayFinder, Inc.</span>
              <a
                href="/terms"
                className="hover:text-gray-700 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="hover:text-gray-700 transition-colors"
              >
                Privacy Policy
              </a>
            </div>
            <div className="text-xs text-gray-500">
              Made with ❤️ for travelers
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;