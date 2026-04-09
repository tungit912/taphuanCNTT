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

import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  setDoc,
  getDocFromServer
} from 'firebase/firestore';
import { db, firebaseConfig } from './firebase';

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

interface Student {
  id: string;
  name: string;
  phone?: string;
  role?: string;
}

// --- Mock Data ---
const INITIAL_WISHES: Wish[] = [];
const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Nguyễn Văn A', phone: '0901234567', role: 'Lớp trưởng' },
  { id: '2', name: 'Trần Thị B', phone: '0907654321', role: 'Lớp phó' },
];

// --- Helpers ---
const getYoutubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const getYoutubeThumbnail = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : null;
};

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass-card border-b-0 rounded-none">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center text-white font-display text-xl font-black">
        K
      </div>
      <span className="font-display text-xl font-bold tracking-tight">Kỷ yếu lớp CNTT</span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-brand-dark/70">
      <a href="#gallery" className="hover:text-brand-primary transition-colors">Hình Ảnh</a>
      <a href="#videos" className="hover:text-brand-primary transition-colors">Video</a>
      <a href="#messages" className="hover:text-brand-primary transition-colors">Lời Chúc</a>
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
          src={item.type === 'image' ? item.url : (item.thumbnail || getYoutubeThumbnail(item.url) || item.url)} 
          alt={item.caption}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        )}
        
        {/* Delete button on hover */}
        <button 
          onClick={(e) => onDelete(e, item.id)}
          className="absolute top-4 right-4 p-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600 z-10 shadow-lg"
          title="Xóa kỷ niệm"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <p className="text-white font-display font-bold text-lg leading-tight">{item.caption}</p>
          <p className="text-white/70 text-xs mt-1 uppercase tracking-wider font-bold">Bởi {item.author}</p>
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

const UploadModal = ({ isOpen, onClose, onUpload }: { isOpen: boolean; onClose: () => void; onUpload: (item: Omit<MediaItem, 'id'>) => void }) => {
  const [type, setType] = useState<MediaType>('image');
  const [caption, setCaption] = useState('');
  const [author, setAuthor] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (limit to 2MB for base64 storage)
      if (selectedFile.size > 2 * 1024 * 1024) {
        alert('File quá lớn (tối đa 2MB). Vui lòng sử dụng link URL cho video hoặc ảnh dung lượng cao.');
        return;
      }
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
    
    const finalUrl = type === 'video' && videoUrl ? videoUrl : preview;
    if (!finalUrl || !caption || !author) {
      alert('Vui lòng điền đầy đủ thông tin và chọn file hoặc dán link.');
      return;
    }

    const newItem: Omit<MediaItem, 'id'> = {
      type,
      url: finalUrl,
      caption,
      author,
      date: new Date().toLocaleDateString('vi-VN'),
    };

    onUpload(newItem);
    onClose();
    // Reset
    setCaption('');
    setAuthor('');
    setVideoUrl('');
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
            className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-brand-light rounded-[40px] p-10 shadow-2xl overflow-hidden border-2 border-white"
          >
            <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-black/5 rounded-full transition-colors z-10">
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-4xl font-display font-black mb-8 tracking-tight">Tải lên <br /><span className="text-brand-primary">kỷ niệm</span></h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex gap-4 p-1.5 bg-brand-dark/5 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setType('image')}
                  className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${type === 'image' ? 'bg-white shadow-lg text-brand-primary' : 'text-brand-dark/40'}`}
                >
                  <ImageIcon className="w-4 h-4 inline-block mr-2" /> Hình ảnh
                </button>
                <button 
                  type="button"
                  onClick={() => setType('video')}
                  className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${type === 'video' ? 'bg-white shadow-lg text-brand-primary' : 'text-brand-dark/40'}`}
                >
                  <VideoIcon className="w-4 h-4 inline-block mr-2" /> Video
                </button>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video border-4 border-dashed border-brand-primary/20 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-brand-primary/5 hover:border-brand-primary/40 transition-all overflow-hidden relative group"
              >
                {preview ? (
                  type === 'image' ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <video src={preview} className="w-full h-full object-cover" />
                  )
                ) : (
                  <>
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-brand-primary" />
                    </div>
                    <p className="text-sm font-bold text-brand-dark/40 uppercase tracking-widest">Chọn {type === 'image' ? 'ảnh' : 'video'}</p>
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
                {type === 'video' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40 ml-2">Hoặc dán link video (YouTube, Drive, MP4...)</label>
                    <input 
                      type="url" 
                      placeholder="https://example.com/video.mp4" 
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-6 py-4 bg-white border-2 border-brand-dark/5 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/20 outline-none transition-all font-bold"
                    />
                  </div>
                )}
                <input 
                  type="text" 
                  placeholder="Chú thích ngắn gọn..." 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-6 py-4 bg-white border-2 border-brand-dark/5 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/20 outline-none transition-all font-bold"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Tên của bạn" 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-6 py-4 bg-white border-2 border-brand-dark/5 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/20 outline-none transition-all font-bold"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/20"
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
            className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl"
          />
          <motion.div 
            layoutId={item.id}
            className="relative w-full max-w-6xl max-h-full flex flex-col md:flex-row bg-brand-light rounded-3xl overflow-hidden shadow-2xl"
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
                getYoutubeEmbedUrl(item.url) ? (
                  <iframe 
                    src={getYoutubeEmbedUrl(item.url)!}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={item.url} 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-full"
                  />
                )
              )}
            </div>

            <div className="w-full md:w-80 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-primary mb-4">
                  {item.type === 'image' ? <Camera className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
                  <span className="text-xs uppercase tracking-widest font-black">{item.type === 'image' ? 'KHOẢNH KHẮC' : 'PHIM NGẮN'}</span>
                </div>
                <h3 className="text-3xl font-display font-black mb-4 leading-tight">{item.caption}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-brand-dark/60 flex items-center gap-2">
                    <span className="font-bold text-brand-dark uppercase text-[10px] tracking-wider">Người đăng:</span> {item.author}
                  </p>
                  <p className="text-sm text-brand-dark/60 flex items-center gap-2">
                    <span className="font-bold text-brand-dark uppercase text-[10px] tracking-wider">Ngày:</span> {item.date}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-black/5 space-y-3">
                <div className="flex gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-black/10 rounded-xl hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all font-bold">
                    <Heart className="w-4 h-4" /> <span className="text-sm">Yêu thích</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-black/10 rounded-xl hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all font-bold">
                    <MessageSquare className="w-4 h-4" /> <span className="text-sm">Bình luận</span>
                  </button>
                </div>
                <button 
                  onClick={handleDelete}
                  className="w-full py-3 text-red-500 text-sm font-bold border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
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
  const [media, setMedia] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newWishText, setNewWishText] = useState('');
  const [newWishAuthor, setNewWishAuthor] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentRole, setNewStudentRole] = useState('');

  const isFirebaseEnabled = !!firebaseConfig.apiKey;

  // Test connection
  useEffect(() => {
    if (!isFirebaseEnabled) return;
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, [isFirebaseEnabled]);

  // Real-time listeners
  useEffect(() => {
    if (!isFirebaseEnabled) {
      // Fallback to localStorage
      const savedMedia = localStorage.getItem('yearbook_media');
      const savedWishes = localStorage.getItem('yearbook_wishes');
      if (savedMedia) setMedia(JSON.parse(savedMedia));
      if (savedWishes) setWishes(JSON.parse(savedWishes));
      return;
    }

    const mediaQuery = query(collection(db, 'media'), orderBy('date', 'desc'));
    const unsubscribeMedia = onSnapshot(mediaQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem));
      setMedia(items.length > 0 ? items : INITIAL_MEDIA);
    }, (error) => {
      console.error("Firestore Media Error:", error);
    });

    const wishesQuery = query(collection(db, 'wishes'), orderBy('date', 'desc'));
    const unsubscribeWishes = onSnapshot(wishesQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wish));
      setWishes(items.length > 0 ? items : INITIAL_WISHES);
    }, (error) => {
      console.error("Firestore Wishes Error:", error);
    });

    const studentsQuery = query(collection(db, 'students'), orderBy('name', 'asc'));
    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(items.length > 0 ? items : INITIAL_STUDENTS);
    }, (error) => {
      console.error("Firestore Students Error:", error);
    });

    return () => {
      unsubscribeMedia();
      unsubscribeWishes();
      unsubscribeStudents();
    };
  }, [isFirebaseEnabled]);

  // Save to localStorage as backup if not using Firebase
  useEffect(() => {
    if (!isFirebaseEnabled) {
      localStorage.setItem('yearbook_media', JSON.stringify(media));
      localStorage.setItem('yearbook_wishes', JSON.stringify(wishes));
      localStorage.setItem('yearbook_students', JSON.stringify(students));
    }
  }, [media, wishes, students, isFirebaseEnabled]);

  const handleUpload = async (item: Omit<MediaItem, 'id'>) => {
    if (isFirebaseEnabled) {
      try {
        await addDoc(collection(db, 'media'), item);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    } else {
      const newItem = { ...item, id: Date.now().toString() };
      setMedia([newItem, ...media]);
    }
  };

  const handleDelete = async (id: string) => {
    if (isFirebaseEnabled) {
      try {
        await deleteDoc(doc(db, 'media', id));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    } else {
      setMedia(media.filter(m => m.id !== id));
    }
  };

  const handleAddWish = async () => {
    if (!newWishText || !newWishAuthor) return;
    const wishData = {
      text: newWishText,
      author: newWishAuthor,
      date: new Date().toLocaleDateString('vi-VN'),
    };

    if (isFirebaseEnabled) {
      try {
        await addDoc(collection(db, 'wishes'), wishData);
      } catch (error) {
        console.error("Add wish failed:", error);
      }
    } else {
      const newWish: Wish = {
        id: Date.now().toString(),
        ...wishData
      };
      setWishes([newWish, ...wishes]);
    }
    setNewWishText('');
    setNewWishAuthor('');
  };

  const handleDeleteWish = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lời chúc này?')) {
      if (isFirebaseEnabled) {
        try {
          await deleteDoc(doc(db, 'wishes', id));
        } catch (error) {
          console.error("Delete wish failed:", error);
        }
      } else {
        setWishes(wishes.filter(w => w.id !== id));
      }
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName) return;
    const studentData = {
      name: newStudentName,
      phone: newStudentPhone,
      role: newStudentRole,
    };

    if (isFirebaseEnabled) {
      try {
        await addDoc(collection(db, 'students'), studentData);
      } catch (error) {
        console.error("Add student failed:", error);
      }
    } else {
      const newStudent: Student = {
        id: Date.now().toString(),
        ...studentData
      };
      setStudents([...students, newStudent]);
    }
    setNewStudentName('');
    setNewStudentPhone('');
    setNewStudentRole('');
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      if (isFirebaseEnabled) {
        try {
          await deleteDoc(doc(db, 'students', id));
        } catch (error) {
          console.error("Delete student failed:", error);
        }
      } else {
        setStudents(students.filter(s => s.id !== id));
      }
    }
  };

  const handleCardDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening the viewer
    if (window.confirm('Bạn có chắc chắn muốn xóa kỷ niệm này?')) {
      handleDelete(id);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-brand-light">
      <Navbar />

      {/* Hero Section */}
      <header className="pt-40 pb-24 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-brand-secondary/10 rounded-full blur-3xl animate-pulse delay-700" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <span className="inline-block px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full font-bold tracking-widest uppercase text-[10px] mb-6 border border-brand-primary/20">
            Lớp CNTT - 2026
          </span>
          <h1 className="text-6xl md:text-9xl font-display font-black mb-8 leading-[0.9] tracking-tighter">
            Lưu Giữ <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">Kỷ niệm</span>
          </h1>
          <p className="max-w-2xl mx-auto text-brand-dark/60 text-xl leading-relaxed mb-12 font-medium">
            “Chúng ta đến từ nhiều nơi… nhưng đã cùng nhau tạo nên một kỷ niệm rực rỡ nhất.”
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="px-10 py-5 bg-brand-dark text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-2xl shadow-brand-dark/20"
            >
              <Plus className="w-6 h-6" /> Đóng góp kỷ niệm
            </button>
            <a 
              href="#gallery"
              className="px-10 py-5 bg-white border-2 border-brand-dark/5 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-dark hover:text-white transition-all"
            >
              Khám phá thư viện <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      </header>

      {/* Stats / Intro */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-y-2 border-brand-dark/5">
          {[
            { label: 'Thành viên', value: '24', color: 'text-brand-primary' },
            { label: 'Hình ảnh', value: media.filter(m => m.type === 'image').length.toString(), color: 'text-brand-secondary' },
            { label: 'Video', value: media.filter(m => m.type === 'video').length.toString(), color: 'text-brand-accent' },
            { label: 'Ngày bên nhau', value: '1000+', color: 'text-brand-primary' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className={`text-5xl font-display font-black mb-2 ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-dark/40 font-black">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-5xl md:text-7xl font-display font-black mb-6 leading-tight">Khoảnh Khắc <br /> <span className="text-brand-primary">Đáng Nhớ</span></h2>
            <p className="text-brand-dark/50 text-lg font-medium">Nơi lưu giữ những nụ cười, những giọt nước mắt và cả những trò đùa tinh nghịch của chúng ta.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-brand-light overflow-hidden bg-brand-dark/10">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-brand-dark">24+ Thành viên</p>
              <p className="text-xs text-brand-dark/40 font-bold">Đã đóng góp</p>
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
      <section id="videos" className="bg-brand-dark py-32 px-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary rounded-full blur-[150px] animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-8xl font-display font-black text-white mb-6 tracking-tighter">Thước Phim <br /> <span className="text-brand-accent">Kỷ Niệm</span></h2>
            <p className="text-white/50 text-xl font-medium">Xem lại những thước phim đầy cảm xúc của chúng ta</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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

      {/* Messages & Class List Section */}
      <section id="messages" className="px-6 py-32 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-block p-4 bg-brand-primary/10 rounded-3xl mb-8">
            <Heart className="w-12 h-12 text-brand-primary fill-brand-primary/20" />
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-black mb-8 tracking-tight">Kỷ Niệm & <br /> <span className="text-brand-secondary">Thành Viên</span></h2>
          <p className="text-brand-dark/60 italic text-xl font-medium max-w-2xl mx-auto">
            "Dù mai sau có đi đâu về đâu, hãy luôn nhớ về nhau như những người bạn tuyệt vời nhất."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left: Wishes (2 columns on desktop) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-display font-black tracking-tight">Lời Chúc <span className="text-brand-primary">({wishes.length})</span></h3>
            </div>
            
            <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-brand-primary/5 border-2 border-brand-dark/5 mb-12">
              <textarea 
                placeholder="Viết lời chúc của bạn tại đây..."
                value={newWishText}
                onChange={(e) => setNewWishText(e.target.value)}
                className="w-full h-32 p-6 bg-brand-light border-2 border-brand-dark/5 rounded-3xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all resize-none mb-6 text-lg font-medium"
              />
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Tên của bạn"
                  value={newWishAuthor}
                  onChange={(e) => setNewWishAuthor(e.target.value)}
                  className="flex-1 px-6 py-4 bg-brand-light border-2 border-brand-dark/5 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-bold"
                />
                <button 
                  onClick={handleAddWish}
                  className="px-10 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-primary/20"
                >
                  Gửi lời chúc
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wishes.map((wish) => (
                <motion.div 
                  key={wish.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-white rounded-[32px] border-2 border-brand-dark/5 shadow-xl group relative hover:border-brand-primary/20 transition-all"
                >
                  <button 
                    onClick={() => handleDeleteWish(wish.id)}
                    className="absolute top-6 right-6 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                    title="Xóa lời chúc"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <p className="text-brand-dark/80 mb-6 italic text-lg leading-relaxed font-medium">"{wish.text}"</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-brand-primary uppercase tracking-wider">{wish.author}</span>
                    <span className="text-[10px] font-black text-brand-dark/30 uppercase tracking-widest">{wish.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Class List */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-display font-black tracking-tight">Danh Sách <span className="text-brand-secondary">Lớp</span></h3>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-brand-secondary/5 border-2 border-brand-dark/5 mb-8">
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Họ và tên"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-6 py-4 bg-brand-light border-2 border-brand-dark/5 rounded-2xl focus:ring-4 focus:ring-brand-secondary/10 outline-none transition-all font-bold"
                />
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Điện thoại"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    className="flex-1 px-6 py-4 bg-brand-light border-2 border-brand-dark/5 rounded-2xl focus:ring-4 focus:ring-brand-secondary/10 outline-none transition-all font-bold text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Chức vụ"
                    value={newStudentRole}
                    onChange={(e) => setNewStudentRole(e.target.value)}
                    className="flex-1 px-6 py-4 bg-brand-light border-2 border-brand-dark/5 rounded-2xl focus:ring-4 focus:ring-brand-secondary/10 outline-none transition-all font-bold text-sm"
                  />
                </div>
                <button 
                  onClick={handleAddStudent}
                  className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl"
                >
                  Thêm thành viên
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[40px] border-2 border-brand-dark/5 overflow-hidden shadow-xl">
              <div className="max-h-[600px] overflow-y-auto p-2 space-y-2">
                {students.map((student, index) => (
                  <div 
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-brand-light transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-dark/5 rounded-xl flex items-center justify-center text-brand-dark/40 font-black text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-black text-brand-dark">{student.name}</p>
                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest">
                          {student.role && <span className="text-brand-secondary">{student.role}</span>}
                          {student.phone && <span className="text-brand-dark/30">{student.phone}</span>}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-20 border-t-2 border-brand-dark/5 text-center bg-white">
        <p className="font-display text-2xl font-black mb-4 tracking-tight">Kỷ yếu lớp CNTT</p>
        <p className="text-[10px] uppercase tracking-[0.4em] text-brand-dark/30 font-black">Made with love for our class • 2026</p>
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
        className="fixed bottom-8 right-8 w-16 h-16 bg-brand-primary text-white rounded-2xl shadow-2xl flex items-center justify-center z-40 md:hidden"
      >
        <Plus className="w-8 h-8" />
      </motion.button>
    </div>
  );
}
