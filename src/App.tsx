import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Menu, Home, Globe, Languages, User as UserIcon, 
  Download, HelpCircle, X, MessageCircle, Send, Mic, 
  Play, Star, Heart, Facebook, LogIn, LogOut, Settings, ChevronRight, ChevronDown, Tv,
  Info, AlertCircle, Mail, Smile, MessageSquarePlus,
  Bell, Layers, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { movieApi, Movie } from './services/api';
import { 
  COUNTRIES, LANGUAGES, AGES, CHAT_PRESETS, 
  User, RANK_POINTS, CATEGORIES 
} from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Import sub-components
import { RequestMovie } from './components/RequestMovie';
import { Login } from './components/Login';
import { Profile } from './components/Profile';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}

const CustomSelect = ({ value, onChange, options, placeholder }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-[10px] focus:outline-none transition-all flex items-center gap-2 hover:bg-white/10 font-be-vietnam",
          isOpen && "border-primary bg-white/10"
        )}
      >
        <span className={cn(value ? "text-white" : "text-white/40")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={12} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 mt-1 w-32 glass border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[70]"
          >
            <div className="max-h-48 overflow-y-auto py-1">
              <div
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="px-3 py-1.5 text-[10px] hover:bg-white/10 cursor-pointer text-white/40 font-be-vietnam"
              >
                {placeholder}
              </div>
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={cn(
                    "px-3 py-1.5 text-[10px] hover:bg-white/10 cursor-pointer transition-colors font-be-vietnam",
                    value === opt.value ? "text-primary bg-primary/10" : "text-white/80"
                  )}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VoiceControl = ({ onResult, onCommand }: { onResult: (text: string) => void, onCommand: (cmd: string) => void }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'vi-VN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Voice Result:', transcript);
        
        // Commands parsing
        const searchPrefixes = ['tìm phim', 'tìm kiếm', 'search', 'mở phim', 'xem phim'];
        let isCommand = false;

        for (const prefix of searchPrefixes) {
          if (transcript.startsWith(prefix)) {
            const query = transcript.replace(prefix, '').trim();
            onResult(query);
            isCommand = true;
            break;
          }
        }

        if (!isCommand) {
          if (transcript.includes('về trang chủ') || transcript.includes('home')) {
            onCommand('home');
          } else if (transcript.includes('yêu thích') || transcript.includes('watchlist')) {
            onCommand('watchlist');
          } else if (transcript.includes('xóa tìm kiếm') || transcript.includes('clear search')) {
            onResult('');
          } else {
            // If no specific command, treat as search query
            onResult(transcript);
          }
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        setError(event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('not-supported');
    }
  }, [onResult, onCommand]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error('Start listening error:', e);
      }
    }
  };

  if (error === 'not-supported') return null;

  return (
    <div className="relative">
      <button 
        onClick={toggleListening}
        className={cn(
          "p-2 rounded-full transition-all relative",
          isListening ? "bg-primary text-white scale-110 shadow-lg shadow-primary/50" : "text-white/40 hover:text-primary"
        )}
        title="Tìm kiếm bằng giọng nói"
      >
        <Mic size={18} />
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-40" />
        )}
      </button>
      
      <AnimatePresence>
        {isListening && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-full right-0 mt-4 glass p-4 rounded-2xl border border-primary/30 shadow-2xl z-[100] w-64 text-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ height: [8, 24, 8] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1 bg-primary rounded-full"
                  />
                ))}
              </div>
              <p className="text-sm font-bold font-be-vietnam">Đang lắng nghe ní nói... 🥰</p>
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 italic">Ní thử nói: "Tìm phim Doraemon"</p>
                <p className="text-[10px] text-white/40 italic">"Mở phim Người Nhện" hoặc "Về trang chủ"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DownloadGuide = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-8 max-w-4xl mx-auto py-10"
    >
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-gradient font-montserrat uppercase">Tải ứng dụng Lẩu Phim</h1>
        <p className="text-white/60 font-be-vietnam text-lg">Mang cả thế giới điện ảnh mlem mlem vào điện thoại của ní chỉ với vài bước đơn giản! 🥰</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* iOS Guide */}
        <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-6 h-6 invert" alt="Apple" />
            </div>
            <h2 className="text-2xl font-bold font-montserrat">Dành cho iPhone/iPad</h2>
          </div>
          <ol className="space-y-4 text-white/70 font-be-vietnam list-decimal pl-6">
            <li>Mở trình duyệt <strong>Safari</strong> và truy cập trang web này.</li>
            <li>Nhấn vào biểu tượng <strong>Chia sẻ (Share)</strong> ở thanh công cụ phía dưới (hình vuông có mũi tên lên).</li>
            <li>Cuộn xuống và chọn <strong>Thêm vào MH chính (Add to Home Screen)</strong>.</li>
            <li>Nhấn <strong>Thêm (Add)</strong> ở góc trên bên phải.</li>
            <li>Xong rồi đó ní! Biểu tượng Lẩu Phim sẽ xuất hiện trên màn hình chính của ní nhen! 🥰</li>
          </ol>
        </div>

        {/* Android Guide */}
        <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg" className="w-8 h-8" alt="Android" />
            </div>
            <h2 className="text-2xl font-bold font-montserrat">Dành cho Android</h2>
          </div>
          <ol className="space-y-4 text-white/70 font-be-vietnam list-decimal pl-6">
            <li>Mở trình duyệt <strong>Chrome</strong> và truy cập trang web này.</li>
            <li>Nhấn vào biểu tượng <strong>3 chấm dọc</strong> ở góc trên bên phải.</li>
            <li>Chọn <strong>Cài đặt ứng dụng (Install App)</strong> hoặc <strong>Thêm vào màn hình chính</strong>.</li>
            <li>Nhấn <strong>Cài đặt (Install)</strong> để xác nhận.</li>
            <li>Tuyệt vời ông mặt trời! Giờ ní có thể mở Lẩu Phim như một ứng dụng thực thụ rồi đó! 🍿</li>
          </ol>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-primary/20 bg-primary/5 text-center space-y-4">
        <h3 className="text-xl font-bold font-be-vietnam flex items-center justify-center gap-2">
          <AlertCircle className="text-primary" /> Tại sao nên cài đặt?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-2xl">🚀</div>
            <p className="text-sm font-medium">Mở cực nhanh</p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">📱</div>
            <p className="text-sm font-medium">Trải nghiệm toàn màn hình</p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">🔔</div>
            <p className="text-sm font-medium">Nhận thông báo phim mới</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={onClose} className="btn-primary px-10">Quay lại trang chủ</button>
      </div>
    </motion.div>
  );
};

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        <div className="text-6xl md:text-8xl font-black text-gradient font-montserrat flex items-center gap-4">
          LẨU PHIM
          <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-500 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8 text-white fill-current">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </div>
      </motion.div>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-6 text-xl md:text-2xl text-white/80 font-bold italic font-quicksand"
      >
        Xem phim miễn phí chất lượng tùy tâm trạng 😊
      </motion.p>
      
      <div className="absolute bottom-10">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    </motion.div>
  );
};

interface MovieCardProps {
  movie: Movie;
  onClick: () => void | Promise<void>;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleClick = async () => {
    setIsOpening(true);
    try {
      await onClick();
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.05 }}
      onClick={handleClick}
      className="relative group cursor-pointer overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-primary/60 transition-all duration-300 shadow-lg hover:shadow-primary/20"
    >
      <div className="aspect-[2/3] relative">
        <img 
          src={movie.poster_url} 
          alt={movie.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Cover Image (Backdrop) - High quality overlay on hover */}
        {movie.cover_image_url && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
            <img 
              src={movie.cover_image_url} 
              alt={movie.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-125 group-hover:scale-100 transition-transform duration-700"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-2 right-2 px-2 py-1 glass rounded-md text-[10px] font-bold uppercase tracking-wider z-10">
          {movie.quality}
        </div>
        
        <div className="absolute bottom-2 left-2 right-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 z-10">
          <p className="text-xs text-secondary font-medium mb-1">{movie.current_episode}</p>
          <button className={cn(
            "w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all",
            isOpening ? "bg-primary/50 cursor-wait" : "bg-primary"
          )}>
            {isOpening ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} fill="currentColor" />
            )}
            {isOpening ? "ĐANG TẢI..." : "XEM NGAY"}
          </button>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isOpening && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-primary tracking-widest animate-pulse">LOADING</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors font-be-vietnam">{movie.name}</h3>
        <p className="text-[10px] text-white/50 truncate font-be-vietnam">{movie.origin_name}</p>
      </div>
    </motion.div>
  );
};

const Sidebar = ({ isOpen, onClose, onNavigate, onCountrySelect, onGenreSelect, onLanguageSelect, user }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onNavigate: (view: string) => void;
  onCountrySelect: (country: { name: string; slug: string }) => void;
  onGenreSelect: (genre: { name: string; slug: string }) => void;
  onLanguageSelect: (lang: { name: string; slug: string }) => void;
  user: User | null;
}) => {
  const [isCountriesOpen, setIsCountriesOpen] = useState(false);
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 bottom-0 z-[70] w-72 bg-[#0f0f0f] border-r border-white/10 overflow-y-auto"
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="text-2xl font-black text-gradient font-montserrat">LẨU PHIM</div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            <button onClick={() => { onNavigate('home'); onClose(); }} className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-all group font-be-vietnam">
              <Home size={20} className="group-hover:text-primary" />
              <span className="font-medium">Trang chủ</span>
            </button>
            <button onClick={() => { onNavigate('watchlist'); onClose(); }} className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-all group font-be-vietnam">
              <Heart size={20} className="group-hover:text-pink-500" />
              <span className="font-medium">Danh sách xem sau</span>
            </button>
            
            <div className="py-2">
              <p className="px-3 text-[10px] uppercase tracking-widest text-white/40 mb-2">Khám phá</p>
              <div>
                <button 
                  onClick={() => setIsCountriesOpen(!isCountriesOpen)} 
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all font-be-vietnam"
                >
                  <div className="flex items-center gap-4">
                    <Globe size={20} />
                    <span className="font-medium">Quốc gia</span>
                  </div>
                  <ChevronRight size={16} className={cn("transition-transform duration-300", isCountriesOpen ? "rotate-90" : "text-white/20")} />
                </button>
                
                <AnimatePresence>
                  {isCountriesOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-10 mt-1 space-y-1"
                    >
                      {COUNTRIES.map(country => (
                        <button 
                          key={country.slug}
                          onClick={() => { onCountrySelect(country); onClose(); }}
                          className="w-full text-left p-2 text-sm text-white/60 hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                        >
                          {country.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <button 
                  onClick={() => setIsGenresOpen(!isGenresOpen)} 
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all font-be-vietnam"
                >
                  <div className="flex items-center gap-4">
                    <Star size={20} />
                    <span className="font-medium">Thể loại</span>
                  </div>
                  <ChevronRight size={16} className={cn("transition-transform duration-300", isGenresOpen ? "rotate-90" : "text-white/20")} />
                </button>
                
                <AnimatePresence>
                  {isGenresOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-10 mt-1 space-y-1"
                    >
                      {CATEGORIES.map(genre => (
                        <button 
                          key={genre.slug}
                          onClick={() => { onGenreSelect(genre); onClose(); }}
                          className="w-full text-left p-2 text-sm text-white/60 hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                        >
                          {genre.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div>
                <button 
                  onClick={() => setIsLanguagesOpen(!isLanguagesOpen)} 
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all font-be-vietnam"
                >
                  <div className="flex items-center gap-4">
                    <Languages size={20} />
                    <span className="font-medium">Ngôn ngữ</span>
                  </div>
                  <ChevronRight size={16} className={cn("transition-transform duration-300", isLanguagesOpen ? "rotate-90" : "text-white/20")} />
                </button>
                
                <AnimatePresence>
                  {isLanguagesOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-10 mt-1 space-y-1"
                    >
                      {LANGUAGES.map(lang => (
                        <button 
                          key={lang.slug}
                          onClick={() => { onLanguageSelect(lang); onClose(); }}
                          className="w-full text-left p-2 text-sm text-white/60 hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                        >
                          {lang.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="py-2">
              <p className="px-3 text-[10px] uppercase tracking-widest text-white/40 mb-2 font-be-vietnam">Hỗ trợ</p>
              <button onClick={() => { onNavigate('request'); onClose(); }} className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-all font-be-vietnam">
                <MessageSquarePlus size={20} />
                <span className="font-medium">Yêu cầu phim</span>
              </button>
              <button onClick={() => { onNavigate('download'); onClose(); }} className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-all font-be-vietnam">
                <Download size={20} />
                <span className="font-medium">Tải ứng dụng</span>
              </button>
              <button onClick={() => { onNavigate('guide'); onClose(); }} className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-all font-be-vietnam">
                <HelpCircle size={20} />
                <span className="font-medium">Hướng dẫn sử dụng</span>
              </button>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            {user ? (
              <button onClick={() => onNavigate('profile')} className="w-full flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all font-be-vietnam">
                <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-primary" alt="" />
                <div className="text-left">
                  <p className="text-sm font-bold truncate w-32 font-be-vietnam">{user.name}</p>
                  <p className="text-[10px] text-primary font-bold font-be-vietnam">{user.rank}</p>
                </div>
              </button>
            ) : (
              <button onClick={() => onNavigate('login')} className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-bold shadow-lg shadow-purple-500/20 font-be-vietnam">
                <LogIn size={20} />
                <span>Đăng nhập ngay</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

const MovieDetail = ({ movie, onClose, onSelectMovie, user, onToggleWatchlist }: { 
  movie: Movie; 
  onClose: () => void; 
  onSelectMovie: (slug: string) => void;
  user: User | null;
  onToggleWatchlist: (movie: Movie) => void;
}) => {
  const [selectedServer, setSelectedServer] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [relatedParts, setRelatedParts] = useState<Movie[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [reviews, setReviews] = useState<{ user: string; rating: number; comment: string; date: string }[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    // Load mock reviews
    const savedReviews = localStorage.getItem(`reviews_${movie.slug}`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews([
        { user: 'Ní Ẩn Danh', rating: 5, comment: 'Phim hay xỉu ní ơi, xem mà cuốn không dứt ra được luôn á! 😍', date: '2024-03-20' },
        { user: 'Mê Phim Lẩu', rating: 4, comment: 'Cốt truyện ổn, hình ảnh đẹp, mỗi tội đợi tập mới hơi lâu nhen admin.', date: '2024-03-18' }
      ]);
    }
  }, [movie.slug]);

  const handleAddReview = () => {
    if (!user) {
      alert('Ní phải đăng nhập mới để lại review được nhen!');
      return;
    }
    if (!newReview.comment.trim()) return;
    
    const review = {
      user: user.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0]
    };
    
    const updatedReviews = [review, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${movie.slug}`, JSON.stringify(updatedReviews));
    setNewReview({ rating: 5, comment: '' });
  };

  const isInWatchlist = user?.watchlist?.includes(movie.slug);

  useEffect(() => {
    const fetchRelatedParts = async () => {
      if (!movie.name) return;
      setIsLoadingParts(true);
      try {
        // Extract base name (e.g., "John Wick 3" -> "John Wick")
        const baseName = movie.name.replace(/\s+(Phần|Season|Part|Tập)\s+\d+.*$/i, '').trim();
        const res = await movieApi.searchMovies(baseName);
        const items = Array.isArray(res) ? res : (res?.data?.items || res?.items || []);
        
        // Filter and sort parts
        const parts = items
          .filter((m: Movie) => m.slug !== movie.slug && m.name.toLowerCase().includes(baseName.toLowerCase()))
          .sort((a: Movie, b: Movie) => {
            const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
            return numA - numB;
          });
        
        setRelatedParts(parts);
      } catch (error) {
        console.error("Error fetching related parts:", error);
      } finally {
        setIsLoadingParts(false);
      }
    };
    fetchRelatedParts();
  }, [movie.slug, movie.name]);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleWatchNow = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsWatching(true);
      setIsTransitioning(false);
    }, 800);
  };

  const currentEp = movie.episodes?.[selectedServer]?.items[selectedEpisode];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#0a0a0a] overflow-y-auto"
    >
      {/* Background Blur */}
      <div className="absolute top-0 left-0 right-0 h-[70vh] overflow-hidden">
        <img 
          src={movie.thumb_url || movie.poster_url} 
          className="w-full h-full object-cover blur-3xl opacity-30 scale-110" 
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-20">
        <button 
          onClick={onClose}
          className="absolute top-4 right-6 p-3 glass rounded-full hover:bg-white/20 transition-all z-50"
        >
          <X size={24} />
        </button>

        {/* Hero Banner */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden mb-10 border border-white/10 shadow-2xl group"
        >
          <img 
            src={movie.cover_image_url || movie.thumb_url || movie.poster_url} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt={movie.name}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
          
          {/* Floating Poster Overlay */}
          <div className="absolute bottom-8 left-8 flex items-end gap-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block w-36 aspect-[2/3] rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl"
            >
              <img src={movie.poster_url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
            </motion.div>
            <div className="mb-2">
              <h1 className="text-4xl md:text-6xl font-black font-montserrat drop-shadow-lg leading-tight">{movie.name}</h1>
              <p className="text-white/60 text-lg md:text-xl font-medium italic font-quicksand drop-shadow-md">{movie.origin_name}</p>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-yellow-500 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <Star fill="currentColor" size={18} />
                  <span className="text-lg font-bold">
                    {reviews.length > 0 
                      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
                      : '4.8'}
                  </span>
                </div>
                <span className="text-white/60 text-sm font-medium bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {movie.year} • {movie.current_episode} • {movie.quality}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Poster & Info (Hidden on desktop if banner is present, or kept for details) */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="sticky top-10 space-y-8"
            >
              <div className="md:hidden">
                <img 
                  src={movie.poster_url} 
                  className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl shadow-black/50 border border-white/10" 
                  alt={movie.name} 
                />
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(movie.category) && movie.category.map(c => (
                    <span key={c.slug} className="px-4 py-1.5 glass rounded-full text-xs font-semibold tracking-wide uppercase text-white/70">{c.name}</span>
                  ))}
                </div>
                
                <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Thông tin chi tiết</h3>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div className="text-white/40">Năm phát hành:</div>
                    <div className="font-medium text-right">{movie.year}</div>
                    <div className="text-white/40">Quốc gia:</div>
                    <div className="font-medium text-right">{Array.isArray(movie.country) ? movie.country.map(c => c.name).join(', ') : 'Đang cập nhật'}</div>
                    <div className="text-white/40">Số tập:</div>
                    <div className="font-medium text-right">{movie.current_episode}</div>
                    <div className="text-white/40">Đạo diễn:</div>
                    <div className="font-medium text-right">{movie.director || 'Đang cập nhật'}</div>
                    <div className="text-white/40">Chất lượng:</div>
                    <div className="font-medium text-right text-secondary">{movie.quality}</div>
                    <div className="text-white/40">Ngôn ngữ:</div>
                    <div className="font-medium text-right">{movie.language}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Player & Details */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <button 
                  onClick={handleWatchNow}
                  disabled={isTransitioning}
                  className={cn(
                    "btn-primary flex items-center gap-3 text-lg px-12 py-4 font-bold tracking-wider transition-all",
                    isTransitioning && "opacity-80 scale-95"
                  )}
                >
                  {isTransitioning ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Play fill="currentColor" size={24} />
                  )}
                  {isTransitioning ? "ĐANG CHUẨN BỊ..." : "XEM NGAY"}
                </button>
                <button 
                  onClick={() => setShowTrailer(!showTrailer)}
                  className="glass flex items-center gap-3 text-lg px-8 py-4 font-bold hover:bg-white/10 transition-all rounded-xl border border-white/10"
                >
                  <Tv size={24} /> TRAILER
                </button>
                <button 
                  onClick={() => onToggleWatchlist(movie)}
                  className={cn(
                    "p-4 glass rounded-full transition-all border border-white/10",
                    isInWatchlist ? "text-pink-500 bg-pink-500/10 border-pink-500/20" : "hover:text-pink-500"
                  )}
                  title={isInWatchlist ? "Xóa khỏi danh sách xem sau" : "Thêm vào danh sách xem sau"}
                >
                  <Heart size={24} fill={isInWatchlist ? "currentColor" : "none"} />
                </button>
              </div>

              {showTrailer && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-primary/30 shadow-2xl shadow-primary/10">
                    {movie.trailer_url ? (
                      <iframe 
                        src={movie.trailer_url.replace('watch?v=', 'embed/')} 
                        className="w-full h-full" 
                        allowFullScreen 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-4">
                        <Tv size={64} />
                        <p className="font-be-vietnam">Trailer hiện chưa có, ní thông cảm nhen! 😅</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Related Parts Selector */}
              {relatedParts.length > 0 && (
                <div className="glass p-6 rounded-2xl mb-8 border-l-4 border-primary">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 font-be-vietnam">
                    <Layers size={20} className="text-primary" /> Các phần phim liên quan
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {/* Current Part */}
                    <div className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 border border-primary/50">
                      {movie.name.match(/(Phần|Season|Part|Tập)\s+\d+/i)?.[0] || "Phần hiện tại"}
                    </div>
                    
                    {/* Other Parts */}
                    {relatedParts.map(part => (
                      <button
                        key={part.slug}
                        onClick={() => onSelectMovie(part.slug)}
                        className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition-all font-bold border border-white/5"
                      >
                        {part.name.match(/(Phần|Season|Part|Tập)\s+\d+/i)?.[0] || part.name}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] text-white/30 italic font-be-vietnam">* Ní có thể chọn các phần khác của bộ phim này ở đây nhen!</p>
                </div>
              )}

              <div className="glass p-6 rounded-2xl mb-8">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 font-be-vietnam">
                  <Info size={20} className="text-primary" /> Nội dung phim
                </h3>
                <p className="text-white/70 leading-relaxed text-justify font-be-vietnam" dangerouslySetInnerHTML={{ __html: movie.description || 'Đang cập nhật nội dung...' }} />
              </div>

              {isWatching && currentEp && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden mb-8 border border-white/10 shadow-2xl shadow-primary/5"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-0">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-primary font-bold tracking-widest animate-pulse font-be-vietnam">ĐANG TẢI PHIM...</p>
                    </div>
                  </div>
                  <iframe 
                    src={currentEp.embed} 
                    className="relative w-full h-full z-10" 
                    allowFullScreen 
                    onLoad={(e) => {
                      const target = e.target as HTMLIFrameElement;
                      const loader = target.previousElementSibling;
                      if (loader) {
                        (loader as HTMLElement).style.display = 'none';
                      }
                    }}
                  />
                </motion.div>
              )}

              {/* Episodes List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-be-vietnam">Danh sách tập phim</h3>
                  <div className="flex gap-2">
                    {Array.isArray(movie.episodes) && movie.episodes.map((server, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedServer(idx)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold transition-all font-be-vietnam",
                          selectedServer === idx ? "bg-primary" : "glass hover:bg-white/20"
                        )}
                      >
                        {server.server_name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {Array.isArray(movie.episodes?.[selectedServer]?.items) && movie.episodes[selectedServer].items.map((ep, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedEpisode(idx);
                        setIsWatching(true);
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className={cn(
                        "aspect-square rounded-xl flex items-center justify-center font-bold transition-all",
                        selectedEpisode === idx && isWatching ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white" : "glass hover:bg-white/20"
                      )}
                    >
                      {ep.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-16 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black font-montserrat">Đánh giá từ mấy ní</h3>
                  <div className="flex items-center gap-2 text-primary">
                    <Star fill="currentColor" size={20} />
                    <span className="font-bold">Góp ý để web xịn hơn nhen</span>
                  </div>
                </div>

                {/* Add Review */}
                <div className="glass p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-bold font-be-vietnam">Ní chấm mấy sao:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star}
                          onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                          className={cn(
                            "transition-all hover:scale-125",
                            newReview.rating >= star ? "text-yellow-500" : "text-white/20"
                          )}
                        >
                          <Star fill={newReview.rating >= star ? "currentColor" : "none"} size={24} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea 
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Ní thấy phim này sao? Chia sẻ cảm nhận cho mọi người cùng biết nhen..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary min-h-[100px] mb-4 font-be-vietnam"
                  />
                  <button 
                    onClick={handleAddReview}
                    className="btn-primary px-8 py-3 font-bold font-be-vietnam"
                  >
                    Gửi đánh giá ngay
                  </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass p-6 rounded-2xl border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                            {review.user[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{review.user}</p>
                            <p className="text-[10px] text-white/30">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed font-be-vietnam">{review.comment}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Reactions */}
              <div className="mt-12 flex items-center gap-4">
                <span className="text-sm font-medium text-white/50">Cảm xúc nhanh:</span>
                <div className="flex gap-3">
                  {['🥰', '😂', '😭', '😱', '🔥', '👍'].map(emoji => (
                    <button key={emoji} className="text-2xl hover:scale-125 transition-transform active:scale-90">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ChatSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: "Chào ní! Tôi là Lẩu Bot nè. Ní cần tôi giúp gì không?", isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { text, isBot: false }]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Xin lỗi ní nhen, ní hỏi câu hỏi này hơi khó, tôi xin phép gửi câu hỏi này đến cho admin dễ thương trả lời nha. Thường sẽ nhận được câu trả lời trong vài ngày hoặc vài giờ đó ní ơi, ní thông cảm nhen, yêu ní lắm! 🥰", 
        isBot: true 
      }]);
    }, 1000);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80 md:w-96 h-[500px] glass rounded-3xl flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-4 bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Smile className="text-white" />
                </div>
                <div>
                  <p className="font-bold">Lẩu Bot Hỗ Trợ</p>
                  <p className="text-[10px] text-white/70">Đang trực tuyến</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.isBot ? "justify-start" : "justify-end")}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm",
                    m.isBot ? "bg-white/10 rounded-tl-none" : "bg-primary rounded-tr-none"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              
              <div className="pt-4 space-y-2">
                <p className="text-[10px] text-white/40 uppercase tracking-widest px-2">Gợi ý cho ní</p>
                <div className="flex flex-wrap gap-2">
                  {CHAT_PRESETS.slice(0, 4).map(p => (
                    <button 
                      key={p} 
                      onClick={() => handleSend(p)}
                      className="text-[10px] glass px-3 py-1 rounded-full hover:bg-white/20 transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Nhập tin nhắn..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button 
                onClick={() => handleSend(input)}
                className="p-2 bg-primary rounded-full hover:scale-110 transition-transform"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/40 hover:scale-110 transition-transform"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-white/10 bg-black/40 backdrop-blur-xl py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="text-4xl font-black text-gradient font-montserrat mb-4">LẨU PHIM</div>
        <p className="text-white/60 mb-8 max-w-2xl font-be-vietnam">
          Trang web này được tạo ra nhằm mục đích giải trí, không khuyến khích cho việc xem phim không bản quyền. Nếu có điều kiện, bạn nên ủng hộ tác giả bằng cách xem phim ở những trang chính thống có bản quyền hợp pháp nhé! 🥰 Chúc bạn có thời gian giải trí và trải nghiệm thật vui vẻ tại web/app Lẩu Phim nhen!
        </p>

        <div className="flex gap-6 mb-10">
          <a href="#" className="w-12 h-12 glass rounded-full flex items-center justify-center hover:text-primary hover:scale-110 transition-all">
            <Facebook size={24} />
          </a>
          <a href="#" className="w-12 h-12 glass rounded-full flex items-center justify-center hover:text-primary hover:scale-110 transition-all">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.03-2.85-.31-4.13-1.03-2.28-1.29-3.55-3.91-3.05-6.44.19-1.16.73-2.25 1.59-3.07 1.37-1.38 3.43-2.02 5.35-1.65.12-4.26.04-8.51.05-12.77z" />
            </svg>
          </a>
        </div>

        <div className="relative mb-8">
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-pink-500">❤️</div>
          <div className="px-8 py-3 border-2 border-white/10 rounded-full text-sm font-bold font-quicksand">
            Lẩu Phim cung cấp phim hay, miễn phí chất lượng tùy tâm trạng nhen mấy ní yêu
          </div>
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-pink-500">❤️</div>
        </div>

        <p className="text-[10px] text-white/30 tracking-widest uppercase">@LAUPHIM2026</p>
      </div>
    </footer>
  );
};

const NotificationToast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-24 right-6 z-[100] glass p-4 rounded-2xl shadow-2xl border-l-4 border-primary max-w-xs"
    >
      <div className="flex gap-3">
        <div className="bg-primary/20 p-2 rounded-full h-fit">
          <Bell className="text-primary" size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">Thông báo mới!</p>
          <p className="text-xs text-white/70 mt-1">{message}</p>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [movies, setMovies] = useState<{
    recommended: Movie[];
    hot: Movie[];
    topRated: Movie[];
    foreign: Movie[];
  }>({
    recommended: [],
    hot: [],
    topRated: [],
    foreign: []
  });
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    year: '',
    quality: '',
    language: ''
  });
  const [view, setView] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, { id: Date.now().toString(), message }]);
  };
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; slug: string } | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<{ name: string; slug: string } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<{ name: string; slug: string } | null>(null);
  const [filterMovies, setFilterMovies] = useState<Movie[]>([]);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);
  const [filterPage, setFilterPage] = useState(1);
  const [totalFilterPages, setTotalFilterPages] = useState(1);
  const [filterType, setFilterType] = useState<'country' | 'genre' | 'language' | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'dark',
    font: localStorage.getItem('font') || 'montserrat'
  });

  useEffect(() => {
    const body = document.body;
    body.classList.remove('light-theme');
    
    if (settings.theme === 'light') body.classList.add('light-theme');
    
    localStorage.setItem('theme', settings.theme);
  }, [settings]);

  const getItems = (res: any) => {
    if (Array.isArray(res)) return res;
    if (res?.items && Array.isArray(res.items)) return res.items;
    if (res?.data?.items && Array.isArray(res.data.items)) return res.data.items;
    if (res?.data && Array.isArray(res.data)) return res.data;
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [newRes, hotRes, topRes, foreignRes] = await Promise.all([
          movieApi.getNewUpdates(1),
          movieApi.getMoviesByCategory('phim-le', 1),
          movieApi.getMoviesByCategory('phim-bo', 1),
          movieApi.getMoviesByCountry('au-my', 1)
        ]);
        
        const recommended = getItems(newRes);
        const hot = getItems(hotRes);
        const topRated = getItems(topRes);
        const foreign = getItems(foreignRes);

        console.log('Fetched movies:', { recommended, hot, topRated, foreign });

        setMovies({
          recommended: recommended.slice(0, 12),
          hot: hot.slice(0, 12),
          topRated: topRated.slice(0, 12),
          foreign: foreign.slice(0, 12)
        });
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!user || !user.preferredCategories || user.preferredCategories.length === 0) return;

    const checkNewMovies = async () => {
      try {
        const res = await movieApi.getNewUpdates(1);
        const items = getItems(res);
        
        const matchingMovies = items.filter(movie => 
          movie.category?.some(cat => user.preferredCategories?.includes(cat.slug))
        );

        if (matchingMovies.length > 0) {
          const latestMovie = matchingMovies[0];
          const lastSeenId = localStorage.getItem(`lastSeenMovieId_${user.id}`);
          
          if (latestMovie.slug !== lastSeenId) {
            addNotification(`Phim mới: ${latestMovie.name} vừa được cập nhật đó ní ơi! 🥰`);
            localStorage.setItem(`lastSeenMovieId_${user.id}`, latestMovie.slug);
          }
        }
      } catch (error) {
        console.error("Notification check error:", error);
      }
    };

    const interval = setInterval(checkNewMovies, 120000);
    checkNewMovies();

    return () => clearInterval(interval);
  }, [user?.preferredCategories, user?.id]);

  useEffect(() => {
    if (!user) return;

    const checkMidnightWatcher = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Check if it's between 23:00 and 02:00
      if (hour >= 23 || hour < 2) {
        const lastCheck = localStorage.getItem(`midnight_watcher_${user.id}`);
        const today = new Date().toDateString();
        
        if (lastCheck !== today) {
          // In a real app, we'd check watch history here
          // For now, we'll simulate it if they are on the site during these hours
          const watchCount = parseInt(localStorage.getItem(`watch_count_${user.id}`) || '0');
          if (watchCount >= 2) {
            handleEarnPoints(200);
            localStorage.setItem(`midnight_watcher_${user.id}`, today);
            addNotification("Slay quá ní ơi, thức khuya xem phim mà vẫn thần thái, tặng ní 200đ nè! 🦉");
          }
        }
      }
    };

    const interval = setInterval(checkMidnightWatcher, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const res = await movieApi.searchMovies(query);
        let items = getItems(res);
        
        // Apply advanced filters locally
        if (searchFilters.year) {
          items = items.filter((m: Movie) => m.year?.toString() === searchFilters.year);
        }
        if (searchFilters.quality) {
          items = items.filter((m: Movie) => m.quality?.toLowerCase().includes(searchFilters.quality.toLowerCase()));
        }
        if (searchFilters.language) {
          items = items.filter((m: Movie) => m.language?.toLowerCase().includes(searchFilters.language.toLowerCase()));
        }
        
        setSearchResults(items);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch(searchQuery);
    }
  }, [searchFilters]);

  const toggleWatchlist = (movie: Movie) => {
    if (!user) {
      setView('login');
      return;
    }
    const currentWatchlist = user.watchlist || [];
    const isAdded = currentWatchlist.includes(movie.slug);
    
    let newWatchlist;
    if (isAdded) {
      newWatchlist = currentWatchlist.filter(slug => slug !== movie.slug);
      addNotification(`Đã xóa ${movie.name} khỏi danh sách xem sau!`);
    } else {
      newWatchlist = [...currentWatchlist, movie.slug];
      addNotification(`Đã thêm ${movie.name} vào danh sách xem sau!`);
    }
    
    const updatedUser = { ...user, watchlist: newWatchlist };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const openMovie = async (slug: string) => {
    try {
      const res = await movieApi.getMovieDetail(slug);
      if (res && res.movie) {
        setSelectedMovie(res.movie);
      } else {
        alert("Ní ơi, tôi không tìm thấy thông tin phim này rồi! 🥺");
      }
    } catch (error) {
      console.error("Error fetching movie detail:", error);
      alert("Ní ơi, có lỗi khi lấy thông tin phim rồi, ní thử lại nhen! 🥰");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const handleEarnPoints = (p: number) => {
    if (!user) return;
    const newPoints = user.points + p;
    let newRank = user.rank;
    
    if (newPoints >= RANK_POINTS['VVIP']) newRank = 'VVIP';
    else if (newPoints >= RANK_POINTS['Cao cấp']) newRank = 'Cao cấp';
    else if (newPoints >= RANK_POINTS['Trung bình']) newRank = 'Trung bình';

    setUser({ ...user, points: newPoints, rank: newRank });
  };

  const handleCountrySelect = async (country: { name: string; slug: string }) => {
    setSelectedCountry(country);
    setSelectedGenre(null);
    setSelectedLanguage(null);
    setFilterType('country');
    setFilterPage(1);
    setView('filter');
    setIsSidebarOpen(false);
    fetchFilterMovies('country', country.slug, 1);
  };

  const handleGenreSelect = async (genre: { name: string; slug: string }) => {
    setSelectedGenre(genre);
    setSelectedCountry(null);
    setSelectedLanguage(null);
    setFilterType('genre');
    setFilterPage(1);
    setView('filter');
    setIsSidebarOpen(false);
    fetchFilterMovies('genre', genre.slug, 1);
  };

  const handleLanguageSelect = async (lang: { name: string; slug: string }) => {
    setSelectedLanguage(lang);
    setSelectedCountry(null);
    setSelectedGenre(null);
    setFilterType('language');
    setFilterPage(1);
    setView('filter');
    setIsSidebarOpen(false);
    fetchFilterMovies('language', lang.slug, 1);
  };

  const fetchFilterMovies = async (type: 'country' | 'genre' | 'language', slug: string, page: number) => {
    setIsLoadingFilter(true);
    try {
      let res;
      if (type === 'country') res = await movieApi.getMoviesByCountry(slug, page);
      else if (type === 'genre') res = await movieApi.getMoviesByGenre(slug, page);
      else res = await movieApi.getMoviesByCategory(slug, page);

      const items = getItems(res);
      setFilterMovies(items);
      
      // Calculate total pages from API response if available, otherwise default to 10
      const totalItems = res?.data?.params?.pagination?.totalItems || 200;
      const itemsPerPage = res?.data?.params?.pagination?.totalItemsPerPage || 20;
      setTotalFilterPages(Math.ceil(totalItems / itemsPerPage));
    } catch (error) {
      console.error("Fetch filter movies error:", error);
      setFilterMovies([]);
    } finally {
      setIsLoadingFilter(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalFilterPages) return;
    setFilterPage(newPage);
    const slug = filterType === 'country' ? selectedCountry?.slug : 
                 filterType === 'genre' ? selectedGenre?.slug : 
                 selectedLanguage?.slug;
    if (slug && filterType) fetchFilterMovies(filterType, slug, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownload = (type: 'phone' | 'tv') => {
    setDownloading(type);
    
    // Simulate download delay
    setTimeout(() => {
      const fileName = type === 'phone' ? 'LauPhim_Mobile_v1.0.apk' : 'LauPhim_TV_v1.0.apk';
      const dummyContent = "This is a simulated Lau Phim app binary file.";
      const blob = new Blob([dummyContent], { type: 'application/vnd.android.package-archive' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloading(null);
    }, 2000);
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            <div 
              onClick={() => setView('home')}
              className="text-2xl font-black text-gradient font-montserrat cursor-pointer hidden md:block"
            >
              LẨU PHIM
            </div>
          </div>

          <div className="flex-1 max-w-2xl space-y-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tìm phim mlem mlem..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-12 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <VoiceControl 
                  onResult={(text) => handleSearch(text)}
                  onCommand={(cmd) => {
                    if (cmd === 'home') setView('home');
                    if (cmd === 'watchlist') setView('watchlist');
                  }}
                />
              </div>
            </div>
            
            {/* Advanced Filters */}
            <div className="flex flex-wrap gap-2 px-2">
              <CustomSelect 
                value={searchFilters.year}
                onChange={(val) => setSearchFilters(prev => ({ ...prev, year: val }))}
                placeholder="Năm (Tất cả)"
                options={[2024, 2023, 2022, 2021, 2020, 2019, 2018].map(y => ({ label: y.toString(), value: y.toString() }))}
              />
              <CustomSelect 
                value={searchFilters.quality}
                onChange={(val) => setSearchFilters(prev => ({ ...prev, quality: val }))}
                placeholder="Chất lượng"
                options={[
                  { label: 'Full HD', value: 'FHD' },
                  { label: 'HD', value: 'HD' },
                  { label: 'Bản CAM', value: 'CAM' }
                ]}
              />
              <CustomSelect 
                value={searchFilters.language}
                onChange={(val) => setSearchFilters(prev => ({ ...prev, language: val }))}
                placeholder="Ngôn ngữ"
                options={[
                  { label: 'Vietsub', value: 'Vietsub' },
                  { label: 'Thuyết Minh', value: 'Thuyết Minh' },
                  { label: 'Lồng Tiếng', value: 'Lồng Tiếng' }
                ]}
              />
              {(searchFilters.year || searchFilters.quality || searchFilters.language) && (
                <button 
                  onClick={() => setSearchFilters({ year: '', quality: '', language: '' })}
                  className="text-[10px] text-primary hover:underline font-bold px-1"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {isSearching && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl overflow-hidden shadow-2xl z-[60]"
                >
                  {searchResults.length > 0 ? (
                    <div className="max-h-[400px] overflow-y-auto p-2">
                      {searchResults.map(movie => (
                        <div 
                          key={movie.slug}
                          onClick={() => {
                            openMovie(movie.slug);
                            setIsSearching(false);
                            setSearchQuery('');
                          }}
                          className="flex gap-4 p-2 hover:bg-white/10 rounded-xl cursor-pointer transition-all group"
                        >
                          <img src={movie.poster_url} className="w-12 h-16 object-cover rounded-md" alt="" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate group-hover:text-primary">{movie.name}</p>
                            <p className="text-[10px] text-white/40 truncate italic">{movie.origin_name}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] px-1.5 py-0.5 glass rounded text-secondary">{movie.current_episode}</span>
                              <span className="text-[9px] px-1.5 py-0.5 glass rounded text-white/40">{movie.language}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-sm text-white/60 mb-2">Ui xin lỗi cục vàng nhen, phim này chắc tôi chưa cập nhật rồi, mấy ní thông cảm nhen! 🥺</p>
                      <p className="text-[10px] text-white/40">Mấy cục vàng có thể yêu cầu phim ở thanh menu để tôi sớm cập nhật nhen!</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('settings')}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-primary"
              title="Cài đặt giao diện"
            >
              <Settings size={24} />
            </button>
            {user ? (
              <img 
                onClick={() => setView('profile')}
                src={user.avatar} 
                className="w-10 h-10 rounded-full border-2 border-primary cursor-pointer hover:scale-110 transition-transform" 
                alt="" 
              />
            ) : (
              <button 
                onClick={() => setView('login')}
                className="btn-primary hidden sm:flex items-center gap-2"
              >
                <LogIn size={18} /> Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {isLoading && view === 'home' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-white/60 font-quicksand font-bold">Đang tải phim mlem mlem cho ní nè... 🥰</p>
          </div>
        )}

        {!isLoading && view === 'home' && movies.recommended.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <p className="text-xl font-bold text-white/60">Ui ní ơi, tôi không tìm thấy phim nào hết trơn! 🥺</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Thử tải lại trang nhen
            </button>
          </div>
        )}

        {view === 'home' && movies.recommended.length > 0 && (
          <div className="space-y-12">
            {/* Hero Section / Featured */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black flex items-center gap-3 font-montserrat">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  Phim đề xuất
                </h2>
                <button className="text-sm text-white/40 hover:text-primary transition-all font-be-vietnam">Xem tất cả</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {movies.recommended.map(movie => (
                  <MovieCard key={movie.slug} movie={movie} onClick={() => openMovie(movie.slug)} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6 flex items-center gap-3 font-montserrat">
                <div className="w-2 h-8 bg-secondary rounded-full" />
                Phim đang hot
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {movies.hot.map(movie => (
                  <MovieCard key={movie.slug} movie={movie} onClick={() => openMovie(movie.slug)} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6 flex items-center gap-3 font-montserrat">
                <div className="w-2 h-8 bg-accent rounded-full" />
                Đánh giá cao nhất
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {movies.topRated.map(movie => (
                  <MovieCard key={movie.slug} movie={movie} onClick={() => openMovie(movie.slug)} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black flex items-center gap-3 font-montserrat">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" />
                  Phim nước ngoài
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {COUNTRIES.slice(1, 10).map(c => (
                    <motion.button 
                      key={c.slug} 
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCountrySelect(c)}
                      className="px-5 py-2 glass rounded-full text-xs font-bold whitespace-nowrap hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-500 hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                    >
                      {c.name}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {movies.foreign.map(movie => (
                  <MovieCard key={movie.slug} movie={movie} onClick={() => openMovie(movie.slug)} />
                ))}
              </div>
            </section>
          </div>
        )}

        {view === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-12"
          >
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-black text-gradient font-montserrat uppercase">Cài đặt giao diện</h1>
              <p className="text-white/60 font-be-vietnam">Tùy chỉnh Lẩu Phim theo phong cách của riêng ní nhen! 🥰</p>
            </div>

            <div className="space-y-8">
              <div className="glass p-8 rounded-3xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 font-be-vietnam">
                  <Smile className="text-primary" /> Chủ đề hiển thị
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <button 
                    onClick={() => setSettings({ ...settings, theme: 'dark' })}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                      settings.theme === 'dark' ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="w-12 h-12 bg-[#0a0a0a] rounded-full border border-white/20" />
                    <span className="font-bold">Chế độ Tối</span>
                  </button>
                  <button 
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                      settings.theme === 'light' ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/20 text-black"
                    )}
                  >
                    <div className="w-12 h-12 bg-[#f5f5f5] rounded-full border border-black/10" />
                    <span className="font-bold">Chế độ Sáng</span>
                  </button>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 font-be-vietnam">
                  <Languages className="text-accent" /> Phông chữ hệ thống
                </h3>
                <p className="text-white/60 font-be-vietnam">
                  Ứng dụng đang sử dụng bộ phông chữ tối ưu: Montserrat (Tiêu đề), Quicksand (Thông báo) và Be Vietnam Pro (Nội dung).
                </p>
              </div>

              <div className="flex justify-center pt-6">
                <button 
                  onClick={() => setView('home')}
                  className="btn-primary"
                >
                  Lưu và quay lại trang chủ
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'download' && (
          <DownloadGuide onClose={() => setView('home')} />
        )}

        {view === 'filter' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h1 className="text-5xl font-black text-gradient font-montserrat uppercase">
                  {filterType === 'country' ? selectedCountry?.name : 
                   filterType === 'genre' ? selectedGenre?.name : 
                   selectedLanguage?.name}
                </h1>
                <p className="text-white/60 font-be-vietnam">
                  Tìm thấy {filterMovies.length} bộ phim cực phẩm cho ní nhen!
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                  <span className="text-xs font-bold text-white/40 uppercase">Trang</span>
                  <input 
                    type="number" 
                    value={filterPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) handlePageChange(val);
                    }}
                    className="w-12 bg-transparent text-center font-bold outline-none"
                    min={1}
                    max={totalFilterPages}
                  />
                  <span className="text-xs font-bold text-white/40">/ {totalFilterPages}</span>
                </div>
              </div>
            </div>

            {isLoadingFilter ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-white/40 font-bold animate-pulse">Đang lùng sục phim cho ní...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filterMovies.map(movie => (
                    <MovieCard key={movie.slug} movie={movie} onClick={() => openMovie(movie.slug)} />
                  ))}
                </div>

                {totalFilterPages > 1 && (
                  <div className="flex justify-center items-center gap-4 pt-12">
                    <button 
                      onClick={() => handlePageChange(filterPage - 1)}
                      disabled={filterPage === 1}
                      className="p-4 glass rounded-2xl hover:bg-white/10 disabled:opacity-30 transition-all font-bold"
                    >
                      Trang trước
                    </button>
                    <div className="flex gap-2 overflow-x-auto max-w-[300px] sm:max-w-none no-scrollbar py-2">
                      {[...Array(totalFilterPages)].map((_, i) => {
                        const p = i + 1;
                        // Show first, last, and pages around current
                        if (
                          p === 1 || 
                          p === totalFilterPages || 
                          (p >= filterPage - 2 && p <= filterPage + 2)
                        ) {
                          return (
                            <button
                              key={p}
                              onClick={() => handlePageChange(p)}
                              className={cn(
                                "w-12 h-12 min-w-[3rem] rounded-xl font-bold transition-all",
                                filterPage === p ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass hover:bg-white/10"
                              )}
                            >
                              {p}
                            </button>
                          );
                        }
                        if (p === filterPage - 3 || p === filterPage + 3) {
                          return <span key={p} className="w-8 flex items-center justify-center text-white/20">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    <button 
                      onClick={() => handlePageChange(filterPage + 1)}
                      disabled={filterPage === totalFilterPages}
                      className="p-4 glass rounded-2xl hover:bg-white/10 disabled:opacity-30 transition-all font-bold"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {view === 'guide' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto glass p-10 rounded-3xl"
          >
            <h1 className="text-4xl font-black mb-6 text-gradient">Hướng dẫn & Giới thiệu</h1>
            <div className="space-y-6 text-white/80 leading-relaxed">
              <p>Chào mừng ní đã đến với <strong>LẨU PHIM</strong> - Nơi hội tụ những tinh hoa điện ảnh "mlem mlem" nhất quả đất!</p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-secondary">1. Cách xem phim</h3>
                <p>Ní chỉ cần chọn bộ phim mình thích, bấm nút "Xem ngay" là hệ thống sẽ tự động đưa ní đến tập 1. Ní có thể chọn server hoặc ngôn ngữ (Vietsub, Lồng tiếng, Thuyết minh) tùy ý nhen.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-secondary">2. Hệ thống tài khoản</h3>
                <p>Đăng nhập bằng Google hoặc Facebook để đồng bộ lịch sử xem phim trên mọi thiết bị. Càng xem nhiều, ní càng tích được nhiều điểm để thăng hạng từ Bình thường lên VVIP đó!</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-secondary">3. Tải ứng dụng</h3>
                <p>Hiện tại ứng dụng chỉ hỗ trợ cho Android và Android TV. Mấy ní dùng iOS hay webOS thì chịu khó xem trên trình duyệt web để có trải nghiệm tốt nhất nhen, tôi hứa là trang web mượt như nhung luôn!</p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 italic">
                "Lẩu Phim không chỉ là một trang web, nó là một tâm hồn ăn uống... à nhầm, tâm hồn yêu phim. Chúc ní có những giây phút thư giãn thật slay nhen!"
              </div>
            </div>
          </motion.div>
        )}

        {view === 'download' && (
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h1 className="text-5xl font-black text-gradient">Tải App Lẩu Phim</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-3xl space-y-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 text-green-500 fill-current">
                    <path d="M17.523 15.3414L20.355 20.247C20.535 20.559 20.427 20.958 20.115 21.138C20.019 21.194 19.911 21.222 19.803 21.222C19.587 21.222 19.383 21.114 19.263 20.91L16.383 15.921C13.563 17.217 10.437 17.217 7.617 15.921L4.737 20.91C4.617 21.114 4.413 21.222 4.197 21.222C4.089 21.222 3.981 21.194 3.885 21.138C3.573 20.958 3.465 20.559 3.645 20.247L6.477 15.3414C3.147 13.5414 1 10.0434 1 6.11344V5.66344H23V6.11344C23 10.0434 20.853 13.5414 17.523 15.3414ZM7 10.6634C7.55228 10.6634 8 10.2157 8 9.66344C8 9.11115 7.55228 8.66344 7 8.66344C6.44772 8.66344 6 9.11115 6 9.66344C6 10.2157 6.44772 10.6634 7 10.6634ZM17 10.6634C17.5523 10.6634 18 10.2157 18 9.66344C18 9.11115 17.5523 8.66344 17 8.66344C16.4477 8.66344 16 9.11115 16 9.66344C16 10.2157 16.4477 10.6634 17 10.6634Z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Android Phone</h3>
                <button 
                  onClick={() => handleDownload('phone')}
                  disabled={downloading !== null}
                  className={cn(
                    "btn-primary w-full flex items-center justify-center gap-2",
                    downloading === 'phone' && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {downloading === 'phone' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Tải APK ngay
                    </>
                  )}
                </button>
              </div>
              <div className="glass p-8 rounded-3xl space-y-6">
                <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Tv className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold">Android TV</h3>
                <button 
                  onClick={() => handleDownload('tv')}
                  disabled={downloading !== null}
                  className={cn(
                    "btn-primary w-full flex items-center justify-center gap-2",
                    downloading === 'tv' && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {downloading === 'tv' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Tải cho TV
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4 text-left">
              <AlertCircle className="text-red-500 shrink-0" />
              <p className="text-sm text-red-200">
                Phiên bản ứng dụng chỉ sử dụng được cho điện thoại và TV Android, các hệ điều hành như iOS, webOS sẽ không được hỗ trợ. Bạn nên xem tại trang web để có trải nghiệm tốt nhất, xin cảm ơn!
              </p>
            </div>
          </div>
        )}

        {view === 'watchlist' && (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black text-gradient font-montserrat">DANH SÁCH XEM SAU</h1>
              <div className="px-4 py-2 glass rounded-xl text-xs font-bold text-primary">
                {user?.watchlist?.length || 0} PHIM
              </div>
            </div>
            
            {(!user?.watchlist || user.watchlist.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl border border-dashed border-white/20">
                <Heart size={64} className="text-white/10 mb-4" />
                <p className="text-xl font-bold text-white/40 font-be-vietnam">Ní chưa thêm phim nào vào danh sách hết trơn á!</p>
                <button 
                  onClick={() => setView('home')}
                  className="mt-6 btn-primary px-8 py-3 font-bold font-be-vietnam"
                >
                  Khám phá phim ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {/* We need to fetch these movies or have them in state. 
                    For now, we'll show a message or try to find them in existing state */}
                <p className="col-span-full text-center text-white/40 italic">
                  * Tính năng này đang được admin dễ thương hoàn thiện nhen ní! 
                  Hiện tại ní có thể xem danh sách các phim ní đã "thả tim" ở đây.
                </p>
              </div>
            )}
          </div>
        )}

        {view === 'request' && <RequestMovie user={user} />}
        {view === 'login' && <Login onLogin={(u) => { setUser(u); setView('home'); }} />}
        {view === 'profile' && user && (
          <Profile 
            user={user} 
            onLogout={handleLogout} 
            onNavigate={setView} 
            onUpdateUser={setUser} 
          />
        )}
      </main>

      {/* Sidebar */}
      <AnimatePresence>
        {notifications.map(notif => (
          <NotificationToast 
            key={notif.id} 
            message={notif.message} 
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} 
          />
        ))}
      </AnimatePresence>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={setView}
        onCountrySelect={handleCountrySelect}
        onGenreSelect={handleGenreSelect}
        onLanguageSelect={handleLanguageSelect}
        user={user}
      />

      {/* Movie Detail Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <MovieDetail 
            movie={selectedMovie} 
            onClose={() => setSelectedMovie(null)} 
            onSelectMovie={openMovie}
            user={user}
            onToggleWatchlist={toggleWatchlist}
          />
        )}
      </AnimatePresence>

      {/* Chat Support */}
      <ChatSupport />

      {/* Footer */}
      <Footer />
    </div>
  );
}
