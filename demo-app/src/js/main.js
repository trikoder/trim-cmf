import app from 'js/app';
import services from 'js/services';
import routes from 'js/routes';
import translations from 'js/lang/english';
import 'scss/main.scss';
import 'api-server';

app
    .setBootData({
        baseUrl: process.env.BASE_URL,
        baseApiUrl: process.env.BASE_API_URL,
        assetsBuildPath: process.env.ASSET_PATH,
        googleMapsApiKey: 'AIzaSyBVqg9EqOqARXVIaKRSC7pJpVeHKDRoU2I',
        usesPushState: false,
        resourceToApiMap: {
            userContactEntry: 'userContactEntry'
        }
    })
    .registerServices(services)
    .registerRoutes(routes)
    .useAuthController('Auth')
    .loadTranslations(translations, 'en')
    .start();
