# generator-demoiselle [![NPM version][npm-image]](https://npmjs.org/package/generator-demoiselle) [![Join the chat at https://gitter.im/demoiselle](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/demoiselle?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Gerador para Demoiselle 4.1 — Jakarta EE + Vue.js 3 + Flutter

Gerador Yeoman para criação de projetos fullstack com backend Jakarta EE (Demoiselle 4.1), frontend Vue.js 3 e mobile Flutter. Gera scaffolding completo com CRUD, autenticação, dashboard, internacionalização e mais — tudo modular via pacotes opcionais.

## Versões

| Gerador | Stack | Backend | Frontend | Mobile |
|---------|-------|---------|----------|--------|
| 4.x.x | Demoiselle 4.1 | Jakarta EE 10, Java 17+, Hibernate 6 | Vue.js 3, Vite 5, Pinia | Flutter 3, Riverpod, go_router |
| 3.x.x | Demoiselle 3.0 | Java EE 7 | Angular 6 | — |
| 2.x.x | Demoiselle 2.x | Java EE 7 | Angular 5 | — |

## Requisitos

- Node.js 18+ e npm
- [Yeoman](https://yeoman.io/) (`npm install -g yo`)
- Backend: Java 17+, Maven 3.9+
- Frontend: Node.js (Vite via npx)
- Mobile: Flutter SDK 3.2+

## Instalação

```bash
npm install -g yo generator-demoiselle
```

## Uso

```bash
mkdir meu-projeto && cd meu-projeto
yo demoiselle
```

O gerador vai perguntar:

1. Nome do projeto
2. Package do backend (ex: `br.gov.exemplo`)
3. Prefixo dos componentes
4. Camadas a gerar: backend, frontend, mobile
5. **Pacotes opcionais** — selecione quais funcionalidades incluir
6. Instalar dependências automaticamente

### Via linha de comando

```bash
yo demoiselle meu-projeto br.gov.exemplo app \
  --packages=auth,dashboard,i18n,themes,export
```

A flag `--packages` aceita uma lista separada por vírgula e pula o prompt de seleção.

## Pacotes Opcionais

O gerador é modular. Selecione apenas o que precisa:

| Pacote | Descrição | Camadas |
|--------|-----------|---------|
| `auth` | Login JWT, registro com confirmação por email, recuperação de senha, RBAC | backend, frontend, mobile |
| `messaging` | Notificações in-app, email e push (FCM) | backend, frontend, mobile |
| `mcp` | Integração com Model Context Protocol (Demoiselle 4.1) | backend |
| `file-upload` | Upload/download de arquivos com metadados | backend, frontend, mobile |
| `audit` | Registro de auditoria com log de alterações | backend, frontend, mobile |
| `dashboard` | Dashboard com estatísticas das entidades | backend, frontend, mobile |
| `export` | Exportação de dados em CSV e PDF | backend, frontend, mobile |
| `observability` | Métricas, tracing, health checks e rate limiting | backend |
| `i18n` | Internacionalização pt-BR e en | frontend, mobile |
| `themes` | Temas claro e escuro com alternância dinâmica | frontend, mobile |

Dependências entre pacotes são resolvidas automaticamente. Por exemplo, selecionar `messaging` inclui `auth` automaticamente.

Quando nenhum pacote é selecionado, o projeto gerado contém apenas a estrutura base com CRUD.

## Estrutura Gerada

```
meu-projeto/
├── backend/                    # Jakarta EE 10 + Demoiselle 4.1
│   ├── pom.xml
│   └── src/main/java/...
├── frontend/                   # Vue.js 3 + Vite + Pinia
│   ├── package.json
│   └── src/...
└── mobile/                     # Flutter + Riverpod + go_router
    ├── pubspec.yaml
    └── lib/...
```

As dependências no `pom.xml`, `package.json` e `pubspec.yaml` são compostas dinamicamente — apenas as dependências dos pacotes selecionados são incluídas.

## Sub-geradores

### Adicionar CRUD

```bash
yo demoiselle:add
# ou diretamente:
yo demoiselle:add crud Produto
```

Gera entidade, DAO, BC, REST, tela de listagem e formulário. Os CRUDs respeitam os pacotes configurados no projeto:
- Com `audit`: entidade inclui `@EntityListeners(AuditEntityListener.class)`
- Com `export`: REST inclui endpoints `/export` (CSV) e `/export/pdf`
- Com `auth`: REST inclui `@RolesAllowed`
- Com `observability`: REST inclui `@Counted` e `@Traced`
- Com `mcp`: REST inclui `@McpTool` para exposição via MCP
- Com `i18n`: templates usam chaves de tradução em vez de textos fixos
- Com `dashboard`: card de estatísticas adicionado automaticamente

### Gerar a partir de entidades Java

```bash
yo demoiselle:fromEntity
```

Lê as classes de entidade existentes no backend e gera DAO, BC, REST, frontend e mobile correspondentes.

### Gerar a partir de Swagger/OpenAPI

```bash
yo demoiselle:fromSwagger
# ou com caminho específico:
yo demoiselle:fromSwagger ./api-spec.json
```

Gera CRUDs e services a partir de uma especificação Swagger 2.0 ou OpenAPI 3.0.

### Compatibilidade retroativa

Projetos criados antes do sistema de pacotes opcionais continuam funcionando. Os sub-geradores assumem todos os pacotes habilitados quando não encontram configuração de pacotes no `.yo-rc.json`.

## Executando o projeto

### Backend

```bash
cd backend
mvn clean package
# ou para desenvolvimento:
./run-dev.sh
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173/`

### Mobile

```bash
cd mobile
flutter pub get
flutter run
```

## Funcionalidades

- [x] `yo demoiselle` — gera novos projetos com pacotes opcionais
- [x] `yo demoiselle:add` — adiciona CRUDs respeitando pacotes configurados
- [x] `yo demoiselle:fromEntity` — gera a partir de entidades Java existentes
- [x] `yo demoiselle:fromSwagger` — gera a partir de especificação Swagger/OpenAPI
- [x] Resolução automática de dependências entre pacotes
- [x] Composição dinâmica de dependências (pom.xml, package.json, pubspec.yaml)
- [x] Templates EJS condicionais por pacote
- [x] Flag CLI `--packages` para automação

## Roadmap

Acompanhe pelos [milestones](https://github.com/demoiselle/generator-demoiselle/milestones) do projeto.

## License

LGPL3 © [SERPRO](http://demoiselle.io/)

[npm-image]: https://badge.fury.io/js/generator-demoiselle.svg
[npm-url]: https://npmjs.org/package/generator-demoiselle
