(function(PullRequestModel) {
	'use strict';

	var PullRequestHelper = {

		getPullRequestMetadata: function() {
			var $body = $('body');
			var oCurrentUser = $body.data('current-user');
			var oCurrentRepo = $body.data('current-repo');
			var oCurrentPr = $body.data('current-pr');

			var pullRequestModel = new PullRequestModel();
			pullRequestModel.userId = oCurrentUser.uuid;
			pullRequestModel.repoFullSlug = oCurrentRepo.fullslug;

			return pullRequestModel;
		},

	};

	// Export via namespace
	BDT.Helpers.PullRequestHelper = PullRequestHelper;
	
})(BDT.Models.PullRequestModel);