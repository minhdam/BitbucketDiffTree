(function () {
	'use strict';

	BDT.DomObservers.NewCommentObserver = function () {
		var _this = this;

		_this.observer = null;

		// configuration of the observer
		_this.config = {
			//attributes: true,
			//characterData: true,
			childList: true,
			subtree: true
		};

		function startObserving(callback) {
			// select the target node
			var targets = document.querySelectorAll('.diff-content-container.refract-container');
			var trackableTargets = [
				'diff-content-container refract-container', // comment at file level
				'refract-content-container', // comment level 1
				'child-comments', // comment level 2
				'child-comments iterable' // coment level 2+
			];

			// create an observer instance
			_this.observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					//console.log(mutation);
					if (mutation.type === 'childList') {
						// observe when new comment added
						if (trackableTargets.indexOf(mutation.target.className.trim()) >= 0 && mutation.addedNodes.length > 0) {
							//console.log(mutation);
							if (callback) {
								callback(mutation.target, mutation.addedNodes[0]);
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