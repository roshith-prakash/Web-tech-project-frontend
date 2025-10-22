/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  ErrorStatement,
  Input,
  PasswordInput,
  PrimaryButton,
} from "@/components";
import { auth } from "@/firebase/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { isValidEmail, isValidPassword } from "@/functions/regexFunctions";
import toast from "react-hot-toast";
import { axiosInstance } from "@/utils/axiosInstance";
import { FaGoogle } from "react-icons/fa6";
import { useDBUser } from "@/context/UserContext";

const provider = new GoogleAuthProvider();

const Login = () => {
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    email: 0,
    pw: 0,
    api: "",
  });

  const { dbUser } = useDBUser();

  // Check for existing user and redirect to home if logged in
  useEffect(() => {
    if (dbUser) {
      navigate("/");
    }
  }, [dbUser, navigate]);

  // Scroll to top of page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Set window title
  useEffect(() => {
    document.title = "Sign in | StayFinder";
  }, []);

  // Login using email and password
  const handleLogin = async () => {
    setError({
      email: 0,
      pw: 0,
      api: "",
    });

    // Check if email has been entered
    if (email == null || email == undefined || email.length == 0) {
      setError((prev) => ({ ...prev, email: 1 }));
      return;
    }
    // Check if email is a valid email
    else if (!isValidEmail(email)) {
      setError((prev) => ({ ...prev, email: 2 }));
      return;
    }
    // Check if password has been entered
    else if (
      password == null ||
      password == undefined ||
      password.length == 0
    ) {
      setError((prev) => ({ ...prev, pw: 1 }));
      return;
    }
    // Check if password is a valid password
    else if (!isValidPassword(password)) {
      setError((prev) => ({ ...prev, pw: 2 }));
      return;
    }

    // Disable buttons
    setDisabled(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if user exists in DB
      try {
        const response = await axiosInstance.post("/user/get-current-user", {
          user,
        });
        if (response?.data?.user) {
          navigate("/"); // User exists, redirect to home
        } else {
          // User authenticated in Firebase but not in DB
          await signOut(auth);
          toast.error(
            "You have not signed up yet. Please sign up as a Guest or Host."
          );
          setError((prev) => ({
            ...prev,
            api: "You have not signed up yet. Please sign up as a Guest or Host.",
          }));
        }
      } catch (err: any) {
        console.log(err);
        await signOut(auth);
        toast.error(
          "You have not signed up yet. Please sign up as a Guest or Host."
        );
        setError((prev) => ({
          ...prev,
          api: "You have not signed up yet. Please sign up as a Guest or Host.",
        }));
      }
    } catch (error: any) {
      const errorMessage = error.message;
      console.log(errorMessage);
      setError((prev) => ({
        ...prev,
        api: String(errorMessage).includes("(auth/invalid-credential)")
          ? "Invalid Credentials."
          : "Something went wrong.",
      }));
    } finally {
      setDisabled(false);
    }
  };

  // Login using Google
  const handleGoogleLogin = async () => {
    setDisabled(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in DB
      try {
        const response = await axiosInstance.post("/user/get-current-user", {
          user,
        });
        if (response?.data?.user) {
          navigate("/"); // User exists, redirect to home
        } else {
          // User authenticated in Firebase but not in DB
          await signOut(auth);
          toast.error(
            "You have not signed up yet. Please sign up as a Guest or Host."
          );
          setError((prev) => ({
            ...prev,
            api: "You have not signed up yet. Please sign up as a Guest or Host.",
          }));
        }
      } catch (err: any) {
        console.log(err);
        await signOut(auth);
        toast.error(
          "You have not signed up yet. Please sign up as a Guest or Host."
        );
        setError((prev) => ({
          ...prev,
          api: "You have not signed up yet. Please sign up as a Guest or Host.",
        }));
      }
    } catch (error: any) {
      const errorMessage = error.message;
      console.log(errorMessage);
      setError((prev) => ({ ...prev, api: "Something went wrong." }));
    } finally {
      setDisabled(false);
    }
  };

  return (
    <>
      <div className="lg:min-h-[89vh] flex w-full">
        {/* Image Div - displayed only on laptop */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center">
          <img
            src={
              "https://res.cloudinary.com/do8rpl9l4/image/upload/v1741164523/racecar2_kznips.svg"
            }
            className="max-w-[70%]"
          />
        </div>

        {/* Right Div */}
        <div className="min-h-[95vh] mt-5 lg:mt-0 lg:h-full lg:min-h-[88vh] pb-10 flex-1 flex justify-center items-center">
          {/* Login Form Div */}
          <div className="bg-white dark:border-1 dark:border-white/25 dark:bg-secondarydarkbg max-w-xl dark:bg-darkgrey dark:text-darkmodetext border-darkbg/25 border-1 px-8 lg:max-w-lg mt-5 p-5 md:px-10 shadow-lg rounded-2xl pb-10">
            {/* Title */}
            <h1 className="dark:text-darkmodetext pt-5 font-bold text-2xl text-center">
              Sign in to StayFinder
            </h1>

            {/* Subtitle */}
            <h2 className="dark:text-darkmodetext mt-1 text-sm text-darkbg/70 text-center">
              Welcome back! Please sign in to continue.
            </h2>

            {/* Google Sign in Button */}
            <div className="flex justify-center">
              <button
                disabled={disabled}
                onClick={handleGoogleLogin}
                className="mt-8 dark:hover:border-white cursor-pointer hover:border-darkbg border-darkbg/25 dark:border-white/25 border-1 flex gap-x-2 py-2 justify-center items-center px-14 shadow rounded-lg font-medium active:shadow transition-all"
              >
                {disabled ? <p>Please Wait...</p> : <p>Sign in with Google</p>}
                <FaGoogle className="text-xl translate-y-0.5" />
              </button>
            </div>

            {/* OR */}
            <div className="flex mt-10 mb-5 items-center">
              <div className="flex-1 h-0 border-1 border-darkbg/25 dark:border-white/25"></div>
              <p className="text-center px-2 font-semibold text-darkbg/50 dark:text-white/25">
                OR
              </p>
              <div className="flex-1 h-0 border-1 border-darkbg/25 dark:border-white/25"></div>
            </div>

            {/* Email Login */}
            <>
              {/* Email Input field */}
              <div className="mt-4 px-2">
                <p className="font-medium">Email</p>
                <Input
                  value={email}
                  className="focus:border-darkbg dark:focus:border-white transition-all"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (
                      e.target.value != null &&
                      e.target.value != undefined &&
                      e.target.value.length != 0 &&
                      isValidEmail(e.target.value)
                    ) {
                      setError((prev) => ({ ...prev, email: 0, api: "" }));
                    }
                  }}
                  onBlur={() => {
                    if (
                      email == null ||
                      email == undefined ||
                      email.length == 0
                    ) {
                      setError((prev) => ({ ...prev, email: 1 }));
                      return;
                    } else if (!isValidEmail(email)) {
                      setError((prev) => ({ ...prev, email: 2 }));
                      return;
                    } else {
                      setError((prev) => ({ ...prev, email: 0 }));
                    }
                  }}
                  placeholder={"Enter your email address"}
                />
                <ErrorStatement
                  isOpen={error.email == 1}
                  text={"Please enter your email."}
                />
                <ErrorStatement
                  isOpen={error.email == 2}
                  text={"Please enter a valid email address."}
                />
              </div>

              {/* Password Input field */}
              <div className="mt-4 px-2">
                <p className="font-medium">Password</p>
                <PasswordInput
                  value={password}
                  className="focus:border-darkbg dark:focus:border-white transition-all"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (
                      e.target.value != null &&
                      e.target.value != undefined &&
                      e.target.value.length != 0 &&
                      isValidPassword(e.target.value)
                    ) {
                      setError((prev) => ({ ...prev, pw: 0, api: "" }));
                    }
                  }}
                  onBlur={() => {
                    if (
                      password == null ||
                      password == undefined ||
                      password.length == 0
                    ) {
                      setError((prev) => ({ ...prev, pw: 1 }));
                      return;
                    } else if (!isValidPassword(password)) {
                      setError((prev) => ({ ...prev, pw: 2 }));
                      return;
                    } else {
                      setError((prev) => ({ ...prev, pw: 0 }));
                    }
                  }}
                  placeholder={"Enter your password"}
                />
                <ErrorStatement
                  isOpen={error.pw == 1}
                  text={"Please enter a password."}
                />
                <ErrorStatement
                  isOpen={error.pw == 2}
                  text={
                    "Password must be 8 characters long and must contain an uppercase letter, lowercase letter, number and special character."
                  }
                />
                <ErrorStatement isOpen={!!error.api} text={error.api} />
              </div>

              <Link
                className="ml-4 text-sm text-blue-600 dark:text-blue-400 font-medium"
                to="/forgot-password"
              >
                Forgot your password?
              </Link>

              {/* Submit Button */}
              <div className="mt-8">
                <PrimaryButton
                  disabled={disabled}
                  disabledText="Please Wait..."
                  onClick={handleLogin}
                  text={"Sign in"}
                  className="w-full text-sm dark:hover:!bg-cta dark:hover:!border-cta bg-darkbg border-darkbg hover:!bg-darkbg/85 hover:!border-darkbg/85 hover:!scale-100 rounded-xl"
                />
              </div>
            </>

            {/* Horizontal line */}
            <div className="flex mt-10 mb-5 items-center">
              <div className="flex-1 h-0 border-1 border-darkbg/25 dark:border-white/25"></div>
            </div>

            {/* Link to Sign up */}
            <div className="text-center text-darkbg/80 dark:text-white/80 pt-2">
              Don't have an account?{" "}
              <Link
                className="text-blue-600 dark:text-blue-400 font-medium"
                to="/signup"
              >
                Sign up as a Guest
              </Link>{" "}
              or{" "}
              <Link
                className="text-blue-600 dark:text-blue-400 font-medium"
                to="/signup-host"
              >
                Sign up as a Host
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
