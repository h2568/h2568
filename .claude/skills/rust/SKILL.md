---
name: rust
description: "Beginner-friendly Rust programming language learning skill. Guided lessons, hands-on exercises, knowledge quizzes, code explanations, and a structured roadmap — all tailored to developers new to Rust."
argument-hint: "learn <topic> | exercise <topic> | explain | quiz <topic> | roadmap | cheat <topic>"
license: MIT
---

# Rust: Beginner Learning Skill

Interactive, guided Rust learning for developers new to the language. Covers
ownership and borrowing, core types, structs, enums, traits, error handling,
collections, and more — with exercises and quizzes at every step.

## Quick Reference

| Command | What it does |
|---------|-------------|
| `/rust learn <topic>` | Guided lesson with examples and key takeaways |
| `/rust exercise <topic>` | Practice problem with hints and a worked solution |
| `/rust explain` | Paste or describe Rust code to get a plain-English explanation |
| `/rust quiz <topic>` | 5-question quiz to test understanding of a topic |
| `/rust roadmap` | Personalised learning path based on your background |
| `/rust cheat <topic>` | Concise cheat-sheet / quick-reference card |

## Context Intake (Do This First)

Before teaching or quizzing, ask these questions in a single message if not
already provided:

1. **Background language**: What language(s) do you already know? (e.g. Python,
   JavaScript, C++, Java)
2. **Goal**: What are you trying to build or do with Rust? (systems / CLI tools /
   WebAssembly / embedded / just learning)
3. **Current level**: Have you written any Rust before, or is this your first
   time?

Use the answers to:
- Draw analogies to their background language where helpful
- Calibrate complexity (avoid advanced jargon for true beginners)
- Suggest a relevant starting topic if they haven't picked one

If the user says "I know Python and want to build CLI tools", extract that
context and jump straight into content without re-asking.

## Commands

### `/rust learn <topic>`

Deliver a structured lesson on the topic. Follow this format:

1. **One-sentence summary** — what the topic is and why it matters in Rust
2. **Mental model** — a plain-English analogy, drawn from their background language
3. **Minimal working example** — compiles and runs, 10–20 lines max
4. **Step-by-step walkthrough** — annotate each key line
5. **Common beginner mistakes** — 2–3 gotchas with examples of the error message they'll see
6. **Key takeaways** — 3–5 bullet points
7. **What to learn next** — one natural follow-on topic

Keep lessons focused. Do not cover sub-topics not directly needed to understand
the chosen topic. Never show code that fails to compile without explicitly
marking it as intentional and explaining why.

### `/rust exercise <topic>`

Present a practice problem. Follow this format:

1. **Problem statement** — clear description of what to implement, 3–5 lines
2. **Starter code** — skeleton with `todo!()` placeholders, ready to paste
3. **Hints** — 3 progressive hints behind collapsible `<details>` tags so the
   user can choose how much help to take
4. **Worked solution** — complete, idiomatic solution with inline comments
5. **Extension challenge** — one harder variant for users who want more

Choose exercises that exercise the target topic genuinely — do not pad with
unrelated concepts.

### `/rust explain`

The user will paste Rust code or describe it. Explain it by:

1. **Purpose** — what the code does in one sentence
2. **Line-by-line walkthrough** — explain each non-obvious construct
3. **Rust concepts used** — list the relevant concepts (e.g. ownership, pattern
   matching, iterators) with a one-line reminder of what each means
4. **Potential improvements** — idiomatic alternatives or safety notes, if any

If the code has a compile error, diagnose it: show the exact error message,
explain the root cause, and provide the fix.

### `/rust quiz <topic>`

Generate exactly 5 multiple-choice questions on the topic. Rules:

- Each question has 4 options (A–D), one correct
- Mix question styles: conceptual understanding, predict the output, spot the bug
- After the user answers, reveal which were right/wrong with a brief explanation
- Give a score out of 5 and suggest a follow-on lesson if they scored below 4

Never reuse the same question twice in a session.

### `/rust roadmap`

Based on the user's background and goals (from Context Intake), output a
personalised learning path:

1. **Phase 1 — Foundations** (topics 1–5, ~2 weeks)
2. **Phase 2 — Core Rust** (topics 6–10, ~3 weeks)
3. **Phase 3 — Real Projects** (topics 11–15, ~4 weeks)
4. **Recommended resources** — The Rust Book, Rustlings, Exercism (link-free;
   name only — do not generate URLs)

Adjust the pace and depth based on their background. A C++ developer skips
memory basics; a Python developer needs more time on ownership.

### `/rust cheat <topic>`

Output a concise reference card in a fenced code block or markdown table.
Include: syntax template, key rules, common patterns, things to avoid.
Keep it scannable — not a lesson, just a fast lookup.

## Topic Map

Load `references/topics.md` for the full list of beginner topics and their
learning dependencies. Key topics in order:

1. Variables and mutability
2. Data types (scalar and compound)
3. Functions and control flow
4. Ownership
5. Borrowing and references
6. Slices
7. Structs
8. Enums and pattern matching
9. Option and Result
10. Error handling and the `?` operator
11. Collections (Vec, HashMap)
12. Iterators and closures
13. Modules and crates
14. Traits and generics (intro)
15. Lifetimes (intro)

## Teaching Principles

- **Ownership first**: Every lesson that touches memory should reinforce the
  ownership model — it is the core mental shift for Rust beginners.
- **Compile errors as teachers**: When showing broken code, always reproduce
  the exact `rustc` error message. Beginners learn to read errors, not fear them.
- **Analogies over jargon**: Prefer "Rust checks who owns a value at compile
  time" over "affine type system". Introduce jargon only after the concept lands.
- **Runnable code only**: Every positive example must compile. Use `// error`
  comments on lines that intentionally fail, and explain why.
- **No `unsafe` for beginners**: Do not introduce `unsafe` blocks unless the
  user explicitly asks. It is not a beginner concept.
- **Standard library first**: Teach `std` types (Vec, String, HashMap) before
  crates. Don't assume `tokio`, `serde`, or any external crate is installed.

## Quality Gates

- Never produce code that silently does the wrong thing — if an example has a
  subtle bug to illustrate a point, say so explicitly before showing it.
- Never skip the mental-model step in a lesson. Beginners bounce off Rust when
  they jump straight to syntax.
- Quiz questions must be unambiguous. If a question could have two defensible
  answers, rewrite it.
- Exercise starter code must be valid Rust (modulo `todo!()`) — it must compile
  with `todo!()` in place.

## Reference Files

Load on-demand as needed; do NOT load all at startup.

- `references/topics.md`: Full beginner topic map with learning dependencies
- `references/exercises.md`: Exercise templates and worked solutions per topic
