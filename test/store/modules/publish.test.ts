import { ActionContext } from 'vuex';
import { RootState } from 'store';

import { expect, spy } from 'test/libs/chai';
import { axiosMock } from 'test/libs/axios';

import { actionContextMockBuilder, nuxtAxiosMockBuilder } from 'test/utils';

import * as publish from 'store/modules/publish';

let state: publish.State;
let actionContext: ActionContext<publish.State, RootState>;
let actions: publish.Actions<publish.State, RootState>;

describe('store publish', () => {

    beforeEach(() => {
        state = publish.state();
        actionContext = actionContextMockBuilder<publish.State>(state);
        spy(actionContext, 'commit');
        actions = nuxtAxiosMockBuilder(publish.actions);
    });

    describe('when build package', () => {
        it('should update archivelink', async () => {
            const manifestId = 'manifestId';
            const serviceworker = 1;
            const platform = 'web';
            const status = 200;

            actionContext.rootState.generator.manifestId = manifestId;
            actionContext.rootState.serviceworker.serviceworker = serviceworker;

            axiosMock.onPost(`${process.env.apiUrl}/manifests/${manifestId}/build?ids=${serviceworker}`, {'platforms': ['web'], 'dirSuffix': 'web'}).reply(status);

            await actions.build(actionContext, { platform: platform });

            expect(actionContext.commit).to.have.been.calledWith(publish.types.UPDATE_ARCHIVELINK);
        });

        it('should throw an error if params are incorrect and API respond with error', () => {
            const manifestId = '-1';
            const serviceworker = -1;
            const platform = 'web';
            const status = 500;

            actionContext.rootState.generator.manifestId = manifestId;
            actionContext.rootState.serviceworker.serviceworker = serviceworker;

            axiosMock.onPost(`${process.env.apiUrl}/manifests/${manifestId}/build?ids=${serviceworker}`, {'platforms': ['web'], 'dirSuffix': 'web'}).reply(status);

            expect(actions.build(actionContext, { platform: platform })).to.eventually.throw();
        });

        it('should throw an error if platform parameter is empty', () => {
            expect(actions.build(actionContext, { platform: ''})).to.eventually.throw();
        });
    });

    describe('when build appx package', () => {
        it('should update appxlink', async () => {
            const manifestId = 'manifestId';
            const params = {
                publisher: 'test1',
                publisher_id: 'test2',
                package: 'test3',
                version: 'test4'
            };
            const status = 200;

            actionContext.rootState.generator.manifestId = manifestId;
            axiosMock.onPost(`${process.env.apiUrl}/manifests/${manifestId}/appx`).reply(status);

            await actions.buildAppx(actionContext, params);

            expect(actionContext.commit).to.have.been.calledWith(publish.types.UPDATE_APPXLINK);
        });

        it('should update error if params are incorrect and API respond with error', async () => {
            const manifestId = '-1';
            const params = {
                publisher: 'test1',
                publisher_id: 'test2',
                package: 'test3',
                version: 'test4'
            };
            const status = 500;

            actionContext.rootState.generator.manifestId = manifestId;

            axiosMock.onPost(`${process.env.apiUrl}/manifests/${manifestId}/appx`).reply(status);

            expect(actions.buildAppx(actionContext, params)).to.eventually.throw();
        });

        it('should update error if platform parameter is empty', () => {
            const params = {
                publisher: null,
                publisher_id: null,
                package: null,
                version: null
            };

            expect(actions.buildAppx(actionContext, params)).to.eventually.throw();
        });

        afterEach(() => {
            axiosMock.reset();
        });
    });

});