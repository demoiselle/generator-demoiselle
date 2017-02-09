# generator-demoiselle [![NPM version][npm-image]] [npm-url] [![Join the chat at https://gitter.im/demoiselle](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/demoiselle?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/demoiselle/generator-demoiselle.svg?branch=master)](https://travis-ci.org/demoiselle/generator-demoiselle)

> Gerador para Demoiselle 3.0

Utilitário para geração de arquivos utilizando os padrôes:
- Demoiselle 3.0
- Angular
- Swagger Spec - [OpenApis](https://openapis.org/specification)

## Requisitos

Para rodar apenas o generator, você precisará de: `node, npm e yo`.

Para rodar os projetos em Demoiselle 3.0, você precisará:
- no backend: Java8, mvn
- no frontend: node, nvm

## Instalação

```bash
npm install -g yo generator-demoiselle
```

## Execução

```bash
# Para criar um novo projeto:
yo demoiselle

# Para adicionar funcionalidades em um projeto:
yo demoiselle:add

# Para gerar entidades a partir de uma especificação Swagger
yo demoiselle:fromSwagger

# Para gerar entidades a partir da pasta de entidades java
yo demoiselle:fromEntity
```

## Funcionalidades

- [x] `yo demoiselle` - gera novos projetos
- [x] `yo demoiselle:add` - gera partes da aplicação
- [x] `yo demoiselle:fromSwagger` - gera partes da aplicação usando especificação Swagger
- [x] `yo demoiselle:fromEntity` - gera partes da aplicação usando as entidades java pré-existentes

## Tutorial

- [ ] **TODO** - Vídeo: criar vídeo para versão nova do generator

## Roadmap

Acompanhe pelos [milestones](https://github.com/demoiselle/generator-demoiselle/milestones) do projeto.

## License

LGPL3 © [SERPRO](http://demoiselle.io/)

[npm-image]: https://badge.fury.io/js/generator-demoiselle.svg
[npm-url]: https://npmjs.org/package/generator-demoiselle
