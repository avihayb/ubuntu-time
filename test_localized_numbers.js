// Test localized numbers
import { ut } from './src/index.js';

const testDate = new Date('2025-12-30T12:00:00Z');
const now = new Date('2025-12-29T12:00:00Z');

console.log('=== Testing Localized Numbers ===\n');

// English (Western Arabic numerals: 0-9)
console.log('en-US:', ut.format({ to: testDate, from: now, locale: 'en-US' }).text);

// Arabic (Eastern Arabic numerals: ٠-٩)
console.log('ar-EG:', ut.format({ to: testDate, from: now, locale: 'ar-EG' }).text);

// Persian/Farsi (Persian numerals: ۰-۹)
console.log('fa-IR:', ut.format({ to: testDate, from: now, locale: 'fa-IR' }).text);

// Hindi (Devanagari numerals: ०-९)
console.log('hi-IN:', ut.format({ to: testDate, from: now, locale: 'hi-IN' }).text);

// Bengali (Bengali numerals: ০-৯)
console.log('bn-BD:', ut.format({ to: testDate, from: now, locale: 'bn-BD' }).text);

console.log('\n✓ Numbers are now localized!');
