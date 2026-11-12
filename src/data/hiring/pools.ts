import { peek, put, useStored } from '../store';

/*
  Talent pools: groups of people a recruiter can reach out to together.
  Two kinds:
  - Suggested pools: one per open job, kept current by the system with people
    who qualify and aren't already hired or interviewing for it.
  - Your pools: any grouping a recruiter finds useful. A pool is either
    hand-picked (people are added one by one) or kept up to date by a rule.
*/

export interface SuggestedPool {
  id: string;
  reqId: string;
  title: string;
  people: number;
  newThisWeek: number;
  /** People with a valid OA result that counts for this job */
  validOa: number;
  notContacted: number;
  updated: string;
}

export interface Pool {
  id: string;
  name: string;
  about: string;
  kind: 'Hand-picked' | 'Rule';
  /** For rule pools: the rule in words */
  rule?: string;
  owner: string;
  sharedWith: 'Only me' | 'Recruiting team' | 'Starfighter Corps hiring';
  people: number;
  contacted: number;
  replied: number;
  applied: number;
  hired: number;
  created: string;
  lastActivity: string;
}

export const SUGGESTED: SuggestedPool[] = [
  { id: 'SP-4471', reqId: 'REQ-4471', title: 'Starfighter Pilot L4', people: 142, newThisWeek: 9, validOa: 38, notContacted: 61, updated: '2026-11-11' },
  { id: 'SP-4502', reqId: 'REQ-4502', title: 'Hangar Mechanic L3', people: 87, newThisWeek: 4, validOa: 21, notContacted: 40, updated: '2026-11-11' },
  { id: 'SP-4519', reqId: 'REQ-4519', title: 'Intelligence Analyst L5', people: 36, newThisWeek: 2, validOa: 7, notContacted: 22, updated: '2026-11-10' },
  { id: 'SP-4533', reqId: 'REQ-4533', title: 'Flight Instructor L5', people: 29, newThisWeek: 1, validOa: 14, notContacted: 9, updated: '2026-11-11' },
  { id: 'SP-4560', reqId: 'REQ-4560', title: 'Squadron Leader L6', people: 12, newThisWeek: 0, validOa: 5, notContacted: 6, updated: '2026-11-09' },
];

const POOLS: Pool[] = [
  {
    id: 'POOL-118', name: 'Former Rebel Alliance pilots', about: 'Pilots who flew with Alliance squadrons, for any flight role.',
    kind: 'Hand-picked', owner: 'Hera Syndulla', sharedWith: 'Starfighter Corps hiring',
    people: 48, contacted: 41, replied: 26, applied: 11, hired: 3, created: '2026-03-04', lastActivity: '2026-11-10',
  },
  {
    id: 'POOL-131', name: 'Strong OA results, not yet interviewed', about: 'Ready for a recruiter call; their results still count.',
    kind: 'Rule', rule: 'OA band is Strong · result still valid · no interview scheduled', owner: 'Mon Mothma', sharedWith: 'Recruiting team',
    people: 23, contacted: 15, replied: 9, applied: 5, hired: 0, created: '2026-08-19', lastActivity: '2026-11-11',
  },
  {
    id: 'POOL-124', name: 'Silver medalists, 2026', about: 'Reached the final round this year but didn’t get the offer.',
    kind: 'Rule', rule: 'Stage reached Offer or final interview · not hired · 2026', owner: 'Jyn Erso', sharedWith: 'Recruiting team',
    people: 34, contacted: 30, replied: 19, applied: 8, hired: 2, created: '2026-05-02', lastActivity: '2026-11-06',
  },
  {
    id: 'POOL-140', name: 'Ask again in spring', about: 'Interested, but not ready to move until next year.',
    kind: 'Hand-picked', owner: 'Hera Syndulla', sharedWith: 'Only me',
    people: 15, contacted: 15, replied: 12, applied: 0, hired: 0, created: '2026-09-28', lastActivity: '2026-10-30',
  },
  {
    id: 'POOL-109', name: 'Cold-weather ops, Hoth veterans', about: 'Mechanics and crew who kept Echo Base running.',
    kind: 'Hand-picked', owner: 'Rose Tico', sharedWith: 'Recruiting team',
    people: 19, contacted: 11, replied: 5, applied: 3, hired: 1, created: '2026-01-15', lastActivity: '2026-10-21',
  },
  {
    id: 'POOL-145', name: 'Referred by Rogue Squadron', about: 'Everyone a current Rogue Squadron pilot has referred.',
    kind: 'Rule', rule: 'Source is a referral · referrer is in Rogue Squadron', owner: 'Hera Syndulla', sharedWith: 'Starfighter Corps hiring',
    people: 12, contacted: 4, replied: 3, applied: 1, hired: 0, created: '2026-10-22', lastActivity: '2026-11-08',
  },
];

const KEY = 'hiring:v1:pools';
export const usePools = () => useStored<Pool[]>(KEY, () => POOLS)[0];
const all = () => peek<Pool[]>(KEY) ?? POOLS;
const today = () => new Date().toISOString().slice(0, 10);

export function createPool(name: string, about: string, owner: string, sharedWith: Pool['sharedWith']) {
  const n = Math.max(...all().map((p) => Number(p.id.split('-')[1]))) + 1;
  const pool: Pool = {
    id: `POOL-${n}`, name, about, kind: 'Hand-picked', owner, sharedWith,
    people: 0, contacted: 0, replied: 0, applied: 0, hired: 0, created: today(), lastActivity: today(),
  };
  put(KEY, [pool, ...all()]);
  return pool;
}
