import { peek, put, useStored } from '../store';

/*
  Who is using the Internal ATS. The hiring system is seen through one
  person's eyes, usually a recruiter's. The prototype can switch between a
  recruiter and a hiring manager from the avatar in the browser bar, and
  every message, invitation or new pool is stamped with whoever is signed in.
*/
export type PersonId = 'hera' | 'ackbar';
export interface Person { id: PersonId; name: string; role: 'Recruiter' | 'Hiring manager'; team: string; initials: string }

export const PEOPLE: Record<PersonId, Person> = {
  hera:   { id: 'hera',   name: 'Hera Syndulla',  role: 'Recruiter',      team: 'Starfighter Corps recruiting', initials: 'HS' },
  ackbar: { id: 'ackbar', name: 'Admiral Ackbar', role: 'Hiring manager', team: 'Starfighter Corps',            initials: 'AA' },
};

const KEY = 'session:me';
const DEFAULT: PersonId = 'hera';
/** Anything saved by an older version of the prototype falls back to the recruiter. */
const known = (id: unknown): PersonId => (typeof id === 'string' && id in PEOPLE ? (id as PersonId) : DEFAULT);

export function setMe(id: PersonId) { put(KEY, id); }
export const useMe = (): PersonId => known(useStored<PersonId>(KEY, () => DEFAULT)[0]);
export const currentMe = (): PersonId => known(peek(KEY));
export const person = (id: PersonId) => PEOPLE[known(id)];
