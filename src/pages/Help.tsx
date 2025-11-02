import { useState } from "react";
import { Search, ChevronDown, ChevronRight, Book, CreditCard, User, Home, Phone } from "lucide-react";

const Help = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const helpSections = [
        {
            id: "booking",
            title: "Booking & Reservations",
            icon: <Book className="h-5 w-5" />,
            items: [
                {
                    question: "How do I make a booking?",
                    answer: "To make a booking, search for your destination, select your dates, choose a property, and click 'Book Now'. You'll need to provide guest details and payment information to complete your reservation."
                },
                {
                    question: "Can I modify my booking?",
                    answer: "Yes, you can modify most bookings up to 24 hours before check-in. Go to 'My Bookings' in your account, select the reservation, and click 'Modify Booking'. Note that changes may affect the price."
                },
                {
                    question: "What is the cancellation policy?",
                    answer: "Cancellation policies vary by property. Most offer free cancellation up to 24-48 hours before check-in. Check your booking confirmation or the property details for specific terms."
                },
                {
                    question: "How do I get my booking confirmation?",
                    answer: "You'll receive a booking confirmation email immediately after completing your reservation. You can also view all bookings in your account under 'My Bookings'."
                }
            ]
        },
        {
            id: "payment",
            title: "Payment & Billing",
            icon: <CreditCard className="h-5 w-5" />,
            items: [
                {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. Payment methods may vary by region and property."
                },
                {
                    question: "When will I be charged?",
                    answer: "For most bookings, you'll be charged immediately upon confirmation. Some properties may offer pay-at-property options, which will be clearly indicated during booking."
                },
                {
                    question: "Can I get a refund?",
                    answer: "Refunds depend on the property's cancellation policy and when you cancel. Free cancellation bookings receive full refunds if cancelled within the allowed timeframe."
                },
                {
                    question: "Why was I charged extra fees?",
                    answer: "Additional fees may include taxes, service charges, or property-specific fees like resort fees or cleaning fees. These are disclosed during the booking process."
                }
            ]
        },
        {
            id: "account",
            title: "Account Management",
            icon: <User className="h-5 w-5" />,
            items: [
                {
                    question: "How do I create an account?",
                    answer: "Click 'Sign Up' in the top right corner, enter your email and create a password. You can also sign up using Google or Facebook for faster registration."
                },
                {
                    question: "I forgot my password",
                    answer: "Click 'Forgot Password' on the login page, enter your email address, and we'll send you a reset link. Check your spam folder if you don't see the email."
                },
                {
                    question: "How do I update my profile?",
                    answer: "Go to 'My Account' > 'Profile Settings' to update your personal information, contact details, and preferences. Don't forget to save your changes."
                },
                {
                    question: "Can I delete my account?",
                    answer: "Yes, you can delete your account by going to 'Account Settings' > 'Privacy' > 'Delete Account'. Note that this action is permanent and cannot be undone."
                }
            ]
        },
        {
            id: "property",
            title: "Property Listings",
            icon: <Home className="h-5 w-5" />,
            items: [
                {
                    question: "How do I list my property?",
                    answer: "Click 'List Your Property' in the main menu, complete the property details form, upload photos, set your pricing and availability, then submit for review."
                },
                {
                    question: "How long does approval take?",
                    answer: "Property approval typically takes 24-48 hours. We'll review your listing for completeness and compliance with our standards before making it live."
                },
                {
                    question: "What are the listing fees?",
                    answer: "We charge a 3% service fee on confirmed bookings. There are no upfront costs to list your property on our platform."
                },
                {
                    question: "How do I manage my calendar?",
                    answer: "Use the 'Host Dashboard' to update availability, block dates, adjust pricing, and manage your property calendar in real-time."
                }
            ]
        }
    ];

    const filteredSections = helpSections.map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(section => section.items.length > 0);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Find answers to frequently asked questions and get the help you need.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for help..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <a
                        href="/contact-support"
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
                    >
                        <Phone className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
                        <p className="text-sm text-gray-600">Get personalized help from our support team</p>
                    </a>

                    <a
                        href="/properties"
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
                    >
                        <Book className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Make a Booking</h3>
                        <p className="text-sm text-gray-600">Browse and book your next stay</p>
                    </a>

                    <a
                        href="/profile"
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
                    >
                        <User className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">My Account</h3>
                        <p className="text-sm text-gray-600">Manage your bookings and profile</p>
                    </a>
                </div>

                {/* FAQ Sections */}
                <div className="space-y-6">
                    {filteredSections.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No results found for "{searchTerm}". Try a different search term.</p>
                        </div>
                    ) : (
                        filteredSections.map((section) => (
                            <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="text-blue-600">{section.icon}</div>
                                        <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                                    </div>
                                    {expandedSections.includes(section.id) ? (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>

                                {expandedSections.includes(section.id) && (
                                    <div className="px-6 pb-4">
                                        <div className="space-y-4">
                                            {section.items.map((item, index) => (
                                                <div key={index} className="border-l-2 border-blue-100 pl-4">
                                                    <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Still Need Help */}
                <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Still need help?</h2>
                    <p className="text-gray-600 mb-6">
                        Can't find what you're looking for? Our support team is here to help you 24/7.
                    </p>
                    <a
                        href="/contact-support"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Help;