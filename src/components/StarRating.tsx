import { BsStar, BsStarFill, BsStarHalf } from "react-icons/bs";

interface StarRatingProps {
    rating: number;
    size?: "sm" | "md" | "lg";
    showNumber?: boolean;
    totalReviews?: number;
}

const StarRating = ({
    rating,
    size = "md",
    showNumber = false,
    totalReviews
}: StarRatingProps) => {
    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;

            if (rating >= starValue) {
                // Full star
                return (
                    <BsStarFill
                        key={index}
                        className={`text-yellow-400 ${sizeClasses[size]}`}
                    />
                );
            } else if (rating >= starValue - 0.5) {
                // Half star
                return (
                    <BsStarHalf
                        key={index}
                        className={`text-yellow-400 ${sizeClasses[size]}`}
                    />
                );
            } else {
                // Empty star
                return (
                    <BsStar
                        key={index}
                        className={`text-gray-300 ${sizeClasses[size]}`}
                    />
                );
            }
        });
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                {renderStars()}
            </div>

            {showNumber && (
                <span className={`font-medium text-gray-900 ${sizeClasses[size]}`}>
                    {rating.toFixed(1)}
                </span>
            )}

            {totalReviews !== undefined && (
                <span className={`text-gray-500 ${size === "sm" ? "text-xs" : "text-sm"}`}>
                    ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                </span>
            )}
        </div>
    );
};

export default StarRating;