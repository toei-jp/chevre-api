/**
 * 配給ルーター
 */
import * as chevre from '@toei-jp/chevre-domain';
import { Router } from 'express';

import { CREATED, NO_CONTENT } from 'http-status';
import authentication from '../../middlewares/authentication';
import permitScopes from '../../middlewares/permitScopes';
import validator from '../../middlewares/validator';

const distributeRouter = Router();
distributeRouter.use(authentication);

distributeRouter.get(
    '/list',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (_, res, next) => {
        try {
            const distributionRepo = new chevre.repository.Distributions(chevre.mongoose.connection);
            const distributions = await distributionRepo.getDistributions();
            res.json(distributions);
        } catch (error) {
            next(error);
        }
    }
);

distributeRouter.get(
    '/search',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const distributionRepo = new chevre.repository.Distributions(chevre.mongoose.connection);
            const searchCondition = {
                id: req.query.id,
                name: req.query.name
            };
            const totalCount = await distributionRepo.countDistributions(searchCondition);
            const distributions = await distributionRepo.searchDistributions(searchCondition);
            res.set('X-Total-Count', totalCount.toString());
            res.json(distributions);
        } catch (error) {
            next(error);
        }
    }
);

distributeRouter.put(
    '/:id',
    permitScopes(['admin']),
    (req, _, next) => {
        req.checkBody('name').exists().withMessage('name is required');
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const distributionRepo = new chevre.repository.Distributions(chevre.mongoose.connection);
            await distributionRepo.updateDistribution({
                id: req.params.id,
                name: req.body.name
            });
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

distributeRouter.post(
    '/add',
    permitScopes(['admin']),
    (req, _, next) => {
        req.checkBody('id').exists().withMessage('id is required');
        req.checkBody('name').exists().withMessage('name is required');
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const distributionRepo = new chevre.repository.Distributions(chevre.mongoose.connection);
            const distributions = await distributionRepo.createDistribution({
                id: req.body.id,
                name: req.body.name
            });
            res.status(CREATED).json(distributions);
        } catch (error) {
            next(error);
        }
    }
);

distributeRouter.delete(
    '/:id',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const distributionRepo = new chevre.repository.Distributions(chevre.mongoose.connection);
            await distributionRepo.deleteById({
                id: req.params.id
            });
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

export default distributeRouter;
