import { useState, useEffect } from 'react';
import API from '../api/axios';

const today = () => new Date().toISOString().split('T')[0];
const EMPTY = { sparePartId: '', stockInQuantity: '', stockInDate: today() };

export default function StockIn() {
  const [records,    setRecords]    = useState([]);
  const [parts,      setParts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [msg,        setMsg]        = useState({ type: '', text: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [siRes, pRes] = await Promise.all([
        API.get('/api/stock-in'),
        API.get('/api/spare-parts'),
      ]);
      setRecords(siRes.data.data || []);
      setParts(pRes.data.data   || []);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });
    try {
      await API.post('/api/stock-in', {
        sparePartId    : parseInt(form.sparePartId),
        stockInQuantity: parseInt(form.stockInQuantity),
        stockInDate    : form.stockInDate,
      });
      setMsg({ type: 'success', text: 'Stock-in recorded successfully!' });
      setForm(EMPTY);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to record stock-in.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Stock In</h1>
          <p className="page-subtitle">Record incoming spare part deliveries</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setMsg({ type: '', text: '' }); }} className="btn-primary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showForm ? 'Cancel' : 'Record Stock In'}
        </button>
      </div>

      {/* Alert */}
      {msg.text && (
        <div className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
          msg.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                 : 'border-red-200 bg-red-50 text-red-800'}`}>
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {msg.type === 'success'
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          </svg>
          {msg.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Record New Stock In</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Spare Part *</label>
              <select className="input-field" value={form.sparePartId}
                onChange={e => setForm({ ...form, sparePartId: e.target.value })} required>
                <option value="">Select a spare part…</option>
                {parts.map(p => (
                  <option key={p.SparePartID} value={p.SparePartID}>
                    {p.Name} (Stock: {p.Quantity})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quantity Received *</label>
              <input className="input-field" type="number" min="1" placeholder="0"
                value={form.stockInQuantity} onChange={e => setForm({ ...form, stockInQuantity: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Delivery Date *</label>
              <input className="input-field" type="date" value={form.stockInDate}
                onChange={e => setForm({ ...form, stockInDate: e.target.value })} required />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-3 pt-1">
              <button type="button" className="btn-secondary"
                onClick={() => { setShowForm(false); setForm(EMPTY); }}>Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting
                  ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                  : 'Save Stock In'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Stock-In Records</h2>
          <span className="badge bg-emerald-100 text-emerald-700">{records.length}</span>
        </div>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Spare Part</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-right">Qty Received</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No stock-in records yet.</td></tr>
                ) : records.map((r, i) => (
                  <tr key={r.StockInID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{r.SparePartName}</td>
                    <td className="px-6 py-4">
                      <span className="badge bg-gray-100 text-gray-700">{r.Category}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-emerald-600">+{r.StockInQuantity}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(r.StockInDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
