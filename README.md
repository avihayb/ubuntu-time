# Useful Time

A JavaScript library for formatting dates and times into a human-readable format.

The emphasis is on simplicity and ease of use. Humans think about datetime in several ways:
- An absolute value which can be compared
- A relative value from a given point in time (like now)
- seasonal value (Month names/numbers seem to be apt for this)
- day of week (scheduling events)

Formatters tend to give you just one of those.

useful-time attempts to provide all of those in a single format.

## Needs

Parsing a full datetime format in your mind is a bit slow. Computing a time difference is slower still. if you want to schedule events you'd need to look at time from different perspectives.

When using libraries, such as moments.js in a calendar mode (think gMail inbox mail dates), give a relative time format for short time differences, and absolute format for long time differences. This is a bad user experience for humans in my opinion, since the two formats are not compatible and require reinterpretation of the data for a comparison, as well as knowing the current time to compute the relative time.

It's easier to schedule events with the absolute format then to go to all that bother.

Or we can choose not to compromise and use a format that can be read as both absolute and relative.
It's possible.
We can have all that and a ~~bag of chips~~ day of week.

## Format

The library formats dates to follow this pattern:
`{date}({day of week}) {time}({time until datetime})`

The date is formatted using ISO 8601, except for the compact format which uses the obsolete mm-dd format.
The day of week, time and time until datetime are formatted using the locale's time format.

**Localized Numbers**: All numbers (date, time, and duration) are displayed using the locale's native numeral system. For example:
- Arabic locales use Eastern Arabic numerals (٠-٩)
- Persian locales use Persian numerals (۰-۹)
- Bengali locales use Bengali numerals (০-৯)
- Hindi locales use Devanagari numerals (०-९)

If the locale time is lexically sortable (e.g. using 24h format), the format will also be lexically sortable. Note that default `en-US` uses 12h format (AM/PM) which is not lexically sortable.


There are 4 formats (for now):
- compact: `{truncated short date format}({abbrev day of week}) {time}({abbrev time until datetime})`
- short: `{short date format with year}({short day of week}) {time}({short time until datetime})`
- long: `{long date format }({full day of week}) {time}({short time until datetime expressed in natural language})`
- longer: `{long date format}({full day of week}) {time}({natural language time until datetime})`

For the duration part, you can pick the *threshold* to switch to the next unit class (e.g., in once, 60 seconds -> minutes; in 1.5, 90 seconds -> minutes; in twice, 120 seconds -> minutes).
for example:
| duration | 1 | 1.5 | 2 |
| :--- | :--- | :--- | :--- |
| 23h | 23h | 23h | 23h |
| 24h | 1d | 24h | 24h |
| 25h | 1d | 25h | 25h |
| 35h | 1d | 35h | 35h |
| 36h | 1d | 1d | 36h |
| 37h | 1d | 1d | 37h |
| 47h | 1d | 1d | 47h |
| 48h | 2d | 2d | 2d |
| 49h | 2d | 2d | 2d |


## Usage

```javascript
// Option 1: Named imports (traditional)
import { format } from 'useful-time';
console.log(format({ to: new Date() }).text);

// Option 2: Default import
import useful_time from 'useful-time';
console.log(useful_time.format({ to: new Date() }).text);

// Option 3: Use the 'ut' alias (recommended for conciseness)
import { ut } from 'useful-time';
console.log(ut.format({ to: new Date() }).text);
```

## Examples

### Styles

The library supports 4 styles: `compact`, `short` (default), `long`, and `longer`.

```javascript
import { ut } from 'useful-time';

const now = new Date();
const target = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

// Compact
// Output: 11-27(Wed) 3:45 PM(+2h)
console.log(ut.format({ to: target, style: 'compact' }).text);

// Short (Default)
// Output: 25-11-27(Wed) 3:45 PM(+2h)
console.log(ut.format({ to: target, style: 'short' }).text);

// Long
// Output: 2025-11-27(Wednesday) 3:45 PM(in 2 hours)
console.log(ut.format({ to: target, style: 'long' }).text);

// Longer
// Output: 2025-11-27(Wednesday) 3:45 PM(in 2 hours)
console.log(ut.format({ to: target, style: 'longer' }).text);
```

### Locales

You can specify a locale. If not specified, it defaults to `navigator.language`, the system language or `en-US`.

The library automatically adapts to the locale's formatting conventions, including:
- **Numeral systems**: Numbers are displayed using locale-specific numerals
- **Time format**: 12-hour (AM/PM) or 24-hour format
- **Text direction**: Proper handling of RTL languages
- **Weekday abbreviations**: Optimized for compactness while maintaining distinctness

```javascript
const target = new Date();

// English (Western Arabic numerals: 0-9)
// Output: 11-27(Wed) 3:45 PM(+0 hr.)
console.log(ut.format({ to: target, locale: 'en-US' }).text);

// Arabic (Eastern Arabic numerals: ٠-٩)
// Output: ١١-٢٧(الأربعاء) ١٥:٤٥(+٠ س)
console.log(ut.format({ to: target, locale: 'ar-EG' }).text);

// Persian (Persian numerals: ۰-۹)
// Output: ۱۱-۲۷(چهارشنبه) ۱۵:۴۵(+۰ ساعت)
console.log(ut.format({ to: target, locale: 'fa-IR' }).text);

// French
// Output: 11-27(mer.) 15:45(+0 h)
console.log(ut.format({ to: target, locale: 'fr-FR' }).text);

// Hebrew
// Output: 11-27(ד׳) 15:45(+0ש׳)
console.log(ut.format({ to: target, locale: 'he-IL' }).text);
```

### Relative Time

The relative time part adapts to the duration.

```javascript
const now = new Date();
const past = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

// Output: ... (-3d)
console.log(ut.format({ to: past, from: now }).text);
```


## API

### format(options)

Formats a date to a human-readable format.

#### Parameters

- `options` (required): The options object.
  - `to` (required): The date to format.
  - `from` (optional): The date to compare to. Defaults to the current date.
  - `style` (optional): The style to use. pick from `compact`, `short` (default), `long`, and `longer`.
  - `locale` (optional): The locale to use. Defaults to `navigator.language`, the system language or `en-US`.
  - `threshold` (optional): The threshold to use. pick from `1`, `1.5`, `2`, `"one"`, `"two"`, `"once"`, `"twice"`.

#### Returns

An object with the following properties:
  - `text` (string): The formatted date string.
  - `inFuture` (boolean): Whether the date is in the future.
  - `inAYearOrMore` (boolean): Whether the date is in a year or more.
  - `locale` (string): The locale used for formatting.
  - `timeZone` (string): The time zone used for formatting.
  - `toString` (function): A function that returns the formatted date string.

you can send the object directly to `console.log` or `console.error` and it will print the formatted date string.
  
### formatToParts(options)

Formats a date to a human-readable format.

#### Parameters

- `options` (required): The options object.
  - `to` (required): The date to format.
  - `from` (optional): The date to compare to. Defaults to the current date.
  - `style` (optional): The style to use. pick from `compact`, `short` (default), `long`, and `longer`.
  - `locale` (optional): The locale to use. Defaults to `navigator.language`, the system language or `en-US`.
  - `threshold` (optional): The threshold to use. pick from `1`, `1.5`, `2`, `"one"`, `"two"`, `"once"`, `"twice"`.

#### Returns

An array of objects with the following properties:
  - `type` (string): The type of the part. should be from: `"literal"` | `"date"` | `"day of week"` | `"time"` | `"relative"`.
  - `value` (string): The value of the part.




## issues

- ~~the numbers for date and time are not localized.~~ **RESOLVED**: Date and time numbers now use locale-specific numeral systems (e.g., Eastern Arabic numerals for Arabic, Persian numerals for Farsi, etc.).
- some locales use AM/PM which is not lexically sortable.
- ~~some locales need override for the relative time format in compact mode. I've filled the ones that didn't exist, but there are probably more existing that need shorter text for compact mode.~~ I've added a strategy for using abbriviated weekdays from small style when compact style fails to deliver the goods (using an abbreviation where two days have the same abbreviation, like T for Tuesday and Thursday in en-US, or not actually using an abbreviation). You can add an override to fix your locale by submitting a pull request.
- ~~the tests arn't great, and don't cover a representative set of most used locales.~~ **RESOLVED**: Tests now have correct import paths and all 30 tests pass successfully, covering multiple locales (en-US, en-IL, en-GB, he-IL, ar-EG, fa-IR, hi-IN, bn-BD) and formatting styles. still, testcases only cover few locales.
- maybe parts should be further subdivided.
- didn't take the time to check how much AI slop I've introduced, though the implementation looks solid at a glance
- optimise the formatting by imitating the underlying Intl.DateTimeFormat and friends. enabling storing the underlying formatter, and reusing it for the same locale and style.
- adding a format string
- looking for other optimizations

