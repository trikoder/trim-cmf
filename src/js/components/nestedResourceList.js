var $ = require('jquery');
var _ = require('underscore');
var ResourceList = require('js/components/resourceList');
var View = require('js/library/view');

module.exports = ResourceList.extend({

    defaults: _.extend({}, ResourceList.prototype.defaults, {
        mapParentTo: 'parent',
        mapChildrenTo: 'children',
        mapLevelTo: undefined,
        mapIsLeafTo: undefined,
        addNestedCreateControl: true
    }),

    initialize: function() {

        ResourceList.prototype.initialize.apply(this, arguments);

        this.on('setApiParams', function() {
            if (_.isEmpty(this.apiParams.filter)) {
                delete this.apiParams.page;
                this.setTemplate('tree');
                this.$el.addClass('nested');
            } else {
                this.setTemplate('table');
                this.$el.removeClass('nested');
            }
        });

    },

    events: {
        'click .nestedTable .treeBtn': function(e) {

            e.preventDefault();
            this.toggleRowTree($(e.target).closest('tr').data('viewInstance'));

        },
        'click .nestedTable .addChildEntity': function(e) {

            e.preventDefault();
            this.addChildEntity($(e.target).closest('tr').data('viewInstance'));

        }
    },

    renderItemsAsTree: function() {

        var template = require('templates/partials/resourceListTable.jst');
        var $table = $(template.render()).addClass('nestedTable');
        var $tableHead = $table.find('thead > tr');
        var $tableBody = $table.find('tbody');

        // table headings

        if (this.massActions) {
            $tableHead.append(this.massActions.getSelectAllElement({
                tagName: 'th',
                className: 'massActionCheckboxHeading'
            }));
        }

        _.each(this.listItemsDefinitions, function(listItemDefinition) {

            $tableHead.append(
                $('<th>')
                    .append(listItemDefinition.options.caption)
                    .addClass(listItemDefinition.Type.prototype.elementType + 'CellHeading')
            );

        }, this);

        if (this.options.addNestedCreateControl) {
            $tableHead.append('<th />');
        }

        this.entityCollection.chain().filter(function(model) {
            return this.getEntityLevel(model) === 0;
        }, this).each(function(model) {
            this.addView(this.getRowView({model: model}), 'rootRows').appendTo($tableBody);
        }, this);

        if (this.openedNodesState) {
            this.restoreOpenNodes(this.openedNodesState);
        }

        $table.appendTo(this.$itemListCont);

    },

    restoreOpenNodes: function(openNodesState, view) {

        var currentView = view || this;

        _.each(openNodesState, function(item) {

            var model = this.entityCollection.get(item.id);
            var rowView = _.find(currentView.views, function(view) {
                return model.get('id') === (view.model && view.model.get('id'));
            });

            if (rowView) {

                this.openRowTree(rowView);

                if (item.subTree) {
                    this.restoreOpenNodes(item.subTree, rowView);
                }

            }

        }, this);

    },

    getRowView: function(options) {

        options = _.extend({
            model: undefined,
            level: 0
        }, options);

        var model = options.model;
        var isLeaf = this.isLeaf(model);

        var $row = $('<tr />');
        var rowView = new View({el: $row, model: model});

        $row.data('viewInstance', rowView);

        if (this.massActions) {
            $row.append(this.massActions.getSelectRowElement({
                tagName: 'td',
                className: 'massActionCheckboxCell',
                model: model
            }));
        }

        _.each(this.listItemsDefinitions, function(listItemDefinition) {

            var itemView = this.prepareListItemView(model, listItemDefinition);
            itemView.render();

            $('<td>')
                .addClass(listItemDefinition.Type.prototype.elementType + 'Cell')
                .toggleClass('hiddenOnMobile', itemView.$el.hasClass('hiddenOnMobile'))
                .append(itemView.$el)
                .appendTo($row);

        }, this);

        var $firstCell = $row.find('td:first-child');

        !isLeaf && $firstCell.prepend(
            '<button type="button" class="treeBtn nBtn icr iconPlus"></button>'
        );

        _.each(_.range(options.level + 1 + (isLeaf ? 0 : -1)), function() {
            $firstCell.prepend('<span class="treeSpacer"></span>');
        });

        if (this.options.addNestedCreateControl) {
            $('<td>').append(this.getRowControls(rowView)).appendTo($row);
        }

        return rowView;

    },

    getRowControls: function(rowView) {

        var $controls = $('<div class="nestControls"></div>');

        if (this.options.addNestedCreateControl) {
            var createUrl = this.options.createUrl(_.object([this.options.mapParentTo], [rowView.model.get('id')]));
            $controls.append('<a class="addChildEntity nBtn icr iconPlus" href="' + createUrl + '"></a>');
        }

        return $controls;

    },

    openRowTree: function(rowView) {

        var model = rowView.model;

        if (!rowView.treeRendered) {

            var level = this.getEntityLevel(model);
            var children = this.getEntityChildren(model);
            var refInsertView = rowView;

            _.each(children.models ? children.models : children, function(childModel) {
                refInsertView = rowView.addView(this.getRowView({
                    model: childModel,
                    level: level + 1
                }), 'children').insertAfter(refInsertView);
            }, this);

            rowView.treeRendered = true;

        }

        rowView.treeOpened = true;

        _.each(rowView.getGroupViews('children'), function(childView) {
            childView.$el.removeClass('hidden');
        });

    },

    closeRowTree: function(rowView) {

        rowView.treeOpened = false;

        _.each(rowView.getGroupViews('children'), function(childView) {
            childView.$el.addClass('hidden');
            if (childView.treeOpened === true) {
                this.closeRowTree(childView);
            }
        }, this);

    },

    toggleRowTree: function(rowView) {

        rowView.treeOpened ? this.closeRowTree(rowView) : this.openRowTree(rowView);

        this.setOpenedNodesState(this.getOpenedNodesState());
        this.trigger('openedNodesStateChange', this.openedNodesState);

        return this;

    },

    addChildEntity: function(rowView) {

        this.options.openCreate(_.object([this.options.mapParentTo], [rowView.model.get('id')]));

    },

    setOpenedNodesState: function(state) {

        this.openedNodesState = state;
        return this;

    },

    getOpenedNodesState: function() {

        var getStateRecursive = function(views, listToWrite) {
            _.each(views, function(view) {
                if (view.treeOpened) {
                    var data = {id: view.model.get('id')};
                    var children = view.getGroupViews('children');
                    var subTree = children.length ? getStateRecursive(children, []) : undefined;
                    if (subTree && subTree.length) {
                        data.subTree = subTree;
                    }
                    listToWrite.push(data);
                }
            });
            return listToWrite;
        };

        return getStateRecursive(this.getGroupViews('rootRows'), []);

    },

    getEntityLevel: function(entityModel) {

        if (this.options.mapLevelTo) {
            return this.options.mapLevelTo(entityModel);
        } else {

            var parent = entityModel.get(this.options.mapParentTo);
            return parent ? 1 + this.getEntityLevel(parent) : 0;

        }

    },

    getEntityChildren: function(entityModel) {

        if (typeof this.options.mapChildrenTo === 'function') {
            return this.options.mapChildrenTo(entityModel, this.entityCollection);
        } else {
            return entityModel.get(this.options.mapChildrenTo);
        }

    },

    isLeaf: function(model) {

        if (this.options.mapIsLeafTo) {
            if (typeof this.options.mapIsLeafTo === 'function') {
                return this.options.mapIsLeafTo(model, this.entityCollection);
            } else {
                return model.get(this.options.mapIsLeafTo);
            }
        } else {
            return Boolean(this.getEntityChildren(model)) === false;
        }

    }

});
