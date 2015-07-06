/**
 * Created by Hunter on 4/24/2015.
 */

/*
 var items = [
 {
 iconClass: 'glyphicon-user blue',
 label: '下载人数',
 number: 507
 },
 {
 iconClass: 'glyphicon-star green',
 label: '应用排行榜',
 number: 228
 },
 {
 iconClass: 'glyphicon-envelope red',
 label: '评论总数',
 number: 25
 }
 ];

 <div class="col-md-4 col-sm-4 col-xs-6">
 <a class="well top-block" href="#">
 <i class="glyphicon glyphicon-user blue"></i>
 <div>下载人数</div>
 <div id="download_num">507</div>
 </a>
 </div>
*/

function BigknowTopBlock(dom, items) {
    // Add class to parent
    dom.addClass('row');
    dom.empty();

    var len = items.length;

    var space = (12/len).toFixed(0);

    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        var div = $('<div class="col-md-'+space+'"></div>');
        var a = $('<a class="well top-block" href="javascript: void(0);"></a>').appendTo(div);

        $('<i class="glyphicon '+item.iconClass+'"></i>').appendTo(a);
        $('<div class="top-label"></div>').text(item.label).appendTo(a);
        $('<div class="top-number"></div>').text(item.number).appendTo(a);

        if(item.onclick) {
            div.on('click', $.hitch(this, item.onclick, item));
        }

        div.appendTo(dom);
    }

}