# LipiType — English & Marathi InScript Typing Mastery Studio

A dual-language typing trainer and exam simulator designed to take learners from zero touch-typing experience to 30–40+ WPM proficiency in both **English (QWERTY)** and **Marathi (Standard Government InScript)** through guided lessons, timed speed tests, official exam simulations, and weak-key diagnostics.

### User Review & Critical Decisions

> [!IMPORTANT]
> All core preferences from our initial discussion are locked into this blueprint. Review the architecture and user flows below, and click **Proceed** when you are ready to build.

- **Confirmed Decision 1 — Marathi Keyboard Layout**: **Standard Government InScript Layout** (with built-in physical key mapping so you can type Marathi InScript directly from any standard keyboard without configuring OS language settings, while also supporting native OS InScript input).
- **Confirmed Decision 2 — Practice & Exam Modes**:
  1. **Step-by-Step Beginner to Pro Curriculum** (Home Row, Top Row, Bottom Row, Shift/Matras & Vowels, Conjuncts/Jodakshare, Common Words, Sentences, and Full Passages for both English and Marathi).
  2. **Timed Speed Tests** (1-minute, 2-minute, and 5-minute sprints).
  3. **GCC-TBC & MPSC 30 / 40 WPM Exam Simulator** (official timed passage interface, gross vs. net WPM, keystroke count, accuracy cutoff, and qualification result sheet).
  4. **Custom Text Practice** (paste or write your own English or Marathi paragraphs for targeted practice).
- **Confirmed Decision 3 — Visual Guides & Analytics**:
  1. **Interactive On-Screen Keyboard & Finger Guide** (dual-legend or focused InScript/QWERTY keys, automatic Shift-layer preview, color-coded left/right hand finger assignments).
  2. **Live Telemetry Bar** (real-time WPM, Accuracy %, Error Count, and Timer in tabular numerals).
  3. **Progress Dashboard & Weak-Key Analysis** (per-key error rate heatmap, lesson mastery stars, WPM trend history, and targeted weak-key drill generator).

---

### 1. Overview & Core Concept

- **What It Does**: LipiType provides an interactive two-zone typing stage where learners follow a structured curriculum from foundational finger placement to advanced Marathi conjuncts (*जोडाक्षरे*) and English prose. It pairs real-time character-by-character validation with an interactive virtual keyboard and finger guide, plus dedicated modes for timed speed tests, GCC-TBC / MPSC government typing exam preparation (30 WPM and 40 WPM tiers), and custom text drills.
- **Target Audience / Persona**: Students, MPSC / Court / GCC-TBC exam aspirants, office professionals, and self-learners in Maharashtra who want a single, structured platform to master both English and Marathi InScript touch typing.
- **Key Value**: Eliminates the hurdle of configuring external Marathi keyboard drivers by translating physical keystrokes directly into standard Devanagari InScript characters in the browser, while pinpointing exact weak keys and finger habits to accelerate speed and accuracy.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Language & Mode Selection**: From the top workspace toolbar, the user toggles effortlessly between **English (QWERTY)** and **मराठी (InScript)** and switches across the four core views via the top navigation bar: *Lessons*, *Speed Test*, *Exam Mode*, and *Progress*.
  2. **Guided Lesson Flow (Beginner → Pro)**:
     - The curriculum drawer organizes lessons into progressive tiers: *Tier 1: Home Row Foundations*, *Tier 2: Top & Bottom Rows*, *Tier 3: Vowels, Matras & Shift Layer*, *Tier 4: Words & Conjuncts (जोडाक्षरे)*, and *Tier 5: Pro Fluency Passages*.
     - Selecting a lesson loads the **Interactive Typing Stage**. The current target character (or Matra/Halant sequence in Marathi) is highlighted in the text stream, and the exact key (plus `Shift` if required) lights up on the on-screen keyboard alongside the recommended finger indicator (e.g., *Left Index Finger* / *डावी तर्जनी*).
  3. **Timed Speed Test & Custom Text Flow**:
     - Users choose `1 Min`, `2 Min`, or `5 Min` duration (or click *Custom Text* to paste their own English/Marathi paragraph).
     - The countdown starts on the very first keystroke. Upon completion, a detailed **Performance Summary Sheet** displays Net WPM, Gross WPM, Accuracy %, Keystrokes (CPM), Error Breakdown, and a one-click *"Practice Weak Keys from This Run"* action.
  4. **GCC-TBC / MPSC 30–40 WPM Exam Flow**:
     - Users select target benchmark (**30 WPM** or **40 WPM**) and language (**English** or **Marathi InScript**).
     - Enters a distraction-controlled exam split view (Source Passage above/left, Live Typing Sheet below/right) with strict exam timer, live word/keystroke counter, and an official-style **Exam Result Scorecard** showing Pass/Needs-Practice status based on accuracy and minimum speed thresholds.
  5. **Progress & Weak-Key Analytics Flow**:
     - Displays cumulative practice time, average WPM, best WPM, completed lessons, and an interactive **Keyboard Error Heatmap** that highlights keys with the highest mistake rates in English and Marathi, letting the user launch a custom 60-second drill focused specifically on their top 5 weakest keys.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Tactile Precision Studio — a high-craft, distraction-free educational sandbox combining crisp editorial clarity with responsive mechanical keyboard ergonomics.
  - *Color Palette & Mood (60-30-10 Allocation)*:
    - **60% Dominant Neutral Canvas**: Crisp Alabaster Slate (`#F8FAFC` / `--background`) for zero eye strain during long typing sessions, with subtle cool surface panels (`#FFFFFF` / `--surface`).
    - **30% Structural Surfaces & Keyboard Housing**: Precision Slate (`#0F172A` text, `#E2E8F0` hairline borders, `#F1F5F9` physical keycap rests with subtle bottom bevels to evoke real mechanical keycaps).
    - **10% Semantic & Finger-Zone Accents**:
      - Primary Action / Active Cursor: Cobalt Blue (`#2563EB` / `--primary`) with high-contrast underline cursor.
      - Correct Keystroke: Emerald (`#059669`) paired with clean check indicators.
      - Error / Mistyped Keystroke: Crimson (`#DC2626`) with subtle background tint (`#FEE2E2`) and explicit error glyph.
      - Ergonomic Finger Guide Coding: Distinct, accessible tints for Left/Right Pinky, Ring, Middle, Index, and Thumb zones with explicit text labels (never color alone).
  - *Typography & Hierarchy (2+1 Font Rule)*:
    - **Display & UI Structure**: `Plus Jakarta Sans` (SemiBold 600 / Bold 700, `text-wrap: balance`) for headings, lesson titles, and navigation.
    - **Devanagari & Body Prose**: `Noto Sans Devanagari` + `Plus Jakarta Sans` at generous, comfortable reading sizes (`22px–26px` line-height `1.8` inside the typing stream so Marathi *Matras* like `ि`, `ी`, `ु`, `ू`, `े`, `ै`, `ो`, `ौ` and *Halant* `्` are razor-sharp and unmistakable).
    - **Telemetry & Monospace Stream**: `JetBrains Mono` (`tabular-nums`) for live WPM counters, countdown timers, keystroke tallies, and English character alignment.
  - *Component Styling & Layout*:
    - **Top Bar Contract**: Single-row, three-zone header separated by `gap-8`:
      1. *Brand Zone*: `LipiType` (single-line wordmark).
      2. *Navigation Zone*: 4 single-line links (`Lessons`, `Speed Test`, `Exam Mode`, `Progress`).
      3. *Primary Action Zone*: Language Switcher (`English QWERTY` / `मराठी InScript`) or Quick Start CTA.
    - **Two-Zone Educational Sandbox**:
      - *Top/Center Stage (65% viewport)*: Live Telemetry Strip + High-Contrast Typing Stream + Interactive On-Screen InScript/QWERTY Keyboard.
      - *Bottom/Side Control Deck (35% viewport)*: Lesson Curriculum Selector, Finger Placement Coaching Callout, and Session Controls (`Restart`, `Next Lesson`, `Custom Text`).

- **Interactive Feedback & Motion**:
  - Keypress latency under `50ms` using `transform: translateY(2px)` on the virtual keycap corresponding to the physical key pressed.
  - Smooth cursor progression and auto-scrolling passage lines so the active typing line always remains centered in the user's eye line.
  - Optional synthesized Web Audio API mechanical key-click and error-thock sound toggle (zero external audio files required).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Built-in Browser InScript Key Mapper + Native Unicode Support**
  - *Chosen Approach*: Intercept physical `KeyboardEvent.code` events (`KeyA` through `Quote`, top row, bottom row, and `Shift` layer) and map them directly to official Government of India Marathi InScript Unicode characters when Marathi mode is active, while also gracefully handling direct Unicode character input if the user already has a system Marathi keyboard enabled.
  - *Why*: Most learners struggle to install or configure Windows/Mac Marathi InScript layouts. By mapping physical keys directly in the browser, anyone can start typing Marathi InScript immediately on any computer.
  - *Alternatives Considered*: Relying solely on the user's OS keyboard language setting (rejected because it creates high setup friction and breaks when users forget to switch OS input languages).

- **Decision 2: Grapheme vs. Keystroke Decomposition for Marathi InScript**
  - *Chosen Approach*: Decompose target Marathi words into sequential Unicode code points (e.g., typing `क्` + `ष` = `क्ष`, or `क` + `ा` = `का`) and display the **exact next required keystroke** in a live "Next Key Coaching Bar" above the virtual keyboard.
  - *Why*: In Marathi InScript, a single visual syllable (*अक्षर* / *जोडाक्षर*) is built from 2 to 4 sequential keystrokes (Consonant + Halant `्` + Consonant + Matra). Guiding the user keystroke-by-keystroke prevents confusion on complex words.
  - *Alternatives Considered*: Matching only completed whole syllables (rejected because beginners cannot tell which key to press first when they see a combined conjunct like `प्र` or `ज्ञ`).

- **Decision 3: Zero-Friction Client-Side Persistence (`localStorage`)**
  - *Chosen Approach*: Store completed lessons, star ratings, WPM history, custom texts, and per-character error counts in structured browser `localStorage` with JSON export/reset controls.
  - *Why*: Delivers instant startup with zero login walls while preserving complete Beginner-to-Pro progression and weak-key analytics across sessions.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                       Top Navigation Bar (3-Zone Contract)                 │
│   [LipiType]        [Lessons · Speed Test · Exam Mode · Progress]   [CTA]  │
└──────────────────────────────────────┬─────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼─────────────────────────────────────┐
│                     Workspace Toolbar & Language Controller                │
│  [Language: English QWERTY | मराठी InScript]  [Sound: On/Off]  [Guide: On] │
└───────┬──────────────────────────────┬─────────────────────────────┬───────┘
        │                              │                             │
┌───────▼──────────┐        ┌──────────▼──────────┐       ┌──────────▼───────┐
│  Curriculum &    │        │  Interactive Typing │       │  Analytics &     │
│  Mode Selector   │        │  Stage (Core Engine)│       │  Exam Engine     │
│                  │        │                     │       │                  │
│ • Beginner → Pro │        │ • Live Telemetry    │       │ • GCC-TBC / MPSC │
│   Lesson Tree    │───────▶│   (WPM, Acc, Timer) │──────▶│   30/40 WPM Mode │
│ • 1/2/5m Timers  │        │ • Unicode Code-Point│       │ • Weak-Key Error │
│ • Custom Passage │        │   Stream Renderer   │       │   Heatmap        │
│   Modal Editor   │        │ • Next-Key Coach    │       │ • Smart Drill    │
│                  │        │ • Virtual Keyboard  │       │   Generator      │
│                  │        │   & Finger Guide    │       │                  │
└──────────────────┘        └──────────┬──────────┘       └──────────▲───────┘
                                       │                             │
                            ┌──────────▼─────────────────────────────┴───────┐
                            │      Client Persistence Store (localStorage)   │
                            │ • Lesson Mastery & Best WPM                    │
                            │ • Per-Key Hit/Miss Telemetry Map (EN & MR)     │
                            │ • Recent Sessions & Exam Certificates          │
                            └────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `LanguageMode`: `'en' | 'mr'` (controls active curriculum, virtual keyboard keycap map, and physical keycode interceptor).
  - `Lesson`: `{ id, language, tier, levelNumber, title, marathiTitle, description, targetKeys, text, targetWpm, minAccuracy }`.
  - `KeyMapping`: Maps each physical `KeyboardEvent.code` (`Backquote` through `Slash`) to `{ normal: string, shift: string, enNormal: string, enShift: string, finger: 'L-Pinky' | 'L-Ring' | 'L-Middle' | 'L-Index' | 'Thumb' | 'R-Index' | 'R-Middle' | 'R-Ring' | 'R-Pinky', row: number }`.
  - `TypingSessionState`: Tracks `targetCodePoints: string[]`, `typedCodePoints: string[]`, `currentIndex: number`, `startTime: number | null`, `elapsedSeconds: number`, `errorsByIndex: Set<number>`, `keyStats: Record<string, { hits: number, misses: number }>`.
  - `UserProgressStore`: Persisted in `localStorage` under `lipitype_progress_v1`, storing completed lesson records, historical test runs (`WpmSessionRecord[]`), custom saved passages, and cumulative `keyErrorMap` for both English and Marathi.

- **Interactive Component & State Mapping**:
  - **Physical Keystroke Handler**: Captures `keydown` events inside the typing stage, prevents default browser scrolling on `Space`, maps physical keycodes to Marathi InScript characters when `language === 'mr'`, compares against `targetCodePoints[currentIndex]`, updates `keyStats`, triggers Web Audio tactile feedback, and advances the cursor (or flags an error state).
  - **Next-Key & Conjunct Breakdown Bar**: Inspects `targetCodePoints[currentIndex]` and looks up the matching `KeyMapping` entry. If the target character lives on the `Shift` layer (e.g., `आ`, `ई`, `थ`, `ध`, `ज्ञ`), both the `Shift` key and the character key illuminate on the virtual keyboard, and the finger guide displays the exact two-hand instruction.
  - **Weak-Key Drill Generator**: Reads `UserProgressStore.keyErrorMap[language]`, ranks keys by error rate $\frac{\text{misses}}{\text{hits} + \text{misses}}$, and dynamically synthesizes a tailored practice text focusing on the user's top weakest characters and words.
