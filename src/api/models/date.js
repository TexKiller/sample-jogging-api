/*jshint esversion: 8*/

(() => {
  'use strict';

  module.exports.schema = {
    id: '/type/date',
    title: "Date",
    description: "String with a date",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'string',
    pattern: '^\\d{4}\\-(0[1-9]|1[012])\\-(0[1-9]|[12][0-9]|3[01])$'
  };
})();