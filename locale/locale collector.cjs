const fs = require('fs');

const locales = [
    'en-US', 'en-GB', 'he-IL', 'de-DE', 'fr-FR', 'ja-JP', 'zh-CN', 'ar-SA', 'es-ES'
];

const referenceDate = new Date(2025, 10, 25, 13, 30, 45); // Nov 25, 2025, 1:30:45 PM

function generateLocaleFormats(localeList) {
    const formatData = {};

    localeList.forEach(locale => {
        // Request numeric date and time components
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false // Force 24-hour cycle for consistency in pattern detection
        };

        const parts = new Intl.DateTimeFormat(locale, options).formatToParts(referenceDate);

        // Filter out the literal separators and map to just the part types
        const partTypes = parts
            .filter(part => ['year', 'month', 'day', 'hour', 'minute', 'second'].includes(part.type))
            .map(part => part.type);

        formatData[locale] = partTypes;
    });

    return formatData;
}

const localeFormats = generateLocaleFormats(locales);

// Save the data to a JSON file
fs.writeFileSync('localeFormats.json', JSON.stringify(localeFormats, null, 2));

console.log('Generated localeFormats.json with the following data:');
console.log(localeFormats);
