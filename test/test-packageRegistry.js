'use strict';

const assert = require('assert');
const PackageRegistry = require('../Utils/packageRegistry');

describe('PackageRegistry', function () {

    let registry;

    beforeEach(function () {
        registry = new PackageRegistry();
    });

    describe('constructor and _registerAll', function () {
        it('should register exactly 10 packages', function () {
            assert.strictEqual(registry.packages.size, 10);
        });

        it('should register all expected slugs', function () {
            const expected = ['auth', 'messaging', 'mcp', 'file-upload', 'audit',
                'dashboard', 'export', 'observability', 'i18n', 'themes'];
            for (const slug of expected) {
                assert.ok(registry.packages.has(slug), `Missing package: ${slug}`);
            }
        });
    });

    describe('_validateNoCycles', function () {
        it('should not throw for the default registry (no cycles)', function () {
            assert.doesNotThrow(() => new PackageRegistry());
        });

        it('should throw on circular dependency', function () {
            const reg = new PackageRegistry();
            reg.packages.set('a', { slug: 'a', dependencies: ['b'], layers: ['backend'] });
            reg.packages.set('b', { slug: 'b', dependencies: ['a'], layers: ['backend'] });
            assert.throws(() => reg._validateNoCycles(), /circular/i);
        });
    });

    describe('getAvailablePackages', function () {
        it('should return an array of 10 packages', function () {
            const pkgs = registry.getAvailablePackages();
            assert.strictEqual(pkgs.length, 10);
        });

        it('each package should have required fields', function () {
            for (const pkg of registry.getAvailablePackages()) {
                assert.ok(pkg.slug, 'slug missing');
                assert.ok(pkg.displayName, 'displayName missing');
                assert.ok(pkg.description, 'description missing');
                assert.ok(Array.isArray(pkg.dependencies), 'dependencies not array');
                assert.ok(Array.isArray(pkg.layers) && pkg.layers.length > 0, 'layers empty');
                assert.ok(Array.isArray(pkg.mavenDeps), 'mavenDeps not array');
                assert.ok(typeof pkg.npmDeps === 'object', 'npmDeps not object');
                assert.ok(typeof pkg.dartDeps === 'object', 'dartDeps not object');
            }
        });
    });

    describe('resolveDependencies', function () {
        it('should return empty array for empty input', function () {
            assert.deepStrictEqual(registry.resolveDependencies([]), []);
        });

        it('should return the same package when it has no deps', function () {
            const result = registry.resolveDependencies(['auth']);
            assert.deepStrictEqual(result, ['auth']);
        });

        it('should resolve transitive dependency (messaging → auth)', function () {
            const result = registry.resolveDependencies(['messaging']);
            assert.ok(result.includes('auth'), 'auth should be included');
            assert.ok(result.includes('messaging'), 'messaging should be included');
            assert.ok(result.indexOf('auth') < result.indexOf('messaging'), 'auth before messaging');
        });

        it('should not duplicate when both selected explicitly', function () {
            const result = registry.resolveDependencies(['auth', 'messaging']);
            const authCount = result.filter(s => s === 'auth').length;
            assert.strictEqual(authCount, 1);
        });

        it('should ignore unknown slugs', function () {
            const result = registry.resolveDependencies(['unknown']);
            assert.deepStrictEqual(result, []);
        });
    });

    describe('validate', function () {
        it('should return valid for empty selection', function () {
            const result = registry.validate([]);
            assert.strictEqual(result.valid, true);
            assert.strictEqual(result.errors.length, 0);
        });

        it('should return valid when all deps satisfied', function () {
            const result = registry.validate(['auth', 'messaging']);
            assert.strictEqual(result.valid, true);
        });

        it('should return invalid when dependency missing', function () {
            const result = registry.validate(['messaging']);
            assert.strictEqual(result.valid, false);
            assert.ok(result.errors.length > 0);
            assert.ok(result.errors[0].includes('auth'));
        });

        it('should return invalid for unknown package', function () {
            const result = registry.validate(['nonexistent']);
            assert.strictEqual(result.valid, false);
            assert.ok(result.errors[0].includes('desconhecido'));
        });
    });

    describe('getMavenDeps', function () {
        it('should return empty for packages with no maven deps', function () {
            assert.deepStrictEqual(registry.getMavenDeps(['audit']), []);
        });

        it('should return correct deps for auth', function () {
            const deps = registry.getMavenDeps(['auth']);
            const artifacts = deps.map(d => d.artifactId);
            assert.ok(artifacts.includes('jjwt-api'));
            assert.ok(artifacts.includes('jbcrypt'));
        });

        it('should merge deps from multiple packages', function () {
            const deps = registry.getMavenDeps(['auth', 'export']);
            const artifacts = deps.map(d => d.artifactId);
            assert.ok(artifacts.includes('jjwt-api'));
            assert.ok(artifacts.includes('opencsv'));
        });
    });

    describe('getNpmDeps', function () {
        it('should return empty for packages with no npm deps', function () {
            assert.deepStrictEqual(registry.getNpmDeps(['auth']), {});
        });

        it('should return vue-i18n for i18n package', function () {
            const deps = registry.getNpmDeps(['i18n']);
            assert.ok(deps['vue-i18n']);
        });
    });

    describe('getDartDeps', function () {
        it('should return empty for packages with no dart deps', function () {
            assert.deepStrictEqual(registry.getDartDeps(['mcp']), {});
        });

        it('should return correct deps for messaging', function () {
            const deps = registry.getDartDeps(['messaging']);
            assert.ok(deps['firebase_messaging']);
            assert.ok(deps['firebase_core']);
        });

        it('should merge deps from multiple packages', function () {
            const deps = registry.getDartDeps(['messaging', 'themes']);
            assert.ok(deps['firebase_messaging']);
            assert.ok(deps['shared_preferences']);
        });
    });
});
