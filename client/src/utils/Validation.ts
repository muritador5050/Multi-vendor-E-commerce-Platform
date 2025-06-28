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

    const checks = [
      { test: /[A-Z]/, msg: 'uppercase letter' },
      { test: /[a-z]/, msg: 'lowercase letter' },
      { test: /\d/, msg: 'number' },
      { test: /\W/, msg: 'special character' },
    ];

    // const missing = checks.filter((check) => !check.test.test(password));
    // if (missing.length) {
    //   return `Password must contain: ${missing.map((m) => m.msg).join(', ')}`;
    // }
    return null;
  },

  name: (name: string): string | null => {
    if (!name?.trim()) return 'Name is required';
    if (name.trim().length < 2)
      return 'Name must be at least 2 characters long';
    return null;
  },

  passwordMatch: (password: string, confirmPassword: string): string | null => {
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },
};
