export type SlideRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  order_index: number;
  active: boolean;
  created_at: string;
};

export type ActivityRow = {
  id: string;
  title: string;
  slug: string;
  sector: string;
  location: string;
  date: string;
  image_url: string;
  description: string;
  content: string | null;
  status: string;
  created_at: string;
};

export type DocumentRow = {
  id: string;
  title: string;
  category: string;
  year: string;
  file_url: string;
  file_size: string | null;
  created_at: string;
};

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type SiteSettingsRow = {
  id: string;
  org_name: string;
  short_name: string;
  tagline: string;
  phone: string;
  phone_ict: string | null;
  email: string;
  email_ict: string | null;
  address: string;
  sub_office_addresses: string | null;
  location: string;
  website: string;
  established: string | null;
  registrations: string | null;
  executive_director: string;
  social_facebook: string | null;
  social_x: string | null;
  social_linkedin: string | null;
  social_instagram: string | null;
  created_at: string;
  updated_at: string;
};

export type CoreValue = {
  title: string;
  description: string;
  icon: string;
};

export type AboutContentRow = {
  id: string;
  vision: string;
  mission: string;
  core_values: CoreValue[];
  created_at: string;
  updated_at: string;
};

export type ImpactStatRow = {
  id: string;
  label: string;
  value: number;
  suffix: string;
  order_index: number;
  created_at: string;
};

export type PartnerRow = {
  id: string;
  name: string;
  initials: string;
  logo_url: string | null;
  website_url: string | null;
  order_index: number;
  created_at: string;
};

export type TeamMemberRow = {
  id: string;
  name: string;
  role: string;
  category: "board" | "executive" | "volunteer";
  image_url: string | null;
  bio: string | null;
  order_index: number;
  created_at: string;
};

export type VacancyRow = {
  id: string;
  title: string;
  type: "job" | "tender";
  location: string | null;
  deadline: string | null;
  file_url: string | null;
  description: string | null;
  status: "active" | "closed";
  order_index: number;
  created_at: string;
};

export type AdminCredentialRow = {
  id: string;
  email: string;
  passcode: string;
  updated_at: string;
};

export type AlertBannerRow = {
  id: string;
  message: string;
  button_text: string | null;
  button_url: string | null;
  active: boolean;
  bg_color: string;
  created_at: string;
  updated_at: string;
};

export type PageHeaderRow = {
  id: string;
  page_key: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type PillarRow = {
  id: string;
  title: string;
  category_slug: string;
  icon_name: string;
  short_desc: string;
  full_content: string;
  interventions: string[];
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryPhotoRow = {
  id: string;
  title: string;
  location: string | null;
  category: string | null;
  image_url: string;
  date: string | null;
  featured: boolean;
  created_at: string;
};
