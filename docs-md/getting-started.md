# Getting started
Before digging into UI code make sure you have a basic understanding of core json api concepts (how relations, attributes, getting, creating and updating resources work). A functional backend api compliant with json api standard is prerequisite for building UI.
Browse [json:api webpage](http://jsonapi.org/) and [examples](http://jsonapi.org/examples/) to familiarize yourself with standard.

Everything explained in this chapter has concrete implementation details in demo application codebase.
Feel free to [browse demo codebase](../demo-app) and take what you need.

## Technology
Make sure you have Node.js (4.x and up) and NPM installed. All packages are installed locally - if you plan to run build, test and watch processes via npm commands there is no need to install any package globally.

## File and folder structure
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
    "dev": "npm run api:server & BASE_URL=/ BASE_API_URL=http://localhost:3001/ PUBLIC_URL=/ webpack-dev-server --env.mode=development --open",
    "api:server": "BASE_API_URL=http://localhost:3001/ nodemon ./src/js/server/node.js",
    "watch:development": "npm run build:development && webpack --watch --progress --colors --env.mode=development",
    "build:development": "webpack --env.mode=development --progress --colors",
    "build:production": "webpack --env.mode=production --progress --colors"
  },
  "devDependencies": {
    "babel-core": "^6.26.0",
    "babel-eslint": "^8.2.2",
    "babel-loader": "^7.1.4",
    "babel-plugin-syntax-dynamic-import": "^6.18.0",
    "babel-preset-es2015": "^6.24.1",
    "bourbon": "~4",
    "copy-webpack-plugin": "^4.5.1",
    "cors": "^2.8.4",
    "css-loader": "^0.28.10",
    "dotenv": "^5.0.1",
    "eslint": "^4.18.2",
    "eslint-loader": "^2.0.0",
    "extract-text-webpack-plugin": "^3.0.0",
    "file-loader": "^1.1.11",
    "html-webpack-plugin": "^3.0.6",
    "hoek": "^5.0.3",
    "node-sass": "^4.7.2",
    "nodemon": "^1.17.1",
    "nunjucks": "^3.0.0",
    "nunjucks-loader": "^2.4.5",
    "pretender": "~1.4.2",
    "sass-loader": "^6.0.7",
    "style-loader": "^0.20.3",
    "type-factory": "^1.1.1",
    "url-loader": "^1.0.1",
    "webpack": "^3.5.6",
    "webpack-dev-server": "^2.8.2"
  },
  "dependencies": {
    "trikoder-cmf-ui": "git+https://git@github.com//trikoder/trim-cmf.git"
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
