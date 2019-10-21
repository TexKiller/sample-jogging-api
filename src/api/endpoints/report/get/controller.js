/*jshint esversion: 8*/

(() => {
  'use strict';

  const auth = require("../../user/auth"),
    runModel = require('../../../models/run'),
    runs = runModel.mongooseModel,
    reportModel = require("../../../models/report"),
    reports = reportModel.mongooseModel,
    darkskyForecast = require("../../../../ws/darksky/endpoints/forecast/get/model"),
    modelFunctions = require("../../../../functions/model");

  module.exports = async function (req, res) {
    let aggregation;
    try {
      aggregation = modelFunctions.aggregate(req.body.filter || "", req.body.pagination || {
        start: 0,
        amount: 10
      });
      if (aggregation.length == 2) {
        throw new Error();
      }
    } catch (e) {
      return res.status(400).json({
        response: {
          status: "error",
          message: "The filter is invalid",
          code: "INVALID_REQUEST"
        }
      });
    }
    let loggedUser = await auth.user(req, res);
    if (loggedUser) {
      if (req.body.userName && req.body.userName !== loggedUser.name && loggedUser.role !== "admin") {
        return res.status(403).json({
          response: {
            status: "error",
            message: "The logged user is not allowed to list other user's reports",
            code: "NOT_ALLOWED",
            session: loggedUser.session
          }
        });
      }
      let totalAggregation = [{
        "$match": {
          userName: req.body.userName || loggedUser.name
        }
      }];
      if (aggregation[0].$match && !aggregation[0].$match.undefined) {
        totalAggregation.push(aggregation[0]);
      }
      totalAggregation.push({
        "$group": {
          _id: 1,
          count: {
            "$sum": 1
          }
        }
      });
      let total;
      try {
        total = (await (reports.aggregate(totalAggregation)))[0];
      } catch (e) {
        return res.status(403).json({
          response: {
            status: "error",
            message: "The filter is invalid",
            code: "INVALID_FILTER",
            session: loggedUser.session
          }
        });
      }
      let result;
      let pages = {
        first: {
          start: 0,
          amount: aggregation[2].$limit
        },
        last: {
          start: Math.max(0, (total && total.count || 0) -
            (total && total.count || 0) % aggregation[2].$limit),
          amount: aggregation[2].$limit
        }
      };
      if (aggregation[1].$skip > 0) {
        let page = Math.min(total && total.count || 0, aggregation[1].$skip - 1);
        pages.previous = {
          start: page - page % aggregation[2].$limit,
          amount: aggregation[2].$limit
        };
      }
      if (aggregation[1].$skip < pages.last.start) {
        let page = Math.min(total && total.count || 0, aggregation[1].$skip);
        pages.next = {
          start: page - page % aggregation[2].$limit + aggregation[2].$limit,
          amount: aggregation[2].$limit
        };
      }
      if (total && total.count > aggregation[1].$skip) {
        let pageAggregation = totalAggregation.slice(0, totalAggregation.length - 1);
        pageAggregation.push(aggregation[1]);
        pageAggregation.push(aggregation[2]);
        result = (await (reports.aggregate(pageAggregation))).map(report => {
          return modelFunctions.db2api(reportModel.mongooseSchema)(new reports(report)).toObject();
        });
      } else {
        result = [];
      }
      res.status(200).json({
        response: {
          status: "success",
          session: loggedUser.session
        },
        reports: result,
        pages: pages
      });
    }
  };
})();