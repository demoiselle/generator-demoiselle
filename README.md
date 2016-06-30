# generator-demoiselle [![NPM version][npm-image]] [npm-url]
> Gerador Demoiselle 2.5 com AngularJS

- Projeto baseado no utilitário http://yeoman.io/, apartir do generator-angular (https://github.com/yeoman/generator-angular#readme)
- Fizemos a compatibilização com o Servidor Restful Demoiselle 2.5
- Implementação da segurança do Demoiselle 2.5 baseada em JWT (https://jwt.io/) RFC7519 (https://tools.ietf.org/html/rfc7519)
- O padrão swagger agora é OpenApis (https://openapis.org/specification) e os Servidores gerados aqui já estão utilizando essa api por padrão

### Vídeo Tutorial
- https://www.youtube.com/watch?v=57kyX-nuKRQ

## Instalação

- Para se trabalhar com Demoiselle é necessário o java-jdk-7 e do AngularJS o nodejs
- para a instalação do nodejs siga os passos:
```bash
sudo apt-get install nodejs npm
* sudo ln -s /usr/bin/nodejs /usr/bin/node (caso o ubuntu não encontre o nodejs)
sudo npm install npm bower grunt-cli -g (SEMPRE que usar sudo colocar -g(global))
```

```bash
sudo npm install -g yo generator-demoiselle
```

### Criar um projeto novo
- O ideal é criar uma pasta do projeto e executar os comandos a seguir:
```bash
yo demoiselle
```
- Serão criadas duas pastas, uma frontend onde está a aplicação AngularJS e outra backend com o servidor Demoiselle Rest
- Para executar o backend faça a importação de app maven na sua IDE preferida
- Se você estiver no SERPRO execute o comando (yo demoiselle:serpro) para apontar sua app para os repositórios locais (rapidez e economia de banda)
- Para executar o frontend, entre a pasta e digite npm install e depois bower install
- Pronto! é só executar o server Demoiselle e chamar o comando (grunt serve) na pasta frontend

### Comandos
Criar nova funcionalidade
```bash
yo demoiselle:add
```
- Adiciona uma nova funcionalidade desde o servidor até a view, sempre criar com o padrão de classe java, como a funcionalidade Livro, por exemplo
- A funcionalidade é criada por padrão com o ID e Descrição

Apontar para repositório interno (NPM e Bower)
```bash
yo demoiselle:serpro
```

Gerar frontend apartir de um swagger
```bash
yo demoiselle:swagger
```
- O comando swagger lê o swagger.json que deve estar na mesma pasta onde será executado o comando, pode ser obtido desta forma (wget http://estacionamento-fwkdemoiselle.rhcloud.com/api/swagger.json), essa pasta deve ser a principal do projeto, a pasta raíz onde estão as pastas backend e frontend, pois as classes serão criadas apartir deste local
- Nesta primeira versão, o backend é criado seguindo um padrão convencionado para um servidor Demoiselle 2.5 gerado aqui, sendo necessário ajustes nos serviços que não estão no padrão básico do CRUD
- Nas próximas versões faremos o mapeamento completo dos serviços.

## Roadmap

- 0.1.0 Mapeamento completo do swagger ("Me dê um swagger.json que te dou uma aplicação")
- 1.0.0 Versão final
- 1.5.0 Versão usando as referências do JonhPapa (https://github.com/johnpapa/angular-styleguide/blob/master/a1/i18n/pt-BR.md)
- 2.0.0 Versão com AngularJS - 2 e a nova versão do Demoiselle JEE7


## License

MIT © [Paulo Gladson](https://www.frameworkdemoiselle.gov.br/)

[npm-image]: https://badge.fury.io/js/generator-demoiselle.svg
[npm-url]: https://npmjs.org/package/generator-demoiselle
