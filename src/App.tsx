/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Video as VideoIcon, 
  Upload, 
  Heart, 
  MessageSquare, 
  X, 
  Play, 
  Plus,
  Image as ImageIcon,
  ChevronRight,
  Menu,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type MediaType = 'image' | 'video';

interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  caption: string;
  author: string;
  date: string;
}

// --- Mock Data ---
const INITIAL_MEDIA: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://picsum.photos/seed/class1/1200/800',
    caption: 'Ngày khai giảng rực rỡ',
    author: 'Lớp trưởng',
    date: '05/09/2025'
  },
  {
    id: '2',
    type: 'image',
    url: 'https://picsum.photos/seed/class2/800/1200',
    caption: 'Giờ ra chơi tinh nghịch',
    author: 'An Nhiên',
    date: '12/10/2025'
  },
  {
    id: '3',
    type: 'video',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://picsum.photos/seed/vid1/600/400',
    caption: 'Clip kỷ niệm hội trại',
    author: 'Minh Quân',
    date: '20/11/2025'
  },
  {
    id: '4',
    type: 'image',
    url: 'https://picsum.photos/seed/class3/1000/1000',
    caption: 'Buổi học cuối cùng',
    author: 'Cô giáo chủ nhiệm',
    date: '25/05/2026'
  },
  {
    id: '5',
    type: 'image',
    url: 'https://picsum.photos/seed/class4/1200/900',
    caption: 'Team bóng đá lớp mình',
    author: 'Đội trưởng',
    date: '15/03/2026'
  }
];

interface Wish {
  id: string;
  text: string;
  author: string;
  date: string;
}

// --- Mock Data ---
const INITIAL_WISHES: Wish[] = [];

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass-card border-b-0 rounded-none">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center text-white font-serif text-xl italic">
        K
      </div>
      <span className="font-serif text-xl font-semibold tracking-tight">Kỷ yếu lớp CNTT</span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-brand-charcoal/70">
      <a href="#gallery" className="hover:text-brand-gold transition-colors">Hình Ảnh</a>
      <a href="#videos" className="hover:text-brand-gold transition-colors">Video</a>
      <a href="#messages" className="hover:text-brand-gold transition-colors">Lời Chúc</a>
    </div>
    <button className="md:hidden">
      <Menu className="w-6 h-6" />
    </button>
  </nav>
);

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  key?: React.Key;
}

const MediaCard = ({ item, onClick, onDelete }: MediaCardProps) => {
  return (
    <motion.div 
      layoutId={item.id}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl cursor-pointer bg-white shadow-sm hover:shadow-xl transition-all duration-500"
      whileHover={{ y: -8 }}
    >
      <div className={`relative overflow-hidden ${item.type === 'image' ? 'aspect-portrait md:aspect-auto md:h-80' : 'aspect-video'}`}>
        <img 
          src={item.type === 'image' ? item.url : (item.thumbnail || item.url)} 
          alt={item.caption}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Delete button on hover */}
        <button 
          onClick={(e) => onDelete(e, item.id)}
          className="absolute top-4 right-4 p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600 z-10"
          title="Xóa kỷ niệm"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <p className="text-white font-serif text-lg leading-tight">{item.caption}</p>
          <p className="text-white/70 text-xs mt-1 uppercase tracking-wider">Bởi {item.author}</p>
        </div>
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const UploadModal = ({ isOpen, onClose, onUpload }: { isOpen: boolean; onClose: () => void; onUpload: (item: MediaItem) => void }) => {
  const [type, setType] = useState<MediaType>('image');
  const [caption, setCaption] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview || !caption || !author) return;

    const newItem: MediaItem = {
      id: Date.now().toString(),
      type,
      url: preview,
      caption,
      author,
      date: new Date().toLocaleDateString('vi-VN'),
    };

    onUpload(newItem);
    onClose();
    // Reset
    setCaption('');
    setAuthor('');
    setFile(null);
    setPreview(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-brand-cream rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-3xl font-serif mb-6">Tải lên kỷ niệm</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-4 p-1 bg-black/5 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setType('image')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'image' ? 'bg-white shadow-sm text-brand-gold' : 'text-brand-charcoal/50'}`}
                >
                  <ImageIcon className="w-4 h-4 inline-block mr-2" /> Hình ảnh
                </button>
                <button 
                  type="button"
                  onClick={() => setType('video')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'video' ? 'bg-white shadow-sm text-brand-gold' : 'text-brand-charcoal/50'}`}
                >
                  <VideoIcon className="w-4 h-4 inline-block mr-2" /> Video
                </button>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video border-2 border-dashed border-brand-gold/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-brand-gold/5 transition-colors overflow-hidden relative"
              >
                {preview ? (
                  type === 'image' ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <video src={preview} className="w-full h-full object-cover" />
                  )
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-brand-gold mb-2" />
                    <p className="text-sm text-brand-charcoal/60">Nhấn để chọn {type === 'image' ? 'ảnh' : 'video'}</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept={type === 'image' ? "image/*" : "video/*"}
                  className="hidden" 
                />
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Chú thích ngắn gọn..." 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Tên của bạn" 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none transition-all"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-brand-gold text-white rounded-xl font-semibold hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/20"
              >
                Đăng kỷ niệm
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const MediaViewer = ({ item, onClose, onDelete }: { item: MediaItem | null; onClose: () => void; onDelete: (id: string) => void }) => {
  const handleDelete = () => {
    if (item && window.confirm('Bạn có chắc chắn muốn xóa kỷ niệm này?')) {
      onDelete(item.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-charcoal/95 backdrop-blur-xl"
          />
          <motion.div 
            layoutId={item.id}
            className="relative w-full max-w-6xl max-h-full flex flex-col md:flex-row bg-brand-cream rounded-3xl overflow-hidden shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px]">
              {item.type === 'image' ? (
                <img 
                  src={item.url} 
                  alt={item.caption} 
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <video 
                  src={item.url} 
                  controls 
                  autoPlay 
                  className="max-w-full max-h-full"
                />
              )}
            </div>

            <div className="w-full md:w-80 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-gold mb-4">
                  {item.type === 'image' ? <Camera className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
                  <span className="text-xs uppercase tracking-widest font-bold">{item.type === 'image' ? 'KHOẢNH KHẮC' : 'PHIM NGẮN'}</span>
                </div>
                <h3 className="text-2xl font-serif mb-4 leading-tight">{item.caption}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-brand-charcoal/60 flex items-center gap-2">
                    <span className="font-semibold text-brand-charcoal">Người đăng:</span> {item.author}
                  </p>
                  <p className="text-sm text-brand-charcoal/60 flex items-center gap-2">
                    <span className="font-semibold text-brand-charcoal">Ngày:</span> {item.date}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-black/5 space-y-3">
                <div className="flex gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-black/10 rounded-xl hover:bg-black/5 transition-colors">
                    <Heart className="w-4 h-4" /> <span className="text-sm">Yêu thích</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-black/10 rounded-xl hover:bg-black/5 transition-colors">
                    <MessageSquare className="w-4 h-4" /> <span className="text-sm">Bình luận</span>
                  </button>
                </div>
                <button 
                  onClick={handleDelete}
                  className="w-full py-3 text-red-500 text-sm font-medium border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Xóa kỷ niệm này
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

export default function App() {
  const [media, setMedia] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('yearbook_media');
    return saved ? JSON.parse(saved) : INITIAL_MEDIA;
  });
  const [wishes, setWishes] = useState<Wish[]>(() => {
    const saved = localStorage.getItem('yearbook_wishes');
    return saved ? JSON.parse(saved) : INITIAL_WISHES;
  });
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [newWishText, setNewWishText] = useState('');
  const [newWishAuthor, setNewWishAuthor] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('yearbook_media', JSON.stringify(media));
    } catch (e) {
      console.error('LocalStorage limit exceeded:', e);
      alert('Bộ nhớ trình duyệt đã đầy. Không thể lưu thêm ảnh hoặc video dung lượng lớn.');
    }
  }, [media]);

  useEffect(() => {
    localStorage.setItem('yearbook_wishes', JSON.stringify(wishes));
  }, [wishes]);

  const handleUpload = (newItem: MediaItem) => {
    setMedia([newItem, ...media]);
  };

  const handleDelete = (id: string) => {
    setMedia(media.filter(m => m.id !== id));
  };

  const handleAddWish = () => {
    if (!newWishText || !newWishAuthor) return;
    const newWish: Wish = {
      id: Date.now().toString(),
      text: newWishText,
      author: newWishAuthor,
      date: new Date().toLocaleDateString('vi-VN'),
    };
    setWishes([newWish, ...wishes]);
    setNewWishText('');
    setNewWishAuthor('');
  };

  const handleDeleteWish = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lời chúc này?')) {
      setWishes(wishes.filter(w => w.id !== id));
    }
  };

  const handleCardDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening the viewer
    if (window.confirm('Bạn có chắc chắn muốn xóa kỷ niệm này?')) {
      handleDelete(id);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />

      {/* Hero Section */}
      <header className="pt-32 pb-16 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-brand-gold font-medium tracking-[0.3em] uppercase text-xs mb-4 block">Lớp CNTT - 2026</span>
          <h1 className="text-6xl md:text-8xl font-serif mb-8 leading-tight">
            Lưu Giữ <br /> <span className="italic text-brand-gold">Kỷ niệm</span>
          </h1>
          <p className="max-w-2xl mx-auto text-brand-charcoal/60 text-lg leading-relaxed mb-12">
            “Chúng ta đến từ nhiều nơi… nhưng đã cùng nhau tạo nên một kỷ niệm.”
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="px-8 py-4 bg-brand-charcoal text-white rounded-full font-medium flex items-center gap-2 hover:bg-brand-charcoal/90 transition-all shadow-xl shadow-brand-charcoal/20"
            >
              <Plus className="w-5 h-5" /> Đóng góp kỷ niệm
            </button>
            <a 
              href="#gallery"
              className="px-8 py-4 bg-white border border-black/10 rounded-full font-medium flex items-center gap-2 hover:bg-black/5 transition-all"
            >
              Khám phá thư viện <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </header>

      {/* Stats / Intro */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-black/5">
          {[
            { label: 'Thành viên', value: '24' },
            { label: 'Hình ảnh', value: media.filter(m => m.type === 'image').length.toString() },
            { label: 'Video', value: media.filter(m => m.type === 'video').length.toString() },
            { label: 'Ngày bên nhau', value: '1000+' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-serif text-brand-gold mb-1">{stat.value}</p>
              <p className="text-xs uppercase tracking-widest text-brand-charcoal/50 font-bold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-serif mb-2">Thư viện ảnh</h2>
            <p className="text-brand-charcoal/50">Những khoảnh khắc không thể quên</p>
          </div>
          <div className="hidden md:flex gap-2">
            <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-brand-charcoal/30 cursor-not-allowed">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </div>
            <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 cursor-pointer transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {media.filter(m => m.type === 'image').map((item) => (
            <MediaCard 
              key={item.id} 
              item={item} 
              onClick={() => setSelectedItem(item)} 
              onDelete={handleCardDelete}
            />
          ))}
        </div>
      </section>

      {/* Video Section */}
      <section id="videos" className="bg-brand-charcoal py-24 px-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-gold rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-sage rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Thước Phim Kỷ Niệm</h2>
            <p className="text-white/50">Xem lại những thước phim đầy cảm xúc</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {media.filter(m => m.type === 'video').map((item) => (
              <MediaCard 
                key={item.id} 
                item={item} 
                onClick={() => setSelectedItem(item)} 
                onDelete={handleCardDelete}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Messages Section */}
      <section id="messages" className="px-6 py-24 max-w-4xl mx-auto text-center">
        <Heart className="w-12 h-12 text-brand-gold mx-auto mb-8 fill-brand-gold/20" />
        <h2 className="text-4xl font-serif mb-6">Gửi lời chúc đến bạn bè</h2>
        <p className="text-brand-charcoal/60 mb-12 italic">
          "Dù mai sau có đi đâu về đâu, hãy luôn nhớ về nhau như những người bạn tuyệt vời nhất."
        </p>
        
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-black/5 mb-12">
          <textarea 
            placeholder="Viết lời chúc của bạn tại đây..."
            value={newWishText}
            onChange={(e) => setNewWishText(e.target.value)}
            className="w-full h-32 p-4 bg-brand-cream/50 border border-black/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all resize-none mb-4"
          />
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Tên của bạn"
              value={newWishAuthor}
              onChange={(e) => setNewWishAuthor(e.target.value)}
              className="flex-1 px-4 py-3 bg-brand-cream/50 border border-black/5 rounded-xl focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
            />
            <button 
              onClick={handleAddWish}
              className="px-8 py-3 bg-brand-gold text-white rounded-xl font-semibold hover:bg-brand-gold/90 transition-all"
            >
              Gửi lời chúc
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {wishes.map((wish) => (
            <motion.div 
              key={wish.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm group relative"
            >
              <button 
                onClick={() => handleDeleteWish(wish.id)}
                className="absolute top-4 right-4 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                title="Xóa lời chúc"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="text-brand-charcoal/80 mb-4 italic">"{wish.text}"</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-brand-gold">{wish.author}</span>
                <span className="text-xs text-brand-charcoal/40">{wish.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-black/5 text-center">
        <p className="font-serif text-xl mb-4 italic">Kỷ yếu lớp CNTT</p>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-charcoal/40">Made with love for our class</p>
      </footer>

      {/* Modals */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUpload={handleUpload} 
      />
      
      <MediaViewer 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onDelete={handleDelete}
      />

      {/* Floating Action Button for Mobile */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsUploadOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-brand-gold text-white rounded-full shadow-2xl flex items-center justify-center z-40 md:hidden"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
