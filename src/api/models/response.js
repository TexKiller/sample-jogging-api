/*jshint esversion: 8*/

(() => {
    'use strict';

    const session = require('./session');

    module.exports.schema = {
        id: '/model/response',
        title: "API Endpoint response",
        description: "API Endpoint response",
        "$schema": "http://json-schema.org/draft-04/schema#",
        type: 'object',
        properties: {
            status: {
                type: "string",
                enum: ['success', 'error']
            },
            session: session.schema,
            message: {
                type: 'string'
            },
            code: {
                type: "string",
                enum: [
                    'ALREADY_EXISTS',
                    'LOGIN_FAILED',
                    'USER_NOT_FOUND',
                    'INVALID_SESSION',
                    'NOT_IMPLEMENTED',
                    'INTERNAL_SERVER_ERROR',
                    'NOT_ALLOWED',
                    'INVALID_REQUEST',
                    'RUN_NOT_FOUND',
                    'REPORT_NOT_FOUND',
                    'INVALID_FILTER'
                ]
            },
            error: {
                type: ["number", "string", "boolean", "object", "array"],
                description: "Error object, never returned in production."
            }
        },
        required: ['status'],
        additionalProperties: false
    };
})();