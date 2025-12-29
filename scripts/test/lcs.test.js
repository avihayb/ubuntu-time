
import { test } from 'node:test';
import assert from 'node:assert';
import { format } from '../src/index.js';

test('LCS Fallback for Relative Time', async (t) => {
    const now = new Date('2025-11-25T12:00:00Z');

    // Helper to check relative time part
    const checkRelative = (to, locale, style, expected) => {
        const result = format({ to, from: now, locale, style });
        // Extract relative part: "{date}({day}) {time}({relative})"
        const match = result.text.match(/\(([^)]+)\)$/);
        assert.ok(match, `Could not find relative part in "${result.text}"`);
        assert.strictEqual(match[1], expected, `Failed for ${locale} ${style}`);
    };

    // 1. he-IL (Hebrew)
    // 2 months future
    const future2Months = new Date('2026-01-25T12:00:00Z');
    // 2 weeks future
    const future2Weeks = new Date('2025-12-09T12:00:00Z');
    // 2 days future
    const future2Days = new Date('2025-11-27T12:00:00Z');


    await t.test('he-IL compact', () => {
        // 2 months -> "2 חו'" (Numeric fix applied)
        checkRelative(future2Months, 'he-IL', 'compact', "2 חו'");

        // 2 weeks -> "2 שב'" (Numeric fix applied)
        checkRelative(future2Weeks, 'he-IL', 'compact', "2 שב'");

        // 2 days -> "2 ימים" (Numeric fix applied)
        checkRelative(future2Days, 'he-IL', 'compact', "2 י'");
    });

    await t.test('he-IL short', () => {
        // 2 months -> "2 חודשים" (Numeric fix applied)
        checkRelative(future2Months, 'he-IL', 'short', '2 חודשים');

        // 2 weeks -> "2 שבועות" (Numeric fix applied)
        checkRelative(future2Weeks, 'he-IL', 'short', '2 שב׳');

        // 2 days -> "2 ימים" (Numeric fix applied)
        checkRelative(future2Days, 'he-IL', 'short', '2 ימים');
    });

    await t.test('he-IL long', () => {
        // 2 months -> "בעוד חודשיים" (With "in" prefix)
        checkRelative(future2Months, 'he-IL', 'long', 'בעוד חודשיים');

        // 2 weeks -> "בעוד שבועיים" (With "in" prefix)
        checkRelative(future2Weeks, 'he-IL', 'long', 'בעוד שבועיים');

        // 2 days -> "בעוד יומיים" (With "in" prefix)
        checkRelative(future2Days, 'he-IL', 'long', 'מחרתיים');
    });

    // 2. en-US (English) - should still work (though it might differ slightly from hardcoded "2 mon")
    // Previous hardcoded: "2 mon"
    // Intl.RelativeTimeFormat short: "in 2 mo." / "2 mo. ago" -> LCS "2 mo."
    await t.test('en-US short', () => {
        checkRelative(future2Months, 'en-US', 'short', '2 mo.');
    });

});
