"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link from next/link
import { toast } from "sonner";
import InputField from "@/components/ui/InputField";
import AuthButton from "@/components/ui/AuthButton";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { PublicRoute } from "@/utils/RouteProtection";
const serverBaseUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    setErrors({ email: "", password: "" });
    setAlertMessage("");
    const formData = { email, password };
    try {
      const response = await fetch(`${serverBaseUrl}/user/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const responseData = await response.json();
      if (response.ok) {
        const { token, data } = responseData.response;
        router.push("/landing-page");
        localStorage.setItem("token", token);
        localStorage.setItem(
          "user",
          JSON.stringify({ email: data.email, public: data.public })
        );
        toast.success(responseData.message);
      } else if (response.status === 403) {
        const error = typeof responseData.error;
        if (error === "object") {
          setErrors(responseData.error);
        }
      } else {
        setAlertMessage(
          responseData.message || "Login failed. Please try again"
        );
        setTimeout(() => setAlertMessage(""), 3000);
      }
    } catch {
      setAlertMessage("Network error. Please try again.");
      setTimeout(() => setAlertMessage(""), 3000);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <PublicRoute>
      <div className="flex justify-center items-center min-h-screen font-inter px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg w-full max-w-[400px] sm:w-[380px]">
          <h2 className="text-[#1D3557] text-3xl sm:text-4xl font-bold mb-4 font-cormorant-garamond">
            Welcome!
          </h2>
          {alertMessage && (
            <div
              className={`mt-4 mb-8 bg-red-100 border-red-400 text-red-700 border px-4 py-3 rounded relative`}
              role="alert"
            >
              <span className="block sm:inline">{alertMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              id="email"
              className={`${errors?.email && "!mb-0"}`}
            />
            {errors?.email && (
              <p className="joi-error-message mb-4">{errors?.email[0]}</p>
            )}

            <InputField
              label="Password"
              type={passwordVisible ? "text" : "password"} // Toggle between password and text
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              id="password"
              showPasswordToggle={true}
              onTogglePassword={() => setPasswordVisible(!passwordVisible)} // Toggle password visibility
              className={`${errors?.password && "!mb-0"}`}
            />
            {errors?.password && (
              <p className="joi-error-message mb-4">{errors?.password[0]}</p>
            )}

              <div className="flex justify-end items-center w-full">
                <Link
                  href="/forgot-password"
                  className="font-semibold text-sm underline decoration-[#1D3557] hover:decoration-transparent"
                >
                  Forgot Password
                </Link>
              </div>

            <AuthButton
              text="Log in"
              type="submit"
              className="mt-3 w-full"
              isDisabled={disabled}
            />
          </form>

          <div className="flex items-center justify-center my-3">
            <div className="h-[1px] w-full bg-[#A8DADC]"></div>
            <span className="mx-4 text-[#1D3557] text-sm font-bold">Or</span>
            <div className="h-[1px] w-full bg-[#A8DADC]"></div>
          </div>
          <GoogleLoginButton />
          <div className="flex justify-center text-sm text-[#1D3557] gap-2 mt-3">
            <span className="">New Here?</span>
            <Link
              href="/signup"
              className="font-semibold underline decoration-[#1D3557] hover:decoration-transparent"
            >
              Create a Free Account
            </Link>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default Login;
