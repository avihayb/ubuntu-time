# Design Document - Ubuntu Time

## Philosophy
The goal of `ubuntu-time` is to provide a datetime format that is simultaneously:
1.  **Absolute**: Comparable and precise.
2.  **Relative**: providing context on "how far away" the event is.
3.  **Contextual**: Including day of week and seasonal info (via date).

Most libraries force a choice between absolute and relative, or switch between them based on distance. `ubuntu-time` aims to provide **both** in a single, consistent string.

## Formats

The general pattern is:
`{date}({day of week}) {time}({time until datetime})`

We support three specific styles:

### 1. Compact
Optimized for space.
- **Date**: ISO-like Short (e.g., `11-23`)
- **Day of Week**: Abbreviated (e.g., `Su`)
- **Time**: Short (e.g., `21:55`)
- **Duration**: Narrow/Abbreviated (e.g., `1d`, `2h`, `4m`, `5s`, `3M`, `1Y`, `5W`)

**Example**: `11-23(Su) 21:55(1d)`

### 2. Short (Default)
A balance between readability and space.
- **Date**: ISO-like Short (e.g., `11-23`)
- **Day of Week**: Short (e.g., `Sun`)
- **Time**: Short (e.g., `21:55`)
- **Duration**: Short (e.g., `1 day`, `2 hr`, `4 min`, `5 sec`, `3 mon`, `1 yr`, `5W`)

**Example**: `11-23(Sun) 21:55(1 day)`

### 3. Long
Optimized for natural language readability.
- **Date**: ISO Full (e.g., `2025-11-23`)
- **Day of Week**: Full (e.g., `Sunday`)
- **Time**: Short (e.g., `21:55`)
- **Duration**: Natural language (e.g., `in 1 day`, `2 hours ago`)

**Example**: `2025-11-23(Sunday) 21:55(in 1 day)`

### 4. Longer
Optimized for precision.
- **Date**: ISO Full (e.g., `2025-11-23`)
- **Day of Week**: Full (e.g., `Sunday`)
- **Time**: Short (e.g., `21:55`)
- **Duration**: Natural language with 2 significant units (e.g., `in 1 day 2 hours`, `2 hours 30 minutes ago`)

**Example**: `2025-11-23(Sunday) 21:55(in 1 day 2 hours)`

## Duration Logic

We use "duration thresholds" to determine the primary unit. The threshold to jump to the next unit is by default **twice** the duration of the current unit class.

- **Seconds**: up to 120 seconds (2 minutes) -> display seconds
- **Minutes**: up to 120 minutes (2 hours) -> display minutes
- **Hours**: up to 48 hours (2 days) -> display hours
- **Days**: up to 14 days (2 weeks) -> display days
- **Weeks**: up to 8 weeks (2 months approx) -> display weeks
- **Months**: up to 24 months (2 years) -> display months
- **Years**: thereafter -> display years

For `compact`, `short`, and `long` styles, we display **1 significant unit** based on these thresholds.
For `longer` style, we display **2 significant units**.

## API Design

```javascript
/**
 * Formats a date.
 * @param {object} options - Options for formatting the date.
 * @param {Date} options.to - The target date to format.
 * @param {Date} [options.from=new Date()] - The reference date for relative formatting.
 * @param {'compact' | 'short' | 'long' | 'longer'} [style='short'] - The style to use.
 * @param {1 | 1.5 | 2 | 'one' | 'two' | 'once' | 'twice'} [durationThreshold='twice'] - The duration threshold to use before switching to the next unit class (e.g., in once, 60 seconds -> minutes; in twice, 120 seconds -> minutes).
 * @param {string[]|string} [locale=navigator.language] - The locale (default is browser locale).
 * @returns {{text: string, inFuture: boolean, inAYearOrMore: boolean, locale: string, timeZone: string, toString: function()=>string }}
 */
export function format({to: Date, from: Date = new Date(), style: 'compact' | 'short' | 'long' | 'longer' = 'short', durationThreshold: 1 | 1.5 | 2 | 'one' | 'two' | 'once' | 'twice' = 'twice', locale: string[]|string = navigator.language}) { ... }

/**
 * Formats a date to parts.
 * @param {object} options - Same options as format.
 * @returns {Array<{type: string, value: string}>}
 */
export function formatToParts(options) { ... }
```

## Implementation Details

### Intl.DateTimeFormat
We will use different `options` for `Intl.DateTimeFormat` based on the selected style.

| Component | Compact | Short | Long / Longer |
| :--- | :--- | :--- | :--- |
| **Date** | `dateStyle: 'mm-dd'` | `dateStyle: 'yy-mm-dd'` | `year: 'numeric', month: 'numeric', day: 'numeric'` |
| **Day** | `weekday: 'abbr'` | `weekday: 'short'` | `weekday: 'long'` |
| **Time** | `timeStyle: 'short'` | `timeStyle: 'short'` | `timeStyle: 'short'` |

### Intl.DurationFormat (Relative Time)
We will calculate the difference and format it.
- **Compact**: `style: 'narrow'` (e.g., `1d`)
- **Short**: `style: 'short'` (e.g., `1 day`)
- **Long**: `style: 'long'` (e.g., `in one day`)
- **Longer**: `style: 'long'` (e.g., `in one day 2 hours`)

*Decision*: For "Long / Longer", we want "natural language time until". `Intl.RelativeTimeFormat` is perfect for "in 1 day" or "1 day ago". `Intl.DurationFormat` just gives the duration "1 day".
For consistency in the pattern `...({time until})`, using `Intl.RelativeTimeFormat` for the wide format makes sense. For compact/short, we might stick to duration to save space, or use `RelativeTimeFormat` with `style: 'narrow'/'short'`.
Let's stick to the user's examples:
- Compact: `(1d)` -> RelativeTimeFormat
- Short: `(1 day)` -> RelativeTimeFormat
- Long: `(in 1 day)` -> RelativeTimeFormat.
- Longer: `(in 1 day 2 hours)` -> RelativeTimeFormat (with 2 most significant units).

Refined Plan:
- **Compact**: Relative (`narrow`)  just `-` .
- **Short**: Relative (`short`).
- **Long**: Relative (`long`).
