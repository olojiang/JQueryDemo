/**
 * this is a mask message function for bigknow
 * Depends on:
 * - bigknow.mask.message.js
 * <script src="js/bigknow.mask.message.js"></script>
 * -- http://dinbror.dk/bpopup/
 * -- http://dinbror.dk/blog/bPopup/
 * Usage:
 *   bigknow.mask.showMessage("abc", "777");
 *   bigknow.mask.hideMessage("abc");
 */
(function($){
    $(function(){
        /*
         * Initialize bigknow.ajax name space
         */
        bigknow = (typeof bigknow !== "undefined")?bigknow:{};
        bigknow.mask = bigknow.mask || {};

        bigknow.mask.shown = {};
        bigknow.mask.timer = {};

        /*
         * Show message
         * background-color: #fff;
         border-radius: 10px 10px 10px 10px;
         box-shadow: 0 0 25px 5px #999;
         color: #111;
         display: none;
         min-width: 450px;
         padding: 25px;
         */
        bigknow.mask.showMessage = function(key, text) {
            // Check existing message
            var pop = this.shown[key];
            if(pop) {
                return;
            }

            // Show time spent
            var timeSpan = $('<span></span>').css(
                {
                    'display': 'inline-block',
                    'margin-left': '20px',
                    'color':'gray',
                    "fontSize": "14px",
                    "vertical-align": "middle"
                });

            var pop = $('<div></div>')
                .append($('<img />').attr('src', "img/ajax-loader.gif").css('vertical-align', 'middle'))
                .append($('<span></span>').text(text).css({'display': 'inline-block','margin-left': '15px', 'vertical-align': 'middle'}))
                .append(timeSpan)
                .css({
                    backgroundColor: "#fff",
                    "borderRadius": "10px 10px 10px 10px",
                    "boxShadow": "0 0 25px 5px #777",
                    "color": "#111",
                    "minWidth": "450px",
                    "padding": "20px 25px",
                    "font-size": "16px",
                    "display": "inline-block",
                    "vertical-align": "middle"
                })
                .appendTo($('body'));

            pop.bPopup({
                escClose: false,
                modal: true,
                modalClose: false,
                opacity: 0.3,
                positionStyle: 'fixed',
                position: [($('body').width()-pop.width())/2, 50]
            });

            // Store for close
            this.shown[key] = pop;

            // Start to change the content of timeSpan
            var startTime = new Date();
            this.timer[key] = setInterval(function(){
                timeSpan.text(Number((new Date()-startTime)/1000).toFixed(0) + " S");
            }, 1000);
        };

        /*
         * Hide message
         */
        bigknow.mask.hideMessage = function(key) {
            // Store for close
            var pop = this.shown[key];
            if(pop) {
                pop.close();
                delete this.shown[key];
            } else {
                console.error("Close mask with key: ", key, " but not exist.");
            }

            var timer = this.timer[key];
            if(timer) {
                clearInterval(timer);
                delete this.timer[key];
            } else {
                console.error("Close timer with key: ", key, " but not exist.");
            }
        };
    });
})(jQuery);