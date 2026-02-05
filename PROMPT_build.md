# Ralph Build Mode (Customized for This Repo)

Based on Geoffrey Huntley's Ralph Wiggum methodology.

---

## Phase 0: Orient

Read `.specify/memory/constitution.md` to understand project principles and constraints.

---

## Phase 1: Discover Work Items

Search for incomplete work from these sources (in order):

1. **specs/ folder** — Look for `.md` files NOT marked `## Status: COMPLETE`
2. **IMPLEMENTATION_PLAN.md** — If exists, find unchecked `- [ ]` tasks

Pick the **HIGHEST PRIORITY** incomplete item:
- Lower numbers = higher priority (001 before 010)
- `[HIGH]` before `[MEDIUM]` before `[LOW]`
- Bugs/blockers before features

Before implementing, search the codebase to verify it's not already done.

---

## Phase 1b: Re-Verification Mode (No Incomplete Work Found)

If all specs appear complete:
1. Pick one completed spec from `specs/`
2. Re-verify ALL its acceptance criteria strictly
3. Run the exact tests/commands listed in the spec
4. If anything fails, unmark the spec and fix it
5. If all pass, output `<promise>DONE</promise>`

**Do not commit or push if no code changes are required.**

---

## Phase 2: Implement

Implement the selected spec/task completely:
- Follow the spec's requirements exactly
- Write clean, maintainable code
- Add tests as needed
- Avoid touching unrelated files

---

## Phase 3: Validate

Run the project's test suite and verify:
- All tests pass
- No lint errors
- The spec's acceptance criteria are 100% met

---

## Phase 4: Commit & Update

If changes were made:
1. Mark the spec/task as complete (add `## Status: COMPLETE` to spec file)
2. Stage ONLY the files related to the spec (NO `git add -A`)
3. `git commit` with a descriptive message
4. `git push`

If no changes were necessary, skip commit/push.

---

## Completion Signal

When the spec is fully implemented and all tests pass, output:

```
<promise>DONE</promise>
```
