# Getting started
Before digging into UI code make sure you have a basic understanding of core json api concepts (how relations, attributes, getting, creating and updating resources work). A functional backend api compliant with json api standard is prerequisite for building UI.
Browse [json:api webpage](http://jsonapi.org/) and [examples](http://jsonapi.org/examples/) to familiarize yourself with standard.

Everything explained in this chapter has concrete implementation details in demo application codebase.
Feel free to [browse demo codebase](../demo-app) and take what you need.

## Technology
Make sure you have Node.js (4.x and up) and NPM installed. All packages are installed locally - if you plan to run build, test and watch processes via npm commands there is no need to install any package globally.

## Scaffolding
If you rather wish to use scaffolding tool to bootstrap your application, then follow these simple steps, and after scaffolding process is done just skip to "Build scripts" chapter.

Scaffolding is done with [Yeoman](http://yeoman.io/) tool.

1. install yeoman globally
2. install yeoman generator for trikoder CMF UI globally
3. run "yo" in terminal in desired application folder and select "Trikoder Cmf Ui" generator
4. run "npm install" in terminal to install all NPM project dependancies

```sh
npm install -g yo
npm install -g git+ssh://git@gitlab.trikoder.net:frontend/generator-trikoder-cmf-ui.git
yo
npm install
```
---
### Your project name
Enter your project name, default is folder name. This info will be used as html entry point title meta tag, package.json title and JS app project caption.

---
### Your project description
Enter your project name, default is folder name + "content managment framework". This info is usede as description meta data in html entry point and package.json description.

---
### Please enter relative path for folder where application will store distribution files
Define relative path (without trailing slash) from CMF application root to distribution folder.

---
### Please enter absolute path for base url
Define public absolute path (without trailing slash) which points to CMF application root.

---
### Please enter absolute path for distribution folder
Define public absolute path (without trailing slash) which points to distribution folder.

---
### Enter google map API key
Enter google map API key for your application. This is only needed if you will be using components with google map. Feel free to leave it empty.

---
### Choose desired language
Choose between english or croatian for your app language. This will automaticly include selected translation file.

---
### Would you like to use History API push state
Aplication can define url structure with hash-es or use history API to rewrite url-s (hash is fallback). Default is History API.

---
### Would you like to use faux backend API mockup
Here you can choose if you wish to use faux backend API server (based on pretender.js) to mock responses for your API calls. If you have existing backend API dont choose this.

---
### Would you like to register API entity resource
Here you can choose if you wish to register data entities (eg. article, tags, user...) and create according list, edit and create views.

---
### Enter entity resource name
Enter resource entity name that coresponds to backend API resource entity name.

---
### Enter one entity attribute
Enter one resource model attribute so we can create filter, sort and list on list view and input on edit and create view.

---
### Would you like to register additional API entity resource?
If answered yes, you will repeat last two steps and add additional resource entity.

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
Dependency on trikoder-cmf-ui module is defined via git repo and tag pointer.
```js
{
  "name": "my-cms",
  "version": "0.0.0",
  "description": "my-cms",
  "private": true,
  "scripts": {
    "watch:development": "npm run build:development && webpack --watch --progress --colors --env.mode=development",
    "build:development": "webpack --env.mode=development --progress --colors",
    "build:production": "webpack --env.mode=production --progress --colors"
  },
  "devDependencies": {
    "babel-core": "^6.26.0",
    "babel-eslint": "^7.2.3",
    "babel-loader": "^7.1.2",
    "babel-plugin-syntax-dynamic-import": "^6.18.0",
    "babel-preset-es2015": "^6.24.1",
    "bourbon": "~4",
    "copy-webpack-plugin": "^4.0.1",
    "css-loader": "^0.28.2",
    "dotenv": "^4.0.0",
    "eslint": "^4.4.1",
    "eslint-loader": "^1.9.0",
    "file-loader": "^0.11.2",
    "html-webpack-plugin": "^2.30.1",
    "node-sass": "^4.5.0",
    "nunjucks": "^3.0.0",
    "nunjucks-loader": "^2.4.5",
    "pretender": "~1.4.2",
    "sass-loader": "^6.0.2",
    "style-loader": "^0.18.2",
    "type-factory": "^1.0.5",
    "url-loader": "^0.5.9",
    "webpack": "^3.5.5"
  },
  "dependencies": {
    "trikoder-cmf-ui": "git+ssh://git@gitlab.trikoder.net:frontend/trikoder-cmf-ui.git#0.5.0"
  }
}
```

## Webpack, Eslint
- Webpack is module bundler we use for compiling and code-splitting js bundles. Copy [example webpack config](../demo-app/webpack.config.js) and use it as starting point for your project.
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
Create "main.scss" file in scss folder and import following files from trikoder-cmf-ui module
```css
@import 'trikoder-cmf-ui/src/scss/library/all';
/* override default scss variables like main application color
$colorMain1: #008b95;
*/
@import 'trikoder-cmf-ui/src/scss/bundles/main';
```

## Javascript setup
Lets assume your application has a simple "tag" resource and backend api for this resource is ready. You want to show list of tags that can be filtered by title. Additionally you want to setup create and edit interface with input for setting tag title.

---
### Controller
Lets start by defining a controller file. Copy code bellow to js/controllers/tag.js.
Later you can explore in detail [how resource controllers work](core-concepts-and-api#resource-controller).

```js
import TextListItem from 'js/listElements/text';
import LinkListItem from 'js/listElements/link';
import TextInput from 'js/formElements/text';
import BaseResource from 'js/controllers/baseResource)

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

### Routes
We want our controller UI to be available on some url. We will create "js/routes.js" and define routes there.
[Router api details](core-concepts-and-api#router) are explained in next chapter. For now - copy paste code bellow to our routes.js file.

```js
export default router => {

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
import BaseMainNavigation from 'js/components/baseMainNavigation';

export default BaseMainNavigation.extend({

    getNavigationItems: router => [
        {name: 'Tags', alias: 'tag', url: router.url('resource.tag.index'), iconClass: 'Home'};
    ],

    getUserNavigationItems: router => [],

    getProjectCaption: () => 'My cms project',

    getUserCaption: () => 'My username'

});
```

---

### Services
We will register our Navigation and Controller components as services so our application can easily discover and use them.
Create "js/services.js" with code bellow. [Services are explained](core-concepts-and-api#services) in detail in next chapter.
```js
export default {
    MainNavigation: function(callback) {
        callback(require('js/mainNavigation').default);
    },
    TagController: function(callback) {
        import('js/controllers/tag').then(controller => {
            callback(controller.default);
        });
    }
};
```

---

### Start application
Application object is what glues all our components together.
Create "js/main.js" file and paste code bellow. [Application object](core-concepts-and-api#application) details are explained in next chapter.
```js
import app from 'js/app';

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
