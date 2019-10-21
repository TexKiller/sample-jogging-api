/*jshint esversion: 8*/

(() => {
  'use strict';

  const auth = require("../../user/auth"),
    userModel = require('../../../models/user'),
    users = userModel.mongooseModel,
    darkskyForecast = require("../../../../ws/darksky/endpoints/forecast/get/model"),
    modelFunctions = require("../../../../functions/model");

  module.exports = async function (req, res) {
    let loggedUser = await auth.user(req, res);
    if (loggedUser) {
      if (loggedUser.role !== "admin") {
        return res.status(403).json({
          response: {
            status: "error",
            message: "The logged user is not allowed to list users",
            code: "NOT_ALLOWED",
            session: loggedUser.session
          }
        });
      }
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
        return res.status(403).json({
          response: {
            status: "error",
            message: "The filter is invalid",
            code: "INVALID_FILTER",
            session: loggedUser.session
          }
        });
      }
      let totalAggregation = [];
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
        total = (await (users.aggregate(totalAggregation)))[0];
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
        result = (await (users.aggregate(pageAggregation))).map(run => {
          return userModel.db2api(modelFunctions.db2api(userModel.mongooseSchema)(new users(run))).toObject();
        });
      } else {
        result = [];
      }
      res.status(200).json({
        response: {
          status: "success",
          session: loggedUser.session
        },
        users: result,
        pages: pages
      });
    }
  };
})();