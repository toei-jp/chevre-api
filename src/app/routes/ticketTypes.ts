/**
 * 券種ルーター
 */
import * as chevre from '@toei-jp/chevre-domain';
import { Router } from 'express';
import { CREATED, NO_CONTENT } from 'http-status';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const ticketTypesRouter = Router();
ticketTypesRouter.use(authentication);
ticketTypesRouter.post(
    '',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ticketType: chevre.factory.ticketType.ITicketType = {
                id: req.body.id,
                name: req.body.name,
                description: req.body.description,
                notes: req.body.notes,
                charge: req.body.charge,
                boxOnly: req.body.boxOnly,
                nameForManagementSite: req.body.nameForManagementSite,
                nameForPrinting: req.body.nameForPrinting,
                seatReservationUnit: req.body.seatReservationUnit,
                subject: req.body.subject,
                onlineOnly: req.body.onlineOnly,
                typeOfNote: req.body.typeOfNote,
                indicatorColor: req.body.indicatorColor
            };
            const ticketTypeRepo = new chevre.repository.TicketType(chevre.mongoose.connection);
            await ticketTypeRepo.createTicketType(ticketType);
            res.status(CREATED).json(ticketType);
        } catch (error) {
            next(error);
        }
    }
);
ticketTypesRouter.get(
    '',
    permitScopes(['admin', 'ticketTypes', 'ticketTypes.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ticketTypeRepo = new chevre.repository.TicketType(chevre.mongoose.connection);
            const searchCoinditions = {
                // tslint:disable-next-line:no-magic-numbers no-single-line-block-comment
                limit: (req.query.limit !== undefined) ? Math.min(req.query.limit, 100) : 100,
                page: (req.query.page !== undefined) ? Math.max(req.query.page, 1) : 1,
                id: req.query.id,
                name: req.query.name,
                charge: req.query.charge,
                notSort: req.query.notSort
            };
            const totalCount = await ticketTypeRepo.countTicketTypes(searchCoinditions);
            const ticketTypes = await ticketTypeRepo.searchTicketTypes(searchCoinditions);
            res.set('X-Total-Count', totalCount.toString());
            res.json(ticketTypes);
        } catch (error) {
            next(error);
        }
    }
);
ticketTypesRouter.get(
    '/:id',
    permitScopes(['admin', 'ticketTypes', 'ticketTypes.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ticketTypeRepo = new chevre.repository.TicketType(chevre.mongoose.connection);
            const ticketType = await ticketTypeRepo.findTicketTypeById({ id: req.params.id });
            res.json(ticketType);
        } catch (error) {
            next(error);
        }
    }
);
/**
 * 関連券種グループ
 * ticketTypeGroups relation to ticketType
 */
ticketTypesRouter.get(
    '/getTicketTypeGroupList/:ticketTypeId',
    permitScopes(['admin', 'ticketTypes', 'ticketTypes.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ticketTypeRepo = new chevre.repository.TicketType(chevre.mongoose.connection);
            const ticketTypeGroups = await ticketTypeRepo.findTicketTypeGroupByTicketTypeId({ ticketTypeId: req.params.ticketTypeId });
            res.json(ticketTypeGroups);
        } catch (error) {
            next(error);
        }
    }
);
ticketTypesRouter.put(
    '/:id',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ticketType: chevre.factory.ticketType.ITicketType = {
                id: req.body.id,
                name: req.body.name,
                description: req.body.description,
                notes: req.body.notes,
                charge: req.body.charge,
                boxOnly: req.body.boxOnly,
                nameForManagementSite: req.body.nameForManagementSite,
                nameForPrinting: req.body.nameForPrinting,
                seatReservationUnit: req.body.seatReservationUnit,
                subject: req.body.subject,
                onlineOnly: req.body.boxOnly,
                typeOfNote: req.body.typeOfNote,
                indicatorColor: req.body.indicatorColor
            };
            const ticketTypeRepo = new chevre.repository.TicketType(chevre.mongoose.connection);
            await ticketTypeRepo.updateTicketType(ticketType);
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);
ticketTypesRouter.delete(
    '/:id',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ticketTypeRepo = new chevre.repository.TicketType(chevre.mongoose.connection);
            await ticketTypeRepo.deleteTicketType({ id: req.params.id });
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);
export default ticketTypesRouter;
