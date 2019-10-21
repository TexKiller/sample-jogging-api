/*jshint esversion: 8*/

const assert = require("assert"),
      model = require("./model"),
      httpMocks = require("node-mocks-http"),
      controller = require("../../../../functions/routes")().doc,
      systemFunctions = require("../../../../functions/system");

describe(model.title || "Documentation", () => {

  it('return 200 HTTP status code', async function () {
    if (systemFunctions.env("PRODUCTION") && !systemFunctions.env("PRODUCTION_DOC")) {
      return this.skip();
    }
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await controller(req, res);
    assert.equal(res.statusCode, 200);
  });

});