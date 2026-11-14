import { peek, put, useStored } from '../store';
import { JOBS, type Job } from './jobs';

/*
  Creating a job: the form behind the Create job flow, the choices it offers,
  who has to approve a job, and saving new jobs (drafts and jobs waiting for
  approval) next to the sample ones.
*/

export const TEAMS = ['Starfighter Corps', 'Hangar Operations', 'Alliance Intelligence', 'Medical Corps', 'Fleet Operations', 'Engineering Corps'];
export const LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];
export const EMPLOYMENT = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;
export const RECRUITERS = ['Hera Syndulla', 'Mon Mothma', 'Jyn Erso'];
export const WORKFLOWS = ['Starfighter Pilot L4', 'Hangar Mechanic L3', 'Intelligence Analyst L5', 'Field Medic L2'];

export const LOCATIONS = [
  { id: 'home-one', name: 'Home One', where: 'Fleet flagship, Mon Cala orbit' },
  { id: 'yavin', name: 'Yavin 4', where: 'Great Temple base' },
  { id: 'echo', name: 'Echo Base', where: 'Hoth' },
  { id: 'hanna', name: 'Hanna City', where: 'Chandrila' },
  { id: 'hosnian', name: 'Hosnian Prime', where: 'New Republic capital' },
  { id: 'dqar', name: 'D’Qar base', where: 'Ileenium system' },
  { id: 'coruscant', name: 'Coruscant', where: 'Galactic City' },
  { id: 'ajan', name: 'Ajan Kloss', where: 'Jungle base' },
  { id: 'redemption', name: 'Redemption', where: 'Medical frigate, fleet' },
];
export const REGIONS = ['Core Worlds', 'Colonies', 'Inner Rim', 'Mid Rim', 'Outer Rim'];
export const OVERLAP = ['None required', '4 hours with Galactic Standard Time', '4 hours with Yavin Base Time', '4 hours with Mon Cal Standard Time'];
export const TRAVEL = ['None', 'Up to 10%', 'Up to 25%', 'Up to 50%'];

/** Pay bands by level, in thousands of credits a year. */
export const BANDS: Record<string, [number, number]> = {
  L1: [38, 50], L2: [46, 62], L3: [55, 74], L4: [64, 88], L5: [78, 108], L6: [96, 134], L7: [120, 170],
};

export interface Person { name: string; title: string }
/** Everyone who can approve a job. */
export const DIRECTORY: Person[] = [
  { name: 'Admiral Ackbar', title: 'Fleet Admiral, Starfighter Corps' },
  { name: 'Rose Tico', title: 'Lead, Hangar Operations' },
  { name: 'Cassian Andor', title: 'Captain, Alliance Intelligence' },
  { name: 'Kalonia', title: 'Chief Medical Officer' },
  { name: 'Lando Calrissian', title: 'General, Fleet Operations' },
  { name: 'Davits Draven', title: 'General, Alliance Intelligence' },
  { name: 'Amilyn Holdo', title: 'Vice Admiral, Finance and fleet budget' },
  { name: 'Bail Organa', title: 'People partner' },
  { name: 'Leia Organa', title: 'General, executive sponsor' },
];
export const MANAGERS = DIRECTORY.filter((p) => !['Amilyn Holdo', 'Bail Organa', 'Leia Organa'].includes(p.name)).map((p) => p.name);
export const who = (name: string) => DIRECTORY.find((p) => p.name === name) ?? { name, title: '' };

export interface JobForm {
  title: string; team: string; level: string; employment: (typeof EMPLOYMENT)[number]; openings: number;
  reason: 'New headcount' | 'Backfill'; backfillFor: string;
  hiringManager: string; recruiter: string; start: string; closes: string;
  arrangement: 'On site' | 'Hybrid' | 'Remote'; locations: string[]; daysOnSite: number;
  regions: string[]; overlap: string; relocation: boolean; travel: string;
  payMin: string; payMax: string; showPay: boolean;
  summary: string; responsibilities: string; requirements: string; workflow: string;
  approvalMode: 'In order' | 'All at once';
  /** Approvers, in order. Required ones are kept in sync with the policy. */
  chain: string[];
}

export const blankForm = (recruiter: string): JobForm => ({
  title: '', team: '', level: '', employment: 'Full-time', openings: 1, reason: 'New headcount', backfillFor: '',
  hiringManager: '', recruiter, start: '', closes: '',
  arrangement: 'On site', locations: [], daysOnSite: 3, regions: [], overlap: OVERLAP[0], relocation: false, travel: 'None',
  payMin: '', payMax: '', showPay: true, summary: '', responsibilities: '', requirements: '', workflow: '',
  approvalMode: 'In order', chain: [],
});

/* ---------- Who has to approve ---------- */

export interface Required { name: string; why: string }
/** Approvers the policy requires for this job, and why. */
export function requiredApprovers(f: JobForm): Required[] {
  const req: Required[] = [];
  if (f.hiringManager) req.push({ name: f.hiringManager, why: 'Hiring manager' });
  req.push({ name: 'Amilyn Holdo', why: 'Budget' });
  req.push({ name: 'Bail Organa', why: 'Level, title and pay' });
  const lvl = Number(f.level.slice(1));
  const band = BANDS[f.level];
  const overBand = band && Number(f.payMax) > band[1];
  const reasons = [lvl >= 6 && `${f.level} and above`, f.openings >= 4 && '4 or more openings', overBand && 'Pay above the band'].filter(Boolean);
  if (reasons.length) req.push({ name: 'Leia Organa', why: reasons.join(' · ') });
  return req.filter((r, i, all) => all.findIndex((x) => x.name === r.name) === i);
}

/** Keep the chain in step with the policy: add newly required people, drop ones no longer required (unless added by hand). */
export function syncChain(f: JobForm, added: string[]): string[] {
  const req = requiredApprovers(f).map((r) => r.name);
  const keep = f.chain.filter((n) => req.includes(n) || added.includes(n));
  const missing = req.filter((n) => !keep.includes(n));
  // The hiring manager goes first when newly added; other required people join at the end.
  const hm = missing.includes(f.hiringManager) ? [f.hiringManager] : [];
  return [...hm, ...keep, ...missing.filter((n) => n !== f.hiringManager)];
}

/* ---------- Saving jobs ---------- */

export type StepStatus = 'Approved' | 'Waiting' | 'Not started' | 'Sent back';
export interface ApprovalStep { name: string; title: string; why: string; status: StepStatus; at?: string; note?: string }
export interface Approvals { mode: JobForm['approvalMode']; submittedBy: string; submittedAt: string; steps: ApprovalStep[] }

export interface CreatedJob extends Job { form: JobForm; approvals?: Approvals; createdBy: string; createdAt: string }

const KEY = 'hiring:v1:created-jobs';
export const useCreatedJobs = () => useStored<CreatedJob[]>(KEY, () => [])[0];
const created = () => peek<CreatedJob[]>(KEY) ?? [];
const now = () => new Date().toISOString();
const today = () => now().slice(0, 10);

/** Sample jobs plus anything made with Create job, newest first among the new ones. */
export function useAllJobs(): (Job | CreatedJob)[] {
  const mine = useCreatedJobs();
  return [...mine, ...JOBS];
}
export const isCreated = (j: Job): j is CreatedJob => 'form' in j;

function nextReqId() {
  const n = Math.max(...[...JOBS, ...created()].map((j) => Number(j.reqId.split('-')[1]))) + 1;
  return `REQ-${n}`;
}

export function locationLabel(f: JobForm) {
  if (f.arrangement === 'Remote') return f.regions.length ? `Remote · ${f.regions.join(', ')}` : 'Remote';
  const names = f.locations.map((id) => LOCATIONS.find((l) => l.id === id)?.name ?? id);
  const where = names.length > 2 ? `${names[0]} + ${names.length - 1} more` : names.join(' or ');
  return `${f.arrangement === 'Hybrid' ? 'Hybrid · ' : ''}${where || 'No location yet'}`;
}

const zero = { Applied: 0, Screening: 0, Assessment: 0, Interview: 0, Offer: 0, Hired: 0 };

function toJob(f: JobForm, reqId: string, status: Job['status'], by: string, prev?: CreatedJob): CreatedJob {
  return {
    reqId, title: f.title.trim() || 'Untitled job', team: f.team || '—', location: locationLabel(f), level: f.level || '—',
    openings: f.openings, recruiter: f.recruiter, hiringManager: f.hiringManager || '—', opened: prev?.opened ?? today(),
    closes: f.closes || undefined, status, workflow: f.workflow || undefined, pipeline: { ...zero },
    form: f, createdBy: prev?.createdBy ?? by, createdAt: prev?.createdAt ?? now(),
  };
}

function upsert(job: CreatedJob) {
  const rest = created().filter((j) => j.reqId !== job.reqId);
  put(KEY, [job, ...rest]);
}

export function saveDraft(f: JobForm, by: string, reqId?: string): CreatedJob {
  const prev = created().find((j) => j.reqId === reqId);
  const job = toJob(f, reqId ?? nextReqId(), 'Draft', by, prev);
  upsert(job);
  return job;
}

export function submitForApproval(f: JobForm, by: string, reqId?: string): CreatedJob {
  const prev = created().find((j) => j.reqId === reqId);
  const req = requiredApprovers(f);
  const job = toJob(f, reqId ?? nextReqId(), 'Pending approval', by, prev);
  job.approvals = {
    mode: f.approvalMode, submittedBy: by, submittedAt: now(),
    steps: f.chain.map((name, i) => ({
      name, title: who(name).title, why: req.find((r) => r.name === name)?.why ?? 'Added by you',
      status: f.approvalMode === 'All at once' || i === 0 ? 'Waiting' : 'Not started',
    })),
  };
  upsert(job);
  return job;
}

/** Record a decision on one approval step and move the job on. */
export function decide(reqId: string, name: string, decision: 'Approved' | 'Sent back', note = '') {
  const job = created().find((j) => j.reqId === reqId);
  if (!job?.approvals) return;
  const steps = job.approvals.steps.map((s) => (s.name === name ? { ...s, status: decision, at: now(), note: note || undefined } : s));
  if (decision === 'Approved' && job.approvals.mode === 'In order') {
    const next = steps.findIndex((s) => s.status === 'Not started');
    if (next >= 0 && !steps.some((s) => s.status === 'Waiting')) steps[next] = { ...steps[next], status: 'Waiting' };
  }
  const allApproved = steps.every((s) => s.status === 'Approved');
  const sentBack = steps.some((s) => s.status === 'Sent back');
  upsert({ ...job, status: allApproved ? 'Open' : sentBack ? 'Draft' : 'Pending approval', opened: allApproved ? today() : job.opened, approvals: { ...job.approvals, steps } });
}

export function deleteDraft(reqId: string) { put(KEY, created().filter((j) => j.reqId !== reqId)); }
