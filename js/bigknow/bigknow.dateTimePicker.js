/**
 * Link:
 *   http://www.bootcss.com/p/bootstrap-datetimepicker/
 *
 * Usage:
 *   new bigknow.DateTimePicker('.form_datetime');
 *
 *   new bigknow.DateTimePicker('.form_datetime', {format: 'yyyy/mm/dd', minView: 2});
 */
"use strict";
$(function(){
     bigknowCreateObject('bigknow');

     bigknow.DateTimePicker = function(dom, options) {
          if(!dom) {
               dom = $('<div class="input-group date">\n'+
                    '<input class="form-control" type="text"/>'+
                    '<span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>'+
                    '</div>');
          }

          this.dom = dom;

          var opts = {
               language: 'zh-CN',
               format: 'yyyy/mm/dd hh:ii:ss',
               startDate: new Date(),
               endDate: '2049/10/01',
               initialDate: new Date(),
               //minView:0,
               weekStart: 1,
               todayBtn:  1,
               autoclose: 1,
               todayHighlight: 1,
               //startView: 2,
               forceParse: 0,
               showMeridian: 1,
               pickerPosition: "bottom-left"
          };

          if(options) {
               $.extend(opts, options);
          }
          this.picker = dom.datetimepicker(opts);
     };

     bigknow.DateTimePicker.prototype.getDate = function() {
          return this.getInput().val();
     };

     bigknow.DateTimePicker.prototype.getDom = function() {
          return this.dom;
     };

     bigknow.DateTimePicker.prototype.getInput = function() {
          return this.getDom().find('input[type="text"]');
     };
});