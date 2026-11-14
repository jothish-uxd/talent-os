import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePageTitle } from '../../components/usePageTitle';
import { StatFilter } from '@jothish-uxd/enterprise-library';
import { STAGES, inPipeline, type Job } from '../../data/hiring/jobs';
import { decide, deleteDraft, isCreated, useAllJobs, who, LOCATIONS, type CreatedJob } from '../../data/hiring/newJob';
import { person, useMe } from '../../data/hiring/people';
import NewJob from './NewJob';
import { candidatesFor, type JobCandidate } from '../../data/hiring/applicants';
import { STATUS_TEXT, sessionById } from '../../data/proctor/sessions';
import { RiskBadge, sessionPath } from '../proctor/bits';

/** Proctoring reports live in Online Assessments, not in Talent OS. */
const PROCTOR_SITE = 'https://jothish-uxd.github.io/online-assessments/#';

const BASE = '/hiring-system/jobs';
const day = (d: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${d}T12:00:00`));

export default function JobsPage() {
  return (
    <Routes>
      <Route index element={<JobsList />} />
      <Route path="new" element={<NewJob />} />
      <Route path=":reqId" element={<JobRoute />} />
      <Route path="*" element={<Navigate to={BASE} replace />} />
    </Routes>
  );
}

function JobRoute() {
  const { reqId } = useParams();
  const j = useAllJobs().find((x) => x.reqId === reqId);
  if (!j) return <Navigate to={BASE} replace />;
  return isCreated(j) && j.status !== 'Open' ? <NewJobDetail j={j} /> : <JobDetail j={j} />;
}

/** A short confirmation passed along when navigating here (e.g. after saving or submitting a job). */
function useArrivalNote() {
  const loc = useLocation();
  const [said, setSaid] = useState<string>((loc.state as { said?: string } | null)?.said ?? '');
  useEffect(() => { if (!said) return; const t = setTimeout(() => setSaid(''), 6000); return () => clearTimeout(t); }, [said]);
  return [said, setSaid] as const;
}

/** Status shown with a mark as well as words. */
function JobStatus({ s }: { s: Job['status'] }) {
  return <span className={`job-status job-status--${s.toLowerCase().replace(' ', '-')}`}><span aria-hidden="true" />{s}</span>;
}

function JobsList() {
  const h = usePageTitle('Jobs · Internal ATS');
  const JOBS = useAllJobs();
  const open = JOBS.filter((j) => j.status === 'Open');
  const waiting = JOBS.filter((j) => j.status === 'Pending approval').length;
  const [said] = useArrivalNote();
  return (
    <div className="ca-page">
      <header className="ca-head">
        <div>
          <h1 ref={h} tabIndex={-1} className="ca-title">Jobs</h1>
          <p className="ca-sub">Requisitions and where their candidates are in the pipeline. Choose a job to see it in detail.</p>
        </div>
        <Link to={`${BASE}/new`} className="btn btn--primary">Create job</Link>
      </header>
      <dl className="pr-stats job-stats">
        <div><dt>Open jobs</dt><dd>{open.length}</dd></div>
        <div><dt>Openings to fill</dt><dd>{open.reduce((s, j) => s + j.openings - j.pipeline.Hired, 0)}</dd></div>
        <div><dt>In pipelines</dt><dd>{open.reduce((s, j) => s + inPipeline(j), 0)}</dd></div>
        <div><dt>Offers out</dt><dd>{open.reduce((s, j) => s + j.pipeline.Offer, 0)}</dd></div>
        <div><dt>Waiting for approval</dt><dd>{waiting}</dd></div>
      </dl>
      <span className="visually-hidden" role="status">{said}</span>
      {said && <p className="tal-toast" aria-hidden="true">{said}</p>}
      <div className="table-wrap">
        <table className="table job-table">
          <caption className="visually-hidden">Jobs, with the number of candidates at each pipeline stage</caption>
          <thead>
            <tr>
              <th scope="col">Job</th>
              <th scope="col">Status</th>
              <th scope="col">Recruiter</th>
              {STAGES.map((s) => <th key={s} scope="col" className="num">{s}</th>)}
              <th scope="col">Pipeline</th>
            </tr>
          </thead>
          <tbody>
            {JOBS.map((j) => (
              <tr key={j.reqId}>
                <th scope="row">
                  <Link to={`${BASE}/${j.reqId}`} className="row-link">{j.title}</Link>
                  <span className="cell-sub"><span className="mono">{j.reqId}</span> · {j.location}</span>
                </th>
                <td><JobStatus s={j.status} />{j.closes && j.status === 'Open' && <span className="cell-sub">Closes {day(j.closes)}</span>}{isCreated(j) && j.status === 'Pending approval' && <span className="cell-sub">{waitingOn(j)}</span>}</td>
                <td>{j.recruiter}<span className="cell-sub">HM {j.hiringManager}</span></td>
                {STAGES.map((s) => <td key={s} className="num">{j.pipeline[s] || <span className="muted">0</span>}</td>)}
                <td><Funnel j={j} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Who a pending job is waiting on, in a few words. */
function waitingOn(j: CreatedJob) {
  const w = j.approvals?.steps.filter((s) => s.status === 'Waiting') ?? [];
  const done = j.approvals?.steps.filter((s) => s.status === 'Approved').length ?? 0;
  return w.length === 1 ? `Waiting on ${w[0].name}` : `${done} of ${j.approvals?.steps.length} approved`;
}

/** Tiny funnel: one bar per stage, scaled to the job's applicants. Decorative; the numbers are in the table. */
function Funnel({ j }: { j: Job }) {
  const max = Math.max(1, j.pipeline.Applied);
  return (
    <span className="job-funnel" aria-hidden="true">
      {STAGES.map((s) => <span key={s} style={{ height: `${Math.max(j.pipeline[s] ? 8 : 0, (j.pipeline[s] / max) * 100)}%` }} />)}
    </span>
  );
}

/** Job detail: placeholder layout for now. */
function JobDetail({ j }: { j: Job }) {
  const h = usePageTitle(`${j.title} · Internal ATS`);
  const [filter, setFilter] = useState<Filter>('Assessment');
  const total = STAGES.reduce((n, s) => n + j.pipeline[s], 0);
  return (
    <div className="ca-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to={BASE}>Jobs</Link></li>
          <li><span aria-current="page">{j.title}</span></li>
        </ol>
      </nav>
      <header className="ca-head">
        <div>
          <p className="page-kicker"><span className="mono">{j.reqId}</span> · {j.team}</p>
          <h1 ref={h} tabIndex={-1} className="ca-title">{j.title}</h1>
          <p className="ca-sub">{j.location} · {j.openings} opening{j.openings === 1 ? '' : 's'} · Opened {day(j.opened)}{j.closes ? ` · Closes ${day(j.closes)}` : ''}</p>
        </div>
        <JobStatus s={j.status} />
      </header>

      {/* The pipeline counts double as the filter for the candidates below. */}
      <StatFilter className="job-pipe" label="Pipeline. Choose a stage to list its candidates" controls="job-cands-list"
        value={filter} onChange={setFilter}
        items={(['All', ...STAGES] as Filter[]).map((f) => ({ value: f, label: f, count: f === 'All' ? total : j.pipeline[f] }))} />

      <div className="job-grid">
        <Candidates key={filter} j={j} filter={filter} />
        <aside className="job-side" aria-label="About this job">
          <dl className="kv kv--stack">
            <div><dt>Recruiter</dt><dd>{j.recruiter}</dd></div>
            <div><dt>Hiring manager</dt><dd>{j.hiringManager}</dd></div>
            <div><dt>Level</dt><dd>{j.level}</dd></div>
            <div><dt>OA workflow</dt><dd>{j.workflow ?? <span className="muted">None</span>}</dd></div>
          </dl>
          <section className="job-ph" aria-labelledby="job-desc"><h2 id="job-desc" className="detail__h3">Job description</h2><p className="pr-placeholder">Placeholder</p></section>
          <section className="job-ph" aria-labelledby="job-int"><h2 id="job-int" className="detail__h3">Interview plan</h2><p className="pr-placeholder">Placeholder</p></section>
        </aside>
      </div>
    </div>
  );
}

const short = (d: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${d}T12:00:00`));

type Filter = 'All' | (typeof STAGES)[number];
const ORDER = [...STAGES].reverse();
const PAGE = 25;
const sessionFor = (c: JobCandidate) => sessionById(c.oa.sessionId);

/** Every candidate on the job, filterable by stage, with their OA status and a way into proctoring. */
function Candidates({ j, filter }: { j: Job; filter: Filter }) {
  const all = candidatesFor(j.reqId);
  const [page, setPage] = useState(0);
  const rows = (filter === 'All' ? [...all].sort((a, b) => ORDER.indexOf(a.stage) - ORDER.indexOf(b.stage)) : all.filter((c) => c.stage === filter));
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);
  const taken = rows.filter((c) => c.oa.state === 'completed');
  const pending = rows.filter((c) => c.oa.state === 'invited' || c.oa.state === 'started');
  return (
    <section className="job-cands" id="job-cands-list" aria-labelledby="job-cands">
      <div className="section-head">
        <h2 id="job-cands" className="section-title">{filter === 'All' ? 'All candidates' : filter} <span className="muted">{rows.length}</span></h2>
      </div>
      {rows.length === 0 ? (
        <div className="empty"><p className="empty__title">No one at this stage</p><p>Candidates appear here as they move through the pipeline.</p></div>
      ) : (
        <>
          <p className="job-cands__sum" aria-live="polite">
            {j.workflow
              ? <>OA taken by {taken.length} · pending for {pending.length}{rows.length - taken.length - pending.length > 0 ? ` · not sent to ${rows.length - taken.length - pending.length}` : ''}</>
              : 'This job has no online assessment.'}
          </p>
          <div className="table-wrap">
            <table className="table job-ctable">
              <caption className="visually-hidden">{filter === 'All' ? 'All candidates' : `Candidates in ${filter}`} on {j.title}, with their online assessment status</caption>
              <thead>
                <tr><th scope="col">Candidate</th><th scope="col">Stage</th><th scope="col">Online assessment</th><th scope="col">Proctoring</th><th scope="col"><span className="visually-hidden">Details</span></th></tr>
              </thead>
              <tbody>
                {shown.map((c) => <CandidateRow key={c.id + c.name} c={c} j={j} />)}
              </tbody>
            </table>
          </div>
          {rows.length > PAGE && (
            <nav className="job-pager" aria-label="Candidate pages">
              <button type="button" className="btn btn--secondary btn--sm" aria-disabled={page === 0 || undefined} onClick={() => page > 0 && setPage(page - 1)}>Previous</button>
              <span>{page * PAGE + 1}–{Math.min(rows.length, page * PAGE + PAGE)} of {rows.length}</span>
              <button type="button" className="btn btn--secondary btn--sm" aria-disabled={(page + 1) * PAGE >= rows.length || undefined} onClick={() => (page + 1) * PAGE < rows.length && setPage(page + 1)}>Next</button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

function CandidateRow({ c, j }: { c: JobCandidate; j: Job }) {
  const s = sessionFor(c);
  const open = s && (s.status === 'needs-review' || s.status === 'in-review');
  const o = c.oa;
  return (
    <tr>
      <th scope="row">{c.name}<span className="cell-sub mono">{c.id}</span></th>
      <td><span className="tal-stage">{c.stage}</span><span className="cell-sub">Applied {short(c.applied)}</span></td>
      <td>
        {o.state === 'completed' ? (
          <>
            <span className="oa-state">Taken</span>
            <span className={`oa-result ${o.pass ? 'is-pass' : 'is-fail'}`}><span aria-hidden="true">{o.pass ? '✓' : '✕'}</span>{o.pass ? 'Passed' : 'Not passed'}</span>
            <span className="cell-sub">{o.score}/{o.outOf} · {short(o.date!)}{o.pass && open ? ' · on hold until reviewed' : ''}</span>
          </>
        ) : o.state === 'started' ? <><span className="oa-state is-pending">Pending</span>In progress<span className="cell-sub">Started {short(o.date!)}</span></>
          : o.state === 'invited' ? <><span className="oa-state is-pending">Pending</span>Invited<span className="cell-sub">Sent {short(o.date!)}, not started</span></>
          : <span className="muted">{j.workflow ? 'Not sent' : 'No OA for this job'}</span>}
      </td>
      <td>
        {s ? (
          <>{open ? <RiskBadge risk={s.risk} /> : <span className="oa-proc">{STATUS_TEXT[s.status]}</span>}<span className="cell-sub">{open ? STATUS_TEXT[s.status] : `${s.events.length} flag${s.events.length === 1 ? '' : 's'}`}</span></>
        ) : o.state === 'completed' ? <span className="muted">Not proctored</span> : <span className="muted">—</span>}
      </td>
      <td>
        {s && (
          <a href={`${PROCTOR_SITE}${sessionPath(s.id)}`} target="_blank" rel="noreferrer" className="btn btn--secondary btn--sm">
            Details<span className="visually-hidden"> of {c.name}’s proctored session (opens the proctoring report in a new tab)</span>
          </a>
        )}
      </td>
    </tr>
  );
}

/* ---------- A job made with Create job, before it's open ---------- */

const MARK: Record<string, JSX.Element> = {
  Approved: <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" className="fill" /><path d="m5 8.3 2 2 4-4.6" className="knock" /></svg>,
  Waiting: <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" /><path d="M8 4.8V8l2.2 1.4" /></svg>,
  'Not started': <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" strokeDasharray="2.4 2.2" /></svg>,
  'Sent back': <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" /><path d="M10.5 5.5h-4a2 2 0 0 0 0 4H9M6.5 7.5 5 9.5l1.5 2" /></svg>,
};

function NewJobDetail({ j }: { j: CreatedJob }) {
  const h = usePageTitle(`${j.title} · Internal ATS`);
  const me = person(useMe());
  const nav = useNavigate();
  const [said, setSaid] = useArrivalNote();
  const [note, setNote] = useState('');
  const f = j.form;
  const steps = j.approvals?.steps ?? [];
  const mine = steps.find((s) => s.name === me.name && s.status === 'Waiting');
  const nextUp = steps.find((s) => s.status === 'Waiting' && s.name !== me.name);
  const sentBack = steps.find((s) => s.status === 'Sent back');
  const act = (name: string, d: 'Approved' | 'Sent back', n = '') => {
    decide(j.reqId, name, d, n);
    setNote('');
    setSaid(d === 'Approved' ? `${name} approved ${j.title}.` : `${name} sent ${j.title} back to ${j.form.recruiter}.`);
  };
  const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

  return (
    <div className="ca-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to={BASE}>Jobs</Link></li>
          <li><span aria-current="page">{j.title}</span></li>
        </ol>
      </nav>
      <header className="ca-head">
        <div>
          <p className="page-kicker"><span className="mono">{j.reqId}</span> · {j.team}</p>
          <h1 ref={h} tabIndex={-1} className="ca-title">{j.title}</h1>
          <p className="ca-sub">{j.location} · {j.openings} opening{j.openings === 1 ? '' : 's'} · {f.employment}</p>
        </div>
        <div className="njd-head-end">
          <JobStatus s={j.status} />
          {j.status === 'Draft' && <>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => { deleteDraft(j.reqId); nav(BASE, { state: { said: `Deleted the draft ${j.title}.` } }); }}>Delete draft</button>
            <Link to={`${BASE}/new?draft=${j.reqId}`} className="btn btn--primary btn--sm">{sentBack ? 'Make changes' : 'Continue editing'}</Link>
          </>}
        </div>
      </header>

      {j.status === 'Pending approval' && <p className="njd-banner" role="note">This job isn’t posted yet. It opens to candidates once everyone below has approved.</p>}
      {j.status === 'Draft' && !sentBack && <p className="njd-banner" role="note">Draft. Only you can see it until you send it for approval.</p>}
      {sentBack && <p className="njd-banner njd-banner--strong" role="note"><strong>{sentBack.name} sent this back.</strong> {sentBack.note ?? 'No note left.'} Make changes and send it again.</p>}

      <div className="job-grid njd-grid">
        <div className="njd-main">
          <section className="njd-sec" aria-labelledby="njd-about">
            <h2 id="njd-about" className="detail__h3">About the job</h2>
            <p>{f.summary || <span className="muted">No summary yet.</span>}</p>
            {lines(f.responsibilities).length > 0 && <><h3 className="njd-h4">What they’ll do</h3><ul>{lines(f.responsibilities).map((l) => <li key={l}>{l}</li>)}</ul></>}
            {lines(f.requirements).length > 0 && <><h3 className="njd-h4">What they need</h3><ul>{lines(f.requirements).map((l) => <li key={l}>{l}</li>)}</ul></>}
          </section>
          <section className="njd-sec" aria-labelledby="njd-where">
            <h2 id="njd-where" className="detail__h3">Where and pay</h2>
            <dl className="nj-dl">
              <div><dt>Arrangement</dt><dd>{f.arrangement}{f.arrangement === 'Hybrid' ? `, ${f.daysOnSite} days on site` : ''}</dd></div>
              {f.arrangement === 'Remote'
                ? <><div><dt>Regions</dt><dd>{f.regions.join(', ') || '—'}</dd></div><div><dt>Overlap</dt><dd>{f.overlap}</dd></div></>
                : <><div className="nj-dl__wide"><dt>Locations</dt><dd>{f.locations.map((id) => LOCATIONS.find((l) => l.id === id)?.name).join(', ') || '—'}</dd></div><div><dt>Relocation</dt><dd>{f.relocation ? 'Offered' : 'Not offered'}</dd></div></>}
              <div><dt>Travel</dt><dd>{f.travel}</dd></div>
              <div><dt>Pay</dt><dd>{f.payMin && f.payMax ? `${Number(f.payMin).toLocaleString('en-US')}k–${Number(f.payMax).toLocaleString('en-US')}k credits a year` : '—'}</dd></div>
            </dl>
          </section>
        </div>

        <aside className="job-side" aria-label="About this job">
          {j.approvals ? (
            <section className="njd-approvals" aria-labelledby="njd-ap">
              <h2 id="njd-ap" className="detail__h3">Approvals</h2>
              <p className="nj-hint">{j.approvals.mode === 'In order' ? 'One after another' : 'All at once'} · sent by {j.approvals.submittedBy} on {day(j.approvals.submittedAt.slice(0, 10))}</p>
              <ol className="njd-steps">
                {steps.map((s) => (
                  <li key={s.name} className={`njd-step is-${s.status.toLowerCase().replace(' ', '-')}`}>
                    <span className="njd-mark" aria-hidden="true">{MARK[s.status]}</span>
                    <span className="njd-who"><strong>{s.name}</strong><span className="cell-sub">{s.title || who(s.name).title}</span><span className="cell-sub">{s.why}</span></span>
                    <span className="njd-state">{s.status}{s.at && <span className="cell-sub">{day(s.at.slice(0, 10))}</span>}</span>
                    {s.note && <p className="njd-note">“{s.note}”</p>}
                  </li>
                ))}
              </ol>

              {mine && j.status === 'Pending approval' && (
                <div className="njd-decide">
                  <p className="njd-decide__h">You’re an approver, {me.name.split(' ')[0]}.</p>
                  <div className="field">
                    <label className="field__label" htmlFor="njd-note">Note <span className="field__opt">(optional, sent with your decision)</span></label>
                    <textarea id="njd-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn--primary btn--sm" onClick={() => act(me.name, 'Approved', note)}>Approve</button>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => act(me.name, 'Sent back', note)}>Send back</button>
                  </div>
                </div>
              )}
              {nextUp && j.status === 'Pending approval' && (
                <div className="njd-proto">
                  <p className="njd-proto__h">Prototype</p>
                  <p>Approvals from people you can’t sign in as are simulated.</p>
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => act(nextUp.name, 'Approved')}>Approve as {nextUp.name}</button>
                </div>
              )}
            </section>
          ) : (
            <section className="njd-approvals" aria-labelledby="njd-ap">
              <h2 id="njd-ap" className="detail__h3">Approvals</h2>
              <p className="nj-hint">Not sent yet. These people will be asked:</p>
              <ol className="nj-mini-chain">{f.chain.map((n) => <li key={n}><strong>{n}</strong> · {who(n).title}</li>)}</ol>
            </section>
          )}
          <dl className="kv kv--stack">
            <div><dt>Recruiter</dt><dd>{j.recruiter}</dd></div>
            <div><dt>Hiring manager</dt><dd>{j.hiringManager}</dd></div>
            <div><dt>Level</dt><dd>{j.level}</dd></div>
            <div><dt>Reason</dt><dd>{f.reason}{f.reason === 'Backfill' && f.backfillFor ? ` for ${f.backfillFor}` : ''}</dd></div>
            <div><dt>OA workflow</dt><dd>{j.workflow ?? <span className="muted">None</span>}</dd></div>
            <div><dt>Created</dt><dd>{day(j.createdAt.slice(0, 10))} by {j.createdBy}</dd></div>
          </dl>
        </aside>
      </div>
      <span className="visually-hidden" role="status">{said}</span>
      {said && <p className="tal-toast" aria-hidden="true">{said}</p>}
    </div>
  );
}
