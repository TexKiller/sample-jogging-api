/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../../../functions/model'),
    user = require('../../../models/user').schema,
    response = require('../../../models/response').schema,
    session = require('../../../models/session').schema,
    pagination = require('../../../models/pagination').schema,
    pages = require('../../../models/pages').schema,
    filter = require('../../../models/filter').schema;

  module.exports = {
    title: "User Listing",
    description: "Lists all users (for managers and admins only)",
    href: "/user",
    method: "GET",
    schema: modelFunctions.fixRequired({
      id: '/user/get/request',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        session: session,
        pagination: pagination,
        filter: filter
      },
      required: [
        "session",
        "pagination.start",
        "pagination.amount"
      ],
      additionalProperties: false
    }),
    targetSchema: modelFunctions.fixRequired({
      id: '/user/get/response',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        response: response,
        users: {
          type: "array",
          items: user
        },
        pages: pages
      },
      required: ["response"],
      additionalProperties: false
    })
  };
  delete module.exports.targetSchema.properties.users.items.properties.password;
})();