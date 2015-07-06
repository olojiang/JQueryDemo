/**
 * Created by Hunter on 4/10/2015.
 */
function BigknowInlineEdit() {
    if(!this.container) {
        this.container = this.init();
    }
}

BigknowInlineEdit.prototype.targetClicked = function(saveCallback, evt){
    if(this.editMode) {
        this.restore();
    }

    var jqueryDom = this.jqueryDom = $(evt.currentTarget);

    this.saveCallback = saveCallback;

    jqueryDom.after(this.container);
    jqueryDom.hide();

    var text = jqueryDom.text();
    console.info("targetClicked(), Text:", text);

    this.input.val(text);
    this.container.show();

    setTimeout($.hitch(this, function(){
        this.input.focus();
    }), 100);

    this.editMode = true;
};

BigknowInlineEdit.prototype.init = function(saveCallback) {
    console.info("BigknowInlineEdit.init()");

    var container = this.container = $('<span class="inlineEditor"></span>');
    var input = this.input = $('<input type="text" class="inlineEditorInput" />').appendTo(container);
    input.keypress($.hitch(this, function(evt){
        if(evt.which == 13) {
            this.save();
            evt.preventDefault();
        }
    }));

    var cancel = this.cancel = $('<span class="glyphicon glyphicon-remove inlineEditorCancel" />').appendTo(container);
    cancel.on("click", $.hitch(this, this.restore));
    var ok = this.ok= $('<span class="glyphicon glyphicon-ok inlineEditorOk" />').appendTo(container);
    ok.on("click", $.hitch(this, this.save));

    return container;
};

/**
 * Save the result
 * @param evt
 */
BigknowInlineEdit.prototype.save = function(evt){
    var deferred = this.saveCallback(this.input.val(), this.jqueryDom);

    deferred.then( $.hitch(this, this.restore, true/*copyTextBack*/) );
};

/**
 * Restore the read only mode
 */
BigknowInlineEdit.prototype.restore = function(copyTextBack){
    if(copyTextBack) {
        this.jqueryDom.text(this.input.val());
    }

    this.container.hide();
    this.jqueryDom.show();
    this.editMode = false;
};