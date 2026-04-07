import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success("Logged in!");
        navigate("/");
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast.success("Account created! Check your email to verify.");
      }
    } catch (err: any) {
      toast.error(err.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8"
      >
        <h1 className="text-3xl font-display font-black uppercase text-primary mb-2 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          {isLogin ? "Welcome back to AniCrew" : "Join the AniCrew community"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition text-sm"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            {loading ? "..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {isLogin ? "No account? " : "Already have one? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
