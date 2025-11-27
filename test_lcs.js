
function getLCS(s1, s2) {
    const l1 = s1.length;
    const l2 = s2.length;
    const dp = Array(l1 + 1).fill(0).map(() => Array(l2 + 1).fill(0));
    let maxLen = 0;
    let endIndex = 0;

    for (let i = 1; i <= l1; i++) {
        for (let j = 1; j <= l2; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                if (dp[i][j] > maxLen) {
                    maxLen = dp[i][j];
                    endIndex = i;
                }
            }
        }
    }
    return s1.substring(endIndex - maxLen, endIndex);
}

const locales = ['en-US', 'he-IL', 'es-ES', 'ja-JP'];
const units = ['month', 'day', 'hour'];
const values = [1, 2, 10];
const styles = ['short', 'narrow', 'long'];

locales.forEach(locale => {
    console.log(`\n--- Locale: ${locale} ---`);
    styles.forEach(style => {
        const rtf = new Intl.RelativeTimeFormat(locale, { style, numeric: 'always' });
        units.forEach(unit => {
            values.forEach(val => {
                const s1 = rtf.format(val, unit);
                const s2 = rtf.format(-val, unit);
                const lcs = getLCS(s1, s2).trim();
                console.log(`  ${val} ${unit} (${style}): "${s1}" / "${s2}" -> LCS: "${lcs}"`);
            });
        });
    });
});
