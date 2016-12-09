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
						chrome.storage.sync.set({ 'enableAlways': true },
							function() {
								enableDiffTree();
							});
					});

			$('#btnDisable')
				.on('click',
					function() {
						chrome.storage.sync.set({ 'enableAlways': false },
							function() {
								disableDiffTree();
							});
					});
		});

	function enableDiffTree() {
		chrome.tabs.query(
			{
				active: true,
				currentWindow: true
			},
			function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { from: 'popup', action: "enableDiffTree" });

				window.close();
			});
	}

	function disableDiffTree() {
		chrome.tabs.query(
			{
				active: true,
				currentWindow: true
			},
			function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { from: 'popup', action: "disableDiffTree" });

				window.close();
			});
	}
})();