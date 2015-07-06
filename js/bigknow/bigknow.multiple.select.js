/**
 * Created by jiang on 6/3/2015.
 */
"use strict";
/**
 * Single Multiple Select
 * @param domObject
 * @param url
 * @param queryData
 * @param loadMessage
 * @param classX
 * @param formatLabelFunc
 * @returns {*}
 * @constructor
 */
function MultipleSelect(domObject, url, queryData, loadMessage, classX, formatLabelFunc) {
    this.dom = domObject;

    var item = this.item = $('<select multiple class="'+classX+'"></select>');

    if(!!url) {
        var data = queryData || {};
        bigknow.mask.showMessage(url, loadMessage);
        var deferred = new $.Deferred();
        bigknow.ajax4(url, data, this, function(data){
            bigknow.mask.hideMessage(url);

            if(data.s !== 1) {
                showError(data.i);
                deferred.reject(url + ", failed: " + data.i);
                return;
            }

            // Operations after ajax returned
            var list = data.list||[];
            var i, len;
            for (i = 0, len = list.length; i < len; i++) {
                var opt = list[i];
                var label = formatLabelFunc?formatLabelFunc(opt):opt.name; // May format label
                item.append($('<option value="'+label+'">'+label+'</option>'));
            }

            deferred.resolve(url + ", resolved: " + data);
        });
    }

    if(domObject) {
        item.appendTo(domObject);
    }

    return item;
}

/**
 * Get values
 */
MultipleSelect.prototype.getValues = function() {
    return this.item.val();
};

/**
 * 2 Multiple selections with buttons to select to each other
 * @param domObject
 * @param url
 * @param urlRight
 * @param queryData
 * @param loadMessage
 * @param classX
 * @param formatLabelFunc
 * @constructor
 */
function MultipleSelect2(domObject, url, urlRight, queryData, loadMessage, classX, formatLabelFunc) {
    this.dom = domObject;

    var row = $('<div class="row MultipleSelect2Row"></div>');

    // Create Left
    var left = $('<div class="col-md-5"></div>').appendTo(row);
    var leftSelect = this.leftSelect = new MultipleSelect(left, url,
        queryData, loadMessage, classX, formatLabelFunc);

    // Create buttons
    var mid = $('<div class="col-md-2" style="text-align: center;"></div>').appendTo(row);
    $('<button class="btn MultipleSelectBtn add" title="添加">></button>').appendTo(mid);
    $('<br/>').appendTo(mid);
    $('<button class="btn MultipleSelectBtn addAll" title="添加所有">>></button>').appendTo(mid);
    $('<br/>').appendTo(mid);
    $('<button class="btn MultipleSelectBtn remove" title="删除"><</button>').appendTo(mid);
    $('<br/>').appendTo(mid);
    $('<button class="btn MultipleSelectBtn removeAll" title="删除所有"><<</button>').appendTo(mid);

    // Create Right
    var right = $('<div class="col-md-5"></div>').appendTo(row);
    var rightSelect = this.rightSelect = new MultipleSelect(right, urlRight, queryData, loadMessage, classX, formatLabelFunc);

    // Display left and right
    row.appendTo(domObject);

    // Setup button event
    mid.on('click', '.add', function(){
        var items = leftSelect.find('option:selected');

        if(items.length === 0 ) {
            showWarning('请先选择');
        }
        items.appendTo(rightSelect);
    });

    mid.on('click', '.remove', function(){
        var items = rightSelect.find('option:selected');

        if(items.length === 0 ) {
            showWarning('请先选择');
        }
        items.appendTo(leftSelect);
    });

    mid.on('click', '.addAll', function(){
        var items = leftSelect.find('option');

        if(items.length === 0 ) {
            showWarning('已经为空');
        }
        items.appendTo(rightSelect);
    });

    mid.on('click', '.removeAll', function(){
        var items = rightSelect.find('option');

        if(items.length === 0 ) {
            showWarning('已经为空');
        }
        items.appendTo(leftSelect);
    });
}

/**
 * Get select values
 * @param select
 * @returns {Array}
 */
function getSelectValues(select) {
    var options = select.find('option');
    var values = [];
    options.each(function (i, item) {
        values.push($(item).attr('value'));
    });
    return values;
}

/**
 * Get select values
 * @param select
 * @returns {Array}
 */
function getSelectValues2(select) {
    var options = select.find('option');
    var values = [];
    options.each(function (i, item) {
        values.push({
            value: $(item).attr('value'),
            id: $(item).text()
        });
    });
    return values;
}

/**
 * Get left side values
 * @returns {*}
 */
MultipleSelect2.prototype.getLeftValues = function() {
    return getSelectValues(this.leftSelect);
};

/**
 * Get right side values
 * @returns {*}
 */
MultipleSelect2.prototype.getRightValues = function() {
    return getSelectValues(this.rightSelect);
};

/**
 * Get right side values {id: '', value: ''}
 * @returns {*}
 */
MultipleSelect2.prototype.getRightValues2 = function() {
    return getSelectValues2(this.rightSelect);
};

/**
 * Get both side values
 * @returns {{left: *, right: *}}
 */
MultipleSelect2.prototype.getValues = function() {
    return {
        left: this.getLeftValues(),
        right: this.getRightValues()
    };
};