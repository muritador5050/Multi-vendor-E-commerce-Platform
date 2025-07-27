import { apiBase } from './Api';

export const getAvatarUrl = (avatarPath: string): string => {
  if (!avatarPath) return '';

  // If it's already a full URL (starts with http), return as is
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }

  // If it's a Google image or external URL, return as is
  if (
    avatarPath.includes('googleusercontent.com') ||
    avatarPath.includes('googleapis.com')
  ) {
    return avatarPath;
  }

  const cleanPath = avatarPath.startsWith('/')
    ? avatarPath.slice(1)
    : avatarPath;
  return `${apiBase}/${cleanPath}`;
};
