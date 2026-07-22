import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, ApiError } from './api/client';
import { AddProvidersModal } from './components/AddProvidersModal';
import { StatementModal } from './components/StatementModal';
import { StatusBadge } from './components/StatusBadge';
import type { Account, AccountsSnapshot, StatementStatus } from './types';
import { eyebrow, heading, iconButton, primaryButton, secondaryButton } from './ui';

type Filter = 'ALL' | 'ATTENTION' | StatementStatus;

const filters: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'All accounts' },
  { value: 'ATTENTION', label: 'Needs attention' },
  { value: 'MISSING', label: 'Missing' },
  { value: 'OUTDATED', label: 'Outdated' },
  { value: 'UPLOADED', label: 'Current' }
];

export function App() {
  const [snapshot, setSnapshot] = useState<AccountsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [pendingId, setPendingId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setSnapshot(await api.accounts());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load your accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visibleAccounts = useMemo(() => snapshot?.accounts.filter(account => {
    if (filter === 'ALL') return true;
    if (filter === 'ATTENTION') return account.status !== 'UPLOADED';
    return account.status === filter;
  }) ?? [], [filter, snapshot]);

  const refreshAfterChange = async (message: string) => {
    setAdding(false);
    setEditing(null);
    setNotice(message);
    setError('');
    await load();
  };

  const remove = async (account: Account) => {
    if (account.statement && !window.confirm(`Remove ${account.provider.name} and its statement?`)) return;
    setPendingId(account.id);
    setError('');
    try {
      setSnapshot(await api.removeAccount(account.id));
      setNotice(`${account.provider.name} was removed.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not remove the provider.');
    } finally {
      setPendingId('');
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.submit();
      setSubmitted(true);
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : null;
      setError([apiError?.message ?? 'Could not submit your statements.', ...(apiError?.details ?? [])].join(' '));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <main className="grid min-h-screen min-w-80 place-items-center bg-[radial-gradient(circle_at_85%_10%,#e5eee7_0,transparent_28rem)] bg-[#f4f6f2] p-[25px] font-sans text-[#18221f]">
      <section className="max-w-[560px] rounded-[20px] border border-[#dfe5df] bg-white p-[50px] text-center shadow-[0_18px_50px_rgba(31,57,47,.11)] max-[480px]:px-[23px] max-[480px]:py-9">
        <div className="mx-auto mb-[19px] grid size-[54px] place-items-center rounded-full bg-[#e4f1e8] text-[25px] text-[#2f7452]" aria-hidden="true">✓</div>
        <p className={eyebrow}>All done</p>
        <h1 className={`${heading} text-[40px]`}>Your statements are on their way</h1>
        <p className="my-4 leading-[1.65] text-[#65716b]">Thank you. Your adviser now has the documents they need to prepare for your first conversation.</p>
        <button className={`${secondaryButton} mt-2.5`} onClick={() => setSubmitted(false)}>Back to accounts</button>
      </section>
    </main>;
  }

  return <main className="min-h-screen min-w-80 bg-[radial-gradient(circle_at_85%_10%,#e5eee7_0,transparent_28rem)] bg-[#f4f6f2] font-sans text-[#18221f]">
    <header className="flex h-[76px] items-center justify-between border-b border-[#18221f14] bg-[#fafbf9d1] px-[max(28px,calc((100vw-1120px)/2))] backdrop-blur-xl max-[700px]:px-[18px]">
      <a className="flex items-center gap-[9px] text-[13px] font-bold tracking-[.15em] text-[#153e34] no-underline" href="#" aria-label="Y Tree home"><span className="grid size-[31px] place-items-center rounded-full bg-[#194f40] font-serif text-xl tracking-normal text-white">Y</span> TREE</a>
      <span className="flex items-center gap-2 text-[13px] text-[#65716b] max-[480px]:hidden"><span className="text-[9px] text-[#56a07b]" aria-hidden="true">●</span> Secure onboarding</span>
    </header>

    <div className="mx-auto max-w-[1080px] px-7 pt-[68px] pb-14 max-[700px]:px-[18px] max-[700px]:py-[45px]">
      <div className="mb-[38px] max-w-[680px]">
        <p className={eyebrow}>Your financial picture</p>
        <h1 className={`${heading} text-[clamp(42px,6vw,62px)] leading-none tracking-[-.025em]`}>Connect your accounts</h1>
        <p className="mt-[17px] text-lg leading-[1.65] text-[#65716b]">Add every provider you hold money with and upload a recent statement for each one.</p>
      </div>

      {error && <div className="relative mb-[18px] flex items-baseline gap-[9px] rounded-[11px] border border-[#eccdc8] bg-[#f8e9e6] py-[13px] pr-[46px] pl-4 text-[13px] text-[#81352f]" role="alert"><strong>We couldn’t complete that action.</strong><span>{error}</span><button className="absolute top-[7px] right-2.5 cursor-pointer border-0 bg-transparent text-[19px]" aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
      {notice && <div className="relative mb-[18px] flex items-baseline gap-[9px] rounded-[11px] border border-[#cce1d2] bg-[#e7f1ea] py-[13px] pr-[46px] pl-4 text-[13px] text-[#285d46]" role="status"><strong>Saved</strong><span>{notice}</span><button className="absolute top-[7px] right-2.5 cursor-pointer border-0 bg-transparent text-[19px]" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}

      {loading ? <LoadingCard /> : !snapshot ? <section className="rounded-[18px] border border-[#dfe5df] bg-white p-8"><h2 className={`${heading} text-2xl`}>We couldn’t load your accounts</h2><p className="my-4 text-[#65716b]">Check the service is running, then try again.</p><button className={primaryButton} onClick={() => { setLoading(true); void load(); }}>Try again</button></section> : <>
        <ProgressCard snapshot={snapshot} />

        <section className="overflow-hidden rounded-[18px] border border-[#dfe5df] bg-[#fffffff0] shadow-[0_8px_28px_rgba(33,52,44,.06)]">
          <div className="flex items-center justify-between gap-6 px-[30px] pt-7 pb-[23px] max-[700px]:items-start max-[700px]:px-5 max-[700px]:pt-[23px] max-[480px]:flex-col">
            <div><p className={eyebrow}>Your providers</p><h2 className={`${heading} text-[28px]`}>Accounts and statements</h2></div>
            <button className={`${secondaryButton} max-[480px]:w-full`} onClick={() => setAdding(true)}><span className="mr-1 text-base" aria-hidden="true">＋</span> Add providers</button>
          </div>

          <div className="flex min-h-[53px] items-center gap-[9px] border-y border-[#e6eae6] bg-[#fafbf9] px-[30px] py-[9px] text-xs text-[#65716b] max-[700px]:px-5">
            <label htmlFor="status-filter">Show</label>
            <select className="rounded-[7px] border border-[#d9dfda] bg-white py-1.5 pr-7 pl-[9px] text-[#34453f] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#377e6340]" id="status-filter" value={filter} onChange={event => setFilter(event.target.value as Filter)}>{filters.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
            <span className="ml-auto max-[480px]:hidden">{visibleAccounts.length} {visibleAccounts.length === 1 ? 'account' : 'accounts'}</span>
          </div>

          <AnimatedAccountList dependency={`${filter}:${visibleAccounts.map(account => account.id).join(',')}`}>
            {visibleAccounts.length ? <div className="px-[30px] max-[700px]:px-5">{visibleAccounts.map(account => <AccountRow account={account} pending={pendingId === account.id} onEdit={() => setEditing(account)} onRemove={() => void remove(account)} key={account.id} />)}</div> : <div className="px-5 py-12 text-center text-[#65716b]"><div className="text-[28px]" aria-hidden="true">⌕</div><h3 className="mt-2 mb-1 text-[#32433d]">No accounts here</h3><p className="m-0 text-[13px]">{snapshot.accounts.length ? 'Try a different status filter.' : 'Add your first provider to get started.'}</p></div>}
          </AnimatedAccountList>
        </section>

        <section className="mt-6 flex items-center justify-between gap-6 rounded-2xl border border-[#dfe5df] bg-[#ffffffa8] px-7 py-[23px] max-[700px]:flex-col max-[700px]:items-stretch">
          <div><h2 className="text-[15px] font-semibold text-[#17231f]">{snapshot.canSubmit ? 'Ready to submit?' : 'Complete every statement to submit'}</h2><p className="mt-[5px] text-xs text-[#65716b]">{snapshot.canSubmit ? 'We’ll send these statements securely to your adviser.' : `${snapshot.readyCount} of ${snapshot.totalCount} providers have a current statement.`}</p></div>
          <button className={`${primaryButton} min-w-[168px] justify-between gap-3.5 px-4 py-3 max-[700px]:justify-center`} disabled={!snapshot.canSubmit || submitting} onClick={() => void submit()}>{submitting ? 'Submitting…' : 'Submit statements'}<span className="max-[700px]:ml-2.5" aria-hidden="true">→</span></button>
        </section>
      </>}
    </div>

    <footer className="mx-auto flex max-w-[1080px] justify-between px-7 pb-[35px] text-[11px] text-[#7d8882] max-[700px]:flex-col max-[700px]:gap-2 max-[700px]:px-[18px]"><span>Your data is encrypted and handled securely.</span><span>Need help? <a className="text-[#194f40]" href="mailto:support@ytree.com">Contact support</a></span></footer>

    {adding && <AddProvidersModal onClose={() => setAdding(false)} onAdded={() => void refreshAfterChange('Providers added. Upload a statement for each new account.')} onError={setError} />}
    {editing && <StatementModal account={editing} onClose={() => setEditing(null)} onSaved={() => void refreshAfterChange(`${editing.provider.name} statement saved.`)} onError={setError} />}
  </main>;
}

function ProgressCard({ snapshot }: { snapshot: AccountsSnapshot }) {
  const remaining = snapshot.totalCount - snapshot.readyCount;
  const progress = snapshot.totalCount ? snapshot.readyCount / snapshot.totalCount * 360 : 0;

  return <section className="relative mb-6 flex items-center justify-between gap-7 overflow-hidden rounded-[18px] bg-[#194f40] px-[34px] py-[30px] text-white shadow-[0_16px_36px_rgba(20,62,51,.16)] max-[700px]:p-[25px]" aria-label="Statement progress">
    <div className="pointer-events-none absolute -top-[120px] -right-[115px] size-[280px] rounded-full border border-[#ffffff14]" />
    <div><p className={`${eyebrow} text-[#b9d2c7]`}>Your progress</p><h2 className="font-serif text-[30px] font-semibold text-white max-[480px]:text-[25px]">{snapshot.canSubmit ? 'Everything is ready' : `${remaining} ${remaining === 1 ? 'statement needs' : 'statements need'} attention`}</h2><p className="mt-[7px] text-sm text-[#ccdad4]">{snapshot.canSubmit ? 'Every provider has a current statement. You can submit when ready.' : 'Upload or replace the statements highlighted below.'}</p></div>
    <div className="relative z-[1] grid size-24 shrink-0 place-items-center rounded-full max-[480px]:size-[82px]" style={{ background: `conic-gradient(#8dc9ab ${progress}deg, rgba(255,255,255,.14) 0)` }}>
      <div className="absolute inset-2 rounded-full bg-[#194f40]" />
      <span className="relative flex flex-col items-center leading-none"><strong className="font-serif text-[27px]">{snapshot.readyCount}</strong><small className="mt-[5px] text-[10px] text-[#c5d7cf]">of {snapshot.totalCount} ready</small></span>
    </div>
  </section>;
}

function AccountRow({ account, pending, onEdit, onRemove }: { account: Account; pending: boolean; onEdit: () => void; onRemove: () => void }) {
  return <article className="grid grid-cols-[38px_1fr] items-center gap-[11px] border-b border-[#e9ede9] py-5 last:border-b-0 min-[481px]:grid-cols-[42px_1fr_auto] min-[481px]:gap-4 min-[701px]:grid-cols-[43px_minmax(180px,1fr)_auto_auto]">
    <div className="grid size-[38px] place-items-center rounded-[11px] bg-[#edf2ee] font-serif text-xl text-[#416259] min-[481px]:size-[42px]" aria-hidden="true">{account.provider.name[0]}</div>
    <div><h3 className="mb-1 text-sm font-semibold">{account.provider.name}</h3>{account.statement ? <p className="[overflow-wrap:anywhere] text-xs text-[#7a847f]">{account.statement.fileName} · {formatDate(account.statement.date)}</p> : <p className="text-xs text-[#7a847f]">No statement uploaded</p>}</div>
    <StatusBadge status={account.status} />
    <div className="col-span-full flex items-center justify-end gap-1.5 min-[481px]:col-start-3 min-[481px]:row-span-2 min-[481px]:row-start-1 min-[701px]:col-auto min-[701px]:row-auto">
      <button className={`${secondaryButton} flex-1 px-3 py-[7px] text-xs min-[481px]:flex-none`} onClick={onEdit}>{account.statement ? 'Replace' : 'Upload'}</button>
      <button className={`${iconButton} hover:bg-[#f9e9e7] hover:text-[#a23b34]`} disabled={pending} onClick={onRemove} aria-label={`Remove ${account.provider.name}`}>{pending ? '…' : '×'}</button>
    </div>
  </article>;
}

function AnimatedAccountList({ dependency, children }: { dependency: string; children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    setHeight(content.getBoundingClientRect().height);
  }, [dependency]);

  return <div
    className="overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
    style={{ height: height === undefined ? 'auto' : `${height}px` }}
  >
    <div ref={contentRef}>{children}</div>
  </div>;
}

function LoadingCard() {
  return <section className="rounded-[18px] border border-[#dfe5df] bg-white p-8" aria-label="Loading accounts"><div className="h-8 w-2/5 animate-pulse rounded-[10px] bg-[#edf0ed] motion-reduce:animate-none" />{[1, 2, 3].map(row => <div className="my-3 h-[66px] animate-pulse rounded-[10px] bg-[#edf0ed] motion-reduce:animate-none" key={row} />)}</section>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
