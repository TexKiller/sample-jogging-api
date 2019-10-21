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
    runModel = require('../../../models/run'),
    runs = runModel.mongooseModel,
    reports = require('../../../models/report').mongooseModel,
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

    let sampleUserSession2 = {
      token: "ea6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleUser2.name
    };
    sampleUserSession2 = sessionModel.api2db(sampleUserSession2);

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

    let sampleReport1 = {
      userName: sampleUser.name,
      firstDate: "2018-08-12",
      length: 50,
      duration: 120,
      speed: 50 / 120
    };

    let sampleReport2 = {
      userName: sampleUser.name,
      firstDate: "2018-08-19",
      length: 100,
      duration: 60,
      speed: 100 / 60
    };

    let sampleReport3 = {
      userName: sampleUser.name,
      firstDate: "2018-08-26",
      length: 200,
      duration: 30,
      speed: 200 / 30
    };

    let sampleRequestOptions1 = {
      method: model.method,
      body: {
        session: sampleUserSession.token
      }
    };

    let sampleRequestOptions2 = {
      method: model.method,
      body: {
        session: sampleUserSession.token,
        pagination: {
          start: 0,
          amount: 2
        }
      }
    };

    let sampleRequestOptions3 = {
      method: model.method,
      body: {
        session: sampleUserSession.token,
        filter: "firstDate eq '" + sampleReport1.firstDate + "'"
      }
    };

    let sampleRequestOptions4 = {
      method: model.method,
      body: {
        session: sampleUserSession.token,
        filter: "(firstDate eq '" + sampleReport1.firstDate + "') or ((length ne 100) and (duration lt 120) and (speed gt 6))"
      }
    };

    let sampleRequestOptions5 = {
      method: model.method,
      body: {
        session: sampleUserSession.token,
        filter: "((("
      }
    };

    let sampleRequestOptions6 = {
      method: model.method,
      body: {
        session: sampleUserSession.token,
        filter: "$eq eq '" + sampleReport1.firstDate + "'"
      }
    };

    it('return 200 HTTP status code when regular user lists its own reports', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions1),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await reports.create(sampleReport1);
      await reports.create(sampleReport2);
      await reports.create(sampleReport3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.reports, null, "return reports");
      assert.equal(ret.reports.length, 3, "return 3 reports");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when regular user lists its own reports with pagination', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions2),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await reports.create(sampleReport1);
      await reports.create(sampleReport2);
      await reports.create(sampleReport3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.reports, null, "return reports");
      assert.equal(ret.reports.length, 2, "return 2 reports");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when regular user filters its own reports', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions3),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await reports.create(sampleReport1);
      await reports.create(sampleReport2);
      await reports.create(sampleReport3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.reports, null, "return reports");
      assert.equal(ret.reports.length, 1, "return 1 reports");
      assert.notEqual(ret.reports[0], null, "first report");
      assert.equal(ret.reports[0].firstDate, sampleReport1.firstDate, "first report firstDate");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when regular user filters its own reports using all required operations and fields', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions4),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await reports.create(sampleReport1);
      await reports.create(sampleReport2);
      await reports.create(sampleReport3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.reports, null, "return reports");
      assert.equal(ret.reports.length, 2, "return 2 reports");
      assert.notEqual(ret.reports[0], null, "first report");
      assert.notEqual(ret.reports[0].firstDate, sampleReport2.firstDate, "first report firstDate");
      assert.notEqual(ret.reports[1], null, "second report");
      assert.notEqual(ret.reports[1].firstDate, sampleReport2.firstDate, "second report firstDate");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 400 HTTP status code and "INVALID_REQUEST" response code when passing filter with invalid syntax', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions5),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await reports.create(sampleReport1);
      await reports.create(sampleReport2);
      await reports.create(sampleReport3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 400, "status code");
      assert.equal(ret.response.code, "INVALID_REQUEST", "response code");
      assert.equal(ret.reports, null, "not return reports");
      assert.notEqual(session, null, "session in db");
      assert.equal(session.token, sampleUserSession.token, "keep session token");
      assert.equal(ret.response.session, undefined, "don't return session token");
    });

    it('return 403 HTTP status code and "INVALID_FILTER" response code when passing filter with invalid components', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions6),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await reports.create(sampleReport1);
      await reports.create(sampleReport2);
      await reports.create(sampleReport3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(ret.response.code, "INVALID_FILTER", "response code");
      assert.equal(ret.reports, null, "not return reports");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

  });

})();