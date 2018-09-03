"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * イベントルーター
 */
const express_1 = require("express");
const screeningEvent_1 = require("./events/screeningEvent");
const screeningEventSeries_1 = require("./events/screeningEventSeries");
const eventsRouter = express_1.Router();
eventsRouter.use('/screeningEvent', screeningEvent_1.default);
eventsRouter.use('/screeningEventSeries', screeningEventSeries_1.default);
exports.default = eventsRouter;
