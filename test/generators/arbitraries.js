'use strict';

const fc = require('fast-check');

// --- Java primitive types commonly used in entities ---
const JAVA_PRIMITIVE_TYPES = [
  'String', 'Integer', 'Long', 'Date', 'LocalDate', 'LocalDateTime',
  'Double', 'BigDecimal', 'boolean', 'Float', 'Short'
];

/**
 * Arbitrary for valid entity names.
 * Generates camelCase identifiers starting with a lowercase letter, 3-13 chars.
 */
const entityNameArb = fc.stringMatching(/^[a-z][a-zA-Z]{2,12}$/).filter(s => s.length >= 3);

/**
 * Arbitrary for valid Java package names.
 * Generates dot-separated lowercase identifiers like "org.demoiselle" or "com.example.app".
 */
const packageNameArb = fc.tuple(
  fc.constantFrom('org', 'com', 'br', 'net'),
  fc.stringMatching(/^[a-z]{2,8}$/).filter(s => s.length >= 2)
).map(([prefix, suffix]) => `${prefix}.${suffix}`);

/**
 * Arbitrary for valid project names.
 * Generates lowercase identifiers suitable for project/folder names.
 */
const projectNameArb = fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/).filter(s => s.length >= 2);

/**
 * Arbitrary for a single Java property (primitive type).
 * Generates properties with name, type, isReadOnly, isPrimitive flags.
 */
const javaPropertyArb = fc.record({
  name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && n.length >= 2),
  type: fc.constantFrom(...JAVA_PRIMITIVE_TYPES),
  isReadOnly: fc.boolean(),
  isPrimitive: fc.constant(true)
});

/**
 * Arbitrary for a non-primitive (relationship) Java property.
 */
const nonPrimitivePropertyArb = fc.record({
  name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && n.length >= 2),
  type: fc.stringMatching(/^[A-Z][a-zA-Z]{2,8}$/).filter(s => s.length >= 3),
  isReadOnly: fc.constant(false),
  isPrimitive: fc.constant(false)
});

/**
 * Arbitrary for any Java property (primitive or non-primitive).
 * Weighted 4:1 in favor of primitive types.
 */
const anyPropertyArb = fc.oneof(
  { weight: 4, arbitrary: javaPropertyArb },
  { weight: 1, arbitrary: nonPrimitivePropertyArb }
);

/**
 * Arbitrary for a complete entity with name and unique properties.
 * Generates an entity object with name (lower/capital) and 1-6 unique properties.
 */
const entityArb = fc.tuple(
  entityNameArb,
  fc.array(anyPropertyArb, { minLength: 1, maxLength: 6 })
    .map(props => {
      const seen = new Set();
      return props.filter(p => {
        if (seen.has(p.name)) return false;
        seen.add(p.name);
        return true;
      });
    })
    .filter(props => props.length >= 1)
).map(([name, properties]) => ({
  name: {
    lower: name.toLowerCase(),
    capital: name.charAt(0).toUpperCase() + name.slice(1)
  },
  properties,
  hasCustomEntity: properties.some(p => !p.isPrimitive)
}));

// --- Helper: capitalize ---
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  JAVA_PRIMITIVE_TYPES,
  entityNameArb,
  packageNameArb,
  projectNameArb,
  javaPropertyArb,
  nonPrimitivePropertyArb,
  anyPropertyArb,
  entityArb,
  capitalize
};
