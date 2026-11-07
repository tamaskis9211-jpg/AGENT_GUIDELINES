# Reviews by a subagent

When to review, and how lean to keep it, is in `CLAUDE.md` ("Review and
delegation"). This guide is how: the prompt, a second reviewer, and keeping
score. (Adapted from the ISTQB CT-GenAI syllabus v1.1: structured prompts
§2.1, few-shot prompting, comparing models §3.1.3, metrics §2.3.1.)

## 1. The reviewer prompt — every review

Fill in this template; don't write a new prompt from scratch. Put the diffs,
the guide sections that apply and the screenshots in files, and give the
reviewer only that folder.

```
Role: you review one batch of changes for real defects, not style.

Context: <the product in one line>. <What this batch does and why, in two
or three lines, and what the brief or the user decided that the code must
follow.> Read ONLY the files in <folder>; don't explore the repos.

Input:
- <name>.diff — <what it holds; what to ignore, e.g. vendored copies>
- <guide>.md — the rules that apply (only these sections)
- <screenshots>.png — the worst case (when a screen changed)

Look for, in this order:
1. Correctness: <the rules the code must keep, e.g. "merging twice adds
   nothing">.
2. Security: <what is untrusted here and what must never happen>.
3. Against the brief and the project's rules: <the 2–4 rules most at risk>.
4. UI (when a screen changed): what the checklist and screenshots show.

Constraints: real defects only. Don't report style or taste. If you can't
verify something from the files given, say so instead of guessing.

Output: at most <N> findings, most severe first, each as
  file:line — the defect — a concrete failing input or scenario — the fix
  in one line.
Write "no finding" for an area with none. Under <W> words.

Two examples of the expected form:
- src/merge.ts:41 — duplicate ids in one code are both added, so the count
  of new results is too high — a code listing game "a" twice reports 2 new
  — dedupe the incoming list by id first.
- src/code.ts:63 — the version is parsed as a number, so "MSZ01" passes the
  "MSZ1" check — the code MSZ01-<data>-<sig> is accepted — require the
  version text to be exactly "1".
```

- Name concrete rules and failure modes in steps 1–3; "look for bugs"
  finds little.
- Keep the two examples (they set the format). Replace them with two from
  the project once it has its own.
- A fix that adds logic or touches security gets a short second prompt in
  the same form, with only that diff.

## 2. A second reviewer — when the batch handles untrusted input, money, auth or saved data

- Run the same prompt on a second, different model as well, and compare.
  A finding both reviewers report is very likely real. A finding only one
  reports gets checked against the code first, like every finding.
- Say in the report that two reviewers ran, and which findings only one of
  them made.
- Not for other batches: it doubles the cost.

## 3. Keeping score — every review

- After checking each finding against the code (`CLAUDE.md`), the report
  says how many were real, wrong, or left by the user's choice, e.g.
  "reviewer: 9 real, 2 wrong, 1 left by choice".
- Add the counts to the project's decisions file (one dated line per batch,
  in a "Reviewer record" list).
- When more than about a third of a reviewer's findings are wrong over
  three batches, tell the user, and suggest a stronger model or a better
  prompt. Base that suggestion on these numbers, not on one bad review.
