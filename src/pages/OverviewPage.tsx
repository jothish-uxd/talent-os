import { Link } from 'react-router-dom';
import { usePageTitle } from '../components/usePageTitle';
import { APPS } from '../data/apps';

const CAPABILITIES = [
  {
    term: 'One record per person',
    desc: 'Every candidate has a single profile that follows them from first contact to hire and beyond. Applications, assessments, interviews, messages and notes all land on the same record.',
  },
  {
    term: 'Talent pools and prospects',
    desc: 'Group people however it helps: pools you build yourself, or pools the system keeps current for each job you’re hiring for. Track prospects one by one before they ever apply.',
  },
  {
    term: 'Outreach and nurture',
    desc: 'Message people, invite them to apply and follow up, with every touchpoint kept on their record. Keep warm the people you’re not ready to hire yet.',
  },
  {
    term: 'Jobs and pipelines',
    desc: 'Requisitions, recruiters and hiring managers, with every candidate’s stage in view, from applied and screening through assessment, interview, offer and hire.',
  },
  {
    term: 'Assessments and interviews',
    desc: 'Send online assessments, read scores and proctoring results, then schedule interviews and collect panel feedback, all without leaving the candidate’s record.',
  },
  {
    term: 'Relationships that last',
    desc: 'Silver medalists, past applicants and alumni stay in the CRM, so the next opening starts from people you already know rather than an empty search.',
  },
];

const MODULES = [
  { name: 'Jobs', about: 'Requisitions and where their candidates are in the pipeline', status: 'Built' },
  { name: 'Talent', about: 'Pools and prospects you might hire', status: 'Built' },
  { name: 'Applicants', about: 'Everyone who has applied, by job and stage', status: 'Being designed' },
  { name: 'Interviews', about: 'Scheduled interviews, panels and feedback', status: 'Being designed' },
];

export default function OverviewPage() {
  const h = usePageTitle('Overview');
  const hiring = APPS[0];

  return (
    <main id="main" className="main main--solo">
      <section className="hero" aria-labelledby="ov-title">
        <h1 ref={h} tabIndex={-1} id="ov-title" className="page-title">
          A full CRM for talent.
        </h1>
        <p className="page-lede">
          Talent OS is where recruiting teams find, engage and hire people, and stay in touch with
          them long after a single job closes. An applicant tracking system tracks applications.
          Talent OS tracks relationships.
        </p>
        <div className="hero-actions">
          <Link to={hiring.path} className="btn btn--primary">Open the hiring system</Link>
        </div>
      </section>

      <div className="doc-block" style={{ marginTop: 96 }}>
        <h2 className="doc-h2">Why a CRM, not just an ATS</h2>
        <div className="prose">
          <p>
            Most hiring tools start when someone applies and stop when the job is filled. Everything
            before and after lives in spreadsheets, inboxes and a recruiter’s memory. The strong
            finalist who didn’t get the offer, the engineer sourced last spring, the past applicant
            who would be perfect for a new role: they’re lost the moment the requisition closes.
          </p>
          <p>
            Talent OS treats candidates the way a sales CRM treats customers. Each person has one
            lasting record, and every job, message, assessment and interview adds to it. Recruiters
            build pipelines from people they already know, and hiring managers see the whole story,
            not just the latest application.
          </p>
        </div>
      </div>

      <div className="doc-block">
        <h2 className="doc-h2">What it does</h2>
        <p className="doc-p">From the first message to the signed offer, and every hire after that.</p>
        <dl className="feature-list">
          {CAPABILITIES.map((c) => (
            <div key={c.term}>
              <dt>{c.term}</dt>
              <dd>{c.desc}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="doc-block">
        <h2 className="doc-h2">Who uses it</h2>
        <dl className="feature-list">
          <div><dt>Sourcers</dt><dd>Find people, add them as prospects and build pools for roles that open often.</dd></div>
          <div><dt>Recruiters</dt><dd>Run each job’s pipeline, send assessments and keep candidates moving.</dd></div>
          <div><dt>Hiring managers</dt><dd>Review candidates, read results and give interview feedback.</dd></div>
          <div><dt>Recruiting leaders</dt><dd>See open roles, pipeline health and offers across the team.</dd></div>
        </dl>
      </div>

      <div className="doc-block">
        <h2 className="doc-h2">What’s here today</h2>
        <p className="doc-p">
          The hiring system opens in its own browser window, as it would for a recruiter. This
          prototype uses sample data and keeps any changes in your browser.
        </p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th scope="col">Area</th><th scope="col">What it covers</th><th scope="col">Status</th></tr>
            </thead>
            <tbody>
              {MODULES.map((m) => (
                <tr key={m.name}>
                  <th scope="row">{m.name}</th>
                  <td>{m.about}</td>
                  <td><span className="tag">{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="doc-cta">
          <Link to={hiring.path} className="btn btn--secondary">Open the hiring system</Link>
        </p>
      </div>
    </main>
  );
}
