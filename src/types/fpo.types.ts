import type { LocationValue } from "@/components/LocationSelector";

export type FPO = {
  id: string;
  name: string;
  nameLocal?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  village?: {
    id: string;
    name: string;
    block: {
      id: string;
      name: string;
      district: {
        id: string;
        name: string;
        state: {
          id: string;
          code: string;
          name: string;
        };
      };
    };
  };
  _count?: {
    members: number;
  };
};

export type FPOMember = {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    nameLocal?: string;
    phone?: string;
    type: string;
    village?: {
      name: string;
      block: {
        district: {
          name: string;
        };
      };
    };
  };
};

export type FarmerUser = {
  id: string;
  name: string;
  phone?: string;
  village?: {
    name: string;
    block: {
      district: {
        name: string;
      };
    };
  };
};

export type CreateFPOForm = {
  name: string;
  nameLocal: string;
  registrationNumber: string;
  phone: string;
  email: string;
  address: string;
  location: LocationValue;
};

export const initialFPOFormState: CreateFPOForm = {
  name: "",
  nameLocal: "",
  registrationNumber: "",
  phone: "",
  email: "",
  address: "",
  location: {},
};

export type FPOFilters = {
  search: string;
  location: LocationValue;
  hasLocation: "all" | "yes" | "no";
};

export type FPOPagination = {
  currentPage: number;
  pageSize: number;
  totalFpos: number;
  totalPages: number;
};

export type DocumentForm = {
  name: string;
  type: string;
  description: string;
  fileUrl: string;
};

export const initialDocumentFormState: DocumentForm = {
  name: "",
  type: "registration",
  description: "",
  fileUrl: "",
};
