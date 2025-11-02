/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrimaryButton, SecondaryButton, HostProperties, UserBookings } from "../components";
import { useDBUser } from "../context/UserContext";
import { BsFillTrash3Fill, BsPen } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { TfiWrite } from "react-icons/tfi";
import { axiosInstance } from "../utils/axiosInstance";
import { auth } from "../firebase/firebase";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import AlertModal from "@/components/reuseit/AlertModal";
import Avatar from "@/components/reuseit/Avatar";

const Profile = () => {
  const navigate = useNavigate();
  const { dbUser, setDbUser } = useDBUser();
  const [disabled, setDisabled] = useState(false);
  const [tabValue, setTabValue] = useState("properties");
  const [isDeleteProfileModalOpen, setIsDeleteProfileModalOpen] =
    useState(false);

  // Set window title.
  useEffect(() => {
    document.title = `${dbUser?.name} | StayFinder`;
  }, [dbUser]);

  // Set initial tab based on user role
  useEffect(() => {
    if (dbUser?.role === "HOST") {
      setTabValue("properties");
    } else {
      setTabValue("bookings");
    }
  }, [dbUser?.role]);

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Delete the user
  const deleteUser = () => {
    setDisabled(true);
    const user = auth.currentUser;

    user
      ?.delete()
      ?.then(() => {
        axiosInstance
          .post("/user/delete-user", { userId: dbUser?.id })
          .then(() => {
            toast.success("User Deleted.");
            setDbUser(null);
            setDisabled(false);
            setIsDeleteProfileModalOpen(false);
            navigate("/");
          })
          .catch((err) => {
            setDisabled(false);
            setIsDeleteProfileModalOpen(false);
            console.log(err);
            toast.error("Something went wrong.");
          });
      })
      .catch((error) => {
        setDisabled(false);
        console.log(error);
        setIsDeleteProfileModalOpen(false);
        const errorMessage = error?.message;
        if (String(errorMessage).includes("auth/requires-recent-login")) {
          toast.error("Please login again before deleting your account.");
        } else {
          toast.error("Something went wrong.");
        }
      });
  };

  return (
    <>
      {/* Delete Account Modal */}
      <AlertModal
        isOpen={isDeleteProfileModalOpen}
        className="max-w-xl"
        onClose={() => setIsDeleteProfileModalOpen(false)}
      >
        <div className="flex flex-col gap-y-2">
          {/* Title */}
          <h1 className="dark:text-darkmodetext font-bold text-2xl">
            Are you sure you want to delete your account?
          </h1>

          {/* Subtitle */}
          <h2 className="dark:text-darkmodetext mt-1 text-sm text-darkbg/70">
            This action cannot be reversed.
          </h2>

          {/* Buttons */}
          <div className="mt-5 flex gap-x-5 justify-end">
            <PrimaryButton
              className="text-sm bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600"
              onClick={deleteUser}
              disabled={disabled}
              disabledText="Please Wait..."
              text="Delete"
            />
            <SecondaryButton
              className="text-sm"
              disabled={disabled}
              disabledText="Please Wait..."
              onClick={() => setIsDeleteProfileModalOpen(false)}
              text="Cancel"
            />
          </div>
        </div>
      </AlertModal>

      {/* Main */}
      <div className="lg:min-h-screen bg-bgwhite dark:bg-darkbg dark:text-darkmodetext w-full pb-20">
        {/* Background color div */}
        <div className="bg-secondarydarkbg dark:bg-darkgrey border-b-4 border-black h-48 dark:border-white/10"></div>

        {/* Profile Info Div */}
        <div className="bg-white dark:bg-secondarydarkbg dark:border-white/25 shadow-xl -translate-y-14 border-2 min-h-52 pt-20 pb-10 rounded-lg mx-5 md:mx-10 lg:mx-20">
          {/* Floating Image */}
          <div className="absolute w-full -top-16 flex justify-center">
            <div>
              <Avatar
                className="h-34 w-34 !text-5xl border-secondarydarkbg border-10"
                imageSrc={dbUser?.photoURL}
                fallBackText={dbUser?.name}
              />
            </div>
          </div>

          {/* Edit & delete icon on small screen */}
          <div className="lg:hidden absolute flex gap-x-4 right-6 top-5">
            <BsPen
              className="text-xl hover:text-cta dark:hover:text-darkmodeCTA transition-all cursor-pointer"
              onClick={() => navigate("/edit-profile")}
            />
            <button
              onClick={() => setIsDeleteProfileModalOpen(true)}
              className="text-xl  cursor-pointer"
            >
              <BsFillTrash3Fill className=" cursor-pointer text-red-500" />
            </button>
          </div>

          {/* Edit & delete button on large screen */}
          <div className="hidden absolute lg:flex gap-x-4 right-6 top-5">
            <SecondaryButton
              text={
                <div className="flex items-center gap-x-2">
                  <BsPen />
                  <p>Edit</p>
                </div>
              }
              className="border-transparent dark:hover:!text-cta shadow-md"
              onClick={() => navigate("/edit-profile")}
            />
            <SecondaryButton
              text={
                <div className="flex justify-center items-center  gap-x-2">
                  <BsFillTrash3Fill className=" cursor-pointer " />
                  Delete
                </div>
              }
              onClick={() => setIsDeleteProfileModalOpen(true)}
              className="border-transparent dark:!border-2 shadow-md hover:bg-red-600 text-red-600 dark:text-white hover:!text-white dark:hover:!text-red-600"
            />
          </div>

          {/* Name */}
          <div className="px-2 pt-3">
            {/* Name of the user */}
            <p className="text-center text-3xl font-bold">{dbUser?.name}</p>
          </div>

          {/* Separator */}
          <hr className="my-5 mx-2 dark:border-white/25" />

          {/* Day of joining */}
          <div className="mt-5 text-greyText flex justify-center items-center gap-x-2">
            <TfiWrite /> Became a StayFinder on{" "}
            {dayjs(new Date(dbUser?.createdAt)).format("MMM DD, YYYY")}.
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex">
          {dbUser?.role === "HOST" ? (
            <>
              {/* Properties Tab Button */}
              <button
                onClick={() => setTabValue("properties")}
                className={`flex-1 py-3 cursor-pointer transition-all duration-300 border-b-4 ${tabValue == "properties" &&
                  "text-cta border-cta dark:text-white dark:border-darkmodeCTA"
                  }`}
              >
                My Properties
              </button>
              {/* Bookings Tab Button */}
              <button
                onClick={() => setTabValue("bookings")}
                className={`flex-1 py-3 cursor-pointer transition-all duration-300 border-b-4  ${tabValue == "bookings" &&
                  "text-cta border-cta dark:text-white dark:border-darkmodeCTA"
                  }`}
              >
                Bookings Received
              </button>
            </>
          ) : (
            <>
              {/* My Bookings Tab Button */}
              <button
                onClick={() => setTabValue("bookings")}
                className={`flex-1 py-3 cursor-pointer transition-all duration-300 border-b-4 ${tabValue == "bookings" &&
                  "text-cta border-cta dark:text-white dark:border-darkmodeCTA"
                  }`}
              >
                My Bookings
              </button>
              {/* Favorites Tab Button */}
              <button
                onClick={() => setTabValue("favorites")}
                className={`flex-1 py-3 cursor-pointer transition-all duration-300 border-b-4  ${tabValue == "favorites" &&
                  "text-cta border-cta dark:text-white dark:border-darkmodeCTA"
                  }`}
              >
                Favorites
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {dbUser?.role === "HOST" && tabValue === "properties" && (
            <HostProperties />
          )}

          {tabValue === "bookings" && (
            <>
              {dbUser?.role === "HOST" ? (
                <div className="text-center py-16">
                  <div className="mb-4">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L16 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No bookings received yet
                  </h3>
                  <p className="text-gray-500">
                    Bookings from guests will appear here
                  </p>
                </div>
              ) : (
                <UserBookings />
              )}
            </>
          )}

          {dbUser?.role === "GUEST" && tabValue === "favorites" && (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-500">
                Properties you favorite will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
