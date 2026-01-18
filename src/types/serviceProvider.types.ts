export type ServiceProvider = {
  id: string;
  name: string;
  nameLocal?: string;
  logoUrl?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  stateId?: string;
  districtId?: string;
  state?: { id: string; name: string; code: string };
  district?: { id: string; name: string };
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: { products: number };
  coverage?: Array<{
    id: string;
    stateId: string;
    districtId?: string;
    blockId?: string;
    villageId?: string;
    state: { id: string; name: string; code: string };
    district?: { id: string; name: string };
    block?: { id: string; name: string };
    village?: { id: string; name: string };
    isActive: boolean;
    createdAt: string;
  }>;
};

export type ServiceProviderFormData = {
  name: string;
  nameLocal?: string;
  logoUrl?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  stateId?: string;
  districtId?: string;
};

export type ServiceProviderListResponse = {
  success: boolean;
  data?: {
    providers: ServiceProvider[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
};

export type ServiceProviderResponse = {
  success: boolean;
  data?: ServiceProvider;
};
