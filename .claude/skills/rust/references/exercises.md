# Rust Beginner Exercise Templates

One exercise per core topic. Each follows the standard format:
Problem → Starter code → Hints → Worked solution → Extension.

---

## Topic 1: Variables and Mutability

### Temperature Converter

**Problem**: Write a program that converts a temperature from Celsius to
Fahrenheit. Store the Celsius value in a variable, convert it, and print
both values. Then update the Celsius variable to a new value and print the
conversion again.

**Starter code**:
```rust
fn main() {
    let celsius = 100.0;
    // TODO: compute fahrenheit from celsius
    // Formula: fahrenheit = celsius * 9.0 / 5.0 + 32.0
    println!("{} °C = {} °F", celsius, todo!());

    // TODO: update celsius to 0.0 and print again
}
```

**Hints**:
<details><summary>Hint 1</summary>
To change `celsius` after it's declared, you need to add `mut` to the binding.
</details>
<details><summary>Hint 2</summary>
Compute fahrenheit as a separate `let` binding: `let fahrenheit = celsius * 9.0 / 5.0 + 32.0;`
</details>
<details><summary>Hint 3</summary>
To update celsius: `celsius = 0.0;` — this only works if you declared `let mut celsius`.
</details>

**Worked solution**:
```rust
fn main() {
    let mut celsius = 100.0_f64;
    let fahrenheit = celsius * 9.0 / 5.0 + 32.0;
    println!("{} °C = {} °F", celsius, fahrenheit);

    celsius = 0.0;
    let fahrenheit = celsius * 9.0 / 5.0 + 32.0;
    println!("{} °C = {} °F", celsius, fahrenheit);
}
```

**Extension**: Add a third conversion to Kelvin (`K = C + 273.15`) and print all three.

---

## Topic 4: Functions and Control Flow

### FizzBuzz

**Problem**: Print the numbers 1 to 30. For multiples of 3 print "Fizz", for
multiples of 5 print "Buzz", for multiples of both print "FizzBuzz". Use a
function `fizzbuzz(n: u32) -> String` that returns the correct string.

**Starter code**:
```rust
fn fizzbuzz(n: u32) -> String {
    todo!()
}

fn main() {
    for n in 1..=30 {
        println!("{}", fizzbuzz(n));
    }
}
```

**Hints**:
<details><summary>Hint 1</summary>
Use `%` for the modulo operator: `n % 3 == 0` checks divisibility by 3.
</details>
<details><summary>Hint 2</summary>
Check the combined case (`n % 15 == 0` or both conditions) first, otherwise
"Fizz" and "Buzz" will match before you can get to "FizzBuzz".
</details>
<details><summary>Hint 3</summary>
Return owned `String` values: `String::from("Fizz")` or use `.to_string()`.
</details>

**Worked solution**:
```rust
fn fizzbuzz(n: u32) -> String {
    match (n % 3, n % 5) {
        (0, 0) => String::from("FizzBuzz"),
        (0, _) => String::from("Fizz"),
        (_, 0) => String::from("Buzz"),
        _      => n.to_string(),
    }
}

fn main() {
    for n in 1..=30 {
        println!("{}", fizzbuzz(n));
    }
}
```

**Extension**: Accept the upper bound as a function parameter: `fn run_fizzbuzz(limit: u32)`.

---

## Topic 5: Ownership

### String Ownership Transfer

**Problem**: Complete the function `greet` which takes ownership of a `String`
and returns a new `String` with "Hello, " prepended. In `main`, call `greet`
with a name, then try to print the original name variable — fix the compile
error you'll see.

**Starter code**:
```rust
fn greet(name: String) -> String {
    // TODO: return "Hello, " + name
    todo!()
}

fn main() {
    let name = String::from("Alice");
    let greeting = greet(name);
    println!("{}", greeting);
    println!("{}", name); // this will fail — fix it
}
```

**Hints**:
<details><summary>Hint 1</summary>
`greet` takes ownership of `name`. After the call, `name` is moved and can no
longer be used. The compiler error will say "use of moved value".
</details>
<details><summary>Hint 2</summary>
One fix: clone before calling — `greet(name.clone())`. Another: change `greet`
to borrow `&str` instead of taking ownership.
</details>
<details><summary>Hint 3</summary>
To build the greeting string: `format!("Hello, {}", name)` returns a new `String`.
</details>

**Worked solution**:
```rust
// Solution A: clone to keep the original
fn greet(name: String) -> String {
    format!("Hello, {}", name)
}

fn main() {
    let name = String::from("Alice");
    let greeting = greet(name.clone()); // clone so `name` is still valid
    println!("{}", greeting);
    println!("{}", name);
}

// Solution B (more idiomatic): borrow a &str instead
fn greet_ref(name: &str) -> String {
    format!("Hello, {}", name)
}
```

**Extension**: Change `greet` to accept `&str` and explain why this is more
flexible (hint: both `String` and string literals `"Alice"` can be passed).

---

## Topic 6: Borrowing and References

### Longest String

**Problem**: Write a function `longest` that takes two string slices and returns
the longer one (as a string slice). Do not clone. In `main`, print the longest
of two strings.

**Starter code**:
```rust
fn longest(a: &str, b: &str) -> &str {
    todo!()
}

fn main() {
    let s1 = String::from("long string");
    let result;
    {
        let s2 = String::from("xyz");
        result = longest(s1.as_str(), s2.as_str());
        println!("The longest string is '{}'", result);
    }
}
```

**Hints**:
<details><summary>Hint 1</summary>
Compare lengths with `.len()`. Return the reference with the greater length.
</details>
<details><summary>Hint 2</summary>
The compiler will ask you for lifetime annotations. For now, annotate both
parameters and the return with `'a`: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str`.
</details>
<details><summary>Hint 3</summary>
The lifetime annotation says "the return value lives as long as the shorter of
the two inputs". That's exactly what we want.
</details>

**Worked solution**:
```rust
fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

fn main() {
    let s1 = String::from("long string");
    {
        let s2 = String::from("xyz");
        let result = longest(s1.as_str(), s2.as_str());
        println!("The longest string is '{}'", result);
    }
}
```

**Extension**: Try moving the `println!` outside the inner block. What error do
you see, and why?

---

## Topic 8: Structs

### Rectangle Area

**Problem**: Define a `Rectangle` struct with `width` and `height` fields
(both `f64`). Implement a method `area(&self) -> f64` and an associated
function `Rectangle::square(size: f64) -> Rectangle`. Print the area of a
3.0 × 4.0 rectangle and a square with side 5.0.

**Starter code**:
```rust
#[derive(Debug)]
struct Rectangle {
    // TODO: add fields
}

impl Rectangle {
    fn area(&self) -> f64 {
        todo!()
    }

    fn square(size: f64) -> Rectangle {
        todo!()
    }
}

fn main() {
    let rect = Rectangle { width: 3.0, height: 4.0 };
    println!("Area: {}", rect.area());

    let sq = Rectangle::square(5.0);
    println!("Square area: {}", sq.area());
    println!("{:?}", sq);
}
```

**Hints**:
<details><summary>Hint 1</summary>
Fields: `width: f64, height: f64` inside the struct body.
</details>
<details><summary>Hint 2</summary>
`area` accesses fields via `self.width * self.height`.
</details>
<details><summary>Hint 3</summary>
`square` returns `Rectangle { width: size, height: size }`.
</details>

**Worked solution**:
```rust
#[derive(Debug)]
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn square(size: f64) -> Rectangle {
        Rectangle { width: size, height: size }
    }
}

fn main() {
    let rect = Rectangle { width: 3.0, height: 4.0 };
    println!("Area: {}", rect.area());

    let sq = Rectangle::square(5.0);
    println!("Square area: {}", sq.area());
    println!("{:?}", sq);
}
```

**Extension**: Add a `perimeter(&self) -> f64` method and a `can_hold(&self, other: &Rectangle) -> bool` method.

---

## Topic 9: Enums and Pattern Matching

### Traffic Light

**Problem**: Define a `TrafficLight` enum with variants `Red`, `Yellow`,
`Green`. Implement a method `duration_seconds(&self) -> u32` that returns
how long each light stays on (Red=60, Yellow=5, Green=45). Cycle through all
three and print their durations.

**Starter code**:
```rust
enum TrafficLight {
    // TODO: add variants
}

impl TrafficLight {
    fn duration_seconds(&self) -> u32 {
        // TODO: match on self
        todo!()
    }
}

fn main() {
    let lights = [/* TODO */];
    for light in &lights {
        println!("{} seconds", light.duration_seconds());
    }
}
```

**Hints**:
<details><summary>Hint 1</summary>
Variants: `Red, Yellow, Green` (no data needed for this exercise).
</details>
<details><summary>Hint 2</summary>
`match self { TrafficLight::Red => 60, TrafficLight::Yellow => 5, TrafficLight::Green => 45 }`
</details>
<details><summary>Hint 3</summary>
Array: `[TrafficLight::Red, TrafficLight::Yellow, TrafficLight::Green]`
</details>

**Worked solution**:
```rust
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

impl TrafficLight {
    fn duration_seconds(&self) -> u32 {
        match self {
            TrafficLight::Red    => 60,
            TrafficLight::Yellow => 5,
            TrafficLight::Green  => 45,
        }
    }
}

fn main() {
    let lights = [TrafficLight::Red, TrafficLight::Yellow, TrafficLight::Green];
    for light in &lights {
        println!("{} seconds", light.duration_seconds());
    }
}
```

**Extension**: Add a `name(&self) -> &str` method that returns `"Red"`, `"Yellow"`, or `"Green"`,
and print `"{name}: {duration}s"` for each light.

---

## Topic 11: Result and Error Handling

### Safe Division

**Problem**: Write a function `divide(a: f64, b: f64) -> Result<f64, String>`
that returns `Err` with a message if `b` is zero, otherwise returns `Ok` with
the quotient. In `main`, call it twice — once with a zero divisor, once without
— and handle both results without calling `unwrap`.

**Starter code**:
```rust
fn divide(a: f64, b: f64) -> Result<f64, String> {
    todo!()
}

fn main() {
    // TODO: call divide(10.0, 2.0) and print the result
    // TODO: call divide(10.0, 0.0) and print the error
}
```

**Hints**:
<details><summary>Hint 1</summary>
Return `Err(String::from("cannot divide by zero"))` when `b == 0.0`.
</details>
<details><summary>Hint 2</summary>
Use `match result { Ok(v) => ..., Err(e) => ... }` to handle the two cases.
</details>
<details><summary>Hint 3</summary>
Or use `if let Ok(v) = divide(...) { ... } else { ... }`.
</details>

**Worked solution**:
```rust
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("cannot divide by zero"))
    } else {
        Ok(a / b)
    }
}

fn main() {
    match divide(10.0, 2.0) {
        Ok(result) => println!("10 / 2 = {}", result),
        Err(e)     => println!("Error: {}", e),
    }

    match divide(10.0, 0.0) {
        Ok(result) => println!("10 / 0 = {}", result),
        Err(e)     => println!("Error: {}", e),
    }
}
```

**Extension**: Write a function `safe_sqrt(x: f64) -> Result<f64, String>` that
errors on negative input, then chain it with `divide` using the `?` operator
inside a helper function that returns `Result`.

---

## Topic 12: Collections — Vec and HashMap

### Word Counter

**Problem**: Given a sentence as a `&str`, count how many times each word
appears. Return a `HashMap<String, u32>`. Ignore case (convert to lowercase).
Print each word and its count.

**Starter code**:
```rust
use std::collections::HashMap;

fn count_words(text: &str) -> HashMap<String, u32> {
    todo!()
}

fn main() {
    let text = "the quick brown fox jumps over the lazy dog the fox";
    let counts = count_words(text);
    let mut pairs: Vec<_> = counts.iter().collect();
    pairs.sort_by_key(|&(word, _)| word);
    for (word, count) in pairs {
        println!("{}: {}", word, count);
    }
}
```

**Hints**:
<details><summary>Hint 1</summary>
Split by whitespace with `text.split_whitespace()`.
</details>
<details><summary>Hint 2</summary>
Normalise case: `word.to_lowercase()`.
</details>
<details><summary>Hint 3</summary>
Use `map.entry(word).or_insert(0)` then dereference and increment:
`*count += 1`.
</details>

**Worked solution**:
```rust
use std::collections::HashMap;

fn count_words(text: &str) -> HashMap<String, u32> {
    let mut map = HashMap::new();
    for word in text.split_whitespace() {
        let count = map.entry(word.to_lowercase()).or_insert(0);
        *count += 1;
    }
    map
}

fn main() {
    let text = "the quick brown fox jumps over the lazy dog the fox";
    let counts = count_words(text);
    let mut pairs: Vec<_> = counts.iter().collect();
    pairs.sort_by_key(|&(word, _)| word);
    for (word, count) in pairs {
        println!("{}: {}", word, count);
    }
}
```

**Extension**: Find the most frequent word and print it separately.

---

## Topic 13: Iterators and Closures

### Pipeline Filter

**Problem**: Given a `Vec<i32>`, use iterator methods (no manual loops) to:
1. Keep only even numbers
2. Square each one
3. Keep only values greater than 10
4. Collect into a new `Vec<i32>`
Print the result.

**Starter code**:
```rust
fn process(numbers: Vec<i32>) -> Vec<i32> {
    numbers
        .into_iter()
        // TODO: filter evens
        // TODO: square each
        // TODO: filter > 10
        .collect()
}

fn main() {
    let nums = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    println!("{:?}", process(nums));
}
```

**Hints**:
<details><summary>Hint 1</summary>
`.filter(|x| x % 2 == 0)` keeps even numbers.
</details>
<details><summary>Hint 2</summary>
`.map(|x| x * x)` squares each value.
</details>
<details><summary>Hint 3</summary>
Chain in order: filter → map → filter → collect. The type annotation on
`collect()` is inferred because the function return type is `Vec<i32>`.
</details>

**Worked solution**:
```rust
fn process(numbers: Vec<i32>) -> Vec<i32> {
    numbers
        .into_iter()
        .filter(|x| x % 2 == 0)
        .map(|x| x * x)
        .filter(|x| *x > 10)
        .collect()
}

fn main() {
    let nums = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    println!("{:?}", process(nums)); // [16, 36, 64, 100]
}
```

**Extension**: Replace `.collect()` with `.fold(0, |acc, x| acc + x)` to sum
the filtered squares instead.
