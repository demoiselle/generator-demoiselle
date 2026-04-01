'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'backend', 'pom.xml');
const pomTemplate = fs.readFileSync(templatePath, 'utf-8');

/**
 * Arbitrary for project object with .lower and .capital properties
 */
const projectArb = fc.stringMatching(/^[a-z][a-z0-9]{1,15}$/).map(lower => ({
  lower,
  capital: lower.charAt(0).toUpperCase() + lower.slice(1)
}));

/**
 * Arbitrary for package object with .lower property (Java package name)
 */
const packageArb = fc.stringMatching(/^[a-z]{2,8}(\.[a-z]{2,8}){1,3}$/).map(lower => ({
  lower,
  capital: lower.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('.')
}));

/**
 * Renders the pom.xml EJS template with given project and package values
 */
function renderPom(project, pkg) {
  return ejs.render(pomTemplate, { project, package: pkg });
}

/**
 * **Validates: Requirements 1.1, 1.2, 1.4, 1.5**
 *
 * Property 1: Conformidade do pom.xml com Demoiselle 4
 *
 * For any valid project name and package name, the generated pom.xml must:
 * - Contain parent demoiselle-parent-rest version 4.x
 * - Contain Java 17+ compiler source/target
 * - Contain hibernate-core version 6.x
 * - NOT contain hibernate-entitymanager or hibernate-infinispan
 * - Contain microprofile-openapi-api (not io.swagger:swagger-jaxrs)
 * - NOT contain javaee-endorsed-api
 * - Contain jjwt-api, jbcrypt, jakarta.mail-api, opencsv, openpdf
 */
describe('Property 1: Conformidade do pom.xml com Demoiselle 4', () => {

  it('pom.xml gerado deve estar em conformidade com Demoiselle 4 para qualquer projeto e package válidos', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(projectArb, packageArb, (project, pkg) => {
        const pom = renderPom(project, pkg);

        // Req 1.1: Parent demoiselle-parent-rest version 4.x
        assert.ok(
          /demoiselle-parent-rest/.test(pom),
          'pom.xml deve conter demoiselle-parent-rest'
        );
        assert.ok(
          /<version>4\.\d+/.test(pom),
          'pom.xml deve conter parent versão 4.x'
        );

        // Req 1.2: Java 17+ compiler source/target
        assert.ok(
          /<source>17<\/source>/.test(pom),
          'pom.xml deve conter <source>17</source>'
        );
        assert.ok(
          /<target>17<\/target>/.test(pom),
          'pom.xml deve conter <target>17</target>'
        );

        // Req 1.4: Hibernate 6.x, no hibernate-entitymanager or hibernate-infinispan
        assert.ok(
          /hibernate-core/.test(pom),
          'pom.xml deve conter hibernate-core'
        );
        assert.ok(
          /<artifactId>hibernate-core<\/artifactId>\s*<version>6\.\d+/.test(pom),
          'pom.xml deve conter hibernate-core versão 6.x'
        );
        assert.ok(
          !/hibernate-entitymanager/.test(pom),
          'pom.xml NÃO deve conter hibernate-entitymanager'
        );
        assert.ok(
          !/hibernate-infinispan/.test(pom),
          'pom.xml NÃO deve conter hibernate-infinispan'
        );

        // Req 1.5: OpenAPI 3.0 via microprofile, not swagger-jaxrs
        assert.ok(
          /microprofile-openapi-api/.test(pom),
          'pom.xml deve conter microprofile-openapi-api'
        );
        assert.ok(
          !/io\.swagger.*swagger-jaxrs/.test(pom),
          'pom.xml NÃO deve conter io.swagger:swagger-jaxrs'
        );

        // No javaee-endorsed-api
        assert.ok(
          !/javaee-endorsed-api/.test(pom),
          'pom.xml NÃO deve conter javaee-endorsed-api'
        );

        // Additional dependencies required by design
        assert.ok(
          /jjwt-api/.test(pom),
          'pom.xml deve conter jjwt-api'
        );
        assert.ok(
          /jbcrypt/.test(pom),
          'pom.xml deve conter jbcrypt'
        );
        assert.ok(
          /jakarta\.mail-api/.test(pom),
          'pom.xml deve conter jakarta.mail-api'
        );
        assert.ok(
          /opencsv/.test(pom),
          'pom.xml deve conter opencsv'
        );
        assert.ok(
          /openpdf/.test(pom),
          'pom.xml deve conter openpdf'
        );

        // Verify project/package interpolation
        assert.ok(
          pom.includes(project.lower),
          'pom.xml deve conter o nome do projeto (lower)'
        );
        assert.ok(
          pom.includes(pkg.lower),
          'pom.xml deve conter o package (lower)'
        );
      }),
      { numRuns: 100 }
    );
  });
});
