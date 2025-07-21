export const sampleData = {
  stats: [
    {
      label: 'Total Revenue',
      value: '$124,563',
      change: '+12.5%',
      trend: 'up',
    },
    { label: 'Total Orders', value: '2,847', change: '+8.2%', trend: 'up' },
    { label: 'Active Vendors', value: '156', change: '+5.1%', trend: 'up' },
    { label: 'Products', value: '8,942', change: '-2.3%', trend: 'down' },
  ],
  vendors: [
    {
      id: 1,
      name: 'TechStore Pro',
      email: 'contact@techstore.com',
      status: 'active',
      revenue: '$28,450',
      products: 145,
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Fashion Hub',
      email: 'info@fashionhub.com',
      status: 'active',
      revenue: '$19,230',
      products: 89,
      rating: 4.6,
    },
    {
      id: 3,
      name: 'Home Essentials',
      email: 'hello@homeessentials.com',
      status: 'pending',
      revenue: '$15,780',
      products: 234,
      rating: 4.9,
    },
    {
      id: 4,
      name: 'Sports World',
      email: 'support@sportsworld.com',
      status: 'active',
      revenue: '$32,100',
      products: 178,
      rating: 4.7,
    },
  ],
  orders: [
    {
      id: '#12345',
      customer: 'John Doe',
      vendor: 'TechStore Pro',
      amount: '$299.99',
      status: 'delivered',
      date: '2024-07-10',
    },
    {
      id: '#12346',
      customer: 'Jane Smith',
      vendor: 'Fashion Hub',
      amount: '$89.50',
      status: 'pending',
      date: '2024-07-11',
    },
    {
      id: '#12347',
      customer: 'Bob Johnson',
      vendor: 'Home Essentials',
      amount: '$156.75',
      status: 'processing',
      date: '2024-07-12',
    },
    {
      id: '#12348',
      customer: 'Alice Brown',
      vendor: 'Sports World',
      amount: '$234.20',
      status: 'shipped',
      date: '2024-07-12',
    },
  ],
  products: [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      vendor: 'TechStore Pro',
      price: '$999',
      stock: 25,
      category: 'Electronics',
      status: 'active',
    },
    {
      id: 2,
      name: 'Summer Dress',
      vendor: 'Fashion Hub',
      price: '$49.99',
      stock: 12,
      category: 'Fashion',
      status: 'active',
    },
    {
      id: 3,
      name: 'Coffee Maker',
      vendor: 'Home Essentials',
      price: '$79.99',
      stock: 8,
      category: 'Home',
      status: 'low stock',
    },
    {
      id: 4,
      name: 'Running Shoes',
      vendor: 'Sports World',
      price: '$129.99',
      stock: 0,
      category: 'Sports',
      status: 'out of stock',
    },
  ],
};

// Utility function
export interface StatusColors {
  [key: string]: string;
}

export const getStatusColor = (status: string): string => {
  const statusColors: StatusColors = {
    active: 'green',
    pending: 'yellow',
    delivered: 'green',
    processing: 'blue',
    shipped: 'purple',
    'low stock': 'orange',
    'out of stock': 'red',
  };
  return statusColors[status] || 'gray';
};
