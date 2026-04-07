'use strict';

/**
 * Registro centralizado de pacotes de template opcionais.
 * Mantém metadados, dependências e listas de dependências por ecossistema
 * para cada pacote disponível no generator-demoiselle.
 *
 * @class PackageRegistry
 */
module.exports = class PackageRegistry {

    constructor() {
        /** @type {Map<string, object>} */
        this.packages = new Map();
        this._registerAll();
        this._validateNoCycles();
    }

    /**
     * Registra todos os pacotes disponíveis com metadados.
     * @private
     */
    _registerAll() {
        const defs = [
            {
                slug: 'auth',
                displayName: 'Autenticação',
                description: 'Login JWT, registro, recuperação de senha e RBAC',
                dependencies: [],
                layers: ['backend', 'frontend', 'mobile'],
                mavenDeps: [
                    { groupId: 'io.jsonwebtoken', artifactId: 'jjwt-api', version: '0.12.6' },
                    { groupId: 'io.jsonwebtoken', artifactId: 'jjwt-impl', version: '0.12.6' },
                    { groupId: 'io.jsonwebtoken', artifactId: 'jjwt-jackson', version: '0.12.6' },
                    { groupId: 'org.mindrot', artifactId: 'jbcrypt', version: '0.4' },
                    { groupId: 'com.sun.mail', artifactId: 'jakarta.mail-api', version: '2.0.1' }
                ],
                npmDeps: {},
                dartDeps: { 'flutter_secure_storage': '^9.0.0' }
            },
            {
                slug: 'messaging',
                displayName: 'Mensageria',
                description: 'Notificações in-app, email e push notifications',
                dependencies: ['auth'],
                layers: ['backend', 'frontend', 'mobile'],
                mavenDeps: [],
                npmDeps: {},
                dartDeps: { 'firebase_messaging': '^14.7.0', 'firebase_core': '^2.25.0' }
            },
            {
                slug: 'mcp',
                displayName: 'MCP',
                description: 'Integração com Model Context Protocol (Demoiselle 4.1)',
                dependencies: [],
                layers: ['backend'],
                mavenDeps: [
                    { groupId: 'org.demoiselle', artifactId: 'demoiselle-mcp', version: '4.1.0' }
                ],
                npmDeps: {},
                dartDeps: {}
            },
            {
                slug: 'file-upload',
                displayName: 'Upload de Arquivos',
                description: 'Endpoints e componentes de upload/download de arquivos',
                dependencies: [],
                layers: ['backend', 'frontend', 'mobile'],
                mavenDeps: [],
                npmDeps: {},
                dartDeps: { 'file_picker': '^6.1.1', 'image_picker': '^1.0.7' }
            },
            {
                slug: 'audit',
                displayName: 'Auditoria',
                description: 'Registro de auditoria com log de alterações',
                dependencies: [],
                layers: ['backend', 'frontend', 'mobile'],
                mavenDeps: [],
                npmDeps: {},
                dartDeps: {}
            },
            {
                slug: 'dashboard',
                displayName: 'Dashboard',
                description: 'Dashboard com estatísticas e métricas das entidades',
                dependencies: [],
                layers: ['backend', 'frontend', 'mobile'],
                mavenDeps: [],
                npmDeps: {},
                dartDeps: {}
            },
            {
                slug: 'export',
                displayName: 'Exportação',
                description: 'Exportação de dados em CSV e PDF',
                dependencies: [],
                layers: ['backend', 'frontend', 'mobile'],
                mavenDeps: [
                    { groupId: 'com.opencsv', artifactId: 'opencsv', version: '5.9' },
                    { groupId: 'com.github.librepdf', artifactId: 'openpdf', version: '1.3.35' }
                ],
                npmDeps: {},
                dartDeps: { 'share_plus': '^7.2.1' }
            },
            {
                slug: 'observability',
                displayName: 'Observabilidade',
                description: 'Métricas, tracing, health checks e rate limiting',
                dependencies: [],
                layers: ['backend'],
                mavenDeps: [
                    { groupId: 'org.demoiselle', artifactId: 'demoiselle-observability', version: '4.1.0' },
                    { groupId: 'org.eclipse.microprofile.metrics', artifactId: 'microprofile-metrics-api', version: '4.0' }
                ],
                npmDeps: {},
                dartDeps: {}
            },
            {
                slug: 'i18n',
                displayName: 'Internacionalização',
                description: 'Suporte a múltiplos idiomas (pt-BR e en)',
                dependencies: [],
                layers: ['frontend', 'mobile'],
                mavenDeps: [],
                npmDeps: { 'vue-i18n': '^9.9.0' },
                dartDeps: { 'flutter_localizations': 'sdk', 'intl': '^0.18.1' }
            },
            {
                slug: 'themes',
                displayName: 'Temas',
                description: 'Suporte a temas claro e escuro com alternância dinâmica',
                dependencies: [],
                layers: ['frontend', 'mobile'],
                mavenDeps: [],
                npmDeps: {},
                dartDeps: { 'shared_preferences': '^2.2.2' }
            }
        ];

        for (const def of defs) {
            this.packages.set(def.slug, def);
        }
    }

    /**
     * Valida que não existem dependências circulares no registro.
     * Usa DFS com coloração (white/gray/black) para detecção de ciclos.
     * Lança erro descritivo se um ciclo for detectado.
     * @private
     */
    _validateNoCycles() {
        const WHITE = 0, GRAY = 1, BLACK = 2;
        const color = new Map();

        for (const slug of this.packages.keys()) {
            color.set(slug, WHITE);
        }

        const dfs = (slug, path) => {
            color.set(slug, GRAY);
            path.push(slug);

            const pkg = this.packages.get(slug);
            if (pkg && pkg.dependencies) {
                for (const dep of pkg.dependencies) {
                    if (color.get(dep) === GRAY) {
                        const cycleStart = path.indexOf(dep);
                        const cycle = path.slice(cycleStart).concat(dep);
                        throw new Error(
                            'Dependência circular detectada: ' + cycle.join(' → ')
                        );
                    }
                    if (color.get(dep) === WHITE) {
                        dfs(dep, path);
                    }
                }
            }

            path.pop();
            color.set(slug, BLACK);
        };

        for (const slug of this.packages.keys()) {
            if (color.get(slug) === WHITE) {
                dfs(slug, []);
            }
        }
    }

    /**
     * Retorna a lista de todos os pacotes disponíveis com metadados.
     * @returns {Array<object>} Array de PackageInfo
     */
    getAvailablePackages() {
        return Array.from(this.packages.values());
    }

    /**
     * Recebe lista de slugs selecionados e retorna lista completa
     * incluindo todas as dependências transitivas resolvidas.
     * @param {string[]} selected - slugs selecionados pelo usuário
     * @returns {string[]} - slugs completos com dependências
     */
    resolveDependencies(selected) {
        const resolved = new Set();

        const resolve = (slug) => {
            if (resolved.has(slug)) return;
            const pkg = this.packages.get(slug);
            if (!pkg) return;
            // Resolve dependencies first (transitive)
            for (const dep of pkg.dependencies) {
                resolve(dep);
            }
            resolved.add(slug);
        };

        for (const slug of selected) {
            resolve(slug);
        }

        return Array.from(resolved);
    }

    /**
     * Valida se uma lista de pacotes é consistente (todas as dependências satisfeitas).
     * @param {string[]} selected - slugs selecionados
     * @returns {{ valid: boolean, errors: string[] }}
     */
    validate(selected) {
        const errors = [];
        const selectedSet = new Set(selected);

        for (const slug of selected) {
            const pkg = this.packages.get(slug);
            if (!pkg) {
                errors.push(`Pacote desconhecido: '${slug}'`);
                continue;
            }
            for (const dep of pkg.dependencies) {
                if (!selectedSet.has(dep)) {
                    errors.push(
                        `Pacote '${slug}' requer '${dep}' que não está selecionado`
                    );
                }
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Retorna as dependências Maven para os pacotes selecionados.
     * @param {string[]} packages - slugs dos pacotes
     * @returns {Array<{groupId: string, artifactId: string, version: string}>}
     */
    getMavenDeps(packages) {
        const deps = [];
        for (const slug of packages) {
            const pkg = this.packages.get(slug);
            if (pkg && pkg.mavenDeps) {
                deps.push(...pkg.mavenDeps);
            }
        }
        return deps;
    }

    /**
     * Retorna as dependências npm para os pacotes selecionados.
     * @param {string[]} packages - slugs dos pacotes
     * @returns {Object} - { depName: version }
     */
    getNpmDeps(packages) {
        const deps = {};
        for (const slug of packages) {
            const pkg = this.packages.get(slug);
            if (pkg && pkg.npmDeps) {
                Object.assign(deps, pkg.npmDeps);
            }
        }
        return deps;
    }

    /**
     * Retorna as dependências Dart para os pacotes selecionados.
     * @param {string[]} packages - slugs dos pacotes
     * @returns {Object} - { depName: version }
     */
    getDartDeps(packages) {
        const deps = {};
        for (const slug of packages) {
            const pkg = this.packages.get(slug);
            if (pkg && pkg.dartDeps) {
                Object.assign(deps, pkg.dartDeps);
            }
        }
        return deps;
    }
};
