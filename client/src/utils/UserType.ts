export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
  isEmailVerified: boolean;
  profileCompletion?: number;
}
