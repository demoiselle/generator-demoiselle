# generator-demoiselle [![NPM version][npm-image]] [npm-url] [![Join the chat at https://gitter.im/demoiselle](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/demoiselle?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/demoiselle/generator-demoiselle.svg?branch=master)](https://travis-ci.org/demoiselle/generator-demoiselle)

> Gerador para Demoiselle 3.0

Utilitário para a criação da estrutura básica de um projeto, arquivos e estrutura de pastas, utilizando os padrôes:
- Demoiselle 3.0
- Angular
- Swagger Spec - [OpenApis](https://openapis.org/specification)


## Requisitos

Para executar apenas o generator, você precisará da ferramenta de execução de scripts Javascrip Node JS,
do gerenciado de pacotes e dependêncas npm e a ferramenta de apoio para a construção de projetos yo:
`node, npm e yo`.

A execução de projetos em Demoiselle 3.0, depende das seguintes ferramentas de software:
- para o backend: Java8, mvn
- para o frontend: node, nvm

## Instalação

O NodeJs e o npm estão disponíveis para os sistemas operacionais Linux, macOS e Windows e
podem ser obtido no site https://nodejs.org/en/, ambos são instalados com o pacote
de instalação do NodeJs.

Nas distribuições Linux baseadas em Debian a instalação pode ser feita com o comando

```bash
sudo apt-get install nodejs

npm install -g yo generator-demoiselle
```

## Execução


```bash
#Crie uma nova pasta onde serão mantidos os arquivos do seu novo projeto
mkdir Noticias
#Torne a nova pasta como caminho ativo do projeto
cd Noticias
# Para criar um novo projeto:
yo demoiselle
```

Eventualmente pode ser apresentada uma mesagem questionando se você deseja contibuir anonimamente com
informações, caso concorde algumas informações estatísticas sobre o desempenho da ferramenta poderão ser
enviadas para os desenvolvedores da aplicação aprimorarem a ferramenta.

O script de instalação apresentará questionamentos sobre as caracterisitica do seu projeto conforme os
seguintes passos

- Dê um nome para o seu projeto: (Informar o nome do projeto por ex: Noticias)
- Informe o package do backend: (Utilizar o padrão java para estrutura de arquivos)
- Dê um prefixo para os seus componentes: (Informar o prefixo que ??????)
- Você quer gerar arquivos para: (Utilize as teclas de setas para alternar entre as opções, espaço para selecionar, e enter para confirmar)
- Deseja instalar as dependências (isso pode demorar alguns minutos)? (Tem que confirmar para fazer a instalação ou rodar npm install posteriormente)

Serão criados dois diretórios na pasta corrente:

- backend (contém os arquivos para o servidor de aplicação java)
- frontend (arquivos para a interface cliente)

## Executando

Você poderá executar a aplicação criada neste exemplo diretamente pelo console executando os seguintes comandos:

### Backend

```bash
cd backend
#Comando que compila a aplicação e empacota para ser executada com o servidor Wildfly
mvn clean package -Pwildfly-swarm
java -jar -Xmx128m target/SEU_PACOTE-swarm.jar
```

Se tudo ocorreu adequadamente ao acessar o endereço http://localhost:8080/ pelo seu navegador será exibida a página
com informações sobre a configuração e funcionalidades do sistema

###Frontend

```bash
cd frontend
# Instalar os módulos dependentes
npm instal
# Inicia a aplicação (frontend)
npm start
```

Após os comandos será inciado um servidor http na porta 7070 e pode ser acessada utilizando o endereço http://localhost:7070/
no navegador.

### Utilizando o Eclipse

Use a opção Import do menu, selecione Maven->Existing Maven Project e clique em Next. Clique no botão Browse e localize 
a pasta backend criada nos passos anteriores, selecione o arquivo pom.xml identificado e clique em Finish.

No eclipse é possível que apareça o seguinte erro "No generator named "uuid" is defined in the persistence unit" nos arquivos
de mapeamento objeto relacional. Para resolver o problema clique em Window na bara de menu, selecione o item Preferences. Na janela
que será aberta procure pos Java Persistênce->JPA->Errors/Warnings e altere o valor do  item 
"Generator is not defined in the persistence unit" para Info ou Ignore.

## Funcionalidades

- [x] `yo demoiselle` - gera novos projetos
- [x] `yo demoiselle:add` - gera partes da aplicação
- [x] `yo demoiselle:fromSwagger` - gera partes da aplicação usando especificação Swagger
- [x] `yo demoiselle:fromEntity` - gera partes da aplicação usando as entidades java pré-existentes

```bash
# Para adicionar funcionalidades em um projeto:
yo demoiselle:add crud nome_da_nova_funcionalidade

# Para gerar entidades a partir de uma especificação Swagger
yo demoiselle:fromSwagger

# Para gerar entidades a partir da pasta de entidades java
yo demoiselle:fromEntity
```

### Adicionando um novo CRUD
No momento o comando add do gerador de código pode ser utilizado apenas para a geração de objetos necessários
em funcionalidades de mapeamento objeto-relacional. Ao executar o comando yo demoiselle:add 

```bash
yo demoiselle:add
#Alternativamente é possível passar o nome da nova funcionalidade por parâmetro
#yo demoiselle:add crud nome_da_nova_funcionalidade
```

### Criando funcionalidades a partir de classes de mapeamento objeto-relacional
Ao criar uma nova classe para mapeamento de objeto de banco de dados é o gerador de código provê uma instrução que facilita
a construção dos elementos utilizados pela aplicação como a exposição de serviços e interfaces. Caso
exista uma nova classe no pacote entity do seu projeto execute o comando:
 
```bash
yo demoiselle:fromEntity
```

Serão listadas todas as classes responsáveis pelas funcionalidades de mapeamento objeto-relacional. 
Informe se você deseja criar os arquivos para frontend, backend ou ambos e confirme com a tecla enter. 
Selecione as classes para as quais deseja gerara os arquivos necessários para uma aplicação 

### Criando funcionalidades a partir de classes de um serviço existente

O projeto Swagger oferece funcionalidades de apresentação dos serviços disponibilizados, utilizando a notação JSON 
em uma implementação RESTfull. Utilizando esta estratégia a implementação de uma ferramente de consumo de serviços
pode ser implementada sem a necessidade de conhecimentos prévios da implementação no servidor, bastando conhecer a
descrição das funcionalidades do mesmo fornecidas por um documento JSON. O papel do Swagger é semelhante ao desempenhado
pela WSDL em um servidor SOAP.

Para gerar os arquivos baseados em um documento JSON com as descrições dos serviços oferecidos basta colocar o arquivo
na pasta raiz ou subdiretório da aplicação e executar o comando:

```bash
#Serão apresentados todos os arquivos nas pastas da aplicação, selecione os que deseja implementar
yo demoiselle:fromEntity
```

Serão gerados os arquivos necessários para a implementação de uma aplicação, tanto no frontend quanto no backend, a partir 
da descrição fornecida pelo arquivo JSON.


### Frontend


Criando uma distribuição da interface para ser instalada em servidor web

```bash
npm run build
```


## Roadmap

Acompanhe pelos [milestones](https://github.com/demoiselle/generator-demoiselle/milestones) do projeto.

## License

LGPL3 © [SERPRO](http://demoiselle.io/)

[npm-image]: https://badge.fury.io/js/generator-demoiselle.svg
[npm-url]: https://npmjs.org/package/generator-demoiselle
