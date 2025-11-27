
const locales = ['en-US', 'he-IL'];
const units = ['month', 'day', 'hour'];
const values = [2, 10];
const styles = ['short', 'narrow', 'long'];

console.log('Intl.DurationFormat available:', typeof Intl.DurationFormat !== 'undefined');

locales.forEach(locale => {
    console.log(`\n--- Locale: ${locale} ---`);
    styles.forEach(style => {
        console.log(`  Style: ${style}`);
        const rtf = new Intl.RelativeTimeFormat(locale, { style, numeric: 'always' });

        units.forEach(unit => {
            values.forEach(val => {
                const partsFuture = rtf.formatToParts(val, unit);
                const partsPast = rtf.formatToParts(-val, unit);

                console.log(`    Value: ${val} ${unit}`);
                console.log(`      Future: ${partsFuture.map(p => `[${p.type}:"${p.value}"]`).join('')}`);
                console.log(`      Past:   ${partsPast.map(p => `[${p.type}:"${p.value}"]`).join('')}`);
            });
        });
    });
});
