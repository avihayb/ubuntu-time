/**
 * Analyzes the 42 locales that remain ambiguous with 2-letter truncation
 * to see if 3-letter truncation makes them distinct
 */

import { readFileSync } from 'fs';

const twoLetterData = JSON.parse(readFileSync('./locale/two_letter_analysis.json', 'utf8'));

console.log('=== ANALYZING 3-LETTER TRUNCATION FOR AMBIGUOUS LOCALES ===\n');

const results = {
    becomesDistinct: [],
    stillAmbiguous: []
};

// Also analyze the length distribution of short format
const lengthStats = {
    min: Infinity,
    max: 0,
    byLocale: []
};

for (const locale of twoLetterData.stillAmbiguous) {
    // Get first 3 characters of each short weekday
    const threeLetter = locale.short.map(day => {
        const chars = Array.from(day);
        return chars.slice(0, 3).join('');
    });

    // Track length stats
    const lengths = locale.short.map(day => Array.from(day).length);
    const minLen = Math.min(...lengths);
    const maxLen = Math.max(...lengths);
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;

    lengthStats.byLocale.push({
        locale: locale.locale,
        min: minLen,
        max: maxLen,
        avg: Math.round(avgLen * 10) / 10,
        lengths
    });

    if (minLen < lengthStats.min) lengthStats.min = minLen;
    if (maxLen > lengthStats.max) lengthStats.max = maxLen;

    // Check if all 3-letter abbreviations are distinct
    const threeLetterSet = new Set(threeLetter);
    const isDistinct = threeLetterSet.size === 7;

    const result = {
        locale: locale.locale,
        short: locale.short,
        twoLetter: locale.twoLetter,
        threeLetter,
        isDistinct,
        twoLetterDuplicates: locale.duplicates,
        lengths: {
            min: minLen,
            max: maxLen,
            avg: Math.round(avgLen * 10) / 10
        }
    };

    if (isDistinct) {
        results.becomesDistinct.push(result);
    } else {
        // Find duplicates in 3-letter format
        const counts = {};
        threeLetter.forEach((item, index) => {
            if (!counts[item]) counts[item] = [];
            counts[item].push(index);
        });

        const duplicates = [];
        for (const [value, indices] of Object.entries(counts)) {
            if (indices.length > 1) {
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                duplicates.push({
                    value,
                    days: indices.map(i => dayNames[i])
                });
            }
        }
        result.threeLetterDuplicates = duplicates;
        results.stillAmbiguous.push(result);
    }
}

console.log(`Locales ambiguous with 2-letter: ${twoLetterData.stillAmbiguous.length}`);
console.log(`Becomes distinct with 3-letter truncation: ${results.becomesDistinct.length} (${Math.round(results.becomesDistinct.length / twoLetterData.stillAmbiguous.length * 100)}%)`);
console.log(`Still ambiguous with 3-letter truncation: ${results.stillAmbiguous.length} (${Math.round(results.stillAmbiguous.length / twoLetterData.stillAmbiguous.length * 100)}%)`);

console.log('\n=== LENGTH STATISTICS FOR SHORT FORMAT ===');
console.log(`Overall range: ${lengthStats.min} to ${lengthStats.max} characters`);
console.log('\nPer locale:');
lengthStats.byLocale.forEach(stat => {
    console.log(`  ${stat.locale.padEnd(8)} min:${stat.min} max:${stat.max} avg:${stat.avg} [${stat.lengths.join(', ')}]`);
});

console.log('\n=== LOCALES THAT BECOME DISTINCT WITH 3-LETTER TRUNCATION ===\n');
results.becomesDistinct.forEach(locale => {
    console.log(`${locale.locale}:`);
    console.log(`  Short:      ${locale.short.join(', ')}`);
    console.log(`  2-letter:   ${locale.twoLetter.join(', ')}`);
    console.log(`  3-letter:   ${locale.threeLetter.join(', ')} ✓`);
    console.log(`  Lengths:    min:${locale.lengths.min} max:${locale.lengths.max} avg:${locale.lengths.avg}`);
    console.log('');
});

console.log('\n=== LOCALES STILL AMBIGUOUS WITH 3-LETTER TRUNCATION ===\n');
results.stillAmbiguous.forEach(locale => {
    console.log(`${locale.locale}:`);
    console.log(`  Short:      ${locale.short.join(', ')}`);
    console.log(`  2-letter:   ${locale.twoLetter.join(', ')}`);
    console.log(`  3-letter:   ${locale.threeLetter.join(', ')}`);
    console.log(`  Duplicates: ${locale.threeLetterDuplicates.map(d => `"${d.value}" → ${d.days.join(', ')}`).join('; ')}`);
    console.log(`  Lengths:    min:${locale.lengths.min} max:${locale.lengths.max} avg:${locale.lengths.avg}`);
    console.log('');
});

// Overall summary - calculate from actual data
const totalNarrowAmbiguous = twoLetterData.summary.totalAmbiguous;
const distinctWith2Letter = twoLetterData.summary.becomesDistinct;
const totalLocales = twoLetterData.summary.totalLocales;

// We need to also account for narrow distinct locales
// From the data: totalAmbiguous (492) + becomesDistinct (380) = 872? That's not right
// Let's use the values from two_letter_analysis directly
const narrowDistinct = totalLocales - totalNarrowAmbiguous;

console.log('\n=== COMPLETE SUMMARY ===');
console.log(`\nStarting with ${totalLocales} total locales:`);
console.log(`  Distinct with narrow format: ${narrowDistinct} (${Math.round(narrowDistinct / totalLocales * 100)}%)`);
console.log(`  Ambiguous with narrow: ${totalNarrowAmbiguous} (${Math.round(totalNarrowAmbiguous / totalLocales * 100)}%)`);

console.log(`\nOf the ${totalNarrowAmbiguous} ambiguous locales:`);
console.log(`  Distinct with 2-letter truncation: ${distinctWith2Letter} (${Math.round(distinctWith2Letter / totalNarrowAmbiguous * 100)}%)`);
console.log(`  Still ambiguous: ${twoLetterData.stillAmbiguous.length} (${Math.round(twoLetterData.stillAmbiguous.length / totalNarrowAmbiguous * 100)}%)`);

console.log(`\nOf the ${twoLetterData.stillAmbiguous.length} still ambiguous:`);
console.log(`  Distinct with 3-letter truncation: ${results.becomesDistinct.length} (${Math.round(results.becomesDistinct.length / twoLetterData.stillAmbiguous.length * 100)}%)`);
console.log(`  Still ambiguous: ${results.stillAmbiguous.length} (${Math.round(results.stillAmbiguous.length / twoLetterData.stillAmbiguous.length * 100)}%)`);

const totalDistinct2 = narrowDistinct + distinctWith2Letter;
const totalDistinct3 = totalDistinct2 + results.becomesDistinct.length;
const totalAmbiguous = totalLocales - totalDistinct3;

console.log(`\nFinal coverage:`);
console.log(`  Distinct (narrow OR 2-letter OR 3-letter): ${totalDistinct3} (${Math.round(totalDistinct3 / totalLocales * 100)}%)`);
console.log(`  Still ambiguous: ${totalAmbiguous} (${Math.round(totalAmbiguous / totalLocales * 100)}%)`);

// Save results
import { writeFileSync } from 'fs';
writeFileSync('./locale/three_letter_analysis.json', JSON.stringify({
    summary: {
        totalAmbiguousAfter2Letter: twoLetterData.stillAmbiguous.length,
        becomesDistinctWith3Letter: results.becomesDistinct.length,
        stillAmbiguousWith3Letter: results.stillAmbiguous.length,
        percentBecomesDistinct: Math.round(results.becomesDistinct.length / twoLetterData.stillAmbiguous.length * 100),
        overallCoverage: {
            totalLocales: totalLocales,
            distinctNarrow: narrowDistinct,
            distinct2Letter: distinctWith2Letter,
            distinct3Letter: results.becomesDistinct.length,
            totalDistinct: totalDistinct3,
            stillAmbiguous: totalAmbiguous,
            percentDistinct: Math.round(totalDistinct3 / totalLocales * 100)
        }
    },
    lengthStats,
    becomesDistinct: results.becomesDistinct.map(r => ({
        locale: r.locale,
        short: r.short,
        threeLetter: r.threeLetter,
        lengths: r.lengths
    })),
    stillAmbiguous: results.stillAmbiguous.map(r => ({
        locale: r.locale,
        short: r.short,
        threeLetter: r.threeLetter,
        duplicates: r.threeLetterDuplicates,
        lengths: r.lengths
    }))
}, null, 2));

console.log('\nResults saved to: ./locale/three_letter_analysis.json');
