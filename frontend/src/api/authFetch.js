import { api } from '../Constants';

async function authFetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });
    // Connecting to Vercel API
	const API = import.meta.env.VITE_API_URL;
	const urlRefresh = `${API}${api.API_URL_REFRESH}`;
    
    if (response.status === 401) {
      const refresh = await fetch(urlRefresh, {
        method: 'POST',
        credentials: 'include',
      });

      if (refresh.ok) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      }
  
      throw new Error('Sesión expirada');
    }
  
    return response;
  }

export default authFetch;