import { useState } from "react";
import { BsStar, BsStarFill } from "react-icons/bs";
import { SecondaryButton } from "@/components";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";
import toast from "react-hot-toast";

interface ReviewFormProps {
    propertyId: string;
    onReviewAdded: () => void;
    onCancel: () => void;
}

const ReviewForm = ({ propertyId, onReviewAdded, onCancel }: ReviewFormProps) => {
    const { dbUser } = useDBUser();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!dbUser) {
            toast.error("You must be logged in to leave a review");
            return;
        }

        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setIsSubmitting(true);

        try {
            await axiosInstance.post("/guest/add-review", {
                userId: dbUser.id,
                propertyId,
                rating,
                comment: comment.trim(),
            });

            toast.success("Review added successfully!");
            onReviewAdded();
        } catch (error: any) {
            console.error("Error adding review:", error);
            toast.error(error.response?.data?.error || "Failed to add review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const isActive = starValue <= (hoverRating || rating);

            return (
                <button
                    key={index}
                    type="button"
                    className="text-2xl transition-colors hover:scale-110 transform"
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starValue)}
                >
                    {isActive ? (
                        <BsStarFill className="text-yellow-400" />
                    ) : (
                        <BsStar className="text-gray-300 hover:text-yellow-200" />
                    )}
                </button>
            );
        });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Leave a Review
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating *
                    </label>
                    <div className="flex items-center gap-1">
                        {renderStars()}
                        {rating > 0 && (
                            <span className="ml-2 text-sm text-gray-600">
                                {rating} star{rating !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment (optional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this property..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {comment.length}/500 characters
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting || rating === 0}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                    <SecondaryButton
                        text="Cancel"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1"
                    />
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;