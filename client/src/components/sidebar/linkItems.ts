import {
  FiHome,
  FiUsers,
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiImage,
  FiFileText,
  FiGift,
  FiStar,
  FiSettings,
} from 'react-icons/fi';
import { ChartPie } from 'lucide-react';

export const LinkItems = [
  { name: 'Home', icon: FiHome, path: '/store-manager' },
  { name: 'Media', icon: FiImage, path: '/store-manager/media' },
  { name: 'Articles', icon: FiFileText, path: '/store-manager/articles' },
  { name: 'Products', icon: FiPackage, path: '/store-manager/products' },
  { name: 'Orders', icon: FiShoppingCart, path: '/store-manager/orders' },
  { name: 'Payments', icon: FiDollarSign, path: '/store-manager/payments' },
  { name: 'Coupons', icon: FiGift, path: '/store-manager/coupons' },
  { name: 'Customers', icon: FiUsers, path: '/store-manager/customers' },
  { name: 'Reviews', icon: FiStar, path: '/store-manager/review' },
  { name: 'Reports', icon: ChartPie, path: '/store-manager/reports' },
  { name: 'Settings', icon: FiSettings, path: '/store-manager/settings' },
];
