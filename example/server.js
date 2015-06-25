var requestHandler = require("./handler.js");
var server = require("http").createServer();
server.on("request", requestHandler);
server.listen(8080);

// check if HMR is enabled
if(module.hot) {
    // accept update of dependency
    module.hot.accept("./handler.js", function() {
        // replace request handler of server
        server.removeListener("request", requestHandler);
        requestHandler = require("./handler.js");
        server.on("request", requestHandler);
    });
}
