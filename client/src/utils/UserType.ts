type Role = 'admin' | 'vendor' | 'customer';
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  profileCompletion?: number;
}
