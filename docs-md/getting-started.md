# Getting started
Before digging into UI code make sure you have a basic understanding of core json api concepts (how relations, attributes, getting, creating and updating resources work). A functional backend api compliant with json api standard is prerequisite for building UI.
Browse [json:api webpage](http://jsonapi.org/) and [examples](http://jsonapi.org/examples/) to familiarize yourself with standard.

Everything explained in this chapter has concrete implementation details in demo application codebase.
Feel free to [browse demo codebase](../demo-app) and take what you need.

## Technology
Make sure you have Node.js (4.x and up) and NPM installed. All packages are installed locally - if you plan to run build, test and watch processes via npm commands there is no need to install any package globally.

## File and folder structure
Start by creating "src" folder with "js" and "scss" folder inside.
```html
- myCmsProject
    - src
        - js
        - scss
```
Once you complete this getting started section your folder structure should look like this:

```html
- myCmsProject
    - src
        - js
            - controllers
                - tag.js
            - main.js
            - mainNavigation.js
            - routes.js
            - services.js
        - scss
            - app.scss
    - index.html
    - Gruntfile.js
    - package.json
    - webpack.config.js
```

## Package.json
Create Package.json file like one displayed bellow in your project root. Adjust your project name and description.
Dependency on trim-cmf module is defined via git repo and tag pointer.
```js
{
  "name": "my-cms",
  "version": "0.0.0",
  "description": "my-cms",
  "private": true,
  "scripts": {
    "watch:development": "npm run build:development && npm run watch:development:noBuild",
    "watch:development:noBuild": "grunt watch & webpack --env.mode=development --watch --progress --colors",
    "build:development": "grunt build && webpack --env.mode=development --progress --colors",
    "build:production": "grunt build --env=production && webpack --env.mode=production --progress --colors"
  },
  "devDependencies": {
    "bourbon": "~4",
    "css-loader": "^0.26.1",
    "grunt": "^1.0.1",
    "grunt-cli": "^1.2.0",
    "grunt-contrib-copy": "^1.0.0",
    "grunt-contrib-watch": "^1.0.0",
    "grunt-eslint": "^19.0.0",
    "grunt-sass": "^2.0.0",
    "grunt-sync": "^0.6.2",
    "load-grunt-tasks": "^3.5.2",
    "node-sass": "^4.5.0",
    "nunjucks": "^3.0.0",
    "nunjucks-loader": "^2.4.5",
    "sass-loader": "^6.0.2",
    "style-loader": "^0.13.1",
    "webpack": "^2.2.1"
  },
  "dependencies": {
    "trim-cmf": "git+ssh://git@github.com:trikoder/trim-cmf.git"
  }
}
```

## Webpack, Grunt, Eslint
- Webpack is module bundler we use for compiling and code-splitting js bundles. Copy [example webpack config](../demo-app/webpack.config.js) and use it as starting point for your project.
- Grunt is used for code style checks, compiling css from scss and syncing files. Copy [demo application Gruntfile](../demo-app/Gruntfile.js) to project root.
- Eslint is linting utility we recommend you use while developing. Copy and adjust [.eslintrc.js](../demo-app/.eslintrc.js) as you see fit.


## HTML entry point
Create index.html file like one displayed bellow in root of your project.
Make sure that paths to your css and js resources are correct.

```html
<!DOCTYPE html>
<html>
<head lang="en">

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <title>My cms project</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimal-ui"/>
    <meta name="theme-color" content="#ffffff">

    <link href='dist/css/main.css' rel='stylesheet' type='text/css'>

</head>
<body>

<script async src="dist/js/main.js"></script>

</body>
</html>
```

## SCSS setup
Create "main.scss" file in scss folder and import following files from trim-cmf module
```css
@import 'trim-cmf/src/scss/library/all';
/* override default scss variables like main application color
$colorMain1: #008b95;
*/
@import 'trim-cmf/src/scss/bundles/main';
```

## Javascript setup
Lets assume your application has a simple "tag" resource and backend api for this resource is ready. You want to show list of tags that can be filtered by title. Additionally you want to setup create and edit interface with input for setting tag title.

---
### Controller
Lets start by defining a controller file. Copy code bellow to js/controllers/tag.js.
Later you can explore in detail [how resource controllers work](core-concepts-and-api#resource-controller).

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
---

### Routes
We want our controller UI to be available on some url. We will create "js/routes.js" and define routes there.
[Router api details](core-concepts-and-api#router) are explained in next chapter. For now - copy paste code bellow to our routes.js file.

```js
module.exports = function(router) {

    router.route('', 'dashboard', {uses: 'Tag@index'});
    router.resource('tag');

};
```

---

### Navigation
Our application UI should provide user with a link to tag UI controller.
For this purpose we will define a navigation component with "js/mainNavigation.js" file.
[Navigation in detail](core-concepts-and-api#navigation) is explained in next chapter. For now - copy paste code bellow to our mainNavigation.js file.

```js
var BaseMainNavigation = require('js/components/baseMainNavigation');

module.exports = BaseMainNavigation.extend({

    getNavigationItems: function(router) {
        return [{name: 'Tags', alias: 'tag', url: router.url('resource.tag.index'), iconClass: 'Home'}];
    },

    getUserNavigationItems: function(router) {
        return [];
    },

    getProjectCaption: function() {
        return 'My cms project';
    },

    getUserCaption: function() {
        return 'My username';
    }

});
```

---

### Services
We will register our Navigation and Controller components as services so our application can easily discover and use them.
Create "js/services.js" with code bellow. [Services are explained](core-concepts-and-api#services) in detail in next chapter.
```js
module.exports = {
    MainNavigation: function(callback) {
        callback(require('js/mainNavigation'));
    },
    TagController: function(callback) {
        require.ensure([], function() {
            callback(require('js/controllers/tag'));
        });
    }
};
```

---

### Start application
Application object is what glues all our components together.
Create "js/main.js" file and paste code bellow. [Application object](core-concepts-and-api#application) details are explained in next chapter.
```js
var app = require('js/app');

app.setBootData({
    baseUrl: '/admin/',
    assetsBuildPath: '/dist/'
}).start();
```

## Build scripts
Build cms resources in development mode.
```sh
npm run build:development
```
Rebuild cms resources as you develop by running:
```sh
npm run watch:development
```
Prepare cms resources for production use by running:
```sh
npm run build:production
```
