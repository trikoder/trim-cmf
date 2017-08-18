var assert = require('chai').assert;
var bootData = require('js/library/bootData');

describe('Boot data', function() {

    it('inserts and retrieves values', function() {

        var bootDataReturnValue = bootData.set({
            baseUrl: '/admin',
            app: {param1: true}
        });

        assert.strictEqual(bootDataReturnValue, bootData);
        assert.strictEqual(bootData('baseUrl'), '/admin');
        assert.strictEqual(bootData('app.param1'), true);
        assert.strictEqual(bootData('app.param3'), undefined);
        assert.strictEqual(bootData('someProp', 'somePropDefault'), 'somePropDefault');

    });

});
