import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Donations from './pages/Donations'
import Campaigns from './pages/Campaigns'
import Streams from './pages/Streams'
import StreamDetailPage from './features/streams/pages/StreamDetailPage'

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/*" element={
      <Layout>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="donations" element={<Donations />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="streams" element={<Streams />} />
          <Route path="streams/:id" element={<StreamDetailPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    } />
  </Routes>
)

export default App


