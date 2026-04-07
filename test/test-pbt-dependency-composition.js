'use strict';

const assert = require('assert');
const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const PackageRegistry = require('../Utils/packageRegistry');

/**
 * Validates: Requirements 7.2, 11.1, 12.2, 15.1, 15.2, 15.3
 *
 * Property 8: Composição de dependências nos arquivos de projeto
 *
 * For any subset of packages selected, the pom.xml must contain exactly
 * the Maven dependencies declared by the selected packages (and none from
 * unselected). The package.json must contain exactly the npm deps of
 * selected packages. The pubspec.yaml must contain exactly the Dart deps
 * of selected packages.
 */
describe('PBT — Composição de dependências nos arquivos de projeto', function () {

    this.timeout(30000);

    const registry = new PackageRegistry();

    const allSlugs = [
        'auth', 'messaging', 'mcp', 'file-upload', 'audit',
        'dashboard', 'export', 'observability', 'i18n', 'themes'
    ];

    const packageSlugsArb = fc.subarray(allSlugs);

    const templatesDir = path.join(__dirname, '..', 'Utils', 'templates', 'base');
    const pomTemplate = fs.readFileSync(path.join(templatesDir, 'backend', 'pom.xml'), 'utf8');
    const pkgJsonTemplate = fs.readFileSync(path.join(templatesDir, 'frontend', 'package.json'), 'utf8');
    const pubspecTemplate = fs.readFileSync(path.join(templatesDir, 'mobile', 'pubspec.yaml'), 'utf8');

    it('pom.xml contains exactly the Maven deps of selected packages and none from unselected', function () {
        fc.assert(
            fc.property(packageSlugsArb, (selected) => {
                const resolved = registry.resolveDependencies(selected);
                const mavenDeps = registry.getMavenDeps(resolved);

                const rendered = ejs.render(pomTemplate, {
                    package: { lower: 'org.test', capital: 'Org.Test' },
                    project: { lower: 'test', capital: 'Test' },
                    packages: resolved,
                    mavenDeps: mavenDeps
                });

                // Every Maven dep from selected packages must appear in pom.xml
                for (const dep of mavenDeps) {
                    assert.ok(
                        rendered.includes(`<artifactId>${dep.artifactId}</artifactId>`),
                        `pom.xml should contain artifactId '${dep.artifactId}' from selected packages [${resolved}]`
                    );
                    assert.ok(
                        rendered.includes(`<groupId>${dep.groupId}</groupId>`),
                        `pom.xml should contain groupId '${dep.groupId}' from selected packages [${resolved}]`
                    );
                }

                // Maven deps from unselected packages must NOT appear in pom.xml
                const unselected = allSlugs.filter(s => !resolved.includes(s));
                const unselectedMavenDeps = registry.getMavenDeps(unselected);
                for (const dep of unselectedMavenDeps) {
                    // Only check if this artifactId is unique to unselected packages
                    const selectedArtifacts = mavenDeps.map(d => d.artifactId);
                    if (!selectedArtifacts.includes(dep.artifactId)) {
                        assert.ok(
                            !rendered.includes(`<artifactId>${dep.artifactId}</artifactId>`),
                            `pom.xml should NOT contain artifactId '${dep.artifactId}' from unselected packages [${unselected}]`
                        );
                    }
                }
            }),
            { numRuns: 100 }
        );
    });

    it('package.json contains exactly the npm deps of selected packages and none from unselected', function () {
        fc.assert(
            fc.property(packageSlugsArb, (selected) => {
                const resolved = registry.resolveDependencies(selected);
                const npmDeps = registry.getNpmDeps(resolved);

                const rendered = ejs.render(pkgJsonTemplate, {
                    project: { lower: 'test', capital: 'Test' },
                    packages: resolved,
                    npmDeps: npmDeps
                });

                // Parse the rendered package.json to inspect dependencies
                const parsed = JSON.parse(rendered);
                const renderedDeps = parsed.dependencies || {};

                // Every npm dep from selected packages must appear
                for (const [name, version] of Object.entries(npmDeps)) {
                    assert.ok(
                        renderedDeps[name] !== undefined,
                        `package.json should contain npm dep '${name}' from selected packages [${resolved}]`
                    );
                    assert.strictEqual(
                        renderedDeps[name],
                        version,
                        `package.json dep '${name}' should have version '${version}'`
                    );
                }

                // npm deps from unselected packages must NOT appear
                const unselected = allSlugs.filter(s => !resolved.includes(s));
                const unselectedNpmDeps = registry.getNpmDeps(unselected);
                for (const name of Object.keys(unselectedNpmDeps)) {
                    if (npmDeps[name] === undefined) {
                        assert.ok(
                            renderedDeps[name] === undefined,
                            `package.json should NOT contain npm dep '${name}' from unselected packages [${unselected}]`
                        );
                    }
                }
            }),
            { numRuns: 100 }
        );
    });

    it('pubspec.yaml contains exactly the Dart deps of selected packages and none from unselected', function () {
        fc.assert(
            fc.property(packageSlugsArb, (selected) => {
                const resolved = registry.resolveDependencies(selected);
                const dartDeps = registry.getDartDeps(resolved);

                const rendered = ejs.render(pubspecTemplate, {
                    project: { lower: 'test', capital: 'Test' },
                    packages: resolved,
                    dartDeps: dartDeps
                });

                // Every Dart dep from selected packages must appear
                for (const [name, version] of Object.entries(dartDeps)) {
                    assert.ok(
                        rendered.includes(name),
                        `pubspec.yaml should contain Dart dep '${name}' from selected packages [${resolved}]`
                    );
                    if (version === 'sdk') {
                        // SDK deps appear as "sdk: flutter"
                        assert.ok(
                            rendered.includes('sdk: flutter'),
                            `pubspec.yaml should contain 'sdk: flutter' for dep '${name}'`
                        );
                    } else {
                        assert.ok(
                            rendered.includes(version),
                            `pubspec.yaml should contain version '${version}' for dep '${name}'`
                        );
                    }
                }

                // Dart deps from unselected packages must NOT appear
                const unselected = allSlugs.filter(s => !resolved.includes(s));
                const unselectedDartDeps = registry.getDartDeps(unselected);
                for (const name of Object.keys(unselectedDartDeps)) {
                    if (dartDeps[name] === undefined) {
                        // Check the dep name doesn't appear in the dynamic section
                        // We need to be careful: the dep name should not appear
                        // outside of the base dependencies section
                        const lines = rendered.split('\n');
                        const depLine = lines.find(l => l.trim().startsWith(name + ':'));
                        // Only fail if the dep appears and it's not a base dep
                        const baseDeps = ['flutter', 'dio', 'flutter_riverpod', 'go_router',
                                          'flutter_test', 'flutter_lints'];
                        if (!baseDeps.includes(name)) {
                            assert.ok(
                                !depLine,
                                `pubspec.yaml should NOT contain Dart dep '${name}' from unselected packages [${unselected}]`
                            );
                        }
                    }
                }
            }),
            { numRuns: 100 }
        );
    });

});
