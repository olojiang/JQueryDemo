/**
 * Some global functions to use noty to display info
 */
// noty({
// text: "text",
// dismissedQueue: true,
// timeout: false,
// closeWith: ['click', 'button'],
// killer: true,
// animation:{
// open: 'animated bounceInDown',
// close: 'animated bounceOutUp',
// easing: 'swing', speed: 500
// }});

var notyDefaultOptions = {
	dismissedQueue: true,
	animation:{
		open: 'animated bounceInDown',
		close: 'animated bounceOutUp',
		easing: 'swing', speed: 500
	},
	layout: 'topCenter',
	closeWith: ['click', 'button']
};

function showError(text, timeout, extraOptions) {
	var options = $.extend(notyDefaultOptions, {type: "error", text: text, timeout: timeout||3000});
	if(extraOptions) {
		$.extend(options, extraOptions);
	}
	noty(options);
}

function showInfo(text, timeout, extraOptions) {
	var options = $.extend(notyDefaultOptions, {type: "information", text: text, timeout: timeout||3000});
	if(extraOptions) {
		$.extend(options, extraOptions);
	}
	noty(options);
}

function showWarning(text, timeout, extraOptions) {
	var options = $.extend(notyDefaultOptions, {type: "warning", text: text, timeout: timeout||3000});
	if(extraOptions) {
		$.extend(options, extraOptions);
	}
	noty(options);
}