# Angus Hally — Maths Teacher CV

> **Workflow status (2026-05-26):** ✅ Frame · 🟡 Research (skeletal — primary source material lives outside this repo) · ✅ Curate · ✅ Render at `/teacher` · ✅ Propagate (chatbot-knowledge entry at `docs/chatbot-knowledge/teacher.md`). See [persona-page-workflow.md](../guides/persona-page-workflow.md).
>
> ⚠ Source-material gap: this is the thinnest research doc in the set. The only primary material in this repo is the bullet in `public/resume.html` and one milestone in `src/data/careerMilestones.ts` (with a teaching photo). The Phase 2 content below is best-effort scaffold with explicit `[ANGUS TO FILL]` markers where exam-result deltas, observation feedback, and specific class detail would go before any external use.

## Phase 1 — Frame

- **Audience:** Heads of department and headteachers at UK secondary schools; TeachFirst alumni network; tutoring agencies; edtech ventures (Eedi, Up Learn, Sparx, etc.) hiring content / pedagogy roles; parents seeking 1:1 tutoring at A-Level.
- **Question they're answering:** "Can he hold a Year 10 set and get them through a GCSE?" / for edtech: "Does he understand what it's actually like in the classroom?"
- **Tagline (working):** "Two years teaching GCSE and A-Level maths in Harlow. The hardest thing I've done. Where I learned to operate."

## Phase 2 — Research

### Profile

Two-year TeachFirst leadership-development placement at Burnt Mill Academy in Harlow, teaching GCSE and A-Level mathematics from 2016 to 2018. TeachFirst recruits high-performing graduates into challenging schools on a two-year training programme; the placement combines a PGCE with a deep operational immersion in a single school. To this day the hardest thing I've done — partly because of the workload, partly because teaching teenagers maths punishes any laziness in your own thinking.

Everything since has been shaped by it. The product-and-operator instinct (own the whole thing, including the parts you don't want to), the willingness to teach (literally — co-founder, advisor, junior dev), and the comfort with being wrong in public all trace back to those two years.

### Where I taught

**Burnt Mill Academy — Harlow, Essex** *(2016–2018)*
A large secondary school serving a mixed-intake catchment in Essex. Mathematics department; GCSE foundation and higher tier classes plus A-Level mathematics. Pastoral form group.

*[ANGUS TO FILL: Year groups taught, set range (top set / middle / intervention), any sixth-form A-Level groups specifically, any subject extensions like Further Maths or D&T.]*

### Outcomes

*[ANGUS TO FILL: Exam-result deltas for cohorts taught — where classes started in mock results vs. where they finished at GCSE / A-Level. Any standout student outcomes (e.g. "C-grade-on-entry cohort: X% achieved grade 5+"). This is the highest-leverage content on a maths-teacher CV; without it the page is positioning, not evidence.]*

### Pastoral and intervention

*[ANGUS TO FILL: Form group, any safeguarding cases / pastoral lead work, after-school intervention sessions, GCSE booster sessions, any specific student turnarounds.]*

### Extension activities

*[ANGUS TO FILL: Did you run maths club, Olympiad coaching, debate, public speaking, or anything beyond timetabled teaching? Any sixth-form mentoring? UKMT challenges?]*

### What teaching taught me

A short narrative section on the transferable skills:

- **Knowing the gap between your model of a topic and the student's model.** This is the same skill that lets me brief engineers as a non-engineer and brief investors as a non-investor — model what they currently hold, then build from there.
- **Composure under low-status conditions.** Holding a Year 10 bottom set on a Friday afternoon is a particular kind of performance discipline.
- **Routine as a force multiplier.** Lesson structure, do-now warm-up, modelling, independent practice, plenary. The pedagogy that makes the classroom function is what makes anything function — a startup operating system, a code review process, a meeting agenda.
- **Marking 31 books at midnight on Sunday.** Operator stamina starts here.

### Pedagogical principles

A short list of how I'd teach now (relevant for edtech / tutoring positioning):

- Diagnostic-first — find the misconception, then teach the correction; don't re-teach what's already known.
- Worked examples beat explanation. Modelling out loud beats both.
- Spaced retrieval over re-exposure.
- A student who can explain the concept has it. A student who can apply it in a non-routine context has *really* got it.
- The single biggest determinant of A-Level outcomes is whether the student is willing to be wrong in front of you — work on that before working on technique.

### Experience (teaching-relevant only)

- **Mathematics Teacher — TeachFirst / Burnt Mill Academy, Harlow** · 2016–2018
- Continuing relevance: at HeyLina I currently brief, mentor, and teach across a non-technical co-founder, a mobile engineer, clinical advisors, and investors. The teaching skill stayed live.

### Education

**BSc Philosophy & Economics, First Class Honours** — London School of Economics · 2013–2016
**PGCE (TeachFirst route)** — completed alongside the 2016–2018 placement *(institution: [ANGUS TO CONFIRM])*

## Phase 3 — Curated for render

The `/teacher` page should lead with:

1. **Hero** — name + tagline + the teaching photo (`/20180311_Teaching_Harlow_UK.jpeg` — already in `public/`).
2. **The two-year placement** — a Mantine card with the Burnt Mill Academy summary; clear about TeachFirst and the leadership-development framing.
3. **Outcomes** — if exam-result data is added, lead with this. If not, an "evidence pending" placeholder card is better than fluff.
4. **What teaching taught me** — a short prose section (the operator-transferable-skills narrative).
5. **Pedagogical principles** — a 5-bullet card for the edtech / tutoring audience.
6. **Education** — LSE + PGCE.

Visual treatment: the existing teaching photo is the natural hero. Warm tone (think Mantine's `accent` colour from the existing palette — used for the teacher milestone in `careerMilestones.ts`).

Drop (over-collected, NOT for the rendered page in this pass):
- The longer "what teaching taught me" narrative beyond 4 bullets
- Anything in the `[ANGUS TO FILL]` blocks until he fills them in

## Open questions for Angus

- Exam-result deltas: any class-level cohort data you can share, even anonymised?
- Year groups + specific classes taught (set range, A-Level groups)?
- Observation feedback / lesson-plan archive — any documentation worth surfacing?
- Pastoral / safeguarding / form-group context?
- Extension activities (maths club, Olympiad, mentoring)?
- PGCE awarding institution (Canterbury Christ Church / IoE / etc.)?
- Audience priority: school recruiters, edtech ventures, or 1:1 tutoring parents? Each pulls the framing in a slightly different direction.
- Is the rendered route `/teacher` or `/maths-teacher`?
