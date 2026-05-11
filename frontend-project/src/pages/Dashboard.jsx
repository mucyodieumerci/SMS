import { useState, useEffect } from 'react';
import { Link }                from 'react-router-dom';
import API                     from '../api/axios';

const fmt = (n) =>
  new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n);

function StatCard({ label, value, sub, Icon, bg, to }) {
  return (
    <Link to={to} className="card p-6 hover:shadow-md transition-shadow block">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
        <Icon />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-600">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </Link>
  );
}

export default function Dashboard() {
  const [stats,  setStats]  = useState({ total: 0, value: 0, lowStock: 0, todaySO: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [pRes, siRes, soRes] = await Promise.all([
        API.get('/api/spare-parts'),
        API.get('/api/stock-in'),
        API.get('/api/stock-out'),
      ]);
      const parts   = pRes.data.data  || [];
      const stockIn = siRes.data.data || [];
      const stockOut= soRes.data.data || [];

      const today = new Date().toISOString().split('T')[0];
      const todaySO = stockOut
        .filter(r => (r.StockOutDate || '').slice(0, 10) === today)
        .reduce((s, r) => s + parseFloat(r.StockOutTotalPrice || 0), 0);

      setStats({
        total   : parts.length,
        value   : parts.reduce((s, p) => s + parseFloat(p.TotalPrice || 0), 0),
        lowStock: parts.filter(p => p.Quantity < 10).length,
        todaySO,
      });

      const combined = [
        ...stockIn.slice(0, 6).map(r => ({ type: 'in',  name: r.SparePartName, qty: r.StockInQuantity,  date: r.StockInDate,  amount: null })),
        ...stockOut.slice(0, 6).map(r => ({ type: 'out', name: r.SparePartName, qty: r.StockOutQuantity, date: r.StockOutDate, amount: r.StockOutTotalPrice })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
      setRecent(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to SmartPark Stock Inventory Management System</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Spare Parts" value={stats.total} sub="Active parts in catalogue"
          bg="bg-blue-50" to="/spare-parts"
          Icon={() => (
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          )}
        />
        <StatCard label="Total Stock Value" value={fmt(stats.value)} sub="Current inventory worth"
          bg="bg-emerald-50" to="/reports"
          Icon={() => (
            <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        />
        <StatCard label="Today's Stock Out" value={fmt(stats.todaySO)} sub="Revenue issued today"
          bg="bg-orange-50" to="/stock-out"
          Icon={() => (
            <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          )}
        />
        <StatCard label="Low Stock Alerts" value={stats.lowStock} sub="Parts with qty < 10"
          bg="bg-red-50" to="/spare-parts"
          Icon={() => (
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        />
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Add Spare Part',    to: '/spare-parts', color: 'bg-blue-600   hover:bg-blue-700'   },
            { label: 'Record Stock In',   to: '/stock-in',    color: 'bg-emerald-600 hover:bg-emerald-700' },
            { label: 'Record Stock Out',  to: '/stock-out',   color: 'bg-orange-600 hover:bg-orange-700'  },
            { label: 'View Reports',      to: '/reports',     color: 'bg-purple-600 hover:bg-purple-700'  },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className={`${a.color} rounded-lg px-4 py-3 text-center text-sm font-medium text-white transition-colors`}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recent.map((a, i) => (
              <li key={i} className="flex items-center gap-4 px-6 py-3.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  a.type === 'in' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                  {a.type === 'in'
                    ? <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                    : <svg className="h-4 w-4 text-orange-600"  fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{a.name}</p>
                  <p className="text-xs text-gray-400">
                    {a.type === 'in'
                      ? <span className="text-emerald-600">+{a.qty} units stocked in</span>
                      : <span className="text-orange-600">{a.qty} units issued out</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {a.amount && <p className="text-sm font-semibold text-gray-800">{fmt(a.amount)}</p>}
                  <p className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('en-GB')}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
