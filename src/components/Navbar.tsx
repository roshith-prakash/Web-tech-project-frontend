import { useState } from "react";
import { RxCross2, RxHamburgerMenu } from "react-icons/rx";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useDBUser } from "@/context/UserContext";
import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import PrimaryButton from "./reuseit/PrimaryButton";
import SecondaryButton from "./reuseit/SecondaryButton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useAuth } from "@/context/AuthContext";
import { RiAccountPinCircleLine } from "react-icons/ri";
import { CgProfile, CgLogOut } from "react-icons/cg";
import { FaHouse, FaUser } from "react-icons/fa6";
import { PiSignOutFill } from "react-icons/pi";
import { BsChevronDown } from "react-icons/bs";
import Avatar from "./reuseit/Avatar";
import AlertModal from "./reuseit/AlertModal";
import NotificationBell from "./NotificationBell";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const { dbUser } = useDBUser();
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (link: string) => {
    navigate(link);
    setOpen(false);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setIsSignOutModalOpen(false);
        navigate("/");
      })
      .catch((error) => {
        setIsSignOutModalOpen(false);
        console.log(error);
      });
  };

  return (
    <>
      {/* Log Out Modal */}
      <AlertModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
      >
        <div className="flex flex-col gap-y-2">
          {/* Title */}
          <h1 className="dark:text-darkmodetext font-bold text-2xl">
            Are you sure you want to sign out?
          </h1>

          {/* Subtitle */}
          <h2 className="dark:text-darkmodetext mt-1 text-sm text-darkbg/70">
            You will need to log in again to access your account.
          </h2>

          <div className="mt-5 flex gap-x-5 justify-end">
            <PrimaryButton
              className="text-sm"
              onClick={handleLogout}
              text="Log out"
            />
            <SecondaryButton
              className="text-sm"
              onClick={() => setIsSignOutModalOpen(false)}
              text="Cancel"
            />
          </div>
        </div>
      </AlertModal>



      <nav
        className={`dark:bg-darkbg relative z-2 flex items-center justify-between bg-white px-10 py-3 font-body dark:text-white`}
      >
        {/* Logo */}
        <Link to="/" aria-label="Home" className="flex gap-x-2 items-center">
          <img
            src={logo}
            alt="StayFinder"
            className="h-10 cursor-pointer"
          />
        </Link>

        {/* LG screen links */}
        <div className="hidden items-center -translate-x-14 gap-x-8 font-medium lg:flex">
          {/* Home Page */}
          <Link
            to="/"
            className="hover:text-cta dark:hover:text-darkmodeCTA transition-all"
          >
            Home
          </Link>

          {/* Properties Page */}
          <Link
            to="/properties"
            className="hover:text-cta dark:hover:text-darkmodeCTA transition-all"
          >
            Properties
          </Link>

          {dbUser ? (
            <>
              {dbUser.role === "HOST" && (
                <Link
                  to="/property-listing"
                  className="hover:text-cta dark:hover:text-darkmodeCTA transition-all"
                >
                  Add Property
                </Link>
              )}
            </>
          ) : (
            <>
              {/* Signup Dropdown */}
              <Popover>
                <PopoverTrigger className="flex items-center gap-1 hover:text-cta dark:hover:text-darkmodeCTA transition-all cursor-pointer">
                  Sign up
                  <BsChevronDown className="text-sm" />
                </PopoverTrigger>
                <PopoverContent className="dark:bg-darkgrey dark:border-2 w-auto mt-2 py-0 px-1 font-body">
                  <div className="py-1 min-w-48 flex flex-col gap-y-1">
                    <Link
                      to="/signup"
                      className="flex gap-x-3 items-center font-medium text-lg py-3 px-4 rounded hover:bg-slate-50 dark:hover:bg-white/10 w-full transition-all"
                    >
                      <FaUser className="text-blue-600" />
                      <div>
                        <p className="font-semibold">Sign up as Guest</p>
                        <p className="text-xs text-gray-500">Book amazing properties</p>
                      </div>
                    </Link>
                    <hr className="my-1" />
                    <Link
                      to="/signup-host"
                      className="flex gap-x-3 items-center font-medium text-lg py-3 px-4 rounded hover:bg-slate-50 dark:hover:bg-white/10 w-full transition-all"
                    >
                      <FaHouse className="text-green-600" />
                      <div>
                        <p className="font-semibold">Sign up as Host</p>
                        <p className="text-xs text-gray-500">List your property</p>
                      </div>
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>

              <Link
                to="/signin"
                className="hover:text-cta dark:hover:text-darkmodeCTA transition-all"
              >
                Sign in
              </Link>
            </>
          )}

          {dbUser && (
            <button
              onClick={() => setIsSignOutModalOpen(true)}
              className="cursor-pointer hover:text-cta dark:hover:text-darkmodeCTA transition-all"
            >
              Sign out
            </button>
          )}
        </div>

        {/* Theme + Notifications + Popover - Large Screen */}
        <div className="flex items-center gap-x-5">
          {/* Notification Bell */}
          <div className="hidden lg:block">
            <NotificationBell />
          </div>


          <div className="hidden lg:block">
            <Popover>
              <PopoverTrigger className="flex items-center cursor-pointer">
                {dbUser ? (
                  <Avatar
                    border
                    borderClassName="bg-gradient-to-br from-darkmodeCTA via-cta to-hovercta"
                    imageSrc={dbUser?.photoURL}
                    fallBackText={dbUser?.name}
                  />
                ) : (
                  <Avatar />
                )}
              </PopoverTrigger>
              <PopoverContent className="dark:bg-darkgrey dark:border-2 w-auto mt-2 mr-4 py-0 px-1 font-body">
                <div className="py-1 min-w-48 flex flex-col gap-y-1">
                  {/* View Profile */}
                  {dbUser && (
                    <>
                      <Link
                        to="/profile"
                        className={`flex flex-col gap-y-2 font-medium text-cta dark:text-darkmodeCTA  hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:bg-darkgrey hover:text-hovercta dark:hover:text-cta text-lg py-2 px-5 rounded  w-full transition-all`}
                      >
                        <p className="text-center">{dbUser?.name}</p>
                      </Link>

                      <hr />
                    </>
                  )}

                  {/* Edit Profile */}
                  {dbUser && (
                    <>
                      <NavLink
                        to="/edit-profile"
                        className={({ isActive }) =>
                          `flex gap-x-5 items-center font-medium text-lg py-2 px-5 rounded hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:bg-darkgrey w-full transition-all ${isActive && "bg-slate-100 dark:bg-white/20"
                          }`
                        }
                      >
                        <CgProfile className="text-xl" />
                        Edit Profile
                      </NavLink>
                      <hr />
                    </>
                  )}

                  {/* Onboarding */}
                  {currentUser && !dbUser && (
                    <>
                      <NavLink
                        to="/onboarding"
                        className={({ isActive }) =>
                          `flex gap-x-5 items-center font-medium bg-purple-100 text-black dark:bg-darkgrey text-lg py-2 px-5 rounded w-full transition-all ${isActive && "bg-slate-100 dark:bg-white/20"
                          }`
                        }
                      >
                        <RiAccountPinCircleLine className="text-xl animate-pulse" />
                        <p className="animate-pulse">Profile</p>
                      </NavLink>
                      <hr />
                    </>
                  )}

                  {/* Log Out */}
                  {currentUser && (
                    <button
                      onClick={() => setIsSignOutModalOpen(true)}
                      className="cursor-pointer flex gap-x-5 items-center font-medium text-lg py-2 px-5 rounded hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:bg-darkgrey w-full transition-all"
                    >
                      <PiSignOutFill className="text-xl" />
                      Sign out
                    </button>
                  )}

                  {/* Sign up */}
                  {!currentUser && (
                    <>
                      <div className="px-2 py-1">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Join StayFinder</p>
                        <Link
                          to="/signup"
                          className="flex gap-x-3 items-center font-medium text-sm py-2 px-3 rounded hover:bg-slate-50 dark:hover:bg-white/10 w-full transition-all mb-2"
                        >
                          <FaUser className="text-blue-600" />
                          <div>
                            <p className="font-semibold">Sign up as Guest</p>
                            <p className="text-xs text-gray-500">Book amazing properties</p>
                          </div>
                        </Link>
                        <Link
                          to="/signup-host"
                          className="flex gap-x-3 items-center font-medium text-sm py-2 px-3 rounded hover:bg-slate-50 dark:hover:bg-white/10 w-full transition-all"
                        >
                          <FaHouse className="text-green-600" />
                          <div>
                            <p className="font-semibold">Sign up as Host</p>
                            <p className="text-xs text-gray-500">List your property</p>
                          </div>
                        </Link>
                      </div>
                      <hr />
                    </>
                  )}

                  {/* Log in */}
                  {!currentUser && (
                    <Link
                      to="/signin"
                      className="flex gap-x-5 items-center font-medium text-lg py-2 px-5 rounded hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:bg-darkgrey w-full transition-all"
                    >
                      <CgLogOut className="text-xl rotate-180" />
                      Sign in
                    </Link>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Open Drawer */}
        <div className="flex items-center gap-x-4 font-medium lg:hidden">
          {/* Notification Bell */}
          <NotificationBell />



          {/* Pop over component */}
          <Popover>
            <PopoverTrigger className="flex items-center cursor-pointer">
              {dbUser ? (
                <Avatar
                  border
                  borderClassName="bg-gradient-to-br  from-[#ec8cff] to-cta"
                  imageSrc={dbUser?.photoURL}
                  fallBackText={dbUser?.name}
                />
              ) : (
                <Avatar />
              )}
            </PopoverTrigger>
            <PopoverContent className="dark:bg-darkgrey dark:border-2 w-auto mt-2 mr-4 py-0 px-1 font-body">
              <div className="py-1 min-w-48 flex flex-col gap-y-1">
                {/* View Profile */}
                {dbUser && (
                  <>
                    <Link
                      to="/profile"
                      className={`flex flex-col gap-y-2 font-medium text-cta dark:text-darkmodeCTA  hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:bg-darkgrey hover:text-hovercta dark:hover:text-cta text-lg py-2 px-5 rounded  w-full transition-all`}
                    >
                      <p className="text-center">{dbUser?.name}</p>
                    </Link>

                    <hr />
                  </>
                )}

                {/* Edit Profile */}
                {dbUser && (
                  <>
                    <NavLink
                      to="/edit-profile"
                      className={({ isActive }) =>
                        `flex gap-x-5 items-center font-medium text-lg py-2 px-5 rounded hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:bg-darkgrey w-full transition-all ${isActive && "bg-slate-100 dark:bg-white/20"
                        }`
                      }
                    >
                      <CgProfile className="text-xl" />
                      Edit Profile
                    </NavLink>
                    <hr />
                  </>
                )}

                {/* Onboarding */}
                {currentUser && !dbUser && (
                  <>
                    <NavLink
                      to="/onboarding"
                      className={({ isActive }) =>
                        `flex gap-x-5 items-center font-medium bg-purple-100 text-black dark:bg-darkgrey text-lg py-2 px-5 rounded w-full transition-all ${isActive && "bg-slate-100 dark:bg-white/20"
                        }`
                      }
                    >
                      <RiAccountPinCircleLine className="text-xl animate-pulse" />
                      <p className="animate-pulse">Profile</p>
                    </NavLink>
                    <hr />
                  </>
                )}

                {/* Log Out */}
                {currentUser && (
                  <NavLink
                    to="/signout"
                    className="cursor-pointer flex gap-x-5 items-center font-medium text-lg py-2 px-5 rounded hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:bg-darkgrey w-full transition-all"
                  >
                    <PiSignOutFill className="text-xl" />
                    Sign out
                  </NavLink>
                )}

                {/* Sign up */}
                {!currentUser && (
                  <>
                    <div className="px-2 py-1">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Join StayFinder</p>
                      <NavLink
                        to="/signup"
                        className={({ isActive }) =>
                          `flex gap-x-3 items-center font-medium text-sm py-2 px-3 rounded hover:bg-slate-50 dark:hover:bg-white/10 w-full transition-all mb-2 ${isActive && "bg-slate-100 dark:bg-white/20"
                          }`
                        }
                      >
                        <FaUser className="text-blue-600" />
                        <div>
                          <p className="font-semibold">Sign up as Guest</p>
                          <p className="text-xs text-gray-500">Book amazing properties</p>
                        </div>
                      </NavLink>
                      <NavLink
                        to="/signup-host"
                        className={({ isActive }) =>
                          `flex gap-x-3 items-center font-medium text-sm py-2 px-3 rounded hover:bg-slate-50 dark:hover:bg-white/10 w-full transition-all ${isActive && "bg-slate-100 dark:bg-white/20"
                          }`
                        }
                      >
                        <FaHouse className="text-green-600" />
                        <div>
                          <p className="font-semibold">Sign up as Host</p>
                          <p className="text-xs text-gray-500">List your property</p>
                        </div>
                      </NavLink>
                    </div>
                    <hr />
                  </>
                )}

                {/* Log in */}
                {!currentUser && (
                  <NavLink
                    to="/signin"
                    className={({ isActive }) =>
                      `flex gap-x-5 items-center font-medium text-lg py-2 px-5 rounded hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:bg-darkgrey w-full transition-all ${isActive && "bg-slate-100 dark:bg-white/20"
                      }`
                    }
                  >
                    <CgLogOut className="text-xl rotate-180" />
                    Sign in
                  </NavLink>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Hamburger Button to open the drawer */}
          <button onClick={() => setOpen(true)} className="cursor-pointer">
            <RxHamburgerMenu className="text-xl" aria-label="Open menu" />
          </button>
        </div>

        {/* Drawer Menu */}
        <div
          className={`dark:bg-darkbg scroller fixed top-0 right-0 z-50 h-screen w-full overflow-y-auto bg-white pb-6 text-center text-xl shadow-md md:text-lg font-body ${open ? "translate-x-0" : "translate-x-[100%]"
            } transition-all duration-500`}
          role="dialog"
          aria-modal="true"
          aria-label="Drawer Menu"
        >
          <div className="mb-14 h-14 flex items-center justify-between px-10 pt-4.5 lg:px-10">
            <button
              className="cursor-pointer flex gap-x-2 items-center"
              onClick={() => handleSearch("/")}
              aria-label="Home"
            >
              <img
                src={logo}
                alt="StayFinder"
                className="h-10 cursor-pointer"
              />
            </button>
            <RxCross2
              onClick={() => setOpen(false)}
              className="hover:text-cta dark:hover:text-darkmodeCTA cursor-pointer text-2xl transition-all"
              aria-label="Close menu"
            />
          </div>

          <div className="mt-20 flex flex-col items-center justify-between gap-y-12 px-8 text-xl font-medium">
            {/*  Add your links here */}
            <button
              onClick={() => handleSearch("/")}
              className="hover:text-cta w-fit cursor-pointer transition-all"
              tabIndex={0}
              aria-label="Go to Home"
            >
              Home
            </button>

            <button
              onClick={() => handleSearch("/properties")}
              className="hover:text-cta w-fit cursor-pointer transition-all"
              tabIndex={0}
              aria-label="Browse Properties"
            >
              Properties
            </button>

            {dbUser && (
              <button
                onClick={() => handleSearch("/notifications")}
                className="hover:text-cta w-fit cursor-pointer transition-all"
                tabIndex={0}
                aria-label="Notifications"
              >
                Notifications
              </button>
            )}

            {dbUser?.role === "HOST" && (
              <button
                onClick={() => handleSearch("/property-listing")}
                className="hover:text-cta w-fit cursor-pointer transition-all"
                tabIndex={0}
                aria-label="Add Property"
              >
                Add Property
              </button>
            )}

            {!dbUser && (
              <>
                <div className="flex flex-col gap-y-4 items-center">
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">Join StayFinder</p>

                  <button
                    onClick={() => handleSearch("/signup")}
                    className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all w-64"
                    tabIndex={0}
                    aria-label="Sign up as Guest"
                  >
                    <FaUser className="text-2xl text-blue-600" />
                    <div className="text-center">
                      <p className="font-semibold">Sign up as Guest</p>
                      <p className="text-sm text-gray-500">Book amazing properties</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSearch("/signup-host")}
                    className="flex flex-col items-center gap-2 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all w-64"
                    tabIndex={0}
                    aria-label="Sign up as Host"
                  >
                    <FaHouse className="text-2xl text-green-600" />
                    <div className="text-center">
                      <p className="font-semibold">Sign up as Host</p>
                      <p className="text-sm text-gray-500">List your property</p>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => handleSearch("/signin")}
                  className="hover:text-cta w-fit cursor-pointer transition-all"
                  tabIndex={0}
                  aria-label="Sign in"
                >
                  Sign in
                </button>
              </>
            )}

            {dbUser && (
              <button
                onClick={() => handleSearch("/signout")}
                className="hover:text-cta w-fit cursor-pointer transition-all"
                tabIndex={0}
                aria-label="Sign out"
              >
                Sign out
              </button>
            )}
          </div>

          {/* Footer Text   */}
          <div className="absolute bottom-24 left-1/2 w-full -translate-x-1/2 pl-1 text-sm lg:bottom-10"></div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
