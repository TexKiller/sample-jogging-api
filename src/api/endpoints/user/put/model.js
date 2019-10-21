/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../../../functions/model'),
    user = require('../../../models/user').schema,
    response = require('../../../models/response').schema,
    session = require('../../../models/session').schema;

  module.exports = {
    title: "User Modification",
    description: "Modifies the logged user or allows manager or admin to modify another user",
    href: "/user",
    method: "PUT",
    schema: modelFunctions.fixRequired({
      id: '/user/put/request',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        user: modelFunctions.clone(user, {
          properties: {
            role: {
              description: "New role of the user (for admins only)"
            }
          }
        }),
        session: session,
        userName: modelFunctions.clone(user.properties.name, {
          description: "Name of the user to change (for managers and admins only)"
        })
      },
      required: [
        'user',
        {
          type: "logical",
          anyOf: [
            'user.name',
            'user.password'
          ]
        },
        'session'
      ],
      additionalProperties: false
    }),
    targetSchema: modelFunctions.fixRequired({
      id: '/user/put/response',
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