'use strict';

/**
 * Parses a CLI --packages flag value into an array of package slugs.
 *
 * Takes a comma-separated string of package slugs (e.g., "auth,dashboard,i18n"),
 * splits by comma, trims whitespace from each slug, removes empty strings,
 * removes duplicates, and returns the resulting array.
 *
 * @param {string} flagValue - Comma-separated string of package slugs
 * @returns {string[]} Array of unique, trimmed, non-empty slugs
 */
function parsePackagesFlag(flagValue) {
    if (typeof flagValue !== 'string') {
        return [];
    }

    const parts = flagValue.split(',');
    const seen = new Set();
    const result = [];

    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.length > 0 && !seen.has(trimmed)) {
            seen.add(trimmed);
            result.push(trimmed);
        }
    }

    return result;
}

module.exports = parsePackagesFlag;
