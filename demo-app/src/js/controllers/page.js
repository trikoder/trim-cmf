import app from 'js/app';
import BaseResource from 'js/controllers/baseResource';
import LinkListItem from 'js/listElements/link';
import TextListItem from 'js/listElements/text';
import DateListItem from 'js/listElements/date';
import DateTimeListItem from 'js/listElements/dateTime';
import BlipListItem from 'js/listElements/blip';
import ButtonListItem from 'js/listElements/button';
import TextInput from 'js/formElements/text';
import HtmlInput from 'js/formElements/html';
import SelectInput from 'js/formElements/select';
import MultipleSelectInput from 'js/formElements/multipleSelect';
import DateInput from 'js/formElements/date';
import ExternalAdmin from 'js/formElements/externalAdmin';
import ContextMenu from 'js/listElements/contextMenu';

export default BaseResource.extend({

    resourceName: 'page',
    resourceCaption: 'title',

    setupList: function(listHandler) {

        this.addCreateControl('Create new page');

        //--------------------------------------------------------------
        // Filters
        //--------------------------------------------------------------
        listHandler.addFilter(TextInput, {
            name: 'title',
            label: 'Title'
        });

        listHandler.addFilter(DateInput, {
            name: 'publishDate',
            label: 'Date'
        });

        listHandler.addFilter(SelectInput, {
            name: 'published',
            label: 'Status',
            selectOptions: [
                {caption: 'All pages', value: ''},
                {caption: 'Published', value: true},
                {caption: 'Unpublished', value: false}
            ]
        });

        listHandler.addFilter(SelectInput, {
            name: 'author',
            label: 'Author',
            selectOptions: {
                url: app.get('router').apiUrl('user'),
                mapCaptionTo: 'email',
                prepend: [{caption: 'All', value: ''}]
            }
        });

        listHandler.addFilter(ExternalAdmin, {
            name: 'tags',
            label: 'Tags',
            mapCaptionTo: 'title',
            relation: {type: 'hasOne', resourceName: 'tag'}
        });

        //--------------------------------------------------------------
        // Mass action
        //--------------------------------------------------------------
        listHandler.addMassAction([{
            caption: 'Publish',
            updateAttributes: {published: true},
            updateMessage: {
                success: function(params) {
                    return params.doneItemsCount + ' items are published.';
                },
                error: function(params) {
                    return params.failedItemsCount + ' failed to publish.';
                }
            }
        }, {
            caption: 'Unpublish',
            updateAttributes: {published: false}
        }, {
            caption: 'Delete',
            action: function(model) {

                return model.destroy().fail(function() {
                    listHandler.renderMessage();
                });

            },
            onComplete: function() {
                listHandler.refreshItems();
            },
            confirm: true,
            updateMessage: {success: 'All selected items are deleted'}
        }]);

        //--------------------------------------------------------------
        // Sort
        //--------------------------------------------------------------
        listHandler.addSort([
            {
                label: 'By title',
                field: '-title'
            },
            {
                label: 'By date',
                field: '-date'
            }
        ]);

        //--------------------------------------------------------------
        // List items
        //--------------------------------------------------------------

        listHandler.addItem(TextListItem, {
            attributes: {className: 'textListItemType1 hiddenOnMobile'},
            caption: 'ID',
            mapTo: 'id'
        });

        listHandler.addItem(LinkListItem, {
            caption: 'Title',
            mapTo: 'title',
            action: 'editItem'
        });

        listHandler.addItem(DateListItem, {
            caption: 'Date',
            mapTo: 'publishDate'
        });

        listHandler.addItem(DateTimeListItem, {
            caption: 'Date and time',
            mapTo: 'publishDate'
        });

        listHandler.addItem(TextListItem, {
            caption: 'Author',
            mapTo: 'author.email'
        });

        listHandler.addItem(TextListItem, {
            caption: 'Tags',
            mapTo: 'tags.title',
            ifEmpty: '<span style="opacity: 0.5">No tags</span>'
        });

        listHandler.addItem(BlipListItem, {
            caption: 'Published',
            mapTo: 'published'
        });

        listHandler.addItem(ButtonListItem, {
            caption: 'Buttons',
            mapTo: function() {
                return 'Quick edit';
            },
            action: function(model) {

                ExternalAdmin.open({
                    controllerName: 'page',
                    controllerMethod: 'edit',
                    controllerMethodParams: [model.get('id')]
                });

            }
        });

        listHandler.addItem(ContextMenu, {
            caption: 'Actions',
            items: [
                {caption: 'Edit', action: 'editItem'},
                {caption: 'Delete', action: 'deleteItem', confirm: true}
            ]
        });

    },

    setupEdit: function(editHandler, method, id) {

        this.addToIndexControl().addSaveControl();

        editHandler.addField(TextInput, {
            label: 'Title',
            name: 'title',
            attributes: {
                input: {className: 'inputType2 size2'}
            }
        });

        editHandler.addField(MultipleSelectInput, {
            name: 'tags',
            label: 'Tags',
            relation: {type: 'hasMany', resourceName: 'tag'},
            selectOptions: {
                url: app.get('router').apiUrl('tag'),
                mapCaptionTo: 'title'
            }
        });

        editHandler.addField(HtmlInput, {
            label: 'Body text',
            name: 'bodyText'
        });

    }

});
