import React, { useState } from 'react';
import { Send, Link as LinkIcon, Globe, User as UserIcon, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const RequestMovie = ({ user }: { user: any }) => {
  const [isAnon, setIsAnon] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto glass p-8 md:p-12 rounded-[2rem] space-y-8"
    >
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-gradient font-montserrat">Yêu Cầu Phim</h1>
        <p className="text-white/60 font-quicksand font-bold">Ní muốn xem phim gì mà tôi chưa có? Gửi yêu cầu ngay nhen!</p>
      </div>

      <form className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest font-be-vietnam">Tên phim tiếng Việt (Bắt buộc)</label>
          <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all font-be-vietnam" placeholder="Ví dụ: Lẩu Phim Đại Chiến..." />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Tên phim tiếng Anh</label>
          <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all" placeholder="Ví dụ: Lau Phim The Movie..." />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Link tham khảo (Nếu có)</label>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 focus:border-primary outline-none transition-all" placeholder="https://..." />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Ngôn ngữ yêu cầu</label>
          <div className="grid grid-cols-3 gap-3">
            {['Vietsub', 'Thuyết minh', 'Lồng tiếng'].map(lang => (
              <label key={lang} className="flex items-center justify-center gap-2 p-3 glass rounded-xl cursor-pointer hover:bg-white/10 transition-all has-[:checked]:bg-primary has-[:checked]:text-white">
                <input type="radio" name="lang" className="hidden" />
                <span className="text-sm font-bold">{lang}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setIsAnon(!isAnon)}
              className={`w-12 h-6 rounded-full relative transition-colors ${isAnon ? 'bg-primary' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAnon ? 'left-7' : 'left-1'}`} />
            </button>
            <span className="text-sm text-white/60">Gửi ẩn danh nhen</span>
          </div>

          <button type="submit" className="btn-primary flex items-center gap-2 px-8 font-be-vietnam">
            <Send size={18} /> Gửi yêu cầu
          </button>
        </div>
      </form>

      <div className="pt-6 border-t border-white/10 flex items-center gap-3 text-white/40">
        <ShieldCheck size={20} className="text-green-500" />
        <p className="text-[10px] italic font-be-vietnam">Tôi cam kết bảo mật thông tin của ní, yên tâm nhen cục vàng!</p>
      </div>
    </motion.div>
  );
};
