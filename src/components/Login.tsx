import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Facebook, Mail, ShieldCheck, AlertTriangle, Heart } from 'lucide-react';

export const Login = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [agreed, setAgreed] = useState(false);

  const handleSocialLogin = (provider: string) => {
    if (!agreed) {
      alert("Ní ơi, ní phải đồng ý với điều khoản của tôi mới đăng nhập được nhen! 🥰");
      return;
    }
    
    // Mock login
    onLogin({
      id: '1',
      name: 'Ní Dễ Thương',
      email: 'ni@gmail.com',
      avatar: 'https://picsum.photos/seed/ni/200/200',
      rank: 'Bình thường',
      points: 0
    });
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-[2.5rem] space-y-8 shadow-2xl border-white/10"
      >
        <div className="text-center space-y-2">
          <div className="text-5xl font-black text-gradient font-montserrat">LẨU PHIM</div>
          <p className="text-white/60 font-quicksand font-bold">Đăng nhập để đồng bộ và thăng hạng nhen!</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => handleSocialLogin('Google')}
            className="w-full flex items-center justify-center gap-4 p-4 glass rounded-2xl hover:bg-white/20 transition-all font-bold font-be-vietnam group"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            Tiếp tục với Google
          </button>

          <button 
            onClick={() => handleSocialLogin('Facebook')}
            className="w-full flex items-center justify-center gap-4 p-4 bg-[#1877F2] rounded-2xl hover:bg-[#166fe5] transition-all font-bold font-be-vietnam shadow-lg shadow-blue-500/20"
          >
            <Facebook size={24} fill="white" />
            Tiếp tục với Facebook
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 accent-primary shrink-0" 
            />
            <label htmlFor="terms" className="text-xs text-white/60 leading-relaxed cursor-pointer">
              Tôi đồng ý với các điều khoản bảo mật thông tin cá nhân. Tôi hứa sẽ không click vào các liên kết lạ xuất hiện trên trang web để tránh bị lừa đảo nhen mấy cục cưng! 🥰
            </label>
          </div>

          <div className="text-center space-y-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Điều khoản sử dụng</p>
            <div className="text-[10px] text-white/40 space-y-2 text-justify italic">
              <p>1. Lẩu Phim cam kết không làm lộ thông tin cá nhân của ní cho bất kỳ bên thứ ba nào.</p>
              <p>2. Ní vui lòng tự bảo quản tài khoản của mình, không chia sẻ mật khẩu cho người lạ nhen.</p>
              <p>3. Mọi hành vi phá hoại hoặc spam trên web sẽ bị khóa tài khoản vĩnh viễn đó ní ơi.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-pink-500">
          <Heart size={16} fill="currentColor" />
          <span className="text-xs font-bold font-quicksand">Yêu ní lắm luôn á!</span>
        </div>
      </motion.div>
    </div>
  );
};
