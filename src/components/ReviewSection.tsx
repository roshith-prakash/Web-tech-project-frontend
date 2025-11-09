import { useState, useEffect } from "react";
import { BsStar, BsStarFill, BsPlus } from "react-icons/bs";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { PrimaryButton, SecondaryButton } from "@/components";

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

interface ReviewSectionProps {
    propertyId: string;
    propertyHostId?: string;
    initialReviews?: Review[];
    averageRating?: number;
    totalReviews?: number;
}

const ReviewSection = ({
    propertyId,
    propertyHostId,
    initialReviews = [],
    averageRating = 0,
    totalReviews = 0
}: ReviewSectionProps) => {
    console.log("🔍 ReviewSection rendered with:", { propertyId, initialReviews, averageRating, totalReviews });
    const { dbUser } = useDBUser();
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState({
        averageRating,
        totalReviews,
    });

    // Check if user can review this property
    useEffect(() => {
        const checkReviewEligibility = async () => {
            console.log("🔍 Checking review eligibility:", {
                dbUser: dbUser ? { id: dbUser.id, role: dbUser.role } : null,
                propertyId
            });

            if (!dbUser) {
                console.log("❌ No user logged in");
                return;
            }

            if (dbUser.role !== "GUEST") {
                console.log("❌ User is not a guest, role:", dbUser.role);
                return;
            }

            try {
                const response = await axiosInstance.post("/guest/can-review-property", {
                    userId: dbUser.id,
                    propertyId,
                });

                console.log("✅ Review eligibility response:", response.data);
                setCanReview(response.data.canReview);
            } catch (error) {
                console.error("❌ Error checking review eligibility:", error);
            }
        };

        checkReviewEligibility();
    }, [dbUser, propertyId]);

    const loadMoreReviews = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const response = await axiosInstance.post("/guest/get-property-reviews", {
                propertyId,
                page: page + 1,
                limit: 10,
            });

            setReviews(prev => [...prev, ...response.data.reviews]);
            setHasMore(response.data.hasMore);
            setPage(prev => prev + 1);
            setStats({
                averageRating: response.data.averageRating,
                totalReviews: response.data.total,
            });
        } catch (error) {
            console.error("Error loading more reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        // Reload reviews to get the latest data
        try {
            const response = await axiosInstance.post("/guest/get-property-reviews", {
                propertyId,
                page: 1,
                limit: 10,
            });

            setReviews(response.data.reviews);
            setHasMore(response.data.hasMore);
            setPage(1);
            setStats({
                averageRating: response.data.averageRating,
                totalReviews: response.data.total,
            });
        } catch (error) {
            console.error("Error reloading reviews:", error);
        }
    };

    const handleReviewAdded = async () => {
        setShowReviewForm(false);
        setCanReview(false);
        await fetchReviews();
    };

    const renderStars = (rating: number, size: "sm" | "md" = "md") => {
        const sizeClass = size === "sm" ? "text-sm" : "text-lg";

        return Array.from({ length: 5 }, (_, index) => (
            <span key={index} className={sizeClass}>
                {index < Math.floor(rating) ? (
                    <BsStarFill className="text-yellow-400" />
                ) : index < rating ? (
                    <BsStarFill className="text-yellow-400 opacity-50" />
                ) : (
                    <BsStar className="text-gray-300" />
                )}
            </span>
        ));
    };

    return (
        <div className="space-y-6">
            {/* Reviews Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                    {stats.totalReviews > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                                {renderStars(stats.averageRating)}
                            </div>
                            <span className="text-lg font-semibold text-gray-900">
                                {stats.averageRating.toFixed(1)}
                            </span>
                            <span className="text-gray-600">
                                ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
                            </span>
                        </div>
                    )}
                </div>

                {/* Add Review Button */}
                {canReview && !showReviewForm && (
                    <PrimaryButton
                        text={
                            <div className="flex items-center gap-2">
                                <BsPlus className="text-lg" />
                                Add Review
                            </div>
                        }
                        onClick={() => setShowReviewForm(true)}
                    />
                )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
                <ReviewForm
                    propertyId={propertyId}
                    onReviewAdded={handleReviewAdded}
                    onCancel={() => setShowReviewForm(false)}
                />
            )}

            {/* Reviews List */}
            {stats.totalReviews === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <BsStar className="text-4xl mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No reviews yet
                    </h3>
                    <p className="text-gray-600">
                        Be the first to share your experience with this property!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            propertyHostId={propertyHostId}
                            onReplyAdded={fetchReviews}
                        />
                    ))}

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="text-center pt-4">
                            <SecondaryButton
                                text={loading ? "Loading..." : "Load More Reviews"}
                                onClick={loadMoreReviews}
                                disabled={loading}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;