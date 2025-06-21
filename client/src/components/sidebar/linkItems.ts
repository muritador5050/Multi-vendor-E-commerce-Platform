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
import {
  Power,
  ChartPie,
  Bell,
  CircleHelp,
  Megaphone,
  NotebookTabs,
  CircleUserRound,
} from 'lucide-react';

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

  //special

  {
    name: 'Notification Dashboard',
    icon: Bell,
    path: '/store-manager/messages',
  },
  { name: 'Inquiry Board', icon: CircleHelp, path: '/store-manager/enquiry' },
  { name: 'Announcement', icon: Megaphone, path: '/store-manager/notices' },
  {
    name: 'Knowledgebase',
    icon: NotebookTabs,
    path: '/store-manager/knowledgebase',
  },
  { name: 'Profile', icon: CircleUserRound, path: '/store-manager/profile' },
  { name: 'Logout', icon: Power, path: '' },
];
