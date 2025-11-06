export interface Office {
  address: string;
  city: string;
  contact_number: string;
  contact_person: string;
  created_at: string;
  email: string;
  id: number;
  name: string;
  pincode: string;
  state: string;
  gst_number: string;
  updated_at: string;
  manager?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  operators?: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;
}
