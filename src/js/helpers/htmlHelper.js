(function() {
	'use strict';

	var HtmlHelper = {

		buildTreeHtml: function(oTreeNodeObject) {
			var childItems = oTreeNodeObject.getChildrenAsArray();

			if (childItems.length === 0) {
				return '';
			}

			var treeHtml = '<ul>';

			childItems.forEach(function(childItem, index) {
				var data = childItem.data;
				var className = '';
				var content;

				if (data.isLeaf) {
					className += 'isLeaf ';
				}

				if (data.commentCount > 0) {
					className += 'hasComment ';
				}

				if (data.isReviewed) {
					className += 'isReviewed ';
				}

				treeHtml += '<li class="' + className
					+ '" data-file-identifier="' + data.link
					+ '" data-file-name="' + data.name
					+ (data.isLeaf ? '" data-is-reviewed="' + data.isReviewed : '')
					+ '">';
				
				if (data.isLeaf) {
					content =
						HtmlHelper.buildFileIconHtml(data.isReviewed) + '&nbsp;' +
						HtmlHelper.buildLozengeFileStatusHtml(data.fileStatus) + '&nbsp;' +
						data.name + '&nbsp' +
						HtmlHelper.buildCommentCountBadgeHtml(data.commentCount);

					treeHtml += '<a href="#" title="' + data.name + '">' + content + '</a>';
				} else {
					content =
						HtmlHelper.buildFolderOpenIconHtml() + '&nbsp;' +
						data.name;

					treeHtml += '<a href="#" title="' + data.name + '">' + content + '</a>';
				}

				// Build child nodes recursively
				treeHtml += HtmlHelper.buildTreeHtml(childItem);

				treeHtml += '</li>';
			});

			treeHtml += '</ul>';

			return treeHtml;
		},

		buildTreeAsSidebarHtml: function() {
			
		},

		/**
		 * @param {object} options An object of 
		 * {
		 * 		bUseCompactMode: bool, 
		 * 		bShowFilesReviewed: bool, 
		 * 		bShowFilesUnreviewed: bool, 
		 * 		bShowFilesCommented: bool,
		 * }
		 */
		buildDiffTreeActionsPanelHtml: function(options) {
			var defaultOptions = {
				bUseCompactMode: false, 
				bShowFilesReviewed: false, 
				bShowFilesUnreviewed: false, 
				bShowFilesCommented: false,
			};

			options = $.extend({}, defaultOptions, options);

			var $html =  $('' +
				'<div class="dt-actions">' +
						'<div class="dt-action-group">' +
							'<a id="btnRemoveDiffTree" href="#" class="dt-action-item"><span class="aui-icon aui-icon-small aui-iconfont-remove-label" title="Remove diff tree">Remove diff tree</span></a>' +
						'</div>' +
						'<div class="dt-action-group dt-main-actions">' +
							'<a id="btnCompactEmptyFoldersToggle" href="#" class="dt-action-item" title="' + (options.bUseCompactMode ? 'Uncompact empty folders' : 'Compact empty folders') + '"><span class="aui-icon aui-icon-small ' + (options.bUseCompactMode ? 'aui-iconfont-focus' : 'aui-iconfont-unfocus') + '">Settings</span></a>' +
							'<a id="btnCollapseAllFolders" href="#" class="dt-action-item"><span class="aui-icon aui-icon-small aui-iconfont-up" title="Collapse all folders">Collapse all folders</span></a>' +
							'<a id="btnExpandAllFolders" href="#" class="dt-action-item"><span class="aui-icon aui-icon-small aui-iconfont-down" title="Expand all folders">Expand all folders</span></a>' +
						'</div>' +
						'<div class="dt-action-group dt-main-actions">' +
							'<a id="btnShowFilesReviewed" href=""#" class="dt-action-item" title="Show files reviewed"><span class="aui-icon aui-icon-small aui-iconfont-approve"></span></a>' +
							'<a id="btnShowFilesUnreviewed" href=""#" class="dt-action-item" title="Show files unreviewed"><span class="aui-icon aui-icon-small aui-iconfont-devtools-task-in-progress"></span></a>' +
							'<a id="btnShowFilesCommented" href=""#" class="dt-action-item" title="Show files commented"><span class="aui-icon aui-icon-small aui-iconfont-devtools-file-commented"></span></a>' +
						'</div>' +
						'<div style="padding: 10px; width: 100%;">' +
							'<div class="searchBox">' +
								'<input type="text" id="searchBox" placeholder="Search"/>' +
								'<span id="clearSearch" class="aui-icon aui-icon-small aui-iconfont-remove-label" />' +
							'</div>' +
						'</div>' +
				'</div>');

			$html.find('#btnShowFilesReviewed').toggleClass('selected', options.bShowFilesReviewed);
			$html.find('#btnShowFilesUnreviewed').toggleClass('selected', options.bShowFilesUnreviewed);
			$html.find('#btnShowFilesCommented').toggleClass('selected', options.bShowFilesCommented);

			return $('<div />').append($html).html();
		},

		buildDiffTreeFooterPanelHtml: function() {
			var manifestData = chrome.runtime.getManifest();

			return '<div class="dt-actions">' +
						'<div style="padding: 10px; width: 100%;">' +
							'v' + manifestData.version + '&nbsp;' +
							'<a id="newVersionIndicator" class="hidden" target="_blank" href="https://chrome.google.com/webstore/detail/bitbucket-diff-tree/pgpjdkejablgneeocagbncanfihkebpf" title="Please click here for the new release notes.">' + 
								'<span class="aui-icon aui-icon-small aui-iconfont-unstar">New release</span>' +
							'</a>' +
						'</div>' +
				'</div>';
		},

		buildLozengeFileStatusHtml: function(iFileStatus) {
			var sResult = '';

			switch (iFileStatus) {
				case 0: //file added
					sResult = '<span class="aui-lozenge aui-lozenge-subtle aui-lozenge-success fileStatus" original-title="Added">A</span>';
					break;
				case 1: //file modified
					sResult = '<span class="aui-lozenge aui-lozenge-subtle aui-lozenge-complete fileStatus" original-title="Modified">M</span>';
					break;
				case 2: //file deleted
					sResult = '<span class="aui-lozenge aui-lozenge-subtle aui-lozenge-error fileStatus" original-title="Deleted">D</span>';
					break;
				case 3: //file conflicted
					sResult = '<span class="aui-lozenge aui-lozenge-current fileStatus" original-title="Conflict: File modified in both source and destination">C</span>';
					break;
				case 4: //file renamed
					sResult = '<span class="aui-lozenge aui-lozenge-subtle aui-lozenge-moved fileStatus" original-title="Renamed">R</span>';
					break;
			}

			return sResult;
		},

		buildCommentCountBadgeHtml: function(iCount) {
			if (iCount && iCount > 0) {
				return '<div class="count-badge">' +
					'<span class="aui-icon aui-icon-small aui-iconfont-comment">Comments</span>' +
					'<span class="count">' +
					iCount +
					'</span>' +
					'</div>';
			}

			return '';
		},

		buildFileIconHtml: function(bIsReviewed) {
			var title = HtmlHelper.getMarkAsReviewedCheckboxTitle(bIsReviewed);
			return '<span class="jstree-node-icon aui-icon aui-icon-small aui-iconfont-devtools-task-in-progress fileIcon reviewed-checkbox" title="' + title + '">File</span>';
		},

		buildFolderOpenIconHtml: function() {
			return '<span class="jstree-node-icon aui-icon aui-icon-small aui-iconfont-devtools-folder-open folderIcon" style="color:#0075B1;">Folder open</span>';
		},

		buildFolderCloseIconHtml: function() {
			return '<span class="jstree-node-icon aui-icon aui-icon-small aui-iconfont-devtools-folder-closed folderIcon" style="color:#0075B1;">Folder closed</span>';
		},

		getMarkAsReviewedCheckboxTitle: function(bIsReviewed) {
			return bIsReviewed ? 'Click to unmark as reviewed' : 'Click to mark as reviewed';
		}
	};

	// Export via namespace
	BDT.Helpers.HtmlHelper = HtmlHelper;
	
})();