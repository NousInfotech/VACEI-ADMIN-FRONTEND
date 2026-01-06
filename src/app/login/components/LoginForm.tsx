'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AlertMessage from "../../../components/AlertMessage";
import { login } from "@/api/authService";
import Link from "next/link"; // Import Link

export default function LoginForm() {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Get alert message from query param on mount
  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
        localStorage.clear();
      setAlertMessage(message);
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  setLoading(true);

  try {
    const { token, username, user_id } = await login({ email, password });

    localStorage.setItem("token", token);
    localStorage.setItem("username", btoa(username));
    localStorage.setItem("email", btoa(email));
    localStorage.setItem("user_id", btoa(user_id));

    router.push("/dashboard");
  } catch (err) {
    const errorMessage = (err as Error)?.message || "An unknown error occurred";
    setErrors({ email: errorMessage, password: "" });
  } finally {
    setLoading(false);
  }
};


  return (
    <section className="banner_section min-h-screen flex items-center justify-center">
      <div className="mx-auto max-w-[1200px] px-8 w-full">
        <section className="login_section flex justify-center">
          <div className="login_card bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
            {alertMessage && (
              <AlertMessage
                message={alertMessage}
                variant="danger"
                duration={4000}
                onClose={() => setAlertMessage(null)}
              />
            )}

            <div className="login_card_header flex flex-col items-center mb-6">
              <Image
                src="/logo-main.png"
                alt="logo"
                width={120}
                height={120}
                style={{ objectFit: "contain" }}
              />
            </div>

            <div className="login_card_body text-center">
              <p className="mb-6 text-gray-600">Please enter your admin credentials to continue..</p>

              <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                <div>
                  <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control w-full border p-2 rounded"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm text-start pt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control w-full border p-2 rounded"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm text-start pt-1">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-primary text-white py-3 rounded"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>

            <div className="login_card_footer mt-6 text-center text-sm text-gray-700">
              <p className="mt-2">
                <Link href="/forgot-password" className="text-primary font-semibold hover:underline">
                  Forgot Password?
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
