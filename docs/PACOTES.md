# Pacotes Opcionais — Guia Completo

O `generator-demoiselle` utiliza um sistema de pacotes opcionais que permite gerar apenas as funcionalidades necessárias para o seu projeto. Este documento detalha cada pacote, os arquivos gerados, as dependências adicionadas e exemplos de uso.

## Visão Geral

Durante a execução do `yo demoiselle`, uma etapa de seleção permite escolher quais pacotes incluir. Cada pacote gera código nas camadas que suporta (backend, frontend, mobile) e adiciona apenas as dependências necessárias.

```
? Selecione os pacotes de funcionalidades:
 ◉ Autenticação — Login JWT, registro, recuperação de senha e RBAC
 ◯ Mensageria — Notificações in-app, email e push notifications
 ◯ MCP — Integração com Model Context Protocol (Demoiselle 4.1)
 ◯ Upload de Arquivos — Endpoints e componentes de upload/download de arquivos
 ◉ Auditoria — Registro de auditoria com log de alterações
 ◉ Dashboard — Dashboard com estatísticas e métricas das entidades
 ◉ Exportação — Exportação de dados em CSV e PDF
 ◯ Observabilidade — Métricas, tracing, health checks e rate limiting
 ◉ Internacionalização — Suporte a múltiplos idiomas (pt-BR e en)
 ◉ Temas — Suporte a temas claro e escuro com alternância dinâmica
```

### Seleção via CLI

```bash
yo demoiselle meu-projeto br.gov.exemplo app --packages=auth,dashboard,i18n,themes
```

### Dependências entre pacotes

O pacote `messaging` depende de `auth`. Ao selecionar `messaging`, o `auth` é incluído automaticamente.

### Sem pacotes

Quando nenhum pacote é selecionado, o projeto contém apenas a estrutura base: CRUD genérico, configuração mínima e estrutura de pastas.

---

## auth — Autenticação

Sistema completo de autenticação JWT com registro, confirmação por email, recuperação de senha e controle de acesso baseado em papéis (RBAC).

**Camadas:** backend, frontend, mobile
**Dependências:** nenhuma

### Arquivos gerados

**Backend:**
- `entity/User.java` — Entidade de usuário com campos email, password, roles
- `entity/Role.java` — Entidade de papel (ADMIN, USER)
- `entity/Fingerprint.java` — Registro de dispositivos/sessões
- `dao/UserDAO.java`, `dao/FingerprintDAO.java`
- `bc/UserBC.java` — Lógica de negócio de usuários
- `service/AuthREST.java` — Endpoints `/auth/login`, `/auth/refresh`, `/auth/register`, `/auth/confirm/{token}`, `/auth/forgot-password`, `/auth/reset-password`
- `service/UserREST.java` — CRUD de usuários
- `security/Credentials.java`, `security/Social.java`
- `constants/Perfil.java` — Constantes de perfis
- `email/Email.java`, `email/EmailService.java`, `email/EmailTemplate.java` — Serviço de envio de emails

**Frontend (Vue.js 3):**
- `views/LoginView.vue` — Tela de login
- `views/RegisterView.vue` — Tela de registro
- `views/ForgotPasswordView.vue` — Tela de recuperação de senha
- `views/ResetPasswordView.vue` — Tela de redefinição de senha
- `stores/auth.js` — Pinia store de autenticação
- `composables/useAuth.js` — Composable com lógica de auth, interceptor Axios e guards de rota

**Mobile (Flutter):**
- `screens/login_screen.dart`, `register_screen.dart`, `forgot_password_screen.dart`, `reset_password_screen.dart`
- `providers/auth_provider.dart` — Riverpod StateNotifier com login/logout/refreshToken
- `services/auth_service.dart` — Comunicação HTTP via Dio
- `models/user_model.dart`

**Dependências Maven:**
- `org.demoiselle.jee:demoiselle-security-jwt:4.1.0-SNAPSHOT` — módulo JWT do framework com TokenManager, KeyRotation, RefreshToken, TokenBlacklist (usa jose4j internamente). Inclui `demoiselle-security` que fornece PasswordEncoder (PBKDF2-SHA256), BruteForceGuard, anotações de segurança e filtros
- `com.sun.mail:jakarta.mail-api:2.0.1` — envio de emails (confirmação de registro, recuperação de senha)

**Dependências Dart:**
- `flutter_secure_storage: ^9.0.0`

### Efeito nos CRUDs

Quando `auth` está ativo, os endpoints REST gerados pelo `yo demoiselle:add` incluem:

```java
@Authenticated
@RequiredAnyRole({"ADMIN", "USER"})
public class ProdutoREST extends AbstractREST<Produto, UUID> { ... }
```

Sem `auth`, os endpoints são gerados sem anotações de segurança.

### Exemplo de uso

```bash
# Projeto com autenticação
yo demoiselle meu-app br.gov.exemplo app --packages=auth

# Adicionar entidade — REST terá @RolesAllowed
yo demoiselle:add crud Produto
```

---

## messaging — Mensageria

Sistema de notificações in-app, por email e push notifications via Firebase Cloud Messaging (FCM) para mobile.

**Camadas:** backend, frontend, mobile
**Dependências:** `auth` (incluído automaticamente)

### Arquivos gerados

**Backend:**
- `entity/Notification.java` — Entidade de notificação
- `dao/NotificationDAO.java`
- `bc/NotificationBC.java` — Lógica de envio in-app e email
- `service/NotificationREST.java` — Endpoints `/notifications` (listagem paginada), `/notifications/{id}/read`
- `cloud/CloudMessage.java`, `CloudNotification.java`, `CloudSender.java` — Integração com serviços de push
- `push/PushEndpoint.java`, `PushMessage.java`, `PushMessageDecoder.java`, `PushMessageEncoder.java` — WebSocket para push

**Frontend:**
- `components/NotificationBell.vue` — Sino de notificações no header com badge e dropdown
- `views/NotificationsView.vue` — Lista completa de notificações
- `stores/notifications.js` — Pinia store

**Mobile:**
- `widgets/notification_badge.dart` — Badge na AppBar
- `screens/notifications_screen.dart`
- `providers/notifications_provider.dart`
- `services/notification_service.dart`
- `models/notification_model.dart`
- `android/app/google-services.json` — Configuração FCM Android
- `ios/Runner/GoogleService-Info.plist` — Configuração FCM iOS

**Dependências Dart:**
- `firebase_messaging: ^14.7.0`
- `firebase_core: ^2.25.0`

### Exemplo de uso

```bash
# Selecionar messaging inclui auth automaticamente
yo demoiselle meu-app br.gov.exemplo app --packages=messaging,dashboard
# Pacotes resolvidos: auth, messaging, dashboard
```

---

## mcp — Model Context Protocol

Integração com o Model Context Protocol usando as anotações `@McpTool`, `@McpResource` e `@McpPrompt` do Demoiselle 4.1. Permite expor ferramentas, recursos e prompts da aplicação para clientes MCP (como assistentes de IA).

**Camadas:** backend
**Dependências:** nenhuma

### Arquivos gerados

**Backend:**
- `mcp/McpToolExample.java` — Classe com métodos `@McpTool` de exemplo (greet, countEntities, serverStatus)
- `mcp/McpResourceExample.java` — Classe com métodos `@McpResource` (applicationInfo, databaseSchema)
- `mcp/McpPromptExample.java` — Classe com métodos `@McpPrompt` (explainEntity, generateQuery)
- `resources/mcp-config.json` — Configuração do servidor MCP com endpoint SSE

**Dependências Maven:**
- `org.demoiselle:demoiselle-mcp:4.1.0`

### Efeito nos CRUDs

Quando `mcp` está ativo, cada CRUD gerado inclui automaticamente:

```java
@McpTool(name = "produto-crud", description = "CRUD operations for Produto entity")
public class ProdutoREST extends AbstractREST<Produto, UUID> { ... }
```

### Exemplo de uso

```bash
yo demoiselle meu-app br.gov.exemplo app --packages=mcp,auth

# O endpoint MCP fica disponível em http://localhost:8080/mcp/sse
```

---

## file-upload — Upload de Arquivos

Endpoints e componentes para upload/download de arquivos com metadados, validação de tamanho e tipo MIME, e armazenamento no filesystem local.

**Camadas:** backend, frontend, mobile
**Dependências:** nenhuma

### Arquivos gerados

**Backend:**
- `entity/FileMetadata.java` — Entidade com originalName, storedName, mimeType, size, uploadedAt
- `dao/FileMetadataDAO.java`
- `service/FileREST.java` — Endpoints `/files/upload` (multipart) e `/files/{id}` (download)
- `storage/FileStorageService.java` — Armazenamento no filesystem com validação

**Frontend:**
- `components/FileUpload.vue` — Componente reutilizável com drag-and-drop e preview de imagens

**Mobile:**
- `widgets/file_upload_widget.dart` — Widget com seleção via file_picker e image_picker
- `services/file_service.dart` — Upload via Dio multipart

**Dependências Dart:**
- `file_picker: ^6.1.1`
- `image_picker: ^1.0.7`

### Configuração

O backend aceita configuração via `demoiselle.properties`:

```properties
app.file.storage.directory=uploads
app.file.max-size=10485760
app.file.allowed-mime-types=image/png,image/jpeg,image/gif,application/pdf,text/plain
```

---

## audit — Auditoria

Registro automático de alterações em entidades via JPA EntityListener. Gera log com entidade, ação (CREATE/UPDATE/DELETE), usuário, timestamp e detalhes das mudanças.

**Camadas:** backend, frontend, mobile
**Dependências:** nenhuma (adapta comportamento quando `auth` está presente)

### Arquivos gerados

**Backend:**
- `entity/AuditLog.java` — Entidade com entityName, entityId, action, userId, timestamp, changes (JSON)
- `dao/AuditLogDAO.java`
- `listener/AuditEntityListener.java` — JPA EntityListener que registra alterações automaticamente
- `service/AuditREST.java` — Endpoint `/audit` com filtros por entidade, usuário e período

**Frontend:**
- `views/AuditView.vue` — Tabela de registros de auditoria com filtros

**Mobile:**
- `screens/audit_screen.dart`
- `services/audit_service.dart`

### Interação com auth

- Com `auth` ativo: endpoint `/audit` restrito a `@RolesAllowed("ADMIN")`
- Sem `auth`: endpoint `/audit` acessível sem restrição

### Efeito nos CRUDs

Quando `audit` está ativo, as entidades geradas incluem:

```java
@EntityListeners(AuditEntityListener.class)
@Table(name = "produto")
public class Produto implements Serializable { ... }
```

---

## dashboard — Dashboard

Dashboard com cards de estatísticas mostrando contagens de todas as entidades registradas. Tela inicial do sistema quando ativo.

**Camadas:** backend, frontend, mobile
**Dependências:** nenhuma

### Arquivos gerados

**Backend:**
- `service/DashboardREST.java` — Endpoint `/dashboard/stats` com contagens de entidades

**Frontend:**
- `views/DashboardView.vue` — Grid responsivo de cards com estatísticas

**Mobile:**
- `screens/dashboard_screen.dart` — Grid de cards com estatísticas
- `services/dashboard_service.dart`
- `models/dashboard_stats_model.dart`

### Efeito nos CRUDs

Quando `dashboard` está ativo, cada novo CRUD adicionado via `yo demoiselle:add`:
- Injeta o DAO da entidade no `DashboardREST.java`
- Adiciona a contagem no endpoint `/dashboard/stats`
- Adiciona card no `DashboardView.vue` (frontend)
- Adiciona card no `dashboard_screen.dart` (mobile)

### Sem dashboard

Quando não selecionado, a rota inicial redireciona para uma tela de boas-vindas ou a listagem da primeira entidade.

---

## export — Exportação

Exportação de dados em CSV e PDF. Adiciona botões de exportação nas listagens e endpoints dedicados no backend.

**Camadas:** backend, frontend, mobile
**Dependências:** nenhuma

### Arquivos gerados

**Backend:**
- `export/CsvExporter.java` — Utilitário de exportação CSV
- `export/PdfExporter.java` — Utilitário de exportação PDF

**Frontend:**
- `composables/useExport.js` — Composable com funções `downloadCsv()` e `downloadPdf()`

**Mobile:**
- `widgets/export_buttons.dart` — Botões de exportação com compartilhamento via share_plus
- `services/export_service.dart`

**Dependências Maven:**
- `com.opencsv:opencsv:5.9`
- `com.github.librepdf:openpdf:1.3.35`

**Dependências Dart:**
- `share_plus: ^7.2.1`

### Efeito nos CRUDs

Quando `export` está ativo, cada CRUD gerado inclui:

**Backend:**
```java
@GET @Path("export") @Produces("text/csv")
public Response exportCsv() { ... }

@GET @Path("export/pdf") @Produces("application/pdf")
public Response exportPdf() { ... }
```

**Frontend:** botões "Exportar CSV" e "Exportar PDF" na listagem.

**Mobile:** widget `ExportButtons` na AppBar da listagem.

---

## observability — Observabilidade

Métricas MicroProfile, tracing OpenTelemetry, health check e rate limiting por IP.

**Camadas:** backend
**Dependências:** nenhuma

### Arquivos gerados

**Backend:**
- `service/HealthREST.java` — Endpoint `/health` (sem autenticação) com status da aplicação, banco e memória
- `filter/RateLimitFilter.java` — Filtro JAX-RS de rate limiting por IP com janela de 1 minuto

**Dependências Maven:**
- `org.demoiselle:demoiselle-observability:4.1.0`
- `org.eclipse.microprofile.metrics:microprofile-metrics-api:4.0`

### Efeito nos CRUDs

Quando `observability` está ativo, os endpoints REST incluem:

```java
@Counted(name = "produto_requests")
@Traced(module = "crud", operation = "produto")
public class ProdutoREST extends AbstractREST<Produto, UUID> { ... }
```

### Configuração

```properties
app.ratelimit.max-requests=100
```

---

## i18n — Internacionalização

Suporte a múltiplos idiomas com traduções pt-BR e en. Inclui seletor de idioma no header.

**Camadas:** frontend, mobile
**Dependências:** nenhuma

### Arquivos gerados

**Frontend:**
- `i18n/index.js` — Configuração vue-i18n com fallback pt-BR
- `i18n/pt-BR.json` — Traduções em português
- `i18n/en.json` — Traduções em inglês
- `components/LanguageSelector.vue` — Dropdown de seleção de idioma no header

**Mobile:**
- `l10n/app_pt.arb` — Traduções ARB em português
- `l10n/app_en.arb` — Traduções ARB em inglês
- `l10n/app_localizations.dart` — Classe de localização com delegate

**Dependências npm:**
- `vue-i18n: ^9.9.0`

**Dependências Dart:**
- `flutter_localizations: sdk`
- `intl: ^0.18.1`

### Efeito nos CRUDs

Com `i18n` ativo, os templates usam chaves de tradução:

**Frontend:**
```html
<h1>{{ $t('produto.title') }}</h1>
<label>{{ $t('produto.fields.description') }}</label>
```

**Sem i18n**, textos fixos em português:
```html
<h1>Produto</h1>
<label>Description</label>
```

Ao adicionar um CRUD, chaves de tradução são inseridas automaticamente nos arquivos `pt-BR.json`, `en.json`, `app_pt.arb` e `app_en.arb`.

---

## themes — Temas

Suporte a temas claro e escuro com alternância dinâmica e persistência da preferência do usuário.

**Camadas:** frontend, mobile
**Dependências:** nenhuma

### Arquivos gerados

**Frontend:**
- `components/ThemeToggle.vue` — Botão de alternância no header
- `stores/theme.js` — Pinia store com persistência no localStorage
- `styles/variables.css` — Variáveis CSS para temas
- `styles/theme-light.css` — Tema claro
- `styles/theme-dark.css` — Tema escuro

**Mobile:**
- `theme/app_theme.dart` — ThemeData com `light()` e `dark()`, Material Design 3 (`useMaterial3: true`)
- `theme/color_schemes.dart` — ColorScheme.fromSeed para claro e escuro
- `providers/theme_provider.dart` — Riverpod StateNotifier com persistência via shared_preferences, suporte a ThemeMode.system

**Dependências Dart:**
- `shared_preferences: ^2.2.2`

### Sem themes

Quando não selecionado, o frontend usa tema claro fixo com CSS direto e o mobile usa `ThemeData` padrão sem alternância.

---

## Combinações Comuns

### Projeto completo

```bash
yo demoiselle meu-app br.gov.exemplo app \
  --packages=auth,messaging,dashboard,audit,export,i18n,themes,observability,file-upload,mcp
```

### Projeto enxuto (apenas CRUD + auth)

```bash
yo demoiselle meu-app br.gov.exemplo app --packages=auth
```

### API sem frontend

```bash
yo demoiselle meu-app br.gov.exemplo app \
  --skip-frontend --skip-mobile \
  --packages=auth,audit,observability,mcp
```

### Frontend + Mobile sem auth

```bash
yo demoiselle meu-app br.gov.exemplo app \
  --packages=dashboard,i18n,themes,export
```

### Projeto base (sem pacotes)

```bash
yo demoiselle meu-app br.gov.exemplo app --packages=
```

Gera apenas estrutura de pastas, CRUD base e configuração mínima.

---

## Adicionando pacotes a um projeto existente

A configuração de pacotes fica armazenada no `.yo-rc.json`:

```json
{
  "generator-demoiselle": {
    "project": "meu-app",
    "package": "br.gov.exemplo",
    "prefix": "app",
    "packages": ["auth", "dashboard", "i18n", "themes"]
  }
}
```

Os sub-geradores (`add`, `fromEntity`, `fromSwagger`) leem essa configuração automaticamente. Para adicionar um pacote a um projeto existente, edite o array `packages` no `.yo-rc.json` e re-execute o gerador principal para gerar os arquivos do novo pacote.

---

## Criando um novo pacote

Para adicionar um novo pacote ao gerador:

1. Crie o diretório em `Utils/templates/packages/<slug>/` com subdiretórios por camada (`backend/`, `frontend/`, `mobile/`)
2. Adicione os templates EJS nos diretórios de camada
3. Registre o pacote em `Utils/packageRegistry.js` no método `_registerAll()` com slug, displayName, description, dependencies, layers, mavenDeps, npmDeps e dartDeps
4. Pronto — o pacote aparece automaticamente no prompt de seleção e é copiado durante a geração
