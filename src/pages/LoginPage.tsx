import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Package, Lock, Mail } from "lucide-react";
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

    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);

    setLoading(false);

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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl wholesale-gradient mb-4">
            <Package className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Wholesale Portal</h1>
          <p className="text-muted-foreground mt-1">
            {isSignUp ? "Maak een B2B account aan" : "Log in op je B2B account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">E-mailadres</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="jouw@bedrijf.nl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="password">Wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full wholesale-gradient border-0" disabled={loading}>
            {loading ? "Bezig..." : isSignUp ? "Account aanmaken" : "Inloggen"}
          </Button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? "Heb je al een account? Log in" : "Nog geen account? Registreer"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
