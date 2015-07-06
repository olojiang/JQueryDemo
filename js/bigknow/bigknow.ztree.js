/**
 *
 */
function ZTreeAsyncChart (parentDomId, setting) {

	this.parentDomId = parentDomId;
	$('#'+parentDomId).addClass('ztree');
	this.data = [];

	this.setting = setting||{};
	this.url = null;

	this.loadedTreeIdMap = {};
}
ZTreeAsyncChart.prototype = {
	pushDataItem : function ( item ) {
		this.data.push( item );
	},
	setData : function ( data ) {
		this.data = data ;
	},
	setUrl : function ( url ,autoParam ) {
		if(autoParam == null) autoParam = [];
		autoParam.push("id");
		this.url = url;
		console.info( );
		this.setting["async"] ={};
		this.setting["async"].enable =true;
		this.setting["async"].url = url;
		this.setting["async"].autoParam = autoParam ;
		this.setting["async"].dataType ="json";
	},
	beforeExpand : function (treeId , treeNode) {
		console.info ( " beforeExpand" , treeId ,treeNode);
		//if (!treeNode.isAjaxing) {
		//	this.ajaxGetNodes(treeNode, "refresh");
		//	return true;
		//} else {
		//	alert("zTree 正在下载数据中，请稍后展开节点。。。");
		//	return false;
		//}
	},
	onAsyncSuccess : function (event, treeId, treeNode, msg) {
		if (!msg || msg.length == 0) {
			return;
		}
		var zTree = this.getTree();
		treeNode.icon = "";
		zTree.updateNode(treeNode);
		zTree.selectNode(treeNode.children[0]);
	},
	onAsyncError : function (event, treeId, treeNode, XMLHttpRequest, textStatus, errorThrown) {
		console.info("onAsyncError",event, treeId, treeNode, XMLHttpRequest, textStatus, errorThrown);
		var zTree = this.getTree();
		alert("异步获取数据出现异常。");
		treeNode.icon = "";
		zTree.updateNode(treeNode);
	},
	ajaxGetNodes : function ( treeNode , reloadType ) {
		var zTree = this.getTree();
		if (reloadType == "refresh") {
			treeNode.icon = "css/zTree/img/loading.gif";
			zTree.updateNode(treeNode);
		}
		zTree.reAsyncChildNodes(treeNode, reloadType, true);
	},
	setOnClickNodeEvent : function ( func ) {
		if( this.setting["callback"] == null ) this.setting["callback"] ={};
		this.setting["callback"].onClick = func;
//		this.setting["callback"].beforeClick = function(){
//			console.info("beforeClick()");
//			return false;
//		};
	},
	setOnDbClickNodeEvent : function ( func ) {
		if( this.setting["callback"] == null ) this.setting["callback"] ={};
		this.setting["callback"].onDblClick = func;
//		this.setting["callback"].beforeDblClick = function(){
//			console.info("beforeDblClick()");
//			return false;
//		};
	},
	setOnRightClickNodeEvent : function ( func) {
		if( this.setting["callback"] == null ) this.setting["callback"] ={};
		this.setting["callback"].onRightClick = func;
	},
	show : function () {
		this.setting["bigknow"] =true;
		this.setting["data"] = {
			key: {
				title: "title" /* Use titleKey field in Ajax data to show title */
			}
		};
		this.setting["data"].simpleData = this.setting["data"].simpleData||{};
		this.setting["data"].simpleData.enable =true;
		this.setting.view = {};
		this.setting.view.dblClickExpand = false;
		if( this.url != null ) {
			if( this.setting["callback"] == null ) this.setting["callback"] ={};
			this.setting["callback"].beforeExpand = $.hitch(this, this.beforeExpand );
			this.setting["callback"].onAsyncSuccess = $.hitch(this,this.onAsyncSuccess);
			this.setting["callback"].onAsyncError = $.hitch(this,this.onAsyncError);
		}
		$.fn.zTree.init($("#"+ this.parentDomId), this.setting, this.data);
	},
	setParent: function(item, param){
		console.info("item:", item, "param:", param);
		item.isParent = true;
	},
	getTree: function() {
		return $.fn.zTree.getZTreeObj(this.parentDomId);
	},
	expandRoot: function() {
		var tree = this.getTree();
		tree.expandNode(tree.getNodes()[0], true, false, true);
	},
	getRootData: function(rootLabel) {
		return [{
			name:rootLabel,
			id:"0",
			isParent:true
		}];
	},
	pushResultHandler: function(url, func) {
		var handlers = this.setting.resultHandler||{};
		handlers[url] = func;
		this.setting.resultHandler = handlers;
	},
	getUrlFunction: function(urls) {
		return function (treeId, treeNode) {
			return urls[treeNode.level];
		}
	},
	initResultHandler: function(urls) {
		for (var i = 0; i < urls.length-1; i++) {
			var url = urls[i];
			this.pushResultHandler(url, this.setParent);
		}
	},
	removeNode: function(node) {
		var tree = this.getTree();
		tree.removeNode(node);

		var parentNode = tree.getNodeByTId(node.parentTId);
		parentNode.isParent = true;
		tree.updateNode(parentNode);
		tree.expandNode(parentNode, true, false, false);
	},
	expandNode: function(node) {
		var tree = this.getTree();
		tree.expandNode(node, true, false, false);
	},
	addNode: function(parentNode, newNode) {
		var tree = this.getTree();
		tree.addNodes(parentNode, [newNode]);
	}
};