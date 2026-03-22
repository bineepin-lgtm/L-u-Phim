export interface Movie {
  name: string;
  slug: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  cover_image_url?: string;
  current_episode: string;
  quality: string;
  language: string;
  year: number;
  time?: string;
  description?: string;
  director?: string;
  casts?: string;
  trailer_url?: string;
  category?: { name: string; slug: string }[];
  country?: { name: string; slug: string }[];
  episodes?: {
    server_name: string;
    items: {
      name: string;
      slug: string;
      embed: string;
      m3u8: string;
    }[];
  }[];
}

export interface ApiResponse {
  status: string;
  items?: Movie[];
  data?: {
    items: Movie[];
    params?: any;
  };
  [key: string]: any;
}

const BASE_URL = 'https://phimapi.com';
const IMAGE_BASE_URL = 'https://phimimg.com/upload/phim/';

const fixImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${IMAGE_BASE_URL}${url}`;
};

export const movieApi = {
  getNewUpdates: async (page = 1): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.items) {
        data.items = data.items.map((m: any) => ({
          ...m,
          poster_url: fixImageUrl(m.poster_url),
          thumb_url: fixImageUrl(m.thumb_url),
          cover_image_url: fixImageUrl(m.thumb_url)
        }));
      }
      return data;
    } catch (error) {
      console.error('getNewUpdates error:', error);
      return { status: 'error', items: [] };
    }
  },
  
  getMoviesByCategory: async (slug: string, page = 1): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/v1/api/danh-sach/${slug}?page=${page}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.data?.items) {
        data.data.items = data.data.items.map((m: any) => ({
          ...m,
          poster_url: fixImageUrl(m.poster_url),
          thumb_url: fixImageUrl(m.thumb_url),
          cover_image_url: fixImageUrl(m.thumb_url)
        }));
      }
      return data;
    } catch (error) {
      console.error('getMoviesByCategory error:', error);
      return { status: 'error', items: [] };
    }
  },
  
  getMovieDetail: async (slug: string): Promise<{ status: string; movie: Movie }> => {
    try {
      const res = await fetch(`${BASE_URL}/phim/${slug}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      if (data.movie && data.episodes) {
        data.movie.poster_url = fixImageUrl(data.movie.poster_url);
        data.movie.thumb_url = fixImageUrl(data.movie.thumb_url);
        data.movie.episodes = data.episodes.map((srv: any) => ({
          server_name: srv.server_name,
          items: srv.server_data.map((item: any) => ({
            name: item.name,
            slug: item.slug,
            embed: item.link_embed,
            m3u8: item.link_m3u8
          }))
        }));
        data.movie.description = data.movie.content;
        data.movie.current_episode = data.movie.episode_current;
        data.movie.cover_image_url = data.movie.thumb_url;
        data.movie.trailer_url = data.movie.trailer_url;
      }
      
      return { status: 'success', movie: data.movie };
    } catch (error) {
      console.error('getMovieDetail error:', error);
      return { status: 'error', movie: {} as Movie };
    }
  },
  
  getMoviesByGenre: async (slug: string, page = 1): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/v1/api/the-loai/${slug}?page=${page}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.data?.items) {
        data.data.items = data.data.items.map((m: any) => ({
          ...m,
          poster_url: fixImageUrl(m.poster_url),
          thumb_url: fixImageUrl(m.thumb_url),
          cover_image_url: fixImageUrl(m.thumb_url)
        }));
      }
      return data;
    } catch (error) {
      console.error('getMoviesByGenre error:', error);
      return { status: 'error', items: [] };
    }
  },
  
  getMoviesByCountry: async (slug: string, page = 1): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/v1/api/quoc-gia/${slug}?page=${page}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.data?.items) {
        data.data.items = data.data.items.map((m: any) => ({
          ...m,
          poster_url: fixImageUrl(m.poster_url),
          thumb_url: fixImageUrl(m.thumb_url),
          cover_image_url: fixImageUrl(m.thumb_url)
        }));
      }
      return data;
    } catch (error) {
      console.error('getMoviesByCountry error:', error);
      return { status: 'error', items: [] };
    }
  },
  
  searchMovies: async (keyword: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/v1/api/tim-kiem?keyword=${keyword}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.data?.items) {
        data.data.items = data.data.items.map((m: any) => ({
          ...m,
          poster_url: fixImageUrl(m.poster_url),
          thumb_url: fixImageUrl(m.thumb_url),
          cover_image_url: fixImageUrl(m.thumb_url)
        }));
      }
      return data;
    } catch (error) {
      console.error('searchMovies error:', error);
      return { status: 'error', items: [] };
    }
  }
};
