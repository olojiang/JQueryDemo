/**
 * Created by Hunter on 3/22/2015.
 */
"use strict";

function BigknowValidate() {

}

/**
 * Validate for all fields
 * @param conditions
 * @returns {boolean}
 */
BigknowValidate.prototype.validate = function(conditions) {
    var values = this.getValues(conditions);

    for(var i in conditions) {
        if(!conditions.hasOwnProperty(i)) {
            continue;
        }
        
        var cond = conditions[i];

        var check = cond.check?cond.check: this.notEmpty;

        if(!check(values[cond.field])) {
            // Show message,
            showError(cond.errorMsg);

            // Focus
            var field = $('#'+cond.field);
            if(cond.focus) {
                cond.focus(field);
            } else {
                field.focus();
            }

            return false;
        }
    }

    return true;
};

/**
 * Check item is not empty
 * @param item
 * @returns {boolean}
 */
BigknowValidate.prototype.notEmpty = function(item) {
    if(item && item !== "" && item.length > 0) {
        return true;
    } else {
        return false;
    }
};

/**
 * Get values for all field
 * @param conditions
 */
BigknowValidate.prototype.getValues = function(conditions) {
    var result = {};
    for(var i in conditions) {
        if(!conditions.hasOwnProperty(i)) {
            continue;
        }
        
        var cond = conditions[i];
        var field = $('#'+cond.field);

        var value = null;

        if(cond.getValue) {
            value = cond.getValue(field);
        } else {
            value = field.val();
        }

        result[cond.field] = value;
    }

    console.info("getValues() ", result);

    return result;
};

/**
 * Validate a single field for specific id
 * @param id
 */
BigknowValidate.prototype.required = function(id){
    var item = $('#'+id);
    var val = item.val();
    val = $.trim(val);
    if(val.length>0) {
        return {status: true};
    } else {
        setTimeout(function(){item.focus();}, 100);
        return {status: false, id: id, message: "请填写所有必要字段。"};
    }
};

/**
 * Validate an array of field for ids
 * @param ids
 * @returns
 */
BigknowValidate.prototype.requiredGroup = function(ids) {
    ids = ids || [];

    for(var i in ids) {
        if(!ids.hasOwnProperty(i)) {
            continue;
        }

        var id = ids[i];

        if( !bigknow.validate.required(id).status ) {
            return {status: false, id: id, message: "请填写所有必要字段。"};
        }
    }

    return {status: true};
};