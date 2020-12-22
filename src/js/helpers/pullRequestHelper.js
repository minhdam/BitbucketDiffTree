(function(PullRequestModel) {
	'use strict';

	var PullRequestHelper = {

		getPullRequestMetadata: function() {
			var $body = $('body');
			var oCurrentUser = $body.data('current-user');
			var oCurrentRepo = $body.data('current-repo');
			var oCurrentPr = $body.data('current-pr');

			var pullRequestModel = new PullRequestModel();

			try {
				pullRequestModel.userId = oCurrentUser.uuid;
				pullRequestModel.pullRequestId = oCurrentPr.localId;
				pullRequestModel.repoFullSlug = oCurrentRepo.fullslug;
			} catch {
			}

			return pullRequestModel;
		},

	};

	// Export via namespace
	BDT.Helpers.PullRequestHelper = PullRequestHelper;
	
})(BDT.Models.PullRequestModel);