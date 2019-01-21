(function (
	TreeNodeModel,
	PullRequestModel,
	HashingHelper,
	HtmlHelper,
	PullRequestHelper,
	LocalStorageHelper,
	TreeHelper,
	NewCommentObserver,
	FileChangesObserver) {

	'use strict';

	// Declare variables
	var _$pullRequestDiff,
		_$pullRequestDiffCompare,
		_$pullRequestTabNavigation,
		_$commitFilesSummary,
		_$diffSections;

	var _$diffTreeWrapper,
		_$diffTreeContainer,
		_$treeDiff,
		_$treeEmpty;

	var _newCommentObserver = new NewCommentObserver(),
		_fileChangesObserver = new FileChangesObserver();

	var _interval;

	var _treeObject;
	var _treeHelper;

	var _oPullRequestModel = new PullRequestModel();

	/**
	 * An object of
	 * 	{
	 * 		fileIdentifier1: { isReviewed: true },
	 * 		fileIdentifier2: { isReviewed: false },
	 * 		...
	 *  }
	 */
	var _oPullRequestFileStatuses; 

	var diffTreeOptions = {
		bUseCompactMode: false,
		bShowFilesReviewed: false, 
		bShowFilesUnreviewed: false, 
		bShowFilesCommented: false,
	}

	var _manifestData = chrome.runtime.getManifest();

	// Get the settings
	var _settings = {};
	LocalStorageHelper.getAllSettings(function(settings) {
		_settings = settings;

		diffTreeOptions.bUseCompactMode = _settings.useCompactMode;
		
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
					break;
				case 'disableDiffTree':
					disableDiffTree();
					break;
			}
		}
	});

	$(function() {
		_$pullRequestTabNavigation = $('#pullrequest-navigation, #compare-tabs');
		_oPullRequestModel = PullRequestHelper.getPullRequestMetadata();
		bindEvents();
	});

	function init() {
		_$pullRequestDiff = $('#pullrequest #pullrequest-diff, #branch-detail #compare-diff-content, #commit, #create-pullrequest #diff, #update-pullrequest #diff, #branch-compare #compare-diff-content');
		_$pullRequestDiffCompare = $('#pullrequest #compare, #branch-detail #changeset-diff.main, #commit #changeset-diff.main, #create-pullrequest #changeset-diff.main, #update-pullrequest #changeset-diff.main, #branch-compare #changeset-diff.main');
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
			_interval = setInterval(enableDiffTreeOnLoad, 50);
		} else {
			_interval = setInterval(disableDiffTreeOnLoad, 50);
		}

		// Force clear the _interval after 12 seconds to prevent infinite running
		setTimeout(function() {
			clearInterval(_interval);
		}, 12000);
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

	function enableDiffTree(bIsOnLoad) {
		bIsOnLoad = bIsOnLoad || false;

		if ($('#diffTreeContainer').length === 0) {
			init();

			_$commitFilesSummary.hide();
			_$diffSections.hide();

			buildDiffTreeAsync(diffTreeOptions, function() {
				bindDiffTreeEvents();
				showNewVersionIndicator();
				navigateToNodeInHash();

				if (!bIsOnLoad) {
					scrollToPullRequestSection();
				}
			});
		} else if (!bIsOnLoad) {
			scrollToPullRequestSection();
		}

		_newCommentObserver.startObserving(newCommentAdded);
		_fileChangesObserver.startObserving(enableDiffTree);
	}

	function disableDiffTree() {
		init();
		_$commitFilesSummary.show();
		_$diffSections.show();
		_$pullRequestDiff.append(_$pullRequestDiffCompare);
		_$diffTreeWrapper.remove();
		_$diffTreeContainer.remove();
		_$pullRequestDiffCompare.removeClass('diff-tree-aside');

		_newCommentObserver.stopObserving();
		_fileChangesObserver.stopObserving();
	}

	function bindEvents() {
		// when user change to "Overview" tab, the code changes is re-loaded, so we need to re-initialize the diff tree
		_$pullRequestTabNavigation.off('click', '#pr-menu-diff, #compare-diff-tab');
		_$pullRequestTabNavigation.on('click', '#pr-menu-diff, #compare-diff-tab',
			function() {
				tryToLoadDiffTreeTool();
			});
	}

	function bindDiffTreeEvents() {
		$(document).off('click', '#btnRemoveDiffTree');
		$(document).on('click', '#btnRemoveDiffTree', function(e) {
			e.preventDefault();
			disableDiffTree();
		});

		$(document).off('click', '#btnMinimizeDiffTree');
		$(document).on('click', '#btnMinimizeDiffTree', function(e) {
			e.preventDefault();
			minimizeDiffTree();
		});

		$(document).off('click', '#btnCompactEmptyFoldersToggle');
		$(document).on('click', '#btnCompactEmptyFoldersToggle', function(e) {
			e.preventDefault();
			compactEmptyFoldersToggle();
		});

		$(document).off('click', '#btnCollapseAllFolders');
		$(document).on('click', '#btnCollapseAllFolders', function(e) {
			e.preventDefault();
			collapseAllFolders();
		});

		$(document).off('click', '#btnExpandAllFolders');
		$(document).on('click', '#btnExpandAllFolders', function(e) {
			e.preventDefault();
			expandAllFolders();
		});

		$(document).off('click', '#btnShowFilesReviewed');
		$(document).on('click', '#btnShowFilesReviewed', function(e) {
			e.preventDefault();
			showFilesReviewed();
		});

		$(document).off('click', '#btnShowFilesUnreviewed');
		$(document).on('click', '#btnShowFilesUnreviewed', function(e) {
			e.preventDefault();
			showFilesUnreviewed();
		});

		$(document).off('click', '#btnShowFilesCommented');
		$(document).on('click', '#btnShowFilesCommented', function(e) {
			e.preventDefault();
			showFilesCommented();
		});

		$(document).off('click', '.reviewed-checkbox');
		$(document).on('click', '.reviewed-checkbox', function(e) {
			e.preventDefault();
			markAsReviewed($(this));
		});

		$(document).off('click', '#newVersionIndicator');
		$(document).on('click', '#newVersionIndicator', function(e) {
			markAsAwarenessOfNewVersion();
		});

		$(document).off('keyup', '#searchBox');
		$(document).on('keyup', '#searchBox', function(e) {
			var searchText = $(this).val();
			_$treeDiff.jstree('search', searchText);
			filterNodes(diffTreeOptions);
		});

		$(document).off('click', '#clearSearch');
		$(document).on('click', '#clearSearch', function(e) {
			_$treeDiff.jstree('clear_search');
			$('#searchBox').val('').focus();
		});

		$(document).off('click', '#clearFilter');
		$(document).on('click', '#clearFilter', function(e) {
			e.preventDefault();
			clearFilter();
		})
	}

	function minimizeDiffTree() {
		_$diffTreeContainer.toggleClass('expanded collapsed');
		_$pullRequestDiffCompare.toggleClass('expanded collapsed');

		$('#btnMinimizeDiffTree')
			.find('span.aui-icon')
			.toggleClass('aui-iconfont-arrows-left aui-iconfont-arrows-right');

		$('.dt-main-actions').toggleClass('hidden');
	}

	function compactEmptyFoldersToggle() {
		var useCompactMode = _settings.useCompactMode || false;
		useCompactMode = !useCompactMode;

		diffTreeOptions.bUseCompactMode = useCompactMode;

		buildDiffTreeAsync(diffTreeOptions);
		saveCompactModeSetting(useCompactMode);

		var title = useCompactMode ? 'Uncompact empty folders' : 'Compact empty folders';

		$('#btnCompactEmptyFoldersToggle')
			.find('span.aui-icon')
			.toggleClass('aui-iconfont-unfocus aui-iconfont-focus')
			.attr('title', title);
	}

	function expandAllFolders() {
		_treeHelper.expandAllNodes();
	}

	function collapseAllFolders() {
		_treeHelper.collapseAllNodes();
	}

	function saveCompactModeSetting(useCompactMode) {
		LocalStorageHelper.setUseCompactModeSetting(useCompactMode);
		_settings.useCompactMode = useCompactMode;
	}

	function getContentHash(sFileIdentifier) {
		var sDiffContentParentSelector = '.bb-udiff[data-identifier="' + sFileIdentifier + '"]'
		var sDiffContent = $(sDiffContentParentSelector).find('.udiff-line:not(.common) .source').toArray().map(d => d.textContent).join('\n');

		return HashingHelper.getHash(sDiffContent);
	}

	function markAsReviewed($icon) {
		var $node = $icon.closest('li[role=treeitem]');
		var sFileIdentifier = $node.data('file-identifier').replace('#chg-', '');
		var bIsReviewed = !$node.hasClass('isReviewed');

		var sContentHash = undefined;
		if (bIsReviewed) {
			sContentHash = getContentHash(sFileIdentifier)
		}

		LocalStorageHelper.setPullRequestStatus(_oPullRequestModel, sFileIdentifier, bIsReviewed, sContentHash, function(data) {
			_oPullRequestFileStatuses = data;
			updateFileReviewStatus($node, bIsReviewed);
			updateParentFoldersReviewStatus($node);
		});
	}

	function updateFileReviewStatus($node, bIsReviewed) {
		var $icon = $node.find('.fileIcon');
		var title = HtmlHelper.getMarkAsReviewedCheckboxTitle(bIsReviewed);
		setNodeReviewStatus($node, bIsReviewed);
		$icon.attr('title', title);
	}

	function markAsAwarenessOfNewVersion() {
		LocalStorageHelper.setVersionSetting(_manifestData.version);
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
					var sectionId = decodeURIComponent(fileIdentifier.replace('#', ''));
					var $section = $('section[id*="' + sectionId + '"]');
					$section.show();

					// Set the treeDiff height based on the height of the selected section
					var height = Math.max($section.height() - 100, 650);
					//_$treeDiff.height(height);

					// Set the url hash for the selected file
					//window.location.hash = fileIdentifier;
				} else {
					// Open/close the selected folder
					_treeHelper.toggleNode(data.node);
				}
			});

		_$treeDiff.on('open_node.jstree', onOpenNode);
	}

	function onOpenNode(event, data) {
		var queueChildNodeIds = [];

		data.node.children.forEach(function(nodeId) {
			queueChildNodeIds.push(nodeId);
		});

		while (queueChildNodeIds.length) {
			var childNodeId = queueChildNodeIds.shift();
			var $childNode = $('#' + childNodeId);
			var bIsReviewed = getNodeReviewStatus($childNode);
			updateFileReviewStatus($childNode, bIsReviewed);

			var oChildNode = _treeHelper.getNode(childNodeId);
			oChildNode.children.forEach(function(nodeId) {
				queueChildNodeIds.push(nodeId);
			});
		}
	}

	function buildDiffTreeAsync(options, fnCallback) {		
		LocalStorageHelper.getPullRequestStatus(_oPullRequestModel, function(data) {
			_oPullRequestFileStatuses = data;
			_treeObject = populateDiffTreeObject();

			if (options.bUseCompactMode) {
				_treeObject = compactEmptyFoldersDiffTreeObject(_treeObject);
			}
			
			attachDiffTreeHtml(_treeObject, options);
			initializeJsTree();
			bindJsTreeEvents();
			updateReviewStatusesForAllNodes();
			filterNodes(options);
			
			if (fnCallback) {
				fnCallback();
			}
		});
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
						item = tempObject.children[folder] = new TreeNodeModel(decodeURI(folder), index + 1);

						if (index === maxLevel - 1) {
							tempObject.data.fileCount++;
						} else {
							tempObject.data.folderCount++;
						}
					}

					// Leaf node which contains file name
					if (index === maxLevel - 1) {
						var bIsReviewed = _oPullRequestFileStatuses[fileName] !== undefined && _oPullRequestFileStatuses[fileName].isReviewed;
						if (bIsReviewed) {
							// if the file has been marked as reviewed, check whether its contents have actually changed.
							var reviewedHash = _oPullRequestFileStatuses[fileName] !== undefined && _oPullRequestFileStatuses[fileName].contentHash;
							var currentContentHash = getContentHash(fileName)

							if (reviewedHash !== currentContentHash) {
								// the content hash is different. This means that the file has actually
								// changed since it was last reviewed, so we unset the "reviewed" status.
								bIsReviewed = false;
							}
						}

						item.data.isLeaf = true;
						item.data.link = link;
						item.data.fileStatus = getFileStatus($self);
						item.data.commentCount = getFileCommentCount($self);
						item.data.isReviewed = bIsReviewed;
					}

					tempObject = tempObject.children[folder];
				});
			});
		
		//console.log(treeObject);

		return treeObject;
	}

	function compactEmptyFoldersDiffTreeObject(oTreeObject) {
		var compactTreeObject = oTreeObject.cloneDataOnly();
		compactTreeObject = compactEmptyFoldersRecursive(oTreeObject);

		return compactTreeObject;
	}

	function compactEmptyFoldersRecursive(oTreeNode) {
		var treeNodeResult = oTreeNode.cloneDataOnly();
		var parentNode = oTreeNode;

		if (oTreeNode.data.isLeaf) {
			return treeNodeResult;
		}

		if (oTreeNode.isRoot() === false &&
			oTreeNode.data.folderCount === 1 && 
			oTreeNode.data.fileCount === 0) {

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

	function attachDiffTreeHtml(oTreeObject, options) {
		// Remove the current tree diff if any to prevent duplicated
		_$pullRequestDiff.append(_$pullRequestDiffCompare);
		$('#diffTreeWrapper').remove();

		// Build diff tree html
		var diffTreeContainer = '<div id="diffTreeContainer" class="expanded">';
		diffTreeContainer += HtmlHelper.buildDiffTreeActionsPanelHtml(options);

		diffTreeContainer += '<div id="treeEmpty" class="hidden">No files found. <a id="clearFilter" href="javascript:void(0)">Clear filter.</a></div>';
		diffTreeContainer += '<div id="treeDiff">';
		diffTreeContainer += HtmlHelper.buildTreeHtml(oTreeObject);
		diffTreeContainer += '</div>'; // end of #treeDiff

		diffTreeContainer += '<div class="splitter-horizontal"></div>';

		diffTreeContainer += HtmlHelper.buildDiffTreeFooterPanelHtml();

		diffTreeContainer += '</div>'; // end of #difTreeContainer

		var $diffTreeWrapper = $('<div id="diffTreeWrapper" />');
		_$pullRequestDiff.append($diffTreeWrapper);
		$diffTreeWrapper
			.append(diffTreeContainer)
			.append('<div class="splitter"></div>')
			.append(_$pullRequestDiffCompare);
		
		_$pullRequestDiffCompare.addClass('diff-tree-aside');
		_$diffTreeWrapper = $('#diffTreeWrapper');
		_$diffTreeContainer = _$diffTreeWrapper.find('#diffTreeContainer');
		_$treeDiff = _$diffTreeWrapper.find('#treeDiff');
		_$treeEmpty = _$diffTreeWrapper.find('#treeEmpty');

		_treeHelper = new TreeHelper(_$treeDiff);

		if (_settings.diffTreeWidth) {
			_$diffTreeContainer.width(_settings.diffTreeWidth);
		}

		if (_settings.diffTreeHeight) {
			_$treeDiff.height(_settings.diffTreeHeight);
		}

		// Allow resizing the diff tree panel
		_$diffTreeContainer.resizable({
			handleSelector: ".splitter",
			resizeHeight: false,
			onDragEnd: function(e, $el, opt) {
				var width = _$diffTreeContainer.width();
				LocalStorageHelper.setDiffTreeWidth(width);
				_settings.diffTreeWidth = width;
			}
		});

		_$treeDiff.resizable({
			handleSelector: ".splitter-horizontal",
			resizeWidth: false,
			onDragEnd: function(e, $el, opt) {
				var height = _$treeDiff.height();
				LocalStorageHelper.setDiffTreeHeight(height);
				_settings.diffTreeHeight = height;
			}
		});

		$(window).scroll(function() { 
			let topSpacing = 25;
    		var el = document.getElementById("diffTreeContainer");

    		var viewportOffset = el.getBoundingClientRect();
			var top = viewportOffset.top;

			if(top <= topSpacing){
				var offset = (top * -1) + topSpacing;
				el.style.paddingTop = offset + "px";
			}else{
				el.style.paddingTop = "0px";
			}
		});
	}

	function initializeJsTree() {
		_$treeDiff.jstree({
			core: {
				multiple: false,
				dblclick_toggle: false
			},

			plugins: ["sort", "search"],

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
			},

			search: {
				show_only_matches: true,
				show_only_matches_children: true,
			},
		});

		// Expand all nodes
		expandAllFolders();
	}

	function showFirstFile() {
		var $firstFileNode = _$treeDiff.find('li.jstree-node.isLeaf:eq(0)');
		if ($firstFileNode.length > 0) {
			_treeHelper.selectNode($firstFileNode);
		}
	}

	function showNewVersionIndicator() {
		var $newVersionIndicator = $('#newVersionIndicator');
		var previousExtensionVersion = _settings.version;
		var currentExtenstionVersion = _manifestData.version;
		if (getMajorVersion(previousExtensionVersion) !== getMajorVersion(currentExtenstionVersion)) {
			$newVersionIndicator.removeClass('hidden');
		}
	}

	function getMajorVersion(version) {
		return version ? version.match(/\d+.\d+/g)[0] : '';
	}

	function scrollToPullRequestSection() {
		$('html, body')
			.animate({
				scrollTop: _$pullRequestDiff.offset().top
			}, 500);
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
		} else if ($iterableItem.hasClass('file-renamed')) {
			fileStatus = 4;
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

	function navigateToNodeInHash() {
		var hash = window.location.hash;
		showFirstFile();

		if (hash.indexOf('#chg-') === 0) { // file nagivation
			var $node = $('li[data-file-identifier*="' + hash + '"]');
			_treeHelper.selectNode($node);
		} else if (hash.indexOf('#comment-') === 0) { // comment navigation
			var $comment = $(hash);
			navigateToCommentNode($comment);
		}
	}

	function newCommentAdded(target, addedNode) {
		setTimeout(function () {
			var $addedNode = $(addedNode);
			if (!$addedNode.hasClass('comment')) {
				$addedNode = $addedNode.find('li.comment:first-child');
			}

			navigateToCommentNode($addedNode);
		}, 500);
	}

	function navigateToCommentNode($commentNode) {
		if ($commentNode.length === 0) return;

		// Select the file that contains the comment on diff tree
		var $section = $commentNode.closest('section.iterable-item.bb-udiff');
		var refUrl = $section.attr('id');
		var $treeNode = _$treeDiff.find('li.isLeaf[data-file-identifier*="' + refUrl + '"]');

		_treeHelper.deselectAllNodes();
		_treeHelper.selectNode($treeNode);

		scrollToCommentNode($commentNode);
	}

	function scrollToCommentNode($commentNode) {
		$commentNode = $($commentNode);
		if ($commentNode.length === 0) return;

		// Calculate the scroll offset
		var elOffset = $commentNode.offset().top;
		var elHeight = $commentNode.height();
		var windowHeight = $(window).height();

		var offset;
		if (elHeight < windowHeight) {
			offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
		}
		else {
			offset = elOffset;
		}

		// Animate and highlight the new comment node
		$commentNode.attr('style', 'background-color: #f5f5f5');
		$('html, body').stop().animate({
			scrollTop: offset
		}, 500, function () {
			setTimeout(function () {
				$commentNode.removeAttr('style');
			}, 1000);
		});
	}

	function updateReviewStatusesForAllNodes() {
		var $rootNodes = _$treeDiff.find('.jstree-container-ul.jstree-children').children();
		$rootNodes.each(function() {
			updateReviewStatusesRecursive($(this));
		});
	}

	function updateReviewStatusesRecursive($node) {
		$node = $($node);
		if ($node.hasClass('isLeaf')) {
			return $node.hasClass('isReviewed');
		}

		var bIsReviewed = true;
		var $childNodes = $node.find('.jstree-children').children('.jstree-node');
		$childNodes.each(function() {
			var bIsChildReviewed = updateReviewStatusesRecursive($(this));
			bIsReviewed = bIsReviewed && bIsChildReviewed;
		});

		setNodeReviewStatus($node, bIsReviewed);

		return bIsReviewed;
	}

	function updateParentFoldersReviewStatus($node) {
		var $parent = $node.parent().closest('.jstree-node');
		while ($parent.length > 0) {
			var bIsReviewed = $parent.find('.jstree-children').children('.jstree-node').not('.isReviewed').length === 0;
			setNodeReviewStatus($parent, bIsReviewed);
			
			$parent = $parent.parent().closest('.jstree-node');
		}
	}

	function getNodeReviewStatus($node) {
		var treeNode = _treeHelper.getNode($node);
		return treeNode.data.isReviewed;
	}

	function setNodeReviewStatus($node, bIsReviewed) {
		$node.toggleClass('isReviewed', bIsReviewed);
		$node.attr('data-is-reviewed', bIsReviewed);

		var treeNode = _treeHelper.getNode($node);
		treeNode.data.isReviewed = bIsReviewed;
	}

	function showFilesReviewed() {
		$('#btnShowFilesReviewed').toggleClass('selected');
		$('#btnShowFilesUnreviewed').removeClass('selected');
		filter();
	}

	function showFilesUnreviewed() {
		$('#btnShowFilesUnreviewed').toggleClass('selected');
		$('#btnShowFilesReviewed').removeClass('selected');
		filter();
	}

	function showFilesCommented() {
		$('#btnShowFilesCommented').toggleClass('selected');
		filter();
	}

	function filter() {
		var isShowFilesReviewed = $('#btnShowFilesReviewed').hasClass('selected');
		var isShowFilesUnreviewed = $('#btnShowFilesUnreviewed').hasClass('selected');
		var isShowFilesCommented = $('#btnShowFilesCommented').hasClass('selected');

		diffTreeOptions.bShowFilesReviewed = isShowFilesReviewed;
		diffTreeOptions.bShowFilesUnreviewed = isShowFilesUnreviewed;
		diffTreeOptions.bShowFilesCommented = isShowFilesCommented;

		buildDiffTreeAsync(diffTreeOptions);
	}

	function filterNodes(options) {
		if (options.bShowFilesReviewed) {
			_treeHelper.hideNodes($('.jstree-node.isLeaf:not(.isReviewed)'));
		}

		if (options.bShowFilesUnreviewed) {
			_treeHelper.hideNodes($('.jstree-node.isReviewed'));
		}

		if (options.bShowFilesCommented) {
			_treeHelper.hideNodes($('.jstree-node.isLeaf:not(.hasComment)'));
		}

		if (options.bShowFilesReviewed || options.bShowFilesUnreviewed || options.bShowFilesCommented) {
			hideEmptyFolders(_$treeDiff);
		}

		var isTreeEmpty = _$treeDiff.find('.jstree-node:not(.jstree-hidden)').length === 0;
		_$treeEmpty.toggleClass('hidden', !isTreeEmpty);
	}

	function hideEmptyFolders($liTreeNode) {
		var $childNodes = $liTreeNode.find('> ul.jstree-children > li.jstree-node:not(.isLeaf)');
		$childNodes.each(function() {
			hideEmptyFolders($(this));
		});

		$liTreeNode = $('#' + $liTreeNode.attr('id')); // to reload the latest DOM status
		var $visibleChildNodes = $liTreeNode.find('> ul.jstree-children > li.jstree-node:not(.jstree-hidden)');
		if ($liTreeNode.hasClass('jstree-node') && $visibleChildNodes.length === 0) {
			_treeHelper.hideNodes($liTreeNode);
		}
	}

	function clearFilter() {
		diffTreeOptions.bShowFilesReviewed = false;
		diffTreeOptions.bShowFilesUnreviewed = false;
		diffTreeOptions.bShowFilesCommented = false;
		buildDiffTreeAsync(diffTreeOptions);
	}

})(
	BDT.Models.TreeNodeModel,
	BDT.Models.PullRequestModel,
	BDT.Helpers.HashingHelper,
	BDT.Helpers.HtmlHelper,
	BDT.Helpers.PullRequestHelper,
	BDT.Helpers.LocalStorageHelper,
	BDT.Helpers.TreeHelper,
	BDT.DomObservers.NewCommentObserver,
	BDT.DomObservers.FileChangesObserver);