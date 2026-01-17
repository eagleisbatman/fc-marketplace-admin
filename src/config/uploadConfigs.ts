import {
  Users,
  Building2,
  Store,
  Tag,
  Package,
  MapPin,
} from "lucide-react";

export type UploadType =
  | "farmers"
  | "partners"
  | "providers"
  | "admins"
  | "fpos"
  | "service_providers"
  | "brands"
  | "products"
  | "districts"
  | "blocks"
  | "villages";

export interface UploadConfig {
  type: UploadType;
  label: string;
  description: string;
  icon: React.ElementType;
  templateFile: string;
  requiredColumns: string[];
  supportsFpoPreselect?: boolean;
}

export const uploadConfigs: UploadConfig[] = [
  {
    type: "farmers",
    label: "Farmers",
    description: "Farmer user accounts",
    icon: Users,
    templateFile: "farmers_template",
    requiredColumns: [
      "name",
      "phone",
      "name_local",
      "email",
      "state_code",
      "district_name",
      "block_name",
      "village_name",
    ],
    supportsFpoPreselect: true,
  },
  {
    type: "partners",
    label: "Partners",
    description: "FPO partners/managers",
    icon: Users,
    templateFile: "partners_template",
    requiredColumns: [
      "name",
      "phone",
      "name_local",
      "email",
      "state_code",
      "district_name",
      "block_name",
      "village_name",
    ],
  },
  {
    type: "providers",
    label: "Provider Users",
    description: "Service provider user accounts",
    icon: Users,
    templateFile: "provider_users_template",
    requiredColumns: ["name", "phone", "name_local", "email"],
  },
  {
    type: "admins",
    label: "Admins",
    description: "Admin user accounts",
    icon: Users,
    templateFile: "admins_template",
    requiredColumns: ["name", "phone", "email", "password"],
  },
  {
    type: "fpos",
    label: "FPOs",
    description: "Farmer Producer Organizations",
    icon: Building2,
    templateFile: "fpos_template",
    requiredColumns: [
      "name",
      "name_local",
      "registration_number",
      "phone",
      "email",
      "state_code",
      "district_name",
      "block_name",
      "village_name",
    ],
  },
  {
    type: "service_providers",
    label: "Service Providers",
    description: "Companies selling products",
    icon: Store,
    templateFile: "service_providers_template",
    requiredColumns: ["name", "description", "website", "logo_url"],
  },
  {
    type: "brands",
    label: "Brands",
    description: "Product brand master list",
    icon: Tag,
    templateFile: "brands_template",
    requiredColumns: ["name", "description", "logo_url"],
  },
  {
    type: "products",
    label: "Products",
    description: "Product catalog",
    icon: Package,
    templateFile: "products_template",
    requiredColumns: [
      "sku_code",
      "name",
      "name_local",
      "description",
      "category_slug",
      "provider_name",
      "brand_name",
      "unit_code",
      "pack_size",
      "mrp",
      "image_url",
    ],
  },
  {
    type: "districts",
    label: "Districts",
    description: "Geographic districts",
    icon: MapPin,
    templateFile: "districts_template",
    requiredColumns: ["name", "name_local", "state_code", "lgd_code"],
  },
  {
    type: "blocks",
    label: "Blocks",
    description: "Blocks/Talukas",
    icon: MapPin,
    templateFile: "blocks_template",
    requiredColumns: [
      "name",
      "name_local",
      "district_name",
      "state_code",
      "lgd_code",
    ],
  },
  {
    type: "villages",
    label: "Villages",
    description: "Villages with GPS",
    icon: MapPin,
    templateFile: "villages_template",
    requiredColumns: [
      "name",
      "name_local",
      "block_name",
      "district_name",
      "state_code",
      "lgd_code",
      "latitude",
      "longitude",
    ],
  },
];
