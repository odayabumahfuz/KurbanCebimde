import React, { useState, useEffect } from 'react';
import { Video, Plus, Play, Square, Clock, Copy, User, Hash, Zap, Calendar } from "lucide-react";
import { adminApi, streamsAPI } from "../lib/adminApi";
import Layout from "../components/Layout";

const StreamsPage: React.FC = () => {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [creatingStream, setCreatingStream] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [page] = useState<number>(1);
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    fetchStreams();
    fetchDonations();
  }, [selectedStatus]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      console.log('🔄 Streams yükleniyor...');
      
      const params: { page?: number; size?: number; status?: string } = { page, size: 20 };
      if (selectedStatus !== 'all') params.status = selectedStatus;
      
      type StreamListResponse = { items?: any[]; total?: number };
      const resp = await streamsAPI.getStreams(params) as StreamListResponse;
      console.log('✅ Streams response:', resp);
      setStreams(resp.items || []);
      console.log('✅ Streams yüklendi:', (resp.items?.length) || 0);
    } catch (error) {
      console.error('❌ Streams yükleme hatası:', error);
      setStreams([]);
    } finally {
      setLoading(false);
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
      const ingressData = await (adminApi as any).request(`/streams/${streamId}/ingress`, { method: 'POST' });
      alert(`RTMP Yayın Bilgileri:\n\nRTMP URL: ${ingressData.rtmp_url}\nStream Key: ${ingressData.stream_key}\n\nLarix Broadcaster veya Streamlabs ile yayınlayabilirsiniz!`);
    } catch (error) {
      console.error('RTMP bilgileri alınamadı:', error);
      alert('RTMP bilgileri alınamadı!');
    }
  };

  const handleEndStream = async (streamId: string) => {
    try {
      console.log('Yayın sonlandırılıyor:', streamId);
      await streamsAPI.stopStream(streamId);
      fetchStreams();
    } catch (error) {
      console.error('Yayın sonlandırma hatası:', error);
    }
  };

  // Stats kullanım dışı - backend hazır olduğunda yeniden eklenecek

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
      
      type CreateResponse = { stream_id: string; status: string };
      const resp = await streamsAPI.createStream({
        title: streamTitle.trim(),
        description: streamDescription.trim(),
        donation_id: selectedDonation?.id,
        duration_seconds: 120
      }) as CreateResponse;

      alert(`Yayın oluşturuldu!\nStream ID: ${resp.stream_id}\nDurum: ${resp.status}`);
      setShowCreateModal(false);
      setSelectedUserId('');
      setStreamTitle('');
      setStreamDescription('');
      fetchStreams(); // Streams listesini yenile
      
    } catch (error: unknown) {
      console.error('Yayın oluşturulamadı:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Yayın oluşturulamadı: ' + message);
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
      <div className="page-container space-y-6">
        {/* Header */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Canlı Yayınlar</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Kurban kesimi canlı yayınlarını yönetin ve izleyin</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
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
                className="input-field"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select-field"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="live">Canlı</option>
              <option value="ended">Sonlandırılmış</option>
            </select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card stat-green">
              <div>
                <div className="stat-title">Canlı Yayın</div>
                <div className="stat-value">{streams.filter(s => s.status === 'live').length}</div>
              </div>
              <div className="stat-icon">
                <Video className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-card stat-blue">
              <div>
                <div className="stat-title">Oluşturulan Yayın</div>
                <div className="stat-value">{streams.length}</div>
              </div>
              <div className="stat-icon">
                <Video className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-card stat-zinc">
              <div>
                <div className="stat-title">Tamamlanan</div>
                <div className="stat-value">{streams.filter(s => s.status === 'ended').length}</div>
              </div>
              <div className="stat-icon">
                <Square className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-card stat-amber">
              <div>
                <div className="stat-title">Beklenen Yayın</div>
                <div className="stat-value">{donations.length - streams.length}</div>
              </div>
              <div className="stat-icon">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Streams List */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400">Yayınlar yükleniyor...</p>
              </div>
            </div>
          ) : filteredStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStreams.map((stream) => (
                <div key={stream.id} className="card hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{stream.title}</h3>
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
                  
                  <div className="space-y-2 text-sm text-slate-600 dark:text-zinc-400 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-slate-900 dark:text-zinc-300 font-medium">{stream.user_name} {stream.user_surname}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      <span className="font-mono text-xs">{stream.kurban_id?.substring(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>Hayvan: {stream.animal_type || 'Belirtilmemiş'} • Adet: {stream.animal_count ?? '-'} • Niyet: {stream.slaughter_intent || '-'}</span>
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
                        className="btn-success px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Katıl
                      </button>
                      <button 
                        onClick={() => handleGetRTMPInfo(stream.id)}
                        className="btn-primary px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        RTMP
                      </button>
                      <button 
                        onClick={() => handleEndStream(stream.id)}
                        className="btn-danger px-3 py-2 rounded-lg text-sm flex items-center gap-1"
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
              <Video className="w-16 h-16 text-slate-400 dark:text-zinc-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-2">Aktif yayın yok</h3>
              <p className="text-slate-500 dark:text-zinc-400">Şu anda canlı yayın bulunmuyor</p>
            </div>
          )}
        </div>

        {/* Create Stream Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-2xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-zinc-100">
                  Yeni Yayın Oluştur
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* User Selection */}
                <div>
                  <label className="form-label">
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
                    className="select-field w-full"
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
                  <div className="card-light p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Seçilen Kullanıcı</h3>
                      <button
                        onClick={() => copyUserId(selectedUserId)}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
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
                            <span className="text-slate-500 dark:text-zinc-400">Kullanıcı:</span>
                            <span className="text-slate-900 dark:text-zinc-100">{selectedDonation.name} {selectedDonation.surname}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-zinc-400">Bağış:</span>
                            <span className="text-slate-900 dark:text-zinc-100">{selectedDonation.amount} TL</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-zinc-400">Tutar:</span>
                            <span className="text-slate-900 dark:text-zinc-100">{selectedDonation.amount} TL</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-zinc-400">Tarih:</span>
                            <span className="text-slate-900 dark:text-zinc-100">
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
                  <label className="form-label">
                    Yayın Başlığı
                  </label>
                  <input
                    type="text"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    placeholder="Yayın başlığını girin"
                    className="input-field"
                  />
                </div>

                {/* Stream Description */}
                <div>
                  <label className="form-label">
                    Açıklama
                  </label>
                  <textarea
                    value={streamDescription}
                    onChange={(e) => setStreamDescription(e.target.value)}
                    placeholder="Yayın açıklamasını girin"
                    rows={3}
                    className="input-field resize-vertical"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                    İptal
                  </button>
                  <button
                    onClick={handleCreateStream}
                    disabled={creatingStream || !selectedUserId || !streamTitle.trim()}
                    className="btn-danger flex-1 disabled:bg-zinc-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
