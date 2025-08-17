
// src/pages/LoginPage.tsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSignIn, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
// import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const LoginPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { signOut } = useClerk();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "customer";
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);

    try {
      // 🔐 Hardcoded logins (for demo or dev purposes)
      if (email === "vendor01@example.com" && password === "password01") {
        localStorage.setItem("isAuthenticated", "true");

        localStorage.setItem("userType", "vendor");
        toast({ title: "Vendor login successful", description: "Redirecting to Vendor Dashboard" });
        navigate("/vendor-dashboard");
        return;
      }

      if (email === "customer01@example.com" && password === "password01") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", userType);
        localStorage.setItem("userType", "customer");
        toast({ title: "Customer login successful", description: "Redirecting to Customer Dashboard" });
        navigate("/customer");
        return;
      }

      // 🧾 Clerk login
      const result = await signIn.create({ identifier: email, password });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", userType);
        localStorage.setItem("userType", userType);

        toast({
          title: "Login successful",
          description: "Welcome back to Bojj!",
        });

        if (userType === "vendor") {
          navigate("/vendor-dashboard");
        } else {
          navigate("/customer");
        }
      }
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.errors?.[0]?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      > */}
      <>
        <div className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-bojj-dark dark:text-white">Welcome Back</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-bojj-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-bojj-primary hover:bg-bojj-primary/90 text-white"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                to={`/signup?type=${userType}`}
                className="text-bojj-primary hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </>
      {/* </motion.div> */}
    </div>
  );
};

export default LoginPage;
