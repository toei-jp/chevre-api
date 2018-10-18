/**
 * 興行区分ルーター
 */
import * as chevre from '@toei-jp/chevre-domain';
import { Router } from 'express';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const boxOfficeTypesRouter = Router();
boxOfficeTypesRouter.use(authentication);
boxOfficeTypesRouter.get(
    '/getBoxOfficeTypeList',
    permitScopes(['admin', 'boxOfficeTypes', 'boxOfficeTypes.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (__, res, next) => {
        try {
            const boxOfficeTypeRepo = new chevre.repository.BoxOfficeType(chevre.mongoose.connection);
            const boxOfficeTypes = await boxOfficeTypeRepo.getBoxOfficeTypeList();
            res.json(boxOfficeTypes);
        } catch (error) {
            next(error);
        }
    }
);
export default boxOfficeTypesRouter;
