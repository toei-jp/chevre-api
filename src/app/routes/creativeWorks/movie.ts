/**
 * 映画ルーター
 */
import * as chevre from '@toei-jp/chevre-domain';
import { Router } from 'express';
import { CREATED, NO_CONTENT } from 'http-status';
import * as moment from 'moment';

import authentication from '../../middlewares/authentication';
import permitScopes from '../../middlewares/permitScopes';
import validator from '../../middlewares/validator';

const movieRouter = Router();
movieRouter.use(authentication);

movieRouter.post(
    '',
    permitScopes(['admin']),
    validator,
    async (req, res, next) => {
        try {
            const movie: chevre.factory.creativeWork.movie.ICreativeWork = {
                ...req.body,
                duration: moment.duration(req.body.duration).toISOString()
            };
            const creativeWorkRepo = new chevre.repository.CreativeWork(chevre.mongoose.connection);
            await creativeWorkRepo.saveMovie(movie);
            res.status(CREATED).json(movie);
        } catch (error) {
            next(error);
        }
    }
);

movieRouter.get(
    '',
    permitScopes(['admin', 'creativeWorks', 'creativeWorks.read-only']),
    validator,
    async (req, res, next) => {
        try {
            const creativeWorkRepo = new chevre.repository.CreativeWork(chevre.mongoose.connection);
            const searchCoinditions: chevre.factory.creativeWork.movie.ISearchConditions = {
                ...req.query,
                // tslint:disable-next-line:no-magic-numbers no-single-line-block-comment
                limit: (req.query.limit !== undefined) ? Math.min(req.query.limit, 100) : 100,
                page: (req.query.page !== undefined) ? Math.max(req.query.page, 1) : 1
            };
            const totalCount = await creativeWorkRepo.countMovies(searchCoinditions);
            const movies = await creativeWorkRepo.searchMovies(searchCoinditions);
            res.set('X-Total-Count', totalCount.toString());
            res.json(movies);
        } catch (error) {
            next(error);
        }
    }
);

movieRouter.get(
    '/:identifier',
    permitScopes(['admin', 'creativeWorks', 'creativeWorks.read-only']),
    validator,
    async (req, res, next) => {
        try {
            const creativeWorkRepo = new chevre.repository.CreativeWork(chevre.mongoose.connection);
            const movie = await creativeWorkRepo.findMovieByIdentifier({ identifier: req.params.identifier });
            res.json(movie);
        } catch (error) {
            next(error);
        }
    }
);

movieRouter.get(
    '/getRating/:identifier',
    permitScopes(['admin', 'creativeWorks', 'creativeWorks.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const creativeWorkRepo = new chevre.repository.CreativeWork(chevre.mongoose.connection);
            const movie = await creativeWorkRepo.findMovieByIdentifier({ identifier: req.params.identifier });
            const rating: string = movie.contentRating;
            res.json(rating);
        } catch (error) {
            next(error);
        }
    }
);

movieRouter.put(
    '/:identifier',
    permitScopes(['admin']),
    validator,
    async (req, res, next) => {
        try {
            const movie: chevre.factory.creativeWork.movie.ICreativeWork = {
                ...req.body,
                duration: moment.duration(req.body.duration).toISOString()
            };
            const creativeWorkRepo = new chevre.repository.CreativeWork(chevre.mongoose.connection);
            await creativeWorkRepo.saveMovie(movie);
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

movieRouter.delete(
    '/:identifier',
    permitScopes(['admin']),
    validator,
    async (req, res, next) => {
        try {
            const creativeWorkRepo = new chevre.repository.CreativeWork(chevre.mongoose.connection);
            await creativeWorkRepo.deleteMovie({ identifier: req.params.identifier });
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

export default movieRouter;
