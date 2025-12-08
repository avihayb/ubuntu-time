/**
 * Analyzes which ambiguous narrow locales become distinct
 * when using first 2 letters of short format
 */

import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./locale/weekday_analysis.json', 'utf8'));

console.log('=== ANALYZING 2-LETTER TRUNCATION OF SHORT FORMAT ===\n');

const results = {
    becomesDistinct: [],
    stillAmbiguous: []
};

for (const locale of data.narrowAmbiguous) {
    // Get first 2 characters of each short weekday
    const twoLetter = locale.short.map(day => {
        // Handle grapheme clusters properly for multi-byte characters
        const chars = Array.from(day);
        return chars.slice(0, 2).join('');
    });

    // Check if all 2-letter abbreviations are distinct
    const twoLetterSet = new Set(twoLetter);
    const isDistinct = twoLetterSet.size === 7;

    const result = {
        locale: locale.locale,
        narrow: locale.narrow,
        short: locale.short,
        twoLetter,
        isDistinct,
        narrowDuplicates: locale.duplicates
    };

    if (isDistinct) {
        results.becomesDistinct.push(result);
    } else {
        // Find duplicates in 2-letter format
        const counts = {};
        twoLetter.forEach((item, index) => {
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
        result.twoLetterDuplicates = duplicates;
        results.stillAmbiguous.push(result);
    }
}

console.log(`Total ambiguous locales: ${data.narrowAmbiguous.length}`);
console.log(`Becomes distinct with 2-letter truncation: ${results.becomesDistinct.length} (${Math.round(results.becomesDistinct.length / data.narrowAmbiguous.length * 100)}%)`);
console.log(`Still ambiguous with 2-letter truncation: ${results.stillAmbiguous.length} (${Math.round(results.stillAmbiguous.length / data.narrowAmbiguous.length * 100)}%)`);

console.log('\n=== LOCALES THAT BECOME DISTINCT WITH 2-LETTER TRUNCATION ===\n');
results.becomesDistinct.forEach(locale => {
    console.log(`${locale.locale}:`);
    console.log(`  Narrow:    ${locale.narrow.join(', ')}`);
    console.log(`  Short:     ${locale.short.join(', ')}`);
    console.log(`  2-letter:  ${locale.twoLetter.join(', ')}`);
    console.log('');
});

console.log('\n=== LOCALES STILL AMBIGUOUS WITH 2-LETTER TRUNCATION ===\n');
results.stillAmbiguous.slice(0, 20).forEach(locale => {
    console.log(`${locale.locale}:`);
    console.log(`  Short:     ${locale.short.join(', ')}`);
    console.log(`  2-letter:  ${locale.twoLetter.join(', ')}`);
    console.log(`  Duplicates: ${locale.twoLetterDuplicates.map(d => `"${d.value}" → ${d.days.join(', ')}`).join('; ')}`);
    console.log('');
});

// Summary statistics
console.log('\n=== SUMMARY ===');
console.log(`\nOf ${data.narrowAmbiguous.length} locales with ambiguous narrow format:`);
console.log(`  ✓ ${results.becomesDistinct.length} (${Math.round(results.becomesDistinct.length / data.narrowAmbiguous.length * 100)}%) become distinct with 2-letter truncation`);
console.log(`  ✗ ${results.stillAmbiguous.length} (${Math.round(results.stillAmbiguous.length / data.narrowAmbiguous.length * 100)}%) remain ambiguous`);

console.log(`\nOverall locale coverage:`);
console.log(`  Distinct narrow: ${data.narrowDistinct.length} (${Math.round(data.narrowDistinct.length / data.summary.uniqueSupported * 100)}%)`);
console.log(`  Distinct with 2-letter: ${results.becomesDistinct.length} (${Math.round(results.becomesDistinct.length / data.summary.uniqueSupported * 100)}%)`);
console.log(`  Still ambiguous: ${results.stillAmbiguous.length} (${Math.round(results.stillAmbiguous.length / data.summary.uniqueSupported * 100)}%)`);
console.log(`  Total distinct (narrow OR 2-letter): ${data.narrowDistinct.length + results.becomesDistinct.length} (${Math.round((data.narrowDistinct.length + results.becomesDistinct.length) / data.summary.uniqueSupported * 100)}%)`);

// Save results
import { writeFileSync } from 'fs';
writeFileSync('./locale/two_letter_analysis.json', JSON.stringify({
    summary: {
        totalLocales: data.summary.uniqueSupported,
        totalAmbiguous: data.narrowAmbiguous.length,
        becomesDistinct: results.becomesDistinct.length,
        stillAmbiguous: results.stillAmbiguous.length,
        percentBecomesDistinct: Math.round(results.becomesDistinct.length / data.narrowAmbiguous.length * 100)
    },
    becomesDistinct: results.becomesDistinct.map(r => ({
        locale: r.locale,
        narrow: r.narrow,
        short: r.short,
        twoLetter: r.twoLetter
    })),
    stillAmbiguous: results.stillAmbiguous.map(r => ({
        locale: r.locale,
        short: r.short,
        twoLetter: r.twoLetter,
        duplicates: r.twoLetterDuplicates
    }))
}, null, 2));

console.log('\nResults saved to: ./locale/two_letter_analysis.json');
