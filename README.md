# generator-demoiselle [![NPM version][npm-image]] [npm-url]
> Gerador Demoiselle 3.0

Utilitário para geração de arquivos utilizando os padrôes:
- Demoiselle 3.0
- Swagger Spec - [OpenApis](https://openapis.org/specification)

## Instalação

- pré-requisitos:
  - backend: Java8
  - frontend: node, nvm

```bash
npm install -g yo generator-demoiselle
```

## Funcionalidades

- [ ] `yo demoiselle` - gera novos projetos
- [ ] `yo demoiselle:add` - gera partes da aplicação
- [ ] `yo demoiselle:swagger` - gera partes da aplicação usando SwaggerSpec

## Tutorial

- [ ] **TODO** - Vídeo: criar vídeo para versão nova do generator

### `yo demoiselle` - novo projeto
- O ideal é criar uma pasta do projeto e executar os comandos a seguir:

```bash
yo demoiselle
```
- Serão criadas duas pastas: `backend` (Demoiselle) e `frontend` (Angular)
- Para executar o backend faça a importação de app maven na sua IDE preferida
- Para executar o frontend, entre na pasta `frontend` e digite: `npm install && npm start`
- Pronto! Agora é só *VOAR*.

## Roadmap

Acompanhe pelos [milestones](https://github.com/demoiselle/generator-demoiselle/milestones) do projeto.

## License

LGPL3 © [Paulo Gladson](https://www.frameworkdemoiselle.gov.br/)

[npm-image]: https://badge.fury.io/js/generator-demoiselle.svg
[npm-url]: https://npmjs.org/package/generator-demoiselle
