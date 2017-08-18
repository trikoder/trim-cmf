var $ = require('jquery');
var assert = require('chai').assert;
var sinon = require('sinon');
var Select = require('js/formElements/select');
var EntityModel = require('js/library/entity').Model;

var sandbox;

var collectionResponse = {
    jsonapi: {
        version: '1.0'
    },
    meta: 2,
    data: [
        {
            type: 'user',
            id: '1',
            attributes: {
                name: 'Mike Hammer',
                email: 'mike.hammer@trikoder.net'
            }
        },
        {
            type: 'user',
            id: '2',
            attributes: {
                name: 'Mike Hammer alter ego',
                email: 'mike.plummer@trikoder.net'
            }
        }
    ]
};

beforeEach(function() {

    sandbox = sinon.sandbox.create();

});

afterEach(function() {

    sandbox.restore();

});

describe('FORM ELEMENT: select element', function() {

    it('render select', function() {

        var select = new Select({
            options: {
                castValueTo: 'integer',
                selectOptions: [{caption: 'first', value: 1}, {caption: 'second', value: 2}, {caption: 'third', value: null}]
            }
        });

        select.render();

        assert.equal(select.$el.length, 1);
        assert.equal(select.$el.find('button').text(), 'first');

        select.$el.find('select').val(2).trigger('change');
        assert.equal(select.$el.find('select').val(), 2);

    });

    it('render select with set value', function() {

        var select = new Select({
            options: {
                castValueTo: 'integer',
                value: 1,
                selectOptions: [{caption: 'first', value: 1}, {caption: 'second', value: 2}, {caption: 'third', value: null}]
            }
        });

        select.render();

        assert.equal(select.$el.length, 1);
        assert.equal(select.$el.find('button').text(), 'first');

        select.$el.find('select').val(2).trigger('change');
        assert.equal(select.$el.find('select').val(), 2);

    });

    it('can cast value to boolean', function() {

        var select = new Select({
            options: {
                castValueTo: 'boolean',
                selectOptions: [{caption: 'yes', value: 1}, {caption: 'no', value: 0}]
            }
        });

        select.render();

        select.$el.find('select').val(0).trigger('change');

    });

    it('render select with options generated from API collection', function() {

        var select = new Select({
            options: {
                name: 'author',
                label: 'Author',
                selectOptions: {
                    url: '/api/user',
                    mapCaptionTo: 'email',
                    prepend: [{caption: 'All', value: ''}]
                }
            }
        });

        sandbox.stub($, 'get').callsFake(function(url, callback) {

            callback(collectionResponse);

        });

        select.render();

        select.$el.find('option').each(function(index, item) {

            var $item = $(item);

            if (index === 0) {

                assert.equal($item.text(), 'All');
                assert.equal($item.val(), '');

            } else {

                assert.equal($item.text(), collectionResponse.data[index - 1].attributes.email);
                assert.equal($item.val(), collectionResponse.data[index - 1].id);

            }

        });

    });

    it('Get selected entity', function() {

        var select = new Select({
            options: {
                name: 'author',
                label: 'Author',
                selectOptions: {
                    url: '/api/user',
                    mapCaptionTo: 'email',
                    prepend: [{caption: 'All', value: ''}]
                }
            }
        });

        sandbox.stub($, 'get').callsFake(function(url, callback) {

            callback(collectionResponse);

        });

        select.render();

        assert.equal(select.getSelectedEntity(), undefined);

        select.$el.find('select').val(1).trigger('change');

        assert.equal(select.getSelectedEntity() instanceof EntityModel, true);
        assert.equal(select.getSelectedEntity('name'), collectionResponse.data[0].attributes.name);

    });

});
