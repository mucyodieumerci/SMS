import { useState, useEffect } from 'react';
import API from '../api/axios';

const CATEGORIES = ['Engine','Brakes','Transmission','Suspension','Ignition','Cooling','Electrical','Body','Other'];
const fmt = n => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n);

const EMPTY = { name: '', category: '', quantity: '', unitPrice: '' };

export default function SparePart() {
  const [parts,      setParts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [msg,        setMsg]        = useState({ type: '', text: '' });
  const [search,     setSearch]     = useState('');

  useEffect(() => { fetchParts(); }, []);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/spare-parts');
      setParts(res.data.data || []);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load spare parts.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });
    try {
      await API.post('/api/spare-parts', {
        name     : form.name,
        category : form.category,
        quantity : parseInt(form.quantity),
        unitPrice: parseFloat(form.unitPrice),
      });
      setMsg({ type: 'success', text: 'Spare part added successfully!' });
      setForm(EMPTY);
      setShowForm(false);
      fetchParts();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add spare part.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = parts.filter(p =>
    p.Name.toLowerCase().includes(search.toLowerCase()) ||
    p.Category.toLowerCase().includes(search.toLowerCase())
  );

  const stockBadge = (qty) => {
    if (qty === 0)  return <span className="badge bg-red-100 text-red-800">Out of Stock</span>;
    if (qty < 10)   return <span className="badge bg-yellow-100 text-yellow-800">Low Stock</span>;
    return               <span className="badge bg-emerald-100 text-emerald-800">In Stock</span>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Spare Parts</h1>
          <p className="page-subtitle">Manage your spare parts catalogue</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setMsg({ type: '', text: '' }); }}
          className="btn-primary"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showForm ? 'Cancel' : 'Add Spare Part'}
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

      {/* Add form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Add New Spare Part</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Part Name *</label>
              <input className="input-field" type="text" placeholder="e.g. Brake Pad (Front)"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
              <select className="input-field" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Initial Quantity *</label>
              <input className="input-field" type="number" min="0" placeholder="0"
                value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Unit Price (RWF) *</label>
              <input className="input-field" type="number" min="1" step="0.01" placeholder="0.00"
                value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} required />
            </div>
            {form.quantity && form.unitPrice && (
              <div className="sm:col-span-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                <span className="font-medium">Total Value Preview: </span>
                {fmt(parseFloat(form.quantity || 0) * parseFloat(form.unitPrice || 0))}
              </div>
            )}
            <div className="sm:col-span-2 flex justify-end gap-3 pt-1">
              <button type="button" className="btn-secondary"
                onClick={() => { setShowForm(false); setForm(EMPTY); }}>Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting
                  ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                  : 'Save Spare Part'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table card */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">Parts List</h2>
            <span className="badge bg-blue-100 text-blue-700">{filtered.length}</span>
          </div>
          <input className="input-field w-48" type="text" placeholder="Search parts…"
            value={search} onChange={e => setSearch(e.target.value)} />
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
                  <th className="px-6 py-3 text-left">Part Name</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-right">Quantity</th>
                  <th className="px-6 py-3 text-right">Unit Price</th>
                  <th className="px-6 py-3 text-right">Total Value</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    {search ? 'No matching parts found.' : 'No spare parts yet. Add your first part.'}
                  </td></tr>
                ) : filtered.map((p, i) => (
                  <tr key={p.SparePartID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{p.Name}</td>
                    <td className="px-6 py-4">
                      <span className="badge bg-gray-100 text-gray-700">{p.Category}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${p.Quantity < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {p.Quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">{fmt(p.UnitPrice)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{fmt(p.TotalPrice)}</td>
                    <td className="px-6 py-4">{stockBadge(p.Quantity)}</td>
                  </tr>
                ))}
              </tbody>
              {filtered.length > 0 && (
                <tfoot className="border-t border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
                  <tr>
                    <td colSpan={5} className="px-6 py-3 text-right">Grand Total Stock Value:</td>
                    <td className="px-6 py-3 text-right font-bold text-gray-900">
                      {fmt(filtered.reduce((s, p) => s + parseFloat(p.TotalPrice || 0), 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
