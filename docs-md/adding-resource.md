# Adding resource
We will examine typical scenario where new resource is ready on backend api and admin user interface has to be created.
Steps needed to complete UI for this new resource:
- examine resource api
- create resource controller
- add resource route
- add navigation link
- register controller as service

For simple resources this can be completed in less then 5 minutes.

## Examine resource api
Make sure that resource backend api is ready to handle get, post, and put requests.
Check that backend properly outputs relation includes, make sure that filtering and validation rules are respected.
Examine new resource attributes and relations and decide what list and form elements have to be used.

Everything works? Then lets build resource UI controller.

## Create resource controller
Lets say new resource in need of UI is "tag" entity.
We will need a component to describe how resource is browsed, filtered and sorted in list, what form fields are rendered when resource is created or updated.

For this purpose we will build a tag resource controller in 'js/controllers/tag.js' file:

```js
import BaseResource from 'js/controllers/baseResource';
import LinkListItem from 'js/listElements/link';
import TextListItem from 'js/listElements/text';
import TextInput from 'js/formElements/text';

export default BaseResource.extend({

    resourceName: 'tag',

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

    setupEdit: function(editHandler, method, id) {

        this.addToIndexControl().addSaveControl();

        editHandler.addField(TextInput, {
            label: 'Title',
            name: 'title'
        });

    }

});
```
---

Read up on how [resource controllers](core-concepts-and-api#resource-controller) work, examine how to build [resource list](list-elements) and [form elements](form-elements).

## Add resource route
Open your routes file (js/routes.js) and add new resource route:
```js
...
router.resource('tag');
...
```
Browse [router docs](core-concepts-and-api#router) to learn more.


## Add navigation item
Open your main navigation component (js/mainNavigation.js) and add new navigation item:
```js
getNavigationItems: router => {
    return [
        {name: 'Pages', alias: 'page', url: router.url('resource.page.index'), iconClass: 'Home'},
        {name: 'Misc', iconClass: 'ThreeDots', subItems: [
            {name: 'Categories', alias: 'category', url: router.url('resource.category.index')},
            // one bellow we just added
            {name: 'Tags', alias: 'tag', url: router.url('resource.tag.index')}
        ]}
    ];
},
```
Read more about [main navigation](core-concepts-and-api#navigation) if you want to learn more.

## Register controller as service
Open up your services file (js/services.js) and add new tag resource controller to registry.
Using webpacks require.ensure we load our new controller code and its dependencies only when controller is actually opened.
```js
...
TagController: function(callback) {
    import('js/controllers/tag').then(controller => {
        callback(controller.default);
    });
},
...
```
Done! Read up on [services](core-concepts-and-api#services) if you want to learn more.