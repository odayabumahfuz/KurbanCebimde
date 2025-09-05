import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../lib/adminApi";
import { useWebSocket, WebSocketEvent } from "../lib/websocket";
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
  Phone,
  Mail,
  CreditCard,
  ShieldCheck,
  Search,
  LayoutGrid,
  Gift,
  Video,
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
  Trash2,
  X,
  Wifi,
  WifiOff,
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
// Mock veriler kaldırıldı, artık API'den dinamik veri gelecek

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
    { key: "dashboard", label: "Dashboard", icon: <LayoutGrid size={18} /> },
    { key: "users", label: "Kullanıcılar", icon: <Users size={18} /> },
    { key: "donations", label: "Bağışlar", icon: <Gift size={18} /> },
          { key: "carts", label: "Sepetler", icon: <ShoppingCart size={18} /> },
      { key: "broadcasts", label: "Yayınlar", icon: <Video size={18} /> },
      { key: "backend-status", label: "Backend Durumu", icon: <Activity size={18} /> },
      { key: "analytics", label: "Genel Analiz", icon: <BarChart3 size={18} /> },
    { key: "settings", label: "Ayarlar", icon: <Settings size={18} /> },
  ];
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
            onClick={() => onSelect(it.key)}
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
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="font-semibold">Kullanıcılar</div>
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 text-zinc-400" size={18}/>
            <Input 
              placeholder="Ara (kullanıcı, e-posta, telefon)…" 
              value={search} 
              onChange={(e)=>onSearchChange(e.target.value)} 
              className="pl-8"
            />
          </div>
          <Button variant="outline" onClick={onExport}><Download size={16}/>CSV İndir</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-3">Ad Soyad</th>
                <th className="py-2 pr-3">Tel No</th>
                <th className="py-2 pr-3">E-posta</th>
                <th className="py-2 pr-3">Kullanıcı ID</th>
                <th className="py-2 pr-3">Durum</th>
                <th className="py-2 pr-3">Oluşturma</th>
                <th className="py-2 pr-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u)=> (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 pr-3">{u.name} {u.surname}</td>
                  <td className="py-3 pr-3">{u.phone}</td>
                  <td className="py-3 pr-3">{u.email}</td>
                  <td className="py-3 pr-3"><button onClick={()=>copyId(u.id)} className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:underline"><CreditCard size={14}/>{u.id}</button></td>
                  <td className="py-3 pr-3">{u.isActive ? <Badge tone="green">Aktif</Badge> : <Badge tone="red">Pasif</Badge>}</td>
                  <td className="py-3 pr-3">{fmt(u.createdAt)}</td>
                  <td className="py-3 pr-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={()=>onToggle(u.id)}>{u.isActive ? "Pasifleştir" : "Aktifleştir"}</Button>
                      <Button variant="ghost"><MoreHorizontal size={16}/></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
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
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCarts({ page: 1, size: 50 });
      setCarts(response.data?.carts || []);
    } catch (error) {
      console.error('Sepet verileri yüklenirken hata:', error);
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

  const apiEndpointsList = [
    { name: 'Health Check', method: 'GET', url: '/health' },
    { name: 'Admin Users', method: 'GET', url: '/api/admin/v1/users' },
    { name: 'Admin Donations', method: 'GET', url: '/api/admin/v1/donations' },
    { name: 'Mobile Login', method: 'POST', url: '/api/auth/login' },
    { name: 'User Profile', method: 'GET', url: '/api/user/profile' },
    { name: 'Cart Items', method: 'GET', url: '/api/cart/items' },
    { name: 'Monitor Logs', method: 'GET', url: '/api/monitor/logs' },
    { name: 'Monitor System', method: 'GET', url: '/api/monitor/system' },
    { name: 'Monitor Status', method: 'GET', url: '/api/monitor/status' }
  ];

  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 30000); // 30 saniyede bir güncelle
    return () => clearInterval(interval);
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
      
      // Sistem bilgilerini al
      const systemResponse = await fetch('http://localhost:8000/api/monitor/system');
      if (systemResponse.ok) {
        const systemData = await systemResponse.json();
        setSystemInfo(systemData);
        setBackendRunning(true);
      } else {
        setBackendRunning(false);
      }

      // Servis durumunu al
      const statusResponse = await fetch('http://localhost:8000/api/monitor/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setServiceStatus(statusData);
      }

      // Logları al
      const logsResponse = await fetch('http://localhost:8000/api/monitor/logs');
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData.logs || []);
      }

      // API endpoint durumlarını kontrol et
      const endpointChecks = await Promise.allSettled(
        apiEndpointsList.map(async (endpoint) => {
          const startTime = Date.now();
          try {
            const response = await fetch(`http://localhost:8000${endpoint.url}`, {
              method: endpoint.method,
              headers: { 'Content-Type': 'application/json' }
            });
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
const Analytics: React.FC = () => {
  // Mock data for charts (API'den gelecek)
  const donationByDay = [
    { day: "Pzt", amount: 1200 },
    { day: "Sal", amount: 1800 },
    { day: "Çar", amount: 900 },
    { day: "Per", amount: 2100 },
    { day: "Cum", amount: 1500 },
    { day: "Cmt", amount: 800 },
    { day: "Paz", amount: 1100 },
  ];

  const activeUsersByDay = [
    { day: "Pzt", count: 45 },
    { day: "Sal", count: 52 },
    { day: "Çar", count: 38 },
    { day: "Per", count: 61 },
    { day: "Cum", count: 48 },
    { day: "Cmt", count: 35 },
    { day: "Paz", count: 42 },
  ];

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
function exportUsersCSV(users: User[]) {
  const headers = ["ad", "soyad", "telefon", "eposta", "kullanici_id", "durum", "olusturma"];
  const rows = users.map(u => [u.name, u.surname, u.phone, u.email, u.id, u.isActive ? "aktif" : "pasif", u.createdAt]);
  const csv = [headers.join(","), ...rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'\"')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `kullanicilar-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ---------- Main Component ----------
export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [realTimeEvents, setRealTimeEvents] = useState<WebSocketEvent[]>([]);

  // WebSocket bağlantısı - basit kontrol
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState<Error | null>(null);

  // Basit WebSocket bağlantı kontrolü
  useEffect(() => {
    const checkWebSocket = async () => {
      try {
        const response = await fetch('http://localhost:8000/ws/status');
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
    const interval = setInterval(checkWebSocket, 10000); // 10 saniyede bir kontrol
    return () => clearInterval(interval);
  }, []);

  // WebSocket olaylarını dinle - geçici olarak devre dışı
  // useEffect(() => {
  //   if (manager) {
  //     // Admin odasına katıl
  //     manager.joinAdminRoom('admin_1');
  //     // Gerçek zamanlı olayları dinle
  //   }
  // }, [manager]);

  // API'den veri çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1) Kullanıcılar
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

        // 2) Bağışlar (Order)
        const donationsResp = await adminApi.getDonations({ page: 1, size: 50 });
        const uiDonations: Donation[] = (donationsResp?.items || []).map((o: any) => ({
          id: String(o.id),
          donorName: o.user_id ? String(o.user_id) : 'Bilinmiyor',
          amount: Number(o.amount || 0),
          method: 'iyzico',
          status: String(o.status || 'bekliyor') as any,
          createdAt: o.created_at || new Date().toISOString(),
        }));

        setUsers(uiUsers);
        setDonations(uiDonations);
        setBroadcasts([]);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex">
      <Sidebar active={active} onSelect={setActive} />
      <main className="flex-1 min-w-0">
        <Topbar wsConnected={wsConnected} wsError={wsError} />
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Veriler yükleniyor...</p>
              </div>
            </div>
          ) : (
            <>
              {active === "dashboard" && (
                <>
                  <StatGrid users={users} donations={donations} broadcasts={broadcasts} />
                  <div className="space-y-6">
                    <UsersTable data={users} onToggle={toggleUser} onExport={()=>exportUsersCSV(users)} search={search} onSearchChange={setSearch} />
                    <DonationsTable data={donations} search={search} />
                  </div>
                  
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
            <UsersTable data={users} onToggle={toggleUser} onExport={()=>exportUsersCSV(users)} search={search} onSearchChange={setSearch} />
          )}

          {active === "donations" && (
            <DonationsTable data={donations} search={search} />
          )}

          {active === "carts" && (
            <CartsSection />
          )}

          {active === "broadcasts" && (
            <Broadcasts data={broadcasts} />
          )}

          {active === "analytics" && (
            <Analytics />
          )}

          {active === "backend-status" && (
            <BackendStatusSection />
          )}

          {active === "settings" && (
            <Card>
              <CardHeader className="font-semibold">Ayarlar</CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-zinc-500 mb-1">Site Adı</div>
                    <Input defaultValue="Kurban Cebimde" />
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500 mb-1">Yönetici E-postası</div>
                    <Input defaultValue="admin@test.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-zinc-500 mb-1">Ödeme Sağlayıcı</div>
                    <Input defaultValue="iyzico" />
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500 mb-1">API Anahtarı</div>
                    <Input placeholder="••••••••••" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Kaydet</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

// ---------- Integration Notes ----------
// - Mock verileri gerçek API ile değiştirmek için:
//   useEffect(() => { fetch('/api/admin/v1/users').then(r=>r.json()).then(setUsers); }, []);
//   useEffect(() => { fetch('/api/admin/v1/donations').then(r=>r.json()).then(setDonations); }, []);
// - JWT/Cookie için fetch/axios'ta credentials:true kullanmayı unutma.
// - Bu dosyayı AdminDashboard.tsx olarak projenin pages veya routes yapısına ekleyip kullanabilirsin.
