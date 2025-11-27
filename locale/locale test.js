const units = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];
//const styles = ['long', 'short', 'narrow', 'compact'];
//const notations = ['standard', 'scientific', 'engineering', 'compact'];

const unitsDisplay = ["long", "short", "narrow", "compact"];
const locales = ['en-US', 'en-GB', 'he-IL', 'de-DE', 'fr-FR', 'ja-JP', 'zh-CN', 'ar-SA', 'es-ES'];
// for (const locale of locales) {
//     for (const unit of units) {
//         for (const unitDisplay of unitsDisplay) {
//             const formatter = new Intl.RelativeTimeFormat(locale, { style: 'unit', unitDisplay, numeric: 'always' });
//             console.log(locale, unit, unitDisplay, formatter.format(2, unit));
//         }
//     }
// }

console.log(new Intl.RelativeTimeFormat('en-US', { style: 'unit', unitDisplay: 'short', numeric: 'always' }).format(2, 'year'));