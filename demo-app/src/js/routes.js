export default router => {

    router.route('', 'dashboard', {uses: 'Page@index'});

    router.resource('page');
    router.resource('article');
    router.resource('user');
    router.resource('tag');
    router.resource('category');

    router.route('media/create-image', 'resource.media.createImage', {uses: 'Media@createImage'});
    router.route('media/create-video-embed', 'resource.media.createVideoEmbed', {uses: 'Media@createVideoEmbed'});
    router.route('media/create-file', 'resource.media.createFile', {uses: 'Media@createFile'});
    router.route('media/:id', 'resource.media.edit', {uses: 'Media@edit'});
    router.route('media', 'resource.media.index', {uses: 'Media@index'});

    router.route('my-settings', 'mySettings', {uses: 'MySettings'});
    router.route('login', 'auth', {uses: 'Auth'});

    router.route('*path', 'error', {uses: 'Error@pageNotFound'});

};
