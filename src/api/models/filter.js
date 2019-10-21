/*jshint esversion: 8*/

(() => {
  'use strict';

  module.exports.schema = {
    id: '/model/filter',
    title: "Filter",
    description: "String with a list filter.\n" +
      "Accepts comparisons with most of the MongoDB comparators in the form of (fieldName comparator value).\n" +
      "- fieldName can be anything except MongoDB reserved words (e.g.: $eq).\n" +
      "- comparator is the same as in MongoDB, but without the preceding $ (e.g.: and, or, eq, ne, lt, gt, etc). The not operator has a different syntax: (not comparison).\n" +
      "- value can be any valid JSON value, single quote delimited string or other comparisons.",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'string',
    maxLength: 1000
  };
})();