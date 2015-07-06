/**
 * Created by jiang on 3/23/2015.
 */
function BigknowDeferred() {
}

BigknowDeferred.prototype.delay = function(lengthInSeconds) {

    var d = new $.Deferred();

    var msgKey = "msgKey";
    bigknow.mask.showMessage(msgKey, "Delay some time... " + lengthInSeconds);

    setTimeout(function(){
        bigknow.mask.hideMessage(msgKey);

        d.resolve(msgKey + " END");

    }, 1000*lengthInSeconds);

    return d;
};