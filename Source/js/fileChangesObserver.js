(function () {
	'use strict';

	BDT.DomObservers.FileChangesObserver = function () {
		var _this = this;

		_this.observer = null;

		// configuration of the observer
		_this.config = {
			//attributes: true,
			//characterData: true,
			childList: true
		};

		function startObserving(callback) {
			// select the target node
			var targets = document.querySelectorAll('#pr-tab-content');
			
			// create an observer instance
			_this.observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					if (mutation.type === 'childList') {
						if (mutation.addedNodes.length > 0) {
							//console.log(mutation);
							if (callback) {
								callback();
							}
						}
					}
				});
			});

			// pass in the target node, as well as the observer options
			targets.forEach(function (target) {
				_this.observer.observe(target, _this.config);
			});
		}

		function stopObserving() {
			if (_this.observer != null) {
				_this.observer.disconnect();
			}
		}

		// Expose public methods
		_this.startObserving = startObserving;
		_this.stopObserving = stopObserving;
	};
})();