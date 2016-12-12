(function (TreeNodeModel, HtmlHelper, NewCommentObserver, FileChangesObserver) {
	'use strict';

	// Declare variables
	var _$pullRequestDiff,
		_$pullRequestDiffCompare,
		_$pullRequestTabNavigation,
		_$commitFilesSummary,
		_$diffSections;

	var _$diffTreeContainer,
		_$treeDiff;

	var _newCommentObserver = new NewCommentObserver(),
		_fileChangesObserver = new FileChangesObserver();

	var _interval;

	// Get the settings
	var _settings = {};
	chrome.storage.sync.get(null, function(settings) {
		_settings = settings;

		if (canApplyDiffTree()) {
			tryToLoadDiffTreeTool();
		}
	});

	// Message handler
	chrome.runtime.onMessage.addListener(function(msg, sender, response) {
		if (msg.from === 'popup') {
			switch (msg.action) {
				case 'enableDiffTree':
					enableDiffTree();
					break;;
				case 'disableDiffTree':
					disableDiffTree();
					break;
			}
		}
	});

	$(function() {
		_$pullRequestTabNavigation = $('#pullrequest-navigation, #compare-tabs');

		bindEvents();
	});

	function init() {
		_$pullRequestDiff = $('#pullrequest-diff, #diff, #compare-diff-content, #commit');
		_$pullRequestDiffCompare = _$pullRequestDiff.find('> #compare, > #changeset-diff.main');
		_$commitFilesSummary = _$pullRequestDiff.find('ul.commit-files-summary');
		_$diffSections = _$pullRequestDiff.find('section.iterable-item.bb-udiff');
	}

	function canApplyDiffTree() {
		return $('.diff').length > 0 // for pull request page
			|| $('#compare-content').length > 0 // for create pull request page
			|| $('#compare-tabs').length > 0 // for view branch page
			|| $('#commit').length > 0; // for commit page
	}

	function tryToLoadDiffTreeTool() {
		if (_settings.enableAlways) {
			_interval = setInterval(enableDiffTreeOnLoad, 500);
		} else {
			_interval = setInterval(disableDiffTreeOnLoad, 500);
		}

		// Force clear the _interval after 20 seconds to prevent infinite running
		setTimeout(function() {
			clearInterval(_interval);
		}, 20000);
	}

	function enableDiffTreeOnLoad() {
		if ($('ul.commit-files-summary').length > 0) {
			enableDiffTree(true);
			clearInterval(_interval);
		}
	}

	function disableDiffTreeOnLoad() {
		if ($('ul.commit-files-summary').length > 0) {
			clearInterval(_interval);
		}
	}

	function enableDiffTree(isOnLoad) {
		isOnLoad = isOnLoad || false;

		if ($('#diffTreeContainer').length === 0) {
			init();

			_$commitFilesSummary.hide();
			_$diffSections.hide();

			buildDiffTree();

			bindDiffTreeEvents();
			bindJsTreeEvents();

			showFirstFile();
		}

		if (!isOnLoad) {
			scrollToPullRequestSection();
		}

		_newCommentObserver.startObserving(newCommentAdded);
		_fileChangesObserver.startObserving(enableDiffTree);
	}

	function disableDiffTree() {
		init();
		_$commitFilesSummary.show();
		_$diffSections.show();
		_$diffTreeContainer.remove();
		_$pullRequestDiffCompare.removeClass('diff-tree');

		_newCommentObserver.stopObserving();
		_fileChangesObserver.stopObserving();
	}

	function bindEvents() {
		// when user change to "Overview" tab, the code changes is re-loaded, so we need to re-initialize the diff tree
		_$pullRequestTabNavigation.on('click', '#pr-menu-diff, #compare-diff-tab',
			function() {
				tryToLoadDiffTreeTool();
			});
	}

	function bindDiffTreeEvents() {
		_$diffTreeContainer.on('click',
			'#btnRemoveDiffTree',
			function(e) {
				e.preventDefault();
				disableDiffTree();
			});

		_$diffTreeContainer.on('click',
			'#btnCollapseExpandDiffTree',
			function(e) {
				e.preventDefault();

				_$diffTreeContainer.toggleClass('expanded collapsed');
				_$pullRequestDiffCompare.toggleClass('expanded collapsed');
				$('#btnCollapseExpandDiffTree')
					.find('span.aui-icon')
					.toggleClass('aui-iconfont-arrows-left aui-iconfont-arrows-right');
			});
	}

	function bindJsTreeEvents() {
		_$treeDiff.on('after_open.jstree',
			function(event, data) {
				$('#' + data.node.id)
					.find('> a .jstree-node-icon')
					.removeClass('aui-iconfont-devtools-folder-closed')
					.addClass('aui-iconfont-devtools-folder-open');
			});

		_$treeDiff.on('after_close.jstree',
			function(event, data) {
				$('#' + data.node.id)
					.find('> a .jstree-node-icon')
					.removeClass('aui-iconfont-devtools-folder-open')
					.addClass('aui-iconfont-devtools-folder-closed');
			});

		_$treeDiff.on('select_node.jstree',
			function(event, data) {
				var $node = $('#' + data.node.id);
				var fileIdentifier = $node.data('file-identifier');
				if (fileIdentifier) {
					// Hide the current section
					_$diffSections.hide();

					// Show the selected section
					var sectionId = fileIdentifier.replace('#', '').replace(/%20/g, ' ');
					var $section = $('section[id*="' + sectionId + '"]');
					$section.show();

					$node.addClass('already-reviewed');
				}
			});
	}

	function buildDiffTree() {
		var treeObject = populateDiffTreeObject();
		var compactTreeObject = compactEmptyFoldersDiffTreeObject(treeObject);
		buildDiffTreeHtml(compactTreeObject);
		
		initializeTree();
	}

	function populateDiffTreeObject() {
		var treeObject = new TreeNodeModel('root', 0);

		_$commitFilesSummary
			.find('li.iterable-item')
			.each(function() {
				var $self = $(this);
				var fileName = $self.data('file-identifier');
				var link = $self.find('a').attr('href');
				var folders = fileName.split('/');
				var maxLevel = folders.length;
				var tempObject = treeObject;

				folders.forEach(function(folder, index) {
					var item = tempObject.children[folder];

					if (!item) {
						item = tempObject.children[folder] = new TreeNodeModel(folder, index + 1);

						if (index === maxLevel - 1) {
							tempObject.data.fileCount++;
						} else {
							tempObject.data.folderCount++;
						}
					}

					// Leaf node which contains file name
					if (index === maxLevel - 1) {
						item.data.isLeaf = true;
						item.data.link = link;
						item.data.fileStatus = getFileStatus($self);
						item.data.commentCount = getFileCommentCount($self);
					}

					tempObject = tempObject.children[folder];
				});
			});
		
		//console.log(treeObject);

		return treeObject;
	}

	function compactEmptyFoldersDiffTreeObject(treeObject) {
		var compactTreeObject = treeObject.cloneDataOnly();
		compactTreeObject = compactEmptyFoldersRecursive(treeObject);
		//console.log(compactTreeObject);

		return compactTreeObject;
	}

	function compactEmptyFoldersRecursive(treeNode) {
		var treeNodeResult = treeNode.cloneDataOnly();
		var parentNode = treeNode;

		if (treeNode.data.isLeaf) {
			return treeNodeResult;
		}

		if (treeNode.isRoot() === false &&
			treeNode.data.folderCount === 1 && 
			treeNode.data.fileCount === 0) {

			var compactNodeName = parentNode.data.name;

			while (parentNode.data.folderCount === 1 && parentNode.data.fileCount === 0) {
				var firstFolderObject = parentNode.getChildByIndex(0);
				compactNodeName += '/' + firstFolderObject.data.name;
				parentNode = firstFolderObject;
			}

			treeNodeResult.data.name = compactNodeName;
		}

		var children = parentNode.getChildrenAsArray();
		children.forEach(function(child, index) {
			treeNodeResult.children[child.data.name] = compactEmptyFoldersRecursive(child);
		});

		return treeNodeResult;
	}

	function buildDiffTreeHtml(treeObject) {
		// Remove the current tree diff if any to prevent duplicated
		$('#diffTreeContainer').remove();

		// Build diff tree html
		var diffTreeContainer = '<div id="diffTreeContainer" class="expanded">';
		diffTreeContainer += HtmlHelper.buildDiffTreeActionsPanelHtml();

		diffTreeContainer += '<div id="treeDiff">';
		diffTreeContainer += HtmlHelper.buildTreeHtml(treeObject);
		diffTreeContainer += '</div>'; // end of #treeDiff

		diffTreeContainer += '</div>'; // end of #difTreeContainer

		_$pullRequestDiffCompare.before(diffTreeContainer);
		_$pullRequestDiffCompare.addClass('diff-tree');
		_$diffTreeContainer = $('#diffTreeContainer');
		_$treeDiff = $('#treeDiff');
	}

	function initializeTree() {
		_$treeDiff.jstree({
			core: {
				multiple: false
			},

			plugins: ["sort"],

			sort: function(a, b) {
				var node1 = this.get_node(a);
				var node2 = this.get_node(b);

				//Put the folder first and then file
				if (node1.children.length > 0 && node2.children.length === 0) {
					return -1;
				} else if (node1.children.length === 0 && node2.children.length > 0) {
					return 1;
				}

				//Sort by name
				return node1.data.fileName.toLowerCase() > node2.data.fileName.toLowerCase() ? 1 : -1;
			}
		});

		// Expand all nodes
		_$treeDiff.jstree("open_all");
	}

	function showFirstFile() {
		var $firstFileNode = _$treeDiff.find('li.jstree-node.isLeaf:eq(0)');
		if ($firstFileNode.length > 0) {
			_$treeDiff.jstree(true).select_node($firstFileNode);
		}
	}

	function scrollToPullRequestSection() {
		$('html, body')
			.animate({
					scrollTop: _$pullRequestDiff.offset().top
				},
				500);
	}

	function getFileStatus($iterableItem) {
		var fileStatus = null;

		if ($iterableItem.hasClass('file-added')) {
			fileStatus = 0;
		} else if ($iterableItem.hasClass('file-modified')) {
			fileStatus = 1;
		} else if ($iterableItem.hasClass('file-removed')) {
			fileStatus = 2;
		} else if ($iterableItem.hasClass('file-mergeconflict')) {
			fileStatus = 3;
		}

		return fileStatus;
	}

	function getFileCommentCount($iterableItem) {
		var count = 0;
		var $countBadge = $iterableItem.find('.count-badge');

		if ($countBadge.length === 1) {
			count = parseInt($countBadge.find('.count').text());
		}

		return count;
	}

	function newCommentAdded(target, addedNode) {
		var $section = $(target).closest('section.iterable-item.bb-udiff');
		var refUrl = $section.attr('id');
		var $treeNode = _$treeDiff.find('li.isLeaf[data-file-identifier*="' + refUrl + '"]');

		_$treeDiff.jstree(true).deselect_all();
		_$treeDiff.jstree(true).select_node($treeNode);

		setTimeout(function () {
			var $addedNode = $(addedNode);
			if (!$addedNode.hasClass('comment')) {
				$addedNode = $addedNode.find('li.comment:first-child');
			}

			scrollToNewCommentNode($addedNode);
		}, 500);
	}

	function scrollToNewCommentNode($addedNode) {
		var elOffset = $addedNode.offset().top;
		var elHeight = $addedNode.height();
		var windowHeight = $(window).height();

		var offset;
		if (elHeight < windowHeight) {
			offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
		}
		else {
			offset = elOffset;
		}

		// Animate and highlight the new comment node
		$addedNode.attr('style', 'background-color: #f5f5f5');
		$('html, body').stop().animate({
			scrollTop: offset
		}, 500, function () {
			setTimeout(function () {
				$addedNode.removeAttr('style');
			}, 1000);
		});
	}

})(
	BDT.Models.TreeNodeModel,
	BDT.Helpers.HtmlHelper,
	BDT.DomObservers.NewCommentObserver,
	BDT.DomObservers.FileChangesObserver);