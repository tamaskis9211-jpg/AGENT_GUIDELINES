# Asking the agent well

For the user, and for the agent that reminds them (`CLAUDE.md`, "Prompting
tips"). Adapted from the ISTQB CT-GenAI syllabus v1.1 (prompt structure
§2.1.1, prompting techniques §2.1.2, refining prompts §2.3.2).

## The tips

Each tip has a short name the agent uses when it reminds you.

1. **The six parts.** A request goes through in one round when it says:
   - *who* it is for;
   - *context*: which project, game or screen;
   - *what to do*;
   - *input*: a screenshot, the exact text, a file;
   - *limits*: "free", "no new library", "quick and dirty", a date;
   - *the result you want*: a short answer, a brief, a mockup, a merged PR.

   Example: "Add X" → "Add X to the stats screen, free, like the other
   game's; a mockup first."
2. **Show an example.** "Like the result screen of game Y" or "in this tone:
   …" works better than describing a look or a style.
3. **Big things in steps.** Brief, then mockup, then build, then merge; a
   very large feature one part at a time. Check each step before the next.
4. **Let the agent draft it.** When the idea is still vague: "ask me what
   you need first" or "help me phrase this request".
5. **Point exactly.** For something wrong: the exact text or a screenshot,
   where it is, and what you expected. "The System button is cut off at the
   largest text" is fixed in one round; "it looks off" isn't.
6. **Now or queue.** Say whether a new request should interrupt the current
   work or wait its turn ("add this to the queue").
7. **Say how sure it must be.** "You decide" for small things; "check it in
   the source" when a fact matters (licences, laws, versions).
8. **One topic per message**, or number them when there are several.
9. **Refine, don't restart.** When a result is close, say what to change
   ("shorter", "keep the second option, drop the rest"); the agent keeps the
   rest of the context.
