import BaseMainNavigation from 'js/components/baseMainNavigation';
import FakeServer from 'fake-json-api-server';
import serviceContainer from 'js/library/serviceContainer';

export default BaseMainNavigation.extend({

    getNavigationItems: router => [

        {
            name: 'Pages',
            alias: 'page',
            url: router.url('resource.page.index'),
            iconClass: 'Home'
        },

        {
            name: 'Articles',
            alias: 'article',
            url: router.url('resource.article.index'),
            iconClass: 'Copy'
        },

        {
            name: 'Media',
            alias: 'media',
            url: router.url('resource.media.index'),
            iconClass: 'Image'
        },

        {
            name: 'Users',
            alias: 'user',
            url: router.url('resource.user.index'),
            iconClass: 'User2'
        },

        {
            name: 'Misc',
            iconClass: 'ThreeDots',
            subItems: [

                {
                    name: 'Categories',
                    alias: 'category',
                    url: router.url('resource.category.index')
                },

                {
                    name: 'Tags',
                    alias: 'tag',
                    url: router.url('resource.tag.index')
                }

            ]
        }

    ],

    getUserNavigationItems: router => [

        {
            name: 'My settings',
            url: router.url('mySettings'),
            appLink: true
        },

        {
            name: 'Reset demo data',
            action: function(mainNavigation) {

                FakeServer.resetData();
                mainNavigation.close();
                router.navigateToRoute('resource.page.index', null, null, true);

            }
        },

        {
            name: 'Show search <span style="opacity: 0.4;">(Shift + l)</span>',
            action: function(mainNavigation) {

                mainNavigation.showSearch().close();

            }
        },

        {
            name: 'Logout',
            action: function() {

                serviceContainer.get('AuthController', AuthController => {
                    AuthController.logout();
                });

            }
        }

    ],

    getProjectCaption: () => 'trikoder cms',

    getUserCaption: () => 'Demo user'

});
