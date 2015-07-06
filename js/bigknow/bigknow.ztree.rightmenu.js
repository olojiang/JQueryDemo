/**
 * 
 */

function ZTreeRightMenu () {
	$("#rMenu").remove();
	this.menuDom = $('<div id="rMenu" style="position:absolute; visibility:hidden;"></div>');
	this.menuDom.appendTo($("body"));
	this.menuLoadEvent();
	
}
ZTreeRightMenu.prototype = {
		pushMenuItem : function ( name , func) {
			var itemContainer =$('<ul></ul>');
			var item = $("<li></li>").text( name|| "");
			item.appendTo(itemContainer);
			itemContainer.appendTo(this.menuDom);
			itemContainer.bind("click", func);
		},
		menuLoadEvent : function () {
			var _this = this;
			$("body").unbind("mousedown");
			$("body").bind("mousedown", 
					function(event){
						if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length>0)) {
							_this.menuDom.css("visibility","hidden");
						}
					});
		},
		show : function (x, y) {
			this.menuDom.show();
			this.menuDom.css({"top":y+"px", "left":x+"px", "visibility":"visible"});
		},
		hide : function () {
			this.menuDom.hide();
		}
}