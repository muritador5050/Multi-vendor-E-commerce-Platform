// Utility function
export interface StatusColors {
  [key: string]: string;
}

// Function to format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const calculateTrend = (current: number, previous?: number) => {
  // Provide a default previous value if not provided
  // Using 90% of current as mock previous value
  const prev = previous ?? (current > 0 ? current * 0.9 : 0);

  // Handle edge cases to prevent NaN
  if (!current || current === 0) {
    return {
      change: '0.0%',
      trend: 'down' as const,
    };
  }

  if (!prev || prev === 0) {
    return {
      change: '+100.0%',
      trend: 'up' as const,
    };
  }

  const change = ((current - prev) / prev) * 100;

  // Check if change is NaN or Infinity
  if (!isFinite(change)) {
    return {
      change: '0.0%',
      trend: 'down' as const,
    };
  }

  return {
    change: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
    trend: change > 0 ? 'up' : 'down',
  };
};

export const formatDate = (date: string | Date | undefined): string => {
  return date ? new Date(date).toLocaleDateString() : 'Never';
};
export const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'purple';
    case 'vendor':
      return 'yellow';
    default:
      return 'blue';
  }
};

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

export const formatLastSeen = (lastSeenDate: Date) => {
  if (!lastSeenDate) return 'N/A';

  const now = new Date();
  const lastSeen = new Date(lastSeenDate);
  const diffInMilliseconds = now.getTime() - lastSeen.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  // Less than 1 minute
  if (diffInMinutes < 1) {
    return 'just now';
  }

  // Less than 1 hour
  if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? '1 minute ago'
      : `${diffInMinutes} minutes ago`;
  }

  // Less than 24 hours (same day or within 24 hours)
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }

  // Less than 7 days
  if (diffInDays < 7) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  }

  // More than a week, show actual date
  return lastSeen.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() !== lastSeen.getFullYear() ? 'numeric' : undefined,
  });
};
