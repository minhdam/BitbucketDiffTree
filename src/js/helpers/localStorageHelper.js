(function() {
	'use strict';

	var LocalStorageHelper = {

		getAllSettings: function(fnCallback) {
			chrome.storage.sync.get([
				'enableAlways', 
				'useCompactMode', 
				'version', 
				'diffTreeWidth'
			], function(settings) {
				if (fnCallback) {
					fnCallback.call(this, settings);
				}
			});
		},

		setUseCompactModeSetting: function(bUseCompactMode, fnCallback) {
			chrome.storage.sync.set({ 'useCompactMode': bUseCompactMode }, function() {
				if (fnCallback) {
					fnCallback.call(this);
				}
			});
		},

		setVersionSetting: function(version, fnCallback) {
			chrome.storage.sync.set({ 'version': version }, function() {
				if (fnCallback) {
					fnCallback.call(this);
				}
			});
		},

		setDiffTreeWidth: function(diffTreeWidth, fnCallback) {
			chrome.storage.sync.set({ 'diffTreeWidth': diffTreeWidth }, function() {
				if (fnCallback) {
					fnCallback.call(this);
				}
			});
		},

		/**
		 * Get the pull request status
		 * Returns: An object of 
		 * 	{ 
		 *		fileIdentifier1: { isReviewed: true }, 
		 *		fileIdentifier2: { isReviewed: false }, 
		 *		... 
		 *	}
		 */
		getPullRequestStatus: function(oPullRequestModel, fnCallback) {
			var key = 'userid_' + oPullRequestModel.userId 
					+ '_prid_' + oPullRequestModel.pullRequestId 
					+ '_repo_' + oPullRequestModel.repoFullSlug;

			chrome.storage.sync.get(key, function(data) { 
				/* data is a json object of
					{
						key: { 
							fileIdentifier1: { isReviewed: true }, 
							fileIdentifier2: { isReviewed: false }, 
							... 
						}
					}
				*/

				if (fnCallback) {
					fnCallback.call(this, data[key] || {});
				}
			});
		},

		setPullRequestStatus: function(oPullRequestModel, sFileIdentifier, bValue, fnCallback) {
			var key = 'userid_' + oPullRequestModel.userId 
					+ '_prid_' + oPullRequestModel.pullRequestId 
					+ '_repo_' + oPullRequestModel.repoFullSlug;

			//chrome.storage.sync.remove(key);

			LocalStorageHelper.getPullRequestStatus(oPullRequestModel, function(oData) {
				if (!oData[sFileIdentifier]) {
					oData[sFileIdentifier] = { isReviewed: false };
				}

				oData[sFileIdentifier].isReviewed = bValue;

				var obj = {};
				obj[key] = oData;
				chrome.storage.sync.set(obj, function() {
					if (fnCallback) {
						fnCallback.call(this, oData);
					}
				});
			});
		}
	};

	// Export via namespace
	BDT.Helpers.LocalStorageHelper = LocalStorageHelper;
	
})();