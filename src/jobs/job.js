const cron = require("node-cron");
const cleanup = require("./reservationCleanUp");

cron.schedule("*/1 * * * *", cleanup);