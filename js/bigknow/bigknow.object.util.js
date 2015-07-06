/**
 * Created by jiang on 3/30/2015.
 */

/**
 * Create object based on comma separated string
 * @param string
 *   - bigknow.string.util
 */
function bigknowCreateObject(string) {
    var items = string.split(".");

    var obj = window;
    for(var i in items) {
        var item = items[i];

        if( typeof obj[item] === 'undefined' ) {
            obj[item] = {};
        }

        obj = obj[item];
    }
}