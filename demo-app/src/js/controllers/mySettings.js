import BaseResourceEdit from 'js/controllers/baseResourceEdit';
import Entity from 'js/library/entity';
import TextInput from 'js/formElements/text';

export default BaseResourceEdit.extend({

    setupModel: function(callback) {

        Entity.Model.getFromApi({type: 'user', id: 1}, function(model) {
            callback.call(this, model);
        }, this);

    },

    setupEdit: function(editHandler, method, id) {

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
