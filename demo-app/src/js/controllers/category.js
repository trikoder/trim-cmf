import app from 'js/app';
import BaseResource from 'js/controllers/baseResource';
import LinkListItem from 'js/listElements/link';
import TextListItem from 'js/listElements/text';
import BlipListItem from 'js/listElements/blip';
import TextInput from 'js/formElements/text';
import TextareaInput from 'js/formElements/textarea';
import SelectInput from 'js/formElements/select';
import NestedSelectInput from 'js/formElements/nestedSelect';
import ContextMenu from 'js/listElements/contextMenu';

export default BaseResource.extend({

    resourceName: 'category',
    resourceCaption: 'title',

    resourceConfig: {
        mapParentTo: 'parentCategory',
        mapChildrenTo: 'childCategories'
    },

    setupList: function(listHandler) {

        this.addCreateControl('Create new category');

        //--------------------------------------------------------------
        // Filters
        //--------------------------------------------------------------
        listHandler.addFilter(TextInput, {
            name: 'title',
            label: 'Title'
        });

        listHandler.addFilter(NestedSelectInput, {
            name: 'parentCategory',
            label: 'Parent category',
            mapCaptionTo: 'title',
            mapParentTo: 'parentCategory',
            mapChildrenTo: 'childCategories',
            apiUrl: app.get('router').apiUrl('category'),
            selectableLevel: 'all',
            relation: {type: 'hasOne', resourceName: 'category'}
        });

        listHandler.addItem(LinkListItem, {
            caption: 'Title',
            mapTo: 'title',
            action: 'editItem'
        });

        listHandler.addItem(TextListItem, {
            caption: 'Description',
            mapTo: 'description'
        });

        listHandler.addItem(BlipListItem, {
            caption: 'Published',
            mapTo: 'published'
        });

        listHandler.addItem(ContextMenu, {
            caption: 'Actions',
            items: [{caption: 'Edit', action: 'editItem'}]
        });

    },

    setupEdit: function(editHandler, method, id) {

        this.addToIndexControl().addSaveControl();

        editHandler.addField(TextInput, {
            label: 'Title',
            name: 'title',
            attributes: {
                input: {className: 'inputType2 size2'}
            },
            layoutReference: 'mainRegion'
        });

        editHandler.addField(TextareaInput, {
            label: 'Description',
            name: 'description',
            layoutReference: 'mainRegion'
        });

        editHandler.addField(NestedSelectInput, {
            name: 'parentCategory',
            label: 'Parent category',
            mapCaptionTo: 'title',
            mapParentTo: 'parentCategory',
            mapChildrenTo: 'childCategories',
            apiUrl: app.get('router').apiUrl('category'),
            selectableLevel: 'all',
            relation: {type: 'hasOne', resourceName: 'category'},
            layoutReference: 'sideRegion'
        });

        editHandler.addField(SelectInput, {
            label: 'Published status',
            name: 'published',
            castValueTo: 'boolean',
            attributes: {inputWrapper: {className: 'selectType1 fullWidth'}},
            selectOptions: [
                {caption: 'Published', value: true},
                {caption: 'Not published', value: false}
            ],
            layoutReference: 'sideRegion'
        });

        //--------------------------------------------------------------
        // Layout
        //--------------------------------------------------------------
        editHandler.setLayout({regions: ['main', 'side']});

    }

});
