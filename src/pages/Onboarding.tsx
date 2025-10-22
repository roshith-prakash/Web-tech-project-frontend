/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDBUser } from "@/context/UserContext";
import {
  PrimaryButton,
  ErrorStatement,
  Input,
  SecondaryButton,
} from "@/components";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { sendEmailVerification, signOut, type User } from "firebase/auth";
import { toast } from "react-hot-toast";
import { auth } from "../firebase/firebase";
import { IoCloudUploadOutline } from "react-icons/io5";
import { axiosInstance } from "@/utils/axiosInstance";
import { MdOutlineAccountCircle } from "react-icons/md";

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dbUser, fetchUser } = useDBUser();
  const { currentUser } = useAuth();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | string>("");
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState({
    name: 0,
    api: "",
  });

  const intendedRole = location.state?.role?.toUpperCase() as
    | "HOST"
    | "GUEST"
    | null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Onboarding | StayFinder";
  }, []);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser?.displayName ? currentUser?.displayName : "");
      setImage(currentUser?.photoURL ? currentUser?.photoURL : "");
    }
  }, [currentUser]);

  // Check for role conflicts
  useEffect(() => {
    if (dbUser && intendedRole) {
      if (dbUser.role !== intendedRole) {
        const errorMessage =
          dbUser.role === "HOST"
            ? "You are already registered as a Host. Please sign in as a Host."
            : "You are already registered as a Guest. Please sign in as a Guest.";
        toast.error(
          <div>
            {errorMessage}{" "}
            <Link
              to={dbUser.role === "HOST" ? "/signin" : "/signin"}
              className="underline text-blue-600"
            >
              Sign in as a {dbUser.role.toLowerCase()}
            </Link>
            .
          </div>
        );
        signOut(auth)
          .then(() => {
            navigate(dbUser.role === "HOST" ? "/signin" : "/signin");
          })
          .catch((error) => {
            console.error("Logout error:", error);
            toast.error("Failed to log out. Please try again.");
          });
      } else {
        navigate("/"); // User already exists with correct role
      }
    }
  }, [dbUser, intendedRole, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (fileRef.current) {
      setImage(e.target.files?.[0] || "");
      // @ts-expect-error File input value is read-only, but setting to null clears the selection
      fileRef.current.value = null;
    }
  };

  const sendVerification = () => {
    const user = auth.currentUser;
    sendEmailVerification(user as User)
      .then(() => {
        toast("Email Verification Link sent.");
      })
      .catch(() => {
        toast.error("Something went wrong.");
      });
  };

  const handleSubmit = async () => {
    setError({
      name: 0,
      api: "",
    });

    if (!intendedRole) {
      setError((prev) => ({
        ...prev,
        api: "Invalid role. Please sign up again.",
      }));
      return;
    }

    if (name == null || name == undefined || name.length <= 0) {
      setError((prev) => ({ ...prev, name: 1 }));
      return;
    } else if (name.length > 30) {
      setError((prev) => ({ ...prev, name: 2 }));
      return;
    }

    setDisabled(true);

    const formData = new FormData();
    if (typeof image !== "string") {
      formData.append("file", image);
    }

    const obj = {
      uid: currentUser?.uid,
      email: currentUser?.email,
      name: name,
      image: typeof image === "string" ? image : null,
    };

    formData.append("user", JSON.stringify(obj));

    const endpoint =
      intendedRole === "HOST" ? "/user/create-host" : "/user/create-guest";

    try {
      await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchUser();
      navigate("/");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      if (
        errorMessage?.includes("User is already registered as a Host") ||
        errorMessage?.includes("User is already registered as a Guest")
      ) {
        setError((prev) => ({ ...prev, api: errorMessage }));
        toast.error(
          <div>
            {errorMessage}{" "}
            <Link
              to={errorMessage.includes("Host") ? "/signin" : "/signin"}
              className="underline text-blue-600"
            >
              Sign in as a {errorMessage.includes("Host") ? "Host" : "Guest"}
            </Link>
            .
          </div>
        );
        await signOut(auth);
        navigate(errorMessage.includes("Host") ? "/signin" : "/signin");
      } else {
        setError((prev) => ({ ...prev, api: "Something went wrong!" }));
      }
    } finally {
      setDisabled(false);
    }
  };

  if (!currentUser) {
    return (
      <div>
        <div className="min-h-[70vh] md:min-h-[65vh] dark:bg-darkbg dark:text-darkmodetext lg:min-h-[60vh] flex items-center justify-center pt-12 pb-32">
          <div>
            <p className="text-3xl lg:text-4xl px-5 text-center mt-14">
              You have not signed in!
            </p>
            <div className="mt-10 flex flex-col gap-10 justify-center items-center">
              <img
                src={
                  "https://res.cloudinary.com/do8rpl9l4/image/upload/v1736738810/notfound_eqfykw.svg"
                }
                className="max-w-[50%] lg:max-w-[40%] pointer-events-none"
              />
              <div>
                <SecondaryButton
                  onClick={() =>
                    navigate(
                      intendedRole === "HOST" ? "/signup-host" : "/signup"
                    )
                  }
                  text="Sign up"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser?.emailVerified) {
    return (
      <div>
        <div className="min-h-[70vh] md:min-h-[65vh] dark:bg-darkbg dark:text-darkmodetext lg:min-h-[60vh] flex items-center justify-center pt-12 pb-32">
          <div>
            <p className="text-3xl lg:text-4xl px-5 text-center mt-14">
              Verify Email by clicking link in your mailbox!
            </p>
            <div className="mt-10 flex flex-col gap-10 justify-center items-center">
              <img
                src={
                  "https://res.cloudinary.com/do8rpl9l4/image/upload/v1736738810/notfound_eqfykw.svg"
                }
                className="max-w-[50%] lg:max-w-[40%] pointer-events-none"
              />
              <div>
                <SecondaryButton
                  onClick={sendVerification}
                  text="Resend Verification Link"
                />
              </div>
              <div>
                <SecondaryButton
                  className="w-full"
                  onClick={() => window.location.reload()}
                  text={
                    <div className="flex flex-col px-8">
                      <p>Already verified?</p>
                      <p>Reload the page</p>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dbUser && dbUser.role === intendedRole) {
    return (
      <div>
        <div className="min-h-[70vh] dark:bg-darkbg dark:text-darkmodetext md:min-h-[65vh] lg:min-h-[60vh] flex items-center justify-center pt-12 pb-32">
          <div>
            <p className="text-3xl lg:text-4xl px-5 text-center mt-14">
              You have already created your profile!
            </p>
            <div className="mt-10 flex flex-col gap-10 justify-center items-center">
              <img
                src={
                  "https://res.cloudinary.com/do8rpl9l4/image/upload/v1736738810/notfound_eqfykw.svg"
                }
                className="max-w-[50%] lg:max-w-[40%] pointer-events-none"
              />
              <div>
                <SecondaryButton
                  onClick={() => navigate("/")}
                  text="Go Back Home"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!intendedRole) {
    return (
      <div>
        <div className="min-h-[70vh] dark:bg-darkbg dark:text-darkmodetext md:min-h-[65vh] lg:min-h-[60vh] flex items-center justify-center pt-12 pb-32">
          <div>
            <p className="text-3xl lg:text-4xl px-5 text-center mt-14">
              Invalid onboarding request!
            </p>
            <div className="mt-10 flex flex-col gap-10 justify-center items-center">
              <img
                src={
                  "https://res.cloudinary.com/do8rpl9l4/image/upload/v1736738810/notfound_eqfykw.svg"
                }
                className="max-w-[50%] lg:max-w-[40%] pointer-events-none"
              />
              <div>
                <SecondaryButton
                  onClick={() => navigate("/signup")}
                  text="Go to Signup"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-[70vh] md:min-h-[65vh] lg:min-h-[60vh] flex items-center justify-center pt-12 pb-20">
        <div className="bg-white dark:bg-secondarydarkbg w-full dark:bg-darkgrey dark:text-darkmodetext border-[1px] max-w-[95%] md:max-w-3xl md:mt-5 lg:mt-5 p-5 md:px-20 shadow-xl rounded-xl pb-10">
          <h1 className="dark:text-darkmodetext pt-5 font-bold text-2xl text-center">
            Let's get to know you
          </h1>
          <h2 className="dark:text-darkmodetext mt-1 text-sm text-darkbg/70 text-center">
            Tell us your name to get started as a {intendedRole.toLowerCase()}.
          </h2>
          <div className="mt-10 flex flex-col items-center gap-y-5">
            <input
              className="hidden"
              type="file"
              ref={fileRef}
              accept="image/jpg, image/jpeg, image/png"
              onChange={handleFileChange}
            />
            <div className="flex justify-center">
              {image ? (
                <img
                  src={
                    typeof image === "string"
                      ? image
                      : URL.createObjectURL(image)
                  }
                  className="h-24 w-24 rounded-full"
                />
              ) : (
                <MdOutlineAccountCircle className="text-[8rem]" />
              )}
            </div>
            <button
              onClick={() => {
                if (fileRef?.current) fileRef.current.click();
              }}
              className="cursor-pointer hover:bg-hovercta dark:hover:bg-cta hover:border-hovercta hover:text-white dark:hover:border-cta border-darkbg/25 dark:border-white/25 border-1 flex gap-x-2 py-2 justify-center items-center px-14 shadow rounded-lg font-medium active:shadow transition-all disabled:text-greyText"
            >
              Upload <IoCloudUploadOutline className="translate-y-0.5" />
            </button>
          </div>
          <div className="mt-14 flex flex-col gap-y-8 lg:gap-x-5">
            <div className="lg:flex-1 px-2">
              <p className="font-medium">Name</p>
              <Input
                value={name}
                className="focus:border-darkbg dark:focus:border-white transition-all"
                onChange={(e) => {
                  setName(e.target.value);
                  if (
                    e.target.value != null &&
                    e.target.value != undefined &&
                    e.target.value.length > 0 &&
                    e.target.value.length < 30
                  ) {
                    setError((prev) => ({ ...prev, name: 0, api: "" }));
                  }
                }}
                onBlur={() => {
                  if (name == null || name == undefined || name.length <= 0) {
                    setError((prev) => ({ ...prev, name: 1 }));
                    return;
                  } else if (name.length > 30) {
                    setError((prev) => ({ ...prev, name: 2 }));
                    return;
                  } else {
                    setError((prev) => ({ ...prev, name: 0 }));
                  }
                }}
                placeholder={"Enter your name"}
              />
              <ErrorStatement
                isOpen={error.name == 1}
                text={"Please enter your name."}
              />
              <ErrorStatement
                isOpen={error.name == 2}
                text={"Name cannot exceed 30 characters."}
              />
              <ErrorStatement isOpen={!!error.api} text={error.api} />
            </div>
          </div>
          <div className="mt-10 flex justify-center items-center">
            <PrimaryButton
              className="w-full max-w-md"
              onClick={handleSubmit}
              disabled={disabled}
              disabledText={"Please Wait..."}
              text={"Submit"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
