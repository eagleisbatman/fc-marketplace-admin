import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import { Globe, Loader2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function CountrySelectorModal() {
  const {
    needsCountrySelection,
    countries,
    isLoadingCountries,
    setSelectedCountry,
  } = useAdmin();
  const { logout } = useAuth();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleContinue = () => {
    const country = countries.find((c) => c.id === selectedId);
    if (country) {
      setSelectedCountry(country);
    }
  };

  if (!needsCountrySelection) {
    return null;
  }

  return (
    <Dialog open={needsCountrySelection}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Select Country
          </DialogTitle>
          <DialogDescription>
            Choose which country you want to manage. You can switch countries
            later from the header.
          </DialogDescription>
        </DialogHeader>

        {isLoadingCountries ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-muted-foreground">
              <p>No countries available.</p>
              <p className="text-sm mt-2">Please contact support.</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              {countries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => setSelectedId(country.id)}
                  className={cn(
                    "flex items-center gap-3 w-full p-3 rounded-lg border-2 transition-colors text-left",
                    selectedId === country.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
                  )}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div>
                    <p className="font-medium">{country.name}</p>
                    {country.nameLocal && country.nameLocal !== country.name && (
                      <p className="text-sm text-muted-foreground">
                        {country.nameLocal}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleContinue}
              disabled={!selectedId}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
