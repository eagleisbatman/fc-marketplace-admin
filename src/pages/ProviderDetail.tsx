import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ArrowLeft,
  Store,
  Package,
  MapPin,
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Globe,
  MessageCircle,
} from "lucide-react";
import {
  getServiceProvider,
  updateServiceProvider,
  getProviderCoverage,
  addProviderCoverage,
  deleteProviderCoverage,
  getProducts,
  type CoverageArea,
} from "@/lib/api";
import type { ServiceProvider } from "@/types/serviceProvider.types";
import { toast } from "sonner";
import { CoverageSelector, type CoverageValue } from "@/components/CoverageSelector";

type Product = {
  id: string;
  skuCode: string;
  name: string;
  nameLocal?: string;
  mrp: number;
  sellingPrice?: number;
  imageUrl?: string;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  unit?: { id: string; name: string; symbol: string };
  currency?: { id: string; symbol: string };
  isActive: boolean;
};

export function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab data
  const [coverage, setCoverage] = useState<CoverageArea[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [coverageLoading, setCoverageLoading] = useState(false);

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [addCoverageOpen, setAddCoverageOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    nameLocal: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address: "",
    logoUrl: "",
  });
  const [coverageForm, setCoverageForm] = useState<CoverageValue>({});

  // Saving states
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadProvider();
      loadCoverage();
      loadProducts();
    }
  }, [id]);

  const loadProvider = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await getServiceProvider(id!)) as {
        success: boolean;
        data?: ServiceProvider;
      };
      if (response.success && response.data) {
        setProvider(response.data);
      }
    } catch (err) {
      console.error("Failed to load provider:", err);
      setError("Failed to load provider details");
      toast.error("Failed to load provider");
    } finally {
      setLoading(false);
    }
  };

  const loadCoverage = async () => {
    try {
      setCoverageLoading(true);
      const response = await getProviderCoverage(id!);
      if (response.success && response.data) {
        setCoverage(response.data.coverage);
      }
    } catch (err) {
      console.error("Failed to load coverage:", err);
    } finally {
      setCoverageLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = (await getProducts({ providerId: id!, limit: 100 })) as {
        success: boolean;
        data?: { products: Product[] };
      };
      if (response.success && response.data) {
        setProducts(response.data.products);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (!provider) return;
    setEditForm({
      name: provider.name,
      nameLocal: provider.nameLocal || "",
      phone: provider.phone || "",
      whatsapp: provider.whatsapp || "",
      email: provider.email || "",
      website: provider.website || "",
      address: provider.address || "",
      logoUrl: provider.logoUrl || "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await updateServiceProvider(id!, {
        name: editForm.name.trim(),
        nameLocal: editForm.nameLocal.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        whatsapp: editForm.whatsapp.trim() || undefined,
        email: editForm.email.trim() || undefined,
        website: editForm.website.trim() || undefined,
        address: editForm.address.trim() || undefined,
        logoUrl: editForm.logoUrl.trim() || undefined,
      });
      toast.success("Provider updated");
      setEditOpen(false);
      loadProvider();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update provider");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCoverage = async () => {
    if (!coverageForm.stateId) {
      toast.error("Please select at least a state");
      return;
    }
    setSaving(true);
    try {
      await addProviderCoverage(id!, {
        stateId: coverageForm.stateId,
        districtId: coverageForm.districtId || undefined,
        blockId: coverageForm.blockId || undefined,
        villageId: coverageForm.villageId || undefined,
      });
      toast.success("Coverage area added");
      setAddCoverageOpen(false);
      setCoverageForm({});
      loadCoverage();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add coverage");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoverage = async (coverageId: string) => {
    try {
      await deleteProviderCoverage(id!, coverageId);
      toast.success("Coverage area removed");
      loadCoverage();
    } catch {
      toast.error("Failed to remove coverage");
    }
  };

  const formatCoverage = (cov: CoverageArea): string => {
    const parts = [cov.state.name];
    if (cov.district) parts.push(cov.district.name);
    if (cov.block) parts.push(cov.block.name);
    if (cov.village) parts.push(cov.village.name);
    return parts.join(" > ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/providers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Providers
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Provider not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/providers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {provider.logoUrl ? (
              <img
                src={provider.logoUrl}
                alt={provider.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{provider.name}</h1>
              {provider.nameLocal && (
                <p className="text-muted-foreground">{provider.nameLocal}</p>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpenEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="coverage">Coverage ({coverage.length})</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Provider Profile</CardTitle>
              <CardDescription>Basic information about this service provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{provider.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Local Name</Label>
                  <p className="font-medium">{provider.nameLocal || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium flex items-center gap-2">
                    {provider.phone ? (
                      <>
                        <Phone className="h-4 w-4" />
                        {provider.phone}
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">WhatsApp</Label>
                  <p className="font-medium flex items-center gap-2">
                    {provider.whatsapp ? (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        {provider.whatsapp}
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium flex items-center gap-2">
                    {provider.email ? (
                      <>
                        <Mail className="h-4 w-4" />
                        {provider.email}
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Website</Label>
                  <p className="font-medium flex items-center gap-2">
                    {provider.website ? (
                      <>
                        <Globe className="h-4 w-4" />
                        <a
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {provider.website}
                        </a>
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">{provider.address || "—"}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{products.length}</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{coverage.length}</div>
                  <div className="text-sm text-muted-foreground">Coverage Areas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Products ({products.length})
                  </CardTitle>
                  <CardDescription>
                    Products offered by this service provider
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products yet</p>
                  <p className="text-sm">Add products through the Products page or CSV upload</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="text-right">MRP</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">{product.skuCode}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.nameLocal && (
                                <div className="text-xs text-muted-foreground">{product.nameLocal}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category?.name || "—"}</TableCell>
                        <TableCell>{product.brand?.name || "—"}</TableCell>
                        <TableCell className="text-right">
                          {product.currency?.symbol || ""}
                          {product.mrp}
                          {product.unit && ` /${product.unit.symbol}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coverage Tab */}
        <TabsContent value="coverage">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Coverage Areas ({coverage.length})
                  </CardTitle>
                  <CardDescription>
                    Regions where this provider operates
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setAddCoverageOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Coverage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {coverageLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : coverage.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No coverage areas defined yet</p>
                  <p className="text-sm">
                    Add states, districts, or blocks where this provider operates
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {coverage.map((cov) => (
                    <div
                      key={cov.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{formatCoverage(cov)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteCoverage(cov.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Provider Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
            <DialogDescription>
              Update provider details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="Provider name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Local Name</Label>
              <Input
                placeholder="Name in local language"
                value={editForm.nameLocal}
                onChange={(e) => setEditForm({ ...editForm, nameLocal: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                placeholder="https://example.com/logo.png"
                value={editForm.logoUrl}
                onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="Phone number"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  placeholder="WhatsApp number"
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Email address"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                placeholder="https://example.com"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                placeholder="Business address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Coverage Dialog */}
      <Dialog open={addCoverageOpen} onOpenChange={setAddCoverageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Coverage Area</DialogTitle>
            <DialogDescription>
              Select the region where this provider operates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <CoverageSelector
              value={coverageForm}
              onChange={setCoverageForm}
              showDistrict={true}
              showBlock={true}
              showVillage={true}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCoverageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCoverage} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Coverage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
