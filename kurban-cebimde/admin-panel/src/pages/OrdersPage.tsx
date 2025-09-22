import React from 'react';
import Layout from '../components/Layout';

const OrdersPage: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
          <h1 className="text-3xl font-bold text-zinc-100 mb-4">Siparişler</h1>
          <p className="text-zinc-400">Sipariş yönetimi sayfası</p>
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;