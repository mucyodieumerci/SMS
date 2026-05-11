import { useState, useEffect } from 'react';
import API from '../api/axios';

const today = () => new Date().toISOString().split('T')[0];
const fmt   = n => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n);
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

export default function Reports() {
  const [tab,        setTab]        = useState('status');   // 'status' | 'stockout'
  const [date,       setDate]       = useState(today());
  const [statusData, setStatusData] = useState([]);
  const [soData,     setSoData]     = useState([]);
  const [soSummary,  setSoSummary]  = useState(null);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => { fetchReport(); }, [tab, date]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (tab === 'status') {
        const res = await API.get(`/api/reports/daily-stock-status?date=${date}`);
        setStatusData(res.data.data || []);
      } else {
        const res = await API.get(`/api/reports/daily-stock-out?date=${date}`);
        setSoData(res.data.data       || []);
        setSoSummary(res.data.summary || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5">
      {/* Page header (hidden on print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate daily stock reports for SmartPark</p>
        </div>
        <button onClick={handlePrint} className="btn-primary no-print">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>

      {/* Controls (hidden on print) */}
      <div className="no-print flex flex-wrap gap-3">
        {/* Tabs */}
        <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
          {[
            { key: 'status',   label: 'Daily Stock Status' },
            { key: 'stockout', label: 'Daily Stock Out'    },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Date picker */}
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="input-field w-auto" />
      </div>

      {/* ── PRINT HEADER (visible only when printing) ────────── */}
      <div className="print-only hidden">
        <div className="text-center pb-4 border-b-2 border-gray-800 mb-4">
          <h1 className="text-2xl font-bold">SMARTPARK</h1>
          <p className="text-sm">Rubavu District, Rwanda</p>
          <h2 className="text-lg font-semibold mt-2">
            {tab === 'status' ? 'Daily Stock Status Report' : 'Daily Stock-Out Report'}
          </h2>
          <p className="text-sm">Date: {fmtDate(date)}</p>
          <p className="text-xs text-gray-500">Generated: {new Date().toLocaleString('en-GB')}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'status' ? (
        /* ── Daily Stock Status ─────────────────────────────── */
        <div className="card overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 no-print flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Daily Stock Status Report</h2>
              <p className="text-sm text-gray-500 mt-0.5">{fmtDate(date)}</p>
            </div>
            <span className="badge bg-blue-100 text-blue-700">{statusData.length} parts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Spare Part</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-right">Stored Qty</th>
                  <th className="px-6 py-3 text-right">Stock Out (Day)</th>
                  <th className="px-6 py-3 text-right">Remaining Qty</th>
                  <th className="px-6 py-3 text-right">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {statusData.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">No data for selected date.</td></tr>
                ) : statusData.map((r, i) => (
                  <tr key={r.SparePartID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{r.SparePartName}</td>
                    <td className="px-6 py-4">
                      <span className="badge bg-gray-100 text-gray-700">{r.Category}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{r.StoredQuantity}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${r.DailyStockOutQty > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                        {r.DailyStockOutQty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${r.RemainingQuantity < 10 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {r.RemainingQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{fmt(r.TotalStockValue)}</td>
                  </tr>
                ))}
              </tbody>
              {statusData.length > 0 && (
                <tfoot className="border-t-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right">Totals:</td>
                    <td className="px-6 py-3 text-right">{statusData.reduce((s, r) => s + parseInt(r.StoredQuantity), 0)}</td>
                    <td className="px-6 py-3 text-right text-orange-600">{statusData.reduce((s, r) => s + parseInt(r.DailyStockOutQty), 0)}</td>
                    <td className="px-6 py-3 text-right text-emerald-700">{statusData.reduce((s, r) => s + parseInt(r.RemainingQuantity), 0)}</td>
                    <td className="px-6 py-3 text-right font-bold text-gray-900">
                      {fmt(statusData.reduce((s, r) => s + parseFloat(r.TotalStockValue || 0), 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      ) : (
        /* ── Daily Stock Out ────────────────────────────────── */
        <div className="space-y-4">
          {soSummary && (
            <div className="grid grid-cols-3 gap-4 no-print">
              {[
                { label: 'Transactions', value: soSummary.totalTransactions, color: 'text-blue-700',   bg: 'bg-blue-50'   },
                { label: 'Total Qty Out', value: soSummary.totalQuantity,    color: 'text-orange-700', bg: 'bg-orange-50' },
                { label: 'Total Revenue', value: fmt(soSummary.totalAmount), color: 'text-emerald-700',bg: 'bg-emerald-50'},
              ].map(s => (
                <div key={s.label} className={`card p-4 ${s.bg}`}>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          <div className="card overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 no-print">
              <h2 className="text-base font-semibold text-gray-900">Daily Stock-Out Report</h2>
              <p className="text-sm text-gray-500 mt-0.5">{fmtDate(date)}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-6 py-3 text-left">Spare Part</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-right">Qty Out</th>
                    <th className="px-6 py-3 text-right">Unit Price</th>
                    <th className="px-6 py-3 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {soData.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No stock-out transactions for {fmtDate(date)}.</td></tr>
                  ) : soData.map((r, i) => (
                    <tr key={r.StockOutID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{r.SparePartName}</td>
                      <td className="px-6 py-4"><span className="badge bg-gray-100 text-gray-700">{r.Category}</span></td>
                      <td className="px-6 py-4 text-right font-semibold text-orange-600">{r.StockOutQuantity}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{fmt(r.StockOutUnitPrice)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">{fmt(r.StockOutTotalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                {soData.length > 0 && soSummary && (
                  <tfoot className="border-t-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right">Daily Total:</td>
                      <td className="px-6 py-3 text-right text-orange-600">{soSummary.totalQuantity}</td>
                      <td />
                      <td className="px-6 py-3 text-right font-bold text-gray-900">{fmt(soSummary.totalAmount)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
