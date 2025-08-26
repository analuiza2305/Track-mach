// functions/index.js
const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");

// opcional: região do Brasil para menor latência
setGlobalOptions({region: "southamerica-east1", maxInstances: 5});

const app = require("./api"); // importa seu Express
exports.api = onRequest(app); // expõe /api como Function HTTP
