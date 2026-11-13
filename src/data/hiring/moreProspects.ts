import type { Application, Message, OaResult, Talent } from './talent';

/*
  40 more prospects (65 in all), so the Prospects list needs paging.
  Each row is one person; build() turns their situation into matching
  applications, assessment results, flags and messages, so every profile
  tells a consistent story without writing each one out by hand.
*/

type Family = 'pilot' | 'mechanic' | 'analyst';
type Situation =
  | 'new' | 'waiting' | 'replied' | 'declined'
  | 'invited' | 'applied' | 'assessment' | 'screening' | 'interviewing'
  | 'past' | 'withdrew';

interface Row {
  n: number; name: string; pro: string; fam: Family; job: keyof typeof JOBS; sit: Situation;
  head: string; loc: string; tz: string; via: Talent['preferredContact'];
  src: string; own: 'H' | 'M' | 'J'; added: string; last: string;
  now: [string, string, string]; before?: [string, string, string, string]; school: [string, string, string, string];
  skills: string[]; note: [string, string, boolean?];
  oa?: [OaResult['band'], number, OaResult['proctoring']?];
}

const JOBS = {
  P4: { reqId: 'REQ-4471', title: 'Starfighter Pilot L4' },
  L6: { reqId: 'REQ-4560', title: 'Squadron Leader L6' },
  I5: { reqId: 'REQ-4533', title: 'Flight Instructor L5' },
  M3: { reqId: 'REQ-4502', title: 'Hangar Mechanic L3' },
  A5: { reqId: 'REQ-4519', title: 'Intelligence Analyst L5' },
};
const OWNER = { H: 'Hera Syndulla', M: 'Mon Mothma', J: 'Jyn Erso' };

const ROWS: Row[] = [
  /* ---------- Pilots ---------- */
  { n: 601, name: 'Ooryl Qrygg', pro: 'he/him', fam: 'pilot', job: 'P4', sit: 'interviewing', head: 'X-wing pilot · Rogue Squadron, 5 years', loc: 'Gand', tz: 'Mid Rim Time', via: 'Email', src: 'Pool: Former Rebel Alliance pilots', own: 'H', added: '2026-09-02', last: '2026-11-11',
    now: ['Rogue Squadron', 'X-wing pilot', '2021-06'], school: ['Gand Findsman Academy', 'Certificate', 'Tracking and navigation', '2015–2018'], skills: ['X-wing', 'Navigation', 'Close escort'], note: ['Speaks of himself', 'Uses his full name only after a big achievement; panel briefed'], oa: ['Strong', 88] },
  { n: 602, name: 'Mirax Terrik', pro: 'she/her', fam: 'pilot', job: 'P4', sit: 'replied', head: 'Freighter captain and smuggling-route pilot', loc: 'Corellia', tz: 'Corellian Standard Time', via: 'SMS', src: 'Referral from Corran Horn', own: 'H', added: '2026-10-20', last: '2026-11-09',
    now: ['Pulsar Skate', 'Captain', '2019-03'], before: ['Terrik Trading', 'Pilot', '2015-01', '2019-02'], school: ['Corellian Polytechnic', 'Diploma', 'Freighter operations', '2012–2014'], skills: ['YT-series freighters', 'Hyperspace routing', 'Negotiation'], note: ['Interested in', 'A pilot role with fewer long hauls'] },
  { n: 603, name: 'Elscol Loro', pro: 'she/her', fam: 'pilot', job: 'L6', sit: 'screening', head: 'Resistance leader turned squadron pilot', loc: 'Cilpar', tz: 'Mid Rim Time', via: 'Email', src: 'Applied through the careers site', own: 'M', added: '2026-10-25', last: '2026-11-10',
    now: ['Cilpar resistance', 'Squadron commander', '2020-02'], school: ['Cilpar Academy', 'Diploma', 'Civil defence', '2013–2015'], skills: ['Ground support', 'Squadron command', 'Guerrilla tactics'], note: ['Leadership', 'Led 40 fighters in the liberation of Cilpar'], oa: ['Recommended', 80] },
  { n: 604, name: 'Myn Donos', pro: 'he/him', fam: 'pilot', job: 'P4', sit: 'past', head: 'X-wing pilot and marksman', loc: 'Corellia', tz: 'Corellian Standard Time', via: 'Email', src: 'Past applicant', own: 'H', added: '2026-02-10', last: '2026-05-02',
    now: ['Wraith Squadron', 'Pilot', '2022-08'], before: ['Talon Squadron', 'Flight leader', '2018-04', '2022-07'], school: ['Corellian Flight Academy', 'Commission', 'Starfighter piloting', '2014–2018'], skills: ['X-wing', 'Marksmanship', 'Precision strikes'], note: ['Since then', 'Back on full flight status after a year’s leave'], oa: ['Borderline', 63] },
  { n: 605, name: 'Ibtisam', pro: 'she/her', fam: 'pilot', job: 'P4', sit: 'new', head: 'A-wing pilot · Rogue Squadron reserve', loc: 'Mon Calamari', tz: 'Mon Cal Standard Time', via: 'Email', src: 'Sourced on HoloNet Talent', own: 'H', added: '2026-11-06', last: '2026-11-06',
    now: ['Rogue Squadron reserve', 'A-wing pilot', '2022-01'], school: ['Mon Cala Naval Academy', 'Commission', 'Interceptor flight', '2017–2021'], skills: ['A-wing', 'Interceptor tactics', 'Aquatic launches'], note: ['Good fit for', 'Starfighter Pilot L4'] },
  { n: 606, name: 'Plourr Ilo', pro: 'she/her', fam: 'pilot', job: 'L6', sit: 'waiting', head: 'Squadron pilot · noble house of Alderaan', loc: 'Alderaan (former)', tz: 'Core Worlds Time', via: 'Email', src: 'Sourced on HoloNet Talent', own: 'M', added: '2026-10-08', last: '2026-10-28',
    now: ['Rogue Squadron', 'Pilot', '2019-11'], school: ['Royal Academy of Alderaan', 'Bachelor’s', 'Statecraft', '2011–2015'], skills: ['X-wing', 'Diplomacy', 'Command presence'], note: ['Waiting on a reply', 'Messaged Oct 28'] },
  { n: 607, name: 'Rhysati Ynr', pro: 'she/her', fam: 'pilot', job: 'I5', sit: 'invited', head: 'X-wing pilot and simulator instructor', loc: 'Bespin', tz: 'Bespin Standard Time', via: 'Email', src: 'Pool: Former Rebel Alliance pilots', own: 'H', added: '2026-09-15', last: '2026-11-04',
    now: ['Rogue Squadron', 'Pilot and sim instructor', '2020-05'], school: ['Bespin Flight School', 'Pilot’s licence', 'Cloud-city flight', '2014–2016'], skills: ['X-wing', 'Simulator training', 'Low-visibility flying'], note: ['Invited', 'Invited to apply to Flight Instructor L5 on Nov 4'] },
  { n: 608, name: 'Grizz Frix', pro: 'he/him', fam: 'pilot', job: 'P4', sit: 'declined', head: 'Y-wing pilot and practical joker', loc: 'Ord Mantell', tz: 'Galactic Standard Time', via: 'SMS', src: 'Career fair on Chandrila', own: 'H', added: '2026-10-09', last: '2026-10-22',
    now: ['Wraith Squadron', 'Y-wing pilot', '2021-09'], school: ['Ord Mantell Flight College', 'Diploma', 'Bomber operations', '2016–2018'], skills: ['Y-wing', 'Bombing runs', 'Morale'], note: ['Said no for now', 'Happy in his squadron; open to hearing again in a year'] },
  { n: 609, name: 'Kell Tainer', pro: 'he/him', fam: 'pilot', job: 'P4', sit: 'assessment', head: 'Pilot and demolitions specialist', loc: 'Coruscant', tz: 'Galactic Standard Time', via: 'Email', src: 'Referral from Wedge Antilles', own: 'H', added: '2026-10-14', last: '2026-11-03',
    now: ['Wraith Squadron', 'Pilot', '2021-02'], before: ['Alliance engineers', 'Demolitions tech', '2017-06', '2021-01'], school: ['Coruscant Technical Institute', 'Diploma', 'Demolitions engineering', '2014–2017'], skills: ['X-wing', 'Demolitions', 'Mechanical repair'], note: ['OA not finished', 'Started Nov 3; about half done'] },
  { n: 610, name: 'Garik Loran', pro: 'he/him', fam: 'pilot', job: 'L6', sit: 'interviewing', head: 'Wraith Squadron pilot · former holodrama actor', loc: 'Coruscant', tz: 'Galactic Standard Time', via: 'Email', src: 'Applied through the careers site', own: 'M', added: '2026-09-28', last: '2026-11-12',
    now: ['Wraith Squadron', 'Executive officer', '2020-01'], school: ['Coruscant School of Performing Arts', 'Bachelor’s', 'Drama', '2010–2014'], skills: ['X-wing', 'Undercover operations', 'Public speaking'], note: ['Also known as', '“Face” in his squadron'], oa: ['Strong', 92] },
  { n: 611, name: 'Ton Phanan', pro: 'he/him', fam: 'pilot', job: 'P4', sit: 'withdrew', head: 'Pilot and field medic', loc: 'Sullust', tz: 'Sullust Standard Time', via: 'Email', src: 'Agency: Outer Rim Talent', own: 'H', added: '2026-08-11', last: '2026-09-30',
    now: ['Wraith Squadron', 'Pilot and medic', '2020-04'], school: ['Sullust Medical College', 'Bachelor’s', 'Field medicine', '2013–2017'], skills: ['X-wing', 'Field medicine', 'Triage'], note: ['Agency', 'Through Outer Rim Talent; fee applies if hired', true] },
  { n: 612, name: 'Lara Notsil', pro: 'she/her', fam: 'pilot', job: 'P4', sit: 'applied', head: 'Starfighter pilot and comms specialist', loc: 'Aldivy', tz: 'Mid Rim Time', via: 'Portal', src: 'Applied through the careers site', own: 'J', added: '2026-11-05', last: '2026-11-05',
    now: ['New Republic Starfighter Corps', 'Pilot', '2023-02'], school: ['Aldivy Academy', 'Diploma', 'Communications', '2018–2020'], skills: ['X-wing', 'Comms', 'Slicing'], note: ['Background check', 'Gaps in her service record; verify before an offer', true] },
  { n: 613, name: 'Tyria Sarkin', pro: 'she/her', fam: 'pilot', job: 'I5', sit: 'replied', head: 'X-wing pilot and survival trainer', loc: 'Toprawa', tz: 'Outer Rim Time', via: 'Email', src: 'Pool: Former Rebel Alliance pilots', own: 'M', added: '2026-09-20', last: '2026-11-07',
    now: ['Wraith Squadron', 'Pilot', '2021-05'], school: ['Toprawa Ranger School', 'Certificate', 'Wilderness survival', '2015–2017'], skills: ['X-wing', 'Survival training', 'Orienteering'], note: ['Interested in', 'Teaching survival as part of Flight Instructor'] },
  { n: 614, name: 'Nawara Ven', pro: 'he/him', fam: 'pilot', job: 'P4', sit: 'waiting', head: 'X-wing pilot · trained advocate', loc: 'Ryloth', tz: 'Outer Rim Time', via: 'Email', src: 'Sourced on HoloNet Talent', own: 'J', added: '2026-10-16', last: '2026-10-31',
    now: ['Rogue Squadron', 'Pilot', '2020-08'], school: ['Ryloth University', 'Law degree', 'Advocacy', '2012–2016'], skills: ['X-wing', 'Negotiation', 'Legal'], note: ['Waiting on a reply', 'Messaged Oct 31'] },
  { n: 615, name: 'Asyr Sei’lar', pro: 'she/her', fam: 'pilot', job: 'P4', sit: 'screening', head: 'X-wing pilot · Bothan', loc: 'Bothawui', tz: 'Mid Rim Time', via: 'Email', src: 'Referral from Gavin Darklighter', own: 'H', added: '2026-10-19', last: '2026-11-08',
    now: ['Rogue Squadron', 'Pilot', '2022-03'], before: ['Bothan Martial Forces', 'Pilot', '2019-01', '2022-02'], school: ['Bothawui Academy', 'Commission', 'Starfighter piloting', '2015–2018'], skills: ['X-wing', 'Information gathering', 'Ambush tactics'], note: ['Referral', 'Referred by Gavin Darklighter'], oa: ['Recommended', 77] },
  { n: 616, name: 'Torra Doza', pro: 'she/her', fam: 'pilot', job: 'P4', sit: 'invited', head: 'Ace racer · Colossus Aces', loc: 'Castilon', tz: 'Outer Rim Time', via: 'SMS', src: 'Referral from Jarek Yeager', own: 'H', added: '2026-10-12', last: '2026-11-02',
    now: ['Colossus Aces', 'Ace pilot', '2023-01'], school: ['Colossus Flight Academy', 'Certificate', 'Racing', '2020–2022'], skills: ['Racing', 'High-speed manoeuvres', 'Custom fighters'], note: ['Invited', 'Invited Nov 2; hasn’t opened it yet'] },
  { n: 617, name: 'Hype Fazon', pro: 'he/him', fam: 'pilot', job: 'P4', sit: 'past', head: 'Ace racer · top of the Colossus rankings', loc: 'Castilon', tz: 'Outer Rim Time', via: 'SMS', src: 'Past applicant', own: 'J', added: '2026-03-02', last: '2026-04-19',
    now: ['Colossus Aces', 'Ace pilot', '2021-06'], school: ['Rodia Speed Academy', 'Certificate', 'Racing', '2017–2019'], skills: ['Racing', 'Showmanship', 'Speed runs'], note: ['Last time', 'Not selected: strong flying, weak on teamwork in the panel'], oa: ['Recommended', 72] },
  { n: 618, name: 'Zay Versio', pro: 'she/her', fam: 'pilot', job: 'P4', sit: 'new', head: 'Pilot and scout · New Republic', loc: 'Vardos', tz: 'Mid Rim Time', via: 'Portal', src: 'Referral from Iden Versio', own: 'M', added: '2026-11-07', last: '2026-11-07',
    now: ['New Republic Starfighter Corps', 'Scout pilot', '2024-01'], school: ['Vardos Academy', 'Diploma', 'Scouting', '2020–2023'], skills: ['Reconnaissance', 'X-wing', 'Stealth'], note: ['Referral', 'Referred by Iden Versio, also a prospect'] },
  { n: 619, name: 'Kyle Katarn', pro: 'he/him', fam: 'pilot', job: 'L6', sit: 'replied', head: 'Mercenary pilot and special operative', loc: 'Sulon', tz: 'Outer Rim Time', via: 'Email', src: 'Sourced on HoloNet Talent', own: 'M', added: '2026-10-02', last: '2026-11-06',
    now: ['Independent', 'Contract pilot and operative', '2018-01'], before: ['Imperial Army', 'Officer', '2013-05', '2017-12'], school: ['Carida Academy', 'Commission', 'Officer training', '2010–2013'], skills: ['Moldy Crow freighter', 'Infiltration', 'Leadership'], note: ['Background check', 'Previous Imperial service: extended background check needed', true] },
  { n: 620, name: 'Inyri Forge', pro: 'she/her', fam: 'pilot', job: 'P4', sit: 'applied', head: 'X-wing pilot and slicer', loc: 'Kessel', tz: 'Outer Rim Time', via: 'Email', src: 'Applied through the careers site', own: 'H', added: '2026-11-08', last: '2026-11-08',
    now: ['Rogue Squadron', 'Pilot', '2022-09'], school: ['Kessel Technical School', 'Certificate', 'Computer systems', '2017–2019'], skills: ['X-wing', 'Slicing', 'Security systems'], note: ['Next step', 'Applied Nov 8; send the OA'] },

  /* ---------- Hangar and mechanics ---------- */
  { n: 631, name: 'Neeku Vozo', pro: 'he/him', fam: 'mechanic', job: 'M3', sit: 'interviewing', head: 'Mechanic · Colossus repair shop, 4 years', loc: 'Castilon', tz: 'Outer Rim Time', via: 'Email', src: 'Referral from Kazuda Xiono', own: 'J', added: '2026-09-25', last: '2026-11-11',
    now: ['Yeager’s Repair Shop', 'Mechanic', '2022-04'], school: ['Castilon Trade School', 'Certificate', 'Starship mechanics', '2019–2021'], skills: ['Engine repair', 'Creature handling', 'Parts sorting'], note: ['Communication', 'Takes things literally; give clear, direct instructions'], oa: ['Recommended', 75] },
  { n: 632, name: 'Synara San', pro: 'she/her', fam: 'mechanic', job: 'M3', sit: 'past', head: 'Salvage mechanic · former pirate crew', loc: 'Castilon', tz: 'Outer Rim Time', via: 'Email', src: 'Past applicant', own: 'J', added: '2026-04-01', last: '2026-05-20',
    now: ['Colossus salvage', 'Mechanic', '2023-02'], before: ['Kragan’s crew', 'Spotter and mechanic', '2019-01', '2023-01'], school: ['None listed', '', '', ''], skills: ['Salvage', 'Engine rebuilds', 'Scanners'], note: ['Background check', 'Past pirate affiliation; check before an offer', true], oa: ['Borderline', 59] },
  { n: 633, name: 'Orka', pro: 'he/him', fam: 'mechanic', job: 'M3', sit: 'declined', head: 'Shop owner · Office of Acquisitions', loc: 'Castilon', tz: 'Outer Rim Time', via: 'Email', src: 'Sourced on HoloNet Talent', own: 'J', added: '2026-10-03', last: '2026-10-15',
    now: ['Office of Acquisitions', 'Co-owner', '2015-01'], school: ['Self-taught', 'Apprenticeship', 'Trading and repair', '2005–2010'], skills: ['Parts trading', 'Repair', 'Bargaining'], note: ['Said no', 'Runs his own shop; not leaving it'] },
  { n: 634, name: 'Flix', pro: 'he/him', fam: 'mechanic', job: 'M3', sit: 'declined', head: 'Shop co-owner · Office of Acquisitions', loc: 'Castilon', tz: 'Outer Rim Time', via: 'Email', src: 'Sourced on HoloNet Talent', own: 'J', added: '2026-10-03', last: '2026-10-15',
    now: ['Office of Acquisitions', 'Co-owner', '2015-01'], school: ['Self-taught', 'Apprenticeship', 'Trading and repair', '2005–2010'], skills: ['Parts trading', 'Inventory', 'Customer service'], note: ['Said no', 'Same answer as his partner Orka'] },
  { n: 635, name: 'Wrobie Tyce', pro: 'she/her', fam: 'mechanic', job: 'M3', sit: 'screening', head: 'Resistance mechanic · fighter maintenance', loc: 'D’Qar', tz: 'Outer Rim Time', via: 'Email', src: 'Internal transfer', own: 'H', added: '2026-10-21', last: '2026-11-09',
    now: ['Resistance fleet', 'Mechanic', '2021-07'], school: ['D’Qar Technical School', 'Certificate', 'Fighter maintenance', '2018–2020'], skills: ['X-wing maintenance', 'Fuel systems', 'Weapons loading'], note: ['Internal', 'Current employee; manager has been told'], oa: ['Strong', 89] },
  { n: 636, name: 'Taka Jamoreesa', pro: 'they/them', fam: 'mechanic', job: 'M3', sit: 'applied', head: 'Engineering tech · hyperdrive specialist', loc: 'Hosnian Prime', tz: 'Galactic Standard Time', via: 'Email', src: 'Applied through the careers site', own: 'J', added: '2026-11-04', last: '2026-11-04',
    now: ['Resistance fleet', 'Engineering tech', '2022-11'], school: ['Hosnian Prime Academy', 'Diploma', 'Hyperdrive engineering', '2019–2021'], skills: ['Hyperdrives', 'Diagnostics', 'Calibration'], note: ['Next step', 'Applied Nov 4; send the OA'] },
  { n: 637, name: 'Vober Dand', pro: 'he/him', fam: 'mechanic', job: 'M3', sit: 'waiting', head: 'Hangar tech · Echo Base ground crew', loc: 'Hoth (former)', tz: 'Outer Rim Time', via: 'SMS', src: 'Pool: Cold-weather ops, Hoth veterans', own: 'H', added: '2026-10-02', last: '2026-10-27',
    now: ['Alliance ground crew', 'Hangar technician', '2018-09'], school: ['Alliance Technical Corps', 'Certificate', 'Ground equipment', '2016–2018'], skills: ['Snowspeeders', 'Cold-weather maintenance', 'Tauntaun handling'], note: ['Waiting on a reply', 'Texted Oct 27'] },
  { n: 638, name: 'Derla Pidys', pro: 'she/her', fam: 'mechanic', job: 'M3', sit: 'new', head: 'Hangar tech · Echo Base, cold-weather systems', loc: 'Hoth (former)', tz: 'Outer Rim Time', via: 'Email', src: 'Pool: Cold-weather ops, Hoth veterans', own: 'H', added: '2026-11-09', last: '2026-11-09',
    now: ['Alliance ground crew', 'Hangar technician', '2019-03'], school: ['Alliance Technical Corps', 'Certificate', 'Environmental systems', '2017–2019'], skills: ['Heating systems', 'Snowspeeders', 'Shield generators'], note: ['Good fit for', 'Hangar Mechanic L3'] },
  { n: 639, name: 'Brasso', pro: 'he/him', fam: 'mechanic', job: 'M3', sit: 'replied', head: 'Salvage yard veteran · heavy equipment', loc: 'Ferrix', tz: 'Ferrix Local Time', via: 'SMS', src: 'Referral from Bix Caleen', own: 'J', added: '2026-10-26', last: '2026-11-07',
    now: ['Ferrix salvage yards', 'Equipment lead', '2008-01'], school: ['Ferrix Salvage Yard', 'Apprenticeship', 'Heavy equipment', '2004–2008'], skills: ['Heavy lifting gear', 'Welding', 'Crew safety'], note: ['Relocation', 'Would move if his family can come'] },
  { n: 640, name: 'Yolo Ziff', pro: 'he/him', fam: 'mechanic', job: 'M3', sit: 'withdrew', head: 'Racer and mechanic · Colossus', loc: 'Castilon', tz: 'Outer Rim Time', via: 'SMS', src: 'Career fair on Chandrila', own: 'J', added: '2026-08-20', last: '2026-10-01',
    now: ['Colossus Aces', 'Racer and mechanic', '2022-05'], school: ['Castilon Trade School', 'Certificate', 'Racer tuning', '2019–2021'], skills: ['Racer tuning', 'Engine swaps', 'Showmanship'], note: ['Why he withdrew', 'Signed a racing season; back in January'] },

  /* ---------- Intelligence ---------- */
  { n: 651, name: 'Jan Ors', pro: 'she/her', fam: 'analyst', job: 'A5', sit: 'interviewing', head: 'Intelligence operative · 9 years', loc: 'Coruscant', tz: 'Galactic Standard Time', via: 'Email', src: 'Referral from Kyle Katarn', own: 'M', added: '2026-09-18', last: '2026-11-12',
    now: ['Alliance Intelligence', 'Field operative', '2017-02'], school: ['University of Coruscant', 'Bachelor’s', 'Political science', '2012–2016'], skills: ['Field intelligence', 'Piloting', 'Source handling'], note: ['Final round', 'Panel on Nov 17 with Cassian Andor'], oa: ['Strong', 93] },
  { n: 652, name: 'Beaumont Kin', pro: 'he/him', fam: 'analyst', job: 'A5', sit: 'screening', head: 'Historian and Resistance intelligence officer', loc: 'D’Qar', tz: 'Outer Rim Time', via: 'Email', src: 'Internal transfer', own: 'M', added: '2026-10-24', last: '2026-11-10',
    now: ['Resistance Intelligence', 'Officer', '2020-03'], school: ['Chandrila University', 'PhD', 'Ancient history', '2012–2018'], skills: ['Research', 'Pattern analysis', 'Historical records'], note: ['Internal', 'Current employee'], oa: ['Recommended', 82] },
  { n: 653, name: 'Airen Cracken', pro: 'he/him', fam: 'analyst', job: 'A5', sit: 'replied', head: 'Head of Alliance counter-intelligence', loc: 'Contruum', tz: 'Mid Rim Time', via: 'Email', src: 'Sourced on HoloNet Talent', own: 'M', added: '2026-10-10', last: '2026-11-03',
    now: ['Alliance Intelligence', 'General, counter-intelligence', '2014-01'], school: ['Contruum Military Academy', 'Commission', 'Intelligence', '2002–2006'], skills: ['Counter-intelligence', 'Agent networks', 'Leadership'], note: ['Level', 'Far more senior than L5; ask Cassian about a lead role', true] },
  { n: 654, name: 'Arhul Hextrophon', pro: 'he/him', fam: 'analyst', job: 'A5', sit: 'waiting', head: 'Alliance historian and records keeper', loc: 'Chandrila', tz: 'Chandrila Standard Time', via: 'Email', src: 'Sourced on HoloNet Talent', own: 'M', added: '2026-10-17', last: '2026-10-30',
    now: ['Alliance High Command', 'Historian and protocol officer', '2015-06'], school: ['Chandrila University', 'Master’s', 'Archival studies', '2009–2013'], skills: ['Records analysis', 'Writing', 'Protocol'], note: ['Waiting on a reply', 'Messaged Oct 30'] },
  { n: 655, name: 'Kino Loy', pro: 'he/him', fam: 'analyst', job: 'A5', sit: 'applied', head: 'Operations floor manager · 8 years', loc: 'Narkina', tz: 'Mid Rim Time', via: 'Portal', src: 'Applied through the careers site', own: 'M', added: '2026-11-06', last: '2026-11-06',
    now: ['Narkina production floor', 'Floor manager', '2018-04'], school: ['Narkina Technical School', 'Diploma', 'Operations', '2014–2016'], skills: ['Operations', 'Team leadership', 'Process analysis'], note: ['Career change', 'Moving from operations into intelligence'] },
  { n: 656, name: 'Lonni Jung', pro: 'he/him', fam: 'analyst', job: 'A5', sit: 'new', head: 'Data analyst · security bureau, 6 years', loc: 'Coruscant', tz: 'Galactic Standard Time', via: 'Portal', src: 'Referral from Luthen Rael', own: 'M', added: '2026-11-08', last: '2026-11-08',
    now: ['Imperial Security Bureau', 'Data analyst', '2020-01'], school: ['Coruscant Institute', 'Bachelor’s', 'Data analysis', '2014–2018'], skills: ['Data analysis', 'Signals', 'Discretion'], note: ['Contact consent', 'Contact through the portal only; he can’t be reached at work', true] },
  { n: 657, name: 'Taramyn Barcona', pro: 'he/him', fam: 'analyst', job: 'A5', sit: 'withdrew', head: 'Field operations specialist', loc: 'Aldhani', tz: 'Mid Rim Time', via: 'Portal', src: 'Referral from Vel Sartha', own: 'M', added: '2026-07-22', last: '2026-09-01',
    now: ['Independent', 'Field operations', '2019-06'], before: ['Imperial Army', 'Soldier', '2014-03', '2019-05'], school: ['Imperial Academy', 'Certificate', 'Infantry', '2013–2014'], skills: ['Field operations', 'Logistics', 'Security'], note: ['Why he withdrew', 'Wanted field work, not analysis'] },
  { n: 658, name: 'Sabé', pro: 'she/her', fam: 'analyst', job: 'A5', sit: 'invited', head: 'Security and protocol officer · royal household', loc: 'Naboo', tz: 'Mid Rim Time', via: 'Email', src: 'Sourced on HoloNet Talent', own: 'J', added: '2026-10-11', last: '2026-11-01',
    now: ['Royal Naboo Security', 'Handmaiden and decoy', '2016-01'], school: ['Theed Royal Academy', 'Bachelor’s', 'Security studies', '2011–2015'], skills: ['Protective intelligence', 'Disguise', 'Protocol'], note: ['Invited', 'Invited to apply Nov 1'] },
  { n: 659, name: 'Kaeden Larte', pro: 'she/her', fam: 'analyst', job: 'A5', sit: 'assessment', head: 'Resistance scout and field reporter', loc: 'Raada', tz: 'Outer Rim Time', via: 'Email', src: 'Career fair on Chandrila', own: 'J', added: '2026-10-09', last: '2026-11-05',
    now: ['Resistance cell', 'Scout', '2021-01'], school: ['Raada Agricultural College', 'Diploma', 'Agriculture', '2016–2018'], skills: ['Scouting', 'Reporting', 'Piloting'], note: ['OA not started', 'Invited Oct 30; reminder due'] },
  { n: 660, name: 'Enfys Nest', pro: 'she/her', fam: 'analyst', job: 'A5', sit: 'past', head: 'Leader of the Cloud-Riders · field intelligence', loc: 'Savareen', tz: 'Outer Rim Time', via: 'Portal', src: 'Past applicant', own: 'M', added: '2026-03-14', last: '2026-04-30',
    now: ['Cloud-Riders', 'Leader', '2019-01'], school: ['None listed', '', '', ''], skills: ['Field intelligence', 'Swoop bikes', 'Network building'], note: ['Last time', 'Not selected for Analyst L4; wanted a field role'], oa: ['Recommended', 74, 'Under review'] },
];

/* ---------- Building a full profile from a row ---------- */

const app = (j: { reqId: string; title: string }, stage: Application['stage'], date: string, recruiter: string): Application => ({ reqId: j.reqId, title: j.title, stage, date, recruiter });
const add = (iso: string, d: number) => { const x = new Date(`${iso}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); };
const fmt = (iso: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));
const at = (iso: string, hm = '15:00') => `${iso}T${hm}:00Z`;
const mail = (name: string) => `${name.toLowerCase().normalize('NFKD').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.')}@holonet.example`;
const phone = (n: number) => `+1 (555) 0${String(n).slice(1)}-${String((n * 37) % 10000).padStart(4, '0')}`;

function build(r: Row): Talent {
  const job = JOBS[r.job];
  const owner = OWNER[r.own];
  const first = r.name.split(' ')[0];
  const oa = (taken: string, band: OaResult['band'], score: number, proctoring: OaResult['proctoring'] = 'Cleared', workflow = job.title): OaResult => ({
    workflow, version: r.fam === 'pilot' ? 5 : 3, taken, validUntil: add(taken, 180), band, score, outOf: 100, proctoring,
    reusableFor: r.fam === 'pilot' ? ['Starfighter Pilot L4', 'Flight Instructor L5', 'Squadron Leader L6'].filter((w) => w !== workflow) : [],
  });
  const to = (d: string, body: string, subject?: string): Message => ({ at: at(d), from: 'recruiter', by: owner, channel: r.via === 'Portal' ? 'Portal' : r.via, subject, body });
  const back = (d: string, body: string): Message => ({ at: at(d, '09:20'), from: 'candidate', by: r.name, channel: r.via === 'Portal' ? 'Portal' : r.via, body });
  const sys = (d: string, body: string, subject: string): Message => ({ at: at(d, '08:00'), from: 'system', by: 'Internal ATS', channel: 'Email', subject, body });

  let applications: Application[] = [];
  let results: OaResult[] = [];
  let messages: Message[] = [];
  const flags: Talent['considerations'] = [];

  switch (r.sit) {
    case 'new':
      flags.push({ label: 'Not contacted yet', value: `Added ${fmt(r.added)}`, flag: true });
      break;
    case 'waiting':
      messages = [to(r.last, `Hi ${first}, ${owner.split(' ')[0]} here from the Starfighter Corps. We’re hiring for ${job.title} and I think you’d be a strong fit. Open to a chat?`, job.title)];
      break;
    case 'replied':
      messages = [to(add(r.last, -3), `Hi ${first}, would you be open to talking about ${job.title}?`, job.title), back(r.last, 'Thanks for reaching out. Yes, I’d like to hear more. When works for you?')];
      flags.push({ label: 'Next step', value: 'Replied; set up a call' });
      break;
    case 'declined':
      messages = [to(add(r.last, -5), `Hi ${first}, any interest in ${job.title}?`, job.title), back(r.last, 'Not right now, thanks. Maybe next year.')];
      flags.push({ label: 'Not interested', value: 'Said no for now', flag: true });
      break;
    case 'invited':
      applications = [app(job, 'Invited to apply', r.last, owner)];
      messages = [to(r.last, `Hi ${first}, here’s the link to apply for ${job.title}.`, `Invitation to apply: ${job.title}`)];
      break;
    case 'applied':
      applications = [app(job, 'Applied', r.last, owner)];
      messages = [sys(r.last, `Application received for ${job.title}.`, 'Application received')];
      break;
    case 'assessment':
      applications = [app(job, 'Assessment', add(r.last, -4), owner)];
      messages = [sys(add(r.last, -4), `Invitation sent for ${job.title}. Link open for 180 days.`, 'Your online assessment')];
      break;
    case 'screening':
      applications = [app(job, 'Screening', add(r.added, 2), owner)];
      results = r.oa ? [oa(add(r.added, 6), r.oa[0], r.oa[1], r.oa[2])] : [];
      messages = [sys(add(r.added, 2), `Application received for ${job.title}.`, 'Application received'), to(r.last, `Hi ${first}, thanks for completing the assessment. Could we set up a screening call?`, job.title)];
      flags.push({ label: 'Also in process', value: `Screening for ${job.title} with ${owner}`, flag: true });
      break;
    case 'interviewing':
      applications = [app(job, 'Interviewing', add(r.added, 3), owner)];
      results = r.oa ? [oa(add(r.added, 8), r.oa[0], r.oa[1], r.oa[2])] : [];
      messages = [to(add(r.added, 15), `Hi ${first}, you’re through to the interviews for ${job.title}. Congratulations!`, 'Next steps'), back(add(r.added, 16), 'Great news, thank you!'), to(r.last, 'Your panel is confirmed for Tuesday, Nov 17 at 9:30.', 'Panel interview')];
      flags.push({ label: 'Also in process', value: `Interviewing for ${job.title} with ${owner}`, flag: true });
      break;
    case 'past': {
      const earlier = { reqId: r.fam === 'pilot' ? 'REQ-4216' : r.fam === 'mechanic' ? 'REQ-4205' : 'REQ-4401', title: r.fam === 'pilot' ? 'Starfighter Pilot L3' : r.fam === 'mechanic' ? 'Hangar Mechanic L2' : 'Intelligence Analyst L4' };
      applications = [app(earlier, 'Not selected', r.added, owner)];
      results = r.oa ? [oa(add(r.added, 7), r.oa[0], r.oa[1], r.oa[2], earlier.title)] : [];
      messages = [sys(r.last, `Thank you for applying for ${earlier.title}. We won’t be moving forward this time.`, 'Your application')];
      if (results[0] && results[0].validUntil < '2026-11-13') flags.push({ label: 'OA expired', value: `Result expired ${fmt(results[0].validUntil)}; would need to retake`, flag: true });
      break;
    }
    case 'withdrew':
      applications = [app(job, 'Withdrew', add(r.added, 2), owner)];
      messages = [back(r.last, 'I need to withdraw for now, sorry. Please keep me in mind.')];
      break;
  }
  flags.push({ label: r.note[0], value: r.note[1], flag: r.note[2] });
  if (!['new', 'waiting', 'declined', 'past', 'withdrew'].includes(r.sit) && !flags.some((f) => f.label === 'Good fit for')) {
    flags.push({ label: 'Availability', value: r.n % 3 === 0 ? 'Can start with 2 weeks’ notice' : r.n % 3 === 1 ? 'Can start with 30 days’ notice' : 'Needs 60 days’ notice' });
  }

  const [org, title, start] = r.now;
  const experience: Talent['experience'] = [{ org, title, start, location: r.loc }];
  if (r.before) experience.push({ org: r.before[0], title: r.before[1], start: r.before[2], end: r.before[3], location: r.loc });
  const [school, credential, field, years] = r.school;

  return {
    id: `TAL-20${r.n}`, name: r.name, pronouns: r.pro, headline: r.head, location: r.loc, timezone: r.tz,
    email: mail(r.name), phone: phone(r.n), preferredContact: r.via, source: r.src, owner, added: r.added, lastActivity: r.last,
    applications, education: school === 'None listed' ? [] : [{ school, credential, field, years }], experience,
    oa: results, considerations: flags, skills: r.skills, messages,
  };
}

export const MORE_PROSPECTS: Talent[] = ROWS.map(build);
