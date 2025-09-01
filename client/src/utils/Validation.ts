export const validators = {
  email: (email: string): string | null => {
    if (!email?.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  password: (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8)
      return 'Password must be at least 8 characters long';
    return null;
  },

  name: (name: string): string | null => {
    if (!name?.trim()) return 'Name is required';
    if (name.trim().length < 2)
      return 'Name must be at least 2 characters long';
    return null;
  },

  role: (role: string): string => {
    const roles = ['admin', 'vendor', 'customer'];
    if (!role?.trim()) return 'Role is required';

    if (!roles.includes(role)) return 'There is no such role in this platform';
    return '';
  },

  passwordMatch: (password: string, confirmPassword: string): string | null => {
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },
};
