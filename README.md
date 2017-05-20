<h1 align="center">Notus</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/not.us"><img src="https://img.shields.io/npm/v/not.us.svg?style=flat-square" alt="npm version"></a>
  <a href="https://github.com/Flet/semistandard"><img src="https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square" alt="semistandard"></a>
  <a href="#"><img src="https://img.shields.io/travis/OnlyTwentyCharacters/Notus.svg?style=flat-square" alt="travis build"></a>
  <a href="http://spdx.org/licenses/MIT"><img src="https://img.shields.io/npm/l/not.us.svg?style=flat-square" alt="license"></a>
</p>

## Description
Take notes with ease using Notus. Feel free to use either Markdown or HTML.

## Requirements

You _really_ need these things:

<ul>
<li><a href="https://api.data.gov/signup/"> data.gov Key </a></li>
<li><a href="https://nodemailer.com/smtp/well-known/"> NodeMailer supported service </a></li>
<li><a href="https://rethinkdb.com/"> RethinkDB </a></li>
<li><a href="https://mongodb.com/"> MongoDB </a></li>
<li><a href="https://nodejs.org/en/download/"> Node.js 7.8+ & npm </a></li>
</ul>

## Installation
```
~ $ git clone https://github.com/OnlyTwentyCharacters/notus
cd notus
npm install
```

## Configuration

First clone the `config.js.example` file. 
```
~ $ cp config.js.example config.js
```

Fill in each of the values.

| Name | Key Name | Description | Example |
| -------- | -------- | -------- | -------- |
| Base Domain | `domains.base` | the link to your website without https:// (may include www) | `notus.cf`
| Mailing Domain | `domains.mail` | the domain email are sent from | `notus.cf`
| Site Domain | `domains.website` | full url to your website with the http:// | `https://notus.cf`
| Port | `port` | port number application runs on | `8080`
| Data.gov Key | `dataGovKey` | api key obtained from <a href="https://api.data.gov/">data.gov</a> | N/A
| Secret | `secret` | a random string used to sign cookies  | `asupercomplicatedstring`
| MongoDB Connection String | `database` | mongodb connection string | `mongodb://username:password@domain/database`
| RethinkDB Database Name | `rethinkdb.db` | name of database used in rethinkdb connections | `Notus`
| RethinkDB Hostname | `rethinkdb.servers.host` | hostname used in rethinkdb connections | `localhost`
| RethinkDB Port | `rethinkdb.servers.port` | port used in rethinkdb connections | `28015`
| Note Limit | `noteLimit` | maximum number of notes than can be created per user | `100`
| Mail Service | `mailService.service` | service used to send mail | `SendGrid`
| Mail Service Username | `mailService.service.auth.user` | username on service used to send mail | `mail@mail.domain.name`
| Mail Service Password | `mailService.service.auth.pass` | password on service used to send mail | `ididnothashmypassword`

## Deployment

Using a production manager for Node.js applications is recommended.

**With pm2:**
`~ $ pm2 start Notus.js `

**If you're just testing out Notus for a very short period of time, just do:**
`~ $ node Notus.js`

### Built with
* Node.js
* Express.js
* Passport.js
* EJS
* RethinkDB
* MongoDB
* SimpleMDE
