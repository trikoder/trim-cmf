var assert = require('chai').assert;
var $ = require('jquery');
var BaseElement = require('js/formElements/baseElement');

describe('FORM ELEMENT: base element', function() {

    describe('Setup base element', function() {

        var baseElement = new BaseElement();

        baseElement.initialize({
            options:{
                name: 'elementName',
                label: 'elementLabel',
                value: 'testValue',
                isPreview: true,
                attributes: { 'input' : 'test' }
            },
        });

        after(function(){

            baseElement.remove();

        });

        it('render baseElement with options', function() {

            baseElement.render();

            assert.isObject(baseElement);
            assert.equal(baseElement.$el.length, 1);
            assert.equal(baseElement.getName(),'elementName');
            assert.equal(baseElement.getValue(),'testValue');
            assert.equal(baseElement.$el.find('label').text(),'elementLabel');

            baseElement.setValue(123, {render: true});
            assert.equal(baseElement.getValue(), 123);

            baseElement.setValue(['value2']);
            assert.equal(baseElement.getValue(), 'value2');

        });

        it('add and remove error message', function() {

            baseElement.$input = $('<input type="checkbox">');

            baseElement.setErrorMessage('Error happened');
            assert.equal(baseElement.$el.find('span').length, 1);
            assert.equal(baseElement.$el.find('span').text(), 'Error happened');
            assert.isTrue(baseElement.$input.hasClass('withError'));
            assert.isTrue(baseElement.$el.hasClass('withError'));

            baseElement.removeErrorMessage();
            assert.isFalse(baseElement.$input.hasClass('withError'));
            assert.isFalse(baseElement.$el.hasClass('withError'));

        });

    });

    it('has static method getType', function() {

        var testElement = BaseElement.extend({

            elementType: 'testElement'

        });

        assert.equal(testElement.getType(), 'testElement');

    });

});