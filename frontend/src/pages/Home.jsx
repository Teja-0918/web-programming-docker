import { useEffect, useState } from 'react';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { request } from '../services/api';
import { getOrders } from '../services/orderService';
import { getProducts } from '../services/productService';
import { getUsers } from '../services/userService';

function Home({ onNavigate }) {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const response = await request('/stats');
        if (response?.data) {
          setStats(response.data);
        } else {
          const [usersResponse, productsResponse, ordersResponse] = await Promise.all([
            getUsers(),
            getProducts(),
            getOrders(),
          ]);

          setStats({
            users: Array.isArray(usersResponse?.data) ? usersResponse.data.length : 0,
            products: Array.isArray(productsResponse?.data) ? productsResponse.data.length : 0,
            orders: Array.isArray(ordersResponse?.data) ? ordersResponse.data.length : 0,
          });
        }
      } catch (err) {
        try {
          const [usersResponse, productsResponse, ordersResponse] = await Promise.all([
            getUsers(),
            getProducts(),
            getOrders(),
          ]);
          setStats({
            users: Array.isArray(usersResponse?.data) ? usersResponse.data.length : 0,
            products: Array.isArray(productsResponse?.data) ? productsResponse.data.length : 0,
            orders: Array.isArray(ordersResponse?.data) ? ordersResponse.data.length : 0,
          });
        } catch (fallbackErr) {
          setError(err.message || 'Could not load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-400">Overview</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Manage users, products, and orders from one place.</h2>
        <p className="mt-4 max-w-2xl text-sm text-slate-300">
          This dashboard connects to your existing Express and MongoDB backend so you can create each resource with the same schema rules the server expects.
        </p>
      </div>

      {error ? <AlertMessage type="error" title="Connection issue" message={error} /> : null}

      {loading ? (
        <LoadingSpinner label="Loading dashboard summary..." />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Users', value: stats.users, action: () => onNavigate('users') },
            { label: 'Products', value: stats.products, action: () => onNavigate('products') },
            { label: 'Orders', value: stats.orders, action: () => onNavigate('orders') },
          ].map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={card.action}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left transition hover:-translate-y-1 hover:border-sky-500/50"
            >
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-4 text-4xl font-semibold text-white">{card.value}</p>
              <p className="mt-3 text-sm text-slate-400">Open {card.label.toLowerCase()} form</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
