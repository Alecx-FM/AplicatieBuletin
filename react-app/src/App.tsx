import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

type Person = {
  id: number;
  first_name: string;
  last_name: string;
  birth_date?: string;
  cin_series?: string;
  cin_number?: string;
  id_issue_date?: string;
  id_expiry_date?: string;
  address?: string;
  city?: string;
  county?: string;
  national_id?: string;
  email?: string;
  phone?: string;
  id_photo_path?: string;
  notes?: string;
};

type Page<T> = {
  data: T[];
};

const API = 'http://localhost:8000/api';

function App() {
  const [items, setItems] = useState<Person[]>([]);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'first_name' | 'last_name' | 'birth_date'>('last_name');
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Person | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Person>>({});
  const [deleting, setDeleting] = useState<Person | null>(null);
    const [issueDate, setIssueDate] = useState<string>('');
    const [expiryDate, setExpiryDate] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

    const expiryInfo = useMemo(() => {
      if (!expiryDate) return null;
      const today = new Date(); today.setHours(0,0,0,0);
      const exp = new Date(expiryDate); exp.setHours(0,0,0,0);
      const diff = Math.round((exp.getTime() - today.getTime()) / 86400000);
      if (diff < 0) return { text: `Atentie: CI expirata de ${Math.abs(diff)} zile`, cls: 'warning' };
      if (diff <= 30) return { text: `Expira in ${diff} zile`, cls: 'warning' };
      return { text: `Valida pana la ${expiryDate}`, cls: 'success' };
    }, [expiryDate]);

  const sentence = useMemo(() => {
    const p = selected;
    if (!p) return '';
    return `${p.first_name} ${p.last_name}, CNP ${p.national_id ?? '-'}, CI ${p.cin_series ?? ''} ${p.cin_number ?? ''}, ${p.city ?? ''} ${p.address ?? ''}`.trim();
  }, [selected]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/people?q=${encodeURIComponent(q)}&sort=${sort}&dir=${dir}`);
      const json: Page<Person> = await res.json();
      setItems(json.data ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, dir]);

  const openAdd = () => {
    setFormData({});
    setShowForm(true);
    setSelected(null);
    setIssueDate('');
    setExpiryDate('');
  };

  const openEdit = (p: Person) => {
    setFormData(p);
    setShowForm(true);
    setSelected(p);
    setIssueDate(p.id_issue_date || '');
    setExpiryDate(p.id_expiry_date || '');
  };

  const submitForm = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setError(null);
    const fd = new FormData(ev.currentTarget);

    // Client-side validation to mirror backend rules
    const requiredFields = [
      'last_name', 'first_name', 'birth_date', 'national_id', 'cin_series', 'cin_number', 'city', 'address', 'county'
    ];
    const get = (k: string) => String(fd.get(k) ?? '').trim();

    for (const f of requiredFields) {
      if (!get(f)) {
        setError('Completeaza toate campurile obligatorii.');
        return;
      }
    }
    const cnp = get('national_id');
    if (!/^[0-9]{13}$/.test(cnp)) {
      setError('CNP trebuie sa aiba exact 13 cifre.');
      return;
    }
    const serie = get('cin_series');
    if (!/^[A-Za-z]{1,2}$/.test(serie)) {
      setError('Seria CI trebuie sa aiba 1-2 litere.');
      return;
    }
    const numar = get('cin_number');
    if (!/^[0-9]{1,6}$/.test(numar)) {
      setError('Numarul CI trebuie sa aiba 1-6 cifre.');
      return;
    }
    // normalize series upper-case
    // Real-time/submit validation for expiration
    const today = new Date(); today.setHours(0,0,0,0);
    const exp = expiryDate ? new Date(expiryDate) : null;
    const iss = issueDate ? new Date(issueDate) : null;
    if (exp && exp < today) {
      setError('CI este expirata. Alegeti o data de expirare valida.');
      return;
    }
    if (exp && iss && exp < iss) {
      setError('Data de expirare trebuie sa fie dupa data de emitere.');
      return;
    }
    fd.set('cin_series', serie.toUpperCase());
    if (issueDate) fd.set('id_issue_date', issueDate);
    if (expiryDate) fd.set('id_expiry_date', expiryDate);
    const method = selected ? 'PUT' : 'POST';
    const url = selected ? `${API}/people/${selected.id}` : `${API}/people`;
    try {
      const res = await fetch(url, { method, body: fd });
      if (!res.ok) throw new Error('Save failed');
      setShowForm(false);
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error';
      setError(msg);
    }
  };

  const confirmDelete = (p: Person) => setDeleting(p);
  const doDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`${API}/people/${deleting.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDeleting(null);
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error';
      setError(msg);
    }
  };

  const copySentence = async () => {
    if (!sentence) return;
    await navigator.clipboard.writeText(sentence);
  };

  return (
    <div className="container">
      <h1>Aplicatie de gestiune persoane</h1>
      <div className="toolbar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cauta..." />
        <button onClick={load} disabled={loading}>Cauta</button>
        <button onClick={openAdd}>Adauga persoana</button>
        <label>
          Sortare:
          <select value={sort} onChange={(e) => setSort(e.target.value as 'first_name' | 'last_name' | 'birth_date')}>
            <option value="last_name">Nume</option>
            <option value="first_name">Prenume</option>
            <option value="birth_date">Data nasterii</option>
          </select>
        </label>
        <button onClick={() => setDir(dir === 'asc' ? 'desc' : 'asc')}>{dir === 'asc' ? '↑' : '↓'}</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="list">
        {loading ? (
          <div>Se incarca...</div>
        ) : (
          items.map((p) => (
            <div key={p.id} className={`item ${selected?.id === p.id ? 'selected' : ''}`} onClick={() => { setSelected(p); setShowDetails(true); }}>
              <div className="title">{p.last_name} {p.first_name}</div>
              <div className="subtitle">CNP: {p.national_id || '-'}</div>
              <div className="actions">
                <button onClick={(e) => { e.stopPropagation(); openEdit(p); }}>Editeaza</button>
                <button onClick={(e) => { e.stopPropagation(); confirmDelete(p); }}>Sterge</button>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && showDetails && (
        <div className="modal" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Detalii persoana</h2>
            <div className="grid">
              <div><strong>Nume:</strong> {selected?.last_name}</div>
              <div><strong>Prenume:</strong> {selected?.first_name}</div>
              <div><strong>Data nasterii:</strong> {selected?.birth_date || '-'}</div>
              <div><strong>CNP:</strong> {selected?.national_id || '-'}</div>
              <div><strong>CI:</strong> {selected?.cin_series || '-'} {selected?.cin_number || ''}</div>
              <div><strong>Judet:</strong> {selected?.county || '-'}</div>
              <div><strong>Emis la:</strong> {selected?.id_issue_date || '-'}</div>
              <div><strong>Expira la:</strong> {selected?.id_expiry_date || '-'}</div>
              <div style={{ gridColumn: 'span 3' }}><strong>Adresa:</strong> {selected?.city || ''} {selected?.address || ''}</div>
              <div><strong>Telefon:</strong> {selected?.phone || '-'}</div>
              <div><strong>Email:</strong> {selected?.email || '-'}</div>
              <div style={{ gridColumn: 'span 3' }}><strong>Note:</strong> {selected?.notes || '-'}</div>
              {selected?.id_photo_path && (
                <div style={{ gridColumn: 'span 3' }}>
                  <img style={{ maxWidth: '100%', borderRadius: 8 }} src={`http://localhost:8000/storage/${selected?.id_photo_path}`} alt="Poza act" />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={copySentence}>Copiaza date</button>
              <button onClick={() => setShowDetails(false)}>Inchide</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selected ? 'Editeaza persoana' : 'Adauga persoana'}</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={submitForm}>
              <div className="grid">
                <input name="last_name" defaultValue={formData.last_name || ''} placeholder="Nume" required />
                <input name="first_name" defaultValue={formData.first_name || ''} placeholder="Prenume" required />
                <input name="birth_date" defaultValue={formData.birth_date || ''} placeholder="Data nasterii" type="date" required />
                <input name="national_id" defaultValue={formData.national_id || ''} placeholder="CNP" inputMode="numeric" pattern="^[0-9]{13}$" maxLength={13} required />
                <input name="cin_series" defaultValue={formData.cin_series || ''} placeholder="Seria CI" pattern="^[A-Za-z]{1,2}$" maxLength={2} required />
                <input name="cin_number" defaultValue={formData.cin_number || ''} placeholder="Numar CI" inputMode="numeric" pattern="^[0-9]{1,6}$" maxLength={6} required />
                <input name="id_issue_date" value={issueDate} onChange={(e)=>setIssueDate(e.target.value)} placeholder="Data emitere CI" type="date" />
                <input name="id_expiry_date" value={expiryDate} onChange={(e)=>setExpiryDate(e.target.value)} placeholder="Data expirare CI" type="date" />
                                {expiryInfo && (
                                  <div className={expiryInfo.cls}>{expiryInfo.text}</div>
                                )}
                              <div className={(selected?.id_expiry_date && (new Date(selected.id_expiry_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0))) ? 'warning' : ''}>
                                <strong>Expira la:</strong> {selected?.id_expiry_date || '-'}{selected?.id_expiry_date && (new Date(selected.id_expiry_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)) ? ' (expirata)' : ''}
                              </div>
                <input name="city" defaultValue={formData.city || ''} placeholder="Oras" required />
                <input name="address" defaultValue={formData.address || ''} placeholder="Adresa" required />
                <input name="county" defaultValue={formData.county || ''} placeholder="Judet" required />
                <input name="email" defaultValue={formData.email || ''} placeholder="Email" type="email" />
                <input name="phone" defaultValue={formData.phone || ''} placeholder="Telefon" />
                <input name="notes" defaultValue={formData.notes || ''} placeholder="Note" />
                <input name="id_photo" type="file" accept="image/*" />
              </div>
              {(expiryDate && (new Date(expiryDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0))) && (
                <div className="warning">Atentie: CI este expirata.</div>
              )}
              <div className="modal-actions">
                <button type="submit">Salveaza</button>
                <button type="button" onClick={() => setShowForm(false)}>Inchide</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirmare stergere</h3>
            <p>Sigur vrei sa stergi {deleting.last_name} {deleting.first_name}?</p>
            <div className="modal-actions">
              <button onClick={doDelete}>Da, sterge</button>
              <button onClick={() => setDeleting(null)}>Nu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
 
