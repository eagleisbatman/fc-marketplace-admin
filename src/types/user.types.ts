import type { LocationValue } from "@/components/LocationSelector";

export type User = {
  id: string;
  name: string;
  nameLocal?: string;
  phone?: string;
  email?: string;
  type: "farmer" | "partner" | "provider" | "admin";
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
  fpoMemberships?: Array<{
    fpo: {
      id: string;
      name: string;
    };
    role: string;
  }>;
  adminRole?: "super_admin" | "country_admin" | "state_admin";
  adminCountry?: {
    id: string;
    code: string;
    name: string;
  };
  adminState?: {
    id: string;
    code: string;
    name: string;
  };
};

export type Country = {
  id: string;
  code: string;
  name: string;
};

export type State = {
  id: string;
  code: string;
  name: string;
};

export type CreateUserForm = {
  name: string;
  nameLocal: string;
  phone: string;
  email: string;
  type: "farmer" | "partner" | "provider" | "admin";
  fpoId?: string;
  fpoRole?: string;
  location: LocationValue;
  adminRole?: "super_admin" | "country_admin" | "state_admin";
  adminCountryId?: string;
  adminStateId?: string;
};

export const initialUserFormState: CreateUserForm = {
  name: "",
  nameLocal: "",
  phone: "",
  email: "",
  type: "farmer",
  fpoId: undefined,
  fpoRole: "member",
  location: {},
  adminRole: undefined,
  adminCountryId: undefined,
  adminStateId: undefined,
};

export type UserFilters = {
  userType: string;
  search: string;
  filterLocation: LocationValue;
  filterDateFrom: string;
  filterDateTo: string;
  filterHasLocation: "all" | "yes" | "no";
};

export type UserPagination = {
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
};
