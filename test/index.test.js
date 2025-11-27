import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { format } from '../src/index.js';

describe('format', () => {
    const now = new Date();
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day
    const past = new Date(now.getTime() - 60 * 60 * 1000); // -1 hour

    it('should format with default style (short)', () => {
        const result = format({ to: future, from: now });
        console.log('Default (Short):', result.text, result.timeZone);
        // 25-11-24(Mon) 10:00 PM(1 day) - Updated to YY-MM-DD
        assert.match(result.text, /^\d{2}-\d{2}-\d{2}\([A-Za-z]+\) \d{1,2}:\d{2}\s[AP]M\(.*\)$/);
        assert.strictEqual(result.inFuture, true);
        assert.strictEqual(result.inAYearOrMore, false);
        assert.ok(result.locale);
        assert.ok(result.timeZone);
    });

    it('should format with compact style', () => {
        const result = format({ to: future, from: now, style: 'compact' });
        console.log('Compact:', result.text, result.timeZone);
        // 11-24(M) 10:00 PM(1d)
        assert.match(result.text, /^\d{2}-\d{2}\([A-Za-z]+\) \d{1,2}:\d{2}\s[AP]M\(.*\)$/);
    });

    it('should format with long style', () => {
        const result = format({ to: future, from: now, style: 'long' });
        console.log('Long:', result.text, result.timeZone);
        // 2025-11-24(Monday) 10:00 PM(in 1 day) - Updated to YYYY-MM-DD
        assert.match(result.text, /^\d{4}-\d{1,2}-\d{1,2}\([A-Za-z]+\) \d{1,2}:\d{2}\s[AP]M\(.*\)$/);
        assert.ok(result.text.includes('in') || result.text.includes('tomorrow'), 'Should use relative time format');
    });

    it('should handle past dates', () => {
        const result = format({ to: past, from: now, style: 'short' });
        console.log('Past (Short):', result.text, result.timeZone);
        assert.ok(result.text.includes('-'), 'Should indicate negative duration');
        assert.strictEqual(result.inFuture, false);
    });

    it('should return parts', async () => {
        const { formatToParts } = await import('../src/index.js');
        const parts = formatToParts({ to: future, from: now, style: 'short' });
        console.log('Parts:', parts);
        assert.ok(Array.isArray(parts));
        assert.ok(parts.find(p => p.type === 'date'));
        assert.ok(parts.find(p => p.type === 'day'));
        assert.ok(parts.find(p => p.type === 'time'));
        assert.ok(parts.find(p => p.type === 'relative'));
    });

    it('should format for en-IL', () => {
        const result = format({ to: future, from: now, locale: 'en-IL', style: 'compact' });
        console.log('en-IL:', result.text, result.timeZone);
        // en-IL might use 24h time or different day names?
        // 11-24(Mon) 22:00(1 day) - usually 24h in IL but english day names
        assert.strictEqual(result.locale, 'en-IL');
    });

    it('should format for en-IL', () => {
        const result = format({ to: future, from: now, locale: 'en-IL' });
        console.log('en-IL:', result.text, result.timeZone);
        // en-IL might use 24h time or different day names?
        // 11-24(Mon) 22:00(1 day) - usually 24h in IL but english day names
        assert.strictEqual(result.locale, 'en-IL');
    });

    it('should format for en-IL', () => {
        const result = format({ to: future, from: now, locale: 'en-IL', style: 'long' });
        console.log('en-IL:', result.text, result.timeZone);
        // en-IL might use 24h time or different day names?
        // 11-24(Mon) 22:00(1 day) - usually 24h in IL but english day names
        assert.strictEqual(result.locale, 'en-IL');
    });

    it('should format for he-IL', () => {
        // he-IL: Hebrew language, IL region?    
        // Hebrew day names, maybe 12h time?
        const result = format({ to: future, from: now, locale: 'he-IL', style: 'compact' });
        console.log('he-IL:', result.text, result.timeZone);
        // 11-24(יום ב׳) 10:00 PM(מחר) or similar
        assert.strictEqual(result.locale, 'he-IL');
    });

    it('should format for he-IL', () => {
        // he-IL: Hebrew language, IL region?    
        // Hebrew day names, maybe 12h time?
        const result = format({ to: future, from: now, locale: 'he-IL' });
        console.log('he-IL:', result.text, result.timeZone);
        // 11-24(יום ב׳) 10:00 PM(מחר) or similar
        assert.strictEqual(result.locale, 'he-IL');
    });

    it('should format for he-IL', () => {
        // he-IL: Hebrew language, IL region?    
        // Hebrew day names, maybe 12h time?
        const result = format({ to: future, from: now, locale: 'he-IL', style: 'long' });
        console.log('he-IL:', result.text, result.timeZone);
        // 11-24(יום ב׳) 10:00 PM(מחר) or similar
        assert.strictEqual(result.locale, 'he-IL');
    });

    const future2 = new Date("2026-01-31T14:00:00")

    it('should format for en-IL', () => {
        console.log('future2:', future2);
        const result = format({ to: future2, from: now, locale: 'en-IL', style: 'compact' });
        console.log('en-IL:', result.text, result.timeZone);
        // en-IL might use 24h time or different day names?
        // 11-24(Mon) 22:00(1 day) - usually 24h in IL but english day names
        assert.strictEqual(result.locale, 'en-IL');
    });

    it('should format for en-IL', () => {
        const result = format({ to: future2, from: now, locale: 'en-IL' });
        console.log('en-IL:', result.text, result.timeZone);
        // en-IL might use 24h time or different day names?
        // 11-24(Mon) 22:00(1 day) - usually 24h in IL but english day names
        assert.strictEqual(result.locale, 'en-IL');
    });

    it('should format for en-IL', () => {
        const result = format({ to: future2, from: now, locale: 'en-IL', style: 'long' });
        console.log('en-IL:', result.text, result.timeZone);
        // en-IL might use 24h time or different day names?
        // 11-24(Mon) 22:00(1 day) - usually 24h in IL but english day names
        assert.strictEqual(result.locale, 'en-IL');
    });

    it('should format for en-GB', () => {
        // en-GB uses 24h format (e.g. 22:00 instead of 10:00 PM)
        const pmTime = new Date(now.getTime());
        pmTime.setHours(22, 0, 0, 0);
        const result = format({ to: pmTime, from: now, locale: 'en-GB' });
        console.log('en-GB:', result.text);
        // Should contain 22:00
        assert.ok(result.text.includes('22:00'));
        assert.strictEqual(result.locale, 'en-GB');
    });

    it('should format for he-IL', () => {
        // he-IL: Hebrew language, IL region?    
        // Hebrew day names, maybe 12h time?
        const result = format({ to: future2, from: now, locale: 'he-IL', style: 'compact' });
        console.log('he-IL:', result.text, result.timeZone);
        // 11-24(יום ב׳) 10:00 PM(מחר) or similar
        assert.strictEqual(result.locale, 'he-IL');
    });

    it('should format for he-IL', () => {
        // he-IL: Hebrew language, IL region?    
        // Hebrew day names, maybe 12h time?
        const result = format({ to: future2, from: now, locale: 'he-IL' });
        console.log('he-IL:', result.text, result.timeZone);
        // 11-24(יום ב׳) 10:00 PM(מחר) or similar
        assert.strictEqual(result.locale, 'he-IL');
    });

    it('should format for he-IL', () => {
        // he-IL: Hebrew language, IL region?    
        // Hebrew day names, maybe 12h time?
        const result = format({ to: future2, from: now, locale: 'he-IL', style: 'long' });
        console.log('he-IL:', result.text, result.timeZone);
        // 11-24(יום ב׳) 10:00 PM(מחר) or similar
        assert.strictEqual(result.locale, 'he-IL');
    });

    it('should format with longer style', () => {
        const result = format({ to: future, from: now, style: 'longer' });
        console.log('Longer:', result.text, result.timeZone);
        // 2025-11-24(Monday) 10:00 PM(in 1 day) - 1 day is exact, so no second unit
        assert.match(result.text, /^\d{4}-\d{2}-\d{2}\([A-Za-z]+\) \d{1,2}:\d{2}\s[AP]M\(.*\)$/);
    });

    it('should format longer style with 2 units', () => {
        const futurePlus2h = new Date(future.getTime() + 2 * 60 * 60 * 1000);
        const result = format({ to: futurePlus2h, from: now, style: 'longer' });
        console.log('Longer (2 units):', result.text, result.timeZone);
        // Should be "in 1 day 2 hours"
        assert.ok(result.text.includes('1 day') && result.text.includes('2 hours'));
    });

    it('should respect duration thresholds (1x)', () => {
        // 60 seconds -> 1 minute (1x threshold)
        const s60 = new Date(now.getTime() + 60 * 1000);
        const r1 = format({ to: s60, from: now, style: 'short', durationThreshold: 1 });
        console.log('60s (1x):', r1.text);
        assert.ok(r1.text.includes('1 min'));

        // 59 seconds -> 59 seconds (1x threshold)
        const s59 = new Date(now.getTime() + 59 * 1000);
        const r2 = format({ to: s59, from: now, style: 'short', durationThreshold: 1 });
        console.log('59s (1x):', r2.text);
        assert.ok(r2.text.includes('59 sec'));
    });

    it('should respect duration thresholds (2x default)', () => {
        // 119 seconds -> 119 seconds
        const s119 = new Date(now.getTime() + 119 * 1000);
        const r1 = format({ to: s119, from: now, style: 'short' });
        console.log('119s:', r1.text);
        assert.ok(r1.text.includes('119 sec'));

        // 120 seconds -> 2 minutes
        const s120 = new Date(now.getTime() + 120 * 1000);
        const r2 = format({ to: s120, from: now, style: 'short' });
        console.log('120s:', r2.text);
        assert.ok(r2.text.includes('2 min'));

        // 119 minutes -> 119 minutes
        const m119 = new Date(now.getTime() + 119 * 60 * 1000);
        const r3 = format({ to: m119, from: now, style: 'short' });
        console.log('119m:', r3.text);
        assert.ok(r3.text.includes('119 min'));

        // 120 minutes -> 2 hours
        const m120 = new Date(now.getTime() + 120 * 60 * 1000);
        const r4 = format({ to: m120, from: now, style: 'short' });
        console.log('120m:', r4.text);
        assert.ok(r4.text.includes('2 hr'));

        // 47 hours -> 47 hours
        const h47 = new Date(now.getTime() + 47 * 60 * 60 * 1000);
        const r5 = format({ to: h47, from: now, style: 'short' });
        console.log('47h:', r5.text);
        assert.ok(r5.text.includes('47 hr'));

        // 48 hours -> 2 days
        const h48 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const r6 = format({ to: h48, from: now, style: 'short' });
        console.log('48h:', r6.text);
        assert.ok(r6.text.includes('2 day'));
    });

    it('should respect duration thresholds (1.5x)', () => {
        // 89 seconds -> 89 seconds (1.5x threshold = 90s)
        const s89 = new Date(now.getTime() + 89 * 1000);
        const r1 = format({ to: s89, from: now, style: 'short', durationThreshold: 1.5 });
        console.log('89s (1.5x):', r1.text);
        assert.ok(r1.text.includes('89 sec'));

        // 90 seconds -> 1 minute (1.5x threshold = 90s)
        const s90 = new Date(now.getTime() + 90 * 1000);
        const r2 = format({ to: s90, from: now, style: 'short', durationThreshold: 1.5 });
        console.log('90s (1.5x):', r2.text);
        assert.ok(r2.text.includes('1 min'));
    });
});
