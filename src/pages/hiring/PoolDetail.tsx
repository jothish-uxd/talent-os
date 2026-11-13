import { useEffect, useId, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Select } from '@jothish-uxd/enterprise-library';
import Dialog from '../../components/content/Dialog';
import { usePageTitle } from '../../components/usePageTitle';
import { person, useMe } from '../../data/hiring/people';
import { usePools } from '../../data/hiring/pools';
import { OPEN_JOBS } from '../../data/hiring/talent';
import {
  STATUS_ORDER, funnel, hasMembers, inviteMembers, messageMembers, removeMembers, useMembers,
  type Member, type MemberStatus,
} from '../../data/hiring/poolMembers';

const BASE = '/hiring-system';
const day = (iso: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
const initials = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('');
const OPEN = new Set(OPEN_JOBS.map((j) => j.reqId));

type Filter = 'All' | MemberStatus;
type Action = { kind: 'message' | 'invite' | 'remove'; ids: string[] } | null;

/** One pool: how it's going, and everyone in it, with actions on several people at once. */
export default function PoolDetail() {
  const { poolId = '' } = useParams();
  const pool = usePools().find((p) => p.id === poolId);
  const members = useMembers(poolId);
  const h = usePageTitle(`${pool?.name ?? 'Pool'} · Talent · Internal ATS`);
  const [filter, setFilter] = useState<Filter>('All');
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<Action>(null);
  const [said, setSaid] = useState('');
  useEffect(() => { if (!said) return; const t = setTimeout(() => setSaid(''), 5000); return () => clearTimeout(t); }, [said]);

  if (!pool) return <Navigate to={`${BASE}/talent/pool`} replace />;
  if (!hasMembers(pool.id)) {
    return (
      <section className="tal-section">
        <BackLink />
        <h2 ref={h} tabIndex={-1} className="pd-title">{pool.name}</h2>
        <p className="tal-intro">The people in this pool aren’t in the prototype yet. Open <Link to={`${BASE}/talent/pool/POOL-118`}>Former Rebel Alliance pilots</Link> to see a pool’s details.</p>
      </section>
    );
  }

  const f = funnel(members);
  const count = (s: Filter) => (s === 'All' ? members.length : members.filter((m) => m.status === s).length);
  const query = q.trim().toLowerCase();
  const shown = members.filter((m) => (filter === 'All' || m.status === filter)
    && (!query || `${m.name} ${m.headline} ${m.location}`.toLowerCase().includes(query)));
  const shownPicked = shown.filter((m) => picked.has(m.id));
  const all = shown.length > 0 && shownPicked.length === shown.length;
  const some = shownPicked.length > 0 && !all;
  const toggle = (id: string, on: boolean) => setPicked((p) => { const n = new Set(p); if (on) n.add(id); else n.delete(id); return n; });
  const act = (kind: NonNullable<Action>['kind']) => (picked.size ? setAction({ kind, ids: [...picked] }) : setSaid('Select at least one person first.'));
  const done = (m: string) => { setAction(null); setPicked(new Set()); setSaid(m); };

  const stages = [
    { label: 'In pool', n: f.people, sub: '' },
    { label: 'Contacted', n: f.contacted, sub: `${pct(f.contacted, f.people)}% of the pool` },
    { label: 'Replied', n: f.replied, sub: `${pct(f.replied, f.contacted)}% of contacted` },
    { label: 'Applied', n: f.applied, sub: `${pct(f.applied, f.replied)}% of replied` },
    { label: 'Hired', n: f.hired, sub: `${pct(f.hired, f.applied)}% of applied` },
  ];

  return (
    <section className="tal-section pd" aria-labelledby="pd-title">
      <BackLink />

      <header className="pd-head">
        <div className="pd-head__main">
          <h2 ref={h} tabIndex={-1} id="pd-title" className="pd-title">{pool.name}</h2>
          <p className="pd-about">{pool.about}</p>
          <dl className="pd-meta">
            <div><dt>Kind</dt><dd>{pool.kind === 'Rule' ? 'Updates by rule' : 'Hand-picked'}</dd></div>
            <div><dt>Owner</dt><dd>{pool.owner}</dd></div>
            <div><dt>Shared with</dt><dd>{pool.sharedWith === 'Only me' ? 'No one' : pool.sharedWith}</dd></div>
            <div><dt>Created</dt><dd>{day(pool.created)}</dd></div>
          </dl>
        </div>
        <div className="pd-head__actions">
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setSaid('Editing a pool isn’t available in this prototype yet.')}>Edit pool</button>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setSaid('Adding people from search isn’t available in this prototype yet.')}>Add people</button>
        </div>
      </header>

      <section className="pd-funnel" aria-labelledby="pd-funnel-h">
        <h3 id="pd-funnel-h" className="tal-label">How this pool is going</h3>
        <ol className="pd-stages">
          {stages.map((s) => (
            <li key={s.label}>
              <span className="pd-stage__label">{s.label}</span>
              <span className="pd-stage__n">{s.n}</span>
              <span className="pd-stage__bar" aria-hidden="true"><span style={{ width: `${pct(s.n, f.people)}%` }} /></span>
              {s.sub && <span className="pd-stage__sub">{s.sub}</span>}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pd-people-h" className="pd-people">
        <div className="section-head">
          <h3 id="pd-people-h" className="section-title">People in this pool <span className="pool-n">{members.length}</span></h3>
        </div>

        <div className="pd-filters" role="group" aria-label="Show people by status">
          {(['All', ...STATUS_ORDER] as Filter[]).map((s) => (
            <button key={s} type="button" className="pd-chip" aria-pressed={filter === s} onClick={() => setFilter(s)}>
              {s !== 'All' && <StatusMark status={s} />}
              {s} <span className="pd-chip__n">{count(s)}</span>
            </button>
          ))}
        </div>

        <div className="tal-bulk" role="toolbar" aria-label="Selected people">
          <label className="check">
            <input type="checkbox" checked={all} ref={(el) => { if (el) el.indeterminate = some; }}
              onChange={(e) => setPicked((p) => { const n = new Set(p); shown.forEach((m) => (e.target.checked ? n.add(m.id) : n.delete(m.id))); return n; })} />
            Select all {shown.length}
          </label>
          <span className="tal-bulk__count" aria-live="polite">{picked.size ? `${picked.size} selected` : 'None selected'}</span>
          <label className="search pd-search">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" strokeLinecap="round" /></svg>
            <span className="visually-hidden">Search people in this pool</span>
            <input type="search" placeholder="Search people" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <span className="tal-bulk__actions">
            <button type="button" className="btn btn--secondary btn--sm" aria-disabled={!picked.size || undefined} onClick={() => act('message')}>Message</button>
            <button type="button" className="btn btn--secondary btn--sm" aria-disabled={!picked.size || undefined} onClick={() => act('invite')}>Invite to apply</button>
            <button type="button" className="btn btn--secondary btn--sm" aria-disabled={!picked.size || undefined} onClick={() => act('remove')}>Remove from pool</button>
          </span>
        </div>
        <span className="visually-hidden" role="status">{filter !== 'All' || query ? `Showing ${shown.length} of ${members.length} people` : ''}</span>

        <div className="table-wrap">
          <table className="table pd-table">
            <caption className="visually-hidden">People in {pool.name}, with where each one is and the last time anyone was in touch</caption>
            <thead>
              <tr>
                <th scope="col" className="pd-pick"><span className="visually-hidden">Select</span></th>
                <th scope="col">Person</th>
                <th scope="col">Status</th>
                <th scope="col">Job</th>
                <th scope="col">OA</th>
                <th scope="col">Last touch</th>
                <th scope="col">Added</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => (
                <tr key={m.id} className={picked.has(m.id) ? 'is-picked' : undefined}>
                  <td className="pd-pick">
                    <input type="checkbox" checked={picked.has(m.id)} onChange={(e) => toggle(m.id, e.target.checked)} aria-label={`Select ${m.name}`} />
                  </td>
                  <th scope="row">
                    <span className="pd-person">
                      <span className="tal-avatar pd-avatar" aria-hidden="true">{initials(m.name)}</span>
                      <span>
                        <span className="pool-name">{m.name}</span>
                        <span className="cell-sub">{m.headline}</span>
                        <span className="cell-sub">{m.location}</span>
                      </span>
                    </span>
                  </th>
                  <td><span className="pd-status"><StatusMark status={m.status} />{m.status}</span></td>
                  <td><JobCell m={m} /></td>
                  <td>{m.oa ? <>{m.oa.band}<span className="cell-sub">{m.oa.valid ? 'Still counts' : 'Expired'}</span></> : <span className="muted">None</span>}</td>
                  <td className="pd-touch">
                    {m.lastTouch ? <>{m.lastTouch.what}<span className="cell-sub">{day(m.lastTouch.at)} · {m.lastTouch.by}</span></> : <span className="muted">No contact yet</span>}
                  </td>
                  <td>{day(m.added.at)}<span className="cell-sub">by {m.added.by}</span></td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={7} className="pool-none">No one in this pool matches. <button type="button" className="link-button" onClick={() => { setFilter('All'); setQ(''); }}>Show everyone</button></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {action?.kind === 'message' && <MessageDialog poolId={pool.id} people={members.filter((m) => action.ids.includes(m.id))} onClose={() => setAction(null)} onDone={done} />}
      {action?.kind === 'invite' && <InviteDialog poolId={pool.id} people={members.filter((m) => action.ids.includes(m.id))} onClose={() => setAction(null)} onDone={done} />}
      {action?.kind === 'remove' && <RemoveDialog poolId={pool.id} poolName={pool.name} people={members.filter((m) => action.ids.includes(m.id))} onClose={() => setAction(null)} onDone={done} />}
      <span className="visually-hidden" role="status">{said}</span>
      {said && <p className="tal-toast" aria-hidden="true">{said}</p>}
    </section>
  );
}

function BackLink() {
  return <p className="pd-back"><Link to={`${BASE}/talent/pool`}><span aria-hidden="true">←</span> All pools</Link></p>;
}

function JobCell({ m }: { m: Member }) {
  if (!m.job) return <span className="muted">—</span>;
  const title = OPEN.has(m.job.reqId)
    ? <Link to={`${BASE}/jobs/${m.job.reqId}`}>{m.job.title}</Link>
    : m.job.title;
  return <>{title}<span className="cell-sub">{m.job.stage}</span></>;
}

/** Each status has its own shape, so it never depends on colour. */
function StatusMark({ status }: { status: MemberStatus }) {
  const d: Record<MemberStatus, JSX.Element> = {
    'Not contacted': <circle cx="8" cy="8" r="5.5" strokeDasharray="2.2 2" />,
    Contacted: <circle cx="8" cy="8" r="5.5" />,
    Replied: <><circle cx="8" cy="8" r="5.5" /><circle cx="8" cy="8" r="2.4" className="fill" /></>,
    'Not interested': <><circle cx="8" cy="8" r="5.5" /><path d="m5.2 10.8 5.6-5.6" /></>,
    Applied: <circle cx="8" cy="8" r="5.5" className="fill" />,
    Hired: <><circle cx="8" cy="8" r="6" className="fill" /><path d="m5.4 8.2 1.8 1.8 3.4-3.8" className="knock" /></>,
  };
  return <svg className="pd-mark" viewBox="0 0 16 16" aria-hidden="true">{d[status]}</svg>;
}

const names = (people: Member[]) => (people.length === 1 ? people[0].name : `${people.length} people`);

function MessageDialog({ poolId, people, onClose, onDone }: { poolId: string; people: Member[]; onClose: () => void; onDone: (m: string) => void }) {
  const id = useId();
  const me = person(useMe());
  const [body, setBody] = useState('Hi {first name}, we’re hiring pilots again at the Starfighter Corps and I thought of you. Would you be open to a quick call?');
  const out = people.filter((p) => p.status === 'Not interested');
  return (
    <Dialog open onClose={onClose} size="sm" title={`Message ${names(people)}`}
      description={<p>Each person gets their own copy, by the contact method they prefer. Sent as {me.name}.</p>}
      footer={<>
        <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn--primary" onClick={() => { messageMembers(poolId, people.map((p) => p.id), me.name); onDone(`Message sent to ${names(people)}.`); }}>Send</button>
      </>}>
      {out.length > 0 && <p className="tal-warn" role="note">{out.map((p) => p.name).join(', ')} said they’re not interested. They’ll still get this message.</p>}
      <div className="field">
        <label className="field__label" htmlFor={`${id}-b`}>Message</label>
        <textarea id={`${id}-b`} rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
    </Dialog>
  );
}

function InviteDialog({ poolId, people, onClose, onDone }: { poolId: string; people: Member[]; onClose: () => void; onDone: (m: string) => void }) {
  const me = person(useMe());
  const [req, setReq] = useState(OPEN_JOBS[0].reqId);
  const job = OPEN_JOBS.find((j) => j.reqId === req)!;
  const already = people.filter((p) => p.job?.reqId === req);
  return (
    <Dialog open onClose={onClose} size="sm" title={`Invite ${names(people)} to apply`}
      description={<p>They get a link to the job’s application. Sent as {me.name}.</p>}
      footer={<>
        <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn--primary" onClick={() => { inviteMembers(poolId, people.map((p) => p.id), job.title, me.name); onDone(`Invited ${names(people)} to apply to ${job.title}.`); }}>Send invitation</button>
      </>}>
      <Select label="Job" value={req} options={OPEN_JOBS.map((j) => ({ value: j.reqId, label: `${j.title} · ${j.reqId}` }))} onChange={setReq} />
      {already.length > 0 && <p className="tal-warn" role="note">{already.map((p) => p.name).join(', ')} {already.length === 1 ? 'has' : 'have'} already applied to this job.</p>}
    </Dialog>
  );
}

function RemoveDialog({ poolId, poolName, people, onClose, onDone }: { poolId: string; poolName: string; people: Member[]; onClose: () => void; onDone: (m: string) => void }) {
  return (
    <Dialog open onClose={onClose} size="sm" title={`Remove ${names(people)} from this pool?`}
      description={<p>They stay in the ATS with their history. They just won’t be part of {poolName}.</p>}
      footer={<>
        <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn--primary" onClick={() => { removeMembers(poolId, people.map((p) => p.id)); onDone(`Removed ${names(people)} from ${poolName}.`); }}>Remove</button>
      </>}>
      {people.length > 1 && people.length <= 6 && <p>{people.map((p) => p.name).join(', ')}</p>}
    </Dialog>
  );
}
