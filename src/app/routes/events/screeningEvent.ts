/**
 * 上映イベントルーター
 */
import * as chevre from '@toei-jp/chevre-domain';
import { Router } from 'express';
// tslint:disable-next-line:no-submodule-imports
import { body, query } from 'express-validator/check';
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
    ...[
        body('typeOf').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('doorTime').optional().isISO8601().toDate(),
        body('startDate').not().isEmpty().withMessage((_, options) => `${options.path} is required`)
            .isISO8601().toDate(),
        body('endDate').not().isEmpty().withMessage((_, options) => `${options.path} is required`)
            .isISO8601().toDate(),
        body('ticketTypeGroup').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('workPerformed').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('location').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('superEvent').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('name').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('eventStatus').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('offers').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('offers.availabilityStarts').not().isEmpty().isISO8601().toDate(),
        body('offers.availabilityEnds').not().isEmpty().isISO8601().toDate(),
        body('offers.validFrom').not().isEmpty().isISO8601().toDate(),
        body('offers.validThrough').not().isEmpty().isISO8601().toDate(),
        body('saleStartDate').optional().isISO8601().toDate()
    ],
    validator,
    async (req, res, next) => {
        try {
            const eventAttributes: chevre.factory.event.screeningEvent.IAttributes = req.body;
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
                ...attr,
                typeOf: chevre.factory.eventType.ScreeningEvent,
                doorTime: moment(attr.doorTime).toDate(),
                startDate: moment(attr.startDate).toDate(),
                endDate: moment(attr.endDate).toDate(),
                saleStartDate: moment(attr.saleStartDate).toDate(),
                onlineDisplayStartDate: moment(attr.onlineDisplayStartDate).toDate()
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
    ...[
        query('inSessionFrom').optional().isISO8601().toDate(),
        query('inSessionThrough').optional().isISO8601().toDate(),
        query('startFrom').optional().isISO8601().toDate(),
        query('startThrough').optional().isISO8601().toDate(),
        query('endFrom').optional().isISO8601().toDate(),
        query('endThrough').optional().isISO8601().toDate(),
        query('offers.availableFrom').optional().isISO8601().toDate(),
        query('offers.availableThrough').optional().isISO8601().toDate(),
        query('offers.validFrom').optional().isISO8601().toDate(),
        query('offers.validThrough').optional().isISO8601().toDate()
    ],
    validator,
    async (req, res, next) => {
        try {
            const eventRepo = new chevre.repository.Event(chevre.mongoose.connection);
            const searchCoinditions: chevre.factory.event.screeningEvent.ISearchConditions = {
                ...req.query,
                // tslint:disable-next-line:no-magic-numbers
                limit: (req.query.limit !== undefined) ? Math.min(req.query.limit, 100) : 100,
                page: (req.query.page !== undefined) ? Math.max(req.query.page, 1) : 1
            };
            const events = await eventRepo.searchScreeningEvents(searchCoinditions);
            const totalCount = await eventRepo.countScreeningEvents(searchCoinditions);
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
    ...[
        body('typeOf').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('doorTime').optional().isISO8601().toDate(),
        body('startDate').not().isEmpty().withMessage((_, options) => `${options.path} is required`)
            .isISO8601().toDate(),
        body('endDate').not().isEmpty().withMessage((_, options) => `${options.path} is required`)
            .isISO8601().toDate(),
        body('ticketTypeGroup').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('workPerformed').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('location').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('superEvent').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('name').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('eventStatus').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('offers').not().isEmpty().withMessage((_, options) => `${options.path} is required`),
        body('offers.availabilityStarts').not().isEmpty().isISO8601().toDate(),
        body('offers.availabilityEnds').not().isEmpty().isISO8601().toDate(),
        body('offers.validFrom').not().isEmpty().isISO8601().toDate(),
        body('offers.validThrough').not().isEmpty().isISO8601().toDate(),
        body('saleStartDate').optional().isISO8601().toDate()
    ],
    validator,
    async (req, res, next) => {
        try {
            const eventAttributes: chevre.factory.event.screeningEvent.IAttributes = req.body;
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
            const offers: chevre.factory.event.screeningEvent.IScreeningRoomSectionOffer[] = screeningRoomSections;
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
                        priceCurrency: chevre.factory.priceCurrency.JPY,
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
