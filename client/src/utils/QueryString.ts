export const buildQueryString = <T extends Record<string, any>>(
  params: T
): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null && v !== '') {
            searchParams.append(key, String(v));
          }
        });
      } else {
        searchParams.set(key, String(value));
      }
    }
  }

  return searchParams.toString();
};
