import { useState } from "react";
import { axiosInstance } from "@/utils/axiosInstance";
import { PrimaryButton } from "@/components";
import toast from "react-hot-toast";

interface RazorpayPaymentProps {
    bookingId: string;
    amount: number;
    currency?: string;
    propertyTitle: string;
    onSuccess: () => void;
    onFailure: () => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const RazorpayPayment = ({
    bookingId,
    amount,
    currency = "INR",
    propertyTitle,
    onSuccess,
    onFailure,
}: RazorpayPaymentProps) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error("Failed to load payment gateway");
                setIsProcessing(false);
                return;
            }

            // Create payment order
            const orderResponse = await axiosInstance.post("/guest/create-payment-order", {
                amount,
                currency,
                bookingId,
            });

            const { orderId, key } = orderResponse.data;

            // Razorpay options
            const options = {
                key,
                amount: amount * 100, // Convert to paise
                currency,
                name: "StayFinder",
                description: `Payment for ${propertyTitle}`,
                order_id: orderId,
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "Pay with UPI",
                                instruments: [
                                    {
                                        method: "upi",
                                    },
                                ],
                            },
                            wallet: {
                                name: "Pay with Wallet",
                                instruments: [
                                    {
                                        method: "wallet",
                                    },
                                ],
                            },
                        },
                        sequence: ["block.upi", "block.wallet"],
                        preferences: {
                            show_default_blocks: false,
                        },
                    },
                },
                handler: async (response: any) => {
                    try {
                        // Verify payment
                        await axiosInstance.post("/guest/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId,
                        });

                        toast.success("Payment successful! Booking confirmed.");
                        onSuccess();
                    } catch (error) {
                        console.error("Payment verification failed:", error);
                        toast.error("Payment verification failed");
                        onFailure();
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: "Guest User",
                    email: "guest@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#3B82F6",
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        toast.error("Payment cancelled");
                        onFailure();
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error("Payment initiation failed:", error);
            toast.error(error.response?.data?.error || "Payment failed");

            // Record payment failure
            try {
                await axiosInstance.post("/guest/payment-failure", {
                    bookingId,
                    error: error.message,
                });
            } catch (failureError) {
                console.error("Failed to record payment failure:", failureError);
            }

            onFailure();
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm text-blue-700">
                    <p>Property: {propertyTitle}</p>
                    <p>Amount: {currency} {amount.toFixed(2)}</p>
                    <p>Booking ID: {bookingId.slice(-8)}</p>
                </div>
            </div>

            <PrimaryButton
                text={isProcessing ? "Processing Payment..." : `Pay ${currency} ${amount.toFixed(2)}`}
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-3 text-lg"
            />

            <div className="text-xs text-gray-500 text-center">
                <p>🔒 Secure payment powered by Razorpay</p>
            </div>
        </div>
    );
};

export default RazorpayPayment;