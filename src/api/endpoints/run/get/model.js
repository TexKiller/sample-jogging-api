/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../../../functions/model'),
    run = require('../../../models/run').schema,
    response = require('../../../models/response').schema,
    session = require('../../../models/session').schema,
    pagination = require('../../../models/pagination').schema,
    pages = require('../../../models/pages').schema,
    filter = require('../../../models/filter').schema;

  module.exports = {
    title: "Run Listing",
    description: "Lists all runs from a user (for the owner and admins only)",
    href: "/run",
    method: "GET",
    schema: modelFunctions.fixRequired({
      id: '/run/get/request',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        session: session,
        pagination: pagination,
        filter: filter,
        userName: modelFunctions.clone(run.properties.userName, {
          description: "List runs from the user with this name (for admins only)"
        })
      },
      required: [
        "session",
        "pagination.start",
        "pagination.amount"
      ],
      additionalProperties: false
    }),
    targetSchema: modelFunctions.fixRequired({
      id: '/run/get/response',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        response: response,
        runs: {
          type: "array",
          items: run
        },
        pages: pages
      },
      required: [
        "response",
        "pages.first",
        "pages.last"
      ],
      additionalProperties: false
    })
  };
})();