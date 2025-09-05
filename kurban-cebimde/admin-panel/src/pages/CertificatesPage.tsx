import { useState } from 'react'
import { FileText, Search, Download, Eye, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Mock certificates data
  const certificates = [
    {
      id: 1,
      user_name: 'Ahmet Yılmaz',
      order_id: 1001,
      status: 'issued',
      issued_date: '2024-01-15',
      animal_type: 'Koç',
      location: 'Türkiye',
      certificate_number: 'CERT-2024-001'
    },
    {
      id: 2,
      user_name: 'Fatma Demir',
      order_id: 1002,
      status: 'pending',
      issued_date: null,
      animal_type: 'Koyun',
      location: 'Afrika',
      certificate_number: 'CERT-2024-002'
    },
    {
      id: 3,
      user_name: 'Mehmet Kaya',
      order_id: 1003,
      status: 'issued',
      issued_date: '2024-01-18',
      animal_type: 'Koç',
      location: 'Türkiye',
      certificate_number: 'CERT-2024-003'
    }
  ]

  const getStatusConfig = (status: string) => {
    const configs = {
      issued: { label: 'Verildi', color: '#10b981', bgColor: '#dcfce7', icon: CheckCircle },
      pending: { label: 'Bekliyor', color: '#f59e0b', bgColor: '#fef3c2', icon: Clock },
      cancelled: { label: 'İptal', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page header */}
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#111827'
        }}>Sertifika Yönetimi</h1>
        <p style={{
          color: '#6b7280',
          marginTop: '0.25rem'
        }}>
          Kurban bağış sertifikalarını yönetin ve görüntüleyin
        </p>
      </div>

      {/* Actions bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          <FileText style={{ height: '1rem', width: '1rem' }} />
          Yeni Sertifika
        </button>

        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#0284c7',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          <Download style={{ height: '1rem', width: '1rem' }} />
          Toplu İndir
        </button>

        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <Search style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '1.25rem',
            width: '1.25rem',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            placeholder="Sertifikalarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              outline: 'none'
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
            outline: 'none',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="issued">Verildi</option>
          <option value="pending">Bekliyor</option>
          <option value="cancelled">İptal</option>
        </select>
      </div>

      {/* Certificates list */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151'
          }}>Sertifika Listesi ({certificates.length})</h3>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {certificates.map((cert) => {
            const statusConfig = getStatusConfig(cert.status)
            const Icon = statusConfig.icon
            
            return (
              <div key={cert.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText style={{ height: '1.5rem', width: '1.5rem', color: '#6b7280' }} />
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.5rem'
                    }}>
                      {cert.certificate_number}
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <span>{cert.user_name}</span>
                      <span>•</span>
                      <span>Order #{cert.order_id}</span>
                      <span>•</span>
                      <span>{cert.animal_type}</span>
                      <span>•</span>
                      <span>{cert.location}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color
                    }}>
                      <Icon style={{ height: '0.75rem', width: '0.75rem' }} />
                      {statusConfig.label}
                    </span>
                    
                    {cert.issued_date && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        {cert.issued_date}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                    Görüntüle
                  </button>

                  {cert.status === 'issued' && (
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
                      <Download style={{ height: '0.875rem', width: '0.875rem' }} />
                      İndir
                    </button>
                  )}

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
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    <Trash2 style={{ height: '0.875rem', width: '0.875rem' }} />
                    Sil
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
