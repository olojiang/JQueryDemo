/**
 * This is a representation of nodeMapping dialog
 * @constructor
 */
function TableDialog(options) {
    this.url = options.url;

    /*
     * Dialog
     */
    var dialogId = options.dialogId || ("tableDialog_"+Math.floor(Math.random()*100000));
    this.TableDialog = '#' + dialogId;
    var dialog = $(this.TableDialog);
    if(dialog.length==0) {
        dialog = $('<div style="display:none" id="'+dialogId+'"></div>');
        $('body').append(dialog);
    }

    /*
     * Div
     */
    var tableId = options.tableId || ("tableDialog_table_"+Math.floor(Math.random()*100000));
    this.tableDiv = $("#" + tableId);
    if(this.tableDiv.length == 0) {
        var table = dialog.append($('<div id="'+tableId+'"></div>'));
    }

    /*
     * Table Div
     */
    this.tableDivId = tableId;

    /*
     * Save options
     */
    this.options = options;
}

/**
 * After dialog is shown, initialize the content
 * - only issue once
 * - EX: setup Events
 */
TableDialog.prototype.init = function(extraOpt) {
    var dialog = this.dialog = $(this.TableDialog);

    var windowWidth = $(document).width()*0.9;

    var buttons = [
        { text: "关闭",
            click: $.hitch(this, this.close) }
    ];

    // See if there are extra buttons
    if(!!this.options.extraButtons) {
        buttons = _.union(buttons, this.options.extraButtons);
    }

    var dialogOptions = {
        autoOpen: false,
        title: "Unknown Title",
        minWidth: 600,
        minHeight: 400,
        modal: true,
        buttons: buttons,
        position: {
            my: "center top",
            at: "center top+20",
            of: $('body')
        },
        open: $.hitch(this, this.onOpen),
        close: $.hitch(this, this.onClose),
        beforeClose: $.hitch(this, this.onBeforeClose)
    };

    if(!!extraOpt) {
        $.extend(dialogOptions, extraOpt);
    }

    dialog.dialog(dialogOptions);

    /*
     * most the events should only be registered once.
     */
    this.registerEvents();
};

/**
 * Close dialog
 */
TableDialog.prototype.close = function() {
    this.dialog.dialog( "close" );
};

/**
 * Show dialog
 */
TableDialog.prototype.show = function(title, queryData, position) {
    // Store query data for AJAX
    this.queryData = queryData;

    // Show dialog
    this.dialog.dialog("option", "title", title);

    if(position) {
        this.dialog.dialog("option", "position", position);
    }

    this.dialog.dialog("open");

    // Not confirmed closed yet
    this.closeConfirmed = false;

    // Initialize the content, return deferred object
    return this.onShow();
};

/**
 * Every time the show is called
 * @return deferred of data loading
 */
TableDialog.prototype.onShow = function() {
    this.clearDisplay();

    return this.loadData();
};

/**
 * Clear existing display for table, select, etc
 */
TableDialog.prototype.clearDisplay = function() {
    // Hide existing table, before it's fully load
    this.tableDiv.css('display', 'none');
};

/**
 * Load data for the dialog
 */
TableDialog.prototype.loadData = function() {
    // Load index index history
    var deferred = this.loadByAjax();
    return deferred;
};

/**
 * Load node mapping
 * - Default load all nodes
 */
TableDialog.prototype.loadByAjax = function() {
    bigknow.mask.showMessage(this.url, this.options.loadingText);

    this.tableList = [];
    this.rows = [];

    // Load all local tables
    var deferred = bigknow.ajax4(this.url/*url*/,
        this.queryData/*data*/, this/*context*/, function(data){
            bigknow.mask.hideMessage(this.url);
            if(data.s !== 1) {
                showError(data["i"]);
                return;
            }

            var tablesContainer = $('#'+this.tableDivId);
            tablesContainer.empty();

            // Pre-handle the all raw data
            var preHandle = this.options.preHandle;
            if(!!preHandle) {
                preHandle(data);
            }

            if(this.options.multiple) {
                // Multiple table
                var list = data['list'];

                for(var i in list) {
                    var tableData = list[i];

                    // Create table div
                    var tableDivId = "tableId_"+(Math.floor(Math.random()*100000));
                    $('<div id="'+tableDivId+'"></div>')
                        .addClass('tableContainer')
                        .appendTo(tablesContainer);

                    // Create table
                    this.showSingleTable(tableDivId, tableData);
                }
            } else {
                this.showSingleTable(this.tableDivId, data);
            }

            // Make table visible
            this.tableDiv.css('display', 'block');
        });

    return deferred;
};

TableDialog.prototype.showSingleTable = function(tableId, data) {
    // rawData from AJAX
    this.rawData = data;

    // Display right items
    if( this.options.listExpression ) {
        var list = eval(this.options.listExpression);
    } else {
        var list = data["list"] || [];
    }

    // rawList after we get it, before filter
    this.rawList = list;

    // Filter items
    var filterCallback = this.options.filterCallback;
    if(!!filterCallback) {
        list = _.filter(list, $.hitch(this, filterCallback));
    }

    // Convert the summary
    var preHandleTableData = this.options.preHandleTableData;
    if(!!preHandleTableData) {
        $.each(list, $.hitch(this, preHandleTableData));
    }

    // Prepare table data
    if(this.options.headers) {
        var headers = this.options.headers;
    } else {
        var headers=data['headers']||[];
    }
    var rows = list;
    this.rows.push(rows);
    console.info("table.dialog(), rows: ", rows);

    var config = {
        isFenYe: true
    };

    // Add "tableConfig" from outside
    if(this.options.tableConfig) {
        $.extend(config, this.options.tableConfig);
    }

    var options= {
        'bStateSave': false,
        "aLengthMenu" : [[5,10,25,50,100],[5,10,25,50,100]],
        iDisplayLength: 10,
        "bDefaultSort": false/*,
         sort: [ [0,'desc'] ]*/ // Sort by first column
    };

    // Add "tableOptions" from outside
    if(this.options.tableOptions) {
        $.extend(options, this.options.tableOptions);
    }

    var tableContainer = $('#'+tableId);

    // Table Title
    var tableName = data['tableName'];
    if(tableName) {
        $('<h4></h4>')
            .addClass('tableTitle')
            .text(tableName)
            .appendTo(tableContainer);
    }

    // Display table
    var tableListId = "tableListId_"+(Math.floor(Math.random()*100000));
    $('<div id="'+tableListId+'"></div>')
        .addClass('tableListContainer')
        .appendTo(tableContainer);

    var tableList = new TableList(tableListId, headers, rows, config, options);
    tableList.show();

    this.tableList.push(tableList);
};

/**
 * Register events
 */
TableDialog.prototype.registerEvents = function() {
    //this.registerRefreshEvent();
};

/**
 * Get table
 */
TableDialog.prototype.getTable = function() {
    var list = this.tableList;

    return this.getItemOrItems(list);
};

/**
 * Get table rows data
 */
TableDialog.prototype.getRows = function() {
    var list = this.rows;

    return this.getItemOrItems(list);
};

/**
 * Get first one if there is only one,
 * - Or return a list
 * @param list
 * @returns {*}
 */
TableDialog.prototype.getItemOrItems = function(list) {
    if(list && list.length == 1) {
        return list[0];
    } else if(!list) {
        return [];
    } else {
        return list;
    }
};

TableDialog.prototype.onOpen = function() {
    console.info("onOpen()");

};

TableDialog.prototype.onClose = function() {
    console.info("onClose()");
};

TableDialog.prototype.onBeforeClose = function() {
    console.info("onBeforeClose()");
};

/**
 * Get raw data after get from the ajax
 * @returns {Object|*|Array}
 */
TableDialog.prototype.getRawData = function() {
    return this.rawData;
};

/**
 * Get raw list after get from the ajax
 * @returns {Object|*|Array}
 */
TableDialog.prototype.getRawList = function() {
    return this.rawList;
};