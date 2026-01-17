import {
  Users,
  Building2,
  Store,
  Tag,
  Package,
  MapPin,
} from "lucide-react";

export interface TemplateConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  columns: string[];
  sampleData: Record<string, string>[];
  category: "users" | "organizations" | "products" | "locations";
  importType: string;
  supportsFpoPreselect?: boolean;
}

export const templates: TemplateConfig[] = [
  // Users
  {
    id: "farmers",
    title: "Farmers",
    description: "Import farmer accounts with location data",
    icon: Users,
    category: "users",
    importType: "farmer",
    supportsFpoPreselect: true,
    columns: ["name", "name_local", "phone", "email", "language_code"],
    sampleData: [
      {
        name: "Ramesh Kumar",
        name_local: "रमेश कुमार",
        phone: "9876543210",
        email: "ramesh@email.com",
        language_code: "hi",
      },
      {
        name: "Sunita Devi",
        name_local: "सुनीता देवी",
        phone: "9876543211",
        email: "",
        language_code: "hi",
      },
    ],
  },
  {
    id: "partners",
    title: "Partners",
    description: "Import partner/staff accounts",
    icon: Users,
    category: "users",
    importType: "partner",
    columns: ["name", "name_local", "phone", "email", "language_code"],
    sampleData: [
      {
        name: "Amit Singh",
        name_local: "अमित सिंह",
        phone: "9876543220",
        email: "amit@company.com",
        language_code: "hi",
      },
    ],
  },
  {
    id: "providers",
    title: "Service Provider Users",
    description: "Import service provider user accounts",
    icon: Store,
    category: "users",
    importType: "provider",
    columns: ["name", "name_local", "phone", "email"],
    sampleData: [
      {
        name: "Rajesh Gupta",
        name_local: "राजेश गुप्ता",
        phone: "9876543230",
        email: "rajesh@provider.com",
      },
    ],
  },
  {
    id: "admins",
    title: "Admins",
    description: "Import admin accounts with role and jurisdiction",
    icon: Users,
    category: "users",
    importType: "admin",
    columns: ["name", "email", "phone", "admin_role", "country_code", "state_code"],
    sampleData: [
      {
        name: "Admin User",
        email: "admin@marketplace.com",
        phone: "9876543240",
        admin_role: "country_admin",
        country_code: "IN",
        state_code: "",
      },
      {
        name: "State Admin",
        email: "state.admin@marketplace.com",
        phone: "9876543241",
        admin_role: "state_admin",
        country_code: "IN",
        state_code: "BR",
      },
    ],
  },
  // Organizations
  {
    id: "fpos",
    title: "FPOs",
    description: "Import Farmer Producer Organizations",
    icon: Building2,
    category: "organizations",
    importType: "fpos",
    columns: [
      "name",
      "name_local",
      "registration_number",
      "phone",
      "email",
      "address",
    ],
    sampleData: [
      {
        name: "Green Valley FPO",
        name_local: "ग्रीन वैली एफपीओ",
        registration_number: "FPO-BR-001",
        phone: "9876543250",
        email: "greenvalley@fpo.org",
        address: "Main Road, Patna",
      },
      {
        name: "Kisan Sahay FPO",
        name_local: "किसान सहाय एफपीओ",
        registration_number: "FPO-BR-002",
        phone: "9876543251",
        email: "kisansahay@fpo.org",
        address: "Station Road, Gaya",
      },
    ],
  },
  {
    id: "service_providers",
    title: "Service Provider Companies",
    description: "Import service provider company profiles",
    icon: Store,
    category: "organizations",
    importType: "service_providers",
    columns: ["name", "name_local", "phone", "email", "website", "address"],
    sampleData: [
      {
        name: "AgriServices Ltd",
        name_local: "एग्री सर्विसेज लिमिटेड",
        phone: "9876543260",
        email: "info@agriservices.com",
        website: "https://agriservices.com",
        address: "Industrial Area, Patna",
      },
    ],
  },
  {
    id: "brands",
    title: "Brands",
    description: "Import brand profiles for products",
    icon: Tag,
    category: "organizations",
    importType: "brands",
    columns: ["name", "name_local", "logo_url", "website"],
    sampleData: [
      {
        name: "Farm Fresh",
        name_local: "फार्म फ्रेश",
        logo_url: "",
        website: "https://farmfresh.com",
      },
      {
        name: "Agri Plus",
        name_local: "एग्री प्लस",
        logo_url: "",
        website: "https://agriplus.in",
      },
    ],
  },
  // Products
  {
    id: "products",
    title: "Products",
    description: "Import product catalog with pricing",
    icon: Package,
    category: "products",
    importType: "products",
    columns: [
      "sku_code",
      "name",
      "name_local",
      "description",
      "category_slug",
      "brand_name",
      "provider_name",
      "unit_code",
      "pack_size",
      "mrp",
      "selling_price",
      "image_url",
    ],
    sampleData: [
      {
        sku_code: "FERT-ORG-5KG",
        name: "Organic Fertilizer 5kg",
        name_local: "जैविक खाद 5 किग्रा",
        description: "Premium organic fertilizer for all crops",
        category_slug: "fertilizers",
        brand_name: "Agri Plus",
        provider_name: "AgriServices Ltd",
        unit_code: "kg",
        pack_size: "5",
        mrp: "500",
        selling_price: "450",
        image_url: "",
      },
    ],
  },
  // Locations
  {
    id: "districts",
    title: "Districts",
    description: "Import districts with state mapping",
    icon: MapPin,
    category: "locations",
    importType: "districts",
    columns: ["name", "name_local", "lgd_code", "state_code"],
    sampleData: [
      {
        name: "Patna",
        name_local: "पटना",
        lgd_code: "1001",
        state_code: "BR",
      },
      {
        name: "Gaya",
        name_local: "गया",
        lgd_code: "1002",
        state_code: "BR",
      },
    ],
  },
  {
    id: "blocks",
    title: "Blocks",
    description: "Import blocks with district mapping",
    icon: MapPin,
    category: "locations",
    importType: "blocks",
    columns: ["name", "name_local", "lgd_code", "district_lgd_code"],
    sampleData: [
      {
        name: "Phulwari",
        name_local: "फुलवारी",
        lgd_code: "10010001",
        district_lgd_code: "1001",
      },
    ],
  },
  {
    id: "villages",
    title: "Villages",
    description: "Import villages with block mapping",
    icon: MapPin,
    category: "locations",
    importType: "villages",
    columns: ["name", "name_local", "lgd_code", "block_lgd_code", "latitude", "longitude"],
    sampleData: [
      {
        name: "Sampatchak",
        name_local: "साम्पतचक",
        lgd_code: "100100010001",
        block_lgd_code: "10010001",
        latitude: "25.5941",
        longitude: "85.1376",
      },
    ],
  },
];

export const categories = [
  { id: "users", label: "Users", icon: Users },
  { id: "organizations", label: "Organizations", icon: Building2 },
  { id: "products", label: "Products", icon: Package },
  { id: "locations", label: "Locations", icon: MapPin },
];
