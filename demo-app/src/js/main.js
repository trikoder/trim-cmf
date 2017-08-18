import FakeServer from 'fake-json-api-server';
import fakeServerConfig from '../../../fakeServerConfig';
import app from 'js/app';
import services from 'js/services';
import routes from 'js/routes';
import translations from 'js/lang/english';
import 'scss/main.scss';

new FakeServer(fakeServerConfig).pretender.post('/api/media/upload', () => {
    return [200, {'content-type': 'application/javascript', Location: '/api/media/1'}, ''];
});

app
    .setBootData({
        baseUrl: '/demo-app/',
        assetsBuildPath: '/demo-app/dist/',
        googleMapsApiKey: 'AIzaSyBVqg9EqOqARXVIaKRSC7pJpVeHKDRoU2I',
        usesPushState: false
    })
    .registerServices(services)
    .registerRoutes(routes)
    .loadTranslations(translations, 'en')
    .start();
