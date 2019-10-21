/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../../../functions/model'),
    run = require('../../../models/run').schema,
    response = require('../../../models/response').schema,
    session = require('../../../models/session').schema;

  module.exports = {
    title: "Run Modification",
    description: "Modifies a run (for the owner and admins only)",
    href: "/run",
    method: "PUT",
    schema: modelFunctions.fixRequired({
      id: '/run/put/request',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        run: run,
        session: session
      },
      required: [
        'run',
        {
          type: "logical",
          anyOf: [{
              type: "logical",
              title: "Average run data",
              required: [
                "run.location",
                "run.location.latitude",
                "run.location.longitude",
                "run.time",
                "run.duration",
                "run.length"
              ]
            },
            {
              type: "logical",
              title: "Path data",
              required: [
                "run.path",
                "run.path.location",
                "run.path.location.latitude",
                "run.path.location.longitude",
                "run.path.time"
              ]
            }
          ]
        },
        'session'
      ],
      additionalProperties: false
    }),
    targetSchema: modelFunctions.fixRequired({
      id: '/run/put/response',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        response: response,
        run: run
      },
      required: ["response"],
      additionalProperties: false
    })
  };
  delete module.exports.schema.properties.run.properties.userName;
  delete module.exports.targetSchema.properties.run.properties.userName;
})();