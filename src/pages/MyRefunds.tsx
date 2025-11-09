import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";
import { PrimaryButton } from "@/components";
import { Clock, CheckCircle, XCircle, AlertCircle, DollarSign } from "lucide-react";
import dayjs from "dayjs";

interface Refund {
    id: string;
    amount: number;
    status: string;
    reason?: string;
    processedAt?: string;
    completedAt?: string;
    transactionId?: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
    booking: {
        id: string;
        startDate: string;
        endDate: string;
        totalAmount: number;
        status: string;
        property: {
            id: string;
            title: string;
            location: string;
            imageUrls: string[];
            currency?: string;
        };
    };
}

const fetchUserRefunds = async (userId: string) => {
    const response = await axiosInstance.post("/refund/get-user-refunds", {
        userId,
        page: 1,
        limit: 100,
    });
    return response.data;
};

const MyRefunds = () => {
    const { dbUser } = useDBUser();
    const [filter, setFilter] = useState<string>("all");

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["userRefunds", dbUser?.id],
        queryFn: () => fetchUserRefunds(dbUser?.id!),
        enabled: !!dbUser?.id,
        staleTime: 1000 * 60 * 5,
    });

    const refunds: Refund[] = data?.refunds || [];

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'PROCESSING':
                return <Clock className="h-5 w-5 text-blue-500" />;
            case 'COMPLETED':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'FAILED':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'FAILED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredRefunds = refunds.filter(refund =>
        filter === "all" || refund.status.toUpperCase() === filter.toUpperCase()
    );

    const getStats = () => {
        return {
            total: refunds.length,
            pending: refunds.filter(r => r.status === 'PENDING').length,
            processing: refunds.filter(r => r.status === 'PROCESSING').length,
            completed: refunds.filter(r => r.status === 'COMPLETED').length,
            totalAmount: refunds
                .filter(r => r.status === 'COMPLETED')
                .reduce((sum, r) => sum + r.amount, 0),
        };
    };

    const stats = getStats();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center p-6 text-red-500 bg-red-50 rounded-lg">
                <p className="mb-4">{error?.message || "Failed to load refunds"}</p>
                <PrimaryButton text="Try Again" onClick={() => refetch()} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Refunds</h1>
                            <p className="text-gray-600">Track your refund requests and status</p>
                        </div>
                        <Link to="/profile">
                            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                                ← Back to Profile
                            </button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Refunds</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-600">Processing</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.processing}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-600">Completed</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        {['all', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Refunds List */}
                {filteredRefunds.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                        <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {filter === 'all' ? 'No refunds yet' : `No ${filter.toLowerCase()} refunds`}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'all'
                                ? 'Refunds will appear here when you cancel bookings with successful payments'
                                : 'Try selecting a different filter'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRefunds.map((refund) => (
                            <div key={refund.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {getStatusIcon(refund.status)}
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {refund.booking.property.title}
                                                </h3>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">
                                                {refund.booking.property.location}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(refund.status)}`}>
                                                    {refund.status}
                                                </span>
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {refund.booking.property.currency || "USD"} {refund.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        {refund.booking.property.imageUrls.length > 0 && (
                                            <img
                                                src={refund.booking.property.imageUrls[0]}
                                                alt={refund.booking.property.title}
                                                className="w-24 h-24 object-cover rounded-lg ml-4"
                                            />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                        <div>
                                            <p className="text-gray-500">Requested</p>
                                            <p className="font-medium">{dayjs(refund.createdAt).format('DD/MM/YYYY')}</p>
                                        </div>
                                        {refund.processedAt && (
                                            <div>
                                                <p className="text-gray-500">Processed</p>
                                                <p className="font-medium">{dayjs(refund.processedAt).format('DD/MM/YYYY')}</p>
                                            </div>
                                        )}
                                        {refund.completedAt && (
                                            <div>
                                                <p className="text-gray-500">Completed</p>
                                                <p className="font-medium">{dayjs(refund.completedAt).format('DD/MM/YYYY')}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-gray-500">Booking Dates</p>
                                            <p className="font-medium">
                                                {dayjs(refund.booking.startDate).format('DD/MM')} - {dayjs(refund.booking.endDate).format('DD/MM/YY')}
                                            </p>
                                        </div>
                                    </div>

                                    {refund.reason && (
                                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                            <p className="text-sm text-gray-600">
                                                <strong>Reason:</strong> {refund.reason}
                                            </p>
                                        </div>
                                    )}

                                    {refund.adminNotes && (
                                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                            <p className="text-sm text-blue-800">
                                                <strong>Admin Note:</strong> {refund.adminNotes}
                                            </p>
                                        </div>
                                    )}

                                    {refund.transactionId && (
                                        <div className="text-xs text-gray-500">
                                            Transaction ID: {refund.transactionId}
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <Link to={`/property/${refund.booking.property.id}`}>
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                View Property →
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRefunds;
