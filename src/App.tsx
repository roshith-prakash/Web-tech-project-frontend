import { Footer, Navbar, Protector } from "./components";
import {
  AuthAction,
  ForgotPassword,
  Landing,
  Login,
  Onboarding,
  Signout,
  Signup,
  AllProperties,
  PropertyDetail,
  PayForBooking,
  MyRefunds,
} from "./pages";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SignupHost from "./pages/SignupHost";
import { Toaster } from "react-hot-toast";
import PropertyListing from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import BookProperty from "./pages/BookProperty";
import ContactSupport from "./pages/ContactSupport";
import Help from "./pages/Help";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="font-body min-h-screen flex flex-col justify-between">
      <BrowserRouter>
        <Toaster />
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public routes - no authentication required */}
            <Route path="/" element={<Landing />} />
            <Route path="/properties" element={<AllProperties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/help" element={<Help />} />

            {/* Auth routes - no authentication required */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/signup-host" element={<SignupHost />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/signout" element={<Signout />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth-action" element={<AuthAction />} />

            {/* Protected routes - any authenticated user */}
            <Route path="/profile" element={<Protector><Profile /></Protector>} />
            <Route path="/edit-profile" element={<Protector><EditProfile /></Protector>} />
            <Route path="/notifications" element={<Protector><Notifications /></Protector>} />
            <Route path="/contact-support" element={<Protector><ContactSupport /></Protector>} />
            <Route path="/my-refunds" element={<Protector><MyRefunds /></Protector>} />

            {/* Host-only routes */}
            <Route path="/property-listing" element={<Protector requiredRole="HOST"><PropertyListing /></Protector>} />
            <Route path="/property/:id/edit" element={<Protector requiredRole="HOST"><EditProperty /></Protector>} />

            {/* Guest-only routes */}
            <Route path="/property/:id/book" element={<Protector requiredRole="GUEST"><BookProperty /></Protector>} />
            <Route path="/booking/:bookingId/pay" element={<Protector requiredRole="GUEST"><PayForBooking /></Protector>} />

            {/* 404 - Catch all unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
