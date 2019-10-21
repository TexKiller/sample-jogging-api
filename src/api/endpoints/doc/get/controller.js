/*jshint esversion: 8*/

const fs = require("fs");

/*
 * Serves the documentation's view
 */

(() => {
  'use strict';

  module.exports = async function (req, res) {
    let docHTML;
    try {
      docHTML = fs.readFileSync(__dirname + '/view.html', 'utf8');
    } catch (e) {
      docHTML = "Can't get the documentation's view. Did you run 'npm run build'?";
    }
    res.status(200).set('Content-Type', 'text/html').send(docHTML);
  };
})();