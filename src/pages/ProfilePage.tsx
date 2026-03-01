import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "NL",
    kvk_number: "",
    btw_number: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            company_name: data.company_name || "",
            contact_name: data.contact_name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            postal_code: data.postal_code || "",
            country: data.country || "NL",
            kvk_number: data.kvk_number || "",
            btw_number: data.btw_number || "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Fout", description: "Kon profiel niet opslaan.", variant: "destructive" });
    } else {
      toast({ title: "Opgeslagen!", description: "Je bedrijfsgegevens zijn bijgewerkt." });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const Field = ({ label, field, type = "text" }: { label: string; field: keyof typeof profile; type?: string }) => (
    <div className="space-y-1.5">
      <Label className="streim-label">{label}</Label>
      <Input
        type={type}
        value={profile[field]}
        onChange={(e) => setProfile((p) => ({ ...p, [field]: e.target.value }))}
        className="border-[#e2e5ea] rounded-lg"
      />
    </div>
  );

  return (
    <div className="flex-1 overflow-auto px-6 py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-primary tracking-wide mb-1">Bedrijfsinformatie</h1>
        <p className="text-sm text-[#888] mb-6">Vul je bedrijfsgegevens in voor je bestellingen.</p>

        <div className="bg-white rounded-[10px] border border-[#e2e5ea] shadow-sm p-6 space-y-6">
          {/* Company info section */}
          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-primary font-bold mb-4">
              Bedrijfsgegevens
            </h3>
            <div className="bg-[#f7f8fa] rounded-lg p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Bedrijfsnaam" field="company_name" />
                <Field label="Contactpersoon" field="contact_name" />
                <Field label="E-mailadres" field="email" type="email" />
                <Field label="Telefoonnummer" field="phone" type="tel" />
              </div>
            </div>
          </div>

          {/* Address section */}
          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-primary font-bold mb-4">
              Verzendadres
            </h3>
            <div className="bg-[#f7f8fa] rounded-lg p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Adres" field="address" />
                </div>
                <Field label="Stad" field="city" />
                <Field label="Postcode" field="postal_code" />
              </div>
            </div>
          </div>

          {/* Tax section */}
          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-primary font-bold mb-4">
              Fiscale Gegevens
            </h3>
            <div className="bg-[#f7f8fa] rounded-lg p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="KVK-nummer" field="kvk_number" />
                <Field label="BTW-nummer" field="btw_number" />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="wholesale-gradient border-0 rounded-lg" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Opslaan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
