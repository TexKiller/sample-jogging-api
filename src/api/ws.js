/*jshint esversion: 8*/

(() => {
  'use strict';

  const systemFunctions = require("../functions/system");

  module.exports = {
    id: '/api',
    title: "Jogging API",
    description: "REST API that tracks jogging times of users",
    "$schema": "http://json-schema.org/draft-04/schema#",
    base: systemFunctions.env("SERVER_METHOD") + "://" + systemFunctions.env("SERVER_DOMAIN") + systemFunctions.env("SERVER_HREF"),
    href: systemFunctions.env("SERVER_HREF")
  };

})();