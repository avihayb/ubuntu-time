# Ubuntu Time

A JavaScript library for formatting dates and times into a human-readable format.

The emphasis is on simplicity and ease of use. Humans think about datetime in several ways:
- An absolute value which can be compared
- A relative value which should have a more precise resolution the closer it is to the current/compared time
- seasonal value (Month names/numbers seem to be apt for this)
- day of week (scheduling events)

Formatters tend to give you just one of those.

## Needs

Parsing a full datetime format is a bit slow. Computing a time difference is slower still. if you want to schedule events you'd need to look at time from different perspectives.

Libraries such as moment.js give a a relative time format for short time differences, and absolute format for long time differences. This is a bad user experience for humans in my opinion, as the two formats are not compatible and require reinterpretation of the data for a comparison, as well as knowing the current time to compute the relative time.

It's easier to schedule events with the absolute format then to go to all that bother.

Or we can choose not to compromise and use a format that can be read as both absolute and relative.
It's possible.
We can have all that and a ~~bag of chips~~ day of week.

## Format

The library formats dates to follow this pattern:
`{date}({day of week}) {time}({time until datetime})`

The date is formatted using ISO 8601.
The day of week, time and time until datetime are formatted using the locale's time format.

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
import { format } from 'ubuntu-time';

const date = new Date();
console.log(format({ to: date }).text);
```

## Examples

### Styles

The library supports 4 styles: `compact`, `short` (default), `long`, and `longer`.

```javascript
import { format } from 'ubuntu-time';

const now = new Date();
const target = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

// Compact
// Output: 11-27(Wed) 3:45 PM(+2h)
console.log(format({ to: target, style: 'compact' }).text);

// Short (Default)
// Output: 25-11-27(Wed) 3:45 PM(+2h)
console.log(format({ to: target, style: 'short' }).text);

// Long
// Output: 2025-11-27(Wednesday) 3:45 PM(in 2 hours)
console.log(format({ to: target, style: 'long' }).text);

// Longer
// Output: 2025-11-27(Wednesday) 3:45 PM(in 2 hours)
console.log(format({ to: target, style: 'longer' }).text);
```

### Locales

You can specify a locale. If not specified, it defaults to `navigator.language`, the system language or `en-US`.

```javascript
const target = new Date();

// Arabic
// Output: 11-27(الأربعاء) 15:45(+0 س)
console.log(format({ to: target, locale: 'ar-EG' }).text);

// French
// Output: 11-27(mer.) 15:45(+0 h)
console.log(format({ to: target, locale: 'fr-FR' }).text);

// Hebrew
// Output: 11-27(ד׳) 15:45(+0ש׳)
console.log(format({ to: target, locale: 'he-IL' }).text);
```

### Relative Time

The relative time part adapts to the duration.

```javascript
const now = new Date();
const past = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

// Output: ... (-3d)
console.log(format({ to: past, from: now }).text);
```
