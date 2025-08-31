import {
  FiHome,
  FiUsers,
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiSettings,
} from 'react-icons/fi';
import { LogOut } from 'lucide-react';

export const LinkItems = [
  { name: 'Home', icon: FiHome, path: '/store-manager' },
  { name: 'Profile', icon: FiUsers, path: '/store-manager/profile' },
  { name: 'Products', icon: FiPackage, path: '/store-manager/products' },
  { name: 'Orders', icon: FiShoppingCart, path: '/store-manager/orders' },
  { name: 'Payments', icon: FiDollarSign, path: '/store-manager/payments' },
  { name: 'Settings', icon: FiSettings, path: '/store-manager/settings' },
  { name: 'Logout', icon: LogOut, path: '', type: 'logout' },
];
