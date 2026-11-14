import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChoiceCard, Select } from '@jothish-uxd/enterprise-library';
import { usePageTitle } from '../../components/usePageTitle';
import { person, useMe } from '../../data/hiring/people';
import {
  BANDS, DIRECTORY, EMPLOYMENT, LEVELS, LOCATIONS, MANAGERS, OVERLAP, RECRUITERS, REGIONS, TEAMS, TRAVEL, WORKFLOWS,
  blankForm, locationLabel, requiredApprovers, saveDraft, submitForApproval, syncChain, useCreatedJobs, who, type JobForm,
} from '../../data/hiring/newJob';

const BASE = '/hiring-system/jobs';
const STEPS = ['Basics', 'Location', 'Pay and description', 'Approvers', 'Review'] as const;
type Errors = { id: string; text: string }[];
const day = (d: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${d}T12:00:00`));
const credits = (k: string) => (k ? `${Number(k).toLocaleString('en-US')}k` : '—');
const TODAY = new Date().toISOString().slice(0, 10);

/** What each step needs before you can move on. */
function check(step: number, f: JobForm): Errors {
  const e: Errors = [];
  if (step === 0) {
    if (!f.title.trim()) e.push({ id: 'nj-title', text: 'Enter a job title' });
    if (!f.team) e.push({ id: 'nj-team', text: 'Choose a team' });
    if (!f.level) e.push({ id: 'nj-level', text: 'Choose a level' });
    if (!(f.openings >= 1 && f.openings <= 50)) e.push({ id: 'nj-openings', text: 'Openings must be between 1 and 50' });
    if (f.reason === 'Backfill' && !f.backfillFor.trim()) e.push({ id: 'nj-backfill', text: 'Say who this job backfills' });
    if (!f.hiringManager) e.push({ id: 'nj-hm', text: 'Choose a hiring manager' });
    if (f.closes && f.closes <= TODAY) e.push({ id: 'nj-closes', text: 'Applications must close after today' });
    if (f.start && f.closes && f.start < f.closes) e.push({ id: 'nj-start', text: 'Target start must be after applications close' });
  }
  if (step === 1) {
    if (f.arrangement !== 'Remote' && f.locations.length === 0) e.push({ id: 'nj-loc-0', text: 'Choose at least one location' });
    if (f.arrangement === 'Remote' && f.regions.length === 0) e.push({ id: 'nj-reg-0', text: 'Choose at least one region people can work from' });
  }
  if (step === 2) {
    const lo = Number(f.payMin), hi = Number(f.payMax);
    if (!f.payMin || !(lo > 0)) e.push({ id: 'nj-paymin', text: 'Enter the bottom of the pay range' });
    if (!f.payMax || !(hi > 0)) e.push({ id: 'nj-paymax', text: 'Enter the top of the pay range' });
    else if (lo > 0 && hi < lo) e.push({ id: 'nj-paymax', text: 'The top of the range must be at least the bottom' });
    if (!f.summary.trim()) e.push({ id: 'nj-summary', text: 'Write a short summary of the job' });
  }
  if (step === 3 && f.chain.length === 0) e.push({ id: 'nj-add', text: 'Add at least one approver' });
  return e;
}

/**
 * Create job: five steps, one at a time, with a stepper you can use to go back.
 * Each step is checked before moving on; the review step submits the job for
 * approval. A draft can be saved from any step and picked up later.
 */
export default function NewJob() {
  const me = person(useMe());
  const nav = useNavigate();
  const [params] = useSearchParams();
  const draftId = params.get('draft') ?? undefined;
  const drafts = useCreatedJobs();
  const draft = drafts.find((j) => j.reqId === draftId);
  const [f, setF] = useState<JobForm>(() => draft?.form ?? blankForm(me.role === 'Recruiter' ? me.name : RECRUITERS[0]));
  const [added, setAdded] = useState<string[]>(() => (draft?.form.chain ?? []).filter((n) => !requiredApprovers(draft!.form).some((r) => r.name === n)));
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(draft ? STEPS.length - 1 : 0);
  const [errors, setErrors] = useState<Errors>([]);
  const [said, setSaid] = useState('');
  const h = usePageTitle(`${draft ? 'Edit draft' : 'Create a job'} · Jobs · Internal ATS`);
  const stepHead = useRef<HTMLHeadingElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const set = <K extends keyof JobForm>(k: K, v: JobForm[K]) => setF((p) => {
    const next = { ...p, [k]: v };
    return { ...next, chain: syncChain(next, added) };
  });
  // Keep the approver list right from the start (a fresh form needs the policy's people).
  useEffect(() => { setF((p) => ({ ...p, chain: syncChain(p, added) })); }, [added]);

  // Move focus to the step's heading when the step changes (not on first load).
  useEffect(() => { if (first.current) { first.current = false; return; } stepHead.current?.focus(); }, [step]);
  useEffect(() => { if (errors.length) summary.current?.focus(); }, [errors]);
  useEffect(() => { if (!said) return; const t = setTimeout(() => setSaid(''), 5000); return () => clearTimeout(t); }, [said]);

  const go = (to: number) => { setErrors([]); setStep(to); setReached((r) => Math.max(r, to)); };
  const next = () => {
    const e = check(step, f);
    setErrors(e);
    if (!e.length) go(step + 1);
  };
  const err = (id: string) => errors.find((e) => e.id === id)?.text;
  const draftSave = () => {
    const j = saveDraft(f, me.name, draft?.reqId);
    nav(`${BASE}/${j.reqId}`, { state: { said: `Saved ${j.title} as a draft.` } });
  };
  const submit = () => {
    for (let s = 0; s < 4; s++) {
      const e = check(s, f);
      if (e.length) { setStep(s); setErrors(e); return; }
    }
    const j = submitForApproval(f, me.name, draft?.reqId);
    nav(`${BASE}/${j.reqId}`, { state: { said: `${j.title} was sent for approval. ${j.approvals!.mode === 'In order' ? `${j.approvals!.steps[0].name} is first.` : 'Everyone can approve now.'}` } });
  };

  return (
    <div className="ca-page nj">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to={BASE}>Jobs</Link></li>
          <li><span aria-current="page">{draft ? `Edit ${draft.title}` : 'Create a job'}</span></li>
        </ol>
      </nav>
      <header className="ca-head">
        <div>
          <h1 ref={h} tabIndex={-1} className="ca-title">{draft ? 'Finish your draft' : 'Create a job'}</h1>
          <p className="ca-sub">Describe the job, where it’s based and what it pays, then send it for approval. It’s posted once everyone has approved.</p>
        </div>
      </header>

      <div className="nj-grid">
        <nav className="nj-steps" aria-label="Steps">
          <ol>
            {STEPS.map((s, i) => {
              const state = i === step ? 'current' : i < reached ? 'done' : i === reached ? 'visited' : 'todo';
              return (
                <li key={s} className={`nj-step is-${state}`}>
                  <button type="button" className="nj-step__btn" aria-current={i === step ? 'step' : undefined} disabled={i > reached}
                    onClick={() => i !== step && go(i)}>
                    <span className="nj-step__dot" aria-hidden="true">{state === 'done' ? <svg viewBox="0 0 16 16"><path d="m3.5 8.5 3 3 6-7" /></svg> : i + 1}</span>
                    <span className="nj-step__label">{s}{state === 'done' && <span className="visually-hidden"> (done)</span>}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="nj-panel" aria-labelledby="nj-step-h">
          <p className="nj-count">Step {step + 1} of {STEPS.length}</p>
          <h2 id="nj-step-h" ref={stepHead} tabIndex={-1} className="nj-h">{STEPS[step]}</h2>

          {errors.length > 0 && (
            <div ref={summary} tabIndex={-1} className="nj-errors" role="alert" aria-labelledby="nj-err-h">
              <p id="nj-err-h" className="nj-errors__h">{errors.length === 1 ? 'There’s 1 thing to fix' : `There are ${errors.length} things to fix`}</p>
              <ul>{errors.map((e) => <li key={e.id}><a href={`#${e.id}`} onClick={(ev) => { ev.preventDefault(); const el = document.getElementById(e.id); el?.focus(); el?.scrollIntoView({ block: 'center' }); }}>{e.text}</a></li>)}</ul>
            </div>
          )}

          <form className="nj-form" noValidate onSubmit={(e) => { e.preventDefault(); if (step < STEPS.length - 1) next(); else submit(); }}>
            {step === 0 && <Basics f={f} set={set} err={err} />}
            {step === 1 && <Location f={f} set={set} err={err} />}
            {step === 2 && <Pay f={f} set={set} err={err} />}
            {step === 3 && <Approvers f={f} setF={setF} setAdded={setAdded} err={err} />}
            {step === 4 && <Review f={f} go={go} />}

            <div className="nj-actions">
              {step > 0 && <button type="button" className="btn btn--secondary" onClick={() => go(step - 1)}>Back</button>}
              <span className="nj-actions__end">
                <button type="button" className="btn btn--ghost" onClick={draftSave}>Save draft</button>
                {step < STEPS.length - 1
                  ? <button type="submit" className="btn btn--primary">Continue</button>
                  : <button type="submit" className="btn btn--primary">Submit for approval</button>}
              </span>
            </div>
          </form>
        </section>
      </div>
      <span className="visually-hidden" role="status">{said}</span>
    </div>
  );
}

type StepProps = { f: JobForm; set: <K extends keyof JobForm>(k: K, v: JobForm[K]) => void; err: (id: string) => string | undefined };

/** A labelled field with an optional hint and error, wired up for screen readers. */
function Field({ id, label, hint, error, optional, children, wide }: { id: string; label: string; hint?: ReactNode; error?: string; optional?: boolean; children: (aria: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode; wide?: boolean }) {
  const desc = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${wide ? ' nj-wide' : ''}`}>
      <label className="field__label nj-label" htmlFor={id}>{label}{optional && <span className="field__opt"> (optional)</span>}</label>
      {hint && <p id={`${id}-hint`} className="nj-hint">{hint}</p>}
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': desc })}
      {error && <p id={`${id}-err`} className="field__error">{error}</p>}
    </div>
  );
}

/** Library Select with the same label / error wiring as Field. */
function Pick({ id, label, value, options, onChange, error, placeholder }: { id: string; label: string; value: string; options: string[]; onChange: (v: string) => void; error?: string; placeholder?: string }) {
  return (
    <div className="field nj-select">
      <Select label={label} value={value} buttonId={id} placeholder={placeholder ?? 'Choose one'} invalid={!!error}
        describedBy={error ? `${id}-err` : undefined} options={options.map((o) => ({ value: o, label: o }))} onChange={onChange} />
      {error && <p id={`${id}-err`} className="field__error">{error}</p>}
    </div>
  );
}

/* ---------- Step 1: Basics ---------- */

function Basics({ f, set, err }: StepProps) {
  return (
    <>
      <div className="nj-row">
        <Field id="nj-title" label="Job title" error={err('nj-title')} wide>{(a) => <input {...a} value={f.title} onChange={(e) => set('title', e.target.value)} autoComplete="off" />}</Field>
      </div>
      <div className="nj-row nj-row--3">
        <Pick id="nj-team" label="Team" value={f.team} options={TEAMS} onChange={(v) => set('team', v)} error={err('nj-team')} />
        <Pick id="nj-level" label="Level" value={f.level} options={LEVELS} onChange={(v) => set('level', v)} error={err('nj-level')} />
        <Field id="nj-openings" label="Openings" error={err('nj-openings')}>{(a) => <input {...a} type="number" min={1} max={50} inputMode="numeric" value={f.openings} onChange={(e) => set('openings', Number(e.target.value))} />}</Field>
      </div>

      <fieldset className="nj-set">
        <legend className="nj-label">Employment type</legend>
        <div className="nj-cards nj-cards--4">
          {EMPLOYMENT.map((t) => <ChoiceCard key={t} compact name="nj-type" value={t} checked={f.employment === t} onChange={() => set('employment', t)} title={t} />)}
        </div>
      </fieldset>

      <fieldset className="nj-set">
        <legend className="nj-label">Why are you hiring?</legend>
        <div className="nj-cards nj-cards--2">
          <ChoiceCard compact name="nj-reason" value="New headcount" checked={f.reason === 'New headcount'} onChange={() => set('reason', 'New headcount')} title="New headcount" description="A role that doesn’t exist yet" />
          <ChoiceCard compact name="nj-reason" value="Backfill" checked={f.reason === 'Backfill'} onChange={() => set('reason', 'Backfill')} title="Backfill" description="Replacing someone who left or moved" />
        </div>
        {f.reason === 'Backfill' && (
          <div className="nj-row nj-follow">
            <Field id="nj-backfill" label="Who does this replace?" error={err('nj-backfill')}>{(a) => <input {...a} value={f.backfillFor} onChange={(e) => set('backfillFor', e.target.value)} />}</Field>
          </div>
        )}
      </fieldset>

      <div className="nj-row nj-row--2">
        <Pick id="nj-hm" label="Hiring manager" value={f.hiringManager} options={MANAGERS} onChange={(v) => set('hiringManager', v)} error={err('nj-hm')} placeholder="Choose a person" />
        <Pick id="nj-rec" label="Recruiter" value={f.recruiter} options={RECRUITERS} onChange={(v) => set('recruiter', v)} />
      </div>
      <div className="nj-row nj-row--2">
        <Field id="nj-closes" label="Applications close" optional hint="Leave empty to keep it open until filled" error={err('nj-closes')}>{(a) => <input {...a} type="date" min={TODAY} value={f.closes} onChange={(e) => set('closes', e.target.value)} />}</Field>
        <Field id="nj-start" label="Target start date" optional error={err('nj-start')}>{(a) => <input {...a} type="date" min={TODAY} value={f.start} onChange={(e) => set('start', e.target.value)} />}</Field>
      </div>
    </>
  );
}

/* ---------- Step 2: Location ---------- */

const ICON = {
  'On site': <svg viewBox="0 0 16 16"><path d="M2.5 14V6.5L8 2.5l5.5 4V14z" /><path d="M6.5 14v-4h3v4" /></svg>,
  Hybrid: <svg viewBox="0 0 16 16"><path d="M1.5 14V8l3.5-2.5L8.5 8v6z" /><rect x="9.5" y="5" width="5" height="9" rx="1" /></svg>,
  Remote: <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" /><path d="M2.5 8h11M8 2.5c1.6 1.6 2.4 3.4 2.4 5.5S9.6 11.9 8 13.5M8 2.5C6.4 4.1 5.6 5.9 5.6 8s.8 3.9 2.4 5.5" /></svg>,
};

function Location({ f, set, err }: StepProps) {
  const toggle = (list: string[], v: string, on: boolean) => (on ? [...list, v] : list.filter((x) => x !== v));
  return (
    <>
      <fieldset className="nj-set">
        <legend className="nj-label">Where will they work?</legend>
        <div className="nj-cards nj-cards--3">
          <ChoiceCard name="nj-arr" value="On site" icon={ICON['On site']} checked={f.arrangement === 'On site'} onChange={() => set('arrangement', 'On site')} title="On site" description="Every day at one of the locations you choose" />
          <ChoiceCard name="nj-arr" value="Hybrid" icon={ICON.Hybrid} checked={f.arrangement === 'Hybrid'} onChange={() => set('arrangement', 'Hybrid')} title="Hybrid" description="Some days on site, the rest from anywhere" />
          <ChoiceCard name="nj-arr" value="Remote" icon={ICON.Remote} checked={f.arrangement === 'Remote'} onChange={() => set('arrangement', 'Remote')} title="Remote" description="Fully remote, within the regions you choose" />
        </div>
      </fieldset>

      {f.arrangement !== 'Remote' ? (
        <fieldset className="nj-set" aria-describedby={err('nj-loc-0') ? 'nj-loc-err' : 'nj-loc-hint'}>
          <legend className="nj-label">Locations</legend>
          <p id="nj-loc-hint" className="nj-hint">Choose every location this job can be based at. Candidates pick one when they apply.</p>
          {err('nj-loc-0') && <p id="nj-loc-err" className="field__error">{err('nj-loc-0')}</p>}
          <div className="nj-cards nj-cards--3 nj-locs">
            {LOCATIONS.map((l, i) => (
              <span key={l.id} className="nj-cardwrap" id={i === 0 ? 'nj-loc-0' : undefined} tabIndex={i === 0 ? -1 : undefined}>
                <ChoiceCard type="checkbox" compact name="nj-loc" value={l.id} checked={f.locations.includes(l.id)} onChange={(on) => set('locations', toggle(f.locations, l.id, on))} title={l.name} description={l.where} />
              </span>
            ))}
          </div>
          <p className="nj-count-line" aria-live="polite">{f.locations.length ? `${f.locations.length} chosen: ${locationLabel(f)}` : 'None chosen yet'}</p>
          {f.arrangement === 'Hybrid' && (
            <div className="nj-row nj-row--2 nj-follow">
              <Pick id="nj-days" label="Days on site each week" value={String(f.daysOnSite)} options={['1', '2', '3', '4']} onChange={(v) => set('daysOnSite', Number(v))} />
            </div>
          )}
          <label className="check nj-check"><input type="checkbox" checked={f.relocation} onChange={(e) => set('relocation', e.target.checked)} /> Relocation support offered</label>
        </fieldset>
      ) : (
        <>
          <fieldset className="nj-set" aria-describedby={err('nj-reg-0') ? 'nj-reg-err' : 'nj-reg-hint'}>
            <legend className="nj-label">Regions people can work from</legend>
            <p id="nj-reg-hint" className="nj-hint">Limit this to where you can pay and support people.</p>
            {err('nj-reg-0') && <p id="nj-reg-err" className="field__error">{err('nj-reg-0')}</p>}
            <div className="nj-cards nj-cards--5">
              {REGIONS.map((r, i) => (
                <span key={r} className="nj-cardwrap" id={i === 0 ? 'nj-reg-0' : undefined} tabIndex={i === 0 ? -1 : undefined}>
                  <ChoiceCard type="checkbox" compact name="nj-reg" value={r} checked={f.regions.includes(r)} onChange={(on) => set('regions', toggle(f.regions, r, on))} title={r} />
                </span>
              ))}
            </div>
          </fieldset>
          <div className="nj-row nj-row--2">
            <Pick id="nj-overlap" label="Working hours overlap" value={f.overlap} options={OVERLAP} onChange={(v) => set('overlap', v)} />
          </div>
        </>
      )}
      <div className="nj-row nj-row--2">
        <Pick id="nj-travel" label="Travel" value={f.travel} options={TRAVEL} onChange={(v) => set('travel', v)} />
      </div>
    </>
  );
}

/* ---------- Step 3: Pay and description ---------- */

function Pay({ f, set, err }: StepProps) {
  const band = BANDS[f.level];
  const over = band && Number(f.payMax) > band[1];
  const under = band && f.payMin && Number(f.payMin) < band[0];
  return (
    <>
      <fieldset className="nj-set">
        <legend className="nj-label">Pay range, in thousands of credits a year</legend>
        {band && <p className="nj-hint" id="nj-band">The {f.level} band is {credits(String(band[0]))}–{credits(String(band[1]))}. A range above the band needs executive approval.</p>}
        <div className="nj-row nj-row--pay">
          <Field id="nj-paymin" label="From" error={err('nj-paymin')}>{(a) => <span className="nj-affix"><input {...a} type="number" min={0} inputMode="numeric" value={f.payMin} onChange={(e) => set('payMin', e.target.value)} /><span aria-hidden="true">k</span></span>}</Field>
          <span className="nj-dash" aria-hidden="true">–</span>
          <Field id="nj-paymax" label="To" error={err('nj-paymax')}>{(a) => <span className="nj-affix"><input {...a} type="number" min={0} inputMode="numeric" value={f.payMax} onChange={(e) => set('payMax', e.target.value)} /><span aria-hidden="true">k</span></span>}</Field>
        </div>
        {(over || under) && <p className="tal-warn nj-note" role="note">{over ? `This range goes above the ${f.level} band, so Leia Organa will be added as an approver.` : `This range starts below the ${f.level} band. Check it with your people partner.`}</p>}
        <label className="check nj-check"><input type="checkbox" checked={f.showPay} onChange={(e) => set('showPay', e.target.checked)} /> Show the pay range on the job posting</label>
      </fieldset>

      <Field id="nj-summary" label="Summary" hint="Two or three sentences candidates see first" error={err('nj-summary')} wide>{(a) => <textarea {...a} rows={3} value={f.summary} onChange={(e) => set('summary', e.target.value)} />}</Field>
      <Field id="nj-resp" label="What they’ll do" optional hint="One per line" wide>{(a) => <textarea {...a} rows={4} value={f.responsibilities} onChange={(e) => set('responsibilities', e.target.value)} />}</Field>
      <Field id="nj-req" label="What they need" optional hint="One per line" wide>{(a) => <textarea {...a} rows={4} value={f.requirements} onChange={(e) => set('requirements', e.target.value)} />}</Field>
      <div className="nj-row nj-row--2">
        <Pick id="nj-oa" label="Online assessment" value={f.workflow || 'None'} options={['None', ...WORKFLOWS]} onChange={(v) => set('workflow', v === 'None' ? '' : v)} />
      </div>
    </>
  );
}

/* ---------- Step 4: Approvers ---------- */

function Approvers({ f, setF, setAdded, err }: { f: JobForm; setF: (u: (p: JobForm) => JobForm) => void; setAdded: (u: (p: string[]) => string[]) => void; err: StepProps['err'] }) {
  const id = useId();
  const req = requiredApprovers(f);
  const [pick, setPick] = useState('');
  const [said, setSaid] = useState('');
  const others = DIRECTORY.filter((p) => !f.chain.includes(p.name)).map((p) => p.name);
  const move = (i: number, by: -1 | 1) => {
    const j = i + by;
    if (j < 0 || j >= f.chain.length) return;
    const chain = [...f.chain];
    [chain[i], chain[j]] = [chain[j], chain[i]];
    setF((p) => ({ ...p, chain }));
    setSaid(`${chain[j]} moved to ${j + 1} of ${chain.length}.`);
    requestAnimationFrame(() => document.getElementById(`${id}-${chain[j]}-${by < 0 ? 'up' : 'down'}`)?.focus());
  };
  const remove = (name: string) => {
    setAdded((a) => a.filter((n) => n !== name));
    setF((p) => ({ ...p, chain: p.chain.filter((n) => n !== name) }));
    setSaid(`Removed ${name}.`);
    requestAnimationFrame(() => document.getElementById('nj-add')?.focus());
  };
  const add = () => {
    if (!pick) return;
    setAdded((a) => [...a, pick]);
    setF((p) => ({ ...p, chain: [...p.chain, pick] }));
    setSaid(`Added ${pick} as approver ${f.chain.length + 1}.`);
    setPick('');
  };
  return (
    <>
      <p className="nj-lede">These people approve the job before it’s posted. Some are required by policy, based on what you’ve entered; you can add others and change the order.</p>

      <fieldset className="nj-set">
        <legend className="nj-label">How should they approve?</legend>
        <div className="nj-cards nj-cards--2">
          <ChoiceCard compact name="nj-mode" value="In order" checked={f.approvalMode === 'In order'} onChange={() => setF((p) => ({ ...p, approvalMode: 'In order' }))} title="One after another" description="Each person is asked once the one before has approved" />
          <ChoiceCard compact name="nj-mode" value="All at once" checked={f.approvalMode === 'All at once'} onChange={() => setF((p) => ({ ...p, approvalMode: 'All at once' }))} title="All at once" description="Everyone is asked together; faster, but no hand-offs" />
        </div>
      </fieldset>

      <ol className="nj-chain" aria-label="Approvers">
        {f.chain.map((name, i) => {
          const r = req.find((x) => x.name === name);
          return (
            <li key={name} className="nj-approver">
              <span className="nj-approver__n" aria-hidden="true">{f.approvalMode === 'In order' ? i + 1 : '•'}</span>
              <span className="tal-avatar nj-approver__av" aria-hidden="true">{name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
              <span className="nj-approver__who">
                <strong>{name}</strong>
                <span className="cell-sub">{who(name).title}</span>
              </span>
              <span className={`nj-why${r ? '' : ' is-added'}`}>{r ? `Required: ${r.why}` : 'Added by you'}</span>
              <span className="nj-approver__tools">
                {f.approvalMode === 'In order' && <>
                  <button type="button" id={`${id}-${name}-up`} className="nj-icon" aria-label={`Move ${name} up`} aria-disabled={i === 0 || undefined} onClick={() => move(i, -1)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 10 4-4 4 4" /></svg></button>
                  <button type="button" id={`${id}-${name}-down`} className="nj-icon" aria-label={`Move ${name} down`} aria-disabled={i === f.chain.length - 1 || undefined} onClick={() => move(i, 1)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg></button>
                </>}
                {r
                  ? <span className="nj-lock" title="Required by policy"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.2" /><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" /></svg><span className="visually-hidden">Required, can’t be removed</span></span>
                  : <button type="button" className="nj-icon" aria-label={`Remove ${name}`} onClick={() => remove(name)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg></button>}
              </span>
            </li>
          );
        })}
      </ol>
      <span className="visually-hidden" role="status">{said}</span>

      <div className="nj-addrow">
        <div className="field nj-select">
          <Select label="Add an approver" buttonId="nj-add" value={pick} placeholder="Choose a person" invalid={!!err('nj-add')}
            options={others.map((n) => ({ value: n, label: `${n} · ${who(n).title}` }))} onChange={setPick} />
        </div>
        <button type="button" className="btn btn--secondary" aria-disabled={!pick || undefined} onClick={add}>Add</button>
      </div>

      <details className="nj-policy">
        <summary>Who’s required, and when</summary>
        <ul>
          <li><strong>Hiring manager</strong>: always.</li>
          <li><strong>Amilyn Holdo</strong>, finance: always, to approve the budget.</li>
          <li><strong>Bail Organa</strong>, people partner: always, to check level, title and pay.</li>
          <li><strong>Leia Organa</strong>, executive sponsor: for L6 and above, 4 or more openings, or pay above the band.</li>
        </ul>
      </details>
    </>
  );
}

/* ---------- Step 5: Review ---------- */

function Review({ f, go }: { f: JobForm; go: (s: number) => void }) {
  const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
  const Section = ({ i, children }: { i: number; children: ReactNode }) => (
    <section className="nj-review" aria-labelledby={`nj-rv-${i}`}>
      <div className="nj-review__head">
        <h3 id={`nj-rv-${i}`} className="nj-review__h">{STEPS[i]}</h3>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => go(i)}>Edit<span className="visually-hidden"> {STEPS[i].toLowerCase()}</span></button>
      </div>
      {children}
    </section>
  );
  return (
    <>
      <p className="nj-lede">Check everything before you send it. You can still save it as a draft.</p>
      <Section i={0}>
        <dl className="nj-dl">
          <div><dt>Job title</dt><dd>{f.title}</dd></div>
          <div><dt>Team</dt><dd>{f.team}</dd></div>
          <div><dt>Level</dt><dd>{f.level}</dd></div>
          <div><dt>Type</dt><dd>{f.employment}</dd></div>
          <div><dt>Openings</dt><dd>{f.openings}</dd></div>
          <div><dt>Reason</dt><dd>{f.reason}{f.reason === 'Backfill' ? ` for ${f.backfillFor}` : ''}</dd></div>
          <div><dt>Hiring manager</dt><dd>{f.hiringManager}</dd></div>
          <div><dt>Recruiter</dt><dd>{f.recruiter}</dd></div>
          <div><dt>Applications close</dt><dd>{f.closes ? day(f.closes) : 'When filled'}</dd></div>
          <div><dt>Target start</dt><dd>{f.start ? day(f.start) : 'Not set'}</dd></div>
        </dl>
      </Section>
      <Section i={1}>
        <dl className="nj-dl">
          <div><dt>Arrangement</dt><dd>{f.arrangement}{f.arrangement === 'Hybrid' ? `, ${f.daysOnSite} days on site` : ''}</dd></div>
          {f.arrangement === 'Remote'
            ? <><div><dt>Regions</dt><dd>{f.regions.join(', ')}</dd></div><div><dt>Overlap</dt><dd>{f.overlap}</dd></div></>
            : <><div className="nj-dl__wide"><dt>Locations</dt><dd>{f.locations.map((id) => LOCATIONS.find((l) => l.id === id)?.name).join(', ')}</dd></div><div><dt>Relocation</dt><dd>{f.relocation ? 'Offered' : 'Not offered'}</dd></div></>}
          <div><dt>Travel</dt><dd>{f.travel}</dd></div>
        </dl>
      </Section>
      <Section i={2}>
        <dl className="nj-dl">
          <div><dt>Pay</dt><dd>{credits(f.payMin)}–{credits(f.payMax)} credits a year{f.showPay ? '' : ' (hidden on posting)'}</dd></div>
          <div><dt>Online assessment</dt><dd>{f.workflow || 'None'}</dd></div>
          <div className="nj-dl__wide"><dt>Summary</dt><dd>{f.summary}</dd></div>
          {lines(f.responsibilities).length > 0 && <div className="nj-dl__wide"><dt>What they’ll do</dt><dd><ul>{lines(f.responsibilities).map((l) => <li key={l}>{l}</li>)}</ul></dd></div>}
          {lines(f.requirements).length > 0 && <div className="nj-dl__wide"><dt>What they need</dt><dd><ul>{lines(f.requirements).map((l) => <li key={l}>{l}</li>)}</ul></dd></div>}
        </dl>
      </Section>
      <Section i={3}>
        <p className="nj-hint">{f.approvalMode === 'In order' ? 'One after another, in this order:' : 'All at once:'}</p>
        <ol className="nj-mini-chain">{f.chain.map((n) => <li key={n}><strong>{n}</strong> · {who(n).title}</li>)}</ol>
      </Section>
    </>
  );
}
