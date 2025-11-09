import { useState } from "react";
import { BsStar, BsStarFill, BsReply, BsPencil, BsTrash } from "react-icons/bs";
import dayjs from "dayjs";
import { axiosInstance } from "@/utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useDBUser } from "@/context/UserContext";

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    hostReply?: string;
    hostRepliedAt?: string;
    user: {
        name: string;
        photoURL: string;
    };
}

interface ReviewCardProps {
    review: Review;
    propertyHostId?: string;
    onReplyAdded?: () => void;
}

const ReviewCard = ({ review, propertyHostId, onReplyAdded }: ReviewCardProps) => {
    const { dbUser } = useDBUser();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [replyText, setReplyText] = useState(review.hostReply || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isHost = dbUser?.id === propertyHostId;
    const hasReply = !!review.hostReply;

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span key={index}>
                {index < rating ? (
                    <BsStarFill className="text-yellow-400" />
                ) : (
                    <BsStar className="text-gray-300" />
                )}
            </span>
        ));
    };

    const handleSubmitReply = async () => {
        if (!replyText.trim()) {
            toast.error("Please enter a reply");
            return;
        }

        setIsSubmitting(true);
        try {
            if (hasReply && isEditing) {
                // Update existing reply
                await axiosInstance.post("/host/update-review-reply", {
                    reviewId: review.id,
                    hostId: dbUser?.id,
                    hostReply: replyText,
                });
                toast.success("Reply updated successfully");
            } else {
                // Add new reply
                await axiosInstance.post("/host/reply-to-review", {
                    reviewId: review.id,
                    hostId: dbUser?.id,
                    hostReply: replyText,
                });
                toast.success("Reply added successfully");
            }
            setShowReplyForm(false);
            setIsEditing(false);
            if (onReplyAdded) onReplyAdded();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to submit reply");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReply = async () => {
        if (!confirm("Are you sure you want to delete your reply?")) return;

        setIsSubmitting(true);
        try {
            await axiosInstance.post("/host/delete-review-reply", {
                reviewId: review.id,
                hostId: dbUser?.id,
            });
            toast.success("Reply deleted successfully");
            setReplyText("");
            if (onReplyAdded) onReplyAdded();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete reply");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditReply = () => {
        setIsEditing(true);
        setShowReplyForm(true);
        setReplyText(review.hostReply || "");
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header with user info and rating */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                        {review.user.photoURL ? (
                            <img
                                src={review.user.photoURL}
                                alt={review.user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {review.user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* User name and date */}
                    <div>
                        <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                        <p className="text-sm text-gray-500">
                            {dayjs(review.createdAt).format('DD/MM/YYYY')}
                        </p>
                    </div>
                </div>

                {/* Rating stars */}
                <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                </div>
            </div>

            {/* Review comment */}
            {review.comment && (
                <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
            )}

            {/* Host Reply Section */}
            {hasReply && !isEditing && (
                <div className="mt-4 ml-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <BsReply className="text-blue-600" />
                            <span className="font-semibold text-blue-900">Host Response</span>
                            {review.hostRepliedAt && (
                                <span className="text-xs text-blue-600">
                                    {dayjs(review.hostRepliedAt).format('DD/MM/YYYY')}
                                </span>
                            )}
                        </div>
                        {isHost && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEditReply}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    title="Edit reply"
                                >
                                    <BsPencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleDeleteReply}
                                    disabled={isSubmitting}
                                    className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                                    title="Delete reply"
                                >
                                    <BsTrash className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-blue-900">{review.hostReply}</p>
                </div>
            )}

            {/* Reply Form */}
            {isHost && (showReplyForm || (!hasReply && !showReplyForm)) && (
                <div className="mt-4">
                    {!showReplyForm && !hasReply ? (
                        <button
                            onClick={() => setShowReplyForm(true)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                            <BsReply />
                            Reply to this review
                        </button>
                    ) : (
                        <div className="ml-8 space-y-3">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your response..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSubmitReply}
                                    disabled={isSubmitting || !replyText.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    {isSubmitting ? "Submitting..." : isEditing ? "Update Reply" : "Post Reply"}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowReplyForm(false);
                                        setIsEditing(false);
                                        setReplyText(review.hostReply || "");
                                    }}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewCard;