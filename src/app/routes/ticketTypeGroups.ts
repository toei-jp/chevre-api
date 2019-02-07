/**
 * 券種グループルーター
 */
import * as chevre from '@toei-jp/chevre-domain';
import { Router } from 'express';
import { CREATED, NO_CONTENT } from 'http-status';
import * as mongoose from 'mongoose';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const ticketTypeGroupsRouter = Router();
ticketTypeGroupsRouter.use(authentication);
ticketTypeGroupsRouter.post(
    '',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ticketTypeGroup: chevre.factory.ticketType.ITicketTypeGroup = req.body;
            const ticketTypeRepo = new chevre.repository.TicketType(mongoose.connection);
            await ticketTypeRepo.createTicketTypeGroup(ticketTypeGroup);
            res.status(CREATED).json(ticketTypeGroup);
        } catch (error) {
            next(error);
        }
    }
);
ticketTypeGroupsRouter.get(
    '',
    permitScopes(['admin', 'ticketTypeGroups', 'ticketTypeGroups.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ticketTypeRepo = new chevre.repository.TicketType(mongoose.connection);
            const searchCoinditions: chevre.factory.ticketType.ITicketTypeGroupSearchConditions = {
                ...req.query,
                // tslint:disable-next-line:no-magic-numbers no-single-line-block-comment
                limit: (req.query.limit !== undefined) ? Math.min(req.query.limit, 100) : 100,
                page: (req.query.page !== undefined) ? Math.max(req.query.page, 1) : 1
            };
            const totalCount = await ticketTypeRepo.countTicketTypeGroups(searchCoinditions);
            const ticketTypeGroups = await ticketTypeRepo.searchTicketTypeGroups(searchCoinditions);
            res.set('X-Total-Count', totalCount.toString());
            res.json(ticketTypeGroups);
        } catch (error) {
            next(error);
        }
    }
);
ticketTypeGroupsRouter.get(
    '/:id',
    permitScopes(['admin', 'ticketTypeGroups', 'ticketTypeGroups.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ticketTypeRepo = new chevre.repository.TicketType(mongoose.connection);
            const ticketTypeGroup = await ticketTypeRepo.findTicketTypeGroupById({ id: req.params.id });
            res.json(ticketTypeGroup);
        } catch (error) {
            next(error);
        }
    }
);
ticketTypeGroupsRouter.put(
    '/:id',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ticketTypeGroup: chevre.factory.ticketType.ITicketTypeGroup = req.body;
            const ticketTypeRepo = new chevre.repository.TicketType(mongoose.connection);
            await ticketTypeRepo.updateTicketTypeGroup(ticketTypeGroup);
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);
ticketTypeGroupsRouter.delete(
    '/:id',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ticketTypeRepo = new chevre.repository.TicketType(mongoose.connection);
            await ticketTypeRepo.deleteTicketTypeGroup({ id: req.params.id });
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);
export default ticketTypeGroupsRouter;
