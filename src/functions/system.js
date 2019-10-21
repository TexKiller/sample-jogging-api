/*jshint esversion: 8*/

(() => {
  'use strict';

  const process = require("process");

  /*
   * Returns an environment variable, appending "_TESTING" if running in testing mode
   */

  module.exports.env = function (env) {
    if (typeof global.it === "function") {
      return process.env[env + "_TESTING"];
    } else {
      return process.env[env];
    }
  };

})();