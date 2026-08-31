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
