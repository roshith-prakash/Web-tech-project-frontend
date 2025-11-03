import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PrimaryButton, SecondaryButton } from "@/components";
import { useDBUser } from "@/context/UserContext";
import {
  BsSearch,
  BsCalendar,
  BsGeoAlt,
  BsHouse,
  BsHeadset,
  BsShield,
  BsGlobe,
  BsStar,
  BsPeople,
  BsAward,
  BsHeart,
  BsArrowRight,
  BsCheckCircle,
} from "react-icons/bs";

const features = [
  {
    icon: BsHouse,
    title: "Instant Booking",
    description: "Book your perfect stay instantly with our streamlined booking process",
    color: "blue",
  },
  {
    icon: BsHeadset,
    title: "24/7 Support",
    description: "Get help whenever you need it with our round-the-clock customer support",
    color: "green",
  },
  {
    icon: BsShield,
    title: "Secure Payments",
    description: "Your payments are protected with bank-level security and encryption",
    color: "purple",
  },
  {
    icon: BsGlobe,
    title: "Global Network",
    description: "Access unique properties in over 220 countries worldwide",
    color: "orange",
  },
];

const destinations = [
  {
    name: "Bali, Indonesia",
    properties: "2,500+ properties",
    description: "Tropical paradise with stunning beaches",
    gradient: "from-orange-400 to-pink-500",
  },
  {
    name: "Paris, France",
    properties: "3,200+ properties",
    description: "The city of love and iconic landmarks",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    name: "Tokyo, Japan",
    properties: "1,800+ properties",
    description: "Modern metropolis meets tradition",
    gradient: "from-green-400 to-blue-500",
  },
  {
    name: "Santorini, Greece",
    properties: "900+ properties",
    description: "Breathtaking sunsets and charm",
    gradient: "from-blue-400 to-purple-500",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "New York, USA",
    rating: 5,
    comment:
      "Amazing experience! The booking process was seamless and the property exceeded our expectations.",
  },
  {
    name: "Marco Rodriguez",
    location: "Barcelona, Spain",
    rating: 5,
    comment:
      "StayFinder helped us find the perfect vacation rental. Highly recommend for travelers!",
  },
  {
    name: "Emily Chen",
    location: "Singapore",
    rating: 5,
    comment:
      "Excellent customer service and beautiful properties. Will definitely use again for our next trip.",
  },
];

const stats = [
  { icon: BsPeople, value: "2M+", label: "Happy Travelers", color: "text-cta" },
  { icon: BsAward, value: "50K+", label: "Verified Properties", color: "text-green-600" },
  { icon: BsStar, value: "4.9", label: "Average Rating", color: "text-yellow-600" },
  { icon: BsHeart, value: "98%", label: "Satisfaction Rate", color: "text-red-600" },
];

export default function Landing() {
  const { dbUser } = useDBUser();
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const handleSearch = () => {
    // Navigate to properties page with search parameters
    const searchParams = new URLSearchParams();
    if (searchLocation.trim()) {
      searchParams.set('search', searchLocation.trim());
    }
    if (checkInDate) {
      searchParams.set('checkIn', checkInDate);
    }
    if (checkOutDate) {
      searchParams.set('checkOut', checkOutDate);
    }

    const queryString = searchParams.toString();
    const url = `/properties${queryString ? `?${queryString}` : ''}`;
    console.log('🔍 Navigating to:', url, 'with params:', {
      search: searchLocation.trim(),
      checkIn: checkInDate,
      checkOut: checkOutDate
    });
    navigate(url);
  };

  const getFeatureColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-cta",
      orange: "bg-orange-100 text-orange-600",
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-cta dark:text-darkmodeCTA">
                Stay
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover unique properties, book instantly, and create unforgettable memories around the world
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-2 font-medium">Destination</label>
                <div className="relative">
                  <BsGeoAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cta focus:border-transparent h-14"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex gap-2 w-full">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-2 font-medium">Check-in</label>
                    <div className="relative">
                      <BsCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cta focus:border-transparent h-14"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-2 font-medium">Check-out</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cta focus:border-transparent h-14"
                    />
                  </div>
                </div>
              </div>
              <PrimaryButton
                text={
                  <div className="flex items-center gap-2">
                    <BsSearch />
                    Search
                  </div>
                }
                onClick={handleSearch}
                className="px-8 py-4 text-lg h-14 flex items-center"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            {!dbUser ? (
              <>
                <Link to="/signup">
                  <SecondaryButton
                    text="Join as Guest"
                    className="px-6 py-3"
                  />
                </Link>
                <Link to="/signup-host">
                  <PrimaryButton
                    text="Become a Host"
                    className="px-6 py-3"
                  />
                </Link>
              </>
            ) : (
              <Link to="/properties">
                <PrimaryButton
                  text={
                    <div className="flex items-center gap-2">
                      Explore Properties
                      <BsArrowRight />
                    </div>
                  }
                  className="px-6 py-3"
                />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose StayFinder?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience seamless travel with our platform designed for modern explorers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 text-center border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${getFeatureColor(feature.color)}`}>
                  <feature.icon className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover amazing places around the world with thousands of verified properties
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination, index) => (
              <div
                key={index}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                onClick={() => {
                  const searchParams = new URLSearchParams();
                  // Extract city name (before the comma) for better search results
                  const cityName = destination.name.split(',')[0].trim();
                  searchParams.set('search', cityName);
                  const url = `/properties?${searchParams.toString()}`;
                  console.log('🌍 Navigating to destination:', url, 'searching for:', cityName);
                  navigate(url);
                }}
              >
                <div className={`relative h-48 bg-gradient-to-br ${destination.gradient} p-6 flex items-end`}>
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {destination.properties}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <BsArrowRight className="text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed mb-3">
                    {destination.description}
                  </p>
                  <p className="text-sm text-cta font-medium group-hover:text-hovercta transition-colors">
                    Click to explore properties →
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/properties">
              <SecondaryButton
                text={
                  <div className="flex items-center gap-2">
                    View All Destinations
                    <BsArrowRight />
                  </div>
                }
                className="px-8 py-3"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Millions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our growing community of travelers and hosts worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${stat.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                  <stat.icon className={`text-2xl ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real experiences from travelers who found their perfect stay with StayFinder
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <BsStar key={i} className="text-yellow-400 text-lg fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cta to-hovercta">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join millions of travelers who trust StayFinder for their perfect getaway.
            Book your next adventure today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties">
              <button className="px-8 py-4 bg-white text-cta font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <BsSearch />
                  Explore Properties
                </div>
              </button>
            </Link>
            {!dbUser && (
              <Link to="/signup-host">
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-cta transition-colors">
                  <div className="flex items-center gap-2">
                    <BsHouse />
                    Become a Host
                  </div>
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
