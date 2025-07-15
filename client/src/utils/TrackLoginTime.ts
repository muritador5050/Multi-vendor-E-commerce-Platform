export const formatLastLogin = (date: Date): string => {
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const timePart = date.toLocaleTimeString('en-US', timeOptions).toLowerCase();
  const datePart = date.toLocaleDateString('en-US', dateOptions);

  return `Last Login: ${timePart} (${datePart})`;
};
