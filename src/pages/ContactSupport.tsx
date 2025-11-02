import { useState } from "react";
import { Mail, Phone, MessageCircle, Clock } from "lucide-react";

const ContactSupport = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
        priority: "medium"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Create support ticket with timestamp and ID
            const supportTicket = {
                id: Date.now().toString(),
                ...formData,
                timestamp: new Date().toISOString(),
                status: 'open'
            };

            // Save to localStorage (replace with API call later)
            const existingTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
            existingTickets.push(supportTicket);
            localStorage.setItem('supportTickets', JSON.stringify(existingTickets));

            // TODO: Replace with actual API call
            // const response = await fetch('/api/support-tickets', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(supportTicket)
            // });

            console.log("Support request saved:", supportTicket);
            alert(`Thank you! Your support request has been submitted with ticket ID: ${supportTicket.id}. We'll get back to you within 24 hours.`);
            setFormData({ name: "", email: "", subject: "", message: "", priority: "medium" });

        } catch (error) {
            console.error("Error submitting support request:", error);
            alert("Sorry, there was an error submitting your request. Please try again.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Support</h1>
                    <p className="text-lg text-gray-600">
                        Need help? We're here to assist you with any questions or issues.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Email Support</p>
                                        <p className="text-gray-600">support@stayfinder.com</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Phone className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Phone Support</p>
                                        <p className="text-gray-600">1-800-STAY-HELP (1-800-782-9435)</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <MessageCircle className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Live Chat</p>
                                        <p className="text-gray-600">Available 24/7 on our website</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Response Time</p>
                                        <p className="text-gray-600">Within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Quick Links */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Help</h3>
                            <div className="space-y-2">
                                <a href="/help#booking" className="block text-blue-600 hover:text-blue-800 transition-colors">
                                    How to make a booking
                                </a>
                                <a href="/help#cancellation" className="block text-blue-600 hover:text-blue-800 transition-colors">
                                    Cancellation policy
                                </a>
                                <a href="/help#payment" className="block text-blue-600 hover:text-blue-800 transition-colors">
                                    Payment issues
                                </a>
                                <a href="/help#account" className="block text-blue-600 hover:text-blue-800 transition-colors">
                                    Account management
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority Level
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="low">Low - General inquiry</option>
                                    <option value="medium">Medium - Account issue</option>
                                    <option value="high">High - Booking problem</option>
                                    <option value="urgent">Urgent - Payment issue</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Please describe your issue or question in detail..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSupport;