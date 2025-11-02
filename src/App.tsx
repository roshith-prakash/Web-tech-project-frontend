import { Footer, Navbar } from "./components";
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
} from "./pages";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SignupHost from "./pages/SignupHost";
import { Toaster } from "react-hot-toast";
import PropertyListing from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import BookProperty from "./pages/BookProperty";

function App() {
  return (
    <div className="font-body min-h-screen flex flex-col justify-between">
      <BrowserRouter>
        <Toaster />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/signup-host" element={<SignupHost />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/signout" element={<Signout />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth-action" element={<AuthAction />} />

            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />

            <Route path="/property-listing" element={<PropertyListing />} />
            <Route path="/properties" element={<AllProperties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/property/:id/edit" element={<EditProperty />} />
            <Route path="/property/:id/book" element={<BookProperty />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
