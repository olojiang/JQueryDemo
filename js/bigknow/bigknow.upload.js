"use strict";
function BigknowUpload(prefixPath, callBack) {
    $('body').append($('<div class="uploadForm"></div>').load(prefixPath+'template/bigknow.upload.html',
        $.hitch(this, function(){

            this.upload_form_target = $('#upload_form_target');
            this.upload_file = $('#upload_file');
            this.upload_form = $('#upload_form');

            this.initEvents();
        })));

    this.prefixPath = prefixPath;
    this.callBack = callBack;
}

BigknowUpload.prototype.initEvents = function() {
    var _this = this;

    // After file uploaded, the iframe may has different content
    this.upload_form_target.on('load', $.hitch(this, function(evt){
        if(_this.isFileChanged) {
            var content = this.upload_form_target.contents().find('body').text()||"{}";
            var value = JSON.parse(content);
            console.info("Form loaded with content: ", value);

            // Call back for the caller of the upload plugin
            this.callBack(value);

            // Hide message mask
            bigknow.mask.hideMessage("uploadFile");
        }
    }));
    // After file selection changed, try to submit automatically.
    this.upload_file.on('change', $.hitch(this, this.fileChanged));
};

BigknowUpload.prototype.file_browser_callback = function(field_name, url, type, win) {
    if( type === 'image' ) {
        // If it's image, then attach for the upload browser to select.
        $('#upload_form input[type=file]').click();
    }
};

BigknowUpload.prototype.fileChanged = function(input) {
    // Get file selection
    var fileInput = this.upload_file;
    var fileNames = fileInput.val();
    console.info("fileChanged()", fileNames);

    // Validate file selection.

    // Show message mask
    bigknow.mask.showMessage("uploadFile", "上传中，请稍候。。。");

    // Submit
    this.upload_form.submit();
    fileInput.val("");

    this.isFileChanged = true;
};