# Clio-Ui

[![Build Status](https://travis-ci.org/europeana/clio-ui.svg?branch=develop)](https://travis-ci.org/europeana/clio-ui)

## Repository Contents

This repository is a front-end for europeana clio.


## Getting started

Make sure you have `node` version 24.x and `npm` version 11.x:

    node --version
    npm --version

Get the `npm` dependencies:

    npm install

To run Clio UI you need to provide a backend server to connect to. Modify the file `src/assets/env.js` by filling in the URLs

## Development server

Run `npm start` for a dev server. Navigate to [http://localhost:4200/](http://localhost:4200/). The `(clio-ui)` app will automatically reload if you change any of the source files.


## Branches and Pull Requests

The main branch for development is the `develop` branch. But do NOT use this branch directly! Use a new branch for features/bugs and give it a descriptive name containing the user story code, like:

    feat/MET-1535-page-styling
    bug/MET-3245-not-loading-error

If you push a branch or commit to GitHub, it will automatically be tested by Travis CI. This will take about 5 mins and the results will be shown in GitHub, e.g. in the pull request page.


## Linting and code formatting

`prettier` and `eslint` are run on PRs.  Use these commands to run them manually before committing:

    npm run prettier
    npm run lint

## Test

### Unit tests

To run the unit tests:

    npm run test:dev

### E2E tests (development)

To run the e2e (cypress) tests:

    npm run test:e2e


To run the cypress tests in development (watch mode), start the dev server in one terminal window:

    npm run start:ci

...start the dev data server in another terminal window:

    npm run start:ci-data

...and then run cypress in another window:

    npm run cypress


## Build

Run `npm run build` to build the project.
Use `npm run dist` for a production build.


## Deploy

This project uses github actions to deploy.


## License

Licensed under the EUPL v. 1.2.

For full details, see [LICENSE.md](LICENSE.md).
