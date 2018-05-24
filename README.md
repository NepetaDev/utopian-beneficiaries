# utopian-beneficiaries

This is a solution to the following coding task: https://steemit.com/utopian-io/@utopian.tasks/js-developers-and-regex-experts-wanted-javascript-coding-task

A description of this project is available on Steem: https://steemit.com/utopian-io/@nepeta/js-coding-task-assigning-weights-to-beneficiaries-based-on-input

## Installation

Run `yarn` or `npm install`.

## Usage

    // Import the library.
    const beneficiaries = require('./beneficiaries');
    
    // Pass the message as the (only) argument.
    beneficiaries('@utopian-bot !utopian @mention1:15% @mention2:35% @mention3:25% @mention4:25%');

## Unit tests

This project uses [jest](https://facebook.github.io/jest/) for unit tests. Run `yarn test` or `npm run test`.