import { useState } from 'react'
import { Video, Plus, Play, Pause, Square, Settings, Eye, Edit, Trash2, Users, Clock, MapPin } from 'lucide-react'

export default function StreamsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedStream, setSelectedStream] = useState<any>(null)

  // Mock streams data
  const streams = [
    {
      id: 1,
      title: 'Kurban Kesimi - Türkiye Bölgesi',
      status: 'live',
      viewers: 1250,
      duration: '2:15:30',
      location: 'Türkiye',
      animal_count: 15,
      created_at: '2024-01-15 10:00',
      organizer: 'Türkiye Diyanet İşleri',
      target_amount: 5000,
      current_amount: 3200,
      rtmp_key: 'turkiye_buyukbas_001',
      stream_url: 'https://stream.example.com/turkiye_buyukbas_001',
      description: 'Türkiye bölgesinde büyükbaş kurban kesimi canlı yayını',
      tags: ['Büyükbaş', 'Türkiye', 'Canlı'],
      quality: '1080p',
      bitrate: '2500 kbps',
    },
    {
      id: 2,
      title: 'Afrika Kurban Kesimi',
      status: 'scheduled',
      viewers: 0,
      duration: '00:00:00',
      location: 'Afrika',
      animal_count: 8,
      created_at: '2024-01-20 14:00',
      organizer: 'Afrika Yardım Kuruluşu',
      target_amount: 3000,
      current_amount: 0,
      rtmp_key: 'afrika_koyun_002',
      stream_url: 'https://stream.example.com/afrika_koyun_002',
      description: 'Afrika bölgesinde koyun kurban kesimi planlanan yayını',
      tags: ['Koyun', 'Afrika', 'Planlandı'],
      quality: '720p',
      bitrate: '1500 kbps',
    },
    {
      id: 3,
      title: 'Kurban Bağışı Canlı Yayını',
      status: 'ended',
      viewers: 890,
      duration: '1:45:20',
      location: 'Türkiye',
      animal_count: 12,
      created_at: '2024-01-18 09:00',
      organizer: 'Türkiye İnsani Yardım Vakfı',
      target_amount: 4000,
      current_amount: 3800,
      rtmp_key: 'turkiye_koc_003',
      stream_url: 'https://stream.example.com/turkiye_koc_003',
      description: 'Türkiye\'de koç kurban kesimi tamamlanan yayını',
      tags: ['Koç', 'Türkiye', 'Tamamlandı'],
      quality: '1080p',
      bitrate: '2000 kbps',
    },
    {
      id: 4,
      title: 'Somali Büyükbaş Kurban Kesimi',
      status: 'draft',
      viewers: 0,
      duration: '00:00:00',
      location: 'Somali',
      animal_count: 20,
      created_at: '2024-01-22 16:00',
      organizer: 'Somali İnsani Yardım Vakfı',
      target_amount: 8000,
      current_amount: 0,
      rtmp_key: 'somali_buyukbas_004',
      stream_url: 'https://stream.example.com/somali_buyukbas_004',
      description: 'Somali bölgesinde büyükbaş kurban kesimi taslak yayını',
      tags: ['Büyükbaş', 'Somali', 'Taslak'],
      quality: '720p',
      bitrate: '1800 kbps',
    },
  ]

  const getStatusConfig = (status: string) => {
    const configs = {
      live: { label: 'Canlı', color: '#ef4444', bgColor: '#fee2e2', icon: Play },
      scheduled: { label: 'Planlandı', color: '#f59e0b', bgColor: '#fef3c2', icon: Clock },
      ended: { label: 'Bitti', color: '#6b7280', bgColor: '#f3f4f6', icon: Square },
      draft: { label: 'Taslak', color: '#8b5cf6', bgColor: '#f3e8ff', icon: Edit },
    }
    return configs[status as keyof typeof configs] || configs.scheduled
  }

  const handleCreateStream = () => {
    setShowCreateModal(true)
  }

  const handleEditStream = (stream: any) => {
    setSelectedStream(stream)
    setShowCreateModal(true)
  }

  const handleDeleteStream = (streamId: number) => {
    if (confirm('Bu yayını silmek istediğinizden emin misiniz?')) {
      console.log('Yayın siliniyor:', streamId)
      // API call to delete stream
    }
  }

  const handleStartStream = (streamId: number) => {
    console.log('Yayın başlatılıyor:', streamId)
    // API call to start stream
  }

  const handleStopStream = (streamId: number) => {
    if (confirm('Yayını durdurmak istediğinizden emin misiniz?')) {
      console.log('Yayın durduruluyor:', streamId)
      // API call to stop stream
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>Canlı Yayınlar</h1>
          <p style={{
            color: '#6b7280',
            margin: '0.5rem 0 0 0'
          }}>
            Kurban kesimi canlı yayınlarını yönetin ve izleyin
          </p>
        </div>
        
        <button
          onClick={handleCreateStream}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          <Plus size={20} />
          Yeni Yayın
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Yayın ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="live">Canlı</option>
          <option value="scheduled">Planlandı</option>
          <option value="ended">Bitti</option>
          <option value="draft">Taslak</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
            {streams.filter(s => s.status === 'live').length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Canlı Yayın</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
            {streams.filter(s => s.status === 'scheduled').length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Planlandı</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#6b7280' }}>
            {streams.filter(s => s.status === 'ended').length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Tamamlandı</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
            {streams.filter(s => s.status === 'draft').length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Taslak</div>
        </div>
      </div>

      {/* Live streams grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {streams.map((stream) => {
          const statusConfig = getStatusConfig(stream.status)
          const Icon = statusConfig.icon
          
          return (
            <div key={stream.id} style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {/* Stream thumbnail */}
              <div style={{
                height: '200px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Video style={{ height: '3rem', width: '3rem', color: '#9ca3af' }} />
                
                {/* Status indicator */}
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: statusConfig.bgColor,
                  color: statusConfig.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <Icon style={{ height: '0.75rem', width: '0.75rem' }} />
                  {statusConfig.label}
                </div>

                {/* Live indicator */}
                {stream.status === 'live' && (
                  <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <div style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite'
                    }} />
                    CANLI
                  </div>
                )}
              </div>

              {/* Stream info */}
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  {stream.title}
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <MapPin style={{ height: '1rem', width: '1rem' }} />
                    {stream.location}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <Users style={{ height: '1rem', width: '1rem' }} />
                      {stream.viewers} izleyici
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <Clock style={{ height: '1rem', width: '1rem' }} />
                      {stream.duration}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    {stream.animal_count} hayvan • {stream.created_at}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  {stream.status === 'live' && (
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}>
                      <Pause style={{ height: '0.875rem', width: '0.875rem' }} />
                      Durdur
                    </button>
                  )}

                  {stream.status === 'scheduled' && (
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}>
                      <Play style={{ height: '0.875rem', width: '0.875rem' }} />
                      Başlat
                    </button>
                  )}

                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    <Eye style={{ height: '0.875rem', width: '0.875rem' }} />
                    İzle
                  </button>

                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    <Edit style={{ height: '0.875rem', width: '0.875rem' }} />
                    Düzenle
                  </button>

                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    <Settings style={{ height: '0.875rem', width: '0.875rem' }} />
                    Ayarlar
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Create/Edit Stream Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                {selectedStream ? 'Yayını Düzenle' : 'Yeni Yayın Oluştur'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setSelectedStream(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Yayın Başlığı
                </label>
                <input
                  type="text"
                  defaultValue={selectedStream?.title || ''}
                  placeholder="Yayın başlığını girin"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Açıklama
                </label>
                <textarea
                  defaultValue={selectedStream?.description || ''}
                  placeholder="Yayın açıklamasını girin"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Bölge
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}>
                    <option value="Türkiye">Türkiye</option>
                    <option value="Somali">Somali</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Bangladeş">Bangladeş</option>
                    <option value="Afrika">Afrika</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Hayvan Sayısı
                  </label>
                  <input
                    type="number"
                    defaultValue={selectedStream?.animal_count || 1}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Hedef Tutar (₺)
                  </label>
                  <input
                    type="number"
                    defaultValue={selectedStream?.target_amount || 1000}
                    min="100"
                    step="100"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    RTMP Anahtarı
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedStream?.rtmp_key || ''}
                    placeholder="rtmp_key_001"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Kalite
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Bitrate
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}>
                    <option value="1500 kbps">1500 kbps</option>
                    <option value="2000 kbps">2000 kbps</option>
                    <option value="2500 kbps">2500 kbps</option>
                    <option value="5000 kbps">5000 kbps</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setSelectedStream(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {selectedStream ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
