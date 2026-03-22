import { Movie } from "./services/api";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rank: 'Bình thường' | 'Trung bình' | 'Cao cấp' | 'VVIP';
  points: number;
  preferredCategories?: string[];
  watchlist?: string[]; // Array of movie slugs
}

export const CATEGORIES = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Chiến Tranh', slug: 'chien-tranh' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Hài Hước', slug: 'hai-huoc' },
  { name: 'Hình Sự', slug: 'hinh-su' },
  { name: 'Tâm Lý', slug: 'tam-ly' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { name: 'Võ Thuật', slug: 'vo-thuat' },
  { name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { name: 'Kinh Điển', slug: 'kinh-dien' },
  { name: 'Tài Liệu', slug: 'tai-lieu' },
  { name: 'Gia Đình', slug: 'gia-dinh' },
  { name: 'Âm Nhạc', slug: 'am-nhac' },
];

export const COUNTRIES = [
  { name: 'Việt Nam', slug: 'viet-nam' },
  { name: 'Trung Quốc', slug: 'trung-quoc' },
  { name: 'Hàn Quốc', slug: 'han-quoc' },
  { name: 'Nhật Bản', slug: 'nhat-ban' },
  { name: 'Thái Lan', slug: 'thai-lan' },
  { name: 'Âu Mỹ', slug: 'au-my' },
  { name: 'Đài Loan', slug: 'dai-loan' },
  { name: 'Hồng Kông', slug: 'hong-kong' },
  { name: 'Ấn Độ', slug: 'an-do' },
  { name: 'Pháp', slug: 'phap' },
  { name: 'Đức', slug: 'duc' },
  { name: 'Nga', slug: 'nga' },
];

export const LANGUAGES = [
  { name: 'Vietsub', slug: 'vietsub' },
  { name: 'Thuyết minh', slug: 'thuyet-minh' },
  { name: 'Lồng tiếng', slug: 'long-tieng' },
  { name: 'Tiếng Anh', slug: 'tieng-anh' },
  { name: 'Tiếng Trung', slug: 'tieng-trung' },
  { name: 'Tiếng Hàn', slug: 'tieng-han' },
];
export const AGES = ['Mọi lứa tuổi', '13+', '16+', '18+'];

export const CHAT_PRESETS = [
  "Làm sao để xem phim không bị giật?",
  "Web có app cho iOS không?",
  "Làm sao để thăng hạng VVIP?",
  "Phim bị lỗi link thì báo ở đâu?",
  "Tôi muốn yêu cầu thêm phim mới.",
  "Làm sao để đổi ảnh đại diện?",
  "Web có tốn phí không?",
  "Chất lượng phim tối đa là bao nhiêu?",
  "Có thể xem offline được không?",
  "Làm sao để đồng bộ tài khoản?"
];

export const RANK_POINTS = {
  'Bình thường': 0,
  'Trung bình': 1000,
  'Cao cấp': 5000,
  'VVIP': 20000
};
