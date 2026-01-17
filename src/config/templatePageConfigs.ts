import { Users, Building2, Package, MapPin, Store, Tag } from "lucide-react";

export interface TemplatePageConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  columns: string[];
  sampleData: Record<string, string>[];
}

export const userTemplates: TemplatePageConfig[] = [
  {
    id: "farmers",
    title: "Farmers",
    description:
      "Import farmer accounts with location data and optional FPO assignment",
    icon: Users,
    columns: [
      "name",
      "name_local",
      "phone",
      "email",
      "state_code",
      "district_name",
      "block_name",
      "village_name",
    ],
    sampleData: [
      {
        name: "Ramesh Kumar",
        name_local: "रमेश कुमार",
        phone: "9876543210",
        email: "ramesh@email.com",
        state_code: "BR",
        district_name: "Patna",
        block_name: "Phulwari",
        village_name: "Sampatchak",
      },
      {
        name: "Sunita Devi",
        name_local: "सुनीता देवी",
        phone: "9876543211",
        email: "",
        state_code: "BR",
        district_name: "Patna",
        block_name: "Phulwari",
        village_name: "Khagaul",
      },
    ],
  },
  {
    id: "partners",
    title: "Partners",
    description: "Import partner accounts (staff, admins) with role assignment",
    icon: Users,
    columns: [
      "name",
      "name_local",
      "phone",
      "email",
      "role",
      "state_code",
      "district_name",
    ],
    sampleData: [
      {
        name: "Amit Singh",
        name_local: "अमित सिंह",
        phone: "9876543220",
        email: "amit@company.com",
        role: "field_officer",
        state_code: "BR",
        district_name: "Patna",
      },
      {
        name: "Priya Sharma",
        name_local: "प्रिया शर्मा",
        phone: "9876543221",
        email: "priya@company.com",
        role: "state_coordinator",
        state_code: "BR",
        district_name: "",
      },
    ],
  },
  {
    id: "providers",
    title: "Service Providers",
    description: "Import service provider user accounts",
    icon: Store,
    columns: [
      "name",
      "name_local",
      "phone",
      "email",
      "company_name",
      "state_code",
      "district_name",
    ],
    sampleData: [
      {
        name: "Rajesh Gupta",
        name_local: "राजेश गुप्ता",
        phone: "9876543230",
        email: "rajesh@provider.com",
        company_name: "AgriServices Ltd",
        state_code: "BR",
        district_name: "Patna",
      },
    ],
  },
  {
    id: "admins",
    title: "Admins",
    description: "Import admin accounts with role and jurisdiction",
    icon: Users,
    columns: ["name", "email", "phone", "role", "country_code", "state_code"],
    sampleData: [
      {
        name: "Admin User",
        email: "admin@marketplace.com",
        phone: "9876543240",
        role: "country_admin",
        country_code: "IN",
        state_code: "",
      },
      {
        name: "State Admin",
        email: "state.admin@marketplace.com",
        phone: "9876543241",
        role: "state_admin",
        country_code: "IN",
        state_code: "BR",
      },
    ],
  },
];

export const organizationTemplates: TemplatePageConfig[] = [
  {
    id: "fpos",
    title: "FPOs",
    description:
      "Import Farmer Producer Organizations with registration and location details",
    icon: Building2,
    columns: [
      "name",
      "name_local",
      "registration_number",
      "phone",
      "email",
      "address",
      "state_code",
      "district_name",
      "block_name",
      "village_name",
    ],
    sampleData: [
      {
        name: "Green Valley FPO",
        name_local: "ग्रीन वैली एफपीओ",
        registration_number: "FPO-BR-001",
        phone: "9876543250",
        email: "greenvalley@fpo.org",
        address: "Main Road, Patna",
        state_code: "BR",
        district_name: "Patna",
        block_name: "Phulwari",
        village_name: "Sampatchak",
      },
      {
        name: "Kisan Sahay FPO",
        name_local: "किसान सहाय एफपीओ",
        registration_number: "FPO-BR-002",
        phone: "9876543251",
        email: "kisansahay@fpo.org",
        address: "Station Road, Gaya",
        state_code: "BR",
        district_name: "Gaya",
        block_name: "Bodh Gaya",
        village_name: "Mastipur",
      },
    ],
  },
  {
    id: "service_providers",
    title: "Service Provider Companies",
    description: "Import service provider company profiles",
    icon: Store,
    columns: [
      "name",
      "name_local",
      "registration_number",
      "phone",
      "email",
      "address",
      "service_type",
      "state_code",
      "district_name",
    ],
    sampleData: [
      {
        name: "AgriServices Ltd",
        name_local: "एग्री सर्विसेज लिमिटेड",
        registration_number: "SP-001",
        phone: "9876543260",
        email: "info@agriservices.com",
        address: "Industrial Area, Patna",
        service_type: "equipment_rental",
        state_code: "BR",
        district_name: "Patna",
      },
    ],
  },
  {
    id: "brands",
    title: "Brands",
    description: "Import brand profiles for products",
    icon: Tag,
    columns: ["name", "name_local", "description", "logo_url", "website"],
    sampleData: [
      {
        name: "Farm Fresh",
        name_local: "फार्म फ्रेश",
        description: "Organic farm products",
        logo_url: "",
        website: "https://farmfresh.com",
      },
      {
        name: "Agri Plus",
        name_local: "एग्री प्लस",
        description: "Agricultural inputs and fertilizers",
        logo_url: "",
        website: "https://agriplus.in",
      },
    ],
  },
];

export const productTemplates: TemplatePageConfig[] = [
  {
    id: "products",
    title: "Products",
    description: "Import product catalog with pricing and categories",
    icon: Package,
    columns: [
      "name",
      "name_local",
      "description",
      "category",
      "sub_category",
      "brand_name",
      "unit",
      "price",
      "mrp",
      "sku",
    ],
    sampleData: [
      {
        name: "Organic Fertilizer 5kg",
        name_local: "जैविक खाद 5 किग्रा",
        description: "Premium organic fertilizer for all crops",
        category: "Fertilizers",
        sub_category: "Organic",
        brand_name: "Agri Plus",
        unit: "5kg bag",
        price: "450",
        mrp: "500",
        sku: "FERT-ORG-5KG",
      },
      {
        name: "Hybrid Wheat Seeds",
        name_local: "हाइब्रिड गेहूं बीज",
        description: "High yield wheat seeds",
        category: "Seeds",
        sub_category: "Wheat",
        brand_name: "Farm Fresh",
        unit: "1kg pack",
        price: "180",
        mrp: "200",
        sku: "SEED-WHT-1KG",
      },
    ],
  },
];

export const locationTemplates: TemplatePageConfig[] = [
  {
    id: "districts",
    title: "Districts",
    description: "Import districts with state mapping",
    icon: MapPin,
    columns: ["name", "name_local", "code", "state_code"],
    sampleData: [
      {
        name: "Patna",
        name_local: "पटना",
        code: "PATNA",
        state_code: "BR",
      },
      {
        name: "Gaya",
        name_local: "गया",
        code: "GAYA",
        state_code: "BR",
      },
    ],
  },
  {
    id: "blocks",
    title: "Blocks",
    description: "Import blocks with district mapping",
    icon: MapPin,
    columns: ["name", "name_local", "code", "district_code"],
    sampleData: [
      {
        name: "Phulwari",
        name_local: "फुलवारी",
        code: "PHULWARI",
        district_code: "PATNA",
      },
      {
        name: "Danapur",
        name_local: "दानापुर",
        code: "DANAPUR",
        district_code: "PATNA",
      },
    ],
  },
  {
    id: "villages",
    title: "Villages",
    description: "Import villages with block mapping",
    icon: MapPin,
    columns: ["name", "name_local", "code", "block_code"],
    sampleData: [
      {
        name: "Sampatchak",
        name_local: "साम्पतचक",
        code: "SAMPATCHAK",
        block_code: "PHULWARI",
      },
      {
        name: "Khagaul",
        name_local: "खगौल",
        code: "KHAGAUL",
        block_code: "PHULWARI",
      },
    ],
  },
];

export const templateCategories = [
  {
    id: "users",
    label: "Users",
    icon: Users,
    description:
      "Download user templates to import farmers, partners, service providers, and admin accounts.",
    templates: userTemplates,
  },
  {
    id: "organizations",
    label: "Organizations",
    icon: Building2,
    description:
      "Download organization templates to import FPOs, service provider companies, and brands.",
    templates: organizationTemplates,
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    description:
      "Download product templates to import your product catalog with pricing and categories.",
    templates: productTemplates,
  },
  {
    id: "locations",
    label: "Locations",
    icon: MapPin,
    description:
      "Download location templates to import districts, blocks, and villages.",
    templates: locationTemplates,
  },
];
