(function(){
	'use trict';
	
	var TreeNodeModel = function() {
		var _this = this;

		_this.childrens = {};
		
		_this.data = {
			isLeaf: false,
			link: null,
			folderCount: 0,
			fileCount: 0,
			fileStatus: null,
			commentCount: 0
		}
	}

	BDT.Models.TreeNodeModel = TreeNodeModel;
})();