/**
 * AJAX shot cut
 * - Depends on jquery.noty
 * - Provide default error handler.
 * @param $
 */

/**
 * Usage:
 */
//bigknow.ajax4("json/dbDrivers.json"/*url*/, {}/*data*/, this/*context*/, function(data){
//});

(function($){
	/**
	 * Default error handling
	 */
	function handleError(url, jqXHR, textStatus, errorThrown){
		console.error("Error: ", this, jqXHR, textStatus, errorThrown);

		// Jump to special error page.
		//document.location.href="page/criticalError";

		var errorText = url + "<br />"
			+ (errorThrown.message?errorThrown.message:"")+"<br/>"
			+ (errorThrown.stack?errorThrown.stack.replace(/\n/g, "<br />"):"")
			+ "<br />Response Text: <br />" + (jqXHR.responseText?jqXHR.responseText.replace(/\n/g, "<br />"):"");

		console.error("errorText: ", errorText);

		// Not use this any more.
		//if( errorThrown instanceof Error ) {
		//	noty({type: "error",
		//		text: errorText,
		//		dismissQueue: true,
		//		maxVisible: 3,
		//		timeout: 5*1000
		//	});
		//}
	}
	
	bigknow = window.bigknow||{};
	
	/**
	 * 6 parameter version of ajax
	 */
	bigknow.ajax6 = function(url, data, context, options/*To override default option*/, callback, errorback) {
		/*
		 * Default option
		 */
		opts = {
				cache: false,
				context: context||window,
				data: data||{},
				type: "post",
				timeout: 1200*1000, /* 20 minutes */
				dataType: "json"
			};
		$.extend(opts, options||{});
		
		/*
		 * Request
		 */
		var jqxhr = $.ajax(url, opts);
		
		/*
		 * Debug helper
		 */
		jqxhr.done(callback);
		jqxhr.fail($.hitch(this, errorback, url));
		jqxhr.always(function(dataOrJqXHR, textStatus, jqXHROrErrorThrown) {
			console.info(url, dataOrJqXHR, textStatus, jqXHROrErrorThrown);
			if( jqXHROrErrorThrown instanceof Error ) {
				handleError(url, dataOrJqXHR, textStatus, jqXHROrErrorThrown);
			}
		});
		
		return jqxhr;
	};
	
	/**
	 * 4 parameter version of simple ajax
	 */
	bigknow.ajax4 = function(url, data, context, callback){
		return bigknow.ajax6(url, data, context, {}, callback, handleError/* No default error handler */);
	};

	/**
	 * Ajax for the plain text
	 * @param url
	 * @param data
	 * @param context
	 * @param callback
	 * @returns {*}
	 */
	bigknow.ajaxText = function(url, data, context, callback){
		return bigknow.ajax6(url, data, context, {dataType: 'text'}, callback, handleError/* No default error handler */);
	};
}
)(jQuery);

