import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Store,
  Search,
  Package,
  Loader2,
  AlertCircle,
  Plus,
  Phone,
  Mail,
  Globe,
  MapPin,
  RefreshCw,
} from "lucide-react";
import {
  getServiceProviders,
  createServiceProvider,
} from "@/lib/api";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";
import type { ServiceProvider } from "@/types/serviceProvider.types";

export function Providers() {
  const navigate = useNavigate();
  const { selectedCountry } = useAdmin();
  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    nameLocal: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address: "",
  });

  useEffect(() => {
    loadProviders();
  }, [selectedCountry]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getServiceProviders({
        limit: 100,
        countryCode: selectedCountry?.code || undefined,
      }) as { success: boolean; data?: { providers: ServiceProvider[] } };
      if (response.success && response.data) {
        setProviders(response.data.providers || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load service providers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setCreating(true);
    try {
      const response = await createServiceProvider({
        name: createForm.name.trim(),
        nameLocal: createForm.nameLocal.trim() || undefined,
        phone: createForm.phone.trim() || undefined,
        whatsapp: createForm.whatsapp.trim() || undefined,
        email: createForm.email.trim() || undefined,
        website: createForm.website.trim() || undefined,
        address: createForm.address.trim() || undefined,
      }) as { success: boolean; data?: ServiceProvider };

      if (response.success && response.data) {
        toast.success("Service provider created");
        setCreateOpen(false);
        setCreateForm({
          name: "",
          nameLocal: "",
          phone: "",
          whatsapp: "",
          email: "",
          website: "",
          address: "",
        });
        // Navigate to the new provider's detail page
        navigate(`/dashboard/providers/${response.data.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create service provider");
    } finally {
      setCreating(false);
    }
  };

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(search.toLowerCase()) ||
      (provider.nameLocal?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (provider.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (provider.phone?.includes(search) ?? false)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Providers</h1>
          <p className="text-muted-foreground">
            Manage service provider companies ({providers.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadProviders} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Provider Cards */}
      {providers.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No service providers in the database yet.</p>
              <p className="text-sm mt-2">Click "Add Provider" to create one, or go to CSV Upload to import.</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredProviders.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No providers found matching "{search}"</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((provider) => (
            <Card
              key={provider.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/dashboard/providers/${provider.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {provider.logoUrl ? (
                      <img
                        src={provider.logoUrl}
                        alt={provider.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      {provider.nameLocal && (
                        <CardDescription>{provider.nameLocal}</CardDescription>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Package className="mr-1 h-3 w-3" />
                    {provider._count?.products ?? 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {provider.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{provider.phone}</span>
                  </div>
                )}
                {provider.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{provider.email}</span>
                  </div>
                )}
                {provider.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span className="truncate">{provider.website}</span>
                  </div>
                )}
                {provider.state && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {provider.district ? `${provider.district.name}, ` : ""}
                      {provider.state.name}
                    </span>
                  </div>
                )}
                {!provider.phone && !provider.email && !provider.website && !provider.state && (
                  <p className="text-muted-foreground italic">No contact info</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Provider Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service Provider</DialogTitle>
            <DialogDescription>
              Create a new service provider
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="Provider name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Local Name</Label>
              <Input
                placeholder="Name in local language"
                value={createForm.nameLocal}
                onChange={(e) => setCreateForm({ ...createForm, nameLocal: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="Phone number"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  placeholder="WhatsApp number"
                  value={createForm.whatsapp}
                  onChange={(e) => setCreateForm({ ...createForm, whatsapp: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Email address"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                placeholder="https://example.com"
                value={createForm.website}
                onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                placeholder="Business address"
                value={createForm.address}
                onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
