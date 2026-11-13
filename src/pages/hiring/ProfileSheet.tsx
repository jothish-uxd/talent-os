import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Menu from '../../components/content/Menu';
import { person, useMe } from '../../data/hiring/people';
import { interviewsFor, resumeFor, type Interview, type Rating } from '../../data/hiring/profile';
import { sendMessage, type Talent } from '../../data/hiring/talent';

const day = (iso: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso.length === 10 ? `${iso}T12:00:00` : iso));
const weekday = (iso: string) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));
const stamp = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const initials = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('');
const clock = (hm: string) => { const [h, m] = hm.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const CLOSED = ['Not selected', 'Withdrew'];

type Section = 'overview' | 'resume' | 'interviews' | 'applications' | 'messages';
type ActionKind = 'add' | 'invite' | 'oa';

/**
 * Everything about one person, in a sheet from the right. The header stays put
 * (who they are, how to reach them, what to do next); the sections scroll under it.
 *
 * The sheet lives inside the browser frame, not over the whole page: it's part
 * of the Internal ATS. It's portalled into the frame's body and makes the app
 * behind it inert, so keyboard and screen reader users stay in the sheet, while
 * the browser bar above it keeps working like a real browser's would.
 */
export default function ProfileSheet({ t, said, onClose, onAction }: { t: Talent; said: string; onClose: () => void; onAction: (k: ActionKind) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const body = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const id = useId();
  const [active, setActive] = useState<Section>('overview');
  const resume = resumeFor(t);
  const interviews = interviewsFor(t);
  const open = t.applications.find((a) => !CLOSED.includes(a.stage) && a.stage !== 'Hired');
  const replies = t.messages.filter((m) => m.from === 'candidate').length;

  // Find the browser frame's body to open inside.
  useLayoutEffect(() => {
    opener.current = document.activeElement;
    setHost(opener.current?.closest<HTMLElement>('.bframe__body') ?? document.querySelector<HTMLElement>('.bframe__body') ?? document.body);
  }, []);

  // While open, the app behind the sheet is inert; on close, it comes back and focus returns.
  useEffect(() => {
    if (!host) return;
    const behind = [...host.children].filter((el) => el !== ref.current?.parentElement && !el.contains(ref.current)) as HTMLElement[];
    behind.forEach((el) => el.setAttribute('inert', ''));
    // Start on the person's name rather than the first link in the header.
    ref.current?.querySelector<HTMLElement>('.sheet__name')?.focus();
    return () => {
      behind.forEach((el) => el.removeAttribute('inert'));
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [host]);

  // Start at the top whenever a different person opens.
  useEffect(() => { body.current?.scrollTo({ top: 0 }); setActive('overview'); }, [t.id]);

  // Underline the section in view.
  useEffect(() => {
    const root = body.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (seen) setActive(seen.target.getAttribute('data-section') as Section);
    }, { root, rootMargin: '0px 0px -65% 0px' });
    root.querySelectorAll('[data-section]').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [t.id]);

  const go = (s: Section) => {
    const el = body.current?.querySelector<HTMLElement>(`[data-section="${s}"]`);
    if (!el) return;
    // Scroll only the body, so the header stays fixed.
    const root = body.current!;
    root.scrollTo({ top: el.offsetTop - 4, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    el.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true });
    setActive(s);
  };

  const NAV: { s: Section; label: string; n?: number }[] = [
    { s: 'overview', label: 'Overview' },
    { s: 'resume', label: 'Resume' },
    { s: 'interviews', label: 'Interviews', n: interviews.length },
    { s: 'applications', label: 'Applications', n: t.applications.length },
    { s: 'messages', label: 'Messages', n: t.messages.length },
  ];

  if (!host) return null;
  return createPortal(
    <div className="sheet-layer">
      <div className="sheet__scrim" aria-hidden="true" onClick={onClose} />
      <div ref={ref} className="sheet" role="dialog" aria-modal="true" aria-labelledby={`${id}-n`}
        onKeyDown={(e) => { if (e.key === 'Escape' && !e.defaultPrevented) { e.stopPropagation(); onClose(); } }}>
      <div className="sheet__inner">
        <header className="sheet__head">
          <div className="sheet__who">
            <span className="tal-avatar" aria-hidden="true">{initials(t.name)}</span>
            <div className="sheet__id">
              <h2 id={`${id}-n`} tabIndex={-1} className="sheet__name">{t.name} {t.pronouns && <span className="tal-card__pron">({t.pronouns})</span>}</h2>
              <p className="tal-card__headline">{t.headline}</p>
              <ul className="tal-card__meta">
                <li><span className="mono">{t.id}</span></li>
                <li>{t.location}</li>
                <li><a href={`mailto:${t.email}`}>{t.email}</a></li>
                <li><a href={`tel:${t.phone.replace(/[^+\d]/g, '')}`}>{t.phone}</a></li>
                <li>Prefers {t.preferredContact.toLowerCase()}</li>
              </ul>
            </div>
            <div className="sheet__actions">
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => onAction('oa')}>Send OA</button>
              <button type="button" className="btn btn--primary btn--sm" onClick={() => onAction('invite')}>Invite to apply</button>
              <Menu label={`More actions for ${t.name}`} className="wf-more" items={[
                { label: 'Add to job', onSelect: () => onAction('add') },
                { label: 'Add a note', disabled: true, onSelect: () => {} },
                { label: 'Add to talent pool', disabled: true, onSelect: () => {} },
                { label: 'Share profile', disabled: true, onSelect: () => {} },
                { label: 'Mark as do not contact', divider: true, disabled: true, onSelect: () => {} },
              ]}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="18" cy="12" r="1.6" /></svg>
              </Menu>
              <button type="button" className="bframe__btn sheet__close" aria-label="Close profile" onClick={onClose}>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </div>
          </div>
          <dl className="sheet__facts">
            <div><dt>In process</dt><dd>{open ? `${open.title} · ${open.stage}` : 'Not right now'}</dd></div>
            <div><dt>Latest OA</dt><dd>{t.oa[0] ? `${t.oa[0].band} · ${t.oa[0].score}/${t.oa[0].outOf}` : 'None yet'}</dd></div>
            <div><dt>Owner</dt><dd>{t.owner}</dd></div>
            <div><dt>Source</dt><dd>{t.source}</dd></div>
            <div><dt>Last activity</dt><dd>{day(t.lastActivity)}</dd></div>
          </dl>
          <nav className="sheet__nav" aria-label={`Sections of ${t.name}’s profile`}>
            {NAV.map((n) => (
              <button key={n.s} type="button" className="sheet__tab" aria-current={active === n.s ? 'true' : undefined} onClick={() => go(n.s)}>
                {n.label}{n.n !== undefined && <span className="sheet__tab-n">{n.n}</span>}
              </button>
            ))}
          </nav>
        </header>

        <div ref={body} className="sheet__body">
          {/* ---------- Overview ---------- */}
          <section data-section="overview" aria-labelledby={`${id}-ov`} className="sheet__sec">
            <h3 id={`${id}-ov`} tabIndex={-1} className="sheet__h">Overview</h3>

            <h4 className="tal-label">Online assessments</h4>
            {t.oa.length === 0 ? <p className="tal-none">No assessments yet.</p> : t.oa.map((o) => (
              <div key={o.workflow + o.taken} className="tal-oa sheet__oa">
                <div className="tal-oa__main">
                  <span className="tal-oa__band"><Bars n={o.band === 'Strong' ? 4 : o.band === 'Recommended' ? 3 : o.band === 'Borderline' ? 2 : 1} />{o.band}</span>
                  <span className="tal-oa__score"><strong>{o.score}</strong>/{o.outOf}</span>
                </div>
                <dl className="tal-oa__facts">
                  <div><dt>Workflow</dt><dd>{o.workflow} · v{o.version}</dd></div>
                  <div><dt>Taken</dt><dd>{day(o.taken)}</dd></div>
                  <div><dt>Valid until</dt><dd>{day(o.validUntil)}{o.validUntil < '2026-11-12' ? ' (expired)' : ''}</dd></div>
                  <div><dt>Proctoring</dt><dd>{o.proctoring}</dd></div>
                  {o.reusableFor.length > 0 && <div className="tal-oa__reuse"><dt>Also counts for</dt><dd>{o.reusableFor.join(', ')}</dd></div>}
                </dl>
              </div>
            ))}

            <h4 className="tal-label sheet__sub">Good to know</h4>
            <dl className="sheet__dl">
              {t.considerations.map((c) => (
                <div key={c.label} className={c.flag ? 'is-flag' : ''}>
                  <dt>{c.flag && <span className="tal-flag" aria-hidden="true">!</span>}{c.label}{c.flag && <span className="visually-hidden"> (needs attention)</span>}</dt>
                  <dd>{c.value}</dd>
                </div>
              ))}
            </dl>

            <div className="sheet__two">
              <div>
                <h4 className="tal-label sheet__sub">Contact and preferences</h4>
                <dl className="sheet__dl sheet__dl--rows">
                  <div><dt>Email</dt><dd><a href={`mailto:${t.email}`}>{t.email}</a></dd></div>
                  <div><dt>Phone</dt><dd><a href={`tel:${t.phone.replace(/[^+\d]/g, '')}`}>{t.phone}</a></dd></div>
                  <div><dt>Prefers</dt><dd>{t.preferredContact}</dd></div>
                  <div><dt>Time zone</dt><dd>{t.timezone}</dd></div>
                </dl>
              </div>
              <div>
                <h4 className="tal-label sheet__sub">In the ATS</h4>
                <dl className="sheet__dl sheet__dl--rows">
                  <div><dt>Owner</dt><dd>{t.owner}</dd></div>
                  <div><dt>Source</dt><dd>{t.source}</dd></div>
                  <div><dt>Added</dt><dd>{day(t.added)}</dd></div>
                  <div><dt>Replies</dt><dd>{replies} of {t.messages.length} messages</dd></div>
                </dl>
              </div>
            </div>

            <h4 className="tal-label sheet__sub">Skills</h4>
            <ul className="tal-skills" aria-label="Skills">{t.skills.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>

          {/* ---------- Resume ---------- */}
          <section data-section="resume" aria-labelledby={`${id}-rs`} className="sheet__sec">
            <div className="sheet__sec-head">
              <h3 id={`${id}-rs`} tabIndex={-1} className="sheet__h">Resume</h3>
              <span className="sheet__file">
                <span className="mono">{resume.file}</span> · uploaded {day(resume.uploaded)}
              </span>
            </div>
            <article className="resume" aria-label={`${t.name}’s resume`}>
              <header className="resume__head">
                <p className="resume__name">{t.name}</p>
                <p className="resume__contact">{t.location} · {t.email} · {t.phone}</p>
              </header>
              <p className="resume__summary">{resume.summary}</p>
              <h4 className="resume__h">Experience</h4>
              {resume.roles.map((r) => (
                <div key={r.org + r.dates} className="resume__role">
                  <p className="resume__role-line"><strong>{r.title}</strong>, {r.org}</p>
                  <p className="resume__role-meta">{r.dates} · {r.location}</p>
                  <ul>{r.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                </div>
              ))}
              {resume.education.length > 0 && <>
                <h4 className="resume__h">Education</h4>
                {resume.education.map((e) => (
                  <div key={e.line} className="resume__role">
                    <p className="resume__role-line"><strong>{e.line}</strong></p>
                    <p className="resume__role-meta">{e.detail}</p>
                  </div>
                ))}
              </>}
              <h4 className="resume__h">Certifications</h4>
              <ul className="resume__inline">{resume.certifications.map((c) => <li key={c}>{c}</li>)}</ul>
              <h4 className="resume__h">Skills</h4>
              <ul className="resume__inline">{resume.skills.map((c) => <li key={c}>{c}</li>)}</ul>
            </article>
          </section>

          {/* ---------- Interviews ---------- */}
          <section data-section="interviews" aria-labelledby={`${id}-iv`} className="sheet__sec">
            <h3 id={`${id}-iv`} tabIndex={-1} className="sheet__h">Interviews</h3>
            {interviews.length === 0
              ? <p className="tal-none">No interviews yet. Interviews appear here once {t.name.split(' ')[0]} is screened for a job.</p>
              : <ol className="iv-list">{interviews.map((iv) => <li key={iv.id}><InterviewCard iv={iv} /></li>)}</ol>}
          </section>

          {/* ---------- Applications ---------- */}
          <section data-section="applications" aria-labelledby={`${id}-ap`} className="sheet__sec">
            <h3 id={`${id}-ap`} tabIndex={-1} className="sheet__h">Applications</h3>
            {t.applications.length === 0 ? <p className="tal-none">Hasn’t applied to anything yet.</p> : (
              <div className="table-wrap">
                <table className="table">
                  <caption className="visually-hidden">Every job {t.name} has applied to or been added to, newest first</caption>
                  <thead><tr><th scope="col">Job</th><th scope="col">Date</th><th scope="col">Stage</th><th scope="col">Recruiter</th></tr></thead>
                  <tbody>
                    {t.applications.map((a) => (
                      <tr key={a.reqId}>
                        <th scope="row">{a.title}<span className="cell-sub mono">{a.reqId}</span></th>
                        <td>{day(a.date)}</td>
                        <td><span className={`tal-stage${CLOSED.includes(a.stage) ? ' is-closed' : ''}`}>{a.stage}</span></td>
                        <td>{a.recruiter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ---------- Messages ---------- */}
          <section data-section="messages" aria-labelledby={`${id}-ms`} className="sheet__sec">
            <h3 id={`${id}-ms`} tabIndex={-1} className="sheet__h">Messages</h3>
            {t.messages.length === 0 ? <p className="tal-none">No messages yet.</p> : (
              <ol className="tal-thread">
                {t.messages.map((m, i) => (
                  <li key={i} className={`tal-msg tal-msg--${m.from}`}>
                    <span className="tal-msg__meta"><strong>{m.by}</strong> · {m.channel} · {stamp.format(new Date(m.at))}</span>
                    {m.subject && <span className="tal-msg__subj">{m.subject}</span>}
                    <p>{m.body}</p>
                  </li>
                ))}
              </ol>
            )}
            <Compose t={t} />
          </section>
        </div>
        {/* The page behind is inert while the sheet is open, so confirmations are spoken and shown here. */}
        <span className="visually-hidden" role="status">{said}</span>
        {said && <p className="tal-toast sheet__toast" aria-hidden="true">{said}</p>}
      </div>
      </div>
    </div>,
    host,
  );
}

function Compose({ t }: { t: Talent }) {
  const id = useId();
  const me = person(useMe());
  const [draft, setDraft] = useState('');
  return (
    <form className="field tal-compose" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { sendMessage(t.id, me.name, draft.trim()); setDraft(''); } }}>
      <label className="field__label" htmlFor={`${id}-m`}>Message {t.name.split(' ')[0]} by {t.preferredContact.toLowerCase()}</label>
      <textarea id={`${id}-m`} rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
      <div><button type="submit" className="btn btn--primary btn--sm" aria-disabled={!draft.trim() || undefined}>Send as {me.name}</button></div>
    </form>
  );
}

const RATING_N: Record<Rating, number> = { 'Strong yes': 4, Yes: 3, No: 2, 'Strong no': 1 };

function InterviewCard({ iv }: { iv: Interview }) {
  const label = iv.status === 'Scheduled' ? 'Scheduled' : iv.outcome ?? iv.status;
  return (
    <article className={`iv${iv.status === 'Scheduled' ? ' is-upcoming' : ''}`} aria-label={`${iv.round} for ${iv.job}, ${weekday(iv.date)}`}>
      <header className="iv__head">
        <div>
          <p className="iv__round">{iv.round}</p>
          <p className="iv__job">{iv.job} <span className="mono">{iv.reqId}</span></p>
        </div>
        <span className={`tal-stage${iv.outcome === 'No hire' || iv.outcome === 'Not advanced' || iv.outcome === 'Withdrew' ? ' is-closed' : ''}`}>{label}</span>
      </header>
      <p className="iv__when">{weekday(iv.date)} · {clock(iv.time)} · {iv.minutes} min · {iv.format}</p>
      <ul className="iv__people">
        {iv.interviewers.map((p) => (
          <li key={p.name}>
            <span className="iv__who"><strong>{p.name}</strong>, {p.role}</span>
            {p.rating
              ? <span className="iv__rating"><Bars n={RATING_N[p.rating]} />{p.rating}</span>
              : <span className="iv__rating muted">{iv.status === 'Scheduled' ? 'Feedback after the interview' : 'No feedback'}</span>}
            {p.note && <p className="iv__note">{p.note}</p>}
          </li>
        ))}
      </ul>
      {iv.summary && <p className="iv__summary"><span className="tal-label">Outcome</span>{iv.summary}</p>}
    </article>
  );
}

/** Rating or band drawn as filled bars, so it never depends on colour. */
function Bars({ n }: { n: number }) {
  return <span className="tal-bars" aria-hidden="true">{[1, 2, 3, 4].map((i) => <span key={i} className={i <= n ? 'is-on' : ''} />)}</span>;
}
