'use strict';

const assert = require('assert');
const fc = require('fast-check');
const parsePackagesFlag = require('../Utils/parsePackagesFlag');

/**
 * Validates: Requirements 1.5
 *
 * Property 3: Parsing de flag CLI de pacotes
 *
 * For any string of package slugs separated by commas (e.g., "auth,dashboard,i18n"),
 * the CLI parser must produce an array containing exactly the listed slugs,
 * without duplicates and without whitespace.
 */
describe('PBT — Parsing de flag CLI de pacotes', function () {

    this.timeout(30000);

    const validSlugs = [
        'auth', 'messaging', 'mcp', 'file-upload', 'audit',
        'dashboard', 'export', 'observability', 'i18n', 'themes'
    ];

    /**
     * Arbitrary: generate a random non-empty subset of valid slugs,
     * optionally with duplicates and surrounding whitespace, joined by commas.
     */
    const slugSubsetArb = fc.subarray(validSlugs, { minLength: 1 });

    const whitespaceArb = fc.stringOf(
        fc.constantFrom(' ', '\t'),
        { minLength: 0, maxLength: 3 }
    );

    /**
     * Build a flag string from a subset of slugs, optionally injecting
     * duplicates and whitespace around each slug.
     */
    const flagInputArb = fc.tuple(slugSubsetArb, fc.boolean()).chain(([slugs, addDuplicates]) => {
        // Optionally duplicate some slugs
        const withDupsArb = addDuplicates
            ? fc.shuffledSubarray(slugs, { minLength: 0, maxLength: slugs.length }).map(dups => [...slugs, ...dups])
            : fc.constant(slugs);

        return withDupsArb.chain((allSlugs) => {
            // For each slug, wrap with optional whitespace
            return fc.tuple(
                ...allSlugs.map(() => fc.tuple(whitespaceArb, whitespaceArb))
            ).map((wsPairs) => {
                const parts = allSlugs.map((slug, i) => `${wsPairs[i][0]}${slug}${wsPairs[i][1]}`);
                return { expectedUnique: [...new Set(slugs)], flagString: parts.join(',') };
            });
        });
    });

    it('produces an array with exactly the unique slugs, no duplicates, no whitespace', function () {
        fc.assert(
            fc.property(flagInputArb, ({ expectedUnique, flagString }) => {
                const result = parsePackagesFlag(flagString);

                // 1. Result must contain no duplicates
                const resultSet = new Set(result);
                assert.strictEqual(
                    result.length,
                    resultSet.size,
                    `Result contains duplicates: [${result}]`
                );

                // 2. No element should have leading or trailing whitespace
                for (const slug of result) {
                    assert.strictEqual(
                        slug,
                        slug.trim(),
                        `Slug '${slug}' contains whitespace`
                    );
                }

                // 3. No empty strings in result
                for (const slug of result) {
                    assert.ok(
                        slug.length > 0,
                        'Result contains an empty string'
                    );
                }

                // 4. Result set must equal the expected unique slugs set
                const expectedSet = new Set(expectedUnique);
                assert.strictEqual(
                    resultSet.size,
                    expectedSet.size,
                    `Expected ${expectedSet.size} unique slugs but got ${resultSet.size}. Expected: [${[...expectedSet]}], Got: [${result}]`
                );
                for (const slug of expectedUnique) {
                    assert.ok(
                        resultSet.has(slug),
                        `Expected slug '${slug}' missing from result [${result}]`
                    );
                }
            }),
            { numRuns: 100 }
        );
    });

    it('returns empty array for empty string input', function () {
        const result = parsePackagesFlag('');
        assert.deepStrictEqual(result, []);
    });

    it('returns empty array for non-string input', function () {
        assert.deepStrictEqual(parsePackagesFlag(undefined), []);
        assert.deepStrictEqual(parsePackagesFlag(null), []);
        assert.deepStrictEqual(parsePackagesFlag(123), []);
    });
});
