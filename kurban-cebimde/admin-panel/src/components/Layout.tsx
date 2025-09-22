import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, Gift, ShoppingCart, Video, Activity, BarChart3, Settings, ShieldCheck, LogOut, Sun, Moon } from 'lucide-react';

// ---------- Utils ----------
function clsx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

// ---------- Theme Context ----------
const ThemeContext = React.createContext<{
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const useTheme = () => React.useContext(ThemeContext);

// ---------- UI Components ----------
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' | 'ghost' | 'primary' | 'secondary' | 'danger' }> = ({ 
  className, 
  variant = 'outline', 
  children, 
  ...props 
}) => (
  <button 
    {...props} 
    className={clsx(
      "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900",
      variant === 'primary' 
        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-500" 
        : variant === 'secondary'
        ? "bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white shadow-lg hover:shadow-xl focus:ring-zinc-500"
        : variant === 'danger'
        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-red-500"
        : variant === 'outline' 
        ? "border border-zinc-600 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white focus:ring-zinc-500" 
        : "hover:bg-zinc-800 text-zinc-400 hover:text-white focus:ring-zinc-500",
      className
    )}
  >
    {children}
  </button>
);

// ---------- Sidebar ----------
const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const items = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutGrid size={18} />, url: "/admin/dashboard" },
    { key: "users", label: "Users", icon: <Users size={18} />, url: "/admin/users" },
    { key: "donations", label: "Donations", icon: <Gift size={18} />, url: "/admin/donations" },
    { key: "carts", label: "Carts", icon: <ShoppingCart size={18} />, url: "/admin/carts" },
    { key: "streams", label: "Streams", icon: <Video size={18} />, url: "/admin/streams" },
    { key: "backend-status", label: "API Status", icon: <Activity size={18} />, url: "/admin/backend-status" },
    { key: "reports", label: "Analytics", icon: <BarChart3 size={18} />, url: "/admin/reports" },
    { key: "settings", label: "Settings", icon: <Settings size={18} />, url: "/admin/settings" },
  ];
  
  const handleMenuClick = (item: any) => {
    navigate(item.url);
  };
  
  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      navigate('/admin/login');
    }
  };
  
  const isActive = (url: string) => {
    return location.pathname === url;
  };
  
  return (
    <aside className={clsx(
      "h-screen w-64 shrink-0 flex flex-col",
      theme === 'dark' 
        ? "bg-slate-900 border-r border-slate-800" 
        : "bg-white border-r border-slate-200"
    )}>
      {/* Header */}
      <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">AdminKit</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Management Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => handleMenuClick(it)}
            className={clsx(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive(it.url)
                ? "bg-blue-600 text-white shadow-sm"
                : theme === 'dark'
                  ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {it.icon}
            <span>{it.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={clsx(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            theme === 'dark'
              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

// ---------- Layout Component ----------
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={clsx(
        "min-h-screen flex",
        theme === 'dark' ? "bg-slate-950" : "bg-slate-50"
      )}>
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  );
};

export default Layout;