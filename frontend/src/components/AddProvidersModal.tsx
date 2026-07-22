import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { Provider } from '../types';
import { field, fieldInput, primaryButton, secondaryButton } from '../ui';
import { Modal } from './Modal';

interface Props { onClose: () => void; onAdded: () => void; onError: (message: string) => void }

export function AddProvidersModal({ onClose, onAdded, onError }: Props) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.availableProviders().then(setProviders).catch(error => onError(error.message)).finally(() => setLoading(false)); }, [onError]);
  const visible = useMemo(() => providers.filter(provider => provider.name.toLowerCase().includes(query.toLowerCase())), [providers, query]);
  const toggle = (id: string) => setSelected(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  const save = async () => {
    setSaving(true);
    try { await api.addProviders(selected); onAdded(); } catch (error) { onError(error instanceof Error ? error.message : 'Could not add providers.'); setSaving(false); }
  };

  return <Modal title="Add providers" description="Choose every other place where you hold money." onClose={onClose} footer={<>
    <button className={secondaryButton} onClick={onClose}>Cancel</button>
    <button className={primaryButton} disabled={!selected.length || saving} onClick={save}>{saving ? 'Adding…' : `Add ${selected.length || ''} provider${selected.length === 1 ? '' : 's'}`}</button>
  </>}>
    <label className={field}><span>Search providers</span><input className={fieldInput} autoFocus type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name" /></label>
    {loading ? <div className="p-[25px] text-center text-[13px] text-[#65716b]">Loading providers…</div> : visible.length ? <div className="mt-3.5 overflow-hidden rounded-[10px] border border-[#dfe5df]">
      {visible.map(provider => <label className="flex min-h-[53px] cursor-pointer items-center gap-[11px] border-b border-[#e8ece8] px-[13px] py-2 text-[13px] font-semibold last:border-b-0 hover:bg-[#f7f9f7]" key={provider.id}>
        <input type="checkbox" checked={selected.includes(provider.id)} onChange={() => toggle(provider.id)} />
        <span className="grid size-[29px] place-items-center rounded-lg bg-[#edf2ee] font-serif text-[#47685e]" aria-hidden="true">{provider.name[0]}</span><span>{provider.name}</span>
      </label>)}
    </div> : <p className="p-[25px] text-center text-[13px] text-[#65716b]">{providers.length ? 'No providers match your search.' : 'All known providers have already been added.'}</p>}
  </Modal>;
}
