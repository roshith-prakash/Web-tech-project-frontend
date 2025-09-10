import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaHome,
  FaHeadset,
  FaShieldAlt,
  FaGlobe,
  FaStar,
  FaUsers,
  FaAward,
} from "react-icons/fa";

const features = [
  {
    icon: FaHome,
    title: "Instant Booking",
    description:
      "Book your perfect stay instantly with our streamlined booking process",
  },
  {
    icon: FaHeadset,
    title: "24/7 Support",
    description:
      "Get help whenever you need it with our round-the-clock customer support",
  },
  {
    icon: FaShieldAlt,
    title: "Secure Payments",
    description:
      "Your payments are protected with bank-level security and encryption",
  },
  {
    icon: FaGlobe,
    title: "Global Network",
    description:
      "Access millions of unique properties in over 220 countries worldwide",
  },
];

const destinations = [
  {
    name: "Bali, Indonesia",
    image: "/beautiful-bali-rice-terraces-and-temples.jpg",
    description: "Tropical paradise with stunning beaches and rich culture",
  },
  {
    name: "Paris, France",
    image: "/paris-eiffel-tower-and-charming-streets.jpg",
    description: "The city of love with iconic landmarks and cuisine",
  },
  {
    name: "Tokyo, Japan",
    image: "/tokyo-modern-skyline-with-cherry-blossoms.jpg",
    description: "Modern metropolis blending tradition and innovation",
  },
  {
    name: "Santorini, Greece",
    image: "/santorini-white-buildings-and-blue-sea.jpg",
    description: "Breathtaking sunsets and Mediterranean charm",
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
  { icon: FaUsers, value: "2M+", label: "Happy Travelers" },
  { icon: FaAward, value: "50K+", label: "Verified Properties" },
  { icon: FaStar, value: "4.9", label: "Average Rating" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-white/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 mb-6 text-balance">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 text-pretty">
            Book unique homes and experiences around the world
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-full shadow-2xl p-2 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-6 py-4">
                <FaMapMarkerAlt className="text-emerald-600 text-lg" />
                <Input
                  placeholder="Where to?"
                  className="border-0 bg-transparent text-lg placeholder:text-slate-500 focus-visible:ring-0"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-6 py-4 border-l border-slate-200">
                <FaCalendarAlt className="text-emerald-600 text-lg" />
                <Input
                  placeholder="Check-in / Check-out"
                  className="border-0 bg-transparent text-lg placeholder:text-slate-500 focus-visible:ring-0"
                />
              </div>
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700"
              >
                <FaSearch className="mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-800 mb-4">
              Why Choose StayFinder?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Experience the difference with our premium features designed for
              modern travelers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                  <feature.icon className="text-2xl text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-800 mb-4">
              Explore Popular Destinations
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover amazing places around the world and create unforgettable
              memories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinations.map((destination, index) => (
              <div
                key={index}
                className="group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {destination.name}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {destination.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <stat.icon className="text-2xl text-emerald-600" />
                </div>
                <div className="text-4xl font-black text-slate-800 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-800 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join millions of satisfied travelers who trust StayFinder for
              their perfect getaway
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-amber-400 text-lg" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed italic">
                  "{testimonial.comment}"
                </p>
                <div>
                  <div className="font-semibold text-slate-800">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
