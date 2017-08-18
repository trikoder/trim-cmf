# Core concepts and api
Understanding of how core components work is essential for building applications with Trim UI CMF.
This chapter provides insight into resource controller, resource list, resource edit, router, navigation, service container and application object.

## Resource controller
Resource controller component is a central place to define user interface for given resource.
Here we define how resource is browsed, filtered and sorted in list, what form fields are rendered when resource is created or updated.

In most use cases controller looks like a simple configuration file.
This configuration based architecture delegates most of the work to components that are composed out of our sight.
Resource controller is a container component which calls service components for listing and editing resources who build their own component subtrees - all that is abstracted from user via simple and easy to use api.

All resource controllers share same basic skeleton. We define what resource type controller is handling (resourceName) and implement methods for resource listing (setupList) and resource editing (setupEdit):

```js
var BaseResource = require('js/controllers/baseResource')

module.exports = BaseResource.extend({

    resourceName: 'tag',

    setupList: function(listHandler) {
        // how is resource listed?
    },

    setupEdit: function(editHandler, method, id) {
        // how is resource edited?
    }

});
```

A list of controller properties and methods is examined bellow:

---

### resourceName
Controller property where we name the resource handled (tag, article, page...)
```js
resourceName: 'tag',
```

---

### resourceCaption
Controller property where we define resource caption mapping, default value is null. It is currently used only in mass actions component as a value for 'mapSelectedCaptionsTo' (if it is null, then it fallbacks to 'ID') so it's recommended to always set resource caption value.
```js
resourceCaption: 'title',
```

---

### createRequiresDraft
Property where we define if draft resource is needed when resource is created.
When createRequiresDraft is set to true controller will save empty resource object before creating interface is displayed.
Saved draft resource will recieve id and be able to support related objects. False is default value.
```js
createRequiresDraft: false,
```

---

### setupList
Controller method where we define how resource is browsed, filtered and sorted in list view.
Controller injects current [listHandler](#resource-list) instance when method is called.

```js
setupList: function(listHandler) {

    this.addCreateControl('Create new tag');

    listHandler.addFilter(TextInput, {
        name: 'title',
        label: 'Title'
    });

    listHandler.addItem(TextListItem, {
        caption: 'ID',
        mapTo: 'id'
    });

    listHandler.addItem(LinkListItem, {
        caption: 'Title',
        mapTo: 'title',
        action: 'editItem'
    });
},
```
---

### setupEdit
Controller method where we define form fields rendered when resource is created or updated.
Controller injects current [editHandler](#resource-edit) instance when method is called, method (edit or create) and resource id when called in editing context.

```js
setupEdit: function(editHandler, method, id) {

    this.addToIndexControl().addSaveControl();

    editHandler.addField(TextInput, {
        label: 'Title',
        name: 'title'
    });

}
```
---

### openIndex
Controller instance method which opens resource index or listing.

```js
controller.openIndex(params);
```
---

### openEdit
Controller instance method which opens resource editing.

```js
controller.openEdit(id);
```
---

### openCreate
Controller instance method which opens resource create.

```js
controller.openCreate();
```
---

### addCreateControl
Controller instance method which adds resource create control.

```js
controller.addCreateControl(caption);
```
---

### addSaveControl
Controller instance method which adds resource save control.

```js
controller.addSaveControl(caption);
```
---

### addToIndexControl
Controller instance method which adds resource list control.

```js
controller.addToIndexControl();
```
---

### addControl
Controller instance method which adds generic resource control.

```js
controller.addControl({
    caption: 'myControl',
    url: this.getCreateUrl(),
    className: 'accented iconPlus',
    action: this.openCreate
});
```
---

### addDropdownControl
Controller instance method which adds generic dropdown resource control.

```js
controller.addDropdownControl(params);
```


## Resource list
Resource list is component responsible for handling resource browsing, filtering and sorting.
Examine [list elements](list-elements) chapter to find out how each list element is configured.

---

### addItem
Method for defining what elements are displayed when resource is listed:

```js
listHandler.addItem(TextListItem, {
    caption: 'title',
    mapTo: 'title'
});
```
---

### addFilter
Method for adding filter form elements when resource is listed:

```js
listHandler.addFilter(TextInput, {
    name: 'title',
    label: 'Title'
});
```
---

### addSort
Method for adding sort options on resource list:

```js
listHandler.addSort([
    {label: 'By title', field: 'title'},
    {label: 'By date', field: '-date'}
]);
```
---

### setTemplate
Method for choosing which template is used for resource listing ('table' and 'cards' are currently supported).

```js
listHandler.setTemplate('cards');
```
---

### addMassAction
Method for adding mass actions to resource list.

```js
listHandler.addMassAction({
    caption: 'Publish',
    updateAttributes: {published: true}
});
```

## Resource edit
Resource edit is component responsible for handling how resource is created or updated.

---

### addField
Method for defining what form elements are mapped to resource attributes and relations when resource is edited or created.
Examine [form elements](form-elements) chapter to find out how each form element is configured.

```js
editHandler.addField(TextInput, {
    label: 'Title',
    name: 'title'
});
```
---

### setLayout
Method for defining editing and creating layout. Supports tabs, regions and groups.

```js
//define layout with main and side region
editHandler.setLayout({regions: ['main', 'side']});

// assign form element to layout position with layoutReference
editHandler.addField(TextInput, {
    label: 'Title',
    name: 'title',
    layoutReference: 'mainRegion'
});
```
Complex layout with tabs, regions and groups is defined like so:

```js
editHandler.setLayout({
    tabs: [{
        name: 'mainContent',
        caption: 'Content and settings',
        regions: {
            main: {
                groups: [{className: 'basicData'}]
            },
            side: {
                groups: [
                    {className: 'layoutGroupType2'},
                    {className: 'layoutGroupType2'},
                    {className: 'layoutGroupType2'},
                    {className: 'layoutGroupType2'}
                ]
            }
        }
    }, {
        name: 'seo',
        caption: 'SEO & meta data'
    }]
});

// assign form element to layout position with layoutReference
editHandler.addField(TextInput, {
    label: 'Title',
    name: 'title',
    layoutReference: 'mainContent.sideRegion.group4'
});
```

## Services
Application utilizes simple service container to register and locate components and services.
Router, application container, main navigation, application search and error controller are components registered and retrieved from service container by default.

All of your resource controllers should also be registered as services.
We encourage you to do so with require.ensure to utilize webpack code splitting and load controller code only when it is requested.

A typical service container with navigation and few registered controllers looks something like this:

```js
module.exports = {
    MainNavigation: function(callback) {
        callback(require('js/mainNavigation'));
    },
    TagController: function(callback) {
        require.ensure([], function() {
            callback(require('js/controllers/tag'));
        });
    },
    PageController: function(callback) {
        require.ensure([], function() {
            callback(require('js/controllers/page'));
        });
    }
};
```
If you need to access service container manually somewhere in your code:
```js
var serviceContaner = require('js/library/serviceContainer');

serviceContainer.register('myService', function() {
    return {foo: 'bar'};
});

serviceContainer.get('myService', function(myService) {
    console.log(myService.foo); // outputs bar
});
```

## Router
Application utilizes extended [Backbone named router](https://github.com/dbrekalo/backbone-named-routes) for linking and routing needs.
Your application routes typically look something like this:

```js
module.exports = function(router) {

    router.resource('article');
    router.resource('tag');

    router.route('', 'dashboard', {uses: 'Article@index'});
    router.route('my-settings', 'mySettings', {uses: 'MySettings'});

};
```

---

### Router.resource
Router resource method is a shortcut for defining 3 most used routes for resource:

```js
router.resource('tag');
// ... is equivalent to...
router.route('tag/create', 'resource.tag.create', {uses: 'Tag@create'});
router.route('tag/:id', 'resource.tag.edit', {uses: 'Tag@edit'});
router.route('tag', 'resource.tag.index', {uses:'Tag@index'});
```
For each url pattern (tag/:id) we define route name (resource.tag.edit) and pointer to controller method (Tag@edit) invoked when route is matched.

---

### Getting router instance
If you need access to router instance somewhere in your application code:
```js
var router = require('js/app').get('router');
```
---

### Generating links
Generate links with router via route names and params:
```js
router.url('resource.tag.index') // /tag;
router.url('resource.tag.edit', {id: 2}) // /tag/2;
```
---

### Resource api url
Get resource api url from router:
```js
var collectionUrl =  router.apiUrl('tag'); // /api/tag
var itemUrl =  router.apiUrl('tag', 1); // /api/tag/1
```

## Navigation
Navigation component is used to define main user navigation UI element.
Navigation links, user panel links, application name and current username are all defined in navigation component.

---

### Code example
```js
var BaseMainNavigation = require('js/components/baseMainNavigation');

module.exports = BaseMainNavigation.extend({

    getNavigationItems: function(router) {
        return [
            {name: 'Pages', alias: 'page', url: router.url('resource.page.index'), iconClass: 'Home'},
            {name: 'Misc', iconClass: 'ThreeDots', subItems: [
                {name: 'Categories', alias: 'category', url: router.url('resource.category.index')},
                {name: 'Tags', alias: 'tag', url: router.url('resource.tag.index')}
            ]}
        ];
    },

    getUserNavigationItems: function(router) {
        return [
            { name: 'Settings', alias: 'settings', url: router.url('mySettings'), appLink: true },
            { name: 'Public pages', alias: 'publicPages', url: 'http://mySite.com', newTab: true },
            { name: 'Logout', alias: 'logout', url: '/logout' }
        ];
    },

    getProjectCaption: function() {
        return 'my cms';
    },

    getUserCaption: function() {
        return 'my username';
    }

});
```

---

### getNavigationItems
Method "getNavigationItems" takes array of objects with following keys:
* name: for item caption
* alias: prefix for "Link" class name
* url: url to point to
* iconClass: adds sufix to element icon classname (all current icon suffixes can be found in "/src/scss/library/_variables.scss" file, under $icons variable)

---

### getUserNavigationItems
Method "getUserNavigationItems" takes array of objects with following keys:
* name: for item caption
* url : url to point to
* action: if url is ommited, application calls this function
* appLink: Boolean value, true is in app link
* newTab: adds target="_blank" attribute to link
* iconClass: adds sufix to element icon classname (all current icon suffixes can be found in "/src/scss/library/_variables.scss" file, under $icons variable)

---

### getProjectCaption
Use method "getProjectCaption" to set CMS project name.

---

### getUserCaption
Use method "getUserCaption" to set current user caption.

## Application
Application object is glue that ties all CMS components and services together.
It is used to connect services and routes, load translations, inject boot (config) data and start application.

---

### Code example
```js
var app = require('js/app');
var services = require('js/services');
var routes = require('js/routes');
var translations = require('js/lang/english');

app
    .setBootData({
        baseUrl: '/cms-app/',
        assetsBuildPath: '/cms-app/dist/',
        usesPushState: true
    })
    .registerServices(services)
    .registerRoutes(routes)
    .loadTranslations(translations, 'en')
    .start();
```
---

### setBootData
Used to inject boot or config data. Mandatory keys are "baseUrl" and "assetsBuildPath".
```js
// sometimes your data will be generated from backend to global window variable
app.setBootData(window.bootData)
```
Boot data can later be retrieved like so:
```js
var bootData = require('js/library/bootData');
bootData('baseUrl'); // outputs '/cms-app/'
```
---

### registerServices
Used to register user defined services to service container.

---

### registerRoutes
Used to register user defined routes to route registry.

---

### loadTranslations
Used to import translation data for specific locale.

---

### setLocale
Used to set application locale.
```js
app.setLocale('hr'); // en by default
```
---

### getLocale
Used to get application locale.
```js
app.getLocale() // en by default;
```

---

### setInstance
Used to define shared application objects.
```js
app.setInstance('foo', {foo:bar});
```
---

### get
Used to retrieve shared application objects.
```js
app.get('foo') // {foo:bar};
app.get('router') // router instance
```
---

### start
Once called application will setup router, services and main view components.