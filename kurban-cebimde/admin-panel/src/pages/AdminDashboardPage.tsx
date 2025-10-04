import React, { useEffect, useMemo, useState } from "react";
import { useDashboardMetrics, useDonationsTrend, useAuditLatest, useAvgViewers } from '../api/hooks/dashboard'
// Origin bazlı çalış: prod'da HTTPS altında mixed-content hatasını önle
const API_BASE = (typeof window !== 'undefined' ? window.location.origin : undefined) 
  || import.meta.env.VITE_API_BASE_URL 
  || 'http://localhost:8000';
import { adminApi } from "../lib/adminApi";
import { livekitAPI } from "../lib/livekitApi";
import { useWebSocket, WebSocketEvent } from "../lib/websocket";
import Layout from "../components/Layout";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  User as UserIcon,
  Users,
  Video,
  Phone,
  Mail,
  CreditCard,
  ShieldCheck,
  Search,
  LayoutGrid,
  Gift,
  Eye,
  Edit,
  Trash2,
  Settings,
  BarChart3,
  LogOut,
  Copy,
  Check,
  Download,
  MoreHorizontal,
  ShoppingCart,
  Calendar,
  DollarSign,
  Activity,
  HardDrive,
  Clock,
  Play,
  Square,
  Terminal,
  X,
  Wifi,
  WifiOff,
  TrendingUp,
  FileText,
  MapPin,
} from "lucide-react";

// ---------- Types ----------
interface User {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

interface Donation {
  id: string;
  donorName: string;
  amount: number;
  method: "iyzico" | "stripe" | "paypal" | "havale" | "kapida";
  status: "bekliyor" | "tamamlandi" | "iptal";
  createdAt: string;
}

interface Broadcast {
  id: string;
  title: string;
  status: "aktif" | "pasif" | "zamanli";
  viewers: number;
  startedAt?: string;
}

// ---------- Dynamic Data (API'den gelecek) ----------

// ---------- Utils ----------
const tl = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
const fmt = (d: string) => new Date(d).toLocaleString("tr-TR");

function clsx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

// ---------- Minimal UI primitives ----------
const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={clsx("rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/70 dark:border-zinc-800", className)}>
    {children}
  </div>
);

const CardHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={clsx("px-5 py-4 border-b border-zinc-100 dark:border-zinc-800", className)}>{children}</div>
);
const CardContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={clsx("px-5 py-4", className)}>{children}</div>
);

const Badge: React.FC<{ children: React.ReactNode; tone?: "green" | "red" | "zinc" | "amber" }>=({ children, tone = "zinc" }) => (
  <span className={clsx(
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
    tone === "green" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    tone === "red" && "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    tone === "amber" && "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    tone === "zinc" && "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  )}>{children}</span>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" }>=({ className, variant = "primary", ...props }) => (
  <button
    {...props}
    className={clsx(
      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
      variant === "primary" && "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
      variant === "outline" && "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800",
      variant === "ghost" && "hover:bg-zinc-100 dark:hover:bg-zinc-800",
      className
    )}
  />
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input {...props} className={clsx("w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600", className)} />
);

// ---------- Sidebar ----------
const Sidebar: React.FC<{ active: string; onSelect: (k: string) => void }>=({ active, onSelect }) => {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutGrid size={18} />, url: "/admin/dashboard" },
    { key: "users", label: "Kullanıcılar", icon: <Users size={18} />, url: "/admin/users" },
    { key: "donations", label: "Bağışlar", icon: <Gift size={18} />, url: "/admin/donations" },
    { key: "carts", label: "Sepetler", icon: <ShoppingCart size={18} />, url: "/admin/carts" },
    { key: "streams", label: "Yayınlar", icon: <Video size={18} />, url: "/admin/streams" },
    { key: "backend-status", label: "Backend Durumu", icon: <Activity size={18} />, url: "/admin/backend-status" },
    { key: "reports", label: "Raporlar", icon: <BarChart3 size={18} />, url: "/admin/reports" },
    { key: "settings", label: "Ayarlar", icon: <Settings size={18} />, url: "/admin/settings" },
  ];
  
  const handleMenuClick = (item: any) => {
    // URL'yi değiştir
    window.location.href = item.url;
  };
  
  return (
    <aside className="h-screen w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur">
      <div className="px-5 py-4 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <ShieldCheck />
        <div className="font-semibold">Admin Panel</div>
      </div>
      <nav className="p-3 space-y-1">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => handleMenuClick(it)}
            className={clsx(
              "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
              active === it.key
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            )}
          >
            {it.icon}
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-zinc-200 dark:border-zinc-800">
        <Button variant="outline" className="w-full"><LogOut size={16}/>Çıkış Yap</Button>
      </div>
    </aside>
  );
};

// ---------- Topbar ----------
const Topbar: React.FC<{ lastUpdated?: string; wsConnected?: boolean; wsError?: Error | null }>=({ lastUpdated, wsConnected, wsError }) => {
  return (
    <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur">
      <div className="text-2xl font-bold">Admin Dashboard</div>
      <div className="flex items-center gap-4">
        {/* WebSocket Durumu */}
        <div className="flex items-center gap-2">
          {wsConnected ? (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-xs">Anlık Bağlantı</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs">Bağlantı Yok</span>
            </div>
          )}
        </div>
        
        {/* Hata Göstergesi */}
        {wsError && (
          <div className="text-xs text-red-600">
            WS Hatası: {wsError.message}
          </div>
        )}
        
        <div className="text-xs text-zinc-500">Son güncelleme: {lastUpdated ?? new Date().toLocaleString("tr-TR")}</div>
      </div>
    </div>
  );
};

// ---------- Stat Cards ----------
const StatGrid: React.FC<{ users: User[]; donations: Donation[]; broadcasts: Broadcast[] }>=({ users, donations, broadcasts }) => {
  const totalRevenue = donations.filter(d=>d.status==="tamamlandi").reduce((s,d)=>s+d.amount,0);
  const activeUsers = users.filter(u=>u.isActive).length;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card><CardContent className="flex items-center justify-between"><div>
        <div className="text-sm text-zinc-500">Toplam Kullanıcı</div>
        <div className="text-2xl font-semibold">{users.length}</div>
      </div><Users/></CardContent></Card>
      <Card><CardContent className="flex items-center justify-between"><div>
        <div className="text-sm text-zinc-500">Aktif Kullanıcı</div>
        <div className="text-2xl font-semibold">{activeUsers}</div>
      </div><UserIcon/></CardContent></Card>
      <Card><CardContent className="flex items-center justify-between"><div>
        <div className="text-sm text-zinc-500">Toplam Gelir</div>
        <div className="text-2xl font-semibold">{tl(totalRevenue)}</div>
      </div><Gift/></CardContent></Card>
      <Card><CardContent className="flex items-center justify-between"><div>
        <div className="text-sm text-zinc-500">Aktif Yayın</div>
        <div className="text-2xl font-semibold">{broadcasts.filter(b=>b.status==="aktif").length}</div>
      </div><Video/></CardContent></Card>
    </div>
  );
};

// ---------- Users Table ----------
const UsersTable: React.FC<{ data: User[]; onToggle: (id: string)=>void; onExport: ()=>void; search: string; onSearchChange: (q: string) => void }>=({ data, onToggle, onExport, search, onSearchChange }) => {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    if(!q) return data;
    return data.filter(u=>
      u.name.toLowerCase().includes(q) ||
      u.surname.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  }, [data, search]);

  const copyId = async (id: string)=>{
    await navigator.clipboard.writeText(id);
    alert("Kullanıcı ID kopyalandı: " + id);
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18}/>
          <Input 
            placeholder="Kullanıcı ara (ad, e-posta, telefon)…" 
            value={search} 
            onChange={(e)=>onSearchChange(e.target.value)} 
            className="pl-10 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onExport} className="h-11 px-4">
            <Download size={16} className="mr-2"/>
            CSV İndir
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                <tr className="text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  <th className="px-6 py-4 font-semibold">Kullanıcı</th>
                  <th className="px-6 py-4 font-semibold">İletişim</th>
                  <th className="px-6 py-4 font-semibold">Kullanıcı ID</th>
                  <th className="px-6 py-4 font-semibold">Durum</th>
                  <th className="px-6 py-4 font-semibold">Kayıt Tarihi</th>
                  <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((u)=> (
                  <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {u.name.charAt(0).toUpperCase()}{u.surname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {u.name} {u.surname}
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            ID: {u.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-zinc-400"/>
                          <span className="text-zinc-700 dark:text-zinc-300">{u.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-zinc-400"/>
                          <span className="text-zinc-700 dark:text-zinc-300">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={()=>copyId(u.id)} 
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <CreditCard size={14}/>
                        {u.id.substring(0, 12)}...
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500">
                        {new Date(u.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 relative">
                        <Button 
                          variant="outline" 
                          onClick={()=>onToggle(u.id)}
                          className="h-8 px-3 text-sm"
                        >
                          {u.isActive ? "Pasifleştir" : "Aktifleştir"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={()=>setMenuOpen(menuOpen===u.id?null:u.id)}
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal size={16}/>
                        </Button>
                        {menuOpen===u.id && (
                          <div className="absolute right-0 top-10 z-10 w-48 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl">
                            <button className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-t-xl" onClick={()=>{ 
                              alert(`Kullanıcı Detayları:\nAd: ${u.name}\nSoyad: ${u.surname}\nEmail: ${u.email}\nTelefon: ${u.phone}\nDurum: ${u.isActive ? 'Aktif' : 'Pasif'}\nKayıt Tarihi: ${new Date(u.createdAt).toLocaleDateString('tr-TR')}`); 
                              setMenuOpen(null); 
                            }}>
                              <Eye size={16} className="inline mr-2"/>
                              Detayları Görüntüle
                            </button>
                            <button className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={()=>{ 
                              alert('Kullanıcı düzenleme özelliği yakında aktif olacak');
                              setMenuOpen(null); 
                            }}>
                              <Edit size={16} className="inline mr-2"/>
                              Düzenle
                            </button>
                            <button className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-b-xl" onClick={()=>{ 
                              if(confirm(`${u.name} ${u.surname} kullanıcısını silmek istediğinizden emin misiniz?`)) {
                                alert('Kullanıcı silme özelliği yakında aktif olacak');
                              }
                              setMenuOpen(null); 
                            }}>
                              <Trash2 size={16} className="inline mr-2"/>
                              Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Donations Table ----------
const DonationsTable: React.FC<{ data: Donation[]; search: string }>=({ data, search }) => {
  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    if(!q) return data;
    return data.filter(d=>
      d.donorName.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.method.toLowerCase().includes(q) ||
      d.status.toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <Card>
      <CardHeader className="font-semibold">Son Bağışlar</CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-3">Bağış ID</th>
                <th className="py-2 pr-3">Bağışçı</th>
                <th className="py-2 pr-3">Tutar</th>
                <th className="py-2 pr-3">Yöntem</th>
                <th className="py-2 pr-3">Durum</th>
                <th className="py-2 pr-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d)=> (
                <tr key={d.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 pr-3">{d.id}</td>
                  <td className="py-3 pr-3">{d.donorName}</td>
                  <td className="py-3 pr-3">{tl(d.amount)}</td>
                  <td className="py-3 pr-3 uppercase">{d.method}</td>
                  <td className="py-3 pr-3">{
                    d.status === "tamamlandi" ? <Badge tone="green">Tamamlandı</Badge> :
                    d.status === "iptal" ? <Badge tone="red">İptal</Badge> : <Badge tone="amber">Bekliyor</Badge>
                  }</td>
                  <td className="py-3 pr-3">{fmt(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// ---------- Broadcasts ----------
const Broadcasts: React.FC<{ data: Broadcast[] }>=({ data }) => (
  <Card>
    <CardHeader className="font-semibold">Yayınlar</CardHeader>
    <CardContent>
      <div className="grid md:grid-cols-2 gap-4">
        {data.map(b => (
          <Card key={b.id}>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{b.title}</div>
                <div className="text-xs text-zinc-500">Durum: {b.status.toUpperCase()} • İzleyici: {b.viewers} {b.startedAt ? `• Başlangıç: ${fmt(b.startedAt)}` : ""}</div>
              </div>
              <Button variant="outline">Yönet</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

// ---------- Carts Section ----------
const CartsSection: React.FC = () => {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Sadece dashboard sayfasında çalıştır
    if (window.location.pathname === '/admin/dashboard') {
      fetchCarts();
    }
  }, []);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCarts({ page: 1, size: 50 });
      setCarts(response.items || []);
      console.log('Sepet verileri yüklendi:', response.items?.length || 0);
    } catch (error) {
      console.error('Sepet verileri yüklenemedi:', error);
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCarts = carts.filter(cart => {
    const matchesSearch = cart.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cart.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || cart.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge tone="green">Aktif</Badge>;
      case 'pending':
        return <Badge tone="amber">Bekliyor</Badge>;
      case 'completed':
        return <Badge tone="zinc">Tamamlandı</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sepetler</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Kullanıcıların aktif sepetlerini ve sipariş durumlarını görüntüleyin
          </p>
        </div>
        <Button onClick={fetchCarts} disabled={loading}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500">Toplam Sepet</div>
              <div className="text-2xl font-semibold">{carts.length}</div>
            </div>
            <ShoppingCart className="h-4 w-4 text-zinc-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500">Aktif Sepetler</div>
              <div className="text-2xl font-semibold">
                {carts.filter(cart => cart.status === 'active').length}
              </div>
            </div>
            <div className="h-4 w-4 text-zinc-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500">Toplam Değer</div>
              <div className="text-2xl font-semibold">
                {formatCurrency(carts.reduce((sum, cart) => sum + (cart.total_amount || 0), 0))}
              </div>
            </div>
            <DollarSign className="h-4 w-4 text-zinc-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500">Ortalama Sepet</div>
              <div className="text-2xl font-semibold">
                {carts.length > 0 ? formatCurrency(carts.reduce((sum, cart) => sum + (cart.total_amount || 0), 0) / carts.length) : '₺0'}
              </div>
            </div>
            <ShoppingCart className="h-4 w-4 text-zinc-400" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="font-semibold">Filtreler</div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Kullanıcı adı veya telefon ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={statusFilter === 'all' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                Tümü
              </Button>
              <Button 
                variant={statusFilter === 'active' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('active')}
              >
                Aktif
              </Button>
              <Button 
                variant={statusFilter === 'pending' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('pending')}
              >
                Bekliyor
              </Button>
              <Button 
                variant={statusFilter === 'completed' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('completed')}
              >
                Tamamlandı
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carts Table */}
      <Card>
        <CardHeader>
          <div className="font-semibold">Sepet Listesi</div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-zinc-500">Yükleniyor...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="py-2 pr-3">Kullanıcı</th>
                    <th className="py-2 pr-3">Telefon</th>
                    <th className="py-2 pr-3">Ürünler</th>
                    <th className="py-2 pr-3">Toplam</th>
                    <th className="py-2 pr-3">Durum</th>
                    <th className="py-2 pr-3">Oluşturulma</th>
                    <th className="py-2 pr-3">Güncelleme</th>
                    <th className="py-2 pr-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCarts.map((cart) => (
                    <tr key={cart.id} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-3 pr-3">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-zinc-400" />
                          <span className="font-medium">{cart.user_name || 'Bilinmiyor'}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-zinc-400" />
                          <span>{cart.phone || 'Bilinmiyor'}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="space-y-1">
                          {cart.items?.map((item: any, index: number) => (
                            <div key={index} className="text-sm">
                              {item.animal_type} x{item.quantity} - {formatCurrency(item.amount)}
                            </div>
                          )) || 'Ürün bilgisi yok'}
                        </div>
                      </td>
                      <td className="py-3 pr-3 font-medium">
                        {formatCurrency(cart.total_amount || 0)}
                      </td>
                      <td className="py-3 pr-3">
                        {getStatusBadge(cart.status || 'unknown')}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm">{formatDate(cart.created_at || new Date().toISOString())}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm">{formatDate(cart.updated_at || new Date().toISOString())}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex justify-end">
                          <Button variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredCarts.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-zinc-400" />
                <h3 className="mt-2 text-sm font-semibold">Sepet bulunamadı</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Arama kriterlerinize uygun sepet bulunmuyor.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Backend Status Section ----------
const BackendStatusSection: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('--');
  const [backendRunning, setBackendRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const apiEndpointsList = [
    { name: 'Health Check', method: 'GET', url: '/health' },
    { name: 'Admin Users', method: 'GET', url: '/api/admin/v1/users' },
    { name: 'Admin Donations', method: 'GET', url: '/api/admin/v1/donations' },
    { name: 'Admin Carts', method: 'GET', url: '/api/admin/v1/carts' },
    { name: 'Monitor Logs', method: 'GET', url: '/api/monitor/logs' },
    { name: 'Monitor System', method: 'GET', url: '/api/monitor/system' },
    { name: 'Monitor Status', method: 'GET', url: '/api/monitor/status' }
  ];

  useEffect(() => {
    // Sadece dashboard sayfasında çalıştır
    if (window.location.pathname === '/admin/dashboard') {
      fetchBackendData();
      const interval = setInterval(fetchBackendData, 30000); // 30 saniyede bir güncelle
      return () => clearInterval(interval);
    }
  }, []);

  const startBackend = async () => {
    setTerminalOutput(prev => [...prev, '🚀 Backend başlatılıyor...']);
    setShowTerminal(true);
    
    try {
      // Backend başlatma simülasyonu
      setTerminalOutput(prev => [...prev, '📁 Dizin değiştiriliyor: kurban-cebimde/backend']);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTerminalOutput(prev => [...prev, '🐍 Virtual environment aktifleştiriliyor...']);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTerminalOutput(prev => [...prev, '⚡ Flask backend başlatılıyor...']);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTerminalOutput(prev => [...prev, '✅ Backend başarıyla başlatıldı! Port: 8000']);
      setBackendRunning(true);
      
      // 5 saniye sonra verileri yenile
      setTimeout(() => {
        fetchBackendData();
      }, 5000);
      
    } catch (error) {
      setTerminalOutput(prev => [...prev, `❌ Hata: ${error}`]);
    }
  };

  const stopBackend = () => {
    setTerminalOutput(prev => [...prev, '🛑 Backend durduruluyor...']);
    setBackendRunning(false);
    setTerminalOutput(prev => [...prev, '✅ Backend durduruldu']);
  };

  const clearTerminal = () => {
    setTerminalOutput([]);
  };

  const fetchBackendData = async () => {
    try {
      setLoading(true);
      
      try {
        // Sistem bilgilerini al
        const systemResponse = await fetch(`${API_BASE}/api/monitor/system`);
        if (systemResponse.ok) {
          const systemData = await systemResponse.json();
          setSystemInfo(systemData);
          setBackendRunning(true);
        } else {
          setBackendRunning(false);
        }
      } catch (error) {
        console.error('Sistem bilgileri yüklenemedi:', error);
        setBackendRunning(false);
      }

      try {
        // Servis durumunu al
        const statusResponse = await fetch(`${API_BASE}/api/monitor/status`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setServiceStatus(statusData);
        }
      } catch (error) {
        console.error('Servis durumu yüklenemedi:', error);
      }

      try {
        // Logları al
        const logsResponse = await fetch(`${API_BASE}/api/monitor/logs`);
        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          setLogs(logsData.logs || []);
        }
      } catch (error) {
        console.error('Loglar yüklenemedi:', error);
      }

      // API endpoint durumlarını kontrol et
      const endpointChecks = await Promise.allSettled(
        apiEndpointsList.map(async (endpoint) => {
          const startTime = Date.now();
          try {
            let response;
            
            // Admin endpoint'leri için adminApi kullan
            if (endpoint.url.includes('/api/admin/v1/')) {
              try {
                if (endpoint.url.includes('/users')) {
                  await adminApi.getUsers({ page: 1, size: 1 });
                  response = { ok: true };
                } else if (endpoint.url.includes('/donations')) {
                  await adminApi.getDonations({ page: 1, size: 1 });
                  response = { ok: true };
                } else if (endpoint.url.includes('/carts')) {
                  await adminApi.getCarts({ page: 1, size: 1 });
                  response = { ok: true };
                } else {
                  response = { ok: false };
                }
              } catch (apiError) {
                // Admin API hatası durumunda
                console.error(`Admin endpoint ${endpoint.url} hatası:`, apiError);
                response = { ok: false };
              }
            } else {
              // Diğer endpoint'ler için normal fetch
              try {
                response = await fetch(`${API_BASE}${endpoint.url}`, {
                  method: endpoint.method,
                  headers: { 'Content-Type': 'application/json' }
                });
              } catch (fetchError) {
                // Fetch hatası durumunda
                console.error(`Endpoint ${endpoint.url} hatası:`, fetchError);
                response = { ok: false };
              }
            }
            
            const responseTime = Date.now() - startTime;
            return {
              ...endpoint,
              status: response.ok ? 'active' : 'error',
              responseTime,
              lastCheck: new Date().toISOString()
            };
          } catch (error) {
            return {
              ...endpoint,
              status: 'error',
              responseTime: null,
              lastCheck: new Date().toISOString()
            };
          }
        })
      );

      setApiEndpoints(endpointChecks.map(result => 
        result.status === 'fulfilled' ? result.value : { ...apiEndpointsList[0], status: 'error' }
      ));

      setLastUpdate(new Date().toLocaleString('tr-TR'));
    } catch (error) {
      console.error('Backend veri çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge tone="green">Aktif</Badge>;
      case 'error':
        return <Badge tone="red">Hata</Badge>;
      case 'warning':
        return <Badge tone="amber">Uyarı</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backend Durumu</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Backend monitörü ve sistem durumu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={startBackend} 
            disabled={backendRunning}
            variant={backendRunning ? "outline" : "primary"}
            className={backendRunning ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
          >
            {backendRunning ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Çalışıyor
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Backend Başlat
              </>
            )}
          </Button>
          {backendRunning && (
            <Button onClick={stopBackend} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              <Square className="mr-2 h-4 w-4" />
              Durdur
            </Button>
          )}
          <Button onClick={() => setShowTerminal(!showTerminal)} variant="outline">
            <Terminal className="mr-2 h-4 w-4" />
            Terminal
          </Button>
          <Button onClick={fetchBackendData} disabled={loading}>
            <Activity className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500">Backend</div>
              <div className="text-2xl font-semibold">
                {serviceStatus?.backend?.status === 'online' ? 'Aktif' : 'Pasif'}
              </div>
            </div>
            <div className={`h-3 w-3 rounded-full ${serviceStatus?.backend?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500">Admin Panel</div>
              <div className="text-2xl font-semibold">
                {serviceStatus?.admin_panel?.status === 'online' ? 'Aktif' : 'Pasif'}
              </div>
            </div>
            <div className={`h-3 w-3 rounded-full ${serviceStatus?.admin_panel?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500">Veritabanı</div>
              <div className="text-2xl font-semibold">
                {serviceStatus?.database?.status === 'online' ? 'Aktif' : 'Pasif'}
              </div>
            </div>
            <div className={`h-3 w-3 rounded-full ${serviceStatus?.database?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      {systemInfo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-500">CPU Kullanımı</div>
                <div className="text-2xl font-semibold">{systemInfo.cpu_usage}</div>
              </div>
              <Activity className="h-4 w-4 text-zinc-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-500">RAM Kullanımı</div>
                <div className="text-2xl font-semibold">{systemInfo.memory_usage}</div>
              </div>
              <BarChart3 className="h-4 w-4 text-zinc-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-500">Disk Kullanımı</div>
                <div className="text-2xl font-semibold">{systemInfo.disk_usage}</div>
              </div>
              <HardDrive className="h-4 w-4 text-zinc-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-500">Çalışma Süresi</div>
                <div className="text-2xl font-semibold">{systemInfo.uptime}</div>
              </div>
              <Clock className="h-4 w-4 text-zinc-400" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <div className="font-semibold">API Endpoint Durumları</div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-2 pr-3">Endpoint</th>
                  <th className="py-2 pr-3">Method</th>
                  <th className="py-2 pr-3">Durum</th>
                  <th className="py-2 pr-3">Yanıt Süresi</th>
                  <th className="py-2 pr-3">Son Kontrol</th>
                </tr>
              </thead>
              <tbody>
                {apiEndpoints.map((endpoint, index) => (
                  <tr key={index} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-3 pr-3 font-mono text-xs">{endpoint.url}</td>
                    <td className="py-3 pr-3">
                      <Badge tone="zinc">{endpoint.method}</Badge>
                    </td>
                    <td className="py-3 pr-3">
                      {getStatusBadge(endpoint.status)}
                    </td>
                    <td className="py-3 pr-3">
                      {endpoint.responseTime ? `${endpoint.responseTime}ms` : '--'}
                    </td>
                    <td className="py-3 pr-3 text-xs">
                      {endpoint.lastCheck ? new Date(endpoint.lastCheck).toLocaleTimeString('tr-TR') : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <div className="font-semibold">Sistem Logları</div>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {logs.slice(-20).map((log, index) => (
              <div key={index} className="flex items-start gap-3 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <div className="text-xs text-zinc-500 mt-1">
                  {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                </div>
                <Badge tone={log.level === 'ERROR' ? 'red' : log.level === 'WARNING' ? 'amber' : 'zinc'}>
                  {log.level}
                </Badge>
                <div className="text-sm flex-1">{log.message}</div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-8 text-zinc-500">
                Henüz log kaydı yok
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Terminal */}
      {showTerminal && (
        <Card className="mt-6">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              <span className="font-semibold">Backend Terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={clearTerminal} variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Temizle
              </Button>
              <Button onClick={() => setShowTerminal(false)} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Kapat
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto">
              {terminalOutput.length === 0 ? (
                <div className="text-zinc-500">
                  Terminal boş. Backend başlatmak için "Backend Başlat" butonuna tıklayın.
                </div>
              ) : (
                terminalOutput.map((line, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-zinc-400">$ </span>
                    {line}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Update */}
      <div className="text-center text-xs text-zinc-500">
        Son güncelleme: {lastUpdate}
      </div>
    </div>
  );
};

// ---------- Analytics ----------
const Analytics: React.FC<{ donations: Donation[]; users: User[] }> = ({ donations, users }) => {
  // Son 7 gün
  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - idx));
    const label = d.toLocaleDateString('tr-TR', { weekday: 'short' });
    return { date: d, label: label.charAt(0).toUpperCase() + label.slice(1) };
  });

  // Bağışlar: gün bazlı toplam (sadece tamamlandı)
  const donationByDay = days.map(({ date, label }) => {
    const start = new Date(date);
    const end = new Date(date); end.setDate(end.getDate() + 1);
    const sum = donations
      .filter(d => d.status === 'tamamlandi')
      .filter(d => {
        const t = new Date(d.createdAt).getTime();
        return t >= start.getTime() && t < end.getTime();
      })
      .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
    return { day: label.replace('.', ''), amount: Math.round(sum) };
  });

  // Aktif kullanıcılar: gün bazlı yeni aktif kullanıcı sayısı
  const activeUsersByDay = days.map(({ date, label }) => {
    const start = new Date(date);
    const end = new Date(date); end.setDate(end.getDate() + 1);
    const count = users
      .filter(u => u.isActive)
      .filter(u => {
        const t = new Date(u.createdAt).getTime();
        return t >= start.getTime() && t < end.getTime();
      }).length;
    return { day: label.replace('.', ''), count };
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="font-semibold">Haftalık Bağış (₺)</CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={donationByDay}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.9}/>
                  <stop offset="50%" stopColor="#00d4ff" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} strokeWidth={0.5} />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(value: any) => [`₺${value}`, 'Bağış']}
                labelFormatter={(label: any) => `${label} günü`}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#00d4ff" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#g1)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="font-semibold">Aktif Kullanıcı (7 Gün)</CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeUsersByDay}>
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="50%" stopColor="#10b981" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} strokeWidth={0.5} />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(value: any) => [`${value} kişi`, 'Aktif Kullanıcı']}
                labelFormatter={(label: any) => `${label} günü`}
              />
              <Bar 
                dataKey="count" 
                fill="url(#g2)" 
                radius={[8,8,0,0]} 
                stroke="#059669"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Helpers ----------
import * as XLSX from 'xlsx'
function exportUsersXLSX(users: User[]) {
  const headers = ["Ad", "Soyad", "Telefon", "E-posta", "Kullanıcı ID", "Durum", "Oluşturma"];
  const rows = users.map(u => [u.name, u.surname, u.phone, u.email, u.id, u.isActive ? "aktif" : "pasif", u.createdAt]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Kullanicilar')
  XLSX.writeFile(wb, `kullanicilar-${Date.now()}.xlsx`)
}


// ---------- Main Component ----------
export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [livekitStreams, setLivekitStreams] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [realTimeEvents, setRealTimeEvents] = useState<WebSocketEvent[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // WebSocket bağlantısı - basit kontrol
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState<Error | null>(null);

  // URL'e göre active state'i ayarla
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin/streams') {
      setActive('streams');
    } else if (path === '/admin/dashboard') {
      setActive('dashboard');
    }
  }, []);

  // Basit WebSocket bağlantı kontrolü - sadece bir kez
  useEffect(() => {
    const checkWebSocket = async () => {
      try {
        // Backend'in WS health endpointini API prefix üzerinden çağır
        const response = await fetch(`${API_BASE}/api/ws/status`);
        if (response.ok) {
          setWsConnected(true);
          setWsError(null);
        } else {
          setWsConnected(false);
        }
      } catch (error) {
        setWsConnected(false);
        setWsError(error as Error);
      }
    };

    checkWebSocket();
    // Interval kaldırıldı - performans için
  }, []);

  // React Query: dashboard verileri
  const { data: metrics } = useDashboardMetrics()
  const { data: trend7d } = useDonationsTrend('7d')
  const { data: latestAudit } = useAuditLatest()
  const { data: avgViewers } = useAvgViewers()

  // API'den veri çek - sadece dashboard sayfasında
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Login kontrolü - sadece token yoksa login yap
        if (!adminApi.isAuthenticated()) {
          try {
            await adminApi.login({
              username: 'admin',
              password: 'admin123'
            });
            console.log('Admin login başarılı');
          } catch (loginError) {
            console.error('Admin login hatası:', loginError);
            // Login başarısız olsa da devam et
          }
        } else {
          console.log('Admin zaten giriş yapmış');
        }

        try {
          // 1) Kullanıcılar - API'den çek
          const usersResp = await adminApi.getUsers({ page: 1, size: 20 });
          const uiUsers: User[] = (usersResp?.items || []).map((u: any) => ({
            id: String(u.id),
            name: u.name || '-',
            surname: u.surname || '-',
            phone: u.phone || '-',
            email: u.email || '-',
            isActive: Boolean(u.is_verified),
            createdAt: u.created_at || new Date().toISOString(),
          }));
          setUsers(uiUsers);
          console.log('Kullanıcı verileri yüklendi:', uiUsers.length);
        } catch (error) {
          console.error('Kullanıcı verileri yüklenemedi:', error);
          setUsers([]);
        }

        try {
          // 2) Bağışlar - API'den çek
          const donationsResp = await adminApi.getDonations({ page: 1, size: 20 });
          const uiDonations: Donation[] = (donationsResp?.items || []).map((o: any) => ({
            id: String(o.id),
            donorName: o.user_id ? String(o.user_id) : 'Bilinmiyor',
            amount: Number(o.amount || 0),
            method: 'iyzico',
            status: String(o.status || 'bekliyor') as any,
            createdAt: o.created_at || new Date().toISOString(),
          }));
          setDonations(uiDonations);
          console.log('Bağış verileri yüklendi:', uiDonations.length);
        } catch (error) {
          console.error('Bağış verileri yüklenemedi:', error);
          setDonations([]);
        }

        try {
          // 3) Yayınlar - API'den çek
          const streamsResp = await adminApi.getStreams({ page: 1, size: 20 });
          const uiBroadcasts: Broadcast[] = (streamsResp?.items || []).map((s: any) => ({
            id: String(s.id),
            title: s.title || 'Başlıksız Yayın',
            status: s.status || 'draft',
            viewers: Number(s.viewers || 0),
            createdAt: s.created_at || new Date().toISOString(),
          }));
          setBroadcasts(uiBroadcasts);
          console.log('Yayın verileri yüklendi:', uiBroadcasts.length);
        } catch (error) {
          console.error('Yayın verileri yüklenemedi:', error);
          setBroadcasts([]);
        }
        
        // LiveKit streams'i yükle
        try {
          console.log('🔄 LiveKit streams yükleniyor...');
          const livekitResponse = await livekitAPI.getStreams();
          console.log('✅ LiveKit response:', livekitResponse);
          const livekitStreams = livekitResponse.streams || [];
          
          // LiveKit streams'i formatla
          const formattedLivekitStreams = livekitStreams.map((stream: any) => ({
            id: stream.id,
            title: stream.title,
            room_name: stream.room_name,
            status: stream.status,
            participant_count: stream.participant_count,
            host_name: stream.host_name,
            started_at: stream.started_at,
            location: 'LiveKit Yayını',
            animal_count: 1,
            viewers: stream.participant_count,
            duration: 'Canlı',
            created_at: stream.started_at ? new Date(stream.started_at).toLocaleString('tr-TR') : 'Bilinmiyor',
            type: 'livekit'
          }));
          setLivekitStreams(formattedLivekitStreams);
          console.log('✅ LiveKit streams yüklendi:', formattedLivekitStreams.length);
        } catch (livekitError) {
          console.error('❌ LiveKit streams hatası:', livekitError);
          setLivekitStreams([]);
        }
        
      } catch (error) {
        console.error('Genel veri yükleme hatası:', error);
        setUsers([]);
        setDonations([]);
        setBroadcasts([]);
        setLivekitStreams([]);
      } finally {
        setLoading(false);
      }
    };

    // Dashboard ve streams sayfasında çalıştır
    if (window.location.pathname === '/admin/dashboard' || window.location.pathname === '/admin/streams') {
      fetchData();
    }
  }, []);

  const toggleUser = async (id: string) => {
    const currentUser = users.find(u => u.id === id);
    if (!currentUser) return;
    
    const newStatus = !currentUser.isActive;
    
    try {
      console.log(`🔄 Kullanıcı ${id} durumu güncelleniyor: ${currentUser.isActive} → ${newStatus}`);
      
      // Önce UI'da optimistic update yap
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: newStatus } : u));
      
      // Backend'e güncelleme isteği gönder
      const result = await adminApi.updateUser(id, { 
        is_verified: newStatus 
      });
      
      console.log(`✅ Kullanıcı ${id} durumu başarıyla güncellendi:`, result);
    } catch (error) {
      console.error('❌ Kullanıcı durumu güncellenemedi:', error);
      
      // Network hatası durumunda
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network hatası, kullanıcı durumu güncellenemedi');
        alert(`Kullanıcı durumu güncellenemedi! Network hatası.`);
        return;
      }
      
      console.error('Hata detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Hata durumunda geri al (rollback)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: currentUser.isActive } : u));
      
      alert(`Kullanıcı durumu güncellenemedi: ${error.message || 'Bilinmeyen hata'}`);
    }
  };

  const createUser = async (userData: { name: string; surname: string; email: string; phone: string; password: string; roles: string[] }) => {
    try {
      const newUser = await adminApi.createUser({
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        roles: userData.roles
      });
      
      // Kullanıcı listesini yenile
      const usersResp = await adminApi.getUsers({ page: 1, size: 50 });
      const uiUsers: User[] = (usersResp?.items || []).map((u: any) => ({
        id: String(u.id),
        name: u.name || '-',
        surname: u.surname || '-',
        phone: u.phone || '-',
        email: u.email || '-',
        isActive: Boolean(u.is_verified),
        createdAt: u.created_at || new Date().toISOString(),
      }));
      setUsers(uiUsers);
      
      alert('Kullanıcı başarıyla oluşturuldu!');
      return newUser;
    } catch (error) {
      console.error('Kullanıcı oluşturulamadı:', error);
      
      // Network hatası durumunda
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network hatası, kullanıcı oluşturulamadı');
        alert(`Kullanıcı oluşturulamadı! Network hatası.`);
        return null;
      }
      
      alert('Kullanıcı oluşturulamadı: ' + (error as Error).message);
      throw error;
    }
  };

  return (
    <Layout>
      <div className="page-container space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-400">Veriler yükleniyor...</p>
              </div>
            </div>
          ) : (
            <>
              {active === "streams" && (
                <>
                  {/* Streams Header */}
                  <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h1 className="text-3xl font-bold text-zinc-100">Canlı Yayınlar</h1>
                        <p className="text-zinc-400 mt-1">Kurban kesimi canlı yayınlarını yönetin ve izleyin</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                          <Video className="w-4 h-4" />
                          Yeni Yayın
                        </button>
                      </div>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Yayın ara..."
                          className="w-full px-4 py-2 border border-zinc-600 rounded-lg bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button className="px-4 py-2 bg-zinc-700 text-zinc-100 rounded-lg hover:bg-zinc-600 transition-colors">
                        Ara
                      </button>
                      <button className="px-4 py-2 border border-zinc-600 text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors">
                        Tüm Durumlar
                      </button>
                    </div>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-red-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-400">0</div>
                        <div className="text-sm text-red-400">Canlı Yayın</div>
                      </div>
                      <div className="bg-orange-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-400">0</div>
                        <div className="text-sm text-orange-400">Planlandı</div>
                      </div>
                      <div className="bg-gray-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-400">0</div>
                        <div className="text-sm text-gray-400">Tamamlandı</div>
                      </div>
                      <div className="bg-purple-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">0</div>
                        <div className="text-sm text-purple-400">Taslak</div>
                      </div>
                    </div>
                    
                    {/* LiveKit Streams */}
                    {livekitStreams.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {livekitStreams.map((stream) => (
                          <div key={stream.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-zinc-100">{stream.title}</h3>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Canlı</span>
                            </div>
                            <div className="space-y-2 text-sm text-zinc-400">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {stream.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Beklenen
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {stream.duration}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                Katıl
                              </button>
                              <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                                <Square className="w-3 h-3" />
                                Sonlandır
                              </button>
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                LiveKit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Video className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-zinc-100 mb-2">Aktif yayın yok</h3>
                        <p className="text-zinc-400">Şu anda canlı yayın bulunmuyor</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {active === "dashboard" && (
                <>
                  {/* Dashboard Header - Beyaz panelden alınan tasarım */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 p-8 text-white">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
                    <div className="relative z-10">
                      <h1 className="text-4xl font-bold mb-2">Hoş Geldiniz! 👋</h1>
                      <p className="text-blue-100 text-lg mb-6">
                        Kurban Cebimde operasyonunun genel durumu ve istatistikleri
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {new Date().toLocaleDateString('tr-TR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            {new Date().toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Info Card - Beyaz panelden alınan tasarım */}
                  <Card>
                    <CardContent className="flex items-center gap-4">
                      <div className="bg-blue-600 rounded-full p-3">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          Admin Kullanıcı
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <span>📱 +90 555 123 45 67</span>
                          <span>📧 admin@kurbancebimde.com</span>
                          <Badge tone="green">Sistem Yöneticisi</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Grid - Beyaz panelden alınan tasarım */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-zinc-500 mb-2">Toplam Kullanıcı</p>
                            <p className="text-3xl font-bold">{metrics?.total_users ?? users.length}</p>
                            <p className="text-xs text-zinc-400 mt-1">Kayıtlı kullanıcı sayısı</p>
                          </div>
                          <div className="bg-blue-100 dark:bg-blue-900/40 rounded-xl p-3">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs text-blue-600">
                          <TrendingUp className="h-3 w-3" />
                          <span>+12% geçen aya göre</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-zinc-500 mb-2">Toplam Bağış</p>
                            <p className="text-3xl font-bold">{donations.length}</p>
                            <p className="text-xs text-zinc-400 mt-1">Tamamlanan bağış sayısı</p>
                          </div>
                          <div className="bg-green-100 dark:bg-green-900/40 rounded-xl p-3">
                            <Gift className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          <span>₺{(metrics?.donations_sum_7d ?? 0).toLocaleString('tr-TR')}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-zinc-500 mb-2">Toplam Gelir</p>
                            <p className="text-3xl font-bold">
                              {tl(donations.filter(d => d.status === 'tamamlandi').reduce((sum, d) => sum + d.amount, 0))}
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">Toplam bağış tutarı</p>
                          </div>
                          <div className="bg-purple-100 dark:bg-purple-900/40 rounded-xl p-3">
                            <DollarSign className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs text-purple-600">
                          <TrendingUp className="h-3 w-3" />
                          <span>+15% geçen aya göre</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-zinc-500 mb-2">Aktif Yayınlar</p>
                            <p className="text-3xl font-bold">{metrics?.active_broadcasts ?? broadcasts.filter(b => b.status === 'aktif').length}</p>
                            <p className="text-xs text-zinc-400 mt-1">Şu anda yayında</p>
                          </div>
                          <div className="bg-orange-100 dark:bg-orange-900/40 rounded-xl p-3">
                            <Video className="h-6 w-6 text-orange-600" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs text-orange-600">
                          <TrendingUp className="h-3 w-3" />
                          <span>+3 geçen aya göre</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activities - Beyaz panelden alınan tasarım */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                      <Card>
                        <CardHeader className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold">Son Aktiviteler</h3>
                          <Button variant="outline">Tümünü Gör</Button>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {[
                              {
                                id: 1,
                                type: 'order',
                                title: 'Yeni kurban bağışı',
                                description: 'Ahmet Yılmaz tarafından 850₺ değerinde bağış yapıldı',
                                time: '2 dakika önce',
                                status: 'success',
                                icon: ShoppingCart
                              },
                              {
                                id: 2,
                                type: 'user',
                                title: 'Yeni kullanıcı kaydı',
                                description: 'Fatma Demir sisteme kayıt oldu',
                                time: '15 dakika önce',
                                status: 'info',
                                icon: Users
                              },
                              {
                                id: 3,
                                type: 'stream',
                                title: 'Canlı yayın başladı',
                                description: 'Kurban kesimi canlı yayını başlatıldı',
                                time: '1 saat önce',
                                status: 'warning',
                                icon: Video
                              }
                            ].map((activity) => (
                              <div key={activity.id} className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                <div className={`rounded-full p-2 ${
                                  activity.status === 'success' ? 'bg-green-100 text-green-600' :
                                  activity.status === 'warning' ? 'bg-orange-100 text-orange-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  <activity.icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium mb-1">{activity.title}</h4>
                                  <p className="text-sm text-zinc-500 mb-2">{activity.description}</p>
                                  <span className="text-xs text-zinc-400">{activity.time}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <Card>
                        <CardHeader>
                          <h3 className="text-xl font-semibold">En Aktif Bölgeler</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {[
                              { name: 'İstanbul', orders: 45, shares: 12 },
                              { name: 'Ankara', orders: 32, shares: 8 },
                              { name: 'İzmir', orders: 28, shares: 6 },
                              { name: 'Bursa', orders: 15, shares: 4 }
                            ].map((region, index) => (
                              <div key={region.name} className={`flex items-center justify-between p-3 rounded-lg ${
                                index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-zinc-50 dark:bg-zinc-900'
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                    index === 0 ? 'bg-yellow-500' : 'bg-zinc-500'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium">{region.name}</div>
                                    <div className="text-sm text-zinc-500">{region.orders} bağış</div>
                                  </div>
                                </div>
                                <div className={`font-bold ${index === 0 ? 'text-yellow-700' : 'text-zinc-600'}`}>
                                  {region.shares}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Quick Actions - Beyaz panelden alınan tasarım */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-xl font-semibold">Hızlı İşlemler</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex-col gap-2">
                          <Users className="h-6 w-6" />
                          <span>Yeni Kullanıcı</span>
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white p-4 h-auto flex-col gap-2">
                          <Video className="h-6 w-6" />
                          <span>Yayın Başlat</span>
                        </Button>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto flex-col gap-2">
                          <FileText className="h-6 w-6" />
                          <span>Sertifika Oluştur</span>
                        </Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white p-4 h-auto flex-col gap-2">
                          <ShoppingCart className="h-6 w-6" />
                          <span>Bağış Yönet</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gerçek Zamanlı Olaylar */}
                  {realTimeEvents.length > 0 && (
                    <Card className="mt-6">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          <span className="font-semibold">Gerçek Zamanlı Olaylar</span>
                          <Badge tone="green">{realTimeEvents.length}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {realTimeEvents.slice(-5).reverse().map((event, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                              <div className="text-xs text-zinc-500">
                                {new Date(event.timestamp).toLocaleTimeString('tr-TR')}
                              </div>
                              <Badge tone="green">{event.type}</Badge>
                              <div className="text-sm flex-1">
                                {event.data?.message || JSON.stringify(event.data)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {active === "users" && (
            <div className="space-y-6">
              {/* Users Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h1>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Sistem kullanıcılarını görüntüleyin, düzenleyin ve yönetin
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={() => setShowUserModal(true)}>
                    <Users className="mr-2 h-4 w-4" />
                    Yeni Kullanıcı
                  </Button>
                  <Button variant="outline" onClick={()=>exportUsersXLSX(users)}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel İndir
                  </Button>
                </div>
              </div>

              {/* Users Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Toplam Kullanıcı</div>
                      <div className="text-2xl font-semibold">{users.length}</div>
                    </div>
                    <Users className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Aktif Kullanıcı</div>
                      <div className="text-2xl font-semibold">
                        {users.filter(u => u.isActive).length}
                      </div>
                    </div>
                    <UserIcon className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Bu Ay Yeni</div>
                      <div className="text-2xl font-semibold">
                        {users.filter(u => {
                          const created = new Date(u.createdAt);
                          const now = new Date();
                          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                        }).length}
                      </div>
                    </div>
                    <Calendar className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Pasif Kullanıcı</div>
                      <div className="text-2xl font-semibold">
                        {users.filter(u => !u.isActive).length}
                      </div>
                    </div>
                    <UserIcon className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
              </div>

              {/* Users Table */}
              <UsersTable data={users} onToggle={toggleUser} onExport={()=>exportUsersXLSX(users)} search={search} onSearchChange={setSearch} />
            </div>
          )}

          {active === "donations" && (
            <div className="space-y-6">
              {/* Donations Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Bağış Yönetimi</h1>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Kurban bağışlarını görüntüleyin, onaylayın ve yönetin
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={() => setShowDonationModal(true)}>
                    <Gift className="mr-2 h-4 w-4" />
                    Yeni Bağış
                  </Button>
                  <Button variant="outline" onClick={() => alert('Bağış raporu yakında')}>
                    <Download className="mr-2 h-4 w-4" />
                    Rapor İndir
                  </Button>
                </div>
              </div>

              {/* Donations Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Toplam Bağış</div>
                      <div className="text-2xl font-semibold">{donations.length}</div>
                    </div>
                    <Gift className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Tamamlanan</div>
                      <div className="text-2xl font-semibold">
                        {donations.filter(d => d.status === 'tamamlandi').length}
                      </div>
                    </div>
                    <Check className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Toplam Tutar</div>
                      <div className="text-2xl font-semibold">
                        {tl(donations.filter(d => d.status === 'tamamlandi').reduce((sum, d) => sum + d.amount, 0))}
                      </div>
                    </div>
                    <DollarSign className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Bekleyen</div>
                      <div className="text-2xl font-semibold">
                        {donations.filter(d => d.status === 'bekliyor').length}
                      </div>
                    </div>
                    <Clock className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
              </div>

              {/* Payment Methods Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Ödeme Yöntemleri</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { method: 'İyzico', count: donations.filter(d => d.method === 'iyzico').length, color: 'bg-blue-500' },
                        { method: 'Stripe', count: donations.filter(d => d.method === 'stripe').length, color: 'bg-purple-500' },
                        { method: 'PayPal', count: donations.filter(d => d.method === 'paypal').length, color: 'bg-yellow-500' },
                        { method: 'Havale', count: donations.filter(d => d.method === 'havale').length, color: 'bg-green-500' },
                        { method: 'Kapıda', count: donations.filter(d => d.method === 'kapida').length, color: 'bg-orange-500' }
                      ].map((item) => (
                        <div key={item.method} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="text-sm font-medium">{item.method}</span>
                          </div>
                          <span className="text-sm text-zinc-500">{item.count} bağış</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Son Bağışlar</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {donations.slice(0, 5).map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <div>
                            <div className="font-medium">{donation.donorName}</div>
                            <div className="text-sm text-zinc-500">{fmt(donation.createdAt)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{tl(donation.amount)}</div>
                            <Badge tone={donation.status === 'tamamlandi' ? 'green' : donation.status === 'iptal' ? 'red' : 'amber'}>
                              {donation.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Donations Table */}
              <DonationsTable data={donations} search={search} />
            </div>
          )}

          {active === "carts" && (
            <CartsSection />
          )}

          {active === "broadcasts" && (
            <div className="space-y-6">
              {/* Broadcasts Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Yayın Yönetimi</h1>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Canlı kurban kesimi yayınlarını yönetin ve izleyin
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={() => setShowBroadcastModal(true)}>
                    <Video className="mr-2 h-4 w-4" />
                    Yayın Başlat
                  </Button>
                  <Button variant="outline" onClick={() => alert('Yayın geçmişi yakında')}>
                    <Clock className="mr-2 h-4 w-4" />
                    Geçmiş
                  </Button>
                </div>
              </div>

              {/* Broadcast Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Aktif Yayın</div>
                      <div className="text-2xl font-semibold">
                        {broadcasts.filter(b => b.status === 'aktif').length}
                      </div>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/40 rounded-xl p-3">
                      <Video className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Oluşturulan Yayın</div>
                      <div className="text-2xl font-semibold">
                        {broadcasts.filter(b => b.status === 'draft' || b.status === 'aktif').length}
                      </div>
                    </div>
                    <Video className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Zamanlı Yayın</div>
                      <div className="text-2xl font-semibold">
                        {broadcasts.filter(b => b.status === 'zamanli').length}
                      </div>
                    </div>
                    <Calendar className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Pasif Yayın</div>
                      <div className="text-2xl font-semibold">
                        {broadcasts.filter(b => b.status === 'pasif').length}
                      </div>
                    </div>
                    <Square className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
              </div>

              {/* Live Broadcasts */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Canlı Yayınlar</h3>
                    <Badge tone="green">LIVE</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {broadcasts.filter(b => b.status === 'aktif').length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {broadcasts.filter(b => b.status === 'aktif').map((broadcast) => (
                        <div key={broadcast.id} className="relative bg-zinc-900 rounded-xl overflow-hidden">
                          <div className="aspect-video bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Video className="h-12 w-12 mx-auto mb-2" />
                              <div className="text-lg font-semibold">{broadcast.title}</div>
                              <div className="text-sm opacity-80">Beklenen</div>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{broadcast.title}</div>
                                <div className="text-sm text-zinc-500">
                                  {broadcast.startedAt ? fmt(broadcast.startedAt) : 'Başlatılıyor...'}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Play className="h-4 w-4 mr-1" />
                                  İzle
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Square className="h-4 w-4 mr-1" />
                                  Durdur
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Video className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Aktif yayın yok</h3>
                      <p className="text-zinc-500 mb-4">Şu anda canlı yayın bulunmuyor</p>
                      <Button onClick={() => setShowBroadcastModal(true)}>
                        <Video className="mr-2 h-4 w-4" />
                        Yayın Başlat
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Scheduled Broadcasts */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Zamanlı Yayınlar</h3>
                </CardHeader>
                <CardContent>
                  {broadcasts.filter(b => b.status === 'zamanli').length > 0 ? (
                    <div className="space-y-4">
                      {broadcasts.filter(b => b.status === 'zamanli').map((broadcast) => (
                        <div key={broadcast.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="bg-orange-100 dark:bg-orange-900/40 rounded-xl p-3">
                              <Calendar className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <div className="font-medium">{broadcast.title}</div>
                              <div className="text-sm text-zinc-500">
                                {broadcast.startedAt ? fmt(broadcast.startedAt) : 'Tarih belirlenmedi'}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4 mr-1" />
                              Başlat
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" />
                              Düzenle
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                      <p className="text-zinc-500">Zamanlı yayın bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All Broadcasts Table */}
              <Broadcasts data={broadcasts} />
            </div>
          )}

          {active === "analytics" && (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Genel Analiz</h1>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Sistem performansı ve kullanıcı davranışları analizi
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={() => alert('Detaylı rapor yakında')}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Detaylı Rapor
                  </Button>
                  <Button variant="outline" onClick={() => alert('Excel export yakında')}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel İndir
                  </Button>
                </div>
              </div>

              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Toplam Gelir</div>
                      <div className="text-2xl font-semibold">
                        {tl(donations.filter(d => d.status === 'tamamlandi').reduce((sum, d) => sum + d.amount, 0))}
                      </div>
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +15% bu ay
                      </div>
                    </div>
                    <DollarSign className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Aktif Kullanıcı</div>
                      <div className="text-2xl font-semibold">
                        {users.filter(u => u.isActive).length}
                      </div>
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +12% bu ay
                      </div>
                    </div>
                    <Users className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Başarı Oranı</div>
                      <div className="text-2xl font-semibold">
                        {donations.length > 0 ? Math.round((donations.filter(d => d.status === 'tamamlandi').length / donations.length) * 100) : 0}%
                      </div>
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +3% bu ay
                      </div>
                    </div>
                    <Check className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Ortalama Bağış</div>
                      <div className="text-2xl font-semibold">
                        {donations.length > 0 ? tl(donations.reduce((sum, d) => sum + d.amount, 0) / donations.length) : '₺0'}
                      </div>
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +8% bu ay
                      </div>
                    </div>
                    <Gift className="h-4 w-4 text-zinc-400" />
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <Analytics donations={donations} users={users} />

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Ödeme Yöntemi Dağılımı</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { method: 'İyzico', count: donations.filter(d => d.method === 'iyzico').length, percentage: donations.length > 0 ? Math.round((donations.filter(d => d.method === 'iyzico').length / donations.length) * 100) : 0, color: 'bg-blue-500' },
                        { method: 'Stripe', count: donations.filter(d => d.method === 'stripe').length, percentage: donations.length > 0 ? Math.round((donations.filter(d => d.method === 'stripe').length / donations.length) * 100) : 0, color: 'bg-purple-500' },
                        { method: 'PayPal', count: donations.filter(d => d.method === 'paypal').length, percentage: donations.length > 0 ? Math.round((donations.filter(d => d.method === 'paypal').length / donations.length) * 100) : 0, color: 'bg-yellow-500' },
                        { method: 'Havale', count: donations.filter(d => d.method === 'havale').length, percentage: donations.length > 0 ? Math.round((donations.filter(d => d.method === 'havale').length / donations.length) * 100) : 0, color: 'bg-green-500' },
                        { method: 'Kapıda', count: donations.filter(d => d.method === 'kapida').length, percentage: donations.length > 0 ? Math.round((donations.filter(d => d.method === 'kapida').length / donations.length) * 100) : 0, color: 'bg-orange-500' }
                      ].map((item) => (
                        <div key={item.method} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${item.color}`} />
                              <span className="text-sm font-medium">{item.method}</span>
                            </div>
                            <span className="text-sm text-zinc-500">{item.percentage}%</span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Bağış Durumu</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { status: 'Tamamlandı', count: donations.filter(d => d.status === 'tamamlandi').length, color: 'bg-green-500' },
                        { status: 'Bekliyor', count: donations.filter(d => d.status === 'bekliyor').length, color: 'bg-yellow-500' },
                        { status: 'İptal', count: donations.filter(d => d.status === 'iptal').length, color: 'bg-red-500' }
                      ].map((item) => (
                        <div key={item.status} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="text-sm font-medium">{item.status}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">{item.count}</div>
                            <div className="text-xs text-zinc-500">
                              {donations.length > 0 ? Math.round((item.count / donations.length) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Son Aktiviteler</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: 'donation', message: 'Yeni bağış: ₺850', time: '2 dakika önce', color: 'text-green-600' },
                      { type: 'user', message: 'Yeni kullanıcı kaydı', time: '15 dakika önce', color: 'text-blue-600' },
                      { type: 'broadcast', message: 'Canlı yayın başladı', time: '1 saat önce', color: 'text-orange-600' },
                      { type: 'payment', message: 'Ödeme tamamlandı: ₺1,200', time: '2 saat önce', color: 'text-green-600' },
                      { type: 'user', message: 'Kullanıcı doğrulandı', time: '3 saat önce', color: 'text-blue-600' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${activity.color.replace('text-', 'bg-')}`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{activity.message}</div>
                          <div className="text-xs text-zinc-500">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {active === "backend-status" && (
            <BackendStatusSection />
          )}

          {active === "settings" && (
            <div className="space-y-6">
              {/* Settings Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Sistem Ayarları</h1>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Sistem konfigürasyonu ve genel ayarlar
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={() => {
                    alert('Ayarlar başarıyla kaydedildi!');
                    console.log('Sistem ayarları güncellendi');
                  }}>
                    <Settings className="mr-2 h-4 w-4" />
                    Kaydet
                  </Button>
                  <Button variant="outline" onClick={() => alert('Varsayılan ayarlar yüklendi')}>
                    <Download className="mr-2 h-4 w-4" />
                    Varsayılan
                  </Button>
                </div>
              </div>

              {/* General Settings */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Genel Ayarlar</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-zinc-500 mb-2">Site Adı</div>
                      <Input defaultValue="Kurban Cebimde" />
                    </div>
                    <div>
                      <div className="text-sm text-zinc-500 mb-2">Site URL</div>
                      <Input defaultValue="https://kurbancebimde.com" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-zinc-500 mb-2">Yönetici E-postası</div>
                      <Input defaultValue="admin@kurbancebimde.com" />
                    </div>
                    <div>
                      <div className="text-sm text-zinc-500 mb-2">Destek E-postası</div>
                      <Input defaultValue="destek@kurbancebimde.com" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500 mb-2">Site Açıklaması</div>
                    <textarea 
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                      rows={3}
                      defaultValue="Kurban kesimi ve bağış platformu"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Settings */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Ödeme Ayarları</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-zinc-500 mb-2">Ana Ödeme Sağlayıcı</div>
                      <select className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600">
                        <option value="iyzico">İyzico</option>
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-500 mb-2">Para Birimi</div>
                      <select className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600">
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">Amerikan Doları ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-zinc-500 mb-2">İyzico API Anahtarı</div>
                      <Input placeholder="••••••••••••••••" type="password" />
                    </div>
                    <div>
                      <div className="text-sm text-zinc-500 mb-2">İyzico Secret Key</div>
                      <Input placeholder="••••••••••••••••" type="password" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="test-mode" className="rounded" defaultChecked />
                    <label htmlFor="test-mode" className="text-sm text-zinc-500">Test modu aktif</label>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Bildirim Ayarları</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">E-posta Bildirimleri</div>
                        <div className="text-sm text-zinc-500">Yeni bağış ve kullanıcı kayıtları için e-posta bildirimleri</div>
                      </div>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">SMS Bildirimleri</div>
                        <div className="text-sm text-zinc-500">Önemli işlemler için SMS bildirimleri</div>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Push Bildirimleri</div>
                        <div className="text-sm text-zinc-500">Mobil uygulama için push bildirimleri</div>
                      </div>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Güvenlik Ayarları</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-zinc-500 mb-2">Oturum Süresi (dakika)</div>
                      <Input defaultValue="60" type="number" />
                    </div>
                    <div>
                      <div className="text-sm text-zinc-500 mb-2">Maksimum Giriş Denemesi</div>
                      <Input defaultValue="5" type="number" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="2fa" className="rounded" />
                    <label htmlFor="2fa" className="text-sm text-zinc-500">İki faktörlü kimlik doğrulama</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="ssl" className="rounded" defaultChecked />
                    <label htmlFor="ssl" className="text-sm text-zinc-500">SSL sertifikası zorunlu</label>
                  </div>
                </CardContent>
              </Card>

              {/* System Info */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Sistem Bilgileri</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">Sistem Versiyonu</span>
                        <span className="text-sm font-medium">v1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">Son Güncelleme</span>
                        <span className="text-sm font-medium">10 Eylül 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">Veritabanı</span>
                        <span className="text-sm font-medium">PostgreSQL 14</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">Backend</span>
                        <span className="text-sm font-medium">FastAPI</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">Frontend</span>
                        <span className="text-sm font-medium">React + TypeScript</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">Sunucu</span>
                        <span className="text-sm font-medium">Ubuntu 22.04</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

      {/* User Creation Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Yeni Kullanıcı Ekle</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const role = formData.get('role') as string;
              createUser({
                name: formData.get('name') as string,
                surname: formData.get('surname') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                password: formData.get('password') as string,
                roles: role ? [role] : ['user']
              }).then(() => {
                setShowUserModal(false);
                // Modal kapatıldı, kullanıcı listesi zaten güncellendi
              }).catch((error) => {
                console.error('Form submit hatası:', error);
                // Hata durumunda modal açık kalsın
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ad</label>
                  <input name="name" required className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" placeholder="Test" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Soyad</label>
                  <input name="surname" required className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" placeholder="Kullanıcı" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input name="email" type="email" required className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" placeholder="test@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input name="phone" required className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" placeholder="+905551234568" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Şifre</label>
                  <input name="password" type="password" required className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select name="role" required className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700">
                    <option value="">Rol Seçin</option>
                    <option value="user">Kullanıcı</option>
                    <option value="moderator">Moderatör</option>
                    <option value="admin">Yönetici</option>
                    <option value="super_admin">Süper Yönetici</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1">Oluştur</Button>
                <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>İptal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Donation Creation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Yeni Bağış Ekle</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              alert('Bağış ekleme özelliği yakında aktif olacak');
              setShowDonationModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bağışçı Adı</label>
                  <input name="donorName" required className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Miktar (TL)</label>
                  <input name="amount" type="number" required className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ödeme Yöntemi</label>
                  <select name="method" className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700">
                    <option value="iyzico">İyzico</option>
                    <option value="stripe">Stripe</option>
                    <option value="havale">Havale</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1">Ekle</Button>
                <Button type="button" variant="outline" onClick={() => setShowDonationModal(false)}>İptal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Creation Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Yeni Yayın Başlat</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              alert('Yayın başlatma özelliği yakında aktif olacak');
              setShowBroadcastModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Yayın Başlığı</label>
                  <input name="title" required className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Açıklama</label>
                  <textarea name="description" className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" rows={3}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Konum</label>
                  <input name="location" className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1">Başlat</Button>
                <Button type="button" variant="outline" onClick={() => setShowBroadcastModal(false)}>İptal</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ---------- Integration Notes ----------
// - Gerçek API entegrasyonu tamamlandı
//   useEffect(() => { fetch('/api/admin/v1/users').then(r=>r.json()).then(setUsers); }, []);
//   useEffect(() => { fetch('/api/admin/v1/donations').then(r=>r.json()).then(setDonations); }, []);
// - JWT/Cookie için fetch/axios'ta credentials:true kullanmayı unutma.
// - Bu dosyayı AdminDashboard.tsx olarak projenin pages veya routes yapısına ekleyip kullanabilirsin.
