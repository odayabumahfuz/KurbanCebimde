import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Video, Play, Square, Users, Clock, MapPin, Eye, Settings } from 'lucide-react';
import { livekitAPI } from '../lib/livekitApi';
import { adminApi } from '../lib/adminApi';
import { liveAPI } from '../lib/liveApi';
import StreamViewer from '../components/StreamViewer';
import Layout from '../components/Layout';

const StreamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [streamData, setStreamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewers, setViewers] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [token, setToken] = useState<string>('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStreamData();
      // Her 5 saniyede bir viewer sayısını güncelle
      const interval = setInterval(fetchViewerCount, 5000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const fetchStreamData = async () => {
    try {
      setLoading(true);
      const response = await livekitAPI.getStream(id || '');
      setStreamData(response);
    } catch (error) {
      console.error('Stream verisi alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchViewerCount = async () => {
    try {
      const response = await livekitAPI.getStream(id || '');
      setViewers(response?.participant_count || 0);
    } catch (error) {
      console.error('Viewer sayısı alınamadı:', error);
    }
  };

  const handleJoinStream = async () => {
    if (!id || !streamData?.room_name) return;
    try {
      setTokenLoading(true);
      setTokenError(null);
      const res = await liveAPI.getToken('admin', streamData.room_name);
      setToken(res?.token || res?.access_token || '');
      setIsWatching(true);
    } catch (e: any) {
      setTokenError(e?.message || 'Token alınamadı');
      alert(e?.message || 'Token alınamadı');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleEndStream = async () => {
    if (confirm('Bu yayını sonlandırmak istediğinizden emin misiniz?')) {
      try {
        await livekitAPI.endStream(id || '');
        alert('Yayın sonlandırıldı');
        fetchStreamData();
      } catch (error) {
        console.error('Yayın sonlandırma hatası:', error);
        alert('Yayın sonlandırılamadı');
      }
    }
  };

  const handleGenerateToken = async () => {
    if (!id || !streamData?.room_name) return;
    try {
      setTokenLoading(true);
      setTokenError(null);
      const res = await liveAPI.getToken('admin', streamData.room_name);
      const t = res?.token || res?.access_token || '';
      setToken(t);
      setShowTokenModal(true);
    } catch (e: any) {
      setTokenError(e?.message || 'Token alınamadı');
      alert(e?.message || 'Token alınamadı');
    } finally {
      setTokenLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-zinc-400">Yayın verileri yükleniyor...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!streamData) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6 text-center">
            <h1 className="text-3xl font-bold text-zinc-100 mb-4">Yayın Bulunamadı</h1>
            <p className="text-zinc-400">Bu yayın mevcut değil veya silinmiş olabilir.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-100 mb-2">{streamData.title}</h1>
              <p className="text-zinc-400">{streamData.description}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                streamData.status === 'live' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {streamData.status === 'live' ? 'Canlı' : 'Sonlandırılmış'}
              </span>
            </div>
          </div>

          {/* Stream Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-zinc-400 text-sm">İzleyici</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{viewers}</div>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-zinc-400 text-sm">Süre</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">
                {streamData.started_at ? 
                  Math.floor((Date.now() - new Date(streamData.started_at).getTime()) / 60000) + ' dk' : 
                  'Bilinmiyor'
                }
              </div>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span className="text-zinc-400 text-sm">Konum</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{streamData.location || 'Bilinmiyor'}</div>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-5 h-5 text-orange-400" />
                <span className="text-zinc-400 text-sm">Yayıncı</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{streamData.host_name || 'Admin'}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {streamData.status === 'live' ? (
              <>
                <button
                  onClick={handleJoinStream}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Eye size={20} />
                  {tokenLoading ? 'Token alınıyor...' : (isWatching ? 'Yayını İzle' : 'Yayına Katıl')}
                </button>
                <button
                  onClick={handleEndStream}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Square size={20} />
                  Yayını Sonlandır
                </button>
                <button
                  onClick={handleGenerateToken}
                  className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Settings size={20} />
                  Token Üret
                </button>
              </>
            ) : (
              <button
                onClick={fetchStreamData}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Settings size={20} />
                Bilgileri Yenile
              </button>
            )}
            <button
              onClick={()=> window.location.href = '/admin/streams'}
              className="flex items-center gap-2 bg-zinc-600 hover:bg-zinc-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Video size={20} />
              Yayın Arşivi
            </button>
          </div>
        </div>

        {/* Stream Player Placeholder */}
        {isWatching && streamData.status === 'live' && token && (
          <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Canlı Yayın</h2>
            <div className="bg-black rounded-lg aspect-video overflow-hidden">
              <StreamViewer streamId={id || ''} roomName={streamData.room_name} token={token} />
            </div>
          </div>
        )}

        {/* Stream Details */}
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">Yayın Detayları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-zinc-100 mb-3">Genel Bilgiler</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Stream ID:</span>
                  <span className="text-zinc-100 font-mono">{streamData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Room Name:</span>
                  <span className="text-zinc-100 font-mono">{streamData.room_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Durum:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    streamData.status === 'live' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {streamData.status === 'live' ? 'Canlı' : 'Sonlandırılmış'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Başlangıç:</span>
                  <span className="text-zinc-100">
                    {streamData.started_at ? 
                      new Date(streamData.started_at).toLocaleString('tr-TR') : 
                      'Bilinmiyor'
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-zinc-100 mb-3">İstatistikler</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Toplam İzleyici:</span>
                  <span className="text-zinc-100">{streamData.participant_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Maksimum İzleyici:</span>
                  <span className="text-zinc-100">{streamData.max_participants || 'Sınırsız'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Yayın Kalitesi:</span>
                  <span className="text-zinc-100">HD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Ses Kalitesi:</span>
                  <span className="text-zinc-100">Yüksek</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={()=>setShowTokenModal(false)}>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 w-full max-w-lg" onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">Erişim Token</h3>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-3 font-mono text-xs break-all">
              {token || 'Token yok'}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={()=>{ navigator.clipboard.writeText(token); alert('Kopyalandı'); }} className="px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-800">Kopyala</button>
              <button onClick={()=>setShowTokenModal(false)} className="px-3 py-2 rounded bg-blue-600 text-white">Kapat</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StreamDetailPage;