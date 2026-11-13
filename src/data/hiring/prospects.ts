import type { Application, Message, OaResult, Talent } from './talent';

/*
  24 more prospects, so the Prospects tab shows a realistic list of 25.
  A mix of pilots, mechanics and analysts for the open jobs, at different
  points: never contacted, waiting on a reply, invited, mid-process, or
  worth a second look after an earlier no. People who are also in the
  Former Rebel Alliance pilots pool keep the same ID and story there.
*/

const H = 'Hera Syndulla';
const M = 'Mon Mothma';
const J = 'Jyn Erso';

const TZ: Record<string, string> = {
  Corellia: 'Corellian Standard Time', Chandrila: 'Chandrila Standard Time', 'Yavin 4': 'Yavin Base Time',
  Coruscant: 'Galactic Standard Time', Sullust: 'Sullust Standard Time', Ferrix: 'Ferrix Local Time',
  Castilon: 'Outer Rim Time', Kijimi: 'Outer Rim Time', 'Hosnian Prime': 'Galactic Standard Time',
  Taanab: 'Mid Rim Time', Akiva: 'Outer Rim Time', 'Tatooine': 'Outer Rim Time', Vardos: 'Mid Rim Time',
  Abednedo: 'Mid Rim Time', Ord: 'Galactic Standard Time', Aldhani: 'Mid Rim Time', Rhinnal: 'Core Worlds Time',
};
const tz = (loc: string) => TZ[Object.keys(TZ).find((k) => loc.includes(k)) ?? ''] ?? 'Galactic Standard Time';
const mail = (name: string) => `${name.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.')}@holonet.example`;
let ph = 3100;
const phone = () => `+1 (555) 0${String(++ph).slice(0, 2)}-${String(ph * 7).slice(-4)}`;

const app = (reqId: string, title: string, stage: Application['stage'], date: string, recruiter = H): Application => ({ reqId, title, stage, date, recruiter });
const pilotOa = (taken: string, validUntil: string, band: OaResult['band'], score: number, proctoring: OaResult['proctoring'] = 'Cleared', version = 5): OaResult => ({
  workflow: 'Starfighter Pilot L4', version, taken, validUntil, band, score, outOf: 100, proctoring, reusableFor: ['Flight Instructor L5', 'Squadron Leader L6'],
});
const oaFor = (workflow: string, taken: string, validUntil: string, band: OaResult['band'], score: number, proctoring: OaResult['proctoring'] = 'Cleared'): OaResult => ({
  workflow, version: 3, taken, validUntil, band, score, outOf: 100, proctoring, reusableFor: [],
});
const to = (at: string, by: string, body: string, subject?: string, channel: Message['channel'] = 'Email'): Message => ({ at, from: 'recruiter', by, channel, subject, body });
const back = (at: string, by: string, body: string, channel: Message['channel'] = 'Email'): Message => ({ at, from: 'candidate', by, channel, body });
const sys = (at: string, body: string, subject = 'Your online assessment'): Message => ({ at, from: 'system', by: 'Internal ATS', channel: 'Email', subject, body });

type Seed = Omit<Talent, 'email' | 'phone' | 'timezone'> & { email?: string };
const make = (s: Seed): Talent => ({ ...s, email: s.email ?? mail(s.name), phone: phone(), timezone: tz(s.location) });

export const PROSPECTS: Talent[] = [
  /* ---------- Pilots also in the Former Rebel Alliance pilots pool ---------- */
  make({
    id: 'TAL-20502', name: 'Corran Horn', pronouns: 'he/him',
    headline: 'Starfighter pilot and former CorSec investigator · 7 years flying',
    location: 'Coronet City, Corellia', preferredContact: 'Email', source: 'Sourced on HoloNet Talent', owner: H, added: '2026-06-02', lastActivity: '2026-11-05',
    applications: [app('REQ-4471', 'Starfighter Pilot L4', 'Assessment', '2026-10-28')],
    education: [{ school: 'CorSec Academy', credential: 'Certificate', field: 'Law enforcement flight operations', years: '2016–2019' }],
    experience: [
      { org: 'Rogue Squadron, Alliance Starfighter Corps', title: 'Starfighter Pilot', start: '2024-02', location: 'Fleet postings' },
      { org: 'Corellian Security Force', title: 'Investigator and patrol pilot', start: '2019-05', end: '2024-01', location: 'Corellia' },
    ],
    oa: [pilotOa('2026-11-05', '2027-05-04', 'Recommended', 79)],
    considerations: [
      { label: 'Also in process', value: 'In assessment for Starfighter Pilot L4 with Hera Syndulla', flag: true },
      { label: 'Relocation', value: 'Prefers to stay on Corellia; open to fleet postings' },
      { label: 'Availability', value: 'Can start with 2 weeks’ notice' },
    ],
    skills: ['X-wing', 'Investigations', 'Night flying', 'Close-quarters dogfighting'],
    messages: [
      to('2026-06-03T15:00:00Z', H, 'Hi Corran, your CorSec flight record caught my eye. Would you consider a move to the Starfighter Corps?', 'Starfighter Corps'),
      back('2026-06-05T10:12:00Z', 'Corran Horn', 'Possibly. Not this summer, but keep me in mind.'),
      to('2026-10-27T16:40:00Z', H, 'We’ve opened Starfighter Pilot L4 again. Still interested?'),
      sys('2026-10-28T09:00:00Z', 'Invitation sent for Starfighter Pilot L4 (version 5). Link open for 180 days.'),
    ],
  }),
  make({
    id: 'TAL-20430', name: 'Wes Janson', pronouns: 'he/him',
    headline: 'Pilot and gunner · Rogue Squadron veteran',
    location: 'Taanab', preferredContact: 'SMS', source: 'Pool: Former Rebel Alliance pilots', owner: H, added: '2026-03-04', lastActivity: '2026-11-09',
    applications: [app('REQ-4216', 'Starfighter Pilot L3', 'Not selected', '2026-03-21')],
    education: [{ school: 'Taanab Agricultural Institute', credential: 'Diploma', field: 'Aerial crop dusting', years: '2012–2014' }],
    experience: [
      { org: 'Rogue Squadron, Alliance Starfighter Corps', title: 'Pilot and gunner', start: '2020-08', location: 'Fleet postings' },
      { org: 'Taanab defence militia', title: 'Patrol pilot', start: '2015-03', end: '2020-07', location: 'Taanab' },
    ],
    oa: [],
    considerations: [
      { label: 'Last time', value: 'Not selected for Starfighter Pilot L3 in March; panel liked him, the level was too junior' },
      { label: 'Availability', value: 'Open to a call next week' },
    ],
    skills: ['X-wing', 'Snowspeeder', 'Gunnery', 'Morale'],
    messages: [
      to('2026-11-06T17:00:00Z', H, 'Hi Wes, Hera here. We have an L4 pilot role now, a better fit than last time. Up for a chat?', undefined, 'SMS'),
      back('2026-11-09T08:30:00Z', 'Wes Janson', 'Ha, finally a level that fits! Open to a call next week.', 'SMS'),
    ],
  }),
  make({
    id: 'TAL-20476', name: 'Evaan Verlaine', pronouns: 'she/her',
    headline: 'A-wing pilot · Green Squadron, 6 years',
    location: 'Aldera, Alderaan (former)', preferredContact: 'Email', source: 'Pool: Former Rebel Alliance pilots', owner: M, added: '2026-05-19', lastActivity: '2026-10-28',
    applications: [app('REQ-4310', 'Starfighter Pilot L4', 'Withdrew', '2026-06-10', M)],
    education: [{ school: 'Royal Academy of Alderaan', credential: 'Bachelor’s', field: 'Diplomatic studies', years: '2013–2017' }],
    experience: [
      { org: 'Green Squadron, Alliance Starfighter Corps', title: 'A-wing pilot', start: '2020-01', location: 'Fleet postings' },
      { org: 'House Organa', title: 'Royal guard pilot', start: '2017-09', end: '2019-12', location: 'Alderaan' },
    ],
    oa: [pilotOa('2026-06-12', '2026-12-09', 'Strong', 91, 'Cleared', 4)],
    considerations: [
      { label: 'OA expiring soon', value: 'Her Strong result counts until Dec 9, 2026', flag: true },
      { label: 'Availability', value: 'Available from January 2027' },
      { label: 'Why she withdrew', value: 'Family commitments in June; now resolved' },
    ],
    skills: ['A-wing', 'Escort missions', 'Diplomatic protocol', 'Interceptor tactics'],
    messages: [
      to('2026-10-24T14:00:00Z', M, 'Hi Evaan, we’d love to have you back in process for Starfighter Pilot L4. Your assessment still counts for a few more weeks.', 'Coming back?'),
      back('2026-10-28T09:20:00Z', 'Evaan Verlaine', 'Thank you! I can start from January. Would that still work?'),
    ],
  }),
  make({
    id: 'TAL-20471', name: 'Gavin Darklighter', pronouns: 'he/him',
    headline: 'X-wing pilot · interested in teaching new pilots',
    location: 'Anchorhead, Tatooine', preferredContact: 'Email', source: 'Referral from Wedge Antilles', owner: M, added: '2026-05-19', lastActivity: '2026-11-02',
    applications: [],
    education: [{ school: 'Anchorhead Flight School', credential: 'Pilot’s licence', field: 'Atmospheric and orbital flight', years: '2016–2018' }],
    experience: [{ org: 'Rogue Squadron, Alliance Starfighter Corps', title: 'X-wing pilot', start: '2019-03', location: 'Fleet postings' }],
    oa: [],
    considerations: [
      { label: 'Interested in', value: 'Flight Instructor L5' },
      { label: 'Referral', value: 'Referred by Wedge Antilles, who is interviewing with us' },
    ],
    skills: ['X-wing', 'Flight instruction', 'Desert operations'],
    messages: [
      to('2026-10-30T15:00:00Z', M, 'Hi Gavin, Wedge suggested we talk. Would any of our pilot roles interest you?', 'From Mon Mothma, Starfighter Corps'),
      back('2026-11-02T11:00:00Z', 'Gavin Darklighter', 'Thanks for reaching out. I’d really like to hear more about Flight Instructor.'),
    ],
  }),
  make({
    id: 'TAL-20492', name: 'Snap Wexley', pronouns: 'he/him',
    headline: 'Reconnaissance pilot · long-range scouting',
    location: 'Myrra, Akiva', preferredContact: 'Email', source: 'Pool: Former Rebel Alliance pilots', owner: M, added: '2026-07-14', lastActivity: '2026-10-30',
    applications: [app('REQ-4471', 'Starfighter Pilot L4', 'Invited to apply', '2026-10-30')],
    education: [{ school: 'Akiva Technical College', credential: 'Diploma', field: 'Sensor systems', years: '2015–2017' }],
    experience: [
      { org: 'Alliance Starfighter Corps', title: 'Reconnaissance pilot', start: '2021-06', location: 'Outer Rim' },
      { org: 'Akiva resistance cell', title: 'Scout and pilot', start: '2017-08', end: '2021-05', location: 'Akiva' },
    ],
    oa: [pilotOa('2026-08-01', '2027-01-28', 'Recommended', 76)],
    considerations: [{ label: 'Invited', value: 'Invited to apply to Starfighter Pilot L4 on Oct 30; hasn’t opened it yet' }],
    skills: ['Reconnaissance', 'Sensors', 'X-wing', 'Long-range navigation'],
    messages: [
      to('2026-10-30T13:00:00Z', H, 'Hi Snap, we think you’d be great for Starfighter Pilot L4. Here’s the link to apply; your assessment already counts.', 'Invitation to apply: Starfighter Pilot L4'),
    ],
  }),
  make({
    id: 'TAL-20517', name: 'Ten Numb', pronouns: 'he/him',
    headline: 'B-wing pilot · Blue Squadron',
    location: 'Pinnacle Base, Sullust', preferredContact: 'Portal', source: 'Pool: Former Rebel Alliance pilots', owner: H, added: '2026-11-08', lastActivity: '2026-11-08',
    applications: [app('REQ-4310', 'Starfighter Pilot L4', 'Not selected', '2026-06-30')],
    education: [{ school: 'SoroSuub Flight Academy', credential: 'Certificate', field: 'Heavy starfighter operations', years: '2014–2016' }],
    experience: [{ org: 'Blue Squadron, Alliance Starfighter Corps', title: 'B-wing pilot', start: '2018-02', location: 'Fleet postings' }],
    oa: [pilotOa('2026-07-02', '2026-12-29', 'Recommended', 81)],
    considerations: [
      { label: 'Not contacted yet', value: 'Added to the pool on Nov 8', flag: true },
      { label: 'Last time', value: 'Not selected in June because all openings were filled' },
    ],
    skills: ['B-wing', 'Heavy weapons', 'Capital ship attack runs'],
    messages: [sys('2026-07-02T08:00:00Z', 'Assessment completed for Starfighter Pilot L4 (version 5).', 'Assessment complete')],
  }),
  make({
    id: 'TAL-20449', name: 'Jake Farrell', pronouns: 'he/him',
    headline: 'Flight instructor · 11 years training Alliance pilots',
    location: 'Hanna City, Chandrila', preferredContact: 'Email', source: 'Pool: Former Rebel Alliance pilots', owner: H, added: '2026-04-11', lastActivity: '2026-10-21',
    applications: [],
    education: [{ school: 'Chandrila Flight Academy', credential: 'Master instructor rating', field: 'Flight instruction', years: '2013–2015' }],
    experience: [
      { org: 'Alliance Flight Academy', title: 'Senior flight instructor', start: '2019-04', location: 'Chandrila' },
      { org: 'Chandrila Flight Academy', title: 'Flight instructor', start: '2015-06', end: '2019-03', location: 'Chandrila' },
    ],
    oa: [],
    considerations: [
      { label: 'Good fit for', value: 'Flight Instructor L5' },
      { label: 'Waiting on a reply', value: 'Messaged Oct 21; no answer yet' },
    ],
    skills: ['Flight instruction', 'Curriculum design', 'Simulator training', 'X-wing'],
    messages: [to('2026-10-21T10:00:00Z', M, 'Hi Jake, we’re hiring a Flight Instructor and your name keeps coming up. Interested?', 'Flight Instructor L5')],
  }),

  /* ---------- Pilots and squadron leaders ---------- */
  make({
    id: 'TAL-20531', name: 'Tallissan Lintra', pronouns: 'she/her',
    headline: 'A-wing squadron leader · Tierfon Yellow Aces',
    location: 'Hosnian Prime', preferredContact: 'Email', source: 'Applied through the careers site', owner: M, added: '2026-10-22', lastActivity: '2026-11-10',
    applications: [app('REQ-4560', 'Squadron Leader L6', 'Screening', '2026-10-22', M)],
    education: [{ school: 'New Republic Naval Academy', credential: 'Commission', field: 'Fleet command', years: '2012–2016' }],
    experience: [
      { org: 'Tierfon Yellow Aces', title: 'Squadron Leader', start: '2022-01', location: 'Hosnian system' },
      { org: 'Green Squadron', title: 'A-wing pilot', start: '2016-08', end: '2021-12', location: 'Fleet postings' },
    ],
    oa: [pilotOa('2026-10-25', '2027-04-23', 'Strong', 90)],
    considerations: [
      { label: 'Also in process', value: 'Screening for Squadron Leader L6 with Mon Mothma', flag: true },
      { label: 'Notice period', value: 'Needs 60 days’ notice' },
    ],
    skills: ['A-wing', 'Squadron command', 'Fleet defence', 'Mentoring'],
    messages: [
      sys('2026-10-22T12:00:00Z', 'Application received for Squadron Leader L6.', 'Application received'),
      to('2026-11-10T09:00:00Z', M, 'Hi Tallie, thanks for applying. Could we set up a screening call this week?', 'Squadron Leader L6'),
    ],
  }),
  make({
    id: 'TAL-20536', name: 'Jessika Pava', pronouns: 'she/her',
    headline: 'X-wing pilot · Blue Squadron, 4 years',
    location: 'Ord Mantell', preferredContact: 'SMS', source: 'Career fair on Chandrila', owner: H, added: '2026-10-09', lastActivity: '2026-11-07',
    applications: [app('REQ-4471', 'Starfighter Pilot L4', 'Applied', '2026-11-07')],
    education: [{ school: 'Ord Mantell Flight College', credential: 'Diploma', field: 'Starfighter piloting', years: '2018–2020' }],
    experience: [{ org: 'Blue Squadron, Alliance Starfighter Corps', title: 'X-wing pilot', start: '2022-05', location: 'Fleet postings' }],
    oa: [],
    considerations: [
      { label: 'Next step', value: 'Applied Nov 7; send the OA' },
      { label: 'Met at', value: 'Chandrila career fair, Oct 9' },
    ],
    skills: ['X-wing', 'Escort', 'Carrier operations'],
    messages: [
      to('2026-10-10T18:00:00Z', H, 'Great meeting you at the fair, Jessika. The pilot role is open now; here’s the link.', undefined, 'SMS'),
      back('2026-11-07T20:15:00Z', 'Jessika Pava', 'Just applied! Thanks Hera.', 'SMS'),
    ],
  }),
  make({
    id: 'TAL-20540', name: 'Kare Kun', pronouns: 'she/her',
    headline: 'X-wing pilot · worth a second look',
    location: 'Coruscant', preferredContact: 'Email', source: 'Past applicant', owner: H, added: '2026-02-14', lastActivity: '2026-04-30',
    applications: [app('REQ-4216', 'Starfighter Pilot L3', 'Not selected', '2026-03-21')],
    education: [{ school: 'Coruscant Aerospace Institute', credential: 'Bachelor’s', field: 'Aerospace engineering', years: '2016–2020' }],
    experience: [{ org: 'Coruscant planetary defence', title: 'Patrol pilot', start: '2020-09', location: 'Coruscant' }],
    oa: [pilotOa('2026-03-28', '2026-09-24', 'Borderline', 61, 'Cleared', 4)],
    considerations: [
      { label: 'OA expired', value: 'Borderline result expired Sep 24, 2026; she’d need to retake', flag: true },
      { label: 'Since then', value: 'Has logged 400 more flight hours' },
    ],
    skills: ['X-wing', 'Urban airspace', 'Engineering'],
    messages: [
      sys('2026-04-30T10:00:00Z', 'Thank you for applying for Starfighter Pilot L3. We won’t be moving forward this time.', 'Your application'),
    ],
  }),
  make({
    id: 'TAL-20544', name: 'Iden Versio', pronouns: 'she/her',
    headline: 'Former special forces commander · now flying for the Republic',
    location: 'Vardos', preferredContact: 'Portal', source: 'Sourced on HoloNet Talent', owner: M, added: '2026-10-15', lastActivity: '2026-10-15',
    applications: [],
    education: [{ school: 'Imperial Academy, Coruscant', credential: 'Commission', field: 'Special operations', years: '2011–2015' }],
    experience: [
      { org: 'New Republic Starfighter Corps', title: 'Flight commander', start: '2023-03', location: 'Fleet postings' },
      { org: 'Inferno Squad', title: 'Commander', start: '2015-06', end: '2022-11', location: 'Various' },
    ],
    oa: [],
    considerations: [
      { label: 'Background check', value: 'Previous Imperial service: needs an extended background check before an offer', flag: true },
      { label: 'Good fit for', value: 'Squadron Leader L6' },
      { label: 'Contact consent', value: 'Has not agreed to outreach yet; contact through the portal only', flag: true },
    ],
    skills: ['TIE and X-wing', 'Special operations', 'Command', 'Stealth insertion'],
    messages: [],
  }),
  make({
    id: 'TAL-20547', name: 'Del Meeko', pronouns: 'he/him',
    headline: 'Pilot and droid specialist · former Inferno Squad',
    location: 'Vardos', preferredContact: 'Email', source: 'Referral from Iden Versio', owner: M, added: '2026-10-18', lastActivity: '2026-10-20',
    applications: [],
    education: [{ school: 'Imperial Academy, Coruscant', credential: 'Commission', field: 'Droid engineering', years: '2012–2016' }],
    experience: [{ org: 'New Republic Starfighter Corps', title: 'Pilot', start: '2023-03', location: 'Fleet postings' }],
    oa: [],
    considerations: [
      { label: 'Background check', value: 'Previous Imperial service: needs an extended background check', flag: true },
      { label: 'Good fit for', value: 'Starfighter Pilot L4 or Hangar Mechanic L3' },
    ],
    skills: ['Droid repair', 'TIE and X-wing', 'Slicing'],
    messages: [
      to('2026-10-19T14:00:00Z', M, 'Hi Del, Iden mentioned you might be looking. We have pilot and mechanic roles open.'),
      back('2026-10-20T08:45:00Z', 'Del Meeko', 'Thanks! Pilot first, but I’d consider the mechanic role.'),
    ],
  }),
  make({
    id: 'TAL-20551', name: 'Shriv Suurgav', pronouns: 'he/him',
    headline: 'Y-wing pilot · New Republic, 5 years',
    location: 'Castilon', preferredContact: 'SMS', source: 'Agency: Outer Rim Talent', owner: H, added: '2026-09-30', lastActivity: '2026-10-14',
    applications: [app('REQ-4471', 'Starfighter Pilot L4', 'Withdrew', '2026-10-02')],
    education: [{ school: 'Duros Space Academy', credential: 'Certificate', field: 'Bomber operations', years: '2017–2019' }],
    experience: [{ org: 'New Republic Starfighter Corps', title: 'Y-wing pilot', start: '2021-07', location: 'Outer Rim' }],
    oa: [],
    considerations: [
      { label: 'Why he withdrew', value: 'Took a short contract; free again from December' },
      { label: 'Agency', value: 'Through Outer Rim Talent; fee applies if hired', flag: true },
    ],
    skills: ['Y-wing', 'Bombing runs', 'Undercover work'],
    messages: [back('2026-10-14T19:00:00Z', 'Shriv Suurgav', 'Sorry, had to withdraw for a contract. Free from December if it’s still open.', 'SMS')],
  }),

  /* ---------- Hangar and mechanics ---------- */
  make({
    id: 'TAL-20555', name: 'Jarek Yeager', pronouns: 'he/him',
    headline: 'Veteran mechanic and ex-racer · runs a repair shop',
    location: 'Colossus platform, Castilon', preferredContact: 'Email', source: 'Referral from Rose Tico', owner: H, added: '2026-09-20', lastActivity: '2026-11-09',
    applications: [app('REQ-4502', 'Hangar Mechanic L3', 'Offer', '2026-09-24')],
    education: [{ school: 'Republic Flight Corps', credential: 'Certificate', field: 'Starfighter maintenance', years: '2006–2008' }],
    experience: [
      { org: 'Yeager’s Repair Shop', title: 'Owner and lead mechanic', start: '2015-01', location: 'Castilon' },
      { org: 'Alliance Starfighter Corps', title: 'Pilot', start: '2008-03', end: '2014-11', location: 'Fleet postings' },
    ],
    oa: [oaFor('Hangar Mechanic L3', '2026-09-28', '2027-03-27', 'Strong', 92)],
    considerations: [
      { label: 'Offer out', value: 'Offer sent Nov 9 for Hangar Mechanic L3; answer due Nov 16', flag: true },
      { label: 'Would bring', value: 'Could also train junior mechanics' },
    ],
    skills: ['Engine rebuilds', 'Racer tuning', 'Team lead', 'Fuel systems'],
    messages: [
      to('2026-11-09T15:00:00Z', H, 'Jarek, delighted to share an offer for Hangar Mechanic L3. Details attached; let me know by Nov 16.', 'Your offer'),
    ],
  }),
  make({
    id: 'TAL-20558', name: 'Kazuda Xiono', pronouns: 'he/him',
    headline: 'Mechanic and racer pilot · 3 years on the Colossus',
    location: 'Colossus platform, Castilon', preferredContact: 'SMS', source: 'Referral from Jarek Yeager', owner: H, added: '2026-10-05', lastActivity: '2026-10-26',
    applications: [app('REQ-4502', 'Hangar Mechanic L3', 'Invited to apply', '2026-10-26')],
    education: [{ school: 'Hosnian Prime Academy', credential: 'Diploma', field: 'Flight systems', years: '2017–2019' }],
    experience: [{ org: 'Yeager’s Repair Shop', title: 'Mechanic', start: '2023-06', location: 'Castilon' }],
    oa: [],
    considerations: [{ label: 'Invited', value: 'Invited to apply Oct 26; reminder due' }],
    skills: ['Racer repair', 'Hyperdrive diagnostics', 'Improvisation'],
    messages: [to('2026-10-26T12:00:00Z', H, 'Hi Kaz, Jarek says you’re great with engines. Here’s the Hangar Mechanic application.', 'Invitation to apply: Hangar Mechanic L3', 'SMS')],
  }),
  make({
    id: 'TAL-20561', name: 'Tam Ryvora', pronouns: 'she/her',
    headline: 'Mechanic · re-engage after an earlier no',
    location: 'Colossus platform, Castilon', preferredContact: 'Email', source: 'Past applicant', owner: J, added: '2026-03-10', lastActivity: '2026-04-22',
    applications: [app('REQ-4205', 'Hangar Mechanic L2', 'Not selected', '2026-03-10', J)],
    education: [{ school: 'Castilon Trade School', credential: 'Certificate', field: 'Starship mechanics', years: '2019–2021' }],
    experience: [{ org: 'Yeager’s Repair Shop', title: 'Mechanic', start: '2021-08', location: 'Castilon' }],
    oa: [oaFor('Hangar Mechanic L2', '2026-03-15', '2026-09-11', 'Not recommended', 41)],
    considerations: [
      { label: 'OA expired', value: 'Not recommended result from March has expired', flag: true },
      { label: 'Since then', value: 'Completed a hyperdrive certification in August' },
    ],
    skills: ['Engine repair', 'Welding', 'Racer maintenance'],
    messages: [sys('2026-04-22T10:00:00Z', 'Thank you for applying for Hangar Mechanic L2. We won’t be moving forward this time.', 'Your application')],
  }),
  make({
    id: 'TAL-20564', name: 'Bix Caleen', pronouns: 'she/her',
    headline: 'Salvage technician and parts broker',
    location: 'Ferrix', preferredContact: 'Email', source: 'Sourced on HoloNet Talent', owner: J, added: '2026-11-04', lastActivity: '2026-11-04',
    applications: [],
    education: [{ school: 'Ferrix Salvage Yard', credential: 'Apprenticeship', field: 'Salvage and parts', years: '2012–2016' }],
    experience: [{ org: 'Staravan Salvage', title: 'Lead technician', start: '2016-05', location: 'Ferrix' }],
    oa: [],
    considerations: [
      { label: 'Not contacted yet', value: 'Sourced Nov 4', flag: true },
      { label: 'Good fit for', value: 'Hangar Mechanic L3' },
    ],
    skills: ['Salvage', 'Parts sourcing', 'Navigation computers', 'Negotiation'],
    messages: [],
  }),
  make({
    id: 'TAL-20567', name: 'Trace Martez', pronouns: 'she/her',
    headline: 'Freighter pilot and mechanic',
    location: 'Coruscant', preferredContact: 'SMS', source: 'Career fair on Chandrila', owner: J, added: '2026-10-09', lastActivity: '2026-10-09',
    applications: [],
    education: [{ school: 'Coruscant Trade School', credential: 'Certificate', field: 'Freighter maintenance', years: '2018–2020' }],
    experience: [{ org: 'Martez Repairs', title: 'Pilot and mechanic', start: '2020-04', location: 'Coruscant' }],
    oa: [],
    considerations: [
      { label: 'Not contacted yet', value: 'Met at the Chandrila career fair', flag: true },
      { label: 'Good fit for', value: 'Hangar Mechanic L3' },
    ],
    skills: ['Freighter repair', 'Speeder bikes', 'Pilot certification'],
    messages: [],
  }),
  make({
    id: 'TAL-20570', name: 'Babu Frik', pronouns: 'he/him',
    headline: 'Droidsmith · 200+ years modifying droids',
    location: 'Kijimi', preferredContact: 'Portal', source: 'Applied through the careers site', owner: J, added: '2026-11-01', lastActivity: '2026-11-01',
    applications: [app('REQ-4502', 'Hangar Mechanic L3', 'Applied', '2026-11-01', J)],
    education: [],
    experience: [{ org: 'Independent droidsmith', title: 'Owner', start: '1826-01', location: 'Kijimi' }],
    oa: [],
    considerations: [
      { label: 'Next step', value: 'Applied Nov 1; send the OA' },
      { label: 'Working hours', value: 'Prefers night shifts' },
    ],
    skills: ['Droid programming', 'Memory wipes', 'Micro-engineering'],
    messages: [sys('2026-11-01T22:00:00Z', 'Application received for Hangar Mechanic L3.', 'Application received')],
  }),

  /* ---------- Intelligence ---------- */
  make({
    id: 'TAL-20574', name: 'Kaydel Ko Connix', pronouns: 'she/her',
    headline: 'Communications and signals officer',
    location: 'Base One, Yavin 4', preferredContact: 'Email', source: 'Internal transfer', owner: M, added: '2026-10-03', lastActivity: '2026-11-10',
    applications: [app('REQ-4519', 'Intelligence Analyst L5', 'Interviewing', '2026-10-03', M)],
    education: [{ school: 'Chandrila University', credential: 'Bachelor’s', field: 'Signals and cryptography', years: '2015–2019' }],
    experience: [{ org: 'Alliance Fleet Communications', title: 'Signals officer', start: '2019-07', location: 'Yavin 4' }],
    oa: [oaFor('Intelligence Analyst L5', '2026-10-08', '2027-04-06', 'Strong', 86)],
    considerations: [
      { label: 'Also in process', value: 'Interviewing for Intelligence Analyst L5 with Mon Mothma', flag: true },
      { label: 'Internal', value: 'Current employee; manager has been told' },
    ],
    skills: ['Cryptography', 'Signals intelligence', 'Comms networks'],
    messages: [to('2026-11-10T13:00:00Z', M, 'Hi Kaydel, Cassian would like a final conversation on Friday. Does 10:00 work?', 'Final interview')],
  }),
  make({
    id: 'TAL-20577', name: 'Vel Sartha', pronouns: 'she/her',
    headline: 'Field operations planner',
    location: 'Aldhani', preferredContact: 'Portal', source: 'Applied through the careers site', owner: M, added: '2026-10-29', lastActivity: '2026-11-03',
    applications: [app('REQ-4519', 'Intelligence Analyst L5', 'Applied', '2026-10-29', M)],
    education: [{ school: 'University of Coruscant', credential: 'Bachelor’s', field: 'Political history', years: '2014–2018' }],
    experience: [{ org: 'Independent', title: 'Operations planner', start: '2019-02', location: 'Mid Rim' }],
    oa: [],
    considerations: [{ label: 'Next step', value: 'Applied Oct 29; send the OA' }],
    skills: ['Operations planning', 'Logistics', 'Team coordination'],
    messages: [sys('2026-10-29T15:00:00Z', 'Application received for Intelligence Analyst L5.', 'Application received')],
  }),
  make({
    id: 'TAL-20580', name: 'Cinta Kaz', pronouns: 'she/her',
    headline: 'Reconnaissance specialist',
    location: 'Aldhani', preferredContact: 'Portal', source: 'Referral from Vel Sartha', owner: M, added: '2026-07-12', lastActivity: '2026-08-15',
    applications: [app('REQ-4401', 'Intelligence Analyst L4', 'Withdrew', '2026-07-12', M)],
    education: [],
    experience: [{ org: 'Independent', title: 'Reconnaissance specialist', start: '2018-01', location: 'Mid Rim' }],
    oa: [oaFor('Intelligence Analyst L4', '2026-07-20', '2027-01-16', 'Recommended', 74, 'Under review')],
    considerations: [
      { label: 'Proctoring', value: 'July assessment is under review', flag: true },
      { label: 'Why she withdrew', value: 'Didn’t want an office-based role' },
    ],
    skills: ['Surveillance', 'Field reconnaissance', 'Survival'],
    messages: [back('2026-08-15T09:00:00Z', 'Cinta Kaz', 'Withdrawing for now. I need field work, not a desk.', 'Portal')],
  }),
  make({
    id: 'TAL-20583', name: 'Kleya Marki', pronouns: 'she/her',
    headline: 'Antiquities dealer and information broker',
    location: 'Coruscant', preferredContact: 'Portal', source: 'Sourced on HoloNet Talent', owner: M, added: '2026-11-06', lastActivity: '2026-11-06',
    applications: [],
    education: [{ school: 'Coruscant Institute of Antiquities', credential: 'Master’s', field: 'Pre-Republic artefacts', years: '2010–2014' }],
    experience: [{ org: 'Galactic Antiquities', title: 'Partner', start: '2015-03', location: 'Coruscant' }],
    oa: [],
    considerations: [
      { label: 'Contact consent', value: 'Has not agreed to outreach yet; contact through the portal only', flag: true },
      { label: 'Good fit for', value: 'Intelligence Analyst L5' },
    ],
    skills: ['Network analysis', 'Discretion', 'Coded communications'],
    messages: [],
  }),
  make({
    id: 'TAL-20586', name: 'Ruescott Melshi', pronouns: 'he/him',
    headline: 'Field intelligence sergeant · 10 years',
    location: 'Base One, Yavin 4', preferredContact: 'Email', source: 'Internal transfer', owner: M, added: '2026-10-11', lastActivity: '2026-10-19',
    applications: [app('REQ-4519', 'Intelligence Analyst L5', 'Assessment', '2026-10-12', M)],
    education: [{ school: 'Alliance Military Academy', credential: 'Certificate', field: 'Field intelligence', years: '2014–2015' }],
    experience: [{ org: 'Alliance Special Forces', title: 'Sergeant, field intelligence', start: '2016-01', location: 'Various' }],
    oa: [],
    considerations: [
      { label: 'OA not started', value: 'Invited Oct 12; link open until Apr 10, 2027' },
      { label: 'Internal', value: 'Current employee' },
    ],
    skills: ['Field intelligence', 'Interrogation', 'Small-unit tactics'],
    messages: [sys('2026-10-12T09:00:00Z', 'Invitation sent for Intelligence Analyst L5 (version 3). Link open for 180 days.')],
  }),
];
