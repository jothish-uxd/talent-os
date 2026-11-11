/**
 * The apps in Talent OS. Each opens in its own browser frame,
 * under its own host, because each is a separate product its users visit.
 */
export type AppId = 'hiring';

export interface AppInfo {
  id: AppId;
  /** Route in this site */
  path: string;
  name: string;
  /** Host shown in the browser frame's address bar */
  host: string;
  /** Who uses it, one line */
  audience: string;
  summary: string;
  status: 'coming-soon' | 'in-progress';
}

export const APPS: AppInfo[] = [
  {
    id: 'hiring',
    path: '/hiring-system',
    name: 'Hiring system',
    host: 'hire.talentos.app',
    audience: 'Recruiters and hiring managers',
    summary: 'Where recruiters send assessments to candidates and read their results.',
    status: 'in-progress',
  },
];

export const appById = (id: AppId) => APPS.find((a) => a.id === id)!;
