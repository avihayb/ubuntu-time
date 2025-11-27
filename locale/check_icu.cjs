// check_icu.js
const number = 123456.789;

// Try formatting in Hindi (uses Devanagari script numerals)
const hindiFormat = new Intl.NumberFormat('hi-IN', {
    style: 'currency',
    currency: 'INR',
    useGrouping: true
}).format(number);

console.log(`Hindi (hi-IN) format: ${hindiFormat}`);

// Check if the output contains Hindi digits
const usesHindiDigits = /[\u0966-\u096F]/.test(hindiFormat);

if (usesHindiDigits) {
    console.log("✅ Success: Full ICU data is available.");
} else {
    console.log("❌ Warning: Only minimal (English) ICU data is available.");
    console.log("Run Node.js with full ICU data (see previous instructions) to get correct results for other locales.");
}
