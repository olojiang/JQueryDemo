/**
 * 
 */
/* (function($) {
    $.hitch = function(context, func) {
        var args = Array.prototype.slice.call(arguments, 
                2Remove context, and func);     
        return function() {
            return func.apply(context, 
                    Array.prototype.concat.apply(args, arguments));
        };
    };
})(jQuery);*/

"use strict";
function EchartsNeed(parentDomId,themeSelectId) {
	if(themeSelectId) {
		this.themeSelector = $("#" + themeSelectId);
	}
	
	this.curTheme = null;
	this.echarts = null;
	var parentDom = $("#" + parentDomId);
	parentDom.empty();
	parentDom.removeAttr("_echarts_instance_");
	this.domMain = document.getElementById(parentDomId);
	this.echarts_map_path = "js/echarts";
	this.echarts_path = "js/echarts";
	this.echarts_theme_path ="js/echarts/theme";
	this.hash = location.hash.replace('#','') !=null && location.hash.replace('#','') != "" ?
			location.hash.replace('#','') : ('macarons');
	this.parentDomId = parentDomId;
}
EchartsNeed.prototype = {
	setClickEvent : function ( click ) {
		this.clickevent = click;
	},
	setDBClickEvent : function ( dbclick ) {
		this.dbclickevent = dbclick;
	},
	setHoverEvent : function ( hover ) {
		this.hoverevent = hover;
	},
	setOption : function (option) {
		this.option = option;
	},
	updateOption: function(option) {
		//this.myChart.setOption(option, true);
		this.option = option;
		this.refresh();
	},
	getOption : function () {
		return this.option;
	},
	setTheme : function ( value ) {
		this.hash = value;
		window.location.hash = this.hash;
		var _this = this;
		require([ _this.echarts_theme_path +'/' + value ], function(tarTheme) {
			_this.curTheme = tarTheme;
		});
	},
	requireCallback : function(ec, defaultTheme) {
		var temp ={};
		if( this.curTheme != null) {
			temp = this.curTheme;
		} else {
			var _this = this;
			require([ _this.echarts_theme_path +'/' + _this.hash ], function(tarTheme) {
				defaultTheme = tarTheme;
			});
		}
		
		this.curTheme = this.themeSelector ? defaultTheme : temp;
		this.echarts = ec;
		this.refresh();
		var ecConfig = require('echarts/config');
		if ( this.clickevent ) {
			this.myChart.un(ecConfig.EVENT.CLICK);
			this.myChart.on(ecConfig.EVENT.CLICK, this.clickevent);
		}
		if ( this.dbclickevent ) {
			this.myChart.un(ecConfig.EVENT.DBLCLICK);
			this.myChart.on(ecConfig.EVENT.DBLCLICK, this.dbclickevent);
		}
		if ( this.hoverevent ) {
			this.myChart.un(ecConfig.EVENT.HOVER);
			this.myChart.on(ecConfig.EVENT.HOVER, this.hoverevent);
		}
		window.onresize = this.myChart.resize;
	},
	refreshTheme : function() {
		this.myChart.hideLoading();
		this.myChart.setTheme(this.curTheme);
	},
	selectChange : function(value) {
		var theme = value;
		var _this = this;
		this.myChart.showLoading();
		$(this.themeSelector).val(theme);
		if (theme !== 'default') {
			window.location.hash = value;
			require([ _this.echarts_theme_path +'/' + theme ], function(tarTheme) {
				_this.curTheme = tarTheme;
				setTimeout($.hitch(_this,_this.refreshTheme), 500);
			});
		} else {
			window.location.hash = '';
			_this.curTheme = {};
			setTimeout($.hitch(_this,_this.refreshTheme), 500);
		}
	},
	initTheme : function() {
		var _this = this;
		if (this.themeSelector) {
			this.themeSelector
					.html('<option selected="true" name="macarons">macarons</option>'
					        + '<option name="infographic">infographic</option>'
					        + '<option name="shine">shine</option>'
					        + '<option name="dark">dark</option>'
					        + '<option name="blue">blue</option>'
					        + '<option name="green">green</option>'
					        + '<option name="red">red</option>'
					        + '<option name="gray">gray</option>'
					        + '<option name="helianthus">helianthus</option>'
					        + '<option name="roma">roma</option>'
					        + '<option name="mint">mint</option>'
					        + '<option name="macarons2">macarons2</option>'
					        + '<option name="sakura">sakura</option>'
					        + '<option name="default">default</option>');
			$(this.themeSelector).on('change', function() {
				_this.selectChange($(this).val());
			});
			if ($(this.themeSelector).val(this.hash).val() != this.hash) {
				$(this.themeSelector).val('macarons');
				this.hash = 'macarons';
				window.location.hash = this.hash;
			}
		}
	},
	refresh : function(isBtnRefresh) {
		if (isBtnRefresh) {
			this.needRefresh = true;
			this.myChart.showLoading();
			setTimeout(this.refresh, 1000);
			return;
		}
		
		this.needRefresh = false;
		if (this.myChart && this.myChart.dispose) {
			this.myChart.dispose();
		}
		console.info("id -- theme",this.domMain,this.curTheme);
		this.myChart = this.echarts.init(this.domMain, this.curTheme);
		console.info("id2 -- theme");
		window.onresize = this.myChart.resize;
		this.myChart.setOption(this.option, true);
		
		$("#" + this.parentDomId).data('chart', this.myChart);
	},
	requireConfig : function(needMap) {
		this.needMap = needMap;
		var fileLocation = needMap ? this.echarts_map_path : this.echarts_path;
		require.config({
			paths : {
				echarts : fileLocation
			}
		});
	},
	requireExecute : function() {
		var _this = this;
		require([ 'echarts', _this.echarts_theme_path +"/"+ this.hash, 'echarts/chart/line',
				'echarts/chart/bar', 'echarts/chart/scatter',
				'echarts/chart/k', 'echarts/chart/pie', 'echarts/chart/radar',
				'echarts/chart/force', 'echarts/chart/chord',
				'echarts/chart/gauge', 'echarts/chart/funnel',
				this.needMap ? 'echarts/chart/map' : 'echarts' ],
				$.hitch(_this,_this.requireCallback));
	},
	execute : function (requireMap) {
		this.initTheme();
		this.requireConfig(requireMap?true:false);
		this.requireExecute();
	},
	getMyChart : function () {
		return this.myChart;
	},
	showLoading: function(text) {
		this.myChart.showLoading({
			text : text,
			effect: 'whirling'
		});
	},
	hideLoading: function() {
		this.myChart.hideLoading();
	}
};

/*data = [
	{name:"蒸发量",data:list}
];
config = {
	title : title ,
	subtitle : subtitle;
	x : key,
	y : key,
	type : .line","bar,
	defaultType : "line"
}
*/


function EchartsOptionHelper ( config ) {
	this.option ={};
	this.data =[];
	this.config = config;
}
EchartsOptionHelper.prototype = {
		pushItem : function ( item ) {
			this.data.push( item );
		},
		emptyItem : function () {
			this.data =[];
		},
		getTitle : function () {
			return ( this.config ==null || this.config.title == null ) ? "" :this.config.title;	
		},
		getSubTitle : function () {
			return ( this.config ==null || this.config.subtitle == null ) ? "" :this.config.subtitle;	
		},
		getYKey : function () {
			return ( this.config ==null || this.config.y == null ) ? "value" :this.config.y;	
		},
		getXKey : function () {
			return ( this.config ==null || this.config.x == null ) ? "name" : this.config.x;
		},
		getType : function () {
			return  ( this.config ==null || this.config.type == null ) ? ['line', 'bar'] : this.config.type;
		},
		getDefaultType : function () {
			return ( this.config ==null || this.config.defaultType == null ) ? "line" : this.config.defaultType;
		},
		isDataZoom : function () {
			return ( this.config == null || this.config.dataZoom == null) ? false : this.config.dataZoom;
		},
		isShowMarkPoint : function () {
			return (this.config == null || this.config.markPoint == null) ? false: this.config.markPoint;
		},
		isShowMarkLine : function () {
			return (this.config == null || this.config.markLine == null) ? false: this.config.markLine;
		},
		isCalculable : function () {
			return (this.config == null || this.config.calculable == null) ? true: this.config.calculable;
		},
		getDataZoomY : function () {
			return (this.config == null || this.config.dataZoomY == null) ? null: this.config.dataZoomY;
		},
		getLegend : function () {
			return ( this.config == null || this.config.legend == null) ? false : this.config.legend;
		},
		getGrid : function () {
			return ( this.config == null || this.config.grid == null) ? null : this.config.grid;
		},
		setOptionItem : function ( name ,value) {
			this.option[name] = value ;
		},
		getOptionItem : function ( name ) {
			return this.option[name];
		},
		getOption : function () {
			
			var sortKey =this.getXKey();
			
			$.each(this.data ,function (index ,item) {
				item.data.sort(function ( low ,high) {
					if(low[sortKey] < high[sortKey]) {
						return -1;
					}
					else if(low[sortKey] > high[sortKey]) {
						return 1;
					}
					else {
						return 0;
					}
				});
			});
			
			this.setTitle();
			this.setDataZoom();
			this.setGrid();
			this.setTootip();
			this.setLegend();
			this.setToolBox();
			this.setCalculable();
			this.setXAxis();
			this.setYAxis();
			this.setSeries();
			
			return this.option;
		},
		getDefaultMarkPoint : function () {
			var temp = {};
			temp.data = [];
			temp.data.push ({type : 'max', name: '最大值'});
			temp.data.push ({type : 'min', name: '最小值'});
			return temp;
		},
		getDefaultMarkLine : function () {
			var temp = {};
			temp.data = [];
			temp.data.push( {type : 'average', name: '平均值'});
			return temp;
		},
		setTitle : function (title , subtitle) {
			title = this.getTitle();
			subtitle = this.getSubTitle();
			var titleJson = {};
			if( title != null ) {
				titleJson.text = title;
			}
			if( subtitle != null ) {
				titleJson.subtext = subtitle;
			}
			this.setOptionItem("title", titleJson);
		},
		setTootip : function (delay, formater) {
			var tooltipJson = this.getOptionItem("tooltip")||{};
			tooltipJson.trigger = "axis" ;
			if ( delay != null ) {
				tooltipJson.showDelay =delay;
			}
			if( formater != null ) {
				tooltipJson.formatter = formater;
			}
			this.setOptionItem("tooltip", tooltipJson);
		},
		setLegendY : function( y) {
			var temp = this.getOptionItem("legend")||{};
			temp.y = y;
			this.setOptionItem("legend", temp);
		},
		setLegendX : function( x ) {
			var temp = this.getOptionItem("legend")||{};
			temp.x = x;
			this.setOptionItem("legend", temp);
		},
		setLegend : function () {
			var temp = this.getOptionItem("legend")||{};
			var legend = [];
			var templegend = this.getLegend();
			if( ! templegend ) {
				$.each( this.data , function ( key , item) {
					legend.push(item.name);
				});
			} else {
				legend = templegend;
			}
			temp.data = legend;
			this.setOptionItem("legend", temp);
		},
		setToolBoxY : function (y) {
			var temp = this.getOptionItem("toolbox")||{};
			temp.y = y;
			this.setOptionItem("toolbox", temp);
		},
		setToolBoxKey : function ( key, value) {
			var temp = this.getOptionItem("toolbox")||{};
			temp[key] = value;
			this.setOptionItem("toolbox", temp);
		},
		setToolBox : function () {
			var type = this.getType();
			var temp =this.getOptionItem("toolbox")||{};
			if(temp.show == null) {
				temp.show = true;
			}
			if( temp.feature == null) {
				temp.feature = {
			            mark : {show: true},
			            dataZoom : { show : this.isDataZoom()},
			            dataView : {show: true, readOnly: false},
			            magicType : {show: true, type: type},
			            restore : {show: true},
			            saveAsImage : {show: true}
			        };
			}
			
			this.setOptionItem("toolbox", temp);
		},
		setCalculable : function () {
			this.setOptionItem("calculable", this.isCalculable());
		},
		setXAxis0 : function (key, value) {
			var x = this.getOptionItem("xAxis") || [{}];
			var temp = x[0] || {};
			temp[key] =value;
			var arrTemp = [];
			arrTemp.push(temp);
			this.setOptionItem("xAxis", arrTemp);
		},
		setXAxis : function () {
			var timekey = this.getXKey();
			var x = this.getOptionItem("xAxis") || [{}];
			var temp = x[0] || {};
			temp.type = 'category';
			var time =[];
			
			if( this.data != null && this.data.length > 0) {
				$.each( this.data[0].data , function ( index , item) {
					time.push(item[timekey]);
				});
			}			
			temp.data = time;
			
			var arrTemp = [];
			arrTemp.push(temp);
			this.setOptionItem("xAxis", arrTemp);
		},
		setYAxis0:function ( key,value ) {
				var y = this.getOptionItem("yAxis") || [{}];
				var y0 = y[0] || {};
				y0[key] = value;
				var arrTemp = [];
				arrTemp.push(y0);
				this.setOptionItem("yAxis", arrTemp);
		},
		setYAxis : function () {
			var valuekey = this.getYKey();
			var y = this.getOptionItem("yAxis") || [{}];
			var temp = y[0] || {};
			temp.type = valuekey;
			var arrTemp = [];
			arrTemp.push(temp);
			this.setOptionItem("yAxis", arrTemp);
		},
		setDataZoom : function () {
			if( this.isDataZoom() ) {
				this.setOptionItem("dataZoom", {
			        y: this.getDataZoomY(),
			        show : true,
			        realtime: true,
			        start : 50,
			        end : 100
			    });
			}
		},
		setGrid : function () {
			var item = this.getGrid();
			if( item ) {
				this.setOptionItem("grid" , item);
			}
		},
		setSeries : function () {
			var temp = [];
			var _this = this;
			var valuekey = this.getYKey();
			var defaultType = this.getDefaultType();
			$.each( this.data , function ( index , item) {
				var tempData = [];
				$.each( item.data, function (i , dataItem) {
					tempData.push(dataItem[valuekey]);
				});
				temp.push( _this.getSeriesItem(item.name,item.type|| defaultType,tempData,item.markPoint,item.markLine ,item.symbol) );
			});
			this.setOptionItem("series", temp);
			this.option.series = temp;
		},
		getSeriesItem : function ( name , type , data, markPoint, markLine ,symbol) {
			var temp = {};
			if ( name == null ) {
				name = "data";
			}
			if ( type == null ) {
				type = "line";
			}
			if ( data == null ) {
				data = [];
			}
			if ( markPoint == null ) {
				markPoint = this.getDefaultMarkPoint();
			} 
			if ( markLine == null ) {
				markLine = this.getDefaultMarkLine();
			}
			temp.symbol = symbol;
			temp.name = name ;
			temp.type = type ;
			temp.data = data ;
			if( this.isShowMarkPoint() ) temp.markPoint = markPoint ;
			if( this.isShowMarkLine() ) temp.markLine = markLine ;
			return temp;	
		}
};

/**
 * Show graph
 * @param chartId
 * @param themeSelectId
 * @param option
 * @param requireMap
 */
function showGraph(chartId, themeSelectId, option, requireMap) {
// Graph
	var echartsNeed = new EchartsNeed(chartId, themeSelectId);
	echartsNeed.setOption(option);
	echartsNeed.execute(requireMap);

	// Show theme select
	$('#' + themeSelectId).parent().show();

	return echartsNeed;
}

function setGraphHeight(chartId, widthToHeight) {
// Graph height
	var chartDom = $('#' + chartId);
	var height = (chartDom.width() * widthToHeight);
	chartDom.css('height', height + "px");
}
/**
 * Generate line graph option
 * @param legend
 * @param yData
 * @param chartId
 * @param widthToHeight
 * @param h1
 * @param tooltipFormatter
 * @param xData
 * @param unit
 * @returns {{title: {text: *, subtext: string}, tooltip: {trigger: string, formatter: *}, legend: {data: *}, dataZoom: {show: boolean, realtime: boolean, start: number, end: number}, toolbox: {show: boolean, feature: {mark: {show: boolean}, dataView: {show: boolean, readOnly: boolean}, magicType: {show: boolean, type: string[]}, restore: {show: boolean}, saveAsImage: {show: boolean}}}, calculable: boolean, xAxis: {type: string, boundaryGap: boolean, data: *}[], yAxis: {type: string, axisLabel: {formatter: string}}[], series: Array}}
 */
function getLineGraphOption(legend,yData,chartId,widthToHeight,h1,tooltipFormatter,xData,unit){
// Series Data
	var series = [];
	var i, len;
	for (i = 0, len = legend.length; i < len; i++) {
		series.push({
			name: legend[i],
			type: 'line',
			data: yData[i],
			markPoint: {
				data: [
					{type: 'max', name: '最大值'},
					{type: 'min', name: '最小值'}
				]
			},
			markLine: {
				data: [
					{type: 'average', name: '平均值'}
				]
			}
		});
	}

	// Graph Height
	setGraphHeight(chartId, widthToHeight);

	// Option
	var option = {
		title: {
			text: h1,
			subtext: ''
		},
		tooltip: {
			trigger: 'axis',
			formatter: tooltipFormatter
		},
		legend: {
			data: legend
		},
		dataZoom: {
			show: true,
			realtime : true,
			start : legend.length>100?(legend.length-100)/2*100/legend.length:0, // Percentage
			end : legend.length>100?((legend.length-100)/2+100)*100/legend.length:100 // Percentage
		},
		toolbox: {
			show: true,
			feature: {
				mark: {show: true},
				dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['line', 'bar']},
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        calculable: true,
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: xData
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    formatter: unit?('{value} ' + unit):''
                }
            }
        ],
        series: series
    };

    return option;
}

/**
 * Show line graph
 * @param h1
 * @param legend
 * @param xData
 * @param yData
 * - Array of Array
 * @param tooltipFormatter
 * @param unit
 * @param chartId
 * @param themeSelectId
 * @param widthToHeight
 * - Ex: 0.618
 */
function lineGraph(h1, legend, xData, yData, tooltipFormatter, unit, chartId, themeSelectId, widthToHeight) {
	var option = getLineGraphOption(legend,yData,chartId,widthToHeight,h1,tooltipFormatter,xData,unit);
	showGraph(chartId, themeSelectId, option);
}

/**
 * Add mark link for the graph
 * @param option
 * @param name
 * @param val
 * markLine : {
                data : [
                    // 纵轴，默认
                    {type : 'max', name: '最大值', itemStyle:{normal:{color:'#dc143c'}}},
                    {type : 'min', name: '最小值', itemStyle:{normal:{color:'#dc143c'}}},
                    {type : 'average', name : '平均值', itemStyle:{normal:{color:'#dc143c'}}},
                    // 横轴
                    {type : 'max', name: '最大值', valueIndex: 0, itemStyle:{normal:{color:'#1e90ff'}}},
                    {type : 'min', name: '最小值', valueIndex: 0, itemStyle:{normal:{color:'#1e90ff'}}},
                    {type : 'average', name : '平均值', valueIndex: 0, itemStyle:{normal:{color:'#1e90ff'}}}
                ]
            }

 data : [
 [
 {name: '标线1起点', value: 100, xAxis: 1, yAxis: 20},      // 当xAxis为类目轴时，数值1会被理解为类目轴的index，通过xAxis:-1|MAXNUMBER可以让线到达grid边缘
 {name: '标线1终点', xAxis: '周三', yAxis: 20},             // 当xAxis为类目轴时，字符串'周三'会被理解为与类目轴的文本进行匹配
 ],
 [
 {name: '标线2起点', value: 200, xAxis: 10, yAxis: 20},     // 当xAxis或yAxis为数值轴时，不管传入是什么，都被理解为数值后做空间位置换算
 {name: '标线2终点', xAxis: 270, yAxis: 190}
 ],
 ...
 ]
 */
// - Example:
// addMarkXLine(option, '标线测试', 50);
function addMarkXLine(option, name, val) {
	// Default value
	var markLine = option.series[0].markLine = option.series[0].markLine||{};
	markLine.itemStyle = {
		normal:{
			lineStyle:{
				type: 'dashed'
			}
		}
	};

	var data = markLine.data = markLine.data||[];

	data.push([
		{name: name, value: val, xAxis: 0, yAxis: val},      // 当xAxis为类目轴时，数值1会被理解为类目轴的index，通过xAxis:-1|MAXNUMBER可以让线到达grid边缘
		{name: name, xAxis: 100, yAxis: val}             // 当xAxis为类目轴时，字符串'周三'会被理解为与类目轴的文本进行匹配
	]);
}

/**
 * Set position for item
 * @param option
 * @param item
 * @param x - 水平安放位置，默认为左侧，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
 * @param y - 垂直安放位置，默认为全图顶端，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
 */
function position(option, item, x, y) {
	var target = option[item];
	target.x = x;
	target.y = y;
}

/**
 * Set position for title
 * @param option
 * @param x - 水平安放位置，默认为左侧，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
 * @param y - 垂直安放位置，默认为全图顶端，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
 */
// - Example:
// titlePosition(option, 'left', 'center');
function titlePosition(option, x, y) {
	position(option, 'title', x, y);
}

/**
 * Set position for toolbox
 * @param option
 * @param x - 水平安放位置，默认为左侧，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
 * @param y - 垂直安放位置，默认为全图顶端，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
 */
// - Example:
// toolboxPosition(option, 'right', 'center');
function toolboxPosition(option, x, y) {
	position(option, 'toolbox', x, y);
}

/**
 * Mark value for the option item's attribute
 * @param option
 * @param item
 * @param attribute
 * @param value
 */
// - Example:
// markOption(option, 'grid'/*item*/, 'y'/*attribute*/, 100/*value*/)
function markOption(option, item, attribute, value) {
	option[item] = option[item] || {};
	option[item][attribute] = value;
}

/**
 * Add Map Series
 * @param list
 * @param series
 * @param mapType
 */
function addMapSeries(list, series, mapType) {
	var i, len;
	for (i = 0, len = list.length; i < len; i++) {
		var s = list[i];

		// s.name
		//'北京 Top10'

		// s.pointData
		//[
		//    {name:'上海',value:95},
		//    {name:'广州',value:90},
		//    {name:'大连',value:80},
		//    {name:'南宁',value:70},
		//    {name:'南昌',value:60},
		//    {name:'拉萨',value:50},
		//    {name:'长春',value:40},
		//    {name:'包头',value:30},
		//    {name:'重庆',value:20},
		//    {name:'常州',value:10}
		//]

		// s.lineData
		//[
		//    [{name:'北京'}, {name:'上海',value:95}],
		//    [{name:'北京'}, {name:'广州',value:90}],
		//    [{name:'北京'}, {name:'大连',value:80}],
		//    [{name:'北京'}, {name:'南宁',value:70}],
		//    [{name:'北京'}, {name:'南昌',value:60}],
		//    [{name:'北京'}, {name:'拉萨',value:50}],
		//    [{name:'北京'}, {name:'长春',value:40}],
		//    [{name:'北京'}, {name:'包头',value:30}],
		//    [{name:'北京'}, {name:'重庆',value:20}],
		//    [{name:'北京'}, {name:'常州',value:10}]
		//]

		series.push(
			{
				name: s.name,
				type: 'map',
				mapType: mapType,
				data:[],
				markLine : {
					smooth:true,
					effect : {
						show: true,
						scaleSize: 1,
						period: 30,
						color: '#fff',
						shadowBlur: 10
					},
					itemStyle : {
						normal: {
							borderWidth:1,
							lineStyle: {
								type: 'solid',
								shadowBlur: 10
							}
						}
					},
					data : s.lineData
				},
				markPoint : {
					symbol:'emptyCircle',
					//symbolSize : function (v){
					//    return 10 + v/10;
					//},
					symbolSize: 10,
					effect : {
						show: true,
						shadowBlur : 0
					},
					itemStyle:{
						normal:{
							label:{show:false}
						},
						emphasis: {
							label:{position:'top'}
						}
					},
					data : s.pointData // It's a list of point data
				}
			}
		);
	}
}