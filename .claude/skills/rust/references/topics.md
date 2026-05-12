# Rust Beginner Topic Map

## Learning Dependencies

Topics are listed in recommended order. Each entry shows what must be understood
first (prerequisites) and what it unlocks (leads to).

---

### 1. Variables and Mutability
**Prerequisites**: None  
**Leads to**: Data types, Ownership  
**Core ideas**: `let`, `let mut`, shadowing, constants (`const`), `_` to silence
unused warnings  
**Analogy (Python)**: Like variables, but immutable by default — `mut` is your
opt-in  
**Analogy (JS)**: Like `const` vs `let`, but the immutability is enforced by the
compiler  
**Common errors**: `cannot assign twice to immutable variable`

---

### 2. Data Types — Scalar
**Prerequisites**: Variables  
**Leads to**: Data types (compound), Functions  
**Core ideas**: `i32`, `u64`, `f64`, `bool`, `char`; type inference vs explicit
annotation; integer overflow in debug vs release mode  
**Key fact**: Rust is statically typed — every value has a type known at compile
time  
**Common errors**: `mismatched types`, `attempt to subtract with overflow`

---

### 3. Data Types — Compound
**Prerequisites**: Scalar types  
**Leads to**: Slices, Structs  
**Core ideas**: Tuples `(i32, bool)` and their destructuring; arrays `[i32; 5]`
(fixed-length, stack); differences from Vec (heap, growable)  
**Common errors**: `index out of bounds` (runtime panic on array), type mismatch
in tuple field access

---

### 4. Functions and Control Flow
**Prerequisites**: Variables, Data types  
**Leads to**: Ownership, Closures  
**Core ideas**: `fn`, parameters with explicit types, return type after `->`,
implicit return (no semicolon); `if`/`else` as expressions; `loop`, `while`,
`for` with ranges and iterators  
**Analogy**: `for x in 0..5` ≈ Python `for x in range(5)`  
**Common errors**: `mismatched types` (semicolon on last expression)

---

### 5. Ownership
**Prerequisites**: Variables, Functions  
**Leads to**: Borrowing, Slices  
**Core ideas**: Each value has one owner; value dropped when owner goes out of
scope; move semantics (heap types) vs copy semantics (scalar types); `Clone`  
**Mental model**: Like a real-world object that can only be in one person's
hands at a time  
**Common errors**: `use of moved value`, `value used here after move`  
**This is the hardest concept for beginners. Spend extra time here.**

---

### 6. Borrowing and References
**Prerequisites**: Ownership  
**Leads to**: Slices, Structs  
**Core ideas**: `&T` (immutable reference), `&mut T` (mutable reference); rules:
(a) any number of `&T` OR exactly one `&mut T` at a time, never both; reference
must not outlive the owner  
**Mental model**: A reference is a library book loan — the library (owner) keeps
the book; you can't check it out twice for writing  
**Common errors**: `cannot borrow as mutable because it is also borrowed as
immutable`, `cannot have two mutable references`

---

### 7. Slices
**Prerequisites**: Ownership, Borrowing  
**Leads to**: Strings (String vs &str), Collections  
**Core ideas**: `&[T]` (slice of array/vec), `&str` (string slice); why slices
are references to a portion of a collection; range syntax `&s[0..3]`  
**Common errors**: `borrowed value does not live long enough`

---

### 8. Structs
**Prerequisites**: Variables, Borrowing  
**Leads to**: Enums, Traits  
**Core ideas**: Defining with `struct`, instantiating, field access, methods via
`impl`, associated functions (constructors like `Struct::new()`), `#[derive]`
for `Debug` and `Clone`  
**Analogy (Python)**: Like a `class` but without inheritance  
**Analogy (JS)**: Like an object with a fixed shape and methods via `impl`  
**Common errors**: missing field in struct literal, method vs associated function
(`self` vs no `self`)

---

### 9. Enums and Pattern Matching
**Prerequisites**: Structs  
**Leads to**: Option and Result, Error handling  
**Core ideas**: `enum` with data variants; exhaustive `match` with arms; `if let`
for single-variant matching; `_` catch-all  
**Key fact**: Rust enums are sum types — each variant can hold different data  
**Analogy**: Like tagged unions in C, or discriminated unions in TypeScript  
**Common errors**: `non-exhaustive patterns` in match

---

### 10. Option\<T\>
**Prerequisites**: Enums, Pattern matching  
**Leads to**: Result\<T, E\>, Closures  
**Core ideas**: `Some(value)` / `None`; replacing null; `unwrap()` (panics),
`expect()`, `is_some()`, `if let Some(x)`, `?` (later); `map()`, `unwrap_or()`  
**Mental model**: A box that either contains something or is empty  
**Common errors**: `called unwrap() on a None value` (panic)

---

### 11. Result\<T, E\> and Error Handling
**Prerequisites**: Option, Enums  
**Leads to**: `?` operator, Collections  
**Core ideas**: `Ok(value)` / `Err(error)`; propagating errors vs handling them;
the `?` operator (early return on `Err`); `unwrap()` and `expect()` for
prototyping  
**Common errors**: `the ? operator can only be used in a function that returns
Result or Option`

---

### 12. Collections — Vec and HashMap
**Prerequisites**: Ownership, Borrowing  
**Leads to**: Iterators  
**Core ideas**: `Vec<T>` (growable array, heap); `HashMap<K, V>`; ownership of
elements; `push`, `get`, `contains_key`, `entry().or_insert()`  
**Common errors**: `cannot move out of index`, borrowing a Vec while iterating

---

### 13. Iterators and Closures
**Prerequisites**: Collections, Functions  
**Leads to**: Traits  
**Core ideas**: Iterator trait; lazy evaluation; `map()`, `filter()`, `collect()`,
`fold()`; closure syntax `|x| x + 1`; capturing variables by reference or by
move (`move |x| ...`)  
**Analogy (Python)**: Like list comprehensions + generators  
**Analogy (JS)**: Like `.map()`, `.filter()`, `.reduce()` on arrays  
**Common errors**: forgetting `.collect()` (iterator is lazy), type inference
failure on `collect()`

---

### 14. Modules and Crates
**Prerequisites**: Functions, Structs  
**Leads to**: Traits  
**Core ideas**: `mod`, `pub`, `use`; file-based module system; `Cargo.toml`
dependencies; `extern crate` (rarely needed in 2018+ edition); `crates.io`  
**Common errors**: `module not found`, `use` path errors, privacy violations

---

### 15. Traits (Introduction)
**Prerequisites**: Structs, Iterators  
**Leads to**: Generics, Lifetimes (advanced)  
**Core ideas**: Defining a trait with `trait`; implementing with `impl Trait for
Type`; trait objects `&dyn Trait`; common standard traits: `Display`, `Debug`,
`Clone`, `Iterator`, `From`/`Into`  
**Analogy (Python)**: Like abstract base classes / protocols  
**Analogy (JS)**: Like TypeScript interfaces but enforced at compile time  
**Common errors**: trait not implemented for type, missing `use std::fmt` for
`Display`

---

### 16. Generics (Introduction)
**Prerequisites**: Traits  
**Leads to**: Lifetimes  
**Core ideas**: Generic functions `fn largest<T: PartialOrd>(...)`, generic
structs, trait bounds with `where`; monomorphization (zero-cost abstraction)  
**Common errors**: `the trait bound X: Y is not satisfied`

---

### 17. Lifetimes (Introduction)
**Prerequisites**: Borrowing, Generics  
**Leads to**: Advanced Rust topics  
**Core ideas**: What lifetimes solve (dangling references); lifetime annotation
syntax `'a`; elision rules (when you don't need to annotate); `'static`  
**This is the second hardest concept. Approach gently — most beginner code
does not need explicit lifetime annotations.**  
**Common errors**: `missing lifetime specifier`, `returns a reference to data
owned by the current function`

---

## Topic Groups for Roadmap

### Phase 1 — Foundations (topics 1–4)
Variables, types (scalar + compound), functions, control flow

### Phase 2 — Ownership Model (topics 5–7)
Ownership, borrowing, slices — the core mental shift

### Phase 3 — Modelling Data (topics 8–11)
Structs, enums, Option, Result — building programs that handle reality

### Phase 4 — Practical Rust (topics 12–14)
Collections, iterators, closures, modules — writing real programs

### Phase 5 — Abstraction (topics 15–17)
Traits, generics, lifetimes — writing reusable and correct code
