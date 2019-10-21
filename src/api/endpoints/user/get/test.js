/*jshint esversion: 8*/

(() => {

  'use strict';

  const assert = require('assert'),
    httpMocks = require('node-mocks-http'),
    model = require('./model'),
    controller = require('../../../../functions/routes')()[model.href.substr(1)],
    userModel = require('../../../models/user'),
    users = userModel.mongooseModel,
    sessionModel = require('../../../models/session'),
    sessions = sessionModel.mongooseModel,
    modelFunctions = require("../../../../functions/model"),
    systemFunctions = require("../../../../functions/system");

  describe(model.title, () => {

    let sampleUser = {
      name: "test user",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr"
    };
    sampleUser = userModel.api2db(sampleUser);

    let sampleUserSession = {
      token: "ea6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleUser.name
    };
    sampleUserSession = sessionModel.api2db(sampleUserSession);

    let sampleUser2 = {
      name: "test user 2",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr"
    };
    sampleUser2 = userModel.api2db(sampleUser2);

    let sampleUser3 = {
      name: "test user 3",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr"
    };
    sampleUser3 = userModel.api2db(sampleUser3);

    let sampleManager = {
      name: "test manager",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr",
      role: "manager"
    };
    sampleManager = userModel.api2db(sampleManager);

    let sampleManagerSession = {
      token: "da6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleManager.name
    };
    sampleManagerSession = sessionModel.api2db(sampleManagerSession);

    let sampleAdmin = {
      name: "test admin",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr",
      role: "admin"
    };
    sampleAdmin = userModel.api2db(sampleAdmin);

    let sampleAdminSession = {
      token: "ea6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleAdmin.name
    };
    sampleAdminSession = sessionModel.api2db(sampleAdminSession);

    let sampleRequestOptions1 = {
      method: model.method,
      body: {
        session: sampleAdminSession.token
      }
    };

    let sampleRequestOptions2 = {
      method: model.method,
      body: {
        session: sampleAdminSession.token,
        pagination: {
          start: 0,
          amount: 2
        }
      }
    };

    let sampleRequestOptions3 = {
      method: model.method,
      body: {
        session: sampleAdminSession.token,
        filter: "name eq '" + sampleUser.name + "'"
      }
    };

    let sampleRequestOptions4 = {
      method: model.method,
      body: {
        session: sampleAdminSession.token,
        filter: "(name eq '" + sampleUser.name + "') or ((name ne '" + sampleUser3.name + "') and (name lt '" + sampleUser3.name + "') and (name gt '" + sampleUser.name + "'))"
      }
    };

    let sampleRequestOptions5 = {
      method: model.method,
      body: {
        session: sampleAdminSession.token,
        filter: "((("
      }
    };

    let sampleRequestOptions6 = {
      method: model.method,
      body: {
        session: sampleAdminSession.token,
        filter: "$eq eq " + sampleUser.length
      }
    };

    it('return 200 HTTP status code when admin lists users', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions1),
        res = httpMocks.createResponse();

      await users.create(sampleAdmin);
      await users.create(sampleUser);
      await users.create(sampleUser2);
      await users.create(sampleUser3);
      await sessions.create(sampleAdminSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleAdmin.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.users, null, "return users");
      assert.equal(ret.users.length, 4, "return 3 users");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleAdminSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when admin lists users with pagination', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions2),
        res = httpMocks.createResponse();

      await users.create(sampleAdmin);
      await users.create(sampleUser);
      await users.create(sampleUser2);
      await users.create(sampleUser3);
      await sessions.create(sampleAdminSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleAdmin.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.users, null, "return users");
      assert.equal(ret.users.length, 2, "return 2 users");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleAdminSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when admin filters users', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions3),
        res = httpMocks.createResponse();

      await users.create(sampleAdmin);
      await users.create(sampleUser);
      await users.create(sampleUser2);
      await users.create(sampleUser3);
      await sessions.create(sampleAdminSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleAdmin.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.users, null, "return users");
      assert.equal(ret.users.length, 1, "return 1 user");
      assert.notEqual(ret.users[0], null, "first user");
      assert.equal(ret.users[0].name, sampleUser.name, "first user time");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleAdminSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when admin filters users using all required operations and name field', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions4),
        res = httpMocks.createResponse();

      await users.create(sampleAdmin);
      await users.create(sampleUser);
      await users.create(sampleUser2);
      await users.create(sampleUser3);
      await sessions.create(sampleAdminSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleAdmin.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.users, null, "return users");
      assert.equal(ret.users.length, 2, "return 2 users");
      assert.notEqual(ret.users[0], null, "first user");
      assert.notEqual(ret.users[0].name, sampleUser3.name, "first user time");
      assert.notEqual(ret.users[1], null, "second user");
      assert.notEqual(ret.users[1].name, sampleUser3.name, "second user time");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleAdminSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 400 HTTP status code and "INVALID_REQUEST" response code when passing filter with invalid syntax', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions5),
        res = httpMocks.createResponse();

      await users.create(sampleAdmin);
      await users.create(sampleUser);
      await users.create(sampleUser2);
      await users.create(sampleUser3);
      await sessions.create(sampleAdminSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleAdmin.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(ret.response.code, "INVALID_FILTER", "response code");
      assert.equal(ret.users, null, "not return users");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleAdminSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "INVALID_FILTER" response code when passing filter with invalid components', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions6),
        res = httpMocks.createResponse();

      await users.create(sampleAdmin);
      await users.create(sampleUser);
      await users.create(sampleUser2);
      await users.create(sampleUser3);
      await sessions.create(sampleAdminSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleAdmin.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(ret.response.code, "INVALID_FILTER", "response code");
      assert.equal(ret.users, null, "not return users");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleAdminSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

  });

})();