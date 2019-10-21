/*jshint esversion: 8*/

(() => {
  'use strict';

  module.exports.schema = {
    id: '/model/sha256',
    title: "SHA-256 hash string",
    description: "String with a SHA-256 hash",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'string',
    pattern: '^[A-Fa-f0-9]{64}$'
  };
})();