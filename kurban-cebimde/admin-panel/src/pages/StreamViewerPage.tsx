import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StreamViewer from '../components/StreamViewer';
import Layout from '../components/Layout';

const StreamViewerPage: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const [token, setToken] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const getStreamToken = async () => {
      try {
        if (!streamId) {
          setError('Stream ID bulunamadı');
          setLoading(false);
          return;
        }

        // Önce admin token al
        const loginResponse = await fetch('http://185.149.103.247:8000/api/admin/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneOrEmail: 'admin@kurbancebimde.com',
            password: 'admin123'
          }),
        });

        if (!loginResponse.ok) {
          throw new Error('Admin login başarısız');
        }

        const loginData = await loginResponse.json();
        const adminToken = loginData.access_token;

        // Stream token al
        const response = await fetch(`http://185.149.103.247:8000/api/admin/v1/streams/${streamId}/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Token alınamadı');
        }

        const data = await response.json();
        setToken(data.token);
        setRoomName(data.room_name);
        setLoading(false);
      } catch (error) {
        console.error('Token alma hatası:', error);
        setError('Yayın token alınamadı');
        setLoading(false);
      }
    };

    getStreamToken();
  }, [streamId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-zinc-400">Yayın yükleniyor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">❌</div>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <StreamViewer 
      streamId={streamId || ''} 
      roomName={roomName} 
      token={token} 
    />
  );
};

export default StreamViewerPage;
