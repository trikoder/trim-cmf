var assert = require('chai').assert;
var $ = require('jquery');
var EntityModel = require('js/library/entity').Model;
var StateSelect = require('inject-loader!js/formElements/stateSelect')({
    'js/library/entity': {
        Model: {
            create: function(data){ createCallback(data); return this; },
            setType: function(type){ setTypeCallback(type); return this; },
            saveOnly: function(options){ saveOnlyCallback(options); return this; }
        }
    }
});

var createCallback;
var setTypeCallback;
var saveOnlyCallback;

var states = [{
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
}];

var statesWithAllTransitions = [{
    value: '0',
    name: 'notProofread',
    caption: 'Not proofread',
    actionCaption: 'Proofread not needed',
    transitions: 'all'
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
}];

var statesWithoutName = [{
    value: 'notProofread',
    caption: 'Not proofread',
    actionCaption: 'Proofread not needed',
    transitions: ['proofreadNeeded']
}, {
    value: 'proofreadNeeded',
    caption: 'Proofread needed',
    transitions: ['proofreadDone', 'notProofread']
}, {
    value: 'proofreadDone',
    caption: 'Proofread done',
    transitions: null
}];

var model;
var modelWithExplicitValue;

beforeEach(function() {

    model = EntityModel.createFromApiData({
        data: {
            type: 'article',
            id: '1',
            attributes: {
                title: 'Article title',
                author: 'Mike Hammer',
                proofreadStatus: '0'
            }
        }
    });

    modelWithExplicitValue = EntityModel.createFromApiData({
        data: {
            type: 'article',
            id: '1',
            attributes: {
                title: 'Article title',
                author: 'Mike Hammer',
                proofreadStatus: 'notProofread'
            }
        }
    });

});

describe('FORM ELEMENT: state select element', function() {

    it('Render state select element and its states', function() {

        var stateSelectInput = new StateSelect({
            entityModel: model,
            options: {
                name: 'proofreadStatus',
                value: model.get('proofreadStatus'),
                updateEntityOnChange: true,
                updateControlCaption: 'update',
                states: states
            }
        });

        stateSelectInput.render();

        assert.equal(stateSelectInput.$inputWrapper.is('.stateSelectElement'), true);
        assert.equal(stateSelectInput.$inputWrapper.is('.withButton'), true);
        assert.equal(stateSelectInput.$currentStateCaption.text(), states[0].caption);
        assert.equal(stateSelectInput.$el.find('.updateBtn').text(), 'update');

        stateSelectInput.selectView.$el.find('option').each(function(index, item) {

            var $item = $(item);
            var stateIndex = $item.val();

            assert.equal($item.text(), states[stateIndex].caption);

        });

    });

    it('Render state select element states using value as name', function() {

        var stateSelectInput = new StateSelect({
            entityModel: modelWithExplicitValue,
            options: {
                name: 'proofreadStatus',
                value: modelWithExplicitValue.get('proofreadStatus'),
                updateEntityOnChange: true,
                states: statesWithoutName
            }
        });

        stateSelectInput.render();

        stateSelectInput.selectView.$el.find('option').each(function(index, item) {

            var $item = $(item);
            var stateValue = $item.val();

            assert.equal(statesWithoutName[0].transitions.indexOf(stateValue) > -1, true);

        });

    });

    it('Render state select and set current state with all transitions', function() {

        var stateSelectInput = new StateSelect({
            entityModel: model,
            options: {
                name: 'proofreadStatus',
                value: model.get('proofreadStatus'),
                updateEntityOnChange: true,
                states: statesWithAllTransitions
            }
        });

        stateSelectInput.render();

        stateSelectInput.selectView.$el.find('option').each(function(index, item) {

            var $item = $(item);
            var stateIndex = $item.val();

            assert.equal($item.val(), states[stateIndex].value);

        });

    });

    statesWithAllTransitions

    it('Selected state without update entity on change', function() {

        var stateSelectInput = new StateSelect({
            entityModel: model,
            options: {
                name: 'proofreadStatus',
                value: model.get('proofreadStatus'),
                updateEntityOnChange: false,
                states: states
            }
        });

        stateSelectInput.render();

        stateSelectInput.selectView.setValue('1');

        assert.equal(stateSelectInput.$inputWrapper.is('.withButton'), false);
        assert.equal(stateSelectInput.getValue(), '1');

    });

    it('Persist selected state', function() {

        var stateSelectInput = new StateSelect({
            entityModel: model,
            options: {
                name: 'proofreadStatus',
                value: model.get('proofreadStatus'),
                updateEntityOnChange: true,
                states: states
            }
        });

        createCallback = function(data) {
            assert.equal(data.id, model.get('id'));
            return this;
        };

        setTypeCallback = function(type) {
            assert.equal(type, model.getType());
            return this;
        };

        saveOnlyCallback = function(options) {
            model.set('proofreadStatus', '1');
            options.afterSave(model);
            assert.equal(stateSelectInput.getValue(), '1');
            return this;
        };

        stateSelectInput.render().setValue('1');

        stateSelectInput.$el.find('.updateBtn').trigger('click');

    });

});
