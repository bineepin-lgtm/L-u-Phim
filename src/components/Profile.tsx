import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, Camera, Trophy, Star, Settings, 
  LogOut, ChevronRight, Gamepad2, Bell, Check
} from 'lucide-react';
import { User, CATEGORIES } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Profile = ({ 
  user, onLogout, onNavigate, onUpdateUser 
}: { 
  user: User; 
  onLogout: () => void; 
  onNavigate: (v: string) => void;
  onUpdateUser: (u: User) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);

  const toggleCategory = (slug: string) => {
    const currentPrefs = user.preferredCategories || [];
    const newPrefs = currentPrefs.includes(slug)
      ? currentPrefs.filter(s => s !== slug)
      : [...currentPrefs, slug];
    onUpdateUser({ ...user, preferredCategories: newPrefs });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="glass p-10 rounded-[3rem] relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 blur-[100px] -ml-32 -mb-32" />

        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full border-4 border-primary p-1 shadow-2xl shadow-primary/20">
              <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
            </div>
            <button className="absolute bottom-2 right-2 p-3 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform">
              <Camera size={20} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              {isEditing ? (
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-2xl font-black outline-none focus:border-primary"
                  />
                  <button onClick={() => {
                    onUpdateUser({ ...user, name });
                    setIsEditing(false);
                  }} className="btn-primary px-4 py-2">Lưu</button>
                </div>
              ) : (
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <h1 className="text-4xl font-black font-montserrat">{user.name}</h1>
                  <button onClick={() => setIsEditing(true)} className="text-white/40 hover:text-primary"><Settings size={20} /></button>
                </div>
              )}
              <p className="text-white/40">{user.email}</p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="px-6 py-3 glass rounded-2xl flex items-center gap-3">
                <Trophy className="text-yellow-500" />
                <div>
                  <p className="text-[10px] text-white/40 uppercase font-bold font-be-vietnam">Hạng hiện tại</p>
                  <p className="text-lg font-black text-primary font-be-vietnam">{user.rank}</p>
                </div>
              </div>
              <div className="px-6 py-3 glass rounded-2xl flex items-center gap-3">
                <Star className="text-secondary" />
                <div>
                  <p className="text-[10px] text-white/40 uppercase font-bold">Điểm tích lũy</p>
                  <p className="text-lg font-black">{user.points.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferred Categories */}
        <div className="glass p-8 rounded-3xl space-y-6 col-span-1 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-3 font-be-vietnam">
              <Bell className="text-primary" /> Thể loại yêu thích
            </h3>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Nhận thông báo phim mới</span>
          </div>
          <p className="text-sm text-white/60 font-be-vietnam">Chọn những thể loại ní thích để tôi báo cho ní mỗi khi có phim mới mlem mlem nhen! 🥰</p>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map(cat => {
              const isActive = user.preferredCategories?.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  onClick={() => toggleCategory(cat.slug)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                    isActive 
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/20" 
                      : "glass hover:bg-white/10"
                  )}
                >
                  {isActive && <Check size={12} />}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-3 font-be-vietnam">
            <Gamepad2 className="text-primary" /> Nhiệm vụ thăng hạng
          </h3>
          <p className="text-sm text-white/60 font-be-vietnam">Chơi game để nhận thêm điểm tích lũy nhen ní ơi!</p>
          <button 
            onClick={() => onNavigate('games')}
            className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group"
          >
            <span className="font-bold">Đến khu vực trò chơi</span>
            <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        <div className="glass p-8 rounded-3xl space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <LogOut className="text-red-500" /> Cài đặt tài khoản
          </h3>
          <p className="text-sm text-white/60">Đăng xuất khỏi thiết bị này nhen.</p>
          <button 
            onClick={onLogout}
            className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-bold hover:bg-red-500/20 transition-all"
          >
            Đăng xuất ngay
          </button>
        </div>
      </div>
    </div>
  );
};
