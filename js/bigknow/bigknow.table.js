
"use strict";
function TableList(parentDomId, headers, rows, config, tableOptions, existingTableDom){
	this.parentDomId = parentDomId;
	this.headers = headers;
	this.rows = rows;
	this.config = config;
	this.opts = {
		"sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-12'i><'col-md-12 center-block'p>>",
		//"sPaginationType": "bootstrap",
		"bRetrieve": true,
		'bStateSave': false, // Ji Wei: Changed this, because after set to true, the state updating doesn't behave as expectation
		"sPaginationType":"full_numbers",
		"aLengthMenu" : [[5,10,25,50,100],[5,10,25,50,100]],
		"iDisplayLength" :10,
		"oLanguage": {
			"sLengthMenu": "每页 _MENU_ 条记录",
			"sZeroRecords": "没有检索到数据",
			"sInfo": "第 _START_ 到第  _END_ 条；总共有 _TOTAL_ 条<br>",
			"sInfoFiltered" : "",
			"sSearch":"搜索：",
			"oPaginate": {
				"sFirst":"首页",
				"sLast":"尾页",
				"sNext":"下一页",
				"sPrevious":"前一页"
			 }
		},
		"bFilter": true,
		"bSort": true,
		"bDefaultSort": true/*,
		 sort: [ [0,'desc'] ]*/
    };

	// Use parameter to override default behavior
	if(tableOptions) {
        $.extend(this.opts, tableOptions);
    }
    this.domhelper=new DomHelp();
    this.endString="_bigknow";
    this.keys =null;

	this.existingTableDom = existingTableDom;
}

TableList.prototype = {
    setParentDomId : function ( domId) {
    	this.parentDomId = domId;
    },
    setFilterFunction : function ( funCallBack, remove) {
    	this.filterFunCallBack = funCallBack; 
    	this.FilterRemove = remove;
    },
    setFilter : function( values, remove) {
    	this.FilterValues = values||[];
    	this.FilterRemove = remove;
    },
    filter : function ( data) {
    	// if Clear need to return all the data.
		if( (!this.FilterValues ||this.FilterValues.length === 0) && (!this.filterFunCallBack) ) {
			return data;
		}

    	var remove = this.FilterRemove==null? true: this.FilterRemove;
    	
     	var _this = this;
    	var values = this.FilterValues || [];
    	var tempData= [];
    	$.each( data ||[], function( index, item){
    		var search = false;
    		$.each( values, function( jdex, jtem) {
    			var allequal = true;
    			var hasequal = false;
        		$.each(jtem, function(key, value) {
    				if( item[key] === value ) {
    					hasequal = true;
    				} else {
    					allequal = false;
    				}
    			});
        		if( allequal && hasequal) {
        			search = true;
        		}
        	});
    		
    		if( _this.filterFunCallBack ) {
    			search = _this.filterFunCallBack( item );
    		}
    		if( !remove && search ){
    			tempData.push( item);
    		} else if( !search && remove) {
    			tempData.push( item);
    		}
    	});
    	return tempData;
    	
    },
	setData : function ( data) {
		this.fullData =null;
		this.rows = data;
	},
	setHeads : function ( heads) {
		this.headers =heads;
	},
	setConfig : function ( config) {
		this.config = config;
	},
	show : function ( force ) {
		this.fullData = this.fullData||this.rows||[];
		this.rows = this.filter( this.fullData );
		this.create( force );
	},
	firstInitTable : function () {
		var parentDom=this.getParentDom();

		// See if customer change the display length
		var existingDisplayLengthSelect = parentDom.find('select');
		if(parentDom && existingDisplayLengthSelect.length>0) {
			this.opts.iDisplayLength = Number(existingDisplayLengthSelect.val());
		}

		if(this.isUseServerFenYe()) {
			this.configServerOpts();
		}
		if(this.checkCheckBoxOperation()) {
			this.generateCheckBoxOperationDiv();
		}

		var table = null;
		if(!!this.headers && !!this.rows) {
			table =this.getNewTableDom();
			if(this.checkHeaderData()) {
				this.getTableHeader(table);
			}
			if(this.checkRowData()) {
				this.getTableBodyWithOutServer(table);
			}
		} else {
			table = this.existingTableDom;
		}
		console.info("table", table[0]);

		// Ji Wei: Fix for the normal table which not paging, also do not have the search and sorting
		var noPagingOptions = {
			"bPaginate": false,
			"oLanguage": {
				"sInfo": "总共有 _TOTAL_ 条<br>",
				"sInfoFiltered" : "",
				"sSearch":"搜索："
			}
		};

		// Paging will use different options than no paging.
		$.extend(this.opts, this.checkFenYe()?{}:noPagingOptions);

		// Check box will disable the first column sorting
		if(this.isShowCheckBox() || this.config.disableSortable) {
			$.extend(this.opts, {"aoColumnDefs": [ { "bSortable": false, "aTargets": this.config.disableSortable||[ 0 ] }]});
		}

		// Disable initial function
		if( !this.opts.bDefaultSort ) {
			$.extend(this.opts, {"aaSorting": []});
		}

		// Get existing page number from cookie
		var existingDisplayLength = $.cookie(this.parentDomId + "_iDisplayPage");
		this.opts.iDisplayLength = existingDisplayLength?Number(existingDisplayLength):this.opts.iDisplayLength;

		// Initialize the table
		var dataTable = this.table = table.dataTable(this.opts);
		
		// Remember the page number
		existingDisplayLengthSelect = parentDom.find('select');

		// Store current value, initially there may be no existing value
		$.cookie(this.parentDomId + "_iDisplayPage", existingDisplayLengthSelect.val(), {expires: 365});

		// Monitor value change
		existingDisplayLengthSelect.on('change', $.hitch(this, function(evt){
			var target = $(evt.currentTarget);
			$.cookie(this.parentDomId + "_iDisplayPage", target.val(), {expires: 365});
		}));
		// Customize the initial sorting
		if(this.opts.bSort && this.opts.bDefaultSort) { // User can disable sort
			if( this.opts.sort ) {
				dataTable.fnSort(this.opts.sort);
			} else if( this.isShowCheckBox() ) {

				dataTable.fnSort( [ [1,'asc'] ]); // Ji Wei: Fix for the redio button and check box can not sort
			} else {
				dataTable.fnSort([ [0,'asc'] ]);
			}
		}

		if(this.checkFenYe()) {
       		this.table.find("thead tr th").each(function(){
            	$(this).removeAttr("style");
        	});
		} else {
			if(this.isShowAllCheckBox()) {
				 this.bindAllCheckBoxClick();
			}
			this.bindBtnEvnt(this.getOperation());
		}
		
	},
	reDrawTable : function () {
		if(this.table) {
			this.table.fnClearTable(true);
			var _this = this;
			$.each( this.rows|| [], function ( index, item) {
				_this.insertRow(item);
			});
		}
/*			this.table.fnDraw();*/
	},
	create : function ( force ) {
		if( typeof force === "undefined" ) {
			force = true;
		}
		if(force && !this.existingTableDom )  {
			this.empty();
		}
		if( !this.table ) {
			this.firstInitTable();
		} else {
			this.reDrawTable();
		}
		
		if(this.checkFenYe()) {
       		this.table.find("thead tr th").each(function(){
            	$(this).removeAttr("style");
        	});
		}
	},

	getTable: function() {
		return this.table;
	},

	setKeys : function ( keys ) {
		this.keys = keys;
	},
	getAllKeysWithRows : function () {
		var tempkey=[];
    	if(this.rows!==null&&this.rows.length>0){
       		var firstBodyData=this.rows[0];
       		$.each(firstBodyData,function(key,value){
           		tempkey.push(key);
        	});
   		} 
  	   return tempkey;
	},
	getAllKeys : function () {
		if(this.isUseServerFenYe()) {
			return this.keys;
		} else {
			return this.getAllKeysWithRows();
		}
	},
	getConfigKey : function () {
		return this.config.key;
	},
	getCheckBoxType : function () {
		return this.config.hasCheckbox.type===null?"checkbox":this.config.hasCheckbox.type;
	},
	checkFenYe : function () {
		if( this.config!==null&& this.config.isFenYe){
			 $.extend(this.opts, {"fnDrawCallback": $.hitch(this,this.tableFnDrawCallback)});
			 return true;
		}
		return false;
	},
	checkHeaderData : function () {
		return !!this.headers;
	},
	checkRowData : function () {
		return !!this.rows;
	},
	checkCheckBoxOperation : function () {
		var checkBox = this.getCheckBox(); // Ji Wei: checkBox can be null.
		return checkBox&&checkBox.operation&&checkBox.operation.length>0;
	},
	getCheckBox : function () {
		if( !!this.config ) {
			return this.config.hasCheckbox;
		}
		return null;
	},
	getOperation : function () {
		if( !!this.config ) {
			return this.config.operation;
		}
		return null;
	},
	getServerAjax : function () {
		return this.config.bPaginateByServer.ajaxUrl;
	},
	getParentDom : function () {
		return $("#"+this.parentDomId);
	},
	getHeaderKeys : function () {
		var aryHeaderKeys=[];
    	var len=this.headers.length;
		for(var i=0;i<len;i++){       	
        	aryHeaderKeys.push(this.headers[i].key);
    	}
		return aryHeaderKeys;
	},
	getOtherHtmlByKeys : function (keys,item) {
		var len=keys.length;
		var otherAttr="";
	    var optHelper =new OptHelp(this);
		for(var i=0;i<len;i++){
		  otherAttr+=this.domhelper.getDomAttr(keys[i]+this.g_this.endString,optHelper.FilterString(item[keys[i]]))+" ";
		}
		return otherAttr;
	},
	getNewTableDom : function () {
		var table=this.table=$(this.domhelper.getTable("","table table-striped table-bordered bootstrap-datatable datatable responsive"));
		table.appendTo(this.getParentDom());
		return table;
	},
	getTableHeader : function ( table ) {
		var thead=$(this.domhelper.getThead()).appendTo(table);
   		var headtr=$(this.domhelper.getTr()).appendTo(thead);
		if(this.isShowCheckBox()) {
			if(this.isShowAllCheckBox()) {
				headtr.append($(this.domhelper.getTH(this.domhelper.getCheckBox("","AllCheckBoxCss"))));
			} else {
				 headtr.append($(this.domhelper.getTH()).text(""));
			}
		}

		var headers = this.headers;
		var len =headers.length;
		var header = null;
		var th = null;
		for(var i=0;i<len;i++){
			header = headers[i];
			th = $(this.domhelper.getTH()).attr('title', header.comment);
			if(header.style) {
				th.html('<span style="display: inline-block;'+header.style+'">'+header.name+'</span>');
			} else {
				th.html(header.name);
			}
			headtr.append(th);
   		}
		if(this.isShowOperation()) {
			var name = this.getOperation().name;
			headtr.append($(this.domhelper.getTH()).text(name === null? "" : name));
		}
		return thead;
	},
	getTableBodyWithOutServer : function ( table ) {
		var tbody=$(this.domhelper.getTbody()).appendTo(table);
		var len=this.rows.length;
		for(var i=0;i<len;i++){
			var item =this.rows[i];
			this.getTableRowWithOutServer(item,tbody);
		}
	},
		
	getTableRowWithOutServer : function ( item, tbody ) {
		var rowtr=$(this.domhelper.getTr()).appendTo(tbody);
		var optHelper =new OptHelp (this);
		var keysData=(this.isShowAllKeyOnCheckBox())?this.getAllKeysWithRows():(this.getConfigKey() ||this.getCheckBox().key);

		if( this.isShowCheckBox() ) {
			// Setup check box|radio button, and it's data
			var checkboxHtml=optHelper.getCheckBoxHtml(keysData , item);
			//console.info(checkboxHtml);
            rowtr.append($(this.domhelper.getTD(checkboxHtml,null,this.domhelper.getDomAttr("style","width:15px"))));
		}

		// Setup data on the row.
		rowtr.data("data", item);

		var headerKeys=this.getHeaderKeys();
		var lenj=headerKeys.length;
		for(var j=0;j<lenj;j++){
            var value=optHelper.getRealTdDisplayValue(headerKeys[j], item);
            if(!value) {
				value="";
			}
			if(value.type==="template") {
				rowtr.append($(this.domhelper.getTD()).append(value.content));
			} else {
				// Text content
				var content = $(this.domhelper.getTD());
				content[0].innerHTML = value;
            	rowtr.append(content);
			}
        }
		if( this.isShowOperation()){
			var html = optHelper.getOperationBtnHtml(keysData,item);
			rowtr.append(this.domhelper.getTD(html));
		}
		
	},
	
	/**
	 * Add table row with item info
	 * @param item
	 */
	addTableRowWithoutServer: function(item) {
		var tbody = this.table.find('tbody');
		this.getTableRowWithOutServer(item, tbody);
	},
	getValues : function(checkedOnly) {
    	checkedOnly = checkedOnly || false; // default include all

		var result = [];

		var keys=(this.isShowAllKeyOnCheckBox())?this.getAllKeysWithRows():(this.getConfigKey() ||this.getCheckBox().key);

		var i, iLen, j, jLen, item, key;

		if( this.isShowCheckBox() ) {
			// Has radio button or check box
			var checkboxes = $("#"+this.parentDomId+" " +".checkBoxClickCss");

			for(i = 0, iLen = checkboxes.length; i<iLen; i++) {
				var checkbox = checkboxes[i];
				var checked = checkbox.checked;
				if(checkedOnly && !checked) {
					continue;
				}
				item = {
					checked: checked
				};
				for(j = 0, jLen = keys.length; j<jLen; j++) {
					key = keys[j];
					item[key] = $(checkbox).attr(key+this.endString);
				}
				result.push(item);
			}
			
		} else {
			// Do not have any of the radio button or check box.
			// Get all data fro the table.
			// It will ignore the "checkedOnly", because there is no check box at all
			var rows = $("#"+this.parentDomId).find('tr');
			for(i= 0, iLen = rows.length; i<iLen; i++) {
				var row = $(rows[i]);
				if(row.hasClass('odd') || row.hasClass('even')) {
					// Header part doesn't has odd or even class
					var data = row.data("data");
					if(!!data) {
						result.push(data);
					} else {
						// When row is added dynamically, there is no data field on row.
						item = {};
						var headers = this.headers;
						for(j = 0, jLen = headers.length; j<jLen; j++) {
							key = headers[j].key;
							var td = row.find('td:eq('+j+')');
							var text = td.text();

							if(j===0 && td.hasClass('dataTables_empty')) {
								// No result
								item = null;
								break;
							}
							item[key] = text;
						}

						if(item) {
							result.push(item);
						}
					}
				}
			}
		}
		
		console.log("TableList.prototype.getValues: ", result);

		return result;
	},
	getValueOnHtml : function( item ) {
    	//var config=this.config;
    	//var endString=this.endString;
    	//var keys=(this.isShowAllKeyOnCheckBox())?this.getAllKeys():(this.getConfigKey() ||this.getCheckBox().key);
    	//var map={};
    	//var optHelper =new OptHelp(this);
    	//for(var j=0;j<keys.length;j++){
        	//map[keys[j]]=optHelper.showFilterString(item.attr(keys[j]+endString));
    	//}
    	//console.info("map",map);
    	//return map;

		var row = this.getRow(item);

		var result = row.data('data');

		if(!!result) {
			return result;
		} else {
			result = {};
			var headers = this.headers;
			for(var j = 0, jLen = headers.length; j<jLen; j++) {
				var key = headers[j].key;
				var td = row.find('td:eq('+j+')');
				var text = td.text();

				if(j===0 && td.hasClass('dataTables_empty')) {
					// No result
					result = null;
					break;
				}
				result[key] = text;
			}
		}


		return result;
	},
	getChecked : function () {
    	var data=[];
   		var config=this.config;
    	var endString=this.endString;
    	if( this.getCheckBox() ) {
       		var keys=(this.isShowAllKeyOnCheckBox())?this.getAllKeys():(this.getConfigKey() ||this.getCheckBox().key);
       		var optHelper =new OptHelp(this);
        	$(".checkBoxClickCss").each(function () {
            	if ($(this).is(":checked")) {
               		var map={};
               		for(var j=0;j<keys.length;j++){
                    	map[keys[j]]=optHelper.showFilterString($(this).attr(keys[j]+endString));
                	}
               		data.push(map);
            	}
        	});
   		}
    	return data;
	},
	isShowAllKeyOnCheckBox : function () {
		return !(!!this.config&&!!this.config.key&&this.config.key.length!==0);
	},
	isShowCheckBox : function () {
		var hasCheckbox=this.getCheckBox();
		return !!hasCheckbox&&hasCheckbox.show;
	},
	isShowOperation : function () {
		return !!this.getOperation();
	},
	isShowAllCheckBox : function () {
		var hasCheckbox=this.getCheckBox();
		return !!hasCheckbox&&hasCheckbox.show&&hasCheckbox.isAllCheck&&(!hasCheckbox.type||hasCheckbox.type==="checkbox");
	},
	isUseServerFenYe : function () {
		return (!!this.config.bPaginateByServer&&this.config.bPaginateByServer.use);
	},
	tableFnDrawCallback : function () {
        if(this.isShowAllCheckBox()) {
            this.bindAllCheckBoxClick();
        }
		var operation =this.getOperation();
        this.bindBtnEvnt(operation);
	},
	bindBtnEvnt : function (operation) {
		var _this =this;
   		var buttnEvtParams=[];
    	if(operation) {
       		var html = "";
       		if (operation.buttons) {
            	var lenk = operation.buttons.length;
           		for (var k = 0; k < lenk; k++) {
               		var item = operation.buttons[k];
               		buttnEvtParams.push({"css": "operation_Css_Click" + k, "method": item.method});
           		}
       		}
    	}
    	var lenJ=buttnEvtParams.length;
		var parentDom = $("#"+this.parentDomId);
   		for(var j=0;j<lenJ;j++){
        	var item1=buttnEvtParams[j];
        	if(item1.method){
				// Ji Wei: Use event delegate to change the binding for dynamically extend.
				// - Comment out the params, so just use other method to get value.
				/*
				Example, function to get values
				 function(evt) {
				 var target = $(evt.target);
				 var values = this.indexTable.getValueOnHtml(target);
				 */
				parentDom.undelegate("."+item1.css,"click");
				parentDom.delegate("."+item1.css,"click", $.hitch(this, item1.method/*, params*/));

           		//$("."+item1.css).each(function(){
                	//var params=_this.getValueOnHtml($(this));
                	//$(this).bind("click",$.hitch(this, item1.method, params));
           		//});
       		}
    	}
	},
	bindAllCheckBoxClick : function (){
	    // bind all checkbox
	    $(".AllCheckBoxCss").bind("click", function () {
	        var checked=$(this).is(":checked");
	        $(".checkBoxClickCss").prop("checked",checked);
	    });
	    // bind  item checkbox evt
	    $(".checkBoxClickCss").bind("click",function () {
	        var isAllCheck=true;
	        $(".checkBoxClickCss").each(function () {
	            if(!$(this).is(":checked")){
	                isAllCheck=false;
	            }
	        });
	        if(isAllCheck){
	            $(".AllCheckBoxCss").prop("checked",true);
	        }else{
	            $(".AllCheckBoxCss").prop("checked",false);
	        }
	    });
	},
	generateCheckBoxOperationDiv : function () {
		var operationdiv=$(this.domhelper.getDiv("","row",this.domhelper.getDomAttr("style","padding-bottom: 20px"))).appendTo(this.getParentDom());
		var operations = this.getCheckBox().operation;
        var len= operations.length;
        var maxBtn=7;
        var widthPre=100/(len>maxBtn?maxBtn:len);
        for(var i=0;i<len;i++){
            var item = operations[i];
            var operationItemDiv=$(this.domhelper.getDiv("","",this.domhelper.getDomAttr("style","float: left;text-align: left;margin-right:50px;"))).appendTo(operationdiv);
            var btnA =$( this.domhelper.getA("","btn "+(item.css===null?" btn-default":item.css),
				this.domhelper.getDomAttr("href","javascript:void(0)")+
				this.domhelper.getDomAttr("id","buttonOperationCheckBoxItem"+i))).appendTo(operationItemDiv);
            if(item.iconcss){
                $(this.domhelper.getI("",item.iconcss)).appendTo(btnA);
            }
            $(this.domhelper.getSpan(item.name===null?" ":" "+item.name,"")).appendTo(btnA);
            if(item.method){
                var _this=this;
                if(item.params===null||item.params){
                    $("#buttonOperationCheckBoxItem"+i).bind("click",$.hitch(this, item.method,_this));
                }else{
                    $("#buttonOperationCheckBoxItem"+i).bind("click",$.hitch(this, item.method));
                }
            }
        }
	},
	empty : function () {
   		$('#'+this.parentDomId).empty();
   		this.table= null;
	},
	getServerConfigKeys : function () {
		var tempkey=[];
        // check if has checkbox;
        if(this.isShowCheckBox()) {
			tempkey.push({"mDataProp":"byds_checkbox"});
		}
		// config keys
        if(this.checkHeaderData()){
            for(var i=0;i<this.headers.length;i++){
                var item=this.headers[i];
                tempkey.push({"mDataProp":item.key});
            }
        }
        if(this.isShowOperation()) {
			tempkey.push({"mDataProp":"byds_operation"});
		}
		return tempkey;
	},
	configServerOpts : function () {
		 var g_this=this;
		 function retrieveData (sSource, aoData, fnCallback) {
            console.info(aoData,"retrieveData",g_this);
			var optHelper = new OptHelp (g_this);
			var aoColumns = this.dataTableSettings[0].aoColumns;
			$.ajax({
                "type" : "post",
                "url" : sSource,
                "dataType" : "json",
                "data" : optHelper.getAoDataPageInfo(aoData), // 以json格式传递
                "success": function (data) {
                    console.info(data,this);
                    var tableData=optHelper.requestJsonDataToArray(data,aoData,aoColumns);
                    console.info("tableData",tableData);
                    fnCallback(tableData);
                },
                "error" : function (data) {
                	console.info("error");
                }
            });
		}
		var _option = {
            /*            "bFilter": false,*/
            "bSort":  false,
            "bPaginate":true,
            "bStateSave":false,
            "bDestroy" : true,
            "bFilter": false,
            "bServerSide": true,
            "sAjaxSource": this.getServerAjax(),
            "aoColumns":this.getServerConfigKeys(),
            "fnServerData":retrieveData
        };
        this.opts= $.extend(_option,this.opts);
	},
	/**
	 * Get row contains the element
	 * @param element
	 * @returns {*|jQuery}
	 */
	getRow: function(element) {
		return $(element).closest('tr');
	},
	/**
	 * Get Next Row after current row, which contains the element
	 * @param element
	 * @returns {*}
	 */
	getNextRow: function(element) {
		var currentRow = this.getRow(element);
		return currentRow.next();
	},
	/**
	 * Get Previous Row before current row, which contains the element
	 * @param element
	 * @returns {*}
	 */
	getPreviousRow: function(element) {
		var currentRow = this.getRow(element);
		return currentRow.prev();
	},
	/**
	 * Move row up
	 * @param element
	 */
	moveRowUp: function(element) {
		var currentRow = this.getRow(element);
		var previousRow = this.getPreviousRow(element);
		if(previousRow && previousRow.length>0) {
			currentRow.insertBefore(previousRow);
			return {
				up: currentRow,
				down: previousRow
			};
		} else {
			return {
				currentRow: this.getValuesForRow(currentRow)
			};
		}
	},
	/**
	 * Move row down
	 * @param element
	 */
	moveRowDown: function(element) {
		var currentRow = this.getRow(element);
		var nextRow = this.getNextRow(element);
		if(nextRow && nextRow.length>0) {
			currentRow.insertAfter(nextRow);

			return {
				up: nextRow,
				down: currentRow
			};
		} else {
			return {
				currentRow: this.getValuesForRow(currentRow)
			};
		}
	},
	/**
	 * Get values for specific row
	 * @param row
	 */
	getValuesForRow: function(row) {
		var checkboxes = $(row).find(".checkBoxClickCss");

		var headers = this.getAllKeys();
		var result = {};
		for(var j = 0, jLen = headers.length; j<jLen; j++) {
			var key = headers[j];
			result[key] = checkboxes.attr(key+this.endString);
		}

		return result;
	},
	/**
	 * Update value for row
	 * @param row
	 * @param key
	 * @param value
	 */
	updateValueForRow: function(row, key, value) {
		var checkboxes = $(row).find(".checkBoxClickCss");
		checkboxes.attr(key+this.endString, value);
	},
	changeItemToColumnData : function ( item ) {
		var columnsData = [];
		var optHelper =new OptHelp (this);
		var keysData=(this.isShowAllKeyOnCheckBox())?this.getAllKeysWithRows():(this.getConfigKey() ||this.getCheckBox().key);
		if( this.isShowCheckBox() ) {
			// Setup check box|radio button, and it's data
			var checkboxHtml=optHelper.getCheckBoxHtml(keysData , item);
			columnsData.push(checkboxHtml);
		}
		var headerKeys=this.getHeaderKeys();
		var lenj=headerKeys.length;
		for(var j=0;j<lenj;j++){
            var value=optHelper.getRealTdDisplayValue(headerKeys[j], item);
            if(!value) {
				value="";
			}
			if(value.type==="template") {
				columnsData.push(value.content);
			} else {
				// Text content
				columnsData.push( value);
			}
        }
		if( this.isShowOperation()){
			var html = optHelper.getOperationBtnHtml(keysData,item);
			columnsData.push( html );
		}
		return columnsData;
	},
	
	/**
	 * Delete table row item.
	 */
	deleteRow: function(element) {
		var table = this.table;

		var row = this.getRow(element);
		//row.remove();

		console.info("table", table);

		table.fnDeleteRow(row.index(), null, true);
	},
	
	insertRow : function ( item) {
		//Change Row Data To Need Array
		var columnsData = this.changeItemToColumnData(item);
		var table = this.table;
		//add new row to table, return is AoData`s index
		var newline =table.fnAddData( columnsData , true/* Redraw */);
		//Get newRow
		var newTr = table.fnSettings().aoData[newline[0]].nTr;
		//Store New Data
		$(newTr).data("data",item);
	},
	
	/**
	 * Get Row index From DataTable`s AoData;
	 * @param row
	 * @returns
	 */
	getRowIndexFromAoData :function( row ) {
		var table = this.table;
		// Default index
		var index = row.index();
		// DataTable`s AoData
		var data = table.fnSettings().aoData;
		$.each( data || [], function( i, item) {
			//Find By Row Data 
			if( $(item.nTr).data('data') === row.data('data') ) {
				index=i;
			}
		});
		return index;
	},
	
	updateRow : function( element ,data ) {
		var table = this.table;
		//Get Update Row
		var row = this.getRow(element);
		//Get Row Data
		var item = row.data("data");
		//Update Row Data
		$.extend( item, data);
		//Change Row Data To Need Array
		var columnsData = this.changeItemToColumnData(item);
		//Update DataTable;
		table.fnUpdate(columnsData, this.getRowIndexFromAoData(row));
		row.data("data",item);
	},
	
	updateCell : function( element ,data ) {
		var table = this.table;
		//Get Update Row
		var row = this.getRow(element);
		
		//Get Row Data
		var item = row.data("data");
		
		//Update Row Data
		$.extend( item, data );
		
		//Change Row Data To Need Array
		var columnsData = this.changeItemToColumnData(item);
		
		//Update DataTable;
		table.fnUpdate(columnsData, this.getRowIndexFromAoData(row));
		
		row.data("data",item);
	},
	
	/**
	 * Add row to widgets
	 * @param data
	 */
	addRow: function( data ) {
		var table = this.table;
		table.fnAddData(data, true/* Redraw */);
	},

	/**
	 * Get data in array, such as below follow is one of data
	 * 0: "<input class="checkBoxClickCss" type="radio" name_bigknow="def" comment_bigknow="test3" name="checkBoxName">"
	 * 1: "def"
	 * 2: "test3"
	 * 3: "<button class="btn btn-danger deleteButton">Delete</button>"
	 */
	getData: function() {
		var table = this.table;
		return table.fnGetData();
	}
};

function OptHelp (g_this) {
    this.g_this =g_this;
}
OptHelp.prototype = {
	FilterString : function ( value ) {
		 if(typeof value === "string"&&"\"".indexOf(value)) {
			 value=value.replace(/"/g,"##byds###");
		  }
		 return value;
	},
	showFilterString : function ( value ) {
		if(typeof value === "string"&&"##byds###".indexOf(value)) {
			 value=value.replace(/##byds###/g,"\"");
		  }
		 return value;
	},
	getRealTdDisplayValue : function (key, item) {
		var replaceAry = this.g_this.config.replace || [];
		
		
		var value = item[key];
		$.each(replaceAry , function (index, ritem) {
			if(key === ritem.key) {
				var data = ritem.data || [];
				$.each( data , function ( i, kitem) {
					if( kitem.value === value ) {
						value = kitem.name;
					}
				});
			}
		});
		return value;
		
	},
	getAoDataPageInfo : function (aoData) {
		var start , count ,search;
		 console.info ("opthelp",aoData);
            $.each(aoData, function (index,item) {
            	if( item.name === "iDisplayStart") {
					start = item.value;
				}
            	else if( item.name === "iDisplayLength") {
					count = item.value;
				}
            	else if( item.name === "sSearch") {
					search = item.value;
				}
            });
		return {"start":start,"count":count,"search":search};
	},
	checkHasKey : function (aoColumns , key) {
		var has=false;
		 for(var i=0;i<aoColumns.length;i++){
            if(aoColumns[i].mDataProp === key){
                has=true;
            }
         }
		 return has;
	},
	checkHasCheckBox : function (aoColumns) {
		return this.checkHasKey((aoColumns),"byds_checkbox");
	},
	checkHasOperation : function (aoColumns) {
		return this.checkHasKey((aoColumns),"byds_operation");
	},
	changeJsonToAaData : function ( aoColumns,list ) {
		console.info ("opthelp" ,"aoColumns",aoColumns);
	 	var hascheckbox=this.checkHasCheckBox(aoColumns);
        var hasoperation=this.checkHasOperation(aoColumns);
        //get keys to display on checkbox
		var keysData=[];
		if(this.g_this.isShowAllKeyOnCheckBox()) {
			if(!!list&&list.length>0){
				$.each(list[0],function (key ,value) {
					keysData.push(key);
				});
				this.g_this.setKeys(keysData);
			}
		} else {
			keysData	= this.g_this.config.key ||this.g_this.config.hasCheckbox.key;
		}
		
	    var aaData = [];
		var _this =this;
		for( var i =0; i<aoColumns.length; i++) {
			$.each(list===null?[]:list,function(index,item){
				if(!item[aoColumns[i].mDataProp]) {
					item[aoColumns[i].mDataProp] ="";
				}
			});
		}
	    $.each(list===null?[]:list,function(index,item){
			var tempData={};
			$.each( item , function ( ikey, ivalue) {
				tempData[ikey] = _this.getRealTdDisplayValue(ikey, item);
			});
	   		if(hascheckbox) {
				tempData.byds_checkbox = _this.getCheckBoxHtml(keysData,item);
			}
			if( hasoperation ) {
				tempData.byds_operation = _this.getOperationBtnHtml( keysData , item );
			}
			aaData.push(tempData);
	    });
	    console.info ("opthelper",aaData);
		return aaData;
	},
	getOtherHtmlByKeys : function (keys,item) {
		var len=keys.length;
		var otherAttr="";
		for(var i=0;i<len;i++){	
		  otherAttr+=this.g_this.domhelper.getDomAttr(keys[i]+this.g_this.endString,this.FilterString(item[keys[i]]))+" ";
		}
		return otherAttr;
	},
	getCheckBoxHtml : function (keys,item) {
		var checkboxHtml=this.g_this.domhelper.getInput(this.g_this.getCheckBoxType(),
			"",
			"checkBoxClickCss",
			this.getOtherHtmlByKeys(keys,item)+this.g_this.domhelper.getDomAttr("name","checkBoxName") +
			(item.checked?"checked":"")); // checked
		return checkboxHtml;
	},
	getOperationBtnHtml : function (keys , item) {
		var html="";
		var buttons = this.g_this.config.operation.buttons;
         if(buttons) {
              var lenk = buttons.length;
              for (var k = 0; k < lenk; k++) {
                var btnitem = buttons[k];
                if (!btnitem.key || btnitem.key.length === 0) {
                    btnitem.key = keys;
                }
                var otherHtml = this.getOtherHtmlByKeys(btnitem.key ,item);
                var itemIconHtml = "";
                if (btnitem.iconcss) {
                    itemIconHtml = this.g_this.domhelper.getI("", btnitem.iconcss);
                }
                var itemCssValue = "operation_Css_Click operation_Css_Click" + k + " btn ";
                
                var realCssValue = null ;
                if(btnitem.cssvalue) {
                	var cssvaluekey = btnitem.cssvalue.key;
                	if(cssvaluekey) {
                		var cssvalueData = btnitem.cssvalue.values || [];
                		$.each( cssvalueData , function ( icssvalue,cvlitem){
                			if( item[cssvaluekey] === cvlitem.value ) {
                				realCssValue =cvlitem.name;
                			}
                		});
                	}
                }
                if(realCssValue) {
                	itemCssValue += realCssValue;
                }else if (btnitem.css) {
                    itemCssValue += btnitem.css;
                } else {
                    itemCssValue += " btn-default";
                }
                html += this.g_this.domhelper.getA(itemIconHtml +" "+btnitem.name, itemCssValue,
                        this.g_this.domhelper.getDomAttr("href", "javascript:void(0)")
                         + otherHtml);
              }
         }
         return html;
	},
	requestJsonDataToArray : function(jsonData,aoData,aoColumns){ //function to change Json data
        var tableData={};
        var datalen=jsonData.total===null?0:jsonData.total;
        tableData.iTotalDisplayRecords = datalen;
        tableData.iTotalRecords = datalen;
        tableData.aaData = this.changeJsonToAaData( aoColumns, jsonData.list);
        for(var k=0;k<aoData.length;k++){
       		if(aoData[k].name==="sEcho"){
            	tableData.sEcho=aoData[k].value;
       		}
        }
        console.info('tableData',tableData);
        return tableData;
    }
};

function ConfigOptionHelper () {
	this.config = {};
	this.valueData= [];
	this.replaceData = [];
	
}
ConfigOptionHelper.prototype = {
		setFenYe : function ( b ) {
			this.config.isFenYe = b;
		},
		getFormatObject : function ( value ,defaultValue) {
			defaultValue = !defaultValue ? "" :defaultValue;
			return !value ?defaultValue : value;
		},
		setServerPaging : function ( b , ajaxUrl ) {
			var temp = {};
			temp.use = b ;
			temp.ajaxUrl = ajaxUrl;
			this.config.bPaginateByServer = temp ;
		},
		setOperationColumnTitle : function( title ) {
			title = this.getFormatObject( title );
			this.config.operation = this.getFormatObject(this.config.operation,{});
			this.config.operation.name = title ;
		},
		pushReplaceValueDataItem : function ( value , name ) {
			this.valueData.push({value: value, name: name});
		},
		emptyReplaceValueDataItem : function () {
			this.valueData = [];
		},
		getReplaceValueData : function (){
			return this.valueData;
		},
		getCssReplaceValue : function ( key , data) {
			return { key : key, values : data };
		},
		pushReplaceItem : function ( key , data) {
			this.replaceData.push({ key : key , data : data});
		},
		emptyReplace : function () {
			this.replaceData = [];
		},
		setReplace : function () {
			this.config.replace = this.replaceData ;
		},
		pushOperationColumnButton : function ( name ,method ,css ,iconcss, cssvalue) {
			name = this.getFormatObject( name );
			this.config.operation = this.getFormatObject(this.config.operation,{});
			this.config.operation.buttons = this.getFormatObject(this.config.operation.buttons , []);
			var temp = {};
			temp.name = name;
			temp.method = method;
			temp.css = css;
			temp.iconcss = iconcss;
			temp.cssvalue = cssvalue;
			this.config.operation.buttons.push( temp );
		},
		setShowCheckBox : function ( b, type , bCheckAll) {
			this.config.hasCheckbox = this.getFormatObject(this.config.hasCheckbox, {});
			this.config.hasCheckbox.show = b;
			this.config.hasCheckbox.type = type;
			this.config.hasCheckbox.isAllCheck = bCheckAll;
		},
		pushCheckBoxOperation : function ( name , method , params, css ,iconcss) {
			this.config.hasCheckbox = this.getFormatObject(this.config.hasCheckbox, {});
			this.config.hasCheckbox.operation = this.getFormatObject(this.config.hasCheckbox.operation , []);
			var temp = {};
			temp.name = name;
			temp.method = method;
			temp.params = params;
			temp.css = css;
			temp.iconcss = iconcss;
			this.config.hasCheckbox.operation.push( temp );
		},
		getConfig : function () {
			return this.config;
		}
};
$.fn.dataTableExt.oApi.fnPagingInfo = function (oSettings) {
    return {
        "iStart": oSettings._iDisplayStart,
        "iEnd": oSettings.fnDisplayEnd(),
        "iLength": oSettings._iDisplayLength,
        "iTotal": oSettings.fnRecordsTotal(),
        "iFilteredTotal": oSettings.fnRecordsDisplay(),
        "iPage": Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
        "iTotalPages": Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
    };
};
function TableShowHelper (options ) {
	this.headData = [];
	this.data = null;
	this.config = null;
	this.parentDomId = null;
	this.tableList = new TableList(null,null,null,null,options);
}
TableShowHelper.prototype = {
		pushHead : function ( name , key) {
			this.headData.push({ name:name ,key: key });
		},
		setHead : function ( head ) {
			this.headData = head || [];
		},
		setFilter : function( values, remove) {
			this.tableList.setFilter(values, remove);
		},
		setFilterFunction : function( funCall, remove) {
			this.tableList.setFilterFunction(funCall, remove);
		},
		emptyHead : function () {
			this.headData = [];
		},
		getTable : function () {
			return this.tableList;
		},
		setData : function ( data ) {
			this.data = data;
		},
		setConfig : function ( config ) {
			this.config = config;
		},
		show : function ( parentDomId , force ) {
			console.info( this.headData,this.data );
			this.tableList.setHeads(this.headData);
			this.tableList.setData(this.data);
			this.tableList.setParentDomId(parentDomId );
			this.tableList.setConfig( this.config);
	        this.tableList.show(force);
		}
};
$.extend($.fn.dataTableExt.oPagination, {
    "bootstrap": {
        "fnInit": function (oSettings, nPaging, fnDraw) {
            var oLang = oSettings.oLanguage.oPaginate;
            var fnClickHandler = function (e) {
                e.preventDefault();
                if (oSettings.oApi._fnPageChange(oSettings, e.data.action)) {
                    fnDraw(oSettings);
                }
            };

            $(nPaging).addClass('pagination').append(
                    '<ul class="pagination">' +
                    '<li class="prev disabled"><a href="#">&larr; ' + "上一页" + '</a></li>' +
                    '<li class="next disabled"><a href="#">' + "下一页" + ' &rarr; </a></li>' +
                    '</ul>'
            );
            var els = $('a', nPaging);
            $(els[0]).bind('click.DT', { action: "previous" }, fnClickHandler);
            $(els[1]).bind('click.DT', { action: "next" }, fnClickHandler);
        },

        "fnUpdate": function (oSettings, fnDraw) {
            var iListLength = 5;
            var oPaging = oSettings.oInstance.fnPagingInfo();
            var an = oSettings.aanFeatures.p;
            var i, iLen, j, sClass, iStart, iEnd, iHalf = Math.floor(iListLength / 2);

            if (oPaging.iTotalPages < iListLength) {
                iStart = 1;
                iEnd = oPaging.iTotalPages;
            }
            else if (oPaging.iPage <= iHalf) {
                iStart = 1;
                iEnd = iListLength;
            } else if (oPaging.iPage >= (oPaging.iTotalPages - iHalf)) {
                iStart = oPaging.iTotalPages - iListLength + 1;
                iEnd = oPaging.iTotalPages;
            } else {
                iStart = oPaging.iPage - iHalf + 1;
                iEnd = iStart + iListLength - 1;
            }

            for ( i = 0, iLen = an.length; i < iLen; i++) {
                // remove the middle elements
                $('li:gt(0)', an[i]).filter(':not(:last)').remove();

                // add the new list items and their event handlers
                for (j = iStart; j <= iEnd; j++) {
                    sClass = (j === oPaging.iPage + 1) ? 'class="active"' : '';
                    $('<li ' + sClass + '><a href="#">' + j + '</a></li>')
                        .insertBefore($('li:last', an[i])[0])
                        .bind('click', function (e) {
                            e.preventDefault();
                            oSettings._iDisplayStart = (parseInt($('a', this).text(), 10) - 1) * oPaging.iLength;
                            fnDraw(oSettings);
                        });
                }

                // add / remove disabled classes from the static elements
                if (oPaging.iPage === 0) {
                    $('li:first', an[i]).addClass('disabled');
                } else {
                    $('li:first', an[i]).removeClass('disabled');
                }

                if (oPaging.iPage === oPaging.iTotalPages - 1 || oPaging.iTotalPages === 0) {
                    $('li:last', an[i]).addClass('disabled');
                } else {
                    $('li:last', an[i]).removeClass('disabled');
                }
            }
        }
    }
});