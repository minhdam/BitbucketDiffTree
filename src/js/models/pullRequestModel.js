(function(){
	'use trict';
	
	var PullRequestModel = function() {
		var _this = this;

		_this.userId = null;
		_this.pullRequestId = null;
		_this.repoFullSlug = null;
	}

	// Export via namespace
	BDT.Models.PullRequestModel = PullRequestModel;

})();