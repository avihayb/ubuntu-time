import { format } from './src/index.js';

console.log('=== TESTING ADAPTIVE WEEKDAY ABBREVIATIONS ===\n');

const testDate = new Date('2025-12-03T10:00:00'); // Wednesday

const testLocales = [
    // Narrow strategy (naturally distinct 1-char)
    { locale: 'es', expected: 'X', strategy: 'narrow' },  // Spanish
    { locale: 'he', expected: 'ד׳', strategy: 'narrow' },  // Hebrew
    { locale: 'ja', expected: '水', strategy: 'narrow' },  // Japanese
    { locale: 'ar', expected: 'ر', strategy: 'narrow' },  // Arabic

    // Trunc2 strategy (2-char truncation)
    { locale: 'en', expected: 'We', strategy: 'trunc2' },  // English
    { locale: 'de', expected: 'Mi', strategy: 'trunc2' },  // German
    { locale: 'fr', expected: 'me', strategy: 'trunc2' },  // French
    { locale: 'ru', expected: 'ср', strategy: 'trunc2' },  // Russian

    // Trunc3 strategy (3-char truncation)
    { locale: 'pt', expected: 'qua', strategy: 'trunc3' },  // Portuguese
    { locale: 'hu', expected: 'Sze', strategy: 'trunc3' },  // Hungarian

    // Custom strategy
    { locale: 'oc', expected: 'dimc', strategy: 'custom' },  // Occitan
    { locale: 'sw', expected: 'Jtn', strategy: 'custom' },  // Swahili
    { locale: 'ur', expected: 'بدھ', strategy: 'custom' },  // Urdu
];

let passed = 0;
let failed = 0;

for (const test of testLocales) {
    const result = format({ to: testDate, style: 'compact', locale: test.locale });
    const parts = result.text.match(/\(([^)]+)\)/);
    const weekday = parts ? parts[1] : '';

    const status = weekday === test.expected ? '✓' : '✗';
    if (weekday === test.expected) {
        passed++;
    } else {
        failed++;
    }

    console.log(`${status} ${test.locale.padEnd(6)} [${test.strategy.padEnd(7)}] expected: "${test.expected}" got: "${weekday}"`);
}

console.log(`\n=== RESULTS ===`);
console.log(`Passed: ${passed}/${testLocales.length}`);
console.log(`Failed: ${failed}/${testLocales.length}`);

if (failed === 0) {
    console.log('\n✓ All adaptive weekday tests passed!');
} else {
    console.log('\n✗ Some tests failed');
    process.exit(1);
}
