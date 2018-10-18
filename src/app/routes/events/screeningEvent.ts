/**
 * 上映イベントルーター
 */
import * as chevre from '@toei-jp/chevre-domain';
import { Router } from 'express';
import { CREATED, NO_CONTENT } from 'http-status';
import * as moment from 'moment';

import * as redis from '../../../redis';
import authentication from '../../middlewares/authentication';
import permitScopes from '../../middlewares/permitScopes';
import validator from '../../middlewares/validator';

const screeningEventRouter = Router();
screeningEventRouter.use(authentication);
screeningEventRouter.post(
    '',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const eventAttributes: chevre.factory.event.screeningEvent.IAttributes = {
                typeOf: chevre.factory.eventType.ScreeningEvent,
                doorTime: (req.body.doorTime !== undefined) ? moment(req.body.doorTime).toDate() : undefined,
                startDate: moment(req.body.startDate).toDate(),
                endDate: moment(req.body.endDate).toDate(),
                ticketTypeGroup: req.body.ticketTypeGroup,
                workPerformed: req.body.workPerformed,
                location: req.body.location,
                superEvent: req.body.superEvent,
                name: req.body.name,
                eventStatus: req.body.eventStatus,
                saleStartDate: moment(req.body.saleStartDate).toDate(),
                mvtkExcludeFlg: req.body.mvtkExcludeFlg,
                maxSeatNumber: req.body.maxSeatNumber,
                preSaleFlg: req.body.preSaleFlg
            };
            const eventRepo = new chevre.repository.Event(chevre.mongoose.connection);
            const event = await eventRepo.saveScreeningEvent({ attributes: eventAttributes });
            res.status(CREATED).json(event);
        } catch (error) {
            next(error);
        }
    }
);
screeningEventRouter.post(
    '/saveMultiple',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const eventAttributes: chevre.factory.event.screeningEvent.IAttributes[] = req.body.attributes.map((
                attr: chevre.factory.event.screeningEvent.IAttributes
            ) => ({
                typeOf: chevre.factory.eventType.ScreeningEvent,
                doorTime: moment(attr.doorTime).toDate(),
                startDate: moment(attr.startDate).toDate(),
                endDate: moment(attr.endDate).toDate(),
                ticketTypeGroup: attr.ticketTypeGroup,
                workPerformed: attr.workPerformed,
                location: attr.location,
                superEvent: attr.superEvent,
                name: attr.name,
                eventStatus: attr.eventStatus,
                saleStartDate: moment(attr.saleStartDate).toDate(),
                mvtkExcludeFlg: attr.mvtkExcludeFlg,
                maxSeatNumber: attr.maxSeatNumber,
                onlineDisplayStartDate: moment(attr.onlineDisplayStartDate).toDate(),
                endSaleTimeAfterScreening: attr.endSaleTimeAfterScreening,
                preSaleFlg: attr.preSaleFlg
            }));
            const eventRepo = new chevre.repository.Event(chevre.mongoose.connection);
            const events = await eventRepo.saveMultipleScreeningEvent(eventAttributes);
            res.status(CREATED).json(events);
        } catch (error) {
            next(error);
        }
    }
);
screeningEventRouter.get(
    '',
    permitScopes(['admin', 'events', 'events.read-only']),
    (req, __, next) => {
        req.checkQuery('inSessionFrom').optional().isISO8601().withMessage('inSessionFrom must be ISO8601 timestamp');
        req.checkQuery('inSessionThrough').optional().isISO8601().withMessage('inSessionThrough must be ISO8601 timestamp');
        req.checkQuery('startFrom').optional().isISO8601().withMessage('startFrom must be ISO8601 timestamp');
        req.checkQuery('startThrough').optional().isISO8601().withMessage('startThrough must be ISO8601 timestamp');
        req.checkQuery('endFrom').optional().isISO8601().withMessage('endFrom must be ISO8601 timestamp');
        req.checkQuery('endThrough').optional().isISO8601().withMessage('endThrough must be ISO8601 timestamp');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const eventRepo = new chevre.repository.Event(chevre.mongoose.connection);
            const aggregationRepo = new chevre.repository.aggregation.ScreeningEvent(redis.getClient());
            const searchCoinditions: chevre.factory.event.screeningEvent.ISearchConditions = {
                // tslint:disable-next-line:no-magic-numbers
                limit: (req.query.limit !== undefined) ? Math.min(req.query.limit, 100) : 100,
                page: (req.query.page !== undefined) ? Math.max(req.query.page, 1) : 1,
                sort: req.query.sort,
                name: req.query.name,
                inSessionFrom: (req.query.inSessionFrom !== undefined) ? moment(req.query.inSessionFrom).toDate() : undefined,
                inSessionThrough: (req.query.inSessionThrough !== undefined) ? moment(req.query.inSessionThrough).toDate() : undefined,
                startFrom: (req.query.startFrom !== undefined) ? moment(req.query.startFrom).toDate() : undefined,
                startThrough: (req.query.startThrough !== undefined) ? moment(req.query.startThrough).toDate() : undefined,
                endFrom: (req.query.endFrom !== undefined) ? moment(req.query.endFrom).toDate() : undefined,
                endThrough: (req.query.endThrough !== undefined) ? moment(req.query.endThrough).toDate() : undefined,
                eventStatuses: (Array.isArray(req.query.eventStatuses)) ? req.query.eventStatuses : undefined,
                superEvent: req.query.superEvent
            };
            let events = await eventRepo.searchScreeningEvents(searchCoinditions);
            const totalCount = await eventRepo.countScreeningEvents(searchCoinditions);
            // 集計情報を追加
            const aggregations = await aggregationRepo.findAll();
            events = events.map((e) => {
                return { ...e, ...aggregations[e.id] };
            });
            res.set('X-Total-Count', totalCount.toString());
            res.json(events);
        } catch (error) {
            next(error);
        }
    }
);
screeningEventRouter.get(
    '/countTicketTypePerEvent',
    permitScopes(['admin']),
    (req, __, next) => {
        req.checkQuery('startFrom').optional().isISO8601().withMessage('startFrom must be ISO8601 timestamp');
        req.checkQuery('startThrough').optional().isISO8601().withMessage('startThrough must be ISO8601 timestamp');
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const reservationRepo = new chevre.repository.Reservation(chevre.mongoose.connection);
            const events = await chevre.service.event.countTicketTypePerEvent({
                // tslint:disable-next-line:no-magic-numbers
                limit: (req.query.limit !== undefined) ? Math.min(req.query.limit, 100) : 100,
                page: (req.query.page !== undefined) ? Math.max(req.query.page, 1) : 1,
                id: req.query.id,
                startFrom: (req.query.startFrom !== undefined) ? moment(req.query.startFrom).toDate() : undefined,
                startThrough: (req.query.startThrough !== undefined) ? moment(req.query.startThrough).toDate() : undefined
            })({
                reservation: reservationRepo
            });
            res.json(events);
        } catch (error) {
            next(error);
        }
    }
);
screeningEventRouter.get(
    '/:id',
    permitScopes(['admin', 'events', 'events.read-only']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const eventRepo = new chevre.repository.Event(chevre.mongoose.connection);
            const event = await eventRepo.findById({
                typeOf: chevre.factory.eventType.ScreeningEvent,
                id: req.params.id
            });
            res.json(event);
        } catch (error) {
            next(error);
        }
    }
);
screeningEventRouter.put(
    '/:id',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const eventAttributes: chevre.factory.event.screeningEvent.IAttributes = {
                typeOf: chevre.factory.eventType.ScreeningEvent,
                doorTime: (req.body.doorTime !== undefined) ? moment(req.body.doorTime).toDate() : undefined,
                startDate: moment(req.body.startDate).toDate(),
                endDate: moment(req.body.endDate).toDate(),
                ticketTypeGroup: req.body.ticketTypeGroup,
                workPerformed: req.body.workPerformed,
                location: req.body.location,
                superEvent: req.body.superEvent,
                name: req.body.name,
                eventStatus: req.body.eventStatus,
                // releaseTime: (req.body.releaseTime !== undefined) ? moment(req.body.releaseTime).toDate() : undefined,
                mvtkExcludeFlg: req.body.mvtkExcludeFlg,
                saleStartDate: req.body.saleStartDate,
                onlineDisplayStartDate: req.body.onlineDisplayStartDate,
                maxSeatNumber: req.body.maxSeatNumber,
                preSaleFlg: req.body.preSaleFlg
            };
            const eventRepo = new chevre.repository.Event(chevre.mongoose.connection);
            await eventRepo.saveScreeningEvent({ id: req.params.id, attributes: eventAttributes });
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);
screeningEventRouter.delete(
    '/:id',
    permitScopes(['admin']),
    (_, __, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const eventRepo = new chevre.repository.Event(chevre.mongoose.connection);
            await eventRepo.deleteById({
                typeOf: chevre.factory.eventType.ScreeningEvent,
                id: req.params.id
            });
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);
/**
 * 上映イベントに対する座席オファー検索
 */
screeningEventRouter.get(
    '/:id/offers',
    permitScopes(['admin', 'events', 'events.read-only']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const eventAvailabilityRepo = new chevre.repository.itemAvailability.ScreeningEvent(redis.getClient());
            const eventRepo = new chevre.repository.Event(chevre.mongoose.connection);
            const placeRepo = new chevre.repository.Place(chevre.mongoose.connection);
            const event = await eventRepo.findById({
                typeOf: chevre.factory.eventType.ScreeningEvent,
                id: req.params.id
            });
            const unavailableOffers = await eventAvailabilityRepo.findUnavailableOffersByEventId({ eventId: req.params.id });
            const movieTheater = await placeRepo.findMovieTheaterByBranchCode(event.superEvent.location.branchCode);
            const screeningRoom = <chevre.factory.place.movieTheater.IScreeningRoom>movieTheater.containsPlace.find(
                (p) => p.branchCode === event.location.branchCode
            );
            if (screeningRoom === undefined) {
                throw new chevre.factory.errors.NotFound('Screening room');
            }
            const screeningRoomSections = screeningRoom.containsPlace;
            const offers: chevre.factory.event.screeningEvent.IOffer[] = screeningRoomSections;
            offers.forEach((offer) => {
                const seats = offer.containsPlace;
                const seatSection = offer.branchCode;
                seats.forEach((seat) => {
                    const seatNumber = seat.branchCode;
                    const unavailableOffer = unavailableOffers.find(
                        (o) => o.seatSection === seatSection && o.seatNumber === seatNumber
                    );
                    seat.offers = [{
                        typeOf: 'Offer',
                        availability: (unavailableOffer !== undefined)
                            ? chevre.factory.itemAvailability.OutOfStock
                            : chevre.factory.itemAvailability.InStock
                    }];
                });
            });
            res.json(screeningRoomSections);
        } catch (error) {
            next(error);
        }
    }
);
/**
 * 上映イベントに対するチケットオファー検索
 */
screeningEventRouter.get(
    '/:id/offers/ticket',
    permitScopes(['admin', 'events', 'events.read-only']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const eventRepo = new chevre.repository.Event(chevre.mongoose.connection);
            const priceSpecificationRepo = new chevre.repository.PriceSpecification(chevre.mongoose.connection);
            const ticketTypeRepo = new chevre.repository.TicketType(chevre.mongoose.connection);
            const offers = await chevre.service.offer.searchScreeningEventTicketOffers({ eventId: req.params.id })({
                event: eventRepo,
                priceSpecification: priceSpecificationRepo,
                ticketType: ticketTypeRepo
            });
            res.json(offers);
        } catch (error) {
            next(error);
        }
    }
);
export default screeningEventRouter;
