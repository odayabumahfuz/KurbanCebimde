import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
// UI Components - Basit versiyonlar
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`card ${className || ''}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-6 pb-0 ${className || ''}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={`text-lg font-semibold text-zinc-900 dark:text-zinc-100 ${className || ''}`}>
    {children}
  </h3>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-6 ${className || ''}`}>
    {children}
  </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' | 'default' }> = ({ 
  children, 
  className, 
  variant = 'default',
  ...props 
}) => (
  <button 
    {...props}
    className={`${variant === 'outline' ? 'btn-secondary' : 'btn-primary'} ${className || ''}`}
  >
    {children}
  </button>
);

const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'destructive' }> = ({ 
  children, 
  variant = 'default' 
}) => (
  <span className={`status-badge ${
    variant === 'destructive' 
      ? 'status-failed'
      : 'status-active'
  }`}>
    {children}
  </span>
);

const Alert: React.FC<{ children: React.ReactNode; variant?: 'default' | 'destructive' }> = ({ 
  children, 
  variant = 'default' 
}) => (
  <div className={`p-4 rounded-lg border ${
    variant === 'destructive' 
      ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-800 dark:text-red-200'
      : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-200'
  }`}>
    {children}
  </div>
);

const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm">
    {children}
  </div>
);

const Tabs: React.FC<{ children: React.ReactNode; defaultValue?: string; className?: string }> = ({ 
  children, 
  defaultValue,
  className 
}) => (
  <div className={className || ''}>
    {children}
  </div>
);

const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`flex space-x-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 ${className || ''}`}>
    {children}
  </div>
);

const TabsTrigger: React.FC<{ 
  children: React.ReactNode; 
  value: string; 
  className?: string;
  onClick?: () => void;
}> = ({ children, value, className, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      className || ''
    }`}
  >
    {children}
  </button>
);

const TabsContent: React.FC<{ 
  children: React.ReactNode; 
  value: string; 
  className?: string;
}> = ({ children, value, className }) => (
  <div className={className || ''}>
    {children}
  </div>
);
import { 
  Server, 
  Database, 
  Monitor, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Trash2,
  Clock,
  Cpu,
  HardDrive,
  Users,
  ShoppingCart,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface SystemInfo {
  cpu_usage: string;
  memory_usage: string;
  memory_total: string;
  memory_available: string;
  disk_usage: string;
  disk_total: string;
  disk_free: string;
  uptime: string;
  timestamp: string;
}

interface ServiceStatus {
  backend: {
    status: string;
    port: number;
    last_check: string;
  };
  admin_panel: {
    status: string;
    port: number;
    last_check: string;
  };
  database: {
    status: string;
    file: string;
    last_check: string;
  };
  timestamp: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

interface ApiEndpoint {
  name: string;
  method: string;
  url: string;
  status: string;
  responseTime?: number;
}

const BackendStatusPage: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('--');

  const apiEndpointsList = [
    { name: 'Health Check', method: 'GET', url: '/health' },
    { name: 'Admin Users', method: 'GET', url: '/api/admin/v1/users' },
    { name: 'Admin Donations', method: 'GET', url: '/api/admin/v1/donations' },
    { name: 'Admin Carts', method: 'GET', url: '/api/admin/v1/carts' },
    { name: 'Monitor Logs', method: 'GET', url: '/api/monitor/logs' },
    { name: 'Monitor System', method: 'GET', url: '/api/monitor/system' },
    { name: 'Monitor Status', method: 'GET', url: '/api/monitor/status' }
  ];

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/monitor/system`);
      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data);
      }
    } catch (error) {
      console.error('System info fetch error:', error);
    }
  };

  const fetchServiceStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/monitor/status`);
      if (response.ok) {
        const data = await response.json();
        setServiceStatus(data);
      }
    } catch (error) {
      console.error('Service status fetch error:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/monitor/logs`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Logs fetch error:', error);
    }
  };

  const checkApiEndpoints = async () => {
    const endpoints = await Promise.all(
      apiEndpointsList.map(async (endpoint) => {
        const startTime = Date.now();
        try {
          const response = await fetch(`${API_BASE}${endpoint.url}`, {
            method: 'GET',
            mode: 'cors'
          });
          const responseTime = Date.now() - startTime;
          
          return {
            ...endpoint,
            status: response.ok ? 'online' : 'warning',
            responseTime
          };
        } catch (error) {
          return {
            ...endpoint,
            status: 'offline',
            responseTime: 0
          };
        }
      })
    );
    
    setApiEndpoints(endpoints);
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchSystemInfo(),
      fetchServiceStatus(),
      fetchLogs(),
      checkApiEndpoints()
    ]);
    setLoading(false);
    setLastUpdate(new Date().toLocaleTimeString('tr-TR'));
  };

  const exportLogs = () => {
    const logText = logs.map(log => `[${log.timestamp}] ${log.level}: ${log.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backend-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Aktif';
      case 'warning':
        return 'Uyarı';
      case 'offline':
        return 'Pasif';
      default:
        return 'Bilinmiyor';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    refreshAll();
    
    const interval = setInterval(() => {
      refreshAll();
    }, 30000); // 30 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backend Durumu</h1>
          <p className="text-gray-600 mt-2">Sistem monitörü ve performans analizi</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Son güncelleme: {lastUpdate}
          </div>
          <Button onClick={refreshAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backend</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(serviceStatus?.backend?.status || 'offline')}`} />
              <span className="text-2xl font-bold">
                {getStatusText(serviceStatus?.backend?.status || 'offline')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Port: {serviceStatus?.backend?.port || 8000}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Panel</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(serviceStatus?.admin_panel?.status || 'offline')}`} />
              <span className="text-2xl font-bold">
                {getStatusText(serviceStatus?.admin_panel?.status || 'offline')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Port: {serviceStatus?.admin_panel?.port || 3001}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veritabanı</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(serviceStatus?.database?.status || 'offline')}`} />
              <span className="text-2xl font-bold">
                {getStatusText(serviceStatus?.database?.status || 'offline')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {serviceStatus?.database?.file || 'test.db'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      {systemInfo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Kullanımı</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemInfo.cpu_usage}</div>
              <p className="text-xs text-muted-foreground">
                Sistem yükü
              </p>
            </CardContent>
          </Card>

                     <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">RAM Kullanımı</CardTitle>
               <Database className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{systemInfo.memory_usage}</div>
               <p className="text-xs text-muted-foreground">
                 {systemInfo.memory_available} kullanılabilir
               </p>
             </CardContent>
           </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disk Kullanımı</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemInfo.disk_usage}</div>
              <p className="text-xs text-muted-foreground">
                {systemInfo.disk_free} boş alan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemInfo.uptime}</div>
              <p className="text-xs text-muted-foreground">
                Sistem çalışma süresi
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for Logs and API Status */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Sistem Logları</TabsTrigger>
          <TabsTrigger value="api">API Durumları</TabsTrigger>
          <TabsTrigger value="alerts">Uyarılar</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sistem Logları</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={exportLogs}>
                    <Download className="w-4 h-4 mr-2" />
                    İndir
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearLogs}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Temizle
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {logs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Henüz log bulunmuyor</p>
                ) : (
                  logs.slice(-50).map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Badge className={getLogLevelColor(log.level)}>
                        {log.level}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{log.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Durumları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{endpoint.name}</h3>
                      <Badge variant={endpoint.status === 'online' ? 'default' : 'destructive'}>
                        {endpoint.status === 'online' ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{endpoint.method} {endpoint.url}</p>
                    {endpoint.responseTime && (
                      <p className="text-xs text-gray-500">
                        Response: {endpoint.responseTime}ms
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Uyarıları</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Şu anda aktif uyarı bulunmuyor. Sistem normal çalışıyor.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {alert.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
                 </TabsContent>
       </Tabs>
       </div>
     </Layout>
   );
 };

export default BackendStatusPage;
