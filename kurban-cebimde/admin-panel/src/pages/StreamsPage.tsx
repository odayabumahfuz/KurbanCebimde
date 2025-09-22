import React, { useState, useEffect } from 'react';
import { Video, Plus, Play, Pause, Square, Settings, Eye, Edit, Trash2, Users, Clock, MapPin, Copy, User, Hash, Zap, Calendar } from "lucide-react";
import { adminApi, streamsAPI } from "../lib/adminApi";
import Layout from "../components/Layout";

const StreamsPage: React.FC = () => {
  const [streams, setStreams] = useState<any[]>([]);
  const [livekitStreams, setLivekitStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [creatingStream, setCreatingStream] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    fetchStreams();
    fetchLivekitStreams();
    fetchStats();
    fetchDonations();
  }, [page, selectedStatus]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      console.log('🔄 Streams yükleniyor...');
      
      const params: any = { page, size: 20 };
      if (selectedStatus !== 'all') params.status = selectedStatus;
      
      const response = await streamsAPI.getStreams(params);
      console.log('✅ Streams response:', response);
      
      setStreams(response.items || []);
      setTotal(response.total || 0);
      console.log('✅ Streams yüklendi:', response.items?.length || 0);
    } catch (error) {
      console.error('❌ Streams yükleme hatası:', error);
      setStreams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLivekitStreams = async () => {
    try {
      // Gerçek LiveKit API'den stream verilerini çek
      // TODO: LiveKit API endpoint'i eklendiğinde buraya gerçek API çağrısı yapılacak
      setLivekitStreams([]);
    } catch (error) {
      console.error('❌ LiveKit streams yükleme hatası:', error);
      setLivekitStreams([]);
    }
  };

  const filteredStreams = streams.filter(stream => {
    if (searchTerm && !stream.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedStatus !== 'all' && stream.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const handleJoinStream = (streamId: string) => {
    console.log('Yayına katılıyor:', streamId);
    // Yayın izleme sayfasına yönlendir
    window.open(`/stream/${streamId}`, '_blank');
  };

  const handleGetRTMPInfo = async (streamId: string) => {
    try {
      // RTMP Ingress oluştur
      const ingressResponse = await fetch(`${import.meta.env.VITE_API_BASE}/streams/${streamId}/ingress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (ingressResponse.ok) {
        const ingressData = await ingressResponse.json();
        alert(`RTMP Yayın Bilgileri:\n\nRTMP URL: ${ingressData.rtmp_url}\nStream Key: ${ingressData.stream_key}\n\nLarix Broadcaster veya Streamlabs ile yayınlayabilirsiniz!`);
      } else {
        const errorData = await ingressResponse.json();
        alert(`RTMP Ingress oluşturulamadı: ${errorData.detail || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('RTMP bilgileri alınamadı:', error);
      alert('RTMP bilgileri alınamadı!');
    }
  };

  const handleEndStream = async (streamId: string) => {
    try {
      console.log('Yayın sonlandırılıyor:', streamId);
      await livekitAPI.endStream(streamId);
      fetchLivekitStreams(); // Listeyi yenile
    } catch (error) {
      console.error('Yayın sonlandırma hatası:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminApi.getStats();
      setStats(response?.data || null);
    } catch (error) {
      console.error('Stats yüklenemedi:', error);
    }
  };

  const fetchDonations = async () => {
    try {
      const response = await adminApi.getDonations();
      setDonations(response?.items || []);
    } catch (error) {
      console.error('Bağışlar yüklenemedi:', error);
    }
  };

  const handleCreateStream = async () => {
    if (!selectedUserId) {
      alert('Kullanıcı seçiniz');
      return;
    }

    if (!streamTitle.trim()) {
      alert('Yayın başlığı gerekli');
      return;
    }

    try {
      setCreatingStream(true);
      
      const selectedDonation = donations.find(d => d.user_id === selectedUserId);
      
      const response = await streamsAPI.createStream({
        title: streamTitle.trim(),
        description: streamDescription.trim(),
        donation_id: selectedDonation?.id,
        duration_seconds: 120
      });

      alert(`Yayın oluşturuldu!\nStream ID: ${response.stream_id}\nDurum: ${response.status}`);
      setShowCreateModal(false);
      setSelectedUserId('');
      setStreamTitle('');
      setStreamDescription('');
      fetchStreams(); // Streams listesini yenile
      fetchLivekitStreams();
      fetchStats(); // Stats'ı yenile
      
    } catch (error) {
      console.error('Yayın oluşturulamadı:', error);
      alert('Yayın oluşturulamadı: ' + error.message);
    } finally {
      setCreatingStream(false);
    }
  };

  const copyUserId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    alert('Kullanıcı ID kopyalandı');
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-zinc-100">Canlı Yayınlar</h1>
              <p className="text-zinc-400 mt-2">Kurban kesimi canlı yayınlarını yönetin ve izleyin</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Yeni Yayın
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Yayın ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="live">Canlı</option>
              <option value="ended">Sonlandırılmış</option>
            </select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Canlı Yayın</p>
                  <p className="text-2xl font-bold text-green-400">{streams.filter(s => s.status === 'live').length}</p>
                </div>
                <Video className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Oluşturulan Yayın</p>
                  <p className="text-2xl font-bold text-blue-400">{streams.length}</p>
                </div>
                <Video className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Tamamlanan</p>
                  <p className="text-2xl font-bold text-zinc-400">{streams.filter(s => s.status === 'ended').length}</p>
                </div>
                <Square className="w-8 h-8 text-zinc-400" />
              </div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Beklenen Yayın</p>
                  <p className="text-2xl font-bold text-orange-400">{donations.length - streams.length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Streams List */}
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-zinc-400">Yayınlar yükleniyor...</p>
              </div>
            </div>
          ) : filteredStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStreams.map((stream) => (
                <div key={stream.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-zinc-100">{stream.title}</h3>
                    <span className={`status-badge ${
                      stream.status === 'live' 
                        ? 'status-live' 
                        : stream.status === 'scheduled'
                        ? 'status-scheduled'
                        : 'status-ended'
                    }`}>
                      {stream.status === 'live' ? 'Canlı' : 
                       stream.status === 'scheduled' ? 'Bekleniyor' : 
                       'Sonlandırılmış'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-zinc-400 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-zinc-300 font-medium">{stream.user_name} {stream.user_surname}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      <span className="font-mono text-xs">{stream.kurban_id?.substring(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>Kesilecek Hayvan: {stream.animal_type || 'Koyun'}, {stream.animal_count} adet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Bağış: {new Date(stream.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Yayın: {new Date(stream.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                  
                  {/* Butonlar canlı ve beklenen yayınlarda gösterilsin */}
                  {(stream.status === 'live' || stream.status === 'scheduled') && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleJoinStream(stream.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        Katıl
                      </button>
                      <button 
                        onClick={() => handleGetRTMPInfo(stream.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                      >
                        <Zap className="w-3 h-3" />
                        RTMP
                      </button>
                      <button 
                        onClick={() => handleEndStream(stream.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                      >
                        <Square className="w-3 h-3" />
                        Sonlandır
                      </button>
                    </div>
                  )}
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

        {/* Create Stream Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-zinc-100">
                  Yeni Yayın Oluştur
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-400 hover:text-zinc-300 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* User Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Bağış Yapan Kullanıcı
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      const selectedDonation = donations.find(d => d.user_id === e.target.value);
                      if (selectedDonation) {
                        const userName = `${selectedDonation.name} ${selectedDonation.surname}`;
                        setStreamTitle(`${userName} kurban kesim yayını`);
                        setStreamDescription(`${userName} için kurban kesimi canlı yayını`);
                      }
                    }}
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Kullanıcı seçiniz</option>
                    {donations.map((donation) => (
                      <option key={donation.id} value={donation.user_id}>
                        {donation.name} {donation.surname} - {donation.amount} TL
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected User Info */}
                {selectedUserId && (
                  <div className="bg-zinc-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-zinc-100">Seçilen Kullanıcı</h3>
                      <button
                        onClick={() => copyUserId(selectedUserId)}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <Copy size={16} />
                        ID Kopyala
                      </button>
                    </div>
                    {(() => {
                      const selectedDonation = donations.find(d => d.user_id === selectedUserId);
                      return selectedDonation ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Kullanıcı:</span>
                            <span className="text-zinc-100">{selectedDonation.name} {selectedDonation.surname}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Bağış:</span>
                            <span className="text-zinc-100">{selectedDonation.amount} TL</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Tutar:</span>
                            <span className="text-zinc-100">{selectedDonation.amount} TL</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Tarih:</span>
                            <span className="text-zinc-100">
                              {new Date(selectedDonation.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Stream Title */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Yayın Başlığı
                  </label>
                  <input
                    type="text"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    placeholder="Yayın başlığını girin"
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Stream Description */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={streamDescription}
                    onChange={(e) => setStreamDescription(e.target.value)}
                    placeholder="Yayın açıklamasını girin"
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg font-medium transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleCreateStream}
                    disabled={creatingStream || !selectedUserId || !streamTitle.trim()}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {creatingStream ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Video size={16} />
                        Yayın Oluştur
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StreamsPage;

// CSS Styles
const styles = `
  .status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-live {
    background-color: #10b981;
    color: white;
  }
  
  .status-scheduled {
    background-color: #f59e0b;
    color: white;
  }
  
  .status-ended {
    background-color: #6b7280;
    color: white;
  }
`;

// CSS'i head'e ekle
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
