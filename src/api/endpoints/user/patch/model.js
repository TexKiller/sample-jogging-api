/*jshint esversion: 8*/

(() => {
    'use strict';

    const modelFunctions = require('../../../../functions/model'),
        user = require('../../../models/user').schema,
        response = require('../../../models/response').schema,
        sha256 = require('../../../models/sha256').schema;

    module.exports = {
        title: "User Log-In",
        description: "Logs an existing user in",
        href: "/user",
        method: "PATCH",
        schema: modelFunctions.fixRequired({
            id: '/user/patch/request',
            "$schema": "http://json-schema.org/draft-04/schema#",
            type: "object",
            properties: {
                name: user.properties.name,
                passwordHash: sha256
            },
            required: [
                'name',
                'passwordHash'
            ],
            additionalProperties: false
        }),
        targetSchema: modelFunctions.fixRequired({
            id: '/user/post/response',
            "$schema": "http://json-schema.org/draft-04/schema#",
            type: "object",
            properties: {
                response: response
            },
            required: ["response"],
            additionalProperties: false
        })
    };
    module.exports.schema.properties.passwordHash.description = "SHA-256 hash of the user password concatenated with the string 'jogging'";
})();