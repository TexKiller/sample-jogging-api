/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../../../functions/model'),
    run = require('../../../models/run').schema,
    response = require('../../../models/response').schema,
    session = require('../../../models/session').schema;

  module.exports = {
    title: "Run Deletion",
    description: "Deletes a run (for the owner and admins only)",
    href: "/run",
    method: "DELETE",
    schema: modelFunctions.fixRequired({
      id: '/run/delete/request',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        runId: run.properties.id,
        session: session
      },
      required: [
        'runId',
        'session'
      ],
      additionalProperties: false
    }),
    targetSchema: modelFunctions.fixRequired({
      id: '/run/delete/response',
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