import { useState, useEffect } from "react";
import { Clock, Mail, Phone, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import dayjs from "dayjs";

interface SupportTicket {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    priority: string;
    timestamp: string;
    status: string;
}

const SupportTickets = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        // Load tickets from localStorage
        const savedTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
        setTickets(savedTickets.reverse()); // Show newest first
    }, []);

    const updateTicketStatus = (ticketId: string, newStatus: string) => {
        const updatedTickets = tickets.map(ticket =>
            ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        );
        setTickets(updatedTickets);
        localStorage.setItem('supportTickets', JSON.stringify(updatedTickets.reverse()));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />;
            default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const filteredTickets = tickets.filter(ticket =>
        filter === "all" || ticket.status === filter
    );

    const getStats = () => {
        return {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'open').length,
            inProgress: tickets.filter(t => t.status === 'in-progress').length,
            resolved: tickets.filter(t => t.status === 'resolved').length
        };
    };

    const stats = getStats();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Support Tickets</h1>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Tickets</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-600">Open</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.open}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-600">In Progress</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-600">Resolved</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex space-x-2">
                        {['all', 'open', 'in-progress', 'resolved', 'closed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tickets List */}
                <div className="space-y-4">
                    {filteredTickets.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No support tickets found.</p>
                        </div>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <div key={ticket.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {ticket.subject}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority.toUpperCase()}
                                            </span>
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(ticket.status)}
                                                <span className="text-sm text-gray-600 capitalize">
                                                    {ticket.status.replace('-', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                            <span className="flex items-center">
                                                <Mail className="h-4 w-4 mr-1" />
                                                {ticket.email}
                                            </span>
                                            <span>From: {ticket.name}</span>
                                            <span>ID: {ticket.id}</span>
                                            <span>{dayjs(ticket.timestamp).format('DD/MM/YYYY HH:mm')}</span>
                                        </div>

                                        <p className="text-gray-700 mb-4">{ticket.message}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                                    <select
                                        value={ticket.status}
                                        onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>

                                    <a
                                        href={`mailto:${ticket.email}?subject=Re: ${ticket.subject} (Ticket #${ticket.id})`}
                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                    >
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportTickets;