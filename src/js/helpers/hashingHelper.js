(function() {
	'use strict';

	var HashingHelper = {

		getHash: function(sContent) {
      return $.md5(sContent);
    }
    
	};

	// Export via namespace
	BDT.Helpers.HashingHelper = HashingHelper;
	
})();