/*jshint esversion: 8*/

(() => {

  'use strict';

  const assert = require('assert'),
    httpMocks = require('node-mocks-http'),
    model = require('./model'),
    controller = require('../../../../functions/routes')()[model.href.substr(1)],
    users = require('../../../models/user').mongooseModel;

  describe(model.title, () => {

    let sampleUser = {
      name: "test user",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr"
    };

    let sampleRequestOptions = {
      method: model.method,
      body: {
        user: sampleUser
      }
    };

    it('return 200 HTTP status code when registering new user', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions),
        res = httpMocks.createResponse();

      await controller(req, res);
      let user = await users.findOne({
        name: sampleUser.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(user, null, "user in db");
    });

    it('return 403 HTTP status code and "ALREADY_EXISTS" response code when registering existing user', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions),
        res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      await controller(req, res);

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "ALREADY_EXISTS", "response code");
    });

  });

})();