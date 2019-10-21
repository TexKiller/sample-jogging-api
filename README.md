# Sample API - Jogging Times of Users

Back-end of a system that allows users to register their jogging runs.

The RESTFull API is served using Express, the data is stored in MongoDB, the unit tests are powered by Mocha and much of the functionality is derived from JSON Schemas.

All types and endpoints have appropriated JSON Schema definitions. Those definitions are then used to automatically validade the types on the database and both the input and output of every API endpoint. They are also used to generate a human friendly documentation of the API, its types and any integrated external Web Services.

## Environment Variables

The following environment variables are used to configure the API:

- `PRODUCTION`: when set to 1, prevents errors from being displayed on the output of the endpoints and prevents the documentation from being shown.
- `PRODUCTION_INVALID_REQUEST_ERROR`: when set to 1, allows validation errors to be displayed even when `PRODUCTION` is set to 1.
- `PRODUCTION_DOC`: when set to 1, allows the documentation to be shown even when `PRODUCTION` is set to 1.
- `SERVER_METHOD`: the method of the server (e.g.: HTTP).
- `SERVER_DOMAIN`: the domain of the server (e.g.: example.com).
- `SERVER_HREF`: the root path of the API (e.g.: /jogging/v0/).
- `MONGO_RAM`: if set to 1, runs a local instance of MongoDB in RAM and connects to it.
- `MONGO_DB_NAME`: name of the MongoDB database to connect to.
- `MONGO_URI`: URI of the MongoDB server to connect to (ignored if `MONGO_RAM` is set to 1).
- `MONGO_AUTHDB`: name of the MongoDB database to use for authentication.
- `MONGO_USER`: user to use for authentication on the MongoDB database.
- `MONGO_PASS`: password to use for authentication on the MongoDB database.
- `DARKSKY_API_KEY`: API key to use when calling the DarkSky Weather API. The key `1d99c4f0935ed2a6ac4ea5e3b2505d36` can be set on this variable for test purposes, but is limited to 1000 calls per day. The complete terms of service can be found here: https://darksky.net/dev/docs/terms

Every variable also has an equivalent variable with the ending `_TESTING` added to the end of the name. This equivalent variable is used during testing instead of the regular environment variable.

P.S.: MongoDB is always served from RAM during tests.

## Installing dependencies

The dependencies are all installed by npm. On the root of the repository, run the command:

```sh
npm install
```

## Running tests

The tests are run by the following command:

```sh
npm test
```

## Starting the server

The server can be started by the following command:

```sh
npm start
```

## Building the documentation

A pre-built documentation of version 1.0.0 can be found at https://faister.com.br/sample-jogging-api/doc.html for convenience. This documentation was built using the followind environment variable values:
- `SERVER_METHOD`: `http`
- `SERVER_DOMAIN`: `localhost`
- `SERVER_HREF`: `/jogging/v0`
- `MONGO_RAM`: `1`

The documentation can be built automatically by the following command (may take some time):

```sh
npm run build
```

It can then be served on the doc endpoint, provided it isn't disabled by the `PRODUCTION` environment variable.