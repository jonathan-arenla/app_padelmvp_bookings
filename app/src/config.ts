const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || '';

export const config = {
  apiUrl,
  useApi: apiUrl.length > 0,
};
