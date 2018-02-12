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

				if (data.bIsReviewed) {
					className += 'isReviewed ';
				}

				treeHtml += '<li class="' + className
					+ '" data-file-identifier="' + data.link
					+ '" data-file-name="' + data.name
					+ (data.isLeaf ? '" data-is-reviewed="' + data.bIsReviewed : '')
					+ '">';
				
				if (data.isLeaf) {
					content =
						HtmlHelper.buildFileIconHtml(data.bIsReviewed) + '&nbsp;' +
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

		buildDiffTreeActionsPanelHtml: function(bUseCompactMode) {
			bUseCompactMode = bUseCompactMode || false;
			var manifestData = chrome.runtime.getManifest();

			return '<div class="dt-actions">' +
						'<div class="dt-action-group">' +
							//'<a id="btnMinimizeDiffTree" href="#" class="dt-action-item"><span class="aui-icon aui-icon-small aui-iconfont-arrows-left" title="Minimize diff tree">Minimize diff tree</span></a>' +
							'<a id="btnRemoveDiffTree" href="#" class="dt-action-item"><span class="aui-icon aui-icon-small aui-iconfont-remove-label" title="Remove diff tree">Remove diff tree</span></a>' +
						'</div>' +
						'<div class="dt-action-group dt-main-actions">' +
							'<a id="btnCompactEmptyFoldersToggle" href="#" class="dt-action-item" title="' + (bUseCompactMode ? 'Uncompact empty folders' : 'Compact empty folders') + '"><span class="aui-icon aui-icon-small ' + (bUseCompactMode ? 'aui-iconfont-focus' : 'aui-iconfont-unfocus') + '">Settings</span></a>' +
							'<a id="btnCollapseAllFolders" href="#" class="dt-action-item"><span class="aui-icon aui-icon-small aui-iconfont-up" title="Collapse all folders">Collapse all folders</span></a>' +
							'<a id="btnExpandAllFolders" href="#" class="dt-action-item"><span class="aui-icon aui-icon-small aui-iconfont-down" title="Expand all folders">Expand all folders</span></a>' +
						'</div>' +
						'<div style="padding: 10px; width: 100%;">' +
							// 'v' + manifestData.version + '&nbsp;' +
							// '<a id="newVersionIndicator" class="hidden" target="_blank" href="https://chrome.google.com/webstore/detail/bitbucket-diff-tree/pgpjdkejablgneeocagbncanfihkebpf" title="Please click here for the new release notes.">' + 
							// 	'<span class="aui-icon aui-icon-small aui-iconfont-unstar">New release</span>' +
							// '</a>' +
							'<div class="searchBox">' +
								'<input type="text" id="searchBox" placeholder="Search"/>' +
								'<span id="clearSearch" class="aui-icon aui-icon-small aui-iconfont-remove-label" />' +
							'</div>' +
						'</div>' +
				'</div>';
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