/*jshint esversion: 8*/

(() => {
  'use strict';

  const auth = require("../../user/auth"),
    runModel = require('../../../models/run'),
    runs = runModel.mongooseModel,
    reports = require("../../../models/report").mongooseModel,
    darkskyForecast = require("../../../../ws/darksky/endpoints/forecast/get/model"),
    modelFunctions = require("../../../../functions/model");

  module.exports = async function (req, res) {
    let loggedUser = await auth.user(req, res);
    if (loggedUser) {
      if (req.body.userName && req.body.userName !== loggedUser.name && loggedUser.role !== "admin") {
        return res.status(403).json({
          response: {
            status: "error",
            message: "The logged user is not allowed to delete this report",
            code: "NOT_ALLOWED",
            session: loggedUser.session
          }
        });
      }
      let oldReport = await reports.findOne({
        userName: req.body.userName || loggedUser.name,
        firstDate: req.body.firstDate
      });
      if (!oldReport) {
        return res.status(404).json({
          response: {
            status: "error",
            message: "Report with the specified firstDate not found for this user",
            code: "REPORT_NOT_FOUND",
            session: loggedUser.session
          }
        });
      }
      await oldReport.remove();
      res.status(200).json({
        response: {
          status: "success",
          session: loggedUser.session
        }
      });
    }
  };
})();