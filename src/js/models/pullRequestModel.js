(function(){
	'use strict';
	
	var PullRequestModel = function() {
		var _this = this;

		_this.userId = null;
		_this.pullRequestId = null;
		_this.repoFullSlug = null;
	}

	// Export via name-space
	BDT.Models.PullRequestModel = PullRequestModel;

})();