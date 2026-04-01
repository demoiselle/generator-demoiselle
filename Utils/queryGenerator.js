'use strict';

/**
 * Utilitário responsável por analisar as propriedades de uma entidade
 * e gerar a lista de métodos de consulta que o template DAO deve incluir.
 */
module.exports = class QueryGeneratorUtil {

    /**
     * Verifica se o tipo é String
     * @param {string} type - tipo Java da propriedade
     * @returns {boolean}
     */
    isStringType(type) {
        return /^string$/i.test(type);
    }

    /**
     * Verifica se o tipo é Date ou numérico
     * @param {string} type - tipo Java da propriedade
     * @returns {boolean}
     */
    isDateOrNumberType(type) {
        return /^(date|localdate|localdatetime|integer|int|long|double|float|bigdecimal|number|short)$/i.test(type);
    }

    /**
     * Capitaliza a primeira letra de uma string
     * @param {string} str
     * @returns {string}
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Gera combinações de campos elegíveis para queries compostas.
     * Campos elegíveis: não-id e não-readOnly.
     * @param {Array} properties - propriedades da entidade
     * @param {number} maxSize - tamanho máximo da combinação (padrão 2)
     * @returns {Array} array de arrays com pares de propriedades
     */
    getCombinations(properties, maxSize) {
        if (maxSize === undefined || maxSize === null) {
            maxSize = 2;
        }
        const eligible = properties.filter(p => !p.isReadOnly && p.name !== 'id');
        const combos = [];
        if (maxSize >= 2) {
            for (let i = 0; i < eligible.length; i++) {
                for (let j = i + 1; j < eligible.length; j++) {
                    combos.push([eligible[i], eligible[j]]);
                }
            }
        }
        return combos;
    }

    /**
     * Retorna lista de query methods para uma entidade.
     * Para cada campo não-readOnly gera: findBy, findByIn, countBy, existsBy.
     * Para campos String, adiciona: findByLike.
     * Para campos Date/numérico, adiciona: findByBetween.
     * Para combinações de campos elegíveis (não-id, não-readOnly), gera: findByAnd.
     *
     * @param {Array} properties - propriedades da entidade
     * @returns {Array} queryMethods - lista de { methodName, returnType, params, queryType, jpqlFragment }
     */
    generateQueryMethods(properties) {
        const methods = [];
        const nonReadOnly = (properties || []).filter(p => !p.isReadOnly);

        nonReadOnly.forEach(prop => {
            const capName = this.capitalize(prop.name);

            // findBy<Campo> — busca exata
            methods.push({
                methodName: `findBy${capName}`,
                returnType: 'List',
                params: [{ name: 'value', type: prop.type }],
                queryType: 'exact',
                jpqlFragment: `e.${prop.name} = :value`
            });

            // findBy<Campo>In — busca IN
            methods.push({
                methodName: `findBy${capName}In`,
                returnType: 'List',
                params: [{ name: 'values', type: `List<${prop.type}>` }],
                queryType: 'in',
                jpqlFragment: `e.${prop.name} IN :values`
            });

            // countBy<Campo> — contagem
            methods.push({
                methodName: `countBy${capName}`,
                returnType: 'long',
                params: [{ name: 'value', type: prop.type }],
                queryType: 'count',
                jpqlFragment: `e.${prop.name} = :value`
            });

            // existsBy<Campo> — existência
            methods.push({
                methodName: `existsBy${capName}`,
                returnType: 'boolean',
                params: [{ name: 'value', type: prop.type }],
                queryType: 'exists',
                jpqlFragment: `e.${prop.name} = :value`
            });

            // findBy<Campo>Like — apenas para String
            if (this.isStringType(prop.type)) {
                methods.push({
                    methodName: `findBy${capName}Like`,
                    returnType: 'List',
                    params: [{ name: 'pattern', type: 'String' }],
                    queryType: 'like',
                    jpqlFragment: `e.${prop.name} LIKE :pattern`
                });
            }

            // findBy<Campo>Between — apenas para Date/Number
            if (this.isDateOrNumberType(prop.type)) {
                methods.push({
                    methodName: `findBy${capName}Between`,
                    returnType: 'List',
                    params: [
                        { name: 'min', type: prop.type },
                        { name: 'max', type: prop.type }
                    ],
                    queryType: 'between',
                    jpqlFragment: `e.${prop.name} BETWEEN :min AND :max`
                });
            }
        });

        // Combinações findBy<Campo1>And<Campo2>
        const combos = this.getCombinations(properties || [], 2);
        combos.forEach(([p1, p2]) => {
            const capName1 = this.capitalize(p1.name);
            const capName2 = this.capitalize(p2.name);
            methods.push({
                methodName: `findBy${capName1}And${capName2}`,
                returnType: 'List',
                params: [
                    { name: 'value1', type: p1.type },
                    { name: 'value2', type: p2.type }
                ],
                queryType: 'combined',
                jpqlFragment: `e.${p1.name} = :value1 AND e.${p2.name} = :value2`
            });
        });

        return methods;
    }
};
