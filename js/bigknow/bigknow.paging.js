/**
 * Created by Hunter on 4/7/2015.
 */
function BigknowPaging(displayPageNumber) {
    this.displayPageNumber = displayPageNumber||10; // Total Page number we want to display to end user
}

BigknowPaging.prototype.display = function(jqueryContainerDom, total, start, countPerPage) {
    var totalPage =this.totalPage = Math.ceil(total/countPerPage);
    var currentPage = this.currentPage = Math.ceil(start/countPerPage);
    this.total = total;
    this.start = start;
    this.countPerPage = countPerPage;
    var endNumber = start + Math.min(total - start, countPerPage-1);

    /*
     * Default start and end page
     */
    var startPage = 1;
    var endPage = totalPage;

    /*
     * Display page number
     */
    var displayPageNumber = this.displayPageNumber;

    if(displayPageNumber < totalPage) {
        // Hide some page.
        var p = currentPage - Math.floor(displayPageNumber/2);
        if(p>=1) {
            startPage = totalPage-p>=displayPageNumber?p:totalPage-displayPageNumber+1;
        } else {
            startPage = 1;
        }
        endPage = Math.min(totalPage, startPage + displayPageNumber-1);
    }

    /*
     * Remove existing pagging info
     */
    jqueryContainerDom.find('div.pagingTotal').empty();

    /*
     * Paging total part
     * 第 1 到第  8 条；总共有 8 条'
     */
    var pagingTotalWrapper = $('<div class="pagingTotal"></div>').appendTo(jqueryContainerDom)
        .text("第 "+start+" 到第 "+endNumber+" 条；总共有 "+total+" 条");

    /*
     * Paging part
     */
    var pagingWrapper = $('<div class="paging"></div>').appendTo(jqueryContainerDom);

    $('<span></span>').text("|<").attr('title', '第一页').addClass("firstPage").appendTo(pagingWrapper);

    $('<span></span>').text("<").attr('title', '上一页').addClass("previous").appendTo(pagingWrapper);
    for(var i = startPage; i<=endPage; i++) {
        var page = $('<span></span>').text(i)
            .attr("data-page", i)
            .attr("data-count", countPerPage)
            .appendTo(pagingWrapper);

        if(currentPage == i) {
            page.addClass("currentPage");
        } else {
            page.removeClass("currentPage");
        }
    }

    $('<span></span>').text(">").attr('title', '下一页').addClass("next").appendTo(pagingWrapper);
    $('<span></span>').text(">|").attr('title', '最后一页').addClass("lastPage").appendTo(pagingWrapper);
};

BigknowPaging.prototype.setupPagingEvent = function(jqueryContainerDom, callBack) {
    var spans = jqueryContainerDom.find('div.paging>span');
    for(var i = 0, iLen=spans.length; i<iLen; i++) {
        var span = $(spans[i]);

        var currentPage = this.currentPage;
        var totalPage = this.totalPage;
        var target = currentPage;
        if(span.hasClass("firstPage")) {
            target = 1;
        } else if(span.hasClass("lastPage")) {
            target = totalPage;
        } else if(span.hasClass("next")) {
            // Next
            if(currentPage>=totalPage) {
                target = currentPage;
            } else {
                target = currentPage + 1;
            }
        } else if(span.hasClass("previous")) {
            // Previous
            if(currentPage<=1) {
                target = currentPage;
            } else {
                target = currentPage -1;
            }
        } else if(span.hasClass("currentPage")) {
            // Self, default
        } else {
            // Number
            target = Number(span.text());
        }

        span.click($.hitch(this, callBack, target, currentPage));
    }
};