// tslint:disable:no-implicit-dependencies
/**
 * スコープ許可ミドルウェアテスト
 */
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as permitScopes from './permitScopes';

let sandbox: sinon.SinonSandbox;

describe('permitScopes.default()', () => {
    let resourceServerIdentifier = process.env.RESOURECE_SERVER_IDENTIFIER;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        resourceServerIdentifier = process.env.RESOURECE_SERVER_IDENTIFIER;
    });

    afterEach(() => {
        sandbox.restore();
        process.env.RESOURECE_SERVER_IDENTIFIER = resourceServerIdentifier;
    });

    it('RESOURECE_SERVER_IDENTIFIERが未定義であればエラーパラメーターと共にnextが呼ばれるはず', async () => {
        delete process.env.RESOURECE_SERVER_IDENTIFIER;
        const scopes = ['scope'];
        const params = {
            req: { user: { scopes: [] } },
            res: {},
            next: () => undefined
        };

        sandbox.mock(params).expects('next').once()
            .withExactArgs(sinon.match.instanceOf(Error));

        const result = await permitScopes.default(scopes)(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('スコープが十分であればエラーなしでnextが呼ばれるはず', async () => {
        const scopes = ['scope'];
        const params = {
            req: { user: { scopes: scopes.map((scope) => `${process.env.RESOURECE_SERVER_IDENTIFIER}/${scope}`) } },
            res: {},
            next: () => undefined
        };

        sandbox.mock(params).expects('next').once()
            .withExactArgs();

        const result = await permitScopes.default(scopes)(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('スコープ不足であればエラーパラメーターと共にnextが呼ばれるはず', async () => {
        const scopes = ['scope'];
        const params = {
            req: { user: { scopes: [] } },
            res: {},
            next: () => undefined
        };

        sandbox.mock(params).expects('next').once()
            .withExactArgs(sinon.match.instanceOf(Error));

        const result = await permitScopes.default(scopes)(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('isScopesPermittedがエラーを投げればエラーパラメーターと共にnextが呼ばれるはず', async () => {
        const scopes = ['scope'];
        const params = {
            req: { user: { scopes: '' } },
            res: {},
            next: () => undefined
        };

        sandbox.mock(params).expects('next').once()
            .withExactArgs(sinon.match.instanceOf(Error));

        const result = await permitScopes.default(scopes)(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
