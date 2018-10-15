/**
 * 興行区分ルーター
 */
import * as chevre from '@toei-jp/chevre-domain';
import { Router } from 'express';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const entertainmentTypesRouter = Router();
entertainmentTypesRouter.use(authentication);
entertainmentTypesRouter.get(
    '/getEntertainmentTypeList',
    permitScopes(['admin', 'entertainmentTypes', 'entertainmentTypes.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (__, res, next) => {
        try {
            const entertainmentTypeRepo = new chevre.repository.EntertainmentType(chevre.mongoose.connection);
            const entertainmentTypes = await entertainmentTypeRepo.getEntertainmentType();
            res.json(entertainmentTypes);
        } catch (error) {
            next(error);
        }
    }
);
export default entertainmentTypesRouter;
