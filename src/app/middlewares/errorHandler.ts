/**
 * エラーハンドラーミドルウェア
 */
import * as chevre from '@toei-jp/chevre-domain';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import {
    BAD_REQUEST,
    CONFLICT, FORBIDDEN,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    NOT_IMPLEMENTED,
    SERVICE_UNAVAILABLE,
    TOO_MANY_REQUESTS,
    UNAUTHORIZED
} from 'http-status';

import { APIError } from '../error/api';

const debug = createDebug('chevre-api:middlewares');

export default (err: any, __: Request, res: Response, next: NextFunction) => {
    debug(err);
    // logger.error('chevre-api:middleware', err);
    if (res.headersSent) {
        next(err);

        return;
    }

    let apiError: APIError;
    if (err instanceof APIError) {
        apiError = err;
    } else {
        // エラー配列が入ってくることもある
        if (Array.isArray(err)) {
            apiError = new APIError(chevreError2httpStatusCode(err[0]), err);
        } else if (err instanceof chevre.factory.errors.Chevre) {
            apiError = new APIError(chevreError2httpStatusCode(err), [err]);
        } else {
            // 500
            apiError = new APIError(INTERNAL_SERVER_ERROR, [new chevre.factory.errors.Chevre(<any>'InternalServerError', err.message)]);
        }
    }

    res.status(apiError.code).json({
        error: apiError.toObject()
    });
};

/**
 * ChevreエラーをHTTPステータスコードへ変換する
 * @param err Chevreエラー
 */
function chevreError2httpStatusCode(err: chevre.factory.errors.Chevre) {
    let statusCode = BAD_REQUEST;

    switch (true) {
        // 401
        case (err instanceof chevre.factory.errors.Unauthorized):
            statusCode = UNAUTHORIZED;
            break;

        // 403
        case (err instanceof chevre.factory.errors.Forbidden):
            statusCode = FORBIDDEN;
            break;

        // 404
        case (err instanceof chevre.factory.errors.NotFound):
            statusCode = NOT_FOUND;
            break;

        // 409
        case (err instanceof chevre.factory.errors.AlreadyInUse):
            statusCode = CONFLICT;
            break;

        // 429
        case (err instanceof chevre.factory.errors.RateLimitExceeded):
            statusCode = TOO_MANY_REQUESTS;
            break;

        // 502
        case (err instanceof chevre.factory.errors.NotImplemented):
            statusCode = NOT_IMPLEMENTED;
            break;

        // 503
        case (err instanceof chevre.factory.errors.ServiceUnavailable):
            statusCode = SERVICE_UNAVAILABLE;
            break;

        // 400
        default:
            statusCode = BAD_REQUEST;
    }

    return statusCode;
}
