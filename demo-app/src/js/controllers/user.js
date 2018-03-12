import BaseResource from 'js/controllers/baseResource';
import LinkListItem from 'js/listElements/link';
import TextListItem from 'js/listElements/text';
import TextInput from 'js/formElements/text';
import IncludedAdmin from 'js/formElements/includedAdmin';
import ContextMenu from 'js/listElements/contextMenu';

export default BaseResource.extend({

    resourceName: 'user',
    resourceCaption: 'email',
    createRelatedStrategy: 'relatedLast',

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

        listHandler.addItem(TextListItem, {
            caption: 'Contact data',
            mapTo: model => model.get('contactData') && model.get('contactData').map(item => {
                return item.get('label') + ': ' + item.get('entry');
            }).join(' / '),
            ifEmpty: 'No contact data'
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

        editHandler.addField(IncludedAdmin, {
            label: 'Contacts',
            name: 'contactData',
            updatePosition: true,
            setupEdit: includedAdmin => {

                includedAdmin.addField(TextInput, {
                    label: 'Contact label',
                    name: 'label',
                });

                includedAdmin.addField(TextInput, {
                    label: 'Contact entry',
                    name: 'entry',
                });

            },
            relation: {type: 'hasMany', resourceName: 'userContactEntry'}
        });

    }

});
