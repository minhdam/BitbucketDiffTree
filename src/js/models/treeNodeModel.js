(function(){
	'use trict';
	
	var TreeNodeModel = function(name, level) {
		var _this = this;

		_this.children = {};

		_this.data = {
			name: name,
			level: level,
			isLeaf: false,
			link: null,
			folderCount: 0,
			fileCount: 0,
			fileStatus: null,
			commentCount: 0,
			bIsReviewed: false
		}
	}

	TreeNodeModel.prototype.isRoot = function() {
		var _this = this;
		return _this.data.level === 0;
	}

	TreeNodeModel.prototype.cloneDataOnly = function() {
		var _this = this;
		var newObject = new TreeNodeModel(_this.data.name, _this.data.level);

		newObject.data = {
			name: _this.data.name,
			level: _this.data.level,
			isLeaf: _this.data.isLeaf,
			link: _this.data.link,
			folderCount: _this.data.folderCount,
			fileCount: _this.data.fileCount,
			fileStatus: _this.data.fileStatus,
			commentCount: _this.data.commentCount,
			bIsReviewed: _this.data.bIsReviewed
		};

		return newObject;
	}

	TreeNodeModel.prototype.getChildByIndex = function(index) {
		var _this = this;
		var childrenNames = Object.keys(_this.children);

		if (index < 0 || index > childrenNames.length - 1) {
			return null;
		}

		return _this.children[childrenNames[index]];
	};


	TreeNodeModel.prototype.getChildrenAsArray = function() {
		var _this = this;
		var children = [];
		var childrenNames = Object.keys(_this.children);

		childrenNames.forEach(function(name, index) {
			children.push(_this.children[name]);
		});

		return children;
	}

	TreeNodeModel.prototype.getFoldersAsArray = function() {
		var _this = this;
		var folders = [];
		var childrenNames = Object.keys(_this.children);

		childrenNames.forEach(function(name, index) {
			if (_this.children[name].data.isLeaf === false) {
				folders.push(_this.children[name]);
			}
		});

		return folders;
	}

	TreeNodeModel.prototype.getFilesAsArray = function() {
		var _this = this;
		var files = [];
		var childrenNames = Object.keys(_this.children);

		childrenNames.forEach(function(name, index) {
			if (_this.children[name].data.isLeaf === true) {
				files.push(_this.children[name]);
			}
		});

		return files;
	}

	// Export via namespace
	BDT.Models.TreeNodeModel = TreeNodeModel;

})();