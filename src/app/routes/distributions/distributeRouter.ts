/**
 * 配給ルーター
 */
import * as chevre from '@toei-jp/chevre-domain';
import { Router } from 'express';

import authentication from '../../middlewares/authentication';
import permitScopes from '../../middlewares/permitScopes';
import validator from '../../middlewares/validator';

const distributeRouter = Router();
distributeRouter.use(authentication);

distributeRouter.get(
    '/list',
    permitScopes(['admin', 'distributions', 'distributions.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (_, res, next) => {
        try {
            const distributionRepo = new chevre.repository.Distributions(chevre.mongoose.connection);
            const movies = await distributionRepo.getDistributions();
            res.json(movies);
        } catch (error) {
            next(error);
        }
    }
);

export default distributeRouter;
