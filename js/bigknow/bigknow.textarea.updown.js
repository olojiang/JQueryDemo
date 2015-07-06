/**
 * Bind to text area, for user's ctrl+up and ctrl+down key for history.
 */
(function(){
    bigknowCreateObject("bigknow.textarea");

    bigknow.textarea.UpDown = function(jqueryDom){
        var dom = this.dom = jqueryDom;

        // Init history.
        this.history=new bigknow.localStorage.Array(); // If the browser support use the local storage.

        // Init current index.
        var index = this.index = this.history.size();

        // Init user key event
        dom.on('keyup', $.hitch(this, function(evt){

            if(evt.ctrlKey) {
                var keyCode = evt.keyCode;
                console.info("key() ", keyCode, ", before index: ", this.index, this.history);

                if(keyCode == "38") {
                    // UP
                    this.up();
                } else if(keyCode == "40") {
                    // DOWN
                    this.down();
                }

                console.info("key() ", keyCode, ", after index: ", this.index, this.history);
            }
        }));
    };

    /**
     * When user press up ctrl+up
     * - If it's top already, no more action.
     * - If it's not the top
     *   - If it has content, then store it to history[], and then get to last step.
     *   - If it doesn't has content, then get to last step directly.
     */
    bigknow.textarea.UpDown.prototype.up = function() {
        if(this.index == 0) {
            return;
        } else {
            // Save
            if(this.index == this.history.size() &&
                $.trim(this.dom.val())!="") { // Only save not empty value
                // Only save last editable one, others are immutable.
                this.history.add(this.dom.val());
            }

            // Show last one
            this.index--;
            this.dom.val(this.history.get(this.index));
        }
    };

    /**
     * When user presses down ctrl+down
     * - Doesn't do any thing for the empty result, if it's already last one.
     */
    bigknow.textarea.UpDown.prototype.down = function() {
        if(this.index >= this.history.size()-1) {
            // Last one

            if($.trim(this.dom.val())=="") {
                return;
            } else {
                // Store current value
                this.history.add(this.dom.val());
                this.index = this.history.size();

                // Empty the input area
                this.dom.val("");
            }
        } else {
            // Not last one, just show history
            this.index++;
            this.dom.val(this.history.get(this.index));
        }
    };

    /**
     * Add value into index
     * - Empty value filtered.
     * - Adjust the index to last one, and add value.
     */
    bigknow.textarea.UpDown.prototype.add = function() {
        var value = this.dom.val();

        if($.trim(value) !="") {
            var history = this.history;

            if(history.get(history.length-1)!=value) { // Do not want to add same command again and again
                history.add(value); // Store user input
            }

            this.index = history.size(); // Index point to empty place, then history length has increased

            console.info("After add: ", history);

            ///*
            // * Clear user input
            // */
            //this.dom.val("");

            // Focus
            this.dom.focus();
        }
    };

    /**
     * Just clear DOM display
     */
    bigknow.textarea.UpDown.prototype.clear = function() {
        var dom = this.dom.val("");
        setTimeout(function(){dom.focus();}, 100);
    };
})();