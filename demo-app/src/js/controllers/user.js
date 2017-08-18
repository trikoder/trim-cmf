import BaseResource from 'js/controllers/baseResource';
import LinkListItem from 'js/listElements/link';
import TextListItem from 'js/listElements/text';
import TextInput from 'js/formElements/text';
import ContextMenu from 'js/listElements/contextMenu';

export default BaseResource.extend({

    resourceName: 'user',
    resourceCaption: 'email',

    setupList: function(listHandler) {

        this.addCreateControl('Create new user');

        //--------------------------------------------------------------
        // Filters
        //--------------------------------------------------------------
        listHandler.addFilter(TextInput, {
            name: 'email',
            label: 'Email'
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
            caption: 'Email',
            mapTo: 'email',
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
            label: 'Email',
            name: 'email',
            attributes: {
                input: {className: 'inputType2 size2'}
            }
        });

    }

});
