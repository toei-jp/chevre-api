/**
 * 予約ルーター
 */
import * as chevre from '@toei-jp/chevre-domain';
import { Router } from 'express';
import { NO_CONTENT } from 'http-status';
import * as moment from 'moment';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const reservationsRouter = Router();
reservationsRouter.use(authentication);

reservationsRouter.get(
    '/eventReservation/screeningEvent',
    permitScopes(['admin', 'reservations', 'reservations.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const reservationRepo = new chevre.repository.Reservation(chevre.mongoose.connection);
            const searchCoinditions: chevre.factory.reservation.event.ISearchConditions = {
                // tslint:disable-next-line:no-magic-numbers no-single-line-block-comment
                limit: (req.query.limit !== undefined) ? Math.min(req.query.limit, 100) : 100,
                page: (req.query.page !== undefined) ? Math.max(req.query.page, 1) : 1,
                sort: req.query.sort,
                reservationStatuses: (Array.isArray(req.query.reservationStatuses)) ? req.query.reservationStatuses : undefined,
                ids: (Array.isArray(req.query.ids)) ? req.query.ids : undefined,
                reservationFor: req.query.reservationFor,
                modifiedFrom: (req.query.modifiedFrom !== undefined) ? moment(req.query.modifiedFrom).toDate() : undefined,
                modifiedThrough: (req.query.modifiedThrough !== undefined) ? moment(req.query.modifiedThrough).toDate() : undefined
            };
            const totalCount = await reservationRepo.countScreeningEventReservations(searchCoinditions);
            const reservations = await reservationRepo.searchScreeningEventReservations(searchCoinditions);
            res.set('X-Total-Count', totalCount.toString());
            res.json(reservations);
        } catch (error) {
            next(error);
        }
    }
);

reservationsRouter.get(
    '/eventReservation/screeningEvent/:id',
    permitScopes(['admin', 'reservations', 'reservations.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const reservationRepo = new chevre.repository.Reservation(chevre.mongoose.connection);
            const reservation = await reservationRepo.findScreeningEventReservationById({
                id: req.params.id
            });

            res.json(reservation);
        } catch (error) {
            next(error);
        }
    }
);

reservationsRouter.put(
    '/eventReservation/screeningEvent/:id/checkedIn',
    permitScopes(['admin', 'reservations.checkedIn']),
    validator,
    async (req, res, next) => {
        try {
            const reservationRepo = new chevre.repository.Reservation(chevre.mongoose.connection);
            const taskRepo = new chevre.repository.Task(chevre.mongoose.connection);

            const reservation = await reservationRepo.checkIn({
                id: req.params.id
            });

            const aggregateTask: chevre.factory.task.aggregateScreeningEvent.IAttributes = {
                name: chevre.factory.taskName.AggregateScreeningEvent,
                status: chevre.factory.taskStatus.Ready,
                runsAt: new Date(),
                remainingNumberOfTries: 3,
                lastTriedAt: null,
                numberOfTried: 0,
                executionResults: [],
                data: {
                    typeOf: reservation.reservationFor.typeOf,
                    id: reservation.reservationFor.id
                }
            };
            await taskRepo.save(aggregateTask);

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

reservationsRouter.put(
    '/eventReservation/screeningEvent/:id/attended',
    permitScopes(['admin', 'reservations.attended']),
    validator,
    async (req, res, next) => {
        try {
            const reservationRepo = new chevre.repository.Reservation(chevre.mongoose.connection);
            const taskRepo = new chevre.repository.Task(chevre.mongoose.connection);

            const reservation = await reservationRepo.attend({
                id: req.params.id
            });

            const aggregateTask: chevre.factory.task.aggregateScreeningEvent.IAttributes = {
                name: chevre.factory.taskName.AggregateScreeningEvent,
                status: chevre.factory.taskStatus.Ready,
                runsAt: new Date(),
                remainingNumberOfTries: 3,
                lastTriedAt: null,
                numberOfTried: 0,
                executionResults: [],
                data: {
                    typeOf: reservation.reservationFor.typeOf,
                    id: reservation.reservationFor.id
                }
            };
            await taskRepo.save(aggregateTask);

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

export default reservationsRouter;
