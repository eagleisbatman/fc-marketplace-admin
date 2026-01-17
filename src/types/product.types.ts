export type Category = {
  id: string;
  name: string;
  nameLocal?: string;
  slug: string;
  parentId?: string;
  _count?: { products: number };
};

export type Brand = {
  id: string;
  name: string;
  nameLocal?: string;
};

export type ServiceProvider = {
  id: string;
  name: string;
  nameLocal?: string;
};

export type Unit = {
  id: string;
  code: string;
  name: string;
  type: string;
};

export type Currency = {
  id: string;
  code: string;
  symbol: string;
  name: string;
};

export type Product = {
  id: string;
  skuCode: string;
  name: string;
  nameLocal?: string;
  description?: string;
  descriptionLocal?: string;
  categoryId: string;
  brandId?: string;
  providerId: string;
  variety?: string;
  unitId: string;
  packSize?: string;
  mrp: number;
  sellingPrice?: number;
  discountPercent?: number;
  currencyId: string;
  imageUrl?: string;
  stockStatus: string;
  isActive: boolean;
  createdAt: string;
  category?: Category;
  brand?: Brand;
  provider?: ServiceProvider;
  unit?: Unit;
  currency?: Currency;
};

export type ProductsResponse = {
  success: boolean;
  data?: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
};

export type ProductFormData = {
  skuCode: string;
  name: string;
  nameLocal: string;
  description: string;
  descriptionLocal: string;
  categoryId: string;
  brandId: string;
  providerId: string;
  variety: string;
  unitId: string;
  packSize: string;
  mrp: string;
  sellingPrice: string;
  discountPercent: string;
  currencyId: string;
  imageUrl: string;
  stockStatus: string;
};

export const initialProductFormState: ProductFormData = {
  skuCode: "",
  name: "",
  nameLocal: "",
  description: "",
  descriptionLocal: "",
  categoryId: "",
  brandId: "",
  providerId: "",
  variety: "",
  unitId: "",
  packSize: "",
  mrp: "",
  sellingPrice: "",
  discountPercent: "",
  currencyId: "",
  imageUrl: "",
  stockStatus: "in_stock",
};

export type ProductFilters = {
  search: string;
  categoryId: string;
  brandId: string;
  providerId: string;
};

export type ProductPagination = {
  currentPage: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
};

export const stockStatusOptions = [
  { value: "in_stock", label: "In Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "discontinued", label: "Discontinued" },
];
