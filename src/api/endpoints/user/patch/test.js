/*jshint esversion: 8*/

(() => {
  'use strict';

  const assert = require('assert'),
    httpMocks = require('node-mocks-http'),
    model = require('./model'),
    user = require('../../../models/user'),
    controller = require('../../../../functions/routes')()[model.href.substr(1)],
    users = user.mongooseModel,
    sessions = require("../../../models/session").mongooseModel;

  describe(model.title, () => {

    let sampleUser = {
      name: "test user",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr"
    };
    sampleUser = user.api2db(sampleUser);

    let sampleRequestOptions = {
      method: model.method,
      body: {
        name: sampleUser.name,
        passwordHash: sampleUser.passwordHash
      }
    };

    it('return 200 HTTP status code when logging in with existing user', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions),
        res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(session, null, "session in db");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "session in db");
    });

    it('return 404 HTTP status code and "USER_NOT_FOUND" response code when logging in with user not registered', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions),
        res = httpMocks.createResponse();

      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 404, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "USER_NOT_FOUND", "response code");
      assert.equal(session, null, "session not in db");
    });

    it('return 403 HTTP status code and "LOGIN_FAILED" response code when logging in with wrong password', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions),
        res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      await user.updateOne({
        passwordHash: '2428746224287462242874622428746224287462242874622428746224287462'
      });
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "LOGIN_FAILED", "response code");
      assert.equal(session, null, "session not in db");
    });

  });

})();