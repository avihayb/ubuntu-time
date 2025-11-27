/**
 * Formats a date into a human-readable string.
 * Pattern: {date}({day of week}) {time}({time until datetime})
 * @param {object} options - Options for formatting the date.
 * @param {Date} options.to - The target date to format.
 * @param {Date} [options.from=new Date()] - The reference date for relative formatting.
 * @param {'compact' | 'short' | 'long' | 'longer'} [options.style='short'] - The style to use.
 * @param {1 | 1.5 | 2 | 'one' | 'two' | 'once' | 'twice'} [options.durationThreshold='twice'] - Threshold for switching units.
 * @param {string[]|string} [options.locale] - The locale to use. Defaults to navigator.language if available, else 'en-US'.
 * @returns {{text: string, inFuture: boolean, inAYearOrMore: boolean, locale: string, timeZone: string, toString: function()=>string }}
 */
export function format({ to, from = new Date(), style = 'short', durationThreshold = 'twice', locale } = {}) {
    const _locale = getLocale(locale);
    const parts = formatToParts({ to, from, style, durationThreshold, locale: _locale });

    const text = parts.map(p => p.value).join('');
    const diffMs = to.getTime() - from.getTime();
    const inFuture = diffMs > 0;
    const inAYearOrMore = Math.abs(diffMs) >= 365 * 24 * 60 * 60 * 1000; // Rough approximation
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
        text,
        inFuture,
        inAYearOrMore,
        locale: _locale,
        timeZone,
        toString: () => text
    };
}

/**
 * Formats a date to parts.
 * @param {object} options - Same options as format.
 * @returns {Array<{type: string, value: string}>}
 */
export function formatToParts({ to, from = new Date(), style = 'short', durationThreshold = 'twice', locale } = {}) {
    const targetDate = new Date(to);
    const now = new Date(from);
    const _locale = getLocale(locale);

    const options = getStyleOptions(style);

    // 1. Date
    // User wants ISO 8601 style: MM-dd (compact/short) or YYYY-MM-dd (long).
    // Intl.DateTimeFormat is locale dependent. To force this format, we can format parts manually or use 'en-CA' (YYYY-MM-DD).
    // However, MM-dd is not standard ISO (YYYY-MM-DD).
    // Let's construct it manually to ensure consistency across locales as requested.

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');

    let dateStr;
    if (style === 'long' || style === 'longer') {
        dateStr = `${year}-${month}-${day}`;
    } else if (style === 'short') {
        const shortYear = String(year).slice(-2);
        dateStr = `${shortYear}-${month}-${day}`;
    } else {
        dateStr = `${month}-${day}`;
    }

    // 2. Day of week
    const dayStr = new Intl.DateTimeFormat(_locale, options.day).format(targetDate);

    // 3. Time
    const timeStr = new Intl.DateTimeFormat(_locale, options.time).format(targetDate);

    // 4. Duration / Relative Time
    const durationStr = formatRelativeTime(targetDate, now, style, durationThreshold, _locale);

    return [
        { type: 'date', value: dateStr },
        { type: 'literal', value: '(' },
        { type: 'day', value: dayStr },
        { type: 'literal', value: ') ' },
        { type: 'time', value: timeStr },
        { type: 'literal', value: '(' },
        { type: 'relative', value: durationStr },
        { type: 'literal', value: ')' }
    ];
}

function getLocale(locale) {
    if (locale) return locale;
    if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const options = new Intl.DateTimeFormat().resolvedOptions();
        if (options.locale) return options.locale;
    }
    return 'en-US';
}

function getStyleOptions(style) {
    const base = {
        time: { timeStyle: 'short' }
    };

    switch (style) {
        case 'compact':
            return {
                ...base,
                // Date handled manually now
                day: { weekday: 'narrow' }
            };
        case 'long':
        case 'longer':
            return {
                ...base,
                date: { year: '2-digit', month: '2-digit', day: '2-digit' }, // 23-11-25
                day: { weekday: 'long' }
            };
        case 'short':
        default:
            return {
                ...base,
                // Date handled manually now
                day: { weekday: 'short' }
            };
    }
}

function formatRelativeTime(target, now, style, durationThreshold, locale) {
    const diffMs = target.getTime() - now.getTime();
    const absMs = Math.abs(diffMs);

    const seconds = Math.floor(absMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30); // Approx
    const years = Math.floor(days / 365); // Approx

    let primaryUnit = 'second';
    let primaryValue = seconds;

    if (style === 'longer') {
        // Standard breakdown for longer style (no thresholds)
        if (years > 0) {
            primaryUnit = 'year';
            primaryValue = years;
        } else if (months > 0) {
            primaryUnit = 'month';
            primaryValue = months;
        } else if (weeks > 0) {
            primaryUnit = 'week';
            primaryValue = weeks;
        } else if (days > 0) {
            primaryUnit = 'day';
            primaryValue = days;
        } else if (hours > 0) {
            primaryUnit = 'hour';
            primaryValue = hours;
        } else if (minutes > 0) {
            primaryUnit = 'minute';
            primaryValue = minutes;
        } else {
            primaryUnit = 'second';
            primaryValue = seconds;
        }
    } else {
        // Thresholds
        let multiplier = 2;
        if (durationThreshold === 1 || durationThreshold === 'one' || durationThreshold === 'once') {
            multiplier = 1;
        } else if (durationThreshold === 1.5) {
            multiplier = 1.5;
        }

        if (seconds < 60 * multiplier) {
            primaryUnit = 'second';
            primaryValue = seconds;
        } else if (minutes < 60 * multiplier) {
            primaryUnit = 'minute';
            primaryValue = minutes;
        } else if (hours < 24 * multiplier) {
            primaryUnit = 'hour';
            primaryValue = hours;
        } else if (days < 7 * multiplier) { // Week threshold? Or just days? Design said 14 days (2 weeks).
            // Design: 14 days (2 weeks). So base is 7 days (1 week).
            primaryUnit = 'day';
            primaryValue = days;
        } else if (weeks < 4 * multiplier) { // 8 weeks (2 months). Base 4 weeks (1 month).
            primaryUnit = 'week';
            primaryValue = weeks;
        } else if (months < 12 * multiplier) { // 24 months (2 years). Base 12 months (1 year).
            primaryUnit = 'month';
            primaryValue = months;
        } else {
            primaryUnit = 'year';
            primaryValue = years;
        }
    }

    // Long/Longer: RelativeTimeFormat
    if (style === 'long' || style === 'longer') {
        // Use numeric: 'always' for longer to avoid "tomorrow" when we want "1 day 2 hours"
        const numeric = style === 'longer' ? 'always' : 'auto';
        const rtf = new Intl.RelativeTimeFormat(locale, { style: 'long', numeric });

        if (style === 'long') {
            return rtf.format(Math.sign(diffMs) * primaryValue, primaryUnit);
        }

        // Longer: 2 units.
        const units = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];

        // Re-calculate precise values for breakdown
        let remainderMs = absMs;

        // Constants in ms
        const MS_SECOND = 1000;
        const MS_MINUTE = 60 * MS_SECOND;
        const MS_HOUR = 60 * MS_MINUTE;
        const MS_DAY = 24 * MS_HOUR;
        const MS_WEEK = 7 * MS_DAY;
        const MS_MONTH = 30 * MS_DAY; // Approx
        const MS_YEAR = 365 * MS_DAY; // Approx

        const unitMs = {
            year: MS_YEAR,
            month: MS_MONTH,
            week: MS_WEEK,
            day: MS_DAY,
            hour: MS_HOUR,
            minute: MS_MINUTE,
            second: MS_SECOND
        };

        const primaryUnitIndex = units.indexOf(primaryUnit);
        const nextUnit = units[primaryUnitIndex + 1];

        // Calculate value for primary unit
        const val1 = Math.floor(remainderMs / unitMs[primaryUnit]);
        remainderMs -= val1 * unitMs[primaryUnit];

        let str1 = rtf.format(Math.sign(diffMs) * val1, primaryUnit);

        if (!nextUnit) return str1; // Seconds has no next unit

        const val2 = Math.floor(remainderMs / unitMs[nextUnit]);

        if (val2 === 0) return str1;

        // Format second part. "2 hours". We need DurationFormat or manual.
        // RelativeTimeFormat adds "in" / "ago". We don't want "in 1 day in 2 hours".
        // We want "in 1 day 2 hours".
        // So we strip the "in"/"ago" from the second part? Or use DurationFormat for second part?
        // DurationFormat is perfect for "2 hours".

        if (typeof Intl.DurationFormat !== 'undefined') {
            const fmt = new Intl.DurationFormat(locale, { style: 'long' });
            const durationObj = { [nextUnit + 's']: val2 };
            const str2 = fmt.format(durationObj);

            // Combine. "in 1 day" + " " + "2 hours".
            // But "in 1 day" might be "tomorrow".
            // If it's "tomorrow", adding " 2 hours" might look weird: "tomorrow 2 hours".
            // "in 1 day 2 hours" -> "tomorrow 2 hours" is acceptable?
            // Or "in 1 day" -> "in 1 day".
            // Let's assume space separation is fine.
            return `${str1} ${str2}`;
        }

        // Fallback for second part
        return `${str1} ${val2} ${nextUnit}s`; // Very rough fallback
    }

    // Compact/Short: DurationFormat
    const durationStyle = style === 'compact' ? 'narrow' : 'short';

    if (typeof Intl.DurationFormat !== 'undefined') {
        const fmt = new Intl.DurationFormat(locale, { style: durationStyle });

        // We only want the primary unit for compact/short.
        // We identified primaryUnit and primaryValue.

        const duration = { [primaryUnit + 's']: primaryValue };

        return (diffMs < 0 ? '-' : '') + fmt.format(duration);
    }

    // Fallback using Intl.RelativeTimeFormat and LCS
    // This extracts the duration part (e.g., "2 months", "חודשיים") from "in 2 months" / "2 months ago"
    const rtf = new Intl.RelativeTimeFormat(locale, { style: durationStyle, numeric: 'always' });
    const s1 = rtf.format(primaryValue, primaryUnit);
    const s2 = rtf.format(-primaryValue, primaryUnit);
    const localizedDuration = getLCS(s1, s2).trim();

    return (diffMs < 0 ? '-' : '') + localizedDuration;
}

function getLCS(s1, s2) {
    const l1 = s1.length;
    const l2 = s2.length;
    const dp = Array(l1 + 1).fill(0).map(() => Array(l2 + 1).fill(0));
    let maxLen = 0;
    let endIndex = 0;

    for (let i = 1; i <= l1; i++) {
        for (let j = 1; j <= l2; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                if (dp[i][j] > maxLen) {
                    maxLen = dp[i][j];
                    endIndex = i;
                }
            }
        }
    }
    return s1.substring(endIndex - maxLen, endIndex);

}
