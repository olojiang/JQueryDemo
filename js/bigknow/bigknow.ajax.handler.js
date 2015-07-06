(function(){
	/*
	 * Initialize bigknow.ajax name space
	 */
	bigknow = bigknow || {};
	bigknow.ajax = bigknow.ajax || {};
	
	/*
	 * General Submit handler
	 */
	bigknow.ajax.generalHandler = function(data) {
		console.log("bigknow.ajax.generalHandler, AJAX result: ", data);
		if(data.s===1) {
			showInfo(data.i);
		} else if(data.s===0) {
			showError(data.i, 3000);
		} else {
			showError("Unknow Error: " + data, 3000);
		}
	};
})();