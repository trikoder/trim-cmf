import BaseAuth from 'js/controllers/baseAuth';
import api from 'js/library/api';

export default BaseAuth.extend({}, {

    loginWithCredentials(credentials, done, fail) {

        if (credentials.username.length && credentials.password.length) {
            localStorage.setItem('accessToken', 'testToken');
            done();
        } else {
            fail('Login failed');
        }

        return this;

    },

    checkAuthState(onComplete) {

        onComplete(Boolean(localStorage.getItem('accessToken')));
        return this;

    },

    afterAuth(done) {

        api.requestDefaults.headers = {
            accesstoken: localStorage.getItem('accessToken')
        };

        done();

    },

    getAuthUrl(router) {

        return router.url('auth');

    },

    logout() {

        localStorage.removeItem('accessToken');
        api.requestDefaults = {};
        this.navigateToAuthUrl(true);

        return this;

    }

});
