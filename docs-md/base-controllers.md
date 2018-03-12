# Base controllers
Trikoder UI CMF includes a number of predefined UI base controllers for common use cases.
Beside resource controller that is most frequently extended base controllers for resource edit, nested resource and media resource are available.

## Resource controller
Used when you need to define how resource is browsed, filtered and sorted in list, what form fields are rendered when resource is created or updated.

---

Code example:
```js
import BaseResource from 'js/controllers/baseResource';

export default BaseResource.extend({

    resourceName: 'tag',

    setupList: function(listHandler) {
        // how is resource listed?
    },

    setupEdit: function(editHandler, method, id) {
        // how is resource edited?
    }

});
```

Sometimes empty resource is required for meaningful create admin interface.
In this case draft resource is created on api (with id but no attributes and relation data) and edited in UI immediately.

```js
export default BaseResource.extend({

    resourceName: 'tag',
    createRequiresDraft: true,
    ...

});
```

Explicit included relations and data can be specifed on resource controller index and edit actions:

```js
export default BaseResource.extend({

    resourceName: 'tag',

    includeApiData: {
        index: ['media', 'author', 'author.media'],
        edit: ['media', 'author', 'author.media']
    },

    ...

});
```
Default behaviour for resource saving is for related resources to be saved before main resource.
Alternate save strategy for main and related resources when resource is created is available by
settting 'createRelatedStrategy' property on controller to 'relatedLast' value.

```js
export default BaseResource.extend({

    resourceName: 'user',
    createRelatedStrategy: 'relatedLast',
    ...

});
```

## Resource edit controller
Used when you want to edit one specific resource and listing is not available.
Implement "setupModel" method and provide model instance to edit.
Visit demo application "My settings" interface to see this type of controller in action.

---
Code example:

```js
import Entity from 'js/library/entity';
import TextInput from 'js/formElements/text';

module.exports = require('js/controllers/baseResourceEdit').extend({

    setupModel: function(callback) {

        Entity.Model.getFromApi({type: 'user', id: 1}, model => { callback(model); });

    },

    setupEdit: function(editHandler) {

        this.setPageTitle('My settings');

        this.addSaveControl();

        editHandler.addField(TextInput, {
            label: 'Email',
            name: 'email',
            attributes: {
                input: {className: 'inputType2 size2'}
            }
        });

    }

});

```

## Nested resource controller
Used for hierarchal resources that can be presented in nested tree view form.
Categories as resources usually have parent and child categories.
Visit demo application category interface to see nested resource controller UI in action.
Lets examine category api response:
```js
{
    type: 'category',
    id: '5',
    attributes: {
        title: 'Category 5',
        description: 'Aenean gravida, orci in sagittis tincidunt, dolor quam pellentesque dolor, nec viverra neque nunc id mi.',
        published: true
    },
    relationships: {
        parentCategory: {data: {id: '2', type: 'category'}},
        childCategories: {data: [
            {id: '7', type: 'category'}
        ]}
    }
}
```
Resource hierarchy is defined via parentCategory and childCategories relations.

---

Our category resource controller should extend base nested resource controller.
Via resourceConfig property we define parent and children relation mappings.
```js
import BaseNestedResource from 'js/controllers/baseNestedResource';

export default BaseNestedResource.extend({

    resourceName: 'category',

    resourceConfig: {
        mapParentTo: 'parentCategory',
        mapChildrenTo: 'childCategories'
    },

    // list and edit api is defined like in any other controller
    ...

```

Resource config has following defaults:
```js
{
    mapParentTo: 'parent',
    mapChildrenTo: 'children',
    mapLevelTo: undefined,
    mapIsLeafTo: undefined,
    addNestedCreateControl: true
},
```
Properties mapChildrenTo, mapLevelTo, mapIsLeafTo can be defined as strings or functions if needed.


## Media resource controller
Used for browse, create (upload) and edit media resources sush as images or files.
Visit demo application media interface to see media resource controller UI in action.
Lets examine typical media api response:
```js
{
    type: 'media',
    id: '1',
    attributes: {
        title: 'Media item 1',
        caption: 'Aenean gravida, orci in sagittis tincidunt, dolor quam pellentesque dolor, nec viverra neque nunc id mi.',
        mediaType: 'image',
        thumbnailUrl: 'http://pipsum.com/400x300.jpg?v=' + String(index),
        originalUrl: 'http://pipsum.com/1200x900.jpg?v=' + String(index)
    }
}
```
Example media controller is shown bellow.
Via resource config propery we define list of media types (image, file, videoEmbed) our controller is handling.
For each media type a method for edit handling is defined (setup[MediaType]Edit).

```js
import BaseMediaResource from 'js/controllers/baseMediaResource';

export default BaseMediaResource.extend({

    resourceName: 'media',

    resourceConfig: {
        mediaTypes: ['image', 'file', {
            name: 'videoEmbed',
            createPageTitle: 'Create video embed',
            hasUploadUi: false
        }]
    },

    setupList: function(listHandler) {

        this.addControl({
            caption: 'Upload new image',
            className: 'accented iconPlus',
            action: this.createImage // we point action to create[MediaType] method
        }).addDropdownControl({
            caption: 'Add media',
            className: 'accented icr iconArrowDown',
            items: [{
                caption: 'Create video embed',
                action: this.createVideoEmbed
            }, {
                caption: 'Upload file',
                action: this.createFile
            }]
        });

        ...

    },

    setupImageEdit: function(editHandler, method, id) {

        this.addToIndexControl().addSaveControl();

        editHandler.addField(MediaPreview, {
            label: 'Photography',
            name: 'mediaPreview'
        });

        ...

    },

    setupVideoEmbedEdit: function(editHandler) {

        ...

    },

    setupFileEdit: function(editHandler) {

        ...

    }

});
```

Resource config has following defaults:

```js
resourceConfig: {
    mapMediaTypeTo: 'mediaType',
    mediaTypes: ['image'],
    uploadUrl: function() {
        return router.apiUrl(this.resourceName) + '/upload';
    },
    prepareModelFromUpload: function(file, response, callback) {
        EntityModel.getFromApi({url: file.xhr.getResponseHeader('Location')}, callback, this);
    },
    fileUploadParamName: 'binary',
    fileUploadHeaders: null
}
```

For our media controller to work properly we have to define following routes:

```js
router.route('media/create-image', 'resource.media.createImage', {uses: 'Media@createImage'});
router.route('media/create-video-embed', 'resource.media.createVideoEmbed', {uses: 'Media@createVideoEmbed'});
router.route('media/create-file', 'resource.media.createFile', {uses: 'Media@createFile'});
router.route('media/:id', 'resource.media.edit', {uses: 'Media@edit'});
router.route('media', 'resource.media.index', {uses: 'Media@index'});
```
