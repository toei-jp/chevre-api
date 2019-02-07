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
const mongoose = require("mongoose");
const http_status_1 = require("http-status");
const authentication_1 = require("../../middlewares/authentication");
const permitScopes_1 = require("../../middlewares/permitScopes");
const validator_1 = require("../../middlewares/validator");
const distributeRouter = express_1.Router();
distributeRouter.use(authentication_1.default);
distributeRouter.get('/list', permitScopes_1.default(['admin']), validator_1.default, (_, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const distributionRepo = new chevre.repository.Distributions(mongoose.connection);
        const distributions = yield distributionRepo.getDistributions();
        res.json(distributions);
    }
    catch (error) {
        next(error);
    }
}));
distributeRouter.get('/search', permitScopes_1.default(['admin']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const distributionRepo = new chevre.repository.Distributions(mongoose.connection);
        const searchCoinditions = Object.assign({}, req.query, { 
            // tslint:disable-next-line:no-magic-numbers no-single-line-block-comment
            limit: (req.query.limit !== undefined) ? Math.min(req.query.limit, 100) : 100, page: (req.query.page !== undefined) ? Math.max(req.query.page, 1) : 1 });
        const totalCount = yield distributionRepo.countDistributions(searchCoinditions);
        const distributions = yield distributionRepo.searchDistributions(searchCoinditions);
        res.set('X-Total-Count', totalCount.toString());
        res.json(distributions);
    }
    catch (error) {
        next(error);
    }
}));
distributeRouter.put('/:id', permitScopes_1.default(['admin']), (req, _, next) => {
    req.checkBody('name').exists().withMessage('name is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const distributionRepo = new chevre.repository.Distributions(mongoose.connection);
        yield distributionRepo.updateDistribution({
            id: req.params.id,
            name: req.body.name
        });
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
distributeRouter.post('/add', permitScopes_1.default(['admin']), (req, _, next) => {
    req.checkBody('id').exists().withMessage('id is required');
    req.checkBody('name').exists().withMessage('name is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const distributionRepo = new chevre.repository.Distributions(mongoose.connection);
        const distributions = yield distributionRepo.createDistribution({
            id: req.body.id,
            name: req.body.name
        });
        res.status(http_status_1.CREATED).json(distributions);
    }
    catch (error) {
        next(error);
    }
}));
distributeRouter.delete('/:id', permitScopes_1.default(['admin']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const distributionRepo = new chevre.repository.Distributions(mongoose.connection);
        yield distributionRepo.deleteById({
            id: req.params.id
        });
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
exports.default = distributeRouter;
