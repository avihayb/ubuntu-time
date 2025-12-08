/**
 * Generates the weekday abbreviation strategy database from analysis results
 */

import { readFileSync, writeFileSync } from 'fs';

// Load analysis data
const weekdayAnalysis = JSON.parse(readFileSync('./locale/weekday_analysis.json', 'utf8'));
const twoLetterAnalysis = JSON.parse(readFileSync('./locale/two_letter_analysis.json', 'utf8'));
const threeLetterAnalysis = JSON.parse(readFileSync('./locale/three_letter_analysis.json', 'utf8'));

// Custom abbreviations for the 14 remaining ambiguous locales
const customAbbreviations = {
    'gv': ['Jed', 'Jel', 'Jem', 'Jrc', 'Jrd', 'Jeh', 'Jes'],
    'mg': ['Alh', 'Alt', 'Tal', 'Alr', 'Alk', 'Zom', 'Asb'],
    'my': ['တနဂ', 'တနလ', 'အင်', 'ဗုဒ', 'ကြာ', 'သော', 'စနေ'],
    'oc': ['dimg', 'dilu', 'dima', 'dimc', 'dijò', 'divn', 'diss'],
    'oc-FR': ['dimg', 'dilu', 'dima', 'dimc', 'dijò', 'divn', 'diss'],
    'oc-ES': ['dimg', 'dilu', 'dima', 'dimc', 'dijò', 'divn', 'diss'],
    'sw': ['Jpl', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jms'],
    'ur': ['اتو', 'پیر', 'منگ', 'بدھ', 'جمر', 'جمع', 'ہفت'],
    'ur-IN': ['اتو', 'پیر', 'منگ', 'بدھ', 'جمر', 'جمع', 'ہفت'],
    'ur-PK': ['اتو', 'پیر', 'منگ', 'بدھ', 'جمر', 'جمع', 'ہفت'],
    'pa-PK': ['اتو', 'پیر', 'منگ', 'بُد', 'جمر', 'جمع', 'ہفت'],
    'yo': ['Àìk', 'Aj', 'Ìsẹ', 'Ọjr', 'Ọjb', 'Ẹt', 'Àbm'],
    'za': ['ngo', 'sit', 'ngh', 'sam', 'seq', 'haj', 'rok'],
    'za-CN': ['ngo', 'sit', 'ngh', 'sam', 'seq', 'haj', 'rok']
};

// Strategy enum values
const NARROW = 0;
const TRUNC2 = 1;
const TRUNC3 = 2;
const CUSTOM = 3;

// Build the strategy database
const weekdayStrategy = {};

// 1. Add locales with distinct narrow format
for (const locale of weekdayAnalysis.narrowDistinct) {
    weekdayStrategy[locale.locale] = NARROW;
}

// 2. Add locales that become distinct with 2-letter truncation
for (const locale of twoLetterAnalysis.becomesDistinct) {
    weekdayStrategy[locale.locale] = TRUNC2;
}

// 3. Add locales that become distinct with 3-letter truncation
for (const locale of threeLetterAnalysis.becomesDistinct) {
    weekdayStrategy[locale.locale] = TRUNC3;
}

// 4. Add locales with custom abbreviations
for (const locale in customAbbreviations) {
    weekdayStrategy[locale] = CUSTOM;
}

// Generate statistics
const stats = {
    narrow: 0,
    trunc2: 0,
    trunc3: 0,
    custom: 0
};

for (const strategy of Object.values(weekdayStrategy)) {
    switch (strategy) {
        case NARROW: stats.narrow++; break;
        case TRUNC2: stats.trunc2++; break;
        case TRUNC3: stats.trunc3++; break;
        case CUSTOM: stats.custom++; break;
    }
}

console.log('=== WEEKDAY STRATEGY DATABASE ===');
console.log(`Total locales: ${Object.keys(weekdayStrategy).length}`);
console.log(`  narrow:  ${stats.narrow} (${Math.round(stats.narrow / Object.keys(weekdayStrategy).length * 100)}%)`);
console.log(`  trunc2:  ${stats.trunc2} (${Math.round(stats.trunc2 / Object.keys(weekdayStrategy).length * 100)}%)`);
console.log(`  trunc3:  ${stats.trunc3} (${Math.round(stats.trunc3 / Object.keys(weekdayStrategy).length * 100)}%)`);
console.log(`  custom:  ${stats.custom} (${Math.round(stats.custom / Object.keys(weekdayStrategy).length * 100)}%)`);

// Generate the JavaScript code for weekdayStrategy.js
// First, stringify with numeric values
let strategyJson = JSON.stringify(weekdayStrategy, null, 4);

// Replace numeric values with short variable names
strategyJson = strategyJson.replace(/: 0/g, ': n');
strategyJson = strategyJson.replace(/: 1/g, ': t2');
strategyJson = strategyJson.replace(/: 2/g, ': t3');
strategyJson = strategyJson.replace(/: 3/g, ': c');

const code = `
/**
 * Weekday abbreviation strategy symbols.
 * Using symbols for type safety and unambiguous values.
 */
export const NARROW = Symbol('narrow');
export const TRUNC2 = Symbol('trunc2');
export const TRUNC3 = Symbol('trunc3');
export const CUSTOM = Symbol('custom');

// Short aliases for compact object notation
const n = NARROW;
const t2 = TRUNC2;
const t3 = TRUNC3;
const c = CUSTOM;

/**
 * Weekday abbreviation strategy for each locale.
 * Values:
 * - n (NARROW): Use Intl narrow format (1 char, naturally distinct)
 * - t2 (TRUNC2): Truncate short format to 2 chars
 * - t3 (TRUNC3): Truncate short format to 3 chars
 * - c (CUSTOM): Use custom abbreviations from custom_weekday_abbrevs
 */
export const weekdayStrategy = ${strategyJson};
`;

// Write to weekdayStrategy.js
writeFileSync('./src/weekdayStrategy.js', code, 'utf8');
console.log('\n✓ Updated src/weekdayStrategy.js');

// Also save the raw data for reference
writeFileSync('./locale/weekday_strategy.json', JSON.stringify({
    summary: {
        totalLocales: Object.keys(weekdayStrategy).length,
        ...stats
    },
    strategy: weekdayStrategy,
    customAbbreviations
}, null, 2));
console.log('✓ Saved locale/weekday_strategy.json');
