/**
 * Created by Hunter on 4/21/2015.
 */
"use strict";
var shareSites = {
    facebook: {
        link: "https://facebook.com/share.php?u=(:link)&t=(:title)",
        width: 626,
        height: 436,
        title: "Facebook"
    },
    twitter: {
        link: "https://twitter.com/share?url=(:link)&text=(:title)",
        width: 500,
        height: 375,
        title: "Twitter"
    },
    sina_weibo: {
        link: "http://v.t.sina.com.cn/share/share.php?url=(:link)&title=(:title)",
        width: 750,
        height: 450,
        title: "新浪微博"
    },
    qq_weibo: {
        link: "http://v.t.qq.com/share/share.php?title=(:title)&url=(:link)&site=(:site)",
        width: 634,
        height: 668,
        title: "腾讯微博"
    },
    qq_zone: {
        link: "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title=(:title)&url=(:link)&summary=(:title)",
        width: 800,
        height: 600,
        title: "QQ空间"
    }
};

function getParamsOfShareWindow(width, height) {
    return ['toolbar=0,status=0,resizable=0,width=' + width + ',height=' + height].join('');
}

function BigknowShare(titleString, sourceString, siteString, parentDom) {
    this.link = encodeURIComponent(document.location);
    this.title = encodeURIComponent(titleString);
    this.source = encodeURIComponent(sourceString);
    this.windowName = "Share Window";
    this.site = siteString;

    this.parentDom = parentDom;

    this.initDisplay();
    this.initClickEvent();
}

/**
 * Initialize display
 */
BigknowShare.prototype.initDisplay = function() {
    console.info("initDisplay()");
    var parentDom = this.parentDom;

    for(var i in shareSites) {
        if(shareSites.hasOwnProperty(i)) {
            var item = shareSites[i];
            var value = i;
            var title = "分享到" + item.title;
            $('<span></span>').addClass(value).attr('title', title).appendTo(parentDom);
        }
    }
};

/**
 * Initialize click event.
 */
BigknowShare.prototype.initClickEvent = function() {
    var _this = this;
    this.parentDom.unbind().on('click', 'span', function(evt){
        var target = $(evt.currentTarget);
        var key = target.attr('class');

        var item = shareSites[key];
        var url = item.link;
        url = url.replace(/\(:title\)/g, _this.title);
        url = url.replace(/\(:link\)/g, _this.link);
        url = url.replace(/\(:site\)/g, _this.site);
        url = url.replace(/\(:source\)/g, _this.source);
        //var params = getParamsOfShareWindow(item.width, item.height);
        //window.open(url, _this.windowName, params);
        var win = window.open(url, '_blank');
        win.focus();
    });
};