# About
Trim UI CMF is framework for building content management user interfaces with simple and easy to use api.
Designed to run as a browser application connected to json:api powered backend.

Content management systems built on top of Trim UI CMF are decoupled from server side technology stack.
Backend API can be implemented with node, php, ruby or something else. UI framework works nicely with any server side technology that can process and render json api dataset compliant with [json:api specification](http://jsonapi.org/).

## Motivation
Purpose of this framework is to enable you to quickly build administration CRUD (create, read, update, delete) interface for your application resources. Resulting CMS is responsive and fast - all styles and behavior for standard use cases come included - programmers job is only to define how each application resource is listed and edited.

Sensible dependency on standardized backend api enables us to create CMS domain specific language or api in javascript that is pretty much decoupled from JS libraries and frameworks that are used underneath. Any capable programmer should be able to define complete interface for resource in need of administration.

## Technology and tooling
Trim CMF is built with javascript via composition of stable and tested JS libraries.

* Webpack is used for module bundling and code splitting
* Grunt setup is for task automation - retrieving fonts, syncing files and generating documentation
* Karma is used as test runner
* Extensions of Backbone Views, Models and Collections are used for application architecture
* SASS is used for generating css
* CommonJS is used as module standard

## Code sneek peek
Lets assume your application has a simple "tag" resource and backend api for this resource is ready.
You want to show list of tags that can be filtered by title.
Additionally you want to setup create and edit interface with input for setting tag title.
Your code should end up looking something like this:

```js
var TextListItem = require('js/listElements/text');
var LinkListItem = require('js/listElements/link');
var TextInput = require('js/formElements/text');
var BaseResource = require('js/controllers/baseResource')

module.exports = BaseResource.extend({

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

## Demo application
Browse [demo application](../demo-app) to get a feeling how CMS built with Trim CMF looks and behaves. Is is completely safe to browse, edit and delete items - backend api on demo pages is running on client json api server that stores data in browser memory - so no harm can be done. Dataset can be reset by clicking "reset demo data" control in lower left corner of administration UI.

Feel free to browse, cut and paste demo codebase for your CMS needs and use it as reference.