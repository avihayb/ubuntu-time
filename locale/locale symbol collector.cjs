const fs = require('fs');

const locales = ['en-US', 'en-GB', 'he-IL', 'de-DE', 'ja-JP'];
const units = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];
const styles = ['long', 'short', 'narrow'];

function generateUnitSymbols(localeList, unitsList, stylesList) {
    const unitDatabase = {};

    localeList.forEach(locale => {
        unitDatabase[locale] = {};

        unitsList.forEach(unit => {
            unitDatabase[locale][unit] = {};

            stylesList.forEach(style => {
                // The style option goes in the constructor
                const formatter = new Intl.RelativeTimeFormat(locale, {
                    style: style,
                    numeric: 'always' // Forces number display
                });

                // Format 1 unit (singular form) and get the parts
                const parts = formatter.formatToParts(1, unit);

                // Find the part which is the actual unit symbol/word
                const unitPart = parts.find(p => p.type === 'unit');

                if (unitPart) {
                    unitDatabase[locale][unit][style] = unitPart.value;
                } else {
                    // Fallback or handle cases where a specific style might not exist
                    unitDatabase[locale][unit][style] = "N/A";
                }
            });
        });
    });

    return unitDatabase;
}

const localizedSymbols = generateUnitSymbols(locales, units, styles);

// Save the data to a JSON file
fs.writeFileSync('localizedUnitSymbols.json', JSON.stringify(localizedSymbols, null, 2));

console.log('Generated localizedUnitSymbols.json');
// console.log(localizedSymbols); 
