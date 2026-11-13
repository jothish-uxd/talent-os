import { peek, put, useStored } from '../store';

/*
  The people in a pool and where each one is in the relationship.
  Only the sample pool (POOL-118, Former Rebel Alliance pilots) has members
  filled in so far; the others show their totals on the Pool landing page.
*/

export type MemberStatus = 'Not contacted' | 'Contacted' | 'Replied' | 'Not interested' | 'Applied' | 'Hired';
export const STATUS_ORDER: MemberStatus[] = ['Not contacted', 'Contacted', 'Replied', 'Not interested', 'Applied', 'Hired'];

export interface Touch { what: string; at: string; by: string }
export interface Member {
  id: string;
  name: string;
  /** Current role and where */
  headline: string;
  location: string;
  status: MemberStatus;
  /** For Applied and Hired: which job */
  job?: { reqId: string; title: string; stage: string };
  /** Most recent online assessment band, if any, and whether it still counts */
  oa?: { band: 'Strong' | 'Good' | 'Fair'; valid: boolean };
  lastTouch?: Touch;
  added: Touch;
}

const H = 'Hera Syndulla';
const M = 'Mon Mothma';

const REBEL_PILOTS: Member[] = [
  { id: 'TAL-20417', name: 'Wedge Antilles', headline: 'Wing commander, Rogue Squadron', location: 'Corellia', status: 'Applied',
    job: { reqId: 'REQ-4471', title: 'Starfighter Pilot L4', stage: 'Interview' }, oa: { band: 'Strong', valid: true },
    lastTouch: { what: 'Interview scheduled', at: '2026-11-10', by: H }, added: { what: 'Added', at: '2026-03-04', by: H } },
  { id: 'TAL-20388', name: 'Shara Bey', headline: 'A-wing pilot, Green Squadron', location: 'Yavin 4', status: 'Hired',
    job: { reqId: 'REQ-4398', title: 'Starfighter Pilot L4', stage: 'Started Sep 2026' }, oa: { band: 'Strong', valid: true },
    lastTouch: { what: 'Offer accepted', at: '2026-08-22', by: H }, added: { what: 'Added', at: '2026-03-04', by: H } },
  { id: 'TAL-20391', name: 'Biggs Darklighter', headline: 'X-wing pilot, Red Squadron', location: 'Tatooine', status: 'Hired',
    job: { reqId: 'REQ-4410', title: 'Flight Instructor L5', stage: 'Started Oct 2026' }, oa: { band: 'Good', valid: true },
    lastTouch: { what: 'Offer accepted', at: '2026-09-30', by: H }, added: { what: 'Added', at: '2026-03-04', by: H } },
  { id: 'TAL-20455', name: 'Tycho Celchu', headline: 'Flight leader, Rogue Squadron', location: 'Alderaan (former)', status: 'Applied',
    job: { reqId: 'REQ-4560', title: 'Squadron Leader L6', stage: 'Screening' },
    lastTouch: { what: 'Applied', at: '2026-11-07', by: 'Tycho Celchu' }, added: { what: 'Added', at: '2026-04-11', by: H } },
  { id: 'TAL-20502', name: 'Corran Horn', headline: 'Pilot, CorSec flight unit', location: 'Corellia', status: 'Applied',
    job: { reqId: 'REQ-4471', title: 'Starfighter Pilot L4', stage: 'Assessment' }, oa: { band: 'Good', valid: true },
    lastTouch: { what: 'OA completed', at: '2026-11-05', by: 'Corran Horn' }, added: { what: 'Added', at: '2026-06-02', by: H } },
  { id: 'TAL-20430', name: 'Wes Janson', headline: 'Gunner and pilot, Rogue Squadron', location: 'Taanab', status: 'Replied',
    lastTouch: { what: 'Replied: open to a call next week', at: '2026-11-09', by: 'Wes Janson' }, added: { what: 'Added', at: '2026-03-04', by: H } },
  { id: 'TAL-20433', name: 'Jek Porkins', headline: 'X-wing pilot, Red Squadron', location: 'Bestine IV', status: 'Replied',
    oa: { band: 'Fair', valid: false },
    lastTouch: { what: 'Replied: asked about relocation', at: '2026-11-04', by: 'Jek Porkins' }, added: { what: 'Added', at: '2026-03-04', by: H } },
  { id: 'TAL-20471', name: 'Gavin Darklighter', headline: 'X-wing pilot, Rogue Squadron', location: 'Tatooine', status: 'Replied',
    lastTouch: { what: 'Replied: interested in Flight Instructor', at: '2026-11-02', by: 'Gavin Darklighter' }, added: { what: 'Added', at: '2026-05-19', by: M } },
  { id: 'TAL-20476', name: 'Norra Wexley', headline: 'Y-wing pilot, Gold Squadron', location: 'Akiva', status: 'Replied',
    oa: { band: 'Strong', valid: true },
    lastTouch: { what: 'Replied: available from January', at: '2026-10-28', by: 'Norra Wexley' }, added: { what: 'Added', at: '2026-05-19', by: M } },
  { id: 'TAL-20480', name: 'Nien Nunb', headline: 'Co-pilot, Millennium Falcon', location: 'Sullust', status: 'Replied',
    lastTouch: { what: 'Replied: prefers a call', at: '2026-10-25', by: 'Nien Nunb' }, added: { what: 'Added', at: '2026-06-02', by: H } },
  { id: 'TAL-20436', name: 'Garven Dreis', headline: 'Red Leader, Red Squadron', location: 'Virujansi', status: 'Replied',
    lastTouch: { what: 'Replied: wants a leadership role', at: '2026-10-19', by: 'Garven Dreis' }, added: { what: 'Added', at: '2026-03-04', by: H } },
  { id: 'TAL-20488', name: 'Kes Dameron', headline: 'Pathfinder, Alliance special forces', location: 'Yavin 4', status: 'Not interested',
    lastTouch: { what: 'Replied: not looking to fly again', at: '2026-10-12', by: 'Kes Dameron' }, added: { what: 'Added', at: '2026-06-02', by: H } },
  { id: 'TAL-20441', name: 'Hobbie Klivian', headline: 'X-wing pilot, Rogue Squadron', location: 'Ralltiir', status: 'Contacted',
    lastTouch: { what: 'Message sent', at: '2026-11-06', by: H }, added: { what: 'Added', at: '2026-03-04', by: H } },
  { id: 'TAL-20444', name: 'Arvel Crynyd', headline: 'A-wing pilot, Green Squadron', location: 'Hosnian Prime', status: 'Contacted',
    lastTouch: { what: 'Message sent', at: '2026-11-03', by: H }, added: { what: 'Added', at: '2026-04-11', by: H } },
  { id: 'TAL-20492', name: 'Snap Wexley', headline: 'Reconnaissance pilot', location: 'Akiva', status: 'Contacted',
    oa: { band: 'Good', valid: true },
    lastTouch: { what: 'Invited to apply to Starfighter Pilot L4', at: '2026-10-30', by: H }, added: { what: 'Added', at: '2026-07-14', by: M } },
  { id: 'TAL-20449', name: 'Jake Farrell', headline: 'Flight instructor, Alliance academy', location: 'Hoth (former)', status: 'Contacted',
    lastTouch: { what: 'Message sent', at: '2026-10-21', by: M }, added: { what: 'Added', at: '2026-04-11', by: H } },
  { id: 'TAL-20495', name: 'Keyan Farlander', headline: 'Starfighter pilot, Alliance fleet', location: 'Agamar', status: 'Contacted',
    lastTouch: { what: 'Message sent', at: '2026-10-14', by: H }, added: { what: 'Added', at: '2026-07-14', by: M } },
  { id: 'TAL-20510', name: 'Zev Senesca', headline: 'Snowspeeder pilot, Rogue Group', location: 'Kestic Station', status: 'Not contacted',
    added: { what: 'Added', at: '2026-10-29', by: H } },
  { id: 'TAL-20513', name: 'Dak Ralter', headline: 'Gunner, Rogue Group', location: 'Kessel', status: 'Not contacted',
    added: { what: 'Added', at: '2026-11-03', by: H } },
  { id: 'TAL-20517', name: 'Ten Numb', headline: 'B-wing pilot, Blue Squadron', location: 'Sullust', status: 'Not contacted',
    oa: { band: 'Good', valid: true },
    added: { what: 'Added', at: '2026-11-08', by: H } },
];

const SEED: Record<string, Member[]> = { 'POOL-118': REBEL_PILOTS };
const key = (poolId: string) => `hiring:v1:pool-members:${poolId}`;

/** Pools that have sample members filled in. */
export const hasMembers = (poolId: string) => poolId in SEED;
export const useMembers = (poolId: string) => useStored<Member[]>(key(poolId), () => SEED[poolId] ?? [])[0];
const read = (poolId: string) => peek<Member[]>(key(poolId)) ?? SEED[poolId] ?? [];
const today = () => new Date().toISOString().slice(0, 10);

/** Counts for the funnel: each stage includes everyone who got further. */
export function funnel(members: Member[]) {
  const n = (s: MemberStatus[]) => members.filter((m) => s.includes(m.status)).length;
  return {
    people: members.length,
    contacted: n(['Contacted', 'Replied', 'Not interested', 'Applied', 'Hired']),
    replied: n(['Replied', 'Not interested', 'Applied', 'Hired']),
    applied: n(['Applied', 'Hired']),
    hired: n(['Hired']),
  };
}

function touch(poolId: string, ids: string[], what: string, by: string, bump: boolean) {
  put(key(poolId), read(poolId).map((m) => ids.includes(m.id)
    ? { ...m, status: bump && m.status === 'Not contacted' ? 'Contacted' : m.status, lastTouch: { what, at: today(), by } }
    : m));
}

export const messageMembers = (poolId: string, ids: string[], by: string) => touch(poolId, ids, 'Message sent', by, true);
export const inviteMembers = (poolId: string, ids: string[], jobTitle: string, by: string) => touch(poolId, ids, `Invited to apply to ${jobTitle}`, by, true);
export const removeMembers = (poolId: string, ids: string[]) => put(key(poolId), read(poolId).filter((m) => !ids.includes(m.id)));
