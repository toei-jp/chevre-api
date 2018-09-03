/**
 * バリデーターミドルウェア
 * リクエストのパラメータ(query strings or body parameters)に対するバリデーション
 */
import * as chevre from '@toei-jp/chevre-domain';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { } from 'express-validator'; // 型を読み込んでおかないとテストコードでコンパイルエラー発生
import { BAD_REQUEST } from 'http-status';

import { APIError } from '../error/api';

const debug = createDebug('chevre-api:middlewares');

export default async (req: Request, __: Response, next: NextFunction) => {
    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        const errors = validatorResult.array().map((mappedRrror) => {
            return new chevre.factory.errors.Argument(mappedRrror.param, mappedRrror.msg);
        });
        debug('validation result not empty...', errors);

        next(new APIError(BAD_REQUEST, errors));
    } else {
        next();
    }
};
