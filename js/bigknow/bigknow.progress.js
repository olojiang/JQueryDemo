/**
 * Created by jiang on 6/4/2015.
 */
"use strict";

/**
 * Add a new progress bar to some where
 * @param domObject
 * @param initValue
 * @constructor
 */
function ProgressBar(domObject, initValue) {
    $('<div class="progress progress-striped active">'+
        '<div class="progress-bar progress-bar-success" role="progressbar"'+
        'aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"'+
        'style="width: '+initValue+'%;">'+
        '<span class="sr-only">'+initValue+'% Complete</span>'+
        '</div> &nbsp;&nbsp;<span class="value">'+initValue+'%</span>'+
        '</div>').appendTo(domObject);

    this.domObject = domObject;
}

/**
 * Set value to progress bar, 0~100
 * @param value
 */
ProgressBar.prototype.setValue = function(value){
    var perValue = value+"%";
    var domObject = this.domObject;
    domObject.find('.progress-bar').css('width', perValue);
    domObject.find('.value').text(perValue);

    if(value===100 && domObject.find('.finish').length===0) {
        domObject.append($('<p class="finish pull-right">完成</p>'));
        domObject.find('.progress-striped').removeClass('progress-striped');
    }
};