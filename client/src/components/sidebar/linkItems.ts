import {
  FiHome,
  FiUsers,
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiImage,
  FiFileText,
  FiGift,
  FiCompass,
  FiStar,
  FiSettings,
} from 'react-icons/fi';
import { Bell } from 'lucide-react';

export const LinkItems = [
  { name: 'Dashboard', icon: FiHome, path: '/store-manager' },
  { name: 'Products', icon: FiPackage, path: '/store-manager/products' },
  { name: 'Orders', icon: FiShoppingCart, path: '/store-manager/orders' },
  { name: 'Customers', icon: FiUsers, path: '/store-manager/customers' },
  { name: 'Payments', icon: FiDollarSign, path: '/store-manager/payments' },
  { name: 'Reports', icon: FiDollarSign, path: '/store-manager/reports' },
  { name: 'Media', icon: FiImage, path: '/store-manager/media' },
  { name: 'Articles', icon: FiFileText, path: '/store-manager/articles' },
  { name: 'Reviews', icon: FiStar, path: '/store-manager/review' },
  { name: 'Coupons', icon: FiGift, path: '/store-manager/coupons' },
  { name: 'Ledger Book', icon: Bell, path: '/store-manager/ledger-book' },
  {
    name: 'Add to Store',
    icon: FiCompass,
    path: '/store-manager/add-to-my-store',
  },
  { name: 'Settings', icon: FiSettings, path: '/store-manager/settings' },
];
