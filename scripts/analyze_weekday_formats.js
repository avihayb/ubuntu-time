/**
 * Analyzes weekday abbreviations across all supported locales
 * to determine which locales have distinct narrow format weekdays.
 */

// Generate all possible locale codes
function generateLocaleCodes() {
    const codes = [];

    // Generate all possible 2-letter combinations (aa-zz)
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < letters.length; i++) {
        for (let j = 0; j < letters.length; j++) {
            codes.push(letters[i] + letters[j]);
        }
    }

    // Generate all possible 3-letter combinations (aaa-zzz)
    for (let i = 0; i < letters.length; i++) {
        for (let j = 0; j < letters.length; j++) {
            for (let k = 0; k < letters.length; k++) {
                codes.push(letters[i] + letters[j] + letters[k]);
            }
        }
    }

    // Common country codes for regional variants
    const countries = [
        "AF", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AR", "AM",
        "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE",
        "BZ", "BJ", "BM", "BT", "BO", "BA", "BW", "BV", "BR", "IO",
        "BN", "BG", "BF", "BI", "KH", "CM", "CA", "CV", "KY", "CF",
        "TD", "CL", "CN", "CX", "CC", "CO", "KM", "CG", "CD", "CK",
        "CR", "CI", "HR", "CU", "CY", "CZ", "DK", "DJ", "DM", "DO",
        "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO",
        "FJ", "FI", "FR", "GF", "PF", "TF", "GA", "GM", "GE", "DE",
        "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN",
        "GW", "GY", "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN",
        "ID", "IR", "IQ", "IE", "IL", "IT", "JM", "JP", "JE", "JO",
        "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB",
        "LS", "LR", "LY", "LI", "LT", "LU", "MO", "MK", "MG", "MW",
        "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX",
        "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA",
        "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "NF",
        "MP", "NO", "OM", "PK", "PW", "PA", "PG", "PY", "PE", "PH",
        "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "BL",
        "SH", "KN", "LC", "MF", "PM", "VC", "WS", "SM", "ST", "SA",
        "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO",
        "ZA", "GS", "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH",
        "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO", "TT",
        "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US",
        "UY", "UZ", "VU", "VA", "VE", "VN", "WF", "EH", "YE", "ZM",
        "ZW"
    ];

    // Add language-country combinations for 2-letter codes
    const twoLetterCodes = codes.filter(c => c.length === 2);
    for (const lang of twoLetterCodes) {
        for (const country of countries) {
            codes.push(`${lang}-${country}`);
        }
    }

    return codes;
}

function analyzeLocale(localeCode) {
    try {
        // Test if locale is supported by trying to create a DateTimeFormat
        const testFormat = new Intl.DateTimeFormat(localeCode);
        const resolvedOptions = testFormat.resolvedOptions();
        const resolvedLocale = resolvedOptions.locale;

        // Extract the language part from both requested and resolved locales
        const requestedLanguage = localeCode.split('-')[0];
        const resolvedLanguage = resolvedLocale.split('-')[0];
        const requestedCountry = localeCode.split('-')[1] ?? null;
        const resolvedCountry = resolvedLocale.split('-')[1] ?? null;

        // Only consider this locale valid if the requested language matches the resolved language
        if (requestedLanguage !== resolvedLanguage) {
            return {
                requested: localeCode,
                supported: false,
                reason: 'language_mismatch',
                requestedLanguage,
                resolvedLanguage
            };
        }

        // Get weekday abbreviations for all 7 days
        const days = [
            new Date('2025-12-07T10:00:00'), // Sunday
            new Date('2025-12-01T10:00:00'), // Monday
            new Date('2025-12-02T10:00:00'), // Tuesday
            new Date('2025-12-03T10:00:00'), // Wednesday
            new Date('2025-12-04T10:00:00'), // Thursday
            new Date('2025-12-05T10:00:00'), // Friday
            new Date('2025-12-06T10:00:00'), // Saturday
        ];

        const narrowFormat = new Intl.DateTimeFormat(localeCode, { weekday: 'narrow' });
        const shortFormat = new Intl.DateTimeFormat(localeCode, { weekday: 'short' });

        const narrow = days.map(d => narrowFormat.format(d));
        const short = days.map(d => shortFormat.format(d));

        // Check if all narrow abbreviations are distinct
        const narrowSet = new Set(narrow);
        const isNarrowDistinct = narrowSet.size === 7;

        // Check if all short abbreviations are distinct
        const shortSet = new Set(short);
        const isShortDistinct = shortSet.size === 7;

        return {
            requested: localeCode,
            resolved: resolvedLocale,
            language: resolvedLanguage,
            narrow,
            short,
                isNarrowDistinct,
                isShortDistinct,
                narrowDuplicates: isNarrowDistinct ? [] : findDuplicates(narrow),
                    supported: true
        };
    } catch (error) {
        return {
            requested: localeCode,
            supported: false,
            error: error.message
        };
    }
}

function findDuplicates(arr) {
    const counts = {};
    arr.forEach((item, index) => {
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
    return duplicates;
}

// Main execution
console.log('Generating locale codes...');
const localeCodes = generateLocaleCodes();
console.log(`Testing ${localeCodes.length} locale codes...\n`);

const results = {
    supported: [],
    unsupported: [],
    narrowDistinct: [],
    narrowAmbiguous: []
};

let processed = 0;
const uniqueResolvedLocales = new Set();

for (const code of localeCodes) {
    const result = analyzeLocale(code);
    processed++;

    if (result.supported) {
        // Only add if we haven't seen this resolved locale before
        if (!uniqueResolvedLocales.has(result.resolved)) {
            uniqueResolvedLocales.add(result.resolved);
            results.supported.push(result);

            if (result.isNarrowDistinct) {
                results.narrowDistinct.push(result);
            } else {
                results.narrowAmbiguous.push(result);
            }
        }
    } else {
        results.unsupported.push(result);
    }

    // Progress indicator
    if (processed % 1000 === 0) {
        console.log(`Processed ${processed}/${localeCodes.length}...`);
    }
}

console.log('\n=== ANALYSIS COMPLETE ===\n');
console.log(`Total locale codes tested: ${localeCodes.length}`);
console.log(`Unique supported locales: ${results.supported.length}`);
console.log(`Locales with DISTINCT narrow weekdays: ${results.narrowDistinct.length}`);
console.log(`Locales with AMBIGUOUS narrow weekdays: ${results.narrowAmbiguous.length}`);

console.log('\n=== LOCALES WITH AMBIGUOUS NARROW WEEKDAYS ===');
results.narrowAmbiguous.forEach(locale => {
    console.log(`\n${locale.resolved} (requested: ${locale.requested})`);
    console.log(`  Narrow: ${locale.narrow.join(', ')}`);
    console.log(`  Short:  ${locale.short.join(', ')}`);
    console.log(`  Duplicates:`);
    locale.narrowDuplicates.forEach(dup => {
        console.log(`    "${dup.value}" → ${dup.days.join(', ')}`);
    });
});

console.log('\n=== SAMPLE LOCALES WITH DISTINCT NARROW WEEKDAYS ===');
results.narrowDistinct.slice(0, 20).forEach(locale => {
    console.log(`${locale.resolved}: ${locale.narrow.join(', ')}`);
});

// Save results to JSON file
import { writeFileSync } from 'fs';
const outputPath = './locale/weekday_analysis.json';
writeFileSync(outputPath, JSON.stringify({
    summary: {
        totalTested: localeCodes.length,
        uniqueSupported: results.supported.length,
        narrowDistinct: results.narrowDistinct.length,
        narrowAmbiguous: results.narrowAmbiguous.length
    },
    narrowDistinct: results.narrowDistinct.map(r => ({
        locale: r.resolved,
        narrow: r.narrow,
        short: r.short
    })),
    narrowAmbiguous: results.narrowAmbiguous.map(r => ({
        locale: r.resolved,
        narrow: r.narrow,
        short: r.short,
        duplicates: r.narrowDuplicates
    }))
}, null, 2));

console.log(`\nResults saved to: ${outputPath}`);
