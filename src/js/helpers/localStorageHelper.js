(function() {
	'use strict';

	var LocalStorageHelper = {

		getAllSettings: function(fnCallback) {
			chrome.storage.local.get([
				'enableAlways', 
				'useCompactMode', 
				'version', 
				'diffTreeWidth',
				'diffTreeHeight'
			], function(settings) {
				if (fnCallback) {
					fnCallback.call(this, settings);
				}
			});
		},

		setUseCompactModeSetting: function(bUseCompactMode, fnCallback) {
			chrome.storage.local.set({ 'useCompactMode': bUseCompactMode }, function() {
				if (fnCallback) {
					fnCallback.call(this);
				}
			});
		},

		setVersionSetting: function(version, fnCallback) {
			chrome.storage.local.set({ 'version': version }, function() {
				if (fnCallback) {
					fnCallback.call(this);
				}
			});
		},

		setDiffTreeWidth: function(diffTreeWidth, fnCallback) {
			chrome.storage.local.set({ 'diffTreeWidth': diffTreeWidth }, function() {
				if (fnCallback) {
					fnCallback.call(this);
				}
			});
		},

		setDiffTreeHeight: function(diffTreeHeight, fnCallback) {
			chrome.storage.local.set({ 'diffTreeHeight': diffTreeHeight }, function() {
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

			chrome.storage.local.get(key, function(data) { 
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

		setPullRequestStatus: function(oPullRequestModel, sFileIdentifier, bValue, sContentHash, fnCallback) {
			var key = 'userid_' + oPullRequestModel.userId 
					+ '_prid_' + oPullRequestModel.pullRequestId 
					+ '_repo_' + oPullRequestModel.repoFullSlug;

			//chrome.storage.local.remove(key);

			LocalStorageHelper.getPullRequestStatus(oPullRequestModel, function(oData) {
				if (!oData[sFileIdentifier]) {
					oData[sFileIdentifier] = { isReviewed: false };
				}

				oData[sFileIdentifier].isReviewed = bValue;

				if (sContentHash !== undefined) {
					// only save the hash if it was provided
					oData[sFileIdentifier].contentHash = sContentHash;
				}

				var obj = {};
				obj[key] = oData;
				chrome.storage.local.set(obj, function() {
					if (chrome.runtime.lastError)
					{
							/* error */
							console.log(chrome.runtime.lastError.message);
							return;
					}
	
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