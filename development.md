# Development Guide

The project is built with the `vue-cli` and for local development you need to have Node.js installed. Please follow the official [Node.js download](https://nodejs.org/en/) instructions.

With `node` available on your system just install all the dependencies of the devradar using

```sh
npm install
```

## Starting local server

By default the local server runs with a local backend that provides functionality to develop and test features.
You can find the available data in the `src/backend/test-volatile/mock-data` folder, the `testVolatile` backend tries to mimick the behavior of firebase so that `dispatch()` calls behave the same but return mock data instead of talking to a real backend.

This is also used during end-to-end tests on the CI server and the database may get whiped regularly.
If your local development requires you to have access to the database, please set up your own firebase project and set your credentials via environment variables during runtime; set `VUE_APP_BACKEND_TYPE` to `firebase` and provide `VUE_APP_BACKEND_PROJECT` and `VUE_APP_BACKEND_KEY` variables either by setting ENV or adding a [`.env`](https://www.npmjs.com/package/dotenv) file in `app/.env`.

### Environment handling

For using different environments via the [vue cli modes](https://cli.vuejs.org/guide/mode-and-env.html#modes) it is necessary to create multiple `.env.<MODE>` files instead of a single `.env`.

**.env.development** is used when running `npm run serve`, the local development server with hot reload.
With the following contents it should run against the e2e firebase project.

```text
VUE_APP_BACKEND_TYPE=firebase
VUE_APP_BACKEND_PROJECT=devradar-e2e
VUE_APP_BACKEND_KEY=...
```

When running in development mode (i.e. using 'devradar-e2e' project), the login calls in [Login.vue](./src/components/Login.vue) are replaced by a stub login call that uses a bootstrapped account.

The development database must be manually populated with two accounts for E-Mail signup:

- morty@devradar.io : jessica
- rick@devradar.io : sanchez

**.env.production** is used when running `npm run build`

```text
VUE_APP_BACKEND_TYPE=firebase
VUE_APP_BACKEND_PROJECT=devradario
VUE_APP_BACKEND_KEY=...
```

**.env.test** is used when running any command and attaching the `--mode test` flag to the vue-cli call.
This will start the server with the mock data backend.

```text
VUE_APP_BACKEND_TYPE=testVolatile
```

## Code Style

Devradar follows Typescript with StandardJS-flavor codestyle. Please validate your code locally before pushing by running `npm run lint && npm run build`. This will also trigger a build to ensure that the code also passes the Typescript compiler.
At the moment warnings are ignored, but in the future stricter Typescript rules may be inforced so please try to remove warnings as well where the current situation allows it.

## Tests

Currently only End to End browser tests are implemented using [cypress](https://cypress.io).
New test cases for additional features or identified bugs are highly welcome.
To perform e2e tests locally please run

```sh
# start server in development mode (continuously running process)
npm run serve
# in a second shell start the cypress UI
npm run test:e2e
# in the UI you can run selected test cases or the entire test suite
```

The tests are also run in CI using the `testVolatile` backend.
It is planned to create a E2E firebase environment to test complete behavior of the app with the actual database.

### Running e2e with a real firestore database

In development mode the app will connect to a secondary Firebase project.
Supporting scripts to wipe the database and prepare users require [Admin access](https://firebase.google.com/docs/reference/admin/node) to this Firebase project.
The admin key is expected to be at `app/firebase-adminsdk.json`.
Keys can be created via the Firebase console.

Available scripts:

| script name | action |
|---|---|
| `cypress/support/wipe-firestore.js` | remove all collection data from firestore |