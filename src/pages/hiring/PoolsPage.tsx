import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Select } from '@jothish-uxd/enterprise-library';
import Dialog from '../../components/content/Dialog';
import { person, useMe } from '../../data/content/people';
import { SUGGESTED, createPool, usePools, type Pool } from '../../data/hiring/pools';

const day = (iso: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
const SHARING: Pool['sharedWith'][] = ['Only me', 'Recruiting team', 'Starfighter Corps hiring'];

/** Pool tab landing page: your pools and the system's suggested pools, each in a table. */
export default function PoolsPage() {
  const pools = usePools();
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [said, setSaid] = useState('');
  useEffect(() => { if (!said) return; const t = setTimeout(() => setSaid(''), 5000); return () => clearTimeout(t); }, [said]);

  const query = q.trim().toLowerCase();
  const shown = query ? pools.filter((p) => `${p.name} ${p.about} ${p.owner}`.toLowerCase().includes(query)) : pools;
  const people = pools.reduce((s, p) => s + p.people, 0);
  const contacted = pools.reduce((s, p) => s + p.contacted, 0);
  const replied = pools.reduce((s, p) => s + p.replied, 0);
  const applied = pools.reduce((s, p) => s + p.applied, 0);
  const hired = pools.reduce((s, p) => s + p.hired, 0);

  return (
    <section className="tal-section" aria-labelledby="tal-pools-h">
      <h2 id="tal-pools-h" className="visually-hidden">Pool</h2>
      <p className="tal-intro">Groups of people you can reach out to together. Your pools are any grouping that helps you; suggested pools follow each job we’re hiring for.</p>

      <dl className="pr-stats pool-stats">
        <div><dt>Your pools</dt><dd>{pools.length}</dd></div>
        <div><dt>People in your pools</dt><dd>{people}</dd></div>
        <div><dt>Replied when contacted</dt><dd>{pct(replied, contacted)}%</dd><p className="pool-stat__sub">{replied} of {contacted} people</p></div>
        <div><dt>Applied from your pools</dt><dd>{applied}</dd><p className="pool-stat__sub">{hired} hired so far</p></div>
      </dl>

      <div className="pool-block">
        <div className="section-head">
          <h3 className="section-title">Your pools <span className="pool-n">{pools.length}</span></h3>
        </div>
        <div className="toolbar">
          <label className="search">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" strokeLinecap="round" /></svg>
            <span className="visually-hidden">Search your pools</span>
            <input type="search" placeholder="Search pools" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <span className="toolbar__end">
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setCreating(true)}>New pool</button>
          </span>
        </div>
        <span className="visually-hidden" role="status">{query ? `${shown.length} of ${pools.length} pools` : ''}</span>

        <div className="table-wrap">
          <table className="table pool-table">
            <caption className="visually-hidden">Your pools, with how many people are in each and how they’ve responded</caption>
            <thead>
              <tr>
                <th scope="col">Pool</th>
                <th scope="col">Owner</th>
                <th scope="col" className="num">People</th>
                <th scope="col" className="num">Contacted</th>
                <th scope="col" className="num">Replied</th>
                <th scope="col" className="num">Applied</th>
                <th scope="col" className="num">Hired</th>
                <th scope="col">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <th scope="row">
                    <span className="pool-name">{p.name}</span>
                    <span className="cell-sub">{p.about}</span>
                    <span className="pool-kind">
                      <PoolKind kind={p.kind} />
                      {p.rule && <span className="pool-rule">{p.rule}</span>}
                    </span>
                  </th>
                  <td>{p.owner}<span className="cell-sub">Shared with {p.sharedWith === 'Only me' ? 'no one' : p.sharedWith.toLowerCase().replace('starfighter corps', 'Starfighter Corps')}</span></td>
                  <td className="num"><strong>{p.people}</strong></td>
                  <td className="num">{p.contacted || <span className="muted">0</span>}</td>
                  <td className="num">{p.replied || <span className="muted">0</span>}{p.contacted > 0 && <span className="cell-sub">{pct(p.replied, p.contacted)}%</span>}</td>
                  <td className="num">{p.applied || <span className="muted">0</span>}</td>
                  <td className="num">{p.hired || <span className="muted">0</span>}</td>
                  <td>{day(p.lastActivity)}<span className="cell-sub">Created {day(p.created)}</span></td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={8} className="pool-none">No pools match “{q.trim()}”.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pool-block">
        <div className="section-head">
          <h3 className="section-title">Suggested by the system <span className="pool-n">{SUGGESTED.length}</span></h3>
        </div>
        <p className="pool-note">One pool for each job we’re hiring for, kept up to date with people who qualify and aren’t already hired or interviewing for it.</p>
        <div className="table-wrap">
          <table className="table pool-table">
            <caption className="visually-hidden">Suggested pools, one for each open job</caption>
            <thead>
              <tr>
                <th scope="col">Pool for job</th>
                <th scope="col" className="num">People</th>
                <th scope="col" className="num">New this week</th>
                <th scope="col" className="num">Valid OA result</th>
                <th scope="col" className="num">Not contacted yet</th>
                <th scope="col">Updated</th>
              </tr>
            </thead>
            <tbody>
              {SUGGESTED.map((s) => (
                <tr key={s.id}>
                  <th scope="row">
                    <span className="pool-name">{s.title}</span>
                    <span className="cell-sub">
                      For <Link to={`/hiring-system/jobs/${s.reqId}`}>{s.reqId}<span className="visually-hidden">, {s.title}</span></Link>
                    </span>
                  </th>
                  <td className="num"><strong>{s.people}</strong></td>
                  <td className="num">{s.newThisWeek ? `+${s.newThisWeek}` : <span className="muted">0</span>}</td>
                  <td className="num">{s.validOa}<span className="cell-sub">{pct(s.validOa, s.people)}%</span></td>
                  <td className="num">{s.notContacted}</td>
                  <td>{day(s.updated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {creating && <NewPoolDialog onClose={() => setCreating(false)} onDone={(m) => { setCreating(false); setQ(''); setSaid(m); }} />}
      <span className="visually-hidden" role="status">{said}</span>
      {said && <p className="tal-toast" aria-hidden="true">{said}</p>}
    </section>
  );
}

/** Kind shown with a mark as well as words: solid for hand-picked, dashed ring for rule-based. */
function PoolKind({ kind }: { kind: Pool['kind'] }) {
  return <span className={`pool-tag pool-tag--${kind === 'Rule' ? 'rule' : 'hand'}`}><span aria-hidden="true" />{kind === 'Rule' ? 'Updates by rule' : 'Hand-picked'}</span>;
}

function NewPoolDialog({ onClose, onDone }: { onClose: () => void; onDone: (m: string) => void }) {
  const id = useId();
  const me = person(useMe());
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [share, setShare] = useState<Pool['sharedWith']>('Recruiting team');
  const [tried, setTried] = useState(false);
  const missing = !name.trim();
  const save = () => {
    setTried(true);
    if (missing) { document.getElementById(`${id}-n`)?.focus(); return; }
    createPool(name.trim(), about.trim(), me.name, share);
    onDone(`Created ${name.trim()}. Add people to it from Prospects.`);
  };
  return (
    <Dialog open onClose={onClose} size="sm" title="New pool"
      description={<p>A hand-picked pool. You add people to it from their profile or from Prospects.</p>}
      footer={<>
        <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn--primary" onClick={save}>Create pool</button>
      </>}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <div className="field">
          <label className="field__label" htmlFor={`${id}-n`}>Name</label>
          <input id={`${id}-n`} value={name} onChange={(e) => setName(e.target.value)}
            aria-invalid={tried && missing || undefined} aria-describedby={tried && missing ? `${id}-ne` : undefined} />
          {tried && missing && <p id={`${id}-ne`} className="field__error">Give the pool a name.</p>}
        </div>
        <div className="field">
          <label className="field__label" htmlFor={`${id}-a`}>What it’s for <span className="field__opt">(optional)</span></label>
          <textarea id={`${id}-a`} rows={2} value={about} onChange={(e) => setAbout(e.target.value)} />
        </div>
        <Select label="Share with" value={share} options={SHARING.map((s) => ({ value: s, label: s === 'Only me' ? 'No one, only me' : s }))} onChange={(v) => setShare(v as Pool['sharedWith'])} />
      </form>
    </Dialog>
  );
}
