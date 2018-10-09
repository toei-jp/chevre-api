"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 配給ルーター
 */
const express_1 = require("express");
const distributeRouter_1 = require("./distributions/distributeRouter");
const creativeWorksRouter = express_1.Router();
creativeWorksRouter.use('/distributions', distributeRouter_1.default);
exports.default = distributeRouter_1.default;
//# sourceMappingURL=distributions.js.map