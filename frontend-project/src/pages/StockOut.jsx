import { useState, useEffect } from 'react';
import API from '../api/axios';

const today = () => new Date().toISOString().split('T')[0];
const EMPTY = { sparePartId: '', stockOutQuantity: '', stockOutUnitPrice: '', stockOutDate: today() };
const fmt   = n => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n);

export default function StockOut() {
  const [records,    setRecords]    = useState([]);
  const [parts,      setParts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [msg,        setMsg]        = useState({ type: '', text: '' });

  // Edit modal
  const [editId,     setEditId]     = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [soRes, pRes] = await Promise.all([API.get('/api/stock-out'), API.get('/api/spare-parts')]);
      setRecords(soRes.data.data || []);
      setParts(pRes.data.data   || []);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  /* ── Create ─────────────────────────────────────────────── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });
    try {
      await API.post('/api/stock-out', {
        sparePartId      : parseInt(form.sparePartId),
        stockOutQuantity : parseInt(form.stockOutQuantity),
        stockOutUnitPrice: parseFloat(form.stockOutUnitPrice),
        stockOutDate     : form.stockOutDate,
      });
      setMsg({ type: 'success', text: 'Stock-out recorded successfully!' });
      setForm(EMPTY);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to record stock-out.' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Edit ───────────────────────────────────────────────── */
  const openEdit = (r) => {
    setEditId(r.StockOutID);
    setEditForm({
      stockOutQuantity : r.StockOutQuantity,
      stockOutUnitPrice: r.StockOutUnitPrice,
      stockOutDate     : (r.StockOutDate || '').slice(0, 10),
    });
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await API.put(`/api/stock-out/${editId}`, {
        stockOutQuantity : parseInt(editForm.stockOutQuantity),
        stockOutUnitPrice: parseFloat(editForm.stockOutUnitPrice),
        stockOutDate     : editForm.stockOutDate,
      });
      setMsg({ type: 'success', text: 'Stock-out record updated.' });
      setEditId(null);
      fetchAll();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update.' });
    } finally {
      setEditSaving(false);
    }
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/api/stock-out/${deleteId}`);
      setMsg({ type: 'success', text: 'Stock-out record deleted and inventory restored.' });
      setDeleteId(null);
      fetchAll();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete.' });
    } finally {
      setDeleting(false);
    }
  };

  const totalRevenue = records.reduce((s, r) => s + parseFloat(r.StockOutTotalPrice || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Stock Out</h1>
          <p className="page-subtitle">Issue spare parts and manage outgoing stock</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setMsg({ type: '', text: '' }); }} className="btn-primary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showForm ? 'Cancel' : 'Record Stock Out'}
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

      {/* Create form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Record New Stock Out</h2>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Spare Part *</label>
              <select className="input-field" value={form.sparePartId}
                onChange={e => setForm({ ...form, sparePartId: e.target.value })} required>
                <option value="">Select a spare part…</option>
                {parts.map(p => (
                  <option key={p.SparePartID} value={p.SparePartID} disabled={p.Quantity === 0}>
                    {p.Name} — Available: {p.Quantity} {p.Quantity === 0 ? '(Out of Stock)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quantity to Issue *</label>
              <input className="input-field" type="number" min="1" placeholder="0"
                value={form.stockOutQuantity} onChange={e => setForm({ ...form, stockOutQuantity: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Selling Unit Price (RWF) *</label>
              <input className="input-field" type="number" min="1" step="0.01" placeholder="0.00"
                value={form.stockOutUnitPrice} onChange={e => setForm({ ...form, stockOutUnitPrice: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date *</label>
              <input className="input-field" type="date" value={form.stockOutDate}
                onChange={e => setForm({ ...form, stockOutDate: e.target.value })} required />
            </div>
            {form.stockOutQuantity && form.stockOutUnitPrice && (
              <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-700">
                <span className="font-medium">Revenue Preview: </span>
                {fmt(parseFloat(form.stockOutQuantity || 0) * parseFloat(form.stockOutUnitPrice || 0))}
              </div>
            )}
            <div className="sm:col-span-2 flex justify-end gap-3 pt-1">
              <button type="button" className="btn-secondary"
                onClick={() => { setShowForm(false); setForm(EMPTY); }}>Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting
                  ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                  : 'Save Stock Out'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">Stock-Out Records</h2>
            <span className="badge bg-orange-100 text-orange-700">{records.length}</span>
          </div>
          {records.length > 0 && (
            <p className="text-sm text-gray-500">
              Total Revenue: <span className="font-semibold text-gray-800">{fmt(totalRevenue)}</span>
            </p>
          )}
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
                  <th className="px-6 py-3 text-right">Qty Out</th>
                  <th className="px-6 py-3 text-right">Unit Price</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-400">No stock-out records yet.</td></tr>
                ) : records.map((r, i) => (
                  <tr key={r.StockOutID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{r.SparePartName}</td>
                    <td className="px-6 py-4"><span className="badge bg-gray-100 text-gray-700">{r.Category}</span></td>
                    <td className="px-6 py-4 text-right font-semibold text-orange-600">{r.StockOutQuantity}</td>
                    <td className="px-6 py-4 text-right text-gray-700">{fmt(r.StockOutUnitPrice)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{fmt(r.StockOutTotalPrice)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(r.StockOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(r)}
                          className="rounded px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(r.StockOutID)}
                          className="rounded px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Modal ──────────────────────────────────────── */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">Edit Stock-Out Record</h3>
              <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Quantity Issued *</label>
                <input className="input-field" type="number" min="1"
                  value={editForm.stockOutQuantity}
                  onChange={e => setEditForm({ ...editForm, stockOutQuantity: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Unit Price (RWF) *</label>
                <input className="input-field" type="number" min="1" step="0.01"
                  value={editForm.stockOutUnitPrice}
                  onChange={e => setEditForm({ ...editForm, stockOutUnitPrice: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Date *</label>
                <input className="input-field" type="date" value={editForm.stockOutDate}
                  onChange={e => setEditForm({ ...editForm, stockOutDate: e.target.value })} required />
              </div>
              {editForm.stockOutQuantity && editForm.stockOutUnitPrice && (
                <p className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
                  New Total: <strong>{fmt(parseFloat(editForm.stockOutQuantity) * parseFloat(editForm.stockOutUnitPrice))}</strong>
                </p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                <button type="submit" disabled={editSaving} className="btn-primary">
                  {editSaving ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Delete Stock-Out Record?</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              This record will be permanently deleted and the spare part quantity will be restored to inventory.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-danger" disabled={deleting} onClick={handleDelete}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
