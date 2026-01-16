// Shared User types for the application

export interface UserOffice {
  id: number;
  name: string;
  officeRole: string;
  type: string;
}

export interface UserSite {
  id: number;
  name: string;
  type: string;
  userId: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  contact_number: string | null;
  role: string;
  status: string;
  created_at: string;
  password?: string;
  sites: UserSite[];
  offices: UserOffice[];
}

export interface UserCategory {
  created_at: string;
  email: string;
  id: number;
  name: string;
  password: string;
  role: string;
  contact_number: string | null;
  status: string;
}

export interface CategorizedUsers {
  managers: UserCategory[];
  staff: UserCategory[];
  operators: UserCategory[];
  viewers: UserCategory[];
  totalManagers: number;
  totalStaff: number;
  totalOperators: number;
  totalViewers: number;
}
