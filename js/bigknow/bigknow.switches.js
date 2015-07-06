/**
 * Created by Hunter on 4/8/2015.
 */
function BigknowSwitches(inputJqueryDom, options) {
    this.options = options;
    inputJqueryDom.hide();

    this.inputJqueryDom = inputJqueryDom;

    this.init(inputJqueryDom, options);
}

BigknowSwitches.prototype.init = function(inputJqueryDom, options) {
    console.info("init()");
    // Add display into the function.
    var p = getBigknowElement(inputJqueryDom/*inputJqueryDom*/,
        'span'/*label*/,
        ["field", "switch"]/*cssArray|String*/,
        null/*attrMap*/,
        null/*content*/,
        true/*after*/);

    var label1 = getBigknowElement(p/*parentJqueryDom*/,
        'label'/*label*/,
        "cb-enable"/*cssArray|String*/,
        null/*attrMap*/,
        null/*content*/,
        false/*after*/);

    getBigknowElement(label1/*parentJqueryDom*/,
        'span'/*label*/,
        null/*cssArray|String*/,
        null/*attrMap*/,
        options.onText||'On'/*content*/,
        false/*after*/);

    var label2 = getBigknowElement(p/*parentJqueryDom*/,
        'label'/*label*/,
        ["cb-disable"]/*cssArray|String*/,
        null/*attrMap*/,
        null/*content*/,
        false/*after*/);
    getBigknowElement(label2/*parentJqueryDom*/,
        'span'/*label*/,
        null/*cssArray|String*/,
        null/*attrMap*/,
        options.offText||'Off'/*content*/,
        false/*after*/);

    var selectLabel = options.on? label1:label2;
    selectLabel.addClass("selected");

    // Set initial checked status
    inputJqueryDom.attr('checked', options.on);

    // Event setup on the click.
    var inputJqueryDom = this.inputJqueryDom;
    $(".cb-enable").click(function(){
        var parent = $(this).parents('.switch');
        $('.cb-disable',parent).removeClass('selected');
        $(this).addClass('selected');

        inputJqueryDom.attr('checked', true);
    });

    $(".cb-disable").click(function(){
        var parent = $(this).parents('.switch');
        $('.cb-enable', parent).removeClass('selected');
        $(this).addClass('selected');

        inputJqueryDom.attr('checked', false);
    });
};

BigknowSwitches.prototype.val = function() {
    console.info("val()");
    var val = this.inputJqueryDom.attr('checked');
    return val==="checked";
};