"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 配給ルーター
 */
const chevre = require("@toei-jp/chevre-domain");
const express_1 = require("express");
const authentication_1 = require("../../middlewares/authentication");
const permitScopes_1 = require("../../middlewares/permitScopes");
const validator_1 = require("../../middlewares/validator");
const distributeRouter = express_1.Router();
distributeRouter.use(authentication_1.default);
distributeRouter.get('/list', permitScopes_1.default(['admin', 'distributions', 'distributions.read-only']), (_, __, next) => {
    next();
}, validator_1.default, (_, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const distributionRepo = new chevre.repository.Distributions(chevre.mongoose.connection);
        const movies = yield distributionRepo.getDistributions();
        res.json(movies);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = distributeRouter;
