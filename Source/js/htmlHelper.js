(function() {
	'use strict';

	BDT.Helpers.HtmlHelper = {

		buildTreeHtml: function(treeObject) {
			var keys = Object.keys(treeObject)
				.filter(function(item) {
					return item !== "data";
				});

			if (keys.length === 0) {
				return '';
			}

			var treeHtml = '<ul>';
			keys.forEach(function(key, index) {
				var data = treeObject[key].data;
				var className = '';
				var content;

				if (data.isLeaf) {
					className += 'isLeaf ';
				}

				treeHtml += '<li class="' + className + '" data-file-identifier="' + data.link + '" data-file-name="' + key + '">';
				if (data.isLeaf) {
					content =
						BDT.Helpers.HtmlHelper.buildFileIconHtml() +
						'&nbsp;' +
						BDT.Helpers.HtmlHelper.buildLozengeFileStatusHtml(data.fileStatus) +
						'&nbsp;' +
						key +
						'&nbsp' +
						BDT.Helpers.HtmlHelper.buildCommentCountBadgeHtml(data.commentCount);

					treeHtml += '<a href="#" title="' + key + '">' + content + '</a>';
				}
				else {
					content =
						BDT.Helpers.HtmlHelper.buildFolderOpenIconHtml() +
						'&nbsp;' +
						key;

					treeHtml += '<a href="#" title="' + key + '">' + content + '</a>';
				}

				// Build child nodes recursively
				treeHtml += BDT.Helpers.HtmlHelper.buildTreeHtml(treeObject[key]);

				treeHtml += '</li>';
			});

			treeHtml += '</ul>';

			return treeHtml;
		},

		buildTreeAsSidebarHtml: function() {
			
		},

		buildDiffTreeActionsPanelHtml: function() {
			return '<div class="dt-actions">' +
					'<a id="btnRemoveDiffTree" href="#" class="dt-action-item"><span class="aui-icon aui-icon-small aui-iconfont-remove-label">Remove</span></a>' +
					'<a id="btnCollapseExpandDiffTree" href="#" class="dt-action-item"><span class="aui-icon aui-icon-small aui-iconfont-arrows-left">Collapse</span></a>' +
				'</div>';
		},

		buildLozengeFileStatusHtml: function(fileStatus) {
			var result = '';

			switch (fileStatus) {
				case 0: //file added
					result = '<span class="aui-lozenge aui-lozenge-subtle aui-lozenge-success" original-title="Added">A</span>';
					break;
				case 1: //file modified
					result = '<span class="aui-lozenge aui-lozenge-subtle aui-lozenge-complete" original-title="Modified">M</span>';
					break;
				case 2: //file deleted
					result = '<span class="aui-lozenge aui-lozenge-subtle aui-lozenge-error" original-title="Deleted">D</span>';
					break;
				case 3: //file conflicted
					result = '<span class="aui-lozenge aui-lozenge-current" original-title="Conflict: File modified in both source and destination">C</span>';
					break;
			}

			return result;
		},

		buildCommentCountBadgeHtml: function(count) {
			if (count && count > 0) {
				return '<div class="count-badge">' +
					'<span class="aui-icon aui-icon-small aui-iconfont-comment">Comments</span>' +
					'<span class="count">' +
					count +
					'</span>' +
					'</div>';
			}

			return '';
		},

		buildFileIconHtml: function() {
			return '<span class="jstree-node-icon aui-icon aui-icon-small aui-iconfont-devtools-file">File</span>';
		},

		buildFolderOpenIconHtml: function() {
			return '<span class="jstree-node-icon aui-icon aui-icon-small aui-iconfont-devtools-folder-open" style="color:#0075B1;">Folder open</span>';
		},

		buildFolderCloseIconHtml: function() {
			return '<span class="jstree-node-icon aui-icon aui-icon-small aui-iconfont-devtools-folder-closed" style="color:#0075B1;">Folder closed</span>';
		}
	};
})();