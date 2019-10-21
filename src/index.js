/*jshint esversion: 8*/

const routes = require('./functions/routes'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || 80,
    bodyParser = require('body-parser'),
    modelFunctions = require('./functions/model'),
    systemFunctions = require("./functions/system");

(async () => {
    await modelFunctions.connectToMongo();

    app.use(require('express-domain-middleware'));

    app.use((err, req, res, next) => {
        try {
            console.error('Error on request: %d %s %s: %j', process.domain.id, req.method, req.url, err);
            var ret = {
                status: "error",
                message: "Internal Server Error"
            };
            if (!systemFunctions.env("PRODUCTION")) {
                ret.error = err;
            }
            res.status(500).json(ret);
        } catch (e) {
            console.error("Couldn't deliver error message for:");
            console.error(e);
            res.status(500).send("Internal Server Error");
        }
    });

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    let apiRoutes = routes(express.Router());
    app.use(require("./api/ws").href || "/", apiRoutes);

    app.listen(port);
})();