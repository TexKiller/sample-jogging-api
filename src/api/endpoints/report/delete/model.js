/*jshint esversion: 8*/

(() => {
    'use strict';

    const modelFunctions = require('../../../../functions/model'),
        report = require('../../../models/report').schema,
        response = require('../../../models/response').schema,
        session = require('../../../models/session').schema;

    module.exports = {
        title: "Report Deletion",
        description: "Deletes a report (for the owner and admins only)",
        href: "/report",
        method: "DELETE",
        schema: modelFunctions.fixRequired({
            id: '/report/delete/request',
            "$schema": "http://json-schema.org/draft-04/schema#",
            type: "object",
            properties: {
                firstDate: report.properties.firstDate,
                session: session,
                userName: modelFunctions.clone(report.properties.userName, {
                    description: "Name of the owner of the report (for admins only)"
                })
            },
            required: [
                'firstDate',
                'session'
            ],
            additionalProperties: false
        }),
        targetSchema: modelFunctions.fixRequired({
            id: '/report/delete/response',
            "$schema": "http://json-schema.org/draft-04/schema#",
            type: "object",
            properties: {
                response: response
            },
            required: ["response"],
            additionalProperties: false
        })
    };
})();