# Form elements
Form elements are used to map values to resource model attributes or relations when resource is created or edited.
In most use cases we add form element definitions via [resource edit](core-concepts-and-api#resource-edit) handler inside resource controller setupEdit method.

Form elements are usually composed of some kind of input control (text input, select dropdown, checkbox...), label that is binded to input control and error message when form element has validation error.
They share following html structure when rendered:

```html
<div class="wrapper">
    <label for="formElement1">Label</label>
    <div class="inputWrapper">
        <input id="formElement1" type="text" />
    </div>
    <p class="errorMessage">Validation error</p>
</div>
```

## Shared options
All form elements accept following set of options:

* **name**: Form element identifier used to map form element value to resource model attribute or relation.

* **label**: Used to define form element label text content.

* **readOnly**: Used to set form element as "read only". When resource is updated mappings with "readOnly" option will be excluded from put / post requests. Also, form element wraper will recive class attribute "disabled" and form element will recive attribute "disabled".

* **attributes**: Adds html attributes to following elements (defined as object keys) 'input', 'inputWrapper', 'label', 'wrapper' and 'errorMessage'

* **layoutReference**: Pointer to layout area defined via resource edit "setLayout" method
---

```js
editHandler.addField(TextInput, {
    name: 'title',
    label: 'Article title',
    readOnly: true
    attributes: {input: {placeholder: 'Please enter title'}},
    layoutReference: 'mainContent.mainRegion.group1'
});
```

## Common methods
All form element instance have access to following common methods:

* **formElement.getValue()**: Used to retrieve form element value
* **formElement.setValue(value)**: Used to set form element value
* **formElement.rerender()**: Used to force element to re-render itself


## Text input

Text input element is used for handling textual data presented as HTML form input element.

```js
import TextInput from 'js/formElements/text';
...
editHandler.addField(TextInput, {
    label: 'Article title',
    name: 'title'
});
```

## Hidden input

Hidden input element is used for handling textual data presented as HTML hidden input element.

```js
import HiddenInput from 'js/formElements/hidden';
...
editHandler.addField(HiddenInput, {
    name: 'title'
});
```

## Textarea input

Textarea input element is used for handling textual data presented as HTML textarea element.

```js
import TextareaInput from 'js/formElements/textarea';
...
editHandler.addField(TextareaInput, {
    name: 'title',
    label: 'Article title',
    autoHeight: false
});
```

### Options:
* **autoHeight:** Boolean value, if set true element height will adjust to content. Default value is true.
* **trimOnPaste:** Boolean value, if set true on paste event vlue will be trimmed. Default value is true.


## Checkbox input

Checkbox input element is used for handling data presented as HTML checkbox element.

```js
import CheckboxInput from 'js/formElements/checkbox';
...
editHandler.addField(CheckboxInput, {
    label: 'Article is published',
    name: 'published',
    valueMap: {checked: true, unchecked: false}
});
```

### Options:
valueMap object
* **checked:** Boolean or string representing value for checked state. Default is true.
* **unchecked:** Boolean or string representing value for unchecked state. Default is false.

## Date input

Date input element is used for handling date data presented as HTML input element with attached datepicker.

```js
import DateInput from 'js/formElements/date';
...
editHandler.addField(DateInput, {
    label: 'Date',
    name: 'publishDate'
});
```

## Date time input

Date input element is used for handling date data presented as HTML input element with attached date and time picker.

```js
import DateTimeInput from 'js/formElements/dateTime';
...
editHandler.addField(DateTimeInput, {
    label: 'Date',
    name: 'publishDateTime'
});
```

### Options:
* **emptyValue:** value that will be sent if no value is defined. Default is null.
* **format:** standard JS date format, default is 'DD.MM.YYYY HH:mm'
* **serverFormat:** function that will be called with server value and options format arguments, and it is used to return parsed value. Default is "return parseDate(arg[0], arg[1]).toISOString();"

## Html

Html input element is used for handling HTML data presented as textarea with rich text editor.

```js
import HtmlInput from 'js/formElements/html';
...
editHandler.addField(HtmlInput, {
    label: 'Content',
    name: 'contentRaw',
    delimiter: ','
});
```

## Map

Map element is used for handling geolocation data presented as google map.

```js
import MapInput from 'js/formElements/map';
...
editHandler.addField(MapInput, {
    label: 'Location on map',
    name: 'location',
    delimiter: '|',
    search: false
});
```

### Options:
* **zoom:** zoom level for google maps (default 12)
* **delimiter:** delimiter used when spliting value to latitude and longitude (default ',')
* **initialLat:** latitude used for centering map if data is null (default '45.79815157817745')
* **initialLng:** longitude used for centering map if data is null (default '15.970237255096436')
* **search:** Boolean value, if true google map will have text location search widget (default true)
* **mapOptions:** options object that will be passed when initializing Google map (zoom and center coordinates options are passed by default)


## Select

Select element is used for handling option data presented as HTML select element.

```js
import SelectInput from 'js/formElements/select';

editHandler.addField(SelectInput, {
    label: 'Status',
    name: 'published',
    selectOptions: [
        {caption: 'All pages', value: ''},
        {caption: 'Published', value: true},
        {caption: 'Unpublished', value: false}
    ]
});
```

### Options:
* **buttonTextPrefix:** adds string value to selected item preview
* **castValueTo:** accepts string value 'boolean' or 'integer'. If set to 'boolean' it will cast 'true' or '1' string to true and 'false' or '0' string to false. If set to 'integer' it will parse value as integer

Array of objects under selectOptions key:
* **caption:** option caption
* **value:** option value

Object under selectOptions key:
* **url:** API path to desired resource collection
* **mapCaptionTo:** string value for caption key in API model (default is 'name')
* **mapValueTo:** string value for caption key in API model (default is 'id')
* **prepend:** Array of objects representing option items that will be prepended to collection list (keys are same as in array of objects under selectOptions key)


## Multiple select

Multiple select element is used for handling option data capable of selecting multiple items.

```js
import app from 'js/app';
import MultipleSelectInput from 'js/formElements/multipleSelect';
...
editHandler.addField(MultipleSelectInput, {
    label: 'Tags',
    name: 'tags',
    relation: {type: 'hasMany', resourceName: 'tag'},
    selectOptions: {
        url: app.get('router').apiUrl('tag'),
        mapCaptionTo: 'title'
    }
});
```

### Options:
Object under relation key defines relationship resource:
* **type:** must be string value 'hasMany'
* **resourceName:** desired resource name type

Array of objects under selectOptions key:
* **caption:** option caption
* **value:** option value

Object under selectOptions key:
* **url:** API path to desired resource collection
* **mapCaptionTo:** string value for caption key in API model (default is 'name')
* **mapValueTo:** string value for caption key in API model (default is 'id')
* **prepend:** Array of objects representing option items that will be prepended to collection list (keys are same as in array of objects under selectOptions key)

## Nested select

Nested select element is used for handling hierarchy admin widget.

```js
import app from 'js/app';
import NestedSelectInput from 'js/formElements/nestedSelect';
...
listHandler.addFilter(NestedSelectInput, {
    name: 'parentCategory',
    label: 'Parent category',
    search: true,
    mapCaptionTo: 'title',
    mapParentTo: 'parentCategory.id',
    mapChildrenTo: 'children',
    mapLevelTo: 'level',
    selectableLevel: 'leaf',
    mapIsLeafTo: 'leaf',
    apiUrl: app.get('router').apiUrl('category'),
    relation: {type: 'hasOne', resourceName: 'category'}
});
```

### Options:
* **search:** boolean value, if set true quick search widget will be added (default true)
* **mapCaptionTo:** string value for key in relation resource model for caption. Also accepts function with model and context as argument (default 'title')
* **mapParentTo:** string value for key in model with parent resource ID (default 'parentCategory.id')
* **mapLevelTo:** function with model as argument and must return numerical value
* **selectableLevel:**  can be string value 'all' for all levels are selectable, can be string value 'leaf' for only leaf levels is selectable and can be array of strings with level values so only corresponding levels are selectable (default value is 'leaf')
* **mapIsLeafTo:** string value for key in relation resource model for leaf item. Also accepts function with model and context as argument (default 'leaf')
* **apiUrl:** API path to desired resource collection

Object under relation key defines relationship resource (must be defined in this case):
* **type:** can be string value 'hasOne' and can accept only one relation or 'hasMany' and can accept multiple relations (default 'hasOne')
* **resourceName:** desired resource name type

## State select

State select element is used for handling state machine data types.

```js
import StateSelect from 'js/formElements/stateSelect';
...
editHandler.addField(StateSelect, {
    label: 'Proof read',
    name: 'proofreadStatus',
    updateEntityOnChange: true,
    readOnly: true,
    states: [{
        value: '0',
        name: 'notProofread',
        caption: 'Not proofread',
        actionCaption: 'Proofread not needed',
        transitions: ['proofreadNeeded']
    }, {
        value: '1',
        name: 'proofreadNeeded',
        caption: 'Proofread needed',
        transitions: ['proofreadDone', 'notProofread']
    }, {
        value: '2',
        name: 'proofreadDone',
        caption: 'Proofread done',
        transitions: null
    }]
});
```

### Options:
* **updateEntityOnChange:** boolean value, if set to true update status button is added, and stat is modified without submiting whole resource. Default is false
* **updateControlCaption:** string value for update button caption. Default value is 'formElements.stateSelect.updateControlCaption' from translation
* **nextStatePlaceholderCaption:** string value for current item caption in select input. Default value is 'formElements.stateSelect.nextStatePlaceholderCaption' from translation

Array of objects with all possible states:
* **value:** string with state value data
* **name:** string value for state name. If name is not defined, value is used
* **caption:** string value for state caption
* **actionCaption:** string value for state caption in select element
* **transitions:** array of possible state transition maped to other state name (in case name is ommited value is used)

## External admin

External admin element is used for handling related data through modal interface for resource controller.

```js
import ExternalAdmin from 'js/formElements/externalAdmin';
...
listHandler.addFilter(ExternalAdmin, {
    name: 'tags',
    label: 'Tags',
    mapCaptionTo: 'title',
    relation: {type: 'hasMany', resourceName: 'tag'}
});
```

### Options:
* **mapCaptionTo:** string value for key in related model with caption value. Default is 'name'
* **placeholderText:** string value for no items are selected. Default value is translation key 'formElements.externalAdmin.placeholderText'
* **showEditControl:** boolean value, if set true edit button for selected resource is enabled. This is available only if relation type has set to 'hasOne'. Default is false
* **onSelect:** function with model argument that is called when item/items are selected. Default value is as follows:

```js
function(model) {

    if (_.isArray(model)) {

        this.selectedModels = model;

        this.setValue(_.map(model, function(singleModel) {
            return singleModel.get('id');
        }));

    } else {

        this.selectedModel = model;
        this.setValue(model.get('id'));

    }

    this.popup.remove();
    this.render();

};
```
Object under relation key defines relationship resource:
* **type:** can be string value 'hasMany' and can have multiple relations or can be 'hasOne' and have single relation
* **resourceName:** desired resource name type

## Included admin

Included admin element is used for handling related data through embeded admin interface inside current resource create/edit.

```js
import ExternalAdmin from 'js/formElements/externalAdmin';
import TextInput from 'js/formElements/text';
import IncludedAdmin from 'js/formElements/includedAdmin';
...
editHandler.addField(IncludedAdmin, {
    label: 'Povezani članci',
    name: 'hasRelatedArticles',
    updatePosition: false,
    setupEdit: function(includedAdmin) {

        includedAdmin.addField(ExternalAdmin, {
            name: 'relatedArticle',
            mapCaptionTo: 'title',
            relation: {type: 'hasOne', resourceName: 'article'}
        });

        includedAdmin.addField(TextInput, {
            label: 'Description',
            name: 'description'
        });

    },
    relation: {type: 'hasMany', resourceName: 'articleHasRelatedArticle'},
    bulkSave: {url: router.apiUrl('articleHasRelatedArticle') + 'bulk'}
});
```

### Options:
* **updatePosition:** boolean value, if true sort functionality is enabled (default false)
* **removeItems:** boolean value, if true remove item functionality is enabled (default true)
* **addItems:** boolean value, if true add item functionality is enabled. (default true)
* **setupEdit:** method with editHandler, method and id arguments. Behives and works same as "setupEdit" method on resource controller

Object under bulkSave key defines if resource will be saved in bulk (dafault false)
* **url:** API path to desired resource bulk save endpoint

Object under relation key defines relationship resource:
* **type:** can be string value 'hasMany' and can have multiple relations or can be 'hasOne' and have single relation
* **resourceName:** desired resource name type


## Media preview

Media preview element is used for presenting media image entity in resource edit/crate view with attached lightbox functionality. Possible media types are "image", "audio", "file" and "animatedGif".

```js
import MediaPreview from 'js/formElements/mediaPreview';
...
editHandler.addField(MediaPreview, {
    label: 'Photography',
    name: 'mediaPreview'
});
```

### Options:
* **mapImageTo:** string value for key in model pointing to image thumbnail url. Default value is "thumbnailUrl". Used only with media type "image" and "animatedGif"
* **mapLargeImageTo:** string value for key in model pointing to image url. Default value is "originalUrl". Used only with media type "image" and "animatedGif"

## Media

Media element is used for handling media data presented as HTML widget with preview, attach and upload media entity.

```js
import MediaInput from 'js/formElements/baseMedia';
...
editHandler.addField(MediaInput, {
    label: 'Main media',
    name: 'media',
    relation: {type: 'hasOne', resourceName: 'media'}
});
```

### Options:

* **mapCaptionTo:** string value for caption key in API model (default 'name')
* **mapThumbnailTo:** string value for thumb path in API model (default 'thumbnailUrl')
* **mapPreviewTo:** string value for full size image path in API model (default 'originalUrl')
* **changeImageCaption:** string value for change image caption (defult translate('formElements.media.changeImageCaption'))
* **chooseImageCaption:** string value for choose image caption (defult translate('formElements.media.chooseImageCaption'))
* **uploadImageCaption:** string value for upload image caption (defult translate('formElements.media.uploadImageCaption'))
* **separatorCaption:** string value for separator caption (defult translate('formElements.media.separatorCaption'))
* **onSelect:** function with model argument that is called when item/items are selected (default ExternalAdmin.prototype.defaults.onSelect),
* **assignWhenEditDone:** boolean value which determines if media resource will be assigned to main resource when edit is done (default false)
* **fileUploadParamName:** value is passed to file upload plugin "Dropzone.js" (default 'binary')
* **fileUploadHeaders:** value is passed to file upload plugin "Dropzone.js" (default null)
* **formatErrorMessage:** : value is passed to file upload plugin "Dropzone.js", default is:
```js
function(message) {
    return message;
}
```

Object under relation key defines relationship resource:
* **type:** must be string value 'hasOne'
* **resourceName:** desired resource name type
