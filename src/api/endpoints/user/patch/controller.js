/*jshint esversion: 8*/

(() => {
  'use strict';

  const users = require('../../../models/user').mongooseModel,
    session = require('../../../models/session'),
    sessions = session.mongooseModel,
    crypto = require('crypto'),
    buffer = Buffer.alloc(16);

  module.exports = async function (req, res) {
    let user = await (users.findOne({
      name: req.body.name
    }));
    if (user === null) {
      return res.status(404).json({
        response: {
          status: "error",
          message: "There is no user registered with the specified name",
          code: "USER_NOT_FOUND"
        }
      });
    } else {
      user = user.toObject();
    }
    if (user.passwordHash === req.body.passwordHash) {
      let newSession;
      do {
        let session = {
          token: crypto.randomFillSync(buffer).toString('hex'),
          userName: user.name
        };
        try {
          // Adding the session to the database and
          // getting the added document. We need to ignore a lint
          // to be able to use await inside loops

          /* eslint-disable no-await-in-loop */
          newSession = (await (sessions.create(session))).toObject();
          /* eslint-enable no-await-in-loop */
        } catch (e) {
          switch (e.code) {
            case 11000:
              newSession = false;
              break;
            default:
              throw e;
          }
        }
      } while (!newSession);
      res.status(200).json({
        response: {
          status: "success",
          session: session.db2api(newSession)
        }
      });
    } else {
      res.status(403).json({
        response: {
          status: "error",
          message: "The specified password is not the user's password",
          code: "LOGIN_FAILED"
        }
      });
    }
  };
})();