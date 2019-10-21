/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../functions/model'),
    pagination = require('./pagination').schema,
    mongoose = require("mongoose");

  module.exports.schema = {
    id: '/model/pages',
    title: "Pages",
    description: "Relevant pages for pagination",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: "object",
    properties: {
      first: pagination,
      previous: pagination,
      next: pagination,
      last: pagination
    }
  };
})();