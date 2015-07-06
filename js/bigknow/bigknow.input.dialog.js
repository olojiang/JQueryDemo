"use strict";
/**
 * Constructor function
 */
function InputDialog(fields, options, finishFunction, htmlTemplate, cancelFunction) {
    /*
     * Default
     */
    fields = this.fields = fields || [];
    this.finishFunction = finishFunction;
    this.cancelFunction = cancelFunction;

    this.data = {};

    /*
     * Later may need to check if user canceled
     */
    this.canceled = true;

    /*
     * Merge options
     */
    var dialogOptions = {
        autoOpen: false,
        title: "SampleDailog",
        minWidth: 400,
        minHeight: 300,
        modal: true,
        buttons: [
            {
                text: options.yesButton || "保存",
                click: $.hitch(this, this.save)
            },
            {
                text: "取消",
                click: $.hitch(this, this.close)
            }
        ]
    };
    $.extend(dialogOptions, options || {});
    this.dialogOptions = dialogOptions;

    /*
     * Create dialog OR reuse
     */
    this.dialog = $('#inputDialog');
    if (this.dialog && this.dialog.length > 0) {
        // Use it
        console.log("Reuse dialog.");

        this.dialog.empty();
    } else {
        // Create
        console.log("Create dialog.");
        this.dialog = $('<div id="inputDialog"></div>').appendTo($('body'));
    }
    var dialog = this.dialog;

    /*
     * Create description
     */
    if (dialogOptions.description) {
        $('<div class="inputDialogRow inputDialogDescription"></div>')
            .text(dialogOptions.description)
            .appendTo(dialog);
    }

    /*
     * Create fields in dialog
     */
    var j = null;
    for (var i in fields) {
        if (!fields.hasOwnProperty(i)) {
            continue;
        }
        var field = fields[i];

        /*
         * Set all field
         */
        this.data[field.key] = field.initValue;

        /*
         * Label control
         */
        var labelControl = $('<span class="inputDialogLabel"></span>').text((field.required ? "* " : "") + field.name + " :");
        if (dialogOptions.labelMinWidth) {
            labelControl.css('minWidth', dialogOptions.labelMinWidth);
        }

        /*
         * Support different type of fields
         */
        var fieldControl = $('<span class="inputDialogField"></span>');

        /*
         * Field control
         */
        if (dialogOptions.fieldMaxWidth) {
            fieldControl.css('maxWidth', dialogOptions.fieldMaxWidth);
        }

        if (field.type === "text" || field.type === "password") {
            fieldControl.append($('<input type="' + field.type + '" />').val(field.initValue).attr('key', field.key));
        } else if (field.type === "readonly") {
            fieldControl.append($('<span></span>').text(field.initValue).attr('key', field.key));
        } else if (field.type === "textarea") {
            fieldControl.append($('<textarea style="height:50px;" />').val(field.initValue).attr('key', field.key));
        } else if (field.type === "checkbox") {
            var checkboxes = field.checkboxes;
            for (j in checkboxes) {
                if (!checkboxes.hasOwnProperty(j)) {
                    continue;
                }
                var checkbox = checkboxes[j];
                fieldControl.append($('<input type="checkbox" />').attr('checked', checkbox.initValue).attr('key', field.key).attr('subkey', checkbox.subkey))
                    .append($('<span></span>').text(" " + checkbox.label))
                    .append($('<br />'));

                if (j > 0) {
                    labelControl.append($('<br />'));
                }
            }

            /*
             * onChange
             */
            if (field.onChange) {
                fieldControl.change($.hitch(this, field.onChange));
            }
        } else if (field.type === "select") {
            var selectData = field.selectData;
            var selectControl = $('<select></select>').attr("key", field.key);

            for (j in selectData) {
                if (!selectData.hasOwnProperty(j)) {
                    continue;
                }
                var option = $('<option>').attr('value', selectData[j].value).text(selectData[j].name);
                selectControl.append(option);
            }

            selectControl.val(field.initValue);

            fieldControl.append(selectControl);

            this.data[field.key] = selectData;

            /*
             * onChange
             */
            if (field.onChange) {
                selectControl.change($.hitch(this, field.onChange));
            }
        } else if (field.type === "file") {

            var uploadForm = $("<form name='" + (field.formName || "uploadForm") + "' method=\"post\" target='ifm' style=\"width:380px;\" enctype=\"multipart/form-data\" action=\"" + (field.uploadUrl || "/cmp/upload") + "\" onsubmit ='return checkFileBDS()'></form>");

            var upinput = $("<input id='upfilebdsid' type=\"" + field.type + "\" name=\"" + (field.inputName || "uploadFilename") + "\" size=\"" + (field.size || "5") + "\" />")
                .attr("key", field.key)
                .css("display", "inline");
            uploadForm.append(upinput);
            uploadForm.append("&nbsp;&nbsp;<input type=\"submit\" name=\"submit\"  value=\"" + (field.buttonName || "上传") + "\">");

            uploadForm.append("<iframe id='ifm' name='ifm' onload='IFrameOnload()'  style='display:none;width: 206px;height:36px;'/>");
            fieldControl.append(uploadForm);
        } else if (field.type === "date") {
            var datePicker = new bigknow.DateTimePicker(null, {format: 'yyyy/mm/dd', minView: 2});
            var dateControl = datePicker.getDom();
            var dataInput = datePicker.getInput();
            dataInput.val(field.initValue).attr('key', field.key);
            fieldControl.append(dateControl);
            field.description = (field.description||"") + ' [yyyy/mm/dd]';
            field.noBr = true;
            /*
             var dateNow = new Date();
             new bigknow.DateTimePicker('.form_datetime', {format: 'yyyy/mm/dd', minView: 2, initialDate: dateNow});
             $("#appStartDate").val(formatDate(dateNow, 'YYYY/MM/DD'));
             $("#appEndDate").val(formatDate(addDate(dateNow, 6, "M"), 'YYYY/MM/DD'));
             */
        } else if (field.type === "time") {
            var timePicker = new bigknow.DateTimePicker(null, {format: 'yyyy/mm/dd hh:ii', endDate: '2049/10/01 23:59'});
            var timeControl = timePicker.getDom();
            var timeInput = timePicker.getInput();
            timeInput.val(field.initValue).attr('key', field.key);
            fieldControl.append(timeControl);
            field.description = (field.description||"") + ' [yyyy/mm/dd hh:ii]';
            field.noBr = true;
        }

        /*
         * Description for special field
         */
        if (field.description) {
            if(!field.noBr) {
                fieldControl.append($('<br />'));
            }
            fieldControl.append($('<span></span>').text(field.description).attr('data-row-description', field.key));
        }

        /*
         * Initial disabled for special field
         */
        if (field.initDisabled) {
            fieldControl.find('[key="' + field.key + '"]').attr('disabled', true);
        }

        /*
         * Sum up for row
         */
        var rowField = $('<div class="inputDialogRow"></div>') // New field
            .attr('data-row-field', field.key)
            .append(labelControl)
            .append(fieldControl)
            .appendTo(dialog); // To Parent

        /*
         * Enable initial invisible field
         */
        rowField.css('display', (field.initVisible === false ? 'none' : 'block'));
    }

    dialog.unbind('keypress').on('keypress', 'input[type=text], input[type=password]', $.hitch(this, function (evt) {
        if (evt.keyCode === 13) {
            this.save();
            evt.preventDefault();
        }
    }));

    /*
     * Display content as html template
     */
    if (htmlTemplate) {
        $(htmlTemplate).appendTo(dialog);
    }

    /*
     * Initialize dialog
     */
    this.dialog.dialog(dialogOptions);

    /*
     * Show dialog
     */
    $(".ui-dialog-titlebar").show();
}

/**
 * Show input dialog
 */
InputDialog.prototype.show = function () {
    this.dialog.dialog("open");
};

/**
 * Close dialog
 */
InputDialog.prototype.close = function (isSaved) {
    /*
     * Set the flag of cancel
     */
    this.canceled = isSaved !== true;

    /*
     * Actual close
     */
    $(this.dialog).dialog("close");

    /*
     * Try to see if it's canceled
     */
    if (this.canceled && this.cancelFunction) {
        // Call back the cancel function
        this.cancelFunction();
    }
};

/**
 * Save values
 */
InputDialog.prototype.save = function () {
    /*
     * Get value
     */
    var values = this.getValues();

    /*
     * Validate
     */
    if (this.validate(values)) {

        /*
         * Call finish function
         */
        if (this.finishFunction) {
            var finishResult = this.finishFunction(values);

            if (typeof finishResult === "undefined") {
                // default
                console.info("finishResult=", "undefined");
            } else if (finishResult.then) {
                // Deferred
                finishResult.done($.hitch(this, function (values) {
                    console.info("Deferred, done result: ", values);
                    this.close(true/*isSaved*/);
                }));
                finishResult.fail($.hitch(this, function (values) {
                    console.info("Deferred, fail result: ", values);
                }));

                return;
            } else if (finishResult === false) {
                // Some bad things happened
                return;
            }
        }

        /*
         * Display message
         */
        if (!this.dialogOptions.noSave) {
//			noty({
//				layout: 'topCenter',
//				text: "已经提交。",
//				closeWith: ['click', 'hover'],
//				type: "info",
//				timeout: 2*1000
//			});
            console.info("Do NOT has noSave function in dialog option");
        } else {
            console.info("has noSave function in dialog option");
        }

        /*
         * Close
         */
        this.close(true/*isSaved*/);
    } else {
        console.info("Not valid: ", values);
    }
};

/**
 * Get values for all fields
 */
InputDialog.prototype.getValues = function () {
    var fields = this.fields;
    var map = {};
    for (var i in fields) {
        if (!fields.hasOwnProperty(i)) {
            continue;
        }
        var field = fields[i];

        if (field.type === "select") {
            var select = this.dialog.find('[key="' + field.key + '"]');
            map[field.key] = select.val();
        } else if (field.type === "checkbox") {
            map[field.key] = [];
            var checkboxes = this.dialog.find('[key="' + field.key + '"]');
            $.each(checkboxes, function (index, checkbox) {
                if ($(checkbox).is(":checked")) {
                    map[field.key].push($(checkbox).attr('subkey'));
                }
            });
        } else if (field.type === "readonly") {
            map[field.key] = this.dialog.find('[key="' + field.key + '"]').text();
        } else {
            map[field.key] = this.dialog.find('[key="' + field.key + '"]').val();
        }
    }

    console.info("Values: ", map);

    return map;
};

/**
 * Validate user input
 * @param values
 * @returns {Boolean}
 */
InputDialog.prototype.validate = function (values) {

    var fields = this.fields;
    var dialog = this.dialog;

    for (var i in fields) {
        if (!fields.hasOwnProperty(i)) {
            continue;
        }
        var field = fields[i];
        var val = $.trim(values[field.key]);

        if (field.validate) { // Validate method take higher priority, because if it's provided want to be used
            if (!field.validate(values)) {
                this.validateFailed(field.name);
                return false;
            }
        } else if (field.required) {
            if (!val || val.length === 0) {
                dialog.find('[key="' + field.key + '"]').focus();
                this.validateFailed(field.name);
                return false;
            }
        }
    }

    return true;
};

/**
 * Display error message for specific validating field
 * @param name
 */
InputDialog.prototype.validateFailed = function (name) {
    /*
     * Display error message
     */
    noty({
        layout: 'topCenter',
        text: "校验\"" + name + "\"失败，请检查输入。",
        closeWith: ['click', 'hover'],
        type: "error",
        timeout: 2 * 1000
    });
};

/**
 * Get original data for fields
 * @param fieldName
 */
InputDialog.prototype.getData = function (fieldName) {
    return this.data[fieldName];
};

/**
 * Set data for fields
 * @param fieldName
 */
InputDialog.prototype.setSelect = function (fieldName, selectData) {
    var select = this.dialog.find('[key="' + fieldName + '"]');
    select.empty();
    this.data[fieldName] = selectData;
    $.each(selectData, $.hitch(this, function (index, item) {
        var option = $('<option>').attr('value', item.value).text(item.name);
        select.append(option);
    }));
};

/**
 * Add data for select fields
 * @param fieldName
 * @param value
 * @param name
 */
InputDialog.prototype.addSelect = function (fieldName, value, name) {

    // Check duplication
    var existingData = this.data[fieldName];

    var select = this.dialog.find('[key="' + fieldName + '"]');

    for (var i in existingData) {
        if (!existingData.hasOwnProperty(i)) {
            continue;
        }
        var row = existingData[i];

        if (row.value === value) {
            // Find existing, do not add again

            // Select new value
            select.val(value);

            return;
        }
    }

    // Add select
    var option = $('<option>').attr('value', value).text(name);
    select.append(option);

    // Select new value
    select.val(value);

    // Update memory
    this.data[fieldName].push({name: name, value: value});
};

/**
 * Set value for filed
 * @param fieldName
 * @param val
 */
InputDialog.prototype.setValue = function (fieldName, val) {
    var item = this.dialog.find('[key="' + fieldName + '"]');
    item.val(val);
};

/**
 * Get value for field
 * @param fieldName
 */
InputDialog.prototype.getValue = function (fieldName) {
    var item = this.dialog.find('[key="' + fieldName + '"]');
    return item.val();
};

/**
 * Set description for field.
 * @param fieldName
 * @param val
 */
InputDialog.prototype.setDesc = function (fieldName, val) {
    var item = this.dialog.find('[data-row-description="' + fieldName + '"]');
    item.text(val);
};

/**
 * Display special field or hide
 * @param fieldName
 * @param display
 */
InputDialog.prototype.display = function (fieldName, display) {
    var item = this.dialog.find('[data-row-field=' + fieldName + ']');
    item.css('display', display ? "block" : "none");
};

/**
 * Set data for fields
 * @param fieldName
 * @param enabled
 */
InputDialog.prototype.setEnabled = function (fieldName, enabled) {
    var field = this.dialog.find('[key="' + fieldName + '"]');
    field.attr('disabled', !enabled);
};

function DialogHelper() {
    this.fields = [];
}
DialogHelper.prototype = {
    getRealString: function (name) {
        return name === null ? "" : name;
    },
    getRealBoolean: function (value) {
        return value === null ? false : value;
    },
    getRealList: function (value) {
        return value === null ? [] : value;
    },
    pushSelectFields: function (name, key, selectData, onChange, initValue, required, validate, initVisible) {
        name = this.getRealString(name);
        key = this.getRealString(key);
        initValue = this.getRealString(initValue);
        required = this.getRealBoolean(required);
        this.fields.push({
            key: key,
            name: name,
            initValue: initValue,
            required: required,
            type: "select",
            onChange: onChange,
            selectData: selectData,
            validate: validate,
            initVisible: initVisible
        });
    },
    pushUploadFields: function (name, key, required, validate, initVisible) {
        name = this.getRealString(name);
        required = this.getRealBoolean(required);
        key = this.getRealString(key);
        this.fields.push({
            key: key,
            name: name,
            required: required,
            type: "file",
            validate: validate,
            initVisible: initVisible
        });
    },
    pushCommonFields: function (name, type, key, initValue, required, checkboxes,
                                validate, initVisible) {
        name = this.getRealString(name);
        type = this.getRealString(type);
        key = this.getRealString(key);
        initValue = this.getRealString(initValue);
        required = this.getRealBoolean(required);
        checkboxes = this.getRealList(checkboxes);
        this.fields.push({
            key: key,
            name: name,
            initValue: initValue,
            required: required,
            type: type,
            checkboxes: checkboxes,
            validate: validate,
            initVisible: initVisible
        });
    },
    pushFieldsItem: function (json) {
        this.fields.push(json);
    },
    clearFields: function () {
        this.fields = [];
    },
    getFields: function () {
        return this.fields;
    },
    ShowDialog: function (title, description, options, fnCallBack) {
        var opts = {
            title: title,
            description: description
        };
        if (options) {
            $.extend(opts, options);
        }
        var inputDialog = new InputDialog(this.fields, opts /* dialogOptions */, fnCallBack/* finishFunction */);
        inputDialog.show();
    },
    ShowCommonDialog: function (title, description, options) {
        this.ShowDialog(title, description, options, function (values) {
            noty({
                text: JSON.stringify(values)
            });
        });
    },
    ShowAjaxDialog: function (url, title, description, options, refreshObject, filter) {
        this.ShowDialog(title, description, options, function (values) {
            $.each(values, function (key, value) {
                if (filter && value === -1) {
                    values[key] = null;
                }
                var arry = [];
                if (value instanceof Array) {
                    var temp = "";
                    $.each(value, function (i, iv) {
                        temp += iv + ",";
                    });
                    values[key] = temp;
                }
            });

            var deferred = new $.Deferred();
            $.ajax({
                "type": "post",
                "url": url,
                "dataType": "json",
                "data": values,
                "success": function (data) {
                    console.info("success");
                    if (data.s === 1) {
                        if (refreshObject) {
                            refreshObject.load();
                            console.info("load,ok");
                        }
                        noty({text: data.i});
                        deferred.resolve("Done");
                    } else {
                        noty({text: data.i, type: "error"});
                        deferred.reject("Failed");
                    }
                },
                "error": function (data) {
                    console.info("error");
                }
            });

            return deferred;
        });
    }

};
function SelectDomOperationHelper() {

}
SelectDomOperationHelper.prototype = {
    getFunctionByUrl: function (url, targetKey, nameKey, valueKey, paramkey, initValue, isDisplay) {
        return function (evt) {
            var target = evt.target;
            var selectedValue = $(target).val();
            var param = {};
            if (paramkey === null) {
                paramkey = "id";
            }
            if (selectedValue !== "-1" && selectedValue !== null) {
                param[paramkey] = selectedValue;
            }
            if (isDisplay === null || !isDisplay) {
                this.display(targetKey, selectedValue !== "-1" && selectedValue !== null);
            }
            var _this = this;
            var selectdomHelper = new SelectDomOperationHelper();
            $.ajax({
                "type": "post",
                "url": url,
                "dataType": "json",
                "data": param,
                "success": function (data) {
                    console.info("success");
                    if (data.s === 1) {
                        var selectData = selectdomHelper.changeData(data.list, nameKey, valueKey);
                        _this.setSelect(targetKey, selectData);
                        if (initValue !== null) {
                            var search = false;
                            $.each(selectData, function (index, item) {
                                if (item.value === initValue) {
                                    search = true;
                                }
                            });
                            _this.setValue(targetKey, search ? initValue : -1);
                        }
                    }
                },
                "error": function (data) {
                    console.info("error");
                }
            });
        };
    },
    changeData: function (data, name, value) {
        var temp = [];
        temp.push({name: "请选择", value: "-1"});
        $.each(data, function (index, item) {
            var tempItem = {};
            tempItem.name = item[name];
            tempItem.value = item[value];
            var cols = [];
            if (item.columns !== null) {
                $.each(item.columns, function (i, col) {
                    var colItem = {};
                    colItem.name = col[name];
                    colItem.value = col[value];
                    cols.push(colItem);
                });
                tempItem.columns = cols;
            }
            temp.push(tempItem);
        });
        return temp;
    },
    getTableFunction: function (source, targetkey, initValue, isDisplay) {
        return function (evt) {
            console.log("On Change.");
            var target = evt.target;
            var selectedTable = $(target).val();
            if (isDisplay === null || !isDisplay) {
                this.display(targetkey, selectedTable !== "-1" && selectedTable !== null);
            }
            var selectedColumns = this.getData(source);
            console.info("name", selectedColumns, selectedTable);
            var _this = this;
            $.each(selectedColumns, $.hitch(this, function (i, val) {
                if (val.name === selectedTable) {
                    var selectData = val.columns;
                    this.setSelect(targetkey, val.columns);
                    if (initValue !== null) {
                        var search = false;
                        $.each(selectData, function (index, item) {
                            if (item.value === initValue) {
                                search = true;
                            }
                        });
                        _this.setValue(targetkey, search ? initValue : -1);
                    }
                    return;
                }
            }));
        };
    }
};

function IFrameOnload() {
    var loading = new DialogLoadingHelper("DialogLoadingImgId");
    loading.hideLoading();
    var iframe = $("#ifm").contents().find("body");
    var content = iframe.find("pre").html();
    if (content) {
        var data = JSON.parse(content);
        if (data.s === 1) {
            noty({text: data.i});
        } else {
            noty({text: data.i, type: "error"});
        }
    }
}
function checkFileBDS() {

    var value = $("#upfilebdsid").val();
    if (!value) {
        noty({text: "尚未选择任何文件", type: "error"});
        return false;
    }
    var loading = new DialogLoadingHelper();
    loading.showLoading("正在上传文件，请稍等...");
    return true;
}
function DialogLoadingHelper(parentDomId, infoDomId) {
    if (parentDomId === null) {
        this.createDialog();
    }
    this.loadingDom = $("#" + (parentDomId || "DialogLoadingImgId"));
    this.loadingInfoDom = $("#" + (infoDomId || "DialogLoadingInfoId"));
    this.loadingDom.dialog({
        autoOpen: false,
        modal: true,
        minHeight: "50px",
        minWidth: "205px"
    });
    $(".ui-dialog-titlebar").hide();
}

DialogLoadingHelper.prototype = {
    createDialog: function () {
        var bodyDom = $("body");
        var dialogDom = $('<div id="DialogLoadingImgId" style="float: left;padding : 5px;width :100%;display:none"></div>').appendTo(bodyDom);
        var imgDom = $('<div style="float:left"><img alt="" src="img/ajax-loader.gif" /></div>').appendTo(dialogDom);
        var textDom = $('<div style="float:left;padding:12px;" id="DialogLoadingInfoId">服务器正在运行中..</div>').appendTo(dialogDom);
    },
    showLoading: function (info) {
        this.setInfo(info);
        this.loadingDom.dialog("open");
    },
    setInfo: function (value) {
        if (value === null) {
            value = "服务器忙,请稍后..";
        }
        this.loadingInfoDom.text(value);
    },
    hideLoading: function () {
        this.loadingDom.dialog("close");
    }
};