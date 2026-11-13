import type { Application, Talent } from './talent';

/*
  What the profile sheet shows beyond the card: a resume and interview history.
  Wedge's are written out in full. For everyone else they are built from their
  own record (experience, education, skills and applications), so each person's
  resume and interviews match the rest of their profile.
*/

export interface ResumeRole { title: string; org: string; dates: string; location: string; bullets: string[] }
export interface Resume {
  file: string;
  uploaded: string;
  summary: string;
  roles: ResumeRole[];
  education: { line: string; detail: string }[];
  certifications: string[];
  skills: string[];
}

export type Rating = 'Strong yes' | 'Yes' | 'No' | 'Strong no';
export interface Interviewer { name: string; role: string; rating?: Rating; note?: string }
export interface Interview {
  id: string;
  reqId: string;
  job: string;
  round: string;
  date: string;
  time: string;
  minutes: number;
  format: 'Video' | 'On site' | 'Phone' | 'Simulator';
  status: 'Completed' | 'Scheduled' | 'Cancelled';
  outcome?: 'Advanced' | 'Not advanced' | 'Hire' | 'No hire' | 'Withdrew';
  interviewers: Interviewer[];
  summary?: string;
}

const month = (ym: string) => new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(`${ym}-15T12:00:00`));
const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const first = (name: string) => name.split(' ')[0];

type Family = 'pilot' | 'mechanic' | 'analyst';
const family = (text: string): Family =>
  /mechanic|technician|droid|salvage|engineer|repair/i.test(text) ? 'mechanic'
    : /intelligence|analyst|signals|operations planner|reconnaissance|information|antiquit/i.test(text) ? 'analyst'
      : 'pilot';

/* ---------- Resume ---------- */

const BULLETS: Record<Family, string[]> = {
  pilot: [
    'Flew {n} combat and escort sorties with no loss of wingmates',
    'Led a four-ship flight through convoy escort and fleet defence rotations',
    'Trained {m} new pilots on formation flying and emergency procedures',
    'Kept a 98% mission-ready rate across the squadron’s fighters',
    'Planned approach routes and fallback plans for long-range strikes',
    'Coordinated with astromech and deck crews to cut turnaround time by a third',
  ],
  mechanic: [
    'Kept {n} starfighters flight-ready with a 96% availability rate',
    'Rebuilt engines and hyperdrive motivators from salvaged parts',
    'Cut average repair turnaround from 3 days to under 1',
    'Trained {m} apprentices on diagnostics and safety procedures',
    'Ran parts inventory and sourcing for a busy hangar',
    'Wrote the checklist the crew still uses for pre-flight inspections',
  ],
  analyst: [
    'Turned intercepted signals into {n} actionable briefings for command',
    'Mapped supply and contact networks across {m} star systems',
    'Built a source-rating method adopted by the wider team',
    'Briefed senior officers weekly on threats and opportunities',
    'Planned and ran field collection with small teams under tight timelines',
    'Kept sources and methods safe with strict handling procedures',
  ],
};

const CERTS: Record<Family, string[]> = {
  pilot: ['Advanced starfighter rating', 'Instrument and night flight', 'Emergency ejection and survival'],
  mechanic: ['Hyperdrive systems certification', 'Hangar safety officer', 'Fuel handling and hazmat'],
  analyst: ['Signals intelligence certificate', 'Clearance: Alliance Secret', 'Source handling'],
};

const SUMMARY: Record<Family, (t: Talent, yrs: number) => string> = {
  pilot: (t, yrs) => `${t.headline.split(' · ')[0]} with ${yrs} years of flying in squadrons and fleet postings. Steady under pressure, good with wingmates, and comfortable leading a flight when it matters.`,
  mechanic: (t, yrs) => `${t.headline.split(' · ')[0]} with ${yrs} years keeping ships flying. Fast, careful diagnostics and a habit of fixing the process, not just the part.`,
  analyst: (t, yrs) => `${t.headline.split(' · ')[0]} with ${yrs} years turning scattered information into clear, timely briefings. Discreet, organised and calm on deadline.`,
};

const seed = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);

export function resumeFor(t: Talent): Resume {
  if (t.id === 'TAL-20417') return WEDGE_RESUME;
  const fam = family(`${t.headline} ${t.experience.map((e) => e.title).join(' ')}`);
  const earliest = t.experience.map((e) => Number(e.start.slice(0, 4))).sort()[0] ?? 2020;
  const yrs = Math.max(1, Math.min(40, 2026 - earliest));
  const s = seed(t.id);
  return {
    file: `${t.name.replace(/\s+/g, '_')}_resume.pdf`,
    uploaded: t.added,
    summary: SUMMARY[fam](t, yrs),
    roles: t.experience.map((e, i) => ({
      title: e.title, org: e.org, location: e.location,
      dates: `${month(e.start)} – ${e.end ? month(e.end) : 'Present'}`,
      bullets: [0, 1, 2].map((k) => BULLETS[fam][(s + i * 2 + k * 2) % BULLETS[fam].length]
        .replace('{n}', String(40 + ((s + i) % 7) * 15)).replace('{m}', String(3 + ((s + k) % 9)))),
    })),
    education: t.education.map((e) => ({ line: `${e.credential}, ${e.field}`, detail: `${e.school} · ${e.years}` })),
    certifications: CERTS[fam].slice(0, 2 + (s % 2)),
    skills: t.skills,
  };
}

const WEDGE_RESUME: Resume = {
  file: 'Wedge_Antilles_resume.pdf',
  uploaded: '2026-09-12',
  summary: 'Flight leader with nine years in combat squadrons, from Red Squadron at Yavin to leading Rogue Squadron. Known for keeping wingmates alive, calm radio discipline, and turning new pilots into reliable ones. Looking for a role where I fly and teach.',
  roles: [
    { title: 'Flight Leader', org: 'Rogue Squadron, Alliance Starfighter Corps', dates: 'Apr 2022 – Present', location: 'Hoth and fleet postings', bullets: [
      'Lead a twelve-ship squadron through fleet defence, escort and strike missions',
      'Rebuilt the squadron after heavy losses: recruited and trained eight new pilots in six months',
      'Wrote the squadron’s formation and comms playbook, now used across three squadrons',
      'Flew more than 200 sorties as lead with no friendly-fire incidents',
    ] },
    { title: 'Starfighter Pilot', org: 'Red Squadron, Alliance Starfighter Corps', dates: 'Jun 2019 – Mar 2022', location: 'Yavin 4', bullets: [
      'Flew X-wing escort and attack runs, including the Yavin trench run',
      'One of two Red Squadron pilots to complete every mission of the Yavin campaign',
      'Mentored incoming pilots on simulator and live-fire drills',
    ] },
  ],
  education: [
    { line: 'Flight officer commission, Advanced starfighter tactics', detail: 'Imperial Academy, Skystrike · 2017–2019 (left to join the Alliance)' },
    { line: 'Diploma, Starship systems engineering', detail: 'Corellian Polytechnic · 2014–2017' },
  ],
  certifications: ['Advanced starfighter rating', 'Instrument and night flight', 'Flight instructor, level 2'],
  skills: ['X-wing', 'Formation leadership', 'Trench runs', 'Flight instruction', 'Astromech coordination', 'Squadron rebuilding'],
};

/* ---------- Interviews ---------- */

const PANEL: Record<Family, Interviewer[]> = {
  pilot: [
    { name: 'Admiral Ackbar', role: 'Hiring manager' },
    { name: 'Lando Calrissian', role: 'General, fleet operations' },
    { name: 'Bren Derlin', role: 'Major, base security' },
  ],
  mechanic: [
    { name: 'Rose Tico', role: 'Hiring manager' },
    { name: 'Toryn Farr', role: 'Chief controller, hangar ops' },
  ],
  analyst: [
    { name: 'Cassian Andor', role: 'Hiring manager' },
    { name: 'Davits Draven', role: 'General, Alliance Intelligence' },
  ],
};
const SKILLS_ROUND: Record<Family, { round: string; format: Interview['format'] }> = {
  pilot: { round: 'Flight simulator assessment', format: 'Simulator' },
  mechanic: { round: 'Hands-on repair practical', format: 'On site' },
  analyst: { round: 'Case exercise', format: 'Video' },
};
const GOOD: Record<Family, string[]> = {
  pilot: ['Calm and precise under simulated fire', 'Clear radio discipline; kept wingmates informed', 'Strong situational awareness in the dogfight scenario'],
  mechanic: ['Found the fault in the sabotaged motivator in under 20 minutes', 'Explained the fix clearly to a non-technical panel', 'Safe, tidy workspace habits'],
  analyst: ['Pulled the key thread out of a noisy data set', 'Briefing was short, clear and honest about uncertainty', 'Asked sharp questions about sources'],
};
const GAP: Record<Family, string> = {
  pilot: 'Less experience planning fleet-level operations than the role needs',
  mechanic: 'Limited experience with capital-ship systems',
  analyst: 'Needs more practice writing for senior audiences',
};

/** Interviews for one application, based on how far it got. */
function roundsFor(t: Talent, a: Application, fam: Family, idx: number): Interview[] {
  const stagesWithInterviews: Application['stage'][] = ['Interviewing', 'Offer', 'Hired', 'Not selected', 'Withdrew', 'Screening'];
  if (!stagesWithInterviews.includes(a.stage)) return [];
  const id = (n: number) => `${t.id}-${a.reqId}-${n}`;
  const name = first(t.name);
  const screen: Interview = {
    id: id(1), reqId: a.reqId, job: a.title, round: 'Recruiter screen', date: addDays(a.date, 4), time: '10:00', minutes: 30, format: 'Video',
    status: a.stage === 'Screening' && addDays(a.date, 4) > '2026-11-12' ? 'Scheduled' : 'Completed',
    outcome: a.stage === 'Screening' ? undefined : 'Advanced',
    interviewers: [{ name: a.recruiter, role: 'Recruiter', rating: a.stage === 'Screening' ? undefined : 'Yes', note: a.stage === 'Screening' ? undefined : `Motivated and a good fit on paper. ${name} is clear about why this role.` }],
    summary: a.stage === 'Screening' ? undefined : 'Moved forward to the skills round.',
  };
  if (a.stage === 'Screening') return [screen];
  if (a.stage === 'Withdrew') return [{ ...screen, outcome: 'Withdrew', summary: `${name} withdrew after the screen.` }];

  const sk = SKILLS_ROUND[fam];
  const panel = PANEL[fam];
  const good = GOOD[fam];
  const notSelected = a.stage === 'Not selected';
  const skills: Interview = {
    id: id(2), reqId: a.reqId, job: a.title, round: sk.round, date: addDays(a.date, 11 + idx), time: '14:00', minutes: 90, format: sk.format,
    status: 'Completed', outcome: 'Advanced',
    interviewers: [{ ...panel[panel.length - 1], rating: 'Yes', note: good[(idx) % good.length] }],
    summary: good[(idx + 1) % good.length] + '.',
  };
  const upcoming = a.stage === 'Interviewing';
  const panelRound: Interview = {
    id: id(3), reqId: a.reqId, job: a.title, round: 'Panel interview', date: upcoming ? '2026-11-17' : addDays(a.date, 19 + idx), time: upcoming ? '09:30' : '11:00', minutes: 60, format: 'On site',
    status: upcoming ? 'Scheduled' : 'Completed',
    outcome: upcoming ? undefined : notSelected ? 'No hire' : 'Hire',
    interviewers: panel.slice(0, 2).map((p, k) => (upcoming ? { ...p } : {
      ...p,
      rating: notSelected ? (k === 0 ? 'No' : 'Yes') : (k === 0 ? 'Strong yes' : 'Yes'),
      note: notSelected && k === 0 ? GAP[fam] : good[(idx + k + 2) % good.length],
    })),
    summary: upcoming ? undefined : notSelected
      ? `Strong in the skills round, but the panel chose a candidate with more experience. ${GAP[fam]}. Worth considering for the next opening.`
      : 'Panel agreed to extend an offer.',
  };
  return [screen, skills, panelRound];
}

export function interviewsFor(t: Talent): Interview[] {
  if (t.id === 'TAL-20417') return WEDGE_INTERVIEWS;
  const fam = family(`${t.headline} ${t.experience.map((e) => e.title).join(' ')}`);
  return t.applications.flatMap((a, i) => roundsFor(t, a, fam, i)).sort((x, y) => y.date.localeCompare(x.date));
}

const WEDGE_INTERVIEWS: Interview[] = [
  { id: 'w-5', reqId: 'REQ-4471', job: 'Starfighter Pilot L4', round: 'Panel interview', date: '2026-11-17', time: '09:30', minutes: 60, format: 'On site', status: 'Scheduled',
    interviewers: [{ name: 'Admiral Ackbar', role: 'Hiring manager' }, { name: 'Lando Calrissian', role: 'General, fleet operations' }, { name: 'Bren Derlin', role: 'Major, base security' }] },
  { id: 'w-4', reqId: 'REQ-4471', job: 'Starfighter Pilot L4', round: 'Flight simulator assessment', date: '2026-10-30', time: '14:00', minutes: 90, format: 'Simulator', status: 'Completed', outcome: 'Advanced',
    interviewers: [{ name: 'Bren Derlin', role: 'Major, base security', rating: 'Strong yes', note: 'Best simulator run this cycle. Lost no wingmates in the ambush scenario and called the break early.' }],
    summary: 'Top score on the ambush and escort scenarios. Ready for the panel.' },
  { id: 'w-3', reqId: 'REQ-4471', job: 'Starfighter Pilot L4', round: 'Recruiter screen', date: '2026-10-23', time: '10:00', minutes: 30, format: 'Video', status: 'Completed', outcome: 'Advanced',
    interviewers: [{ name: 'Hera Syndulla', role: 'Recruiter', rating: 'Strong yes', note: 'Wants to fly and teach. Salary expectations within range. Can start in 30 days.' }],
    summary: 'Moved straight to the simulator round.' },
  { id: 'w-2', reqId: 'REQ-4390', job: 'Flight Operations Lead L5', round: 'Panel interview', date: '2026-08-21', time: '11:00', minutes: 60, format: 'On site', status: 'Completed', outcome: 'No hire',
    interviewers: [
      { name: 'Admiral Ackbar', role: 'Hiring manager', rating: 'No', note: 'Superb pilot and leader, but light on fleet-level planning: logistics, fuel and rotations across squadrons.' },
      { name: 'Mon Mothma', role: 'Recruiter', rating: 'Yes', note: 'Great with people; would grow into it. Keep warm for a pilot or instructor role.' },
    ],
    summary: 'Not selected; the panel chose someone with fleet-ops planning experience. Flagged as a strong fit for flying roles.' },
  { id: 'w-1', reqId: 'REQ-4390', job: 'Flight Operations Lead L5', round: 'Recruiter screen', date: '2026-08-06', time: '15:00', minutes: 30, format: 'Phone', status: 'Completed', outcome: 'Advanced',
    interviewers: [{ name: 'Mon Mothma', role: 'Recruiter', rating: 'Yes', note: 'Clear communicator; some gaps in operations planning.' }] },
  { id: 'w-0', reqId: 'REQ-4216', job: 'Starfighter Pilot L3', round: 'Recruiter screen', date: '2026-03-25', time: '10:00', minutes: 30, format: 'Video', status: 'Completed', outcome: 'Withdrew',
    interviewers: [{ name: 'Hera Syndulla', role: 'Recruiter', rating: 'Yes', note: 'Overqualified for L3. Withdrew to wait for an L4 opening.' }],
    summary: 'Withdrew after the screen; the level was too junior.' },
];
