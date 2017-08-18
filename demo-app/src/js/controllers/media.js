import BaseMediaResource from 'js/controllers/baseMediaResource';
import MediaListItem from 'js/listElements/media';
import LinkListItem from 'js/listElements/link';
import TextListItem from 'js/listElements/text';
import MediaPreview from 'js/formElements/mediaPreview';
import TextInput from 'js/formElements/text';
import ContextMenu from 'js/listElements/contextMenu';

export default BaseMediaResource.extend({

    resourceName: 'media',
    resourceCaption: 'title',

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
            action: this.createImage
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

        //--------------------------------------------------------------
        // Filters
        //--------------------------------------------------------------
        listHandler.addFilter(TextInput, {
            name: 'title',
            label: 'Title'
        });

        listHandler.addFilter(TextInput, {
            name: 'caption',
            label: 'Caption'
        });

        //--------------------------------------------------------------
        // List template
        //--------------------------------------------------------------
        listHandler.setTemplate('cards');

        //--------------------------------------------------------------
        // List items
        //--------------------------------------------------------------

        listHandler.addItem(MediaListItem, {
            caption: 'Main media',
            mapTo: 'source'
        });

        listHandler.addItem(LinkListItem, {
            caption: 'Title',
            mapTo: 'title',
            action: 'editItem'
        });

        listHandler.addItem(TextListItem, {
            caption: 'Caption',
            mapTo: 'caption',
            escapeHtml: false
        });

        listHandler.addItem(TextListItem, {
            caption: 'Type',
            attributes: {className: 'textListItemType1 mod1'},
            mapTo: function(model) {
                return 'Type: ' + model.get('mediaType');
            }
        });

        listHandler.addItem(ContextMenu, {
            caption: 'Actions',
            items: [{caption: 'Edit', action: 'editItem'}]
        });

    },

    setupImageEdit: function(editHandler, method, id) {

        this.addToIndexControl().addSaveControl();

        editHandler.addField(MediaPreview, {
            label: 'Photography',
            name: 'mediaPreview'
        });

        editHandler.addField(TextInput, {
            label: 'Title',
            name: 'title',
            attributes: {
                input: {className: 'inputType2 size2'}
            }
        });

        editHandler.addField(TextInput, {
            label: 'Caption',
            name: 'caption'
        });

    },

    setupVideoEmbedEdit: function(editHandler) {

        this.addToIndexControl().addSaveControl();

        editHandler.addField(TextInput, {
            label: 'Title',
            name: 'title'
        });

        editHandler.addField(TextInput, {
            label: 'Embed code',
            name: 'embedCode'
        });

    },

    setupFileEdit: function(editHandler) {

        this.addToIndexControl().addSaveControl();

        editHandler.addField(TextInput, {
            label: 'Title',
            name: 'title'
        });

    }

});
