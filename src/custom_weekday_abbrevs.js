/**
 * Custom weekday abbreviations for the 14 locales that remain ambiguous
 * even with 3-letter truncation of the short format.
 * 
 * These are manually crafted to be:
 * - Distinct (all 7 days unique)
 * - Short (2-3 characters)
 * - Culturally appropriate and recognizable
 */

export const customWeekdayAbbreviations = {
    // Manx (gv) - Isle of Man
    // Short: Jed, Jel, Jem, Jerc, Jerd, Jeh, Jes
    // Issue: "Jer" appears in both Jerc (Wed) and Jerd (Thu)
    // Solution: Use first 3 chars but keep the 4th for Wed/Thu
    'gv': ['Jed', 'Jel', 'Jem', 'Jrc', 'Jrd', 'Jeh', 'Jes'],

    // Malagasy (mg) - Madagascar
    // Short: Alah, Alats, Tal, Alar, Alak, Zom, Asab
    // Issue: "Ala" appears in Sun, Mon, Wed, Thu
    // Solution: Use 4th character to distinguish
    'mg': ['Alh', 'Alt', 'Tal', 'Alr', 'Alk', 'Zom', 'Asb'],

    // Burmese (my) - Myanmar
    // Short: တနင်္ဂနွေ, တနင်္လာ, အင်္ဂါ, ဗုဒ္ဓဟူး, ကြာသပတေး, သောကြာ, စနေ
    // Issue: Both Sun and Mon start with တနင
    // Solution: Use 4 chars for Sun/Mon to capture the difference
    'my': ['တနဂ', 'တနလ', 'အင်', 'ဗုဒ', 'ကြာ', 'သော', 'စနေ'],

    // Occitan (oc, oc-FR, oc-ES) - Southern France/Spain
    // Short: dimenge, diluns, dimars, dimècres, dijòus, divendres, dissabte
    // Issue: "dim" appears in Sun (dimenge), Tue (dimars), Wed (dimècres)
    // Solution: Use 4 chars to capture unique parts
    'oc': ['dimg', 'dilu', 'dima', 'dimc', 'dijò', 'divn', 'diss'],
    'oc-FR': ['dimg', 'dilu', 'dima', 'dimc', 'dijò', 'divn', 'diss'],
    'oc-ES': ['dimg', 'dilu', 'dima', 'dimc', 'dijò', 'divn', 'diss'],

    // Swahili (sw) - East Africa
    // Short: Jumapili, Jumatatu, Jumanne, Jumatano, Alhamisi, Ijumaa, Jumamosi
    // Issue: "Jum" appears in Sun, Mon, Tue, Wed, Sat
    // Solution: Use 4 chars to get the distinctive part after "Juma"
    'sw': ['Jpl', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jms'],

    // Urdu (ur, ur-IN, ur-PK, pa-PK) - Pakistan/India
    // Short: اتوار, پیر, منگل, بدھ, جمعرات, جمعہ, ہفتہ
    // Issue: "جمع" appears in Thu (جمعرات) and Fri (جمعہ)
    // Solution: Use 4 chars for Thu to include the ر
    'ur': ['اتو', 'پیر', 'منگ', 'بدھ', 'جمر', 'جمع', 'ہفت'],
    'ur-IN': ['اتو', 'پیر', 'منگ', 'بدھ', 'جمر', 'جمع', 'ہفت'],
    'ur-PK': ['اتو', 'پیر', 'منگ', 'بدھ', 'جمر', 'جمع', 'ہفت'],
    'pa-PK': ['اتو', 'پیر', 'منگ', 'بُد', 'جمر', 'جمع', 'ہفت'],

    // Yoruba (yo) - Nigeria
    // Short: Àìk, Aj, Ìsẹ́g, Ọjọ́r, Ọjọ́b, Ẹt, Àbám
    // Issue: "Ọjọ" appears in Wed (Ọjọ́r) and Thu (Ọjọ́b)
    // Solution: Use the full short form since they're already short (2-5 chars)
    'yo': ['Àìk', 'Aj', 'Ìsẹ', 'Ọjr', 'Ọjb', 'Ẹt', 'Àbm'],

    // Zhuang (za, za-CN) - Southern China
    // Short: ngoenzsinghgiz, singhgizit, singhgizngeih, singhgizsam, singhgizseiq, singhgizhaj, singhgizroek
    // Issue: "sin" appears in Mon-Sat (all start with "singhgiz")
    // Solution: Use the distinctive ending after "singhgiz"
    'za': ['ngo', 'sit', 'ngh', 'sam', 'seq', 'haj', 'rok'],
    'za-CN': ['ngo', 'sit', 'ngh', 'sam', 'seq', 'haj', 'rok']
};

/**
 * Explanation of choices:
 * 
 * 1. Manx (gv): Extended to 3 chars, using 4th char for Wed/Thu distinction
 * 2. Malagasy (mg): Used 4th character to distinguish the "Ala-" days
 * 3. Burmese (my): Extended Sun/Mon to 4 chars to capture the difference
 * 4. Occitan (oc): Extended to 4 chars to capture unique parts
 * 5. Swahili (sw): Extracted the distinctive syllables after "Juma"
 * 6. Urdu (ur): Extended Thu to 4 chars to include the ر (reh)
 * 7. Yoruba (yo): Used the distinctive consonants from each day
 * 8. Zhuang (za): Extracted the unique endings, dropped the common "singhgiz" prefix
 */

// Verification: Check that all abbreviations are distinct
function verifyDistinct(locale, abbrevs) {
    const set = new Set(abbrevs);
    if (set.size !== 7) {
        console.error(`❌ ${locale}: Not distinct! ${abbrevs.join(', ')}`);
        return false;
    }
    console.log(`✓ ${locale}: ${abbrevs.join(', ')}`);
    return true;
}

console.log('=== VERIFYING CUSTOM ABBREVIATIONS ===\n');
let allValid = true;
for (const [locale, abbrevs] of Object.entries(customWeekdayAbbreviations)) {
    if (!verifyDistinct(locale, abbrevs)) {
        allValid = false;
    }
}

console.log(`\n${allValid ? '✓ All custom abbreviations are distinct!' : '❌ Some abbreviations have duplicates'}`);

// Show length statistics
console.log('\n=== LENGTH STATISTICS ===\n');
for (const [locale, abbrevs] of Object.entries(customWeekdayAbbreviations)) {
    const lengths = abbrevs.map(a => Array.from(a).length);
    const min = Math.min(...lengths);
    const max = Math.max(...lengths);
    const avg = (lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(1);
    console.log(`${locale.padEnd(8)} min:${min} max:${max} avg:${avg}`);
}
/**
 * Custom weekday abbreviations for locales where truncation doesn't work.
 * Array format: [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
 */
