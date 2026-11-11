# Talent OS

A prototype of an internal hiring system (ATS) for recruiters and hiring managers, built on [Enterprise Library](https://jothish-uxd.github.io/enterprise-library/): Geist, monochrome ink on white, and the app shown inside its own browser frame.

It started as a copy of the Hiring system tab from [Online Assessments](https://github.com/jothish-uxd/online-assessments).

## Hiring system

| Tab | What it is | Status |
| --- | --- | --- |
| Jobs | Requisitions and where their candidates are in the pipeline | Built |
| Talent | Pools and prospects you might hire | Built |
| Applicants | Everyone who has applied, by job and stage | Coming soon |
| Interviews | Scheduled interviews, panels and feedback | Coming soon |

A job's candidate table links each proctored session to its report in Online Assessments, which opens in a new tab.

## Run it

```sh
npm install
npm run dev
```

`npm run build` writes `dist/`. Pushing to `main` deploys to GitHub Pages (Settings → Pages → Source: GitHub Actions).

Tokens, shared styles and components come from `@jothish-uxd/enterprise-library`; see [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).
