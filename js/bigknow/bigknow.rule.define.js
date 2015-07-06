/**
 * Created by jiang on 6/3/2015.
 */
"use strict";

function RuleDefine(domObject, sourceValueList, valueTypeList, operatorsMap) {
    this.dom = domObject;

    // Add first row
    var rowOperation = $('<strong>添加规则：</strong><span class="glyphicon glyphicon-plus plus firstPlus" title="添加规则"></span>').appendTo(domObject);

    this.addRow(domObject, sourceValueList, operatorsMap, valueTypeList, false/*no remove*/);

    // Event to add another row
    domObject.unbind();
    domObject.on('click', '.plus', $.hitch(this, function(evt){
        var target = $(evt.currentTarget);
        console.info("Plus: target=", target);

        // Add row
        this.addRow(domObject, sourceValueList, operatorsMap, valueTypeList, false/*no remove*/);
    }));

    // Event to remove row
    domObject.on('click', '.minus', function(evt){
        var target = $(evt.currentTarget);
        console.info("Minus: target=", target);

        var row = target.closest('.row');
        row.remove();
    });
}

/**
 * Validate all value field make sure user input something
 * @param values
 */
RuleDefine.prototype.validate = function(values) {
    var i, len;
    if(!!values) {
        for (i = 0, len = values.length; i < len; i++) {
            var value = values[i];

            if(!value.value) {
                showError("输入值不完整，请检查输入。");
                return false;
            }
        }
    }

    return true;
};

/**
 * Get all values
 */
RuleDefine.prototype.getValues = function() {
    var rows = this.dom.find('.row');
    var i, len;
    var results = [];
    for (i = 0, len = rows.length; i < len; i++) {
        var row = rows[i];
        //console.info("row=", row);

        var values = this.getValue($(row));
        console.info("values=", values);

        results.push(values);
    }

    return results;
};

/**
 * Get Row Element's all value
 * @param rowElement - element inside row
 */
RuleDefine.prototype.getValue = function(rowElement) {
    var row = rowElement.closest('.row');
    //var div = row.find('div:nth(0)');
    //console.info("div=", div);

    var source = row.data('source').getValue();
    var valueType = row.data('valueType').getValue();
    var operator = row.data('operator').getValue();
    var value = row.data('value').val();

    return {
        source: source,
        valueType: valueType,
        operator: operator,
        value: value
    };
};

/**
 * Add a single row
 * @param domObject
 * @param sourceValueList
 * @param numberOperator
 * @param valueTypeList
 * @param noRemove
 */
RuleDefine.prototype.addRow = function(domObject, sourceValueList, numberOperator, valueTypeList, noRemove) {
    // Row
    var row = $('<div class="row ruleRow"></div>').appendTo(domObject);

    // Source
    var source = $('<select class="form-control" title="源对象"></select>').appendTo($('<div class="col-md-3"></div>').appendTo(row));
    var handlerSource = new BigknowSelect(source, null/*labelFunction*/, null/*onChange*/);
    handlerSource.initByList(sourceValueList, "value", "id", null/*selectedValue*/, null/*nullText*/);
    row.data('source', handlerSource);

    // Value Type
    var valueType = $('<select class="form-control" title="值类型"></select>').appendTo($('<div class="col-md-2"></div>').appendTo(row));

    // Operators
    var operator = $('<select class="form-control" title="关系"></select>').appendTo($('<div class="col-md-2"></div>').appendTo(row));
    var handlerOperator = new BigknowSelect(operator, null/*labelFunction*/, null/*onChange*/);
    row.data('operator', handlerOperator);

    // ValueType Handler
    var handlerValueType = new BigknowSelect(valueType, null/*labelFunction*/, function (evt) {
        var target = $(evt.currentTarget);
        console.info("target=", target.val());

        handlerOperator.initByList(numberOperator[target.val()], "id", "value", null/*selectedValue*/, null/*nullText*/);
    }/*onChange*/);
    handlerValueType.initByList(valueTypeList, "id", "value", null/*selectedValue*/, null/*nullText*/);
    row.data('valueType', handlerValueType);

    // Init operator
    handlerOperator.initByList(numberOperator.string, "id", "value", null/*selectedValue*/, null/*nullText*/);

    // Value input
    var value = $('<input class="form-control ruleValue" type="text" title="值" />').appendTo(
        $('<div class="col-md-3"></div>').appendTo(row));
    row.data('value', value);

    // Add another row
    var rowOperation = $('<span class="glyphicon glyphicon-plus plus" title="添加规则"></span>'+
        (noRemove?'':'&nbsp;&nbsp;<span class="glyphicon glyphicon-minus minus" title="删除规则"></span>')).appendTo(
        $('<div class="col-md-2 rowOperation"></div>').appendTo(row));
};