import app from 'js/app';
import BaseResource from 'js/controllers/baseResource';
import LinkListItem from 'js/listElements/link';
import TextListItem from 'js/listElements/text';
import DateListItem from 'js/listElements/date';
import BlipListItem from 'js/listElements/blip';
import TextInput from 'js/formElements/text';
import TextareaInput from 'js/formElements/textarea';
import MediaInput from 'js/formElements/media';
import SelectInput from 'js/formElements/select';
import CheckboxInput from 'js/formElements/checkbox';
import DateInput from 'js/formElements/date';
import HtmlInput from 'js/formElements/html';
import MultipleSelectInput from 'js/formElements/multipleSelect';
import HiddenInput from 'js/formElements/hidden';
import MapInput from 'js/formElements/map';
import StateSelect from 'js/formElements/stateSelect';
import ExternalAdmin from 'js/formElements/externalAdmin';
import ContextMenu from 'js/listElements/contextMenu';

export default BaseResource.extend({

    resourceName: 'article',
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
            relation: {type: 'hasMany', resourceName: 'tag'}
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

        listHandler.addItem(DateListItem, {
            caption: 'Date',
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

        //--------------------------------------------------------------
        // Main content
        //--------------------------------------------------------------
        editHandler.addField(TextInput, {
            name: 'leadTitle',
            attributes: {
                input: {
                    placeholder: 'Article lead title',
                    title: 'Lead title',
                    style: 'border: 0; text-transform: uppercase; color: #999999; letter-spacing: 0.02em;'
                },
                wrapper: {
                    style: 'margin: 1.5em 0 0 0;'
                }
            },
            layoutReference: 'mainContent.mainRegion.group1'
        });

        editHandler.addField(TextareaInput, {
            name: 'title',
            attributes: {
                input: {
                    className: 'inputType2 size2 fontBold',
                    placeholder: 'Article title',
                    title: 'Title',
                    style: 'border: 0;'
                },
                wrapper: {
                    style: 'margin: 0 0 -0.5em 0;'
                }
            },
            layoutReference: 'mainContent.mainRegion.group1'
        });

        editHandler.addField(TextareaInput, {
            name: 'intro',
            attributes: {
                input: {
                    placeholder: 'Article intro',
                    title: 'Intro',
                    style: 'border: 0; resize: none; line-height: 1.5; font-size: 2em;'
                }
            },
            layoutReference: 'mainContent.mainRegion.group1'
        });

        editHandler.addField(MediaInput, {
            label: 'Main media',
            name: 'media',
            relation: {type: 'hasOne', resourceName: 'media'},
            attributes: {wrapper: {style: 'z-index: 10;'}},
            layoutReference: 'mainContent.mainRegion.group1'
        });

        editHandler.addField(MultipleSelectInput, {
            name: 'tags',
            label: 'Tags',
            relation: {type: 'hasMany', resourceName: 'tag'},
            selectOptions: {
                url: app.get('router').apiUrl('tag'),
                mapCaptionTo: 'title'
            },
            layoutReference: 'mainContent.mainRegion.group1'
        });

        editHandler.addField(HtmlInput, {
            label: 'Content',
            name: 'contentRaw',
            layoutReference: 'mainContent.mainRegion.group1'
        });

        editHandler.addField(HiddenInput, {
            name: 'latitude'
        });

        editHandler.addField(HiddenInput, {
            name: 'longitude'
        });

        //--------------------------------------------------------------
        // Main sidebar
        //--------------------------------------------------------------
        editHandler.addField(ExternalAdmin, {
            name: 'author',
            label: 'Autor',
            mapCaptionTo: 'email',
            relation: {type: 'hasOne', resourceName: 'user'},
            layoutReference: 'mainContent.sideRegion.group1'
        });

        editHandler.addField(DateInput, {
            name: 'publishDate',
            label: 'Date',
            attributes: {
                input: {className: 'inputType1 fullWidth'}
            },
            layoutReference: 'mainContent.sideRegion.group2'
        });

        editHandler.addField(StateSelect, {
            label: 'Proof read',
            name: 'proofreadStatus',
            attributes: {inputWrapper: {className: 'fullWidth'}},
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
            }],
            layoutReference: 'mainContent.sideRegion.group3'
        });

        editHandler.addField(StateSelect, {
            label: 'Graphics status',
            name: 'graphicsStatus',
            attributes: {inputWrapper: {className: 'fullWidth'}},
            states: [{
                value: '0',
                name: 'notApproved',
                caption: 'Not approved',
                actionCaption: 'Approve not needed',
                transitions: ['approveNeeded']
            }, {
                value: '1',
                name: 'approveNeeded',
                caption: 'Approve Needed',
                transitions: ['approved', 'notApproved']
            }, {
                value: '2',
                name: 'approved',
                caption: 'Approved',
                transitions: null
            }],
            layoutReference: 'mainContent.sideRegion.group3'
        });

        editHandler.addField(CheckboxInput, {
            label: 'Article is published',
            name: 'published',
            valueMap: {checked: true, unchecked: false},
            layoutReference: 'mainContent.sideRegion.group4'
        });

        //--------------------------------------------------------------
        // Secondary content
        //--------------------------------------------------------------
        editHandler.addField(TextInput, {
            name: 'metaTitle',
            label: 'Article meta title',
            layoutReference: 'seo'
        });

        editHandler.addField(TextareaInput, {
            name: 'metaDiscription',
            label: 'Article meta description',
            layoutReference: 'seo'
        });

        editHandler.addField(MapInput, {
            label: 'Location on map',
            name: 'location',
            layoutReference: 'seo'
        });

        //--------------------------------------------------------------
        // Custom logic
        //--------------------------------------------------------------
        this.listenTo(editHandler, 'change.location', this.setLocation);

        //--------------------------------------------------------------
        // Layout
        //--------------------------------------------------------------
        editHandler.setLayout({
            tabs: [{
                name: 'mainContent',
                caption: 'Content and settings',
                regions: {
                    main: {
                        groups: [{className: 'basicData'}]
                    },
                    side: {
                        groups: [
                            {className: 'layoutGroupType2'},
                            {className: 'layoutGroupType2'},
                            {className: 'layoutGroupType2'},
                            {className: 'layoutGroupType2'}
                        ]
                    }
                }
            }, {
                name: 'seo',
                caption: 'SEO i meta data'
            }]
        });

    },

    setLocation: function(value) {

        var location = value ? value.split(',') : [null, null];

        this.editHandler.getFieldInstance('latitude').setValue(location[0]);
        this.editHandler.getFieldInstance('longitude').setValue(location[1]);

    }

});
