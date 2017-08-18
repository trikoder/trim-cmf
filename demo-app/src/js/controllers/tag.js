import BaseResource from 'js/controllers/baseResource';
import LinkListItem from 'js/listElements/link';
import TextListItem from 'js/listElements/text';
import TextInput from 'js/formElements/text';
import ContextMenu from 'js/listElements/contextMenu';

export default BaseResource.extend({

    resourceName: 'tag',
    resourceCaption: 'title',

    setupList: function(listHandler) {

        this.addCreateControl('Create new tag');

        //--------------------------------------------------------------
        // Filters
        //--------------------------------------------------------------
        listHandler.addFilter(TextInput, {
            name: 'title',
            label: 'Title'
        });

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
            }
        });

    }

});
