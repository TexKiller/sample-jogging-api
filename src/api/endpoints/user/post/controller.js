/*jshint esversion: 8*/

(() => {
  'use strict';

  const users = require('../../../models/user').mongooseModel;

  module.exports = async function (req, res) {
    try {
      // Adding user to the collection and getting added document
      let newUser = (await (users.create(req.body.user))).toObject();
      res.status(200).json({
        response: {
          status: "success"
        }
      });
    } catch (e) {
      switch (e.code) {
        case 11000:
          // This is a Mongoose error that indicates there is already
          // a user with the specified name
          res.status(403).json({
            response: {
              status: "error",
              message: "There is already a user with the specified name",
              code: "ALREADY_EXISTS"
            }
          });
          break;
        default:
          throw e;
      }
    }
  };
})();