# Bachelors thesis on GraphQL API performance

This repo contains the practical part of my bachelors thesis,
which is about optimizing performance of GraphQL APIs, targeting pagination algorithms and the N+1 problem.

The complete set of test results acquired during the making of the thesis can be found in the `test-results.xlsx` file.

## 1. Setup

### 1.1 Prerequisites

We'll need to install Node.js 16 and setup a PostgreSQL 13 database.

### 1.2 Clone the repo

Clone the repo and run `npm i` in `/api`, `/scripts` and `/tests`

### 1.3 Setup the database

Make sure that the PostgreSQL server is running and check the connection details in `/api/ormconfig.js`.

Then, in a terminal, move to `/api` and run `npm run dev` to start the backend for the first time.

This will connect to the database and set up all tables.

### 1.4 Acquiring and importing the data

Grab the electronics metadata file from http://deepyeti.ucsd.edu/jianmo/amazon/index.html (make sure to cite them if used scientifically). Then unzip the json file, rename it to `data.json` and move it to `/scripts/data/in`.

Then open a terminal in `/scripts` and run `npm run data:prepare` to convert it to csv files. You can find them in `/scripts/data/out` once the process is complete.

Lastly, import those csv files into your database with a tool such as DataGrip. Make sure to have your import tool strip out the header row, as well as escape double quotes.

## 2. Run the tests

Now that the API is usable, you can open a terminal in `/tests` and use `npm start` to run the tests.
You don't want to start the API manually, the test process will do that for you.

After the tests are done, you'll find generated CSV files in `/tests/src` that contain all measurements for each test.
Open them in Excel or another tool of your choice.

## 3. Starting the API manually to test against it

If you need to start one of the API implementations to run queries against it, you can do so by moving to `/api`
and use `npm run build` to build it, and then one of the following commands to start any of the implementations:

- `npm start -- --impl offset` to start the offset-based implementation
- `npm start -- --impl cursor-offset` to start the cursor-based implementation with offset support
- `npm start -- --impl cusror-offset-dataloader` to start the dataloader backed version of the cursor-based implementation
