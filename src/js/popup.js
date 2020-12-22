(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded',
		function() {
			$('#btnEnable')
				.on('click',
					function() {
						enableDiffTree();
					});

			$('#btnEnableAlways')
				.on('click',
					function() {
						chrome.storage.local.set({ 'enableAlways': true },
							function() {
								enableDiffTree();
							});
					});

			$('#btnDisable')
				.on('click',
					function() {
						chrome.storage.local.set({ 'enableAlways': false },
							function() {
								disableDiffTree();
							});
					});
		});

	function enableDiffTree() {
		grantPermissions(function() {
			chrome.tabs.query(
				{
					active: true,
					currentWindow: true
				},
				function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id, { from: 'popup', action: "enableDiffTree" });
	
					window.close();
				});
		});
	}

	function disableDiffTree() {
		grantPermissions(function() {
			chrome.tabs.query(
				{
					active: true,
					currentWindow: true
				},
				function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id, { from: 'popup', action: "disableDiffTree" });
	
					window.close();
				});
		});
	}

	function grantPermissions(fnCallback) {
		// Permissions must be requested from inside a user gesture, like a button's
		// click handler.
		chrome.permissions.request({
			permissions: ['tabs'],
			origins: ['https://bitbucket.org/*']
		}, function(granted) {
			// The callback argument will be true if the user granted the permissions.
			if (granted) {
				fnCallback();
			} else {
				alert('Please grant "tabs" permission to use this chrome extension.');
			}
		});
	}
})();