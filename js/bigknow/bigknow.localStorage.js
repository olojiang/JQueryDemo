(function(){
    createObject = bigknowCreateObject("bigknow.localStorage");

    bigknow.localStorage.Array = function() {
        if(typeof(Storage) !== "undefined") {
            this.support = true;
            this.array = localStorage;

            var count = 0;
            for(var i in localStorage) {
                if(!isNaN(Number(i))) {
                    count++;
                }
            }
            this.length = count;

            console.info("Loaded from localStorage: ", this.length);
        } else {
            this.support = false;
            this.array = [];
            this.length = 0;
        }
    };

    /**
     * Add new value
     */
    bigknow.localStorage.Array.prototype.add = function(value) {
        if( this.array[this.size()-1]!=value ) {
            this.array[this.length++] = value;
        } else {
            console.info("Same value");
        }
    };

    bigknow.localStorage.Array.prototype.get = function(index) {
        return this.array[index];
    };

    /**
     * Get size of the array
     * @returns {number}
     */
    bigknow.localStorage.Array.prototype.size = function() {
        return this.length;
    };
})();