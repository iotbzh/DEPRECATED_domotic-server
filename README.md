# IOT DOMOTIC SERVER

## Description

A server made in [Nest](https://github.com/nestjs/nest) to manage door-reader access, shutter and light.

## WARNING

This is project is under construction and it  is experimental.

## Installation

**Note**: for `development` without physical card readers and shutter relays set `ENV=dev-mock` in the `.env` file.
Copy `src/example.*.json` and change with correct values.

```bash
# Copy example json files
cp src/example.config-readers.json src/config-readers.json
cp src/example.config-winstar-relay.json src/config-winstar-relay.json

# then open config-readers.json and config-winstar-relay.json and change with your values
```

---
**Note**: Readers, badges and users follow this level logic:

- For **readers** the 'level' property is:

  - 0: private
  - 1: servers, etc
  - 2: public

- For **badges** the 'permission' property is:

  - 0: all
  - 1: servers, etc
  - 2: public

- For **users** the 'type' property is:

  - 0: super
  - 1: admin
  - 2: normal
  - 3: guest

You can adapt you own logic changing the different services in `src` folder.

```bash
git clone git clone https://github.com/iotbzh/server-domotic.git
cd server-domotic
make all
```

Extra commands

```bash
npx ts-node -r dotenv/config scripts/bcrypt-generator.js
```

## Installing dependencies

This domotic server implements 2 physical components:

- Civintec CT9 and CN56 NFC card readers (Access Control).
- Winstar 2 channel relay with 4 network port IO (Shutter control).

They must be at the same folder level as domotic-server.

```bash
git clone https://github.com/iotbzh/civintec-reader.git
cd civintec-server
npm install && npm run build

cd ..
git clone https://github.com/iotbzh/winstar-relay
cd winstar-relay
npm install && npm run build
```

**Note**: Set the `ENV=prod` or `ENV=dev` or `ENV=dev-mock` in the `.env` file.

## Database

This application use [PostgreSQL](https://www.postgresql.org/) database. If not installed on your system you can use the [docker](https://www.docker.com/)-compose file included. After installing docker you just need to run `docker-compose up -d`.
You can configure the connection in the `.env` file under the `DATABASE_` variables.

## Running the app

```bash
# first time
make setup

# development
make devf # terminal 1 to run the frontend (angular) in watch mode.
make devb # terminal 2 to run the backend (nestjs) in watch mode.

# production mode
make all &&
npm start:prod
```

Alternately install [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/), the daemon **process manager** that will help you manage and keep your application online.

Change the `ecosystem.config.js` file and run

```bash
# production mode
$  pm2 start ecosystem.config.js --env production
```

## Migrations

**Note**: This application only includes one migration to create the admin user. The application must be built (`npm run build`) or running (`npm run start`).

To run migrations:

```bash
npm run typeorm migration:run
```

or using the cli

```bash
npx typeorm migration:run
```

To rollback migration

```bash
npx typeorm migration:revert
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Examples

- Login:
  ```bash
  curl -X POST "http://localhost:3000/auth/login" -H  "accept: */*" -H  "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"changeme\"}"
  ```
  output:

  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NTExNWRlNC02ZjFiLTQ0NzctODViYS04MTM4ZmUzMTYzNjkiLCJpYXQiOjE2MDM5MDU5OTEsImV4cCI6MTYwMzkxMzE5MX0.jTG7RX6okFbAbUfzhn2-dlQPOnJf2EI87SzKfpfh3XU"
  }
  ```

- Get users:
  ```bash
  curl -X GET "http://localhost:3000/users/list" -H  "accept: */*" -H  "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NTExNWRlNC02ZjFiLTQ0NzctODViYS04MTM4ZmUzMTYzNjkiLCJpYXQiOjE2MDM5MDU5OTEsImV4cCI6MTYwMzkxMzE5MX0.jTG7RX6okFbAbUfzhn2-dlQPOnJf2EI87SzKfpfh3XU"
  ```
  output:

  ```json
  [
    {
      "id": "85115de4-6f1b-4477-85ba-8138fe316369",
      "created_at": "2020-10-28T15:53:22.164Z",
      "updated_at": "2020-10-28T15:53:22.164Z",
      "disabled": false,
      "first_name": "Admin",
      "last_name": "IOTBZH",
      "email": "admin@example.com",
      "type": 0,
      "ldp_id": null,
      "password": "$2b$10$FUCDGataiVyRrwdU4DeTpe/tUhdh/yIQdj/WoPpo2rkR/2Wb.eWbi",
      "badges": []
    }
  ]
  ```

- Create badge:
  ```bash
  curl -X POST "http://localhost:3000/badge/create" -H  "accept: */*" -H  "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NTExNWRlNC02ZjFiLTQ0NzctODViYS04MTM4ZmUzMTYzNjkiLCJpYXQiOjE2MDM5MDU5OTEsImV4cCI6MTYwMzkxMzE5MX0.jTG7RX6okFbAbUfzhn2-dlQPOnJf2EI87SzKfpfh3XU" -H  "Content-Type: application/json" -d "{\"uid\":\"1514563213\",\"permission\":0,\"user\":\"85115de4-6f1b-4477-85ba-8138fe316369\"}"
  ```
  output:

  ```json
  {
    "uid": "1514563213",
    "permission": 0,
    "user": "85115de4-6f1b-4477-85ba-8138fe316369",
    "id": "381b9fe1-b962-4c97-9ead-ee5772e2d252",
    "created_at": "2020-10-28T16:52:40.802Z",
    "updated_at": "2020-10-28T16:52:40.802Z",
    "disabled": false
  }
  ```

For more api information check console logs where you run `make devb` or visit [http://localhost:3000/api-doc]('http://localhost:3000/api-doc')

## Useful Documentation

- Typeorm - [Migrations](https://typeorm.io/#/migrations/creating-a-new-migration)

## License

  Copyright (C) 2020-2021 [IoT.bzh Company](https://www.iot.bzh/licensing).
