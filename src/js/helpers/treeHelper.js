(function() {
	'use strict';

	var TreeHelper = function($treeContainer) {
		var _$treeContainer = $treeContainer;

		/**
		 * Get a node id
		 * @param {object} obj Node id or node DOM
		 */
		function getNodeId(obj) {
			var nodeId;
			
			if (obj && obj instanceof jQuery) {
				nodeId = obj.attr('id');
			} else {
				nodeId = obj;
			}

			return nodeId;
		}

		/**
		 * Get a node
		 * @param {object} obj	Node id or node DOM
		 */
		function getNode(obj) {
			var nodeId = getNodeId(obj);
			return _$treeContainer.jstree(true).get_node(nodeId);
		}

		/**
		 * Select a node
		 * @param {object} obj	Node id or node DOM 
		 */
		function selectNode(obj) {
			var nodeId = getNodeId(obj);
			//openParentNodes(nodeId);
			_$treeContainer.jstree(true).select_node(nodeId);
		}

		/**
		 * Show an array of nodes
		 * @param {object[]} objs	An array of node ids or node DOMs
		 */
		function showNodes(objs) {
			objs.each(function() {
				var node = getNode($(this));
				_$treeContainer.jstree(true).show_node(node);
			});
		}

		/**
		 * Show all nodes
		 */
		function showAllNodes() {
			_$treeContainer.jstree(true).show_all();
			// _$treeContainer.find('.jstree-node').removeClass('jstree-hidden jstree-leaf');
			// _$treeContainer.find('.jstree-node.isLeaf').addClass('jstree-leaf');
		}

		/**
		 * Hide an array of nodes
		 * @param {object[]} objs	An array of node ids or node DOMs
		 */
		function hideNodes(objs) {
			objs.each(function() {
				var node = getNode($(this));
				_$treeContainer.jstree(true).hide_node(node);
			});
		}

		/**
		 * Hide all nodes
		 */
		function hideAllNodes() {
			_$treeContainer.jstree(true).hide_all();
		}

		function openParentNodes(nodeId) {
			var parentNodeId = _$treeContainer.jstree(true).get_parent(nodeId);
			console.log('before: ' + parentNodeId);
			if (!parentNodeId || parentNodeId === '#') return;
			if (_$treeContainer.jstree(true).is_open(parentNodeId)) return;

			openParentNodes(parentNodeId);
			console.log('after: ' + parentNodeId);
			_$treeContainer.jstree(true).open_node(parentNodeId);
		}

		function deselectAllNodes() {
			_$treeContainer.jstree(true).deselect_all();
		}

		/**
		 * Toggle a node
		 * @param {object} obj	Node id or node DOM 
		 */
		function toggleNode(obj) {
			var nodeId = getNodeId(obj);
			_$treeContainer.jstree(true).toggle_node(nodeId);
		}

		function expandAllNodes() {
			_$treeContainer.jstree('open_all');
		}

		function collapseAllNodes() {
			_$treeContainer.jstree('close_all');
		}

		function redraw() {
			_$treeContainer.jstree(true).redraw(true);
		}

		return {
			getNode: getNode,
			toggleNode: toggleNode,
			selectNode: selectNode,
			showNodes: showNodes,
			showAllNodes: showAllNodes,
			hideNodes: hideNodes,
			hideAllNodes: hideAllNodes,
			deselectAllNodes: deselectAllNodes,
			expandAllNodes: expandAllNodes,
			collapseAllNodes: collapseAllNodes,
			redraw: redraw,
		}
	}

	// Export via namespace
	BDT.Helpers.TreeHelper = TreeHelper;
	
})();