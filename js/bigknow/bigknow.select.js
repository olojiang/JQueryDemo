/**
 * Created by Hunter on 3/13/2015.
 */
"use strict";

/**
 * Create My Own Select Control
 * @param id | DomObject
 * @param labelFunction
 * @param onChange
 * @constructor
 */
function BigknowSelect(id, labelFunction, onChange) {
    this.select = typeof(id) === "string" ?$('#'+id): id;

    this.select.unbind();

    this.select.on('change', $.hitch(this, onChange||this.onChange));

    // Save label function(optional)
    this.labelFunction = labelFunction;
}

/**
 * Init select by Ajax method
 * @param url
 * @param data
 * @param loadingText
 * @param valueField
 * @param labelField
 * @param selectedValue
 * @param listExpression
 * @param nullText
 */
BigknowSelect.prototype.initByAjax = function(url, data, loadingText, valueField, labelField, selectedValue, listExpression, nullText) {
    bigknow.mask.showMessage(url, loadingText);

    bigknow.ajax4(url, data, this, $.hitch(this, this.handler, url, valueField, labelField, selectedValue, listExpression, nullText) );
};

/**
 * Init the select with list of data
 * - name
 * - value
 * @param list
 * @param valueField
 * @param labelField
 * @param selectedValue
 * @param nullText
 */
BigknowSelect.prototype.initByList = function(list, valueField, labelField, selectedValue, nullText) {
    var select = this.select;
    select.empty();

    var valueMap = {};
    var nameMap = {};

    var option = null;

    if(nullText) {
        option = $('<option></option>')
            .attr("value", "")
            .text(nullText);
        select.append(option);
    }

    for(var i in list) {
        if(list.hasOwnProperty(i)) {
            var item = list[i];

            var value = item[valueField];
            var label = item[labelField];
            var labelStore = label;

            // If there is an customization for the display
            if( this.labelFunction ) {
                label = this.labelFunction(item);
            }

            // Construct option for select
            option = $('<option></option>')
                .attr("value", value)
                .text(label);

            if(selectedValue == value) {
                option.attr('selected', true);
            }

            select.append(option);

            /*
             * Store for later convenience
             */
            valueMap[value] = labelStore;
            nameMap[labelStore] = value;
        }
    }

    select.data("valueMap", valueMap); // value => label
    select.data("nameMap", nameMap); // label => value
};

/**
 * Handle Ajax Result
 * @param url
 * @param valueField
 * @param labelField
 * @param listExpression
 * @param selectedValue
 * @param nullText
 * @param data
 */
BigknowSelect.prototype.handler = function(url, valueField, labelField, listExpression, selectedValue, nullText, data) {
    bigknow.mask.hideMessage(url);

    if(data.s!==1) {
        showError(data.i);
        return;
    }

    var list = [];

    // Display right items
    if( listExpression ) {
        list = eval(listExpression);
    } else {
        list = data.list || [];
    }

    this.initByList(list, valueField, labelField, selectedValue, nullText);
};

/**
 * Get user selection for the value
 * @returns {*}
 */
BigknowSelect.prototype.getValue = function() {
    var select = this.select;
    return select.val();
};

/**
 * Get user select for the label
 * @returns {*}
 */
BigknowSelect.prototype.getLabel = function() {
    var select = this.select;
    var value = this.getValue();

    return select.data("valueMap")[value];
};

/**
 * Selection on change
 */
BigknowSelect.prototype.onChange = function() {
    console.info("onChange()", "value->", this.getValue(), ", label->", this.getLabel());
};