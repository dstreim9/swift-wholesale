import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);

      if (error) {
        toast({ title: "Fout", description: error, variant: "destructive" });
        return;
      }

      if (isSignUp) {
        toast({ title: "Account aangemaakt!", description: "Controleer je e-mail om je account te bevestigen." });
      } else {
        toast({ title: "Welkom terug!", description: "Je bent succesvol ingelogd." });
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({ title: "Fout", description: "Er ging iets mis bij het inloggen.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-widest uppercase text-primary">STREIM</h1>
          <p className="text-xs uppercase tracking-widest text-[#888] mt-1">Wholesale Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e2e5ea] shadow-sm p-8 space-y-5 relative overflow-hidden">
          {/* Blue accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

          <div className="space-y-1.5">
            <label className="streim-label" htmlFor="email">E-mailadres</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-[#e2e5ea] rounded-lg"
                placeholder="jouw@bedrijf.nl"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="streim-label" htmlFor="password">Wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 border-[#e2e5ea] rounded-lg"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full wholesale-gradient border-0 uppercase tracking-widest text-xs h-11 rounded-lg" disabled={loading}>
            {loading ? "Bezig..." : isSignUp ? "Account aanmaken" : "Inloggen"}
          </Button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-xs text-center text-[#888] hover:text-primary transition-colors uppercase tracking-wider"
          >
            {isSignUp ? "Heb je al een account? Log in" : "Nog geen account? Registreer"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
