import api from './api';

export const liveAPI = {
  createStream: async ({ kurbanId, startAt }) => {
    const { data } = await api.post('/live/create', { kurban_id: kurbanId, start_at: startAt });
    return data; // { channel, stream_id }
  },
  getToken: async ({ role, channel }) => {
    const { data } = await api.post('/live/token', null, { params: { role, channel } });
    return data; // { rtcToken, appId, channel, uid }
  },
  startStream: async (streamId) => {
    const { data } = await api.post('/live/start', { stream_id: streamId });
    return data;
  },
  stopStream: async ({ streamId }) => {
    const { data } = await api.post('/live/stop', { stream_id: streamId });
    return data;
  },
};

export default liveAPI;


