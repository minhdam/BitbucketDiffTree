(function(){
	'use trict';
	
	var SettingsModel = function() {
		var _this = this;

		_this.enableAlways = false;
		_this.useCompactMode = false;
	}

	// Export via namespace
	BDT.Models.SettingsModel = SettingsModel;

})();