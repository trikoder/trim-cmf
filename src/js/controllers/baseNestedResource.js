var _ = require('underscore');
var NestedResourceList = require('js/components/nestedResourceList');
var BaseResource = require('js/controllers/baseResource');
var router = require('js/app').get('router');

module.exports = BaseResource.extend({

    defaults: _.extend({}, BaseResource.prototype.defaults, {
        resourceListHandler: NestedResourceList
    }),

    resourceConfigDefaults: {
        mapParentTo: 'parent',
        mapChildrenTo: 'children',
        mapLevelTo: undefined,
        mapIsLeafTo: undefined,
        addNestedCreateControl: true
    },

    initialize: function() {

        BaseResource.prototype.initialize.apply(this, arguments);
        this.resourceConfig = _.extend({}, this.resourceConfigDefaults, this.resourceConfig);

    },

    index: function(params) {

        BaseResource.prototype.index.apply(this, arguments);

        if (this.listOpenedNodesState) {
            this.listHandler.setOpenedNodesState(this.listOpenedNodesState);
        }

        this.listenTo(this.listHandler, 'openedNodesStateChange', function(openedNodesState) {
            this.listOpenedNodesState = openedNodesState;
        });

    },

    getListHandlerOptions: function(params) {

        var baseOptions = BaseResource.prototype.getListHandlerOptions.apply(this, arguments);

        return _.extend({}, baseOptions, _.pick(this.resourceConfig, _.keys(NestedResourceList.prototype.defaults)));

    },

    create: function(params) {

        BaseResource.prototype.create.apply(this, arguments);

        var parentRelationMapping = this.resourceConfig.mapParentTo;
        var parentRelationReference;

        if (params && params[parentRelationMapping]) {
            parentRelationReference = params[parentRelationMapping];
        } else if (!this.options.isExternal && router.getQueryParam(parentRelationMapping)) {
            parentRelationReference = router.getQueryParam(parentRelationMapping);
        }

        if (parentRelationReference) {

            this.editHandler
                .getFieldInstance(parentRelationMapping)
                .setValue(parentRelationReference, {render: true});

        }

    }

});
