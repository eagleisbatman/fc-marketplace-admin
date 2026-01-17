export type Brand = {
  id: string;
  name: string;
  nameLocal?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    products: number;
  };
};

export type BrandsResponse = {
  success: boolean;
  data?: {
    brands: Brand[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
};

export type BrandFormData = {
  name: string;
  nameLocal: string;
  logoUrl: string;
  website: string;
};

export const initialBrandFormState: BrandFormData = {
  name: "",
  nameLocal: "",
  logoUrl: "",
  website: "",
};

export type BrandPagination = {
  currentPage: number;
  pageSize: number;
  totalBrands: number;
  totalPages: number;
};
