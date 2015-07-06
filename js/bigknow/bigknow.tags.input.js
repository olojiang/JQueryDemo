/**
 * Created by Hunter on 3/28/2015.
 */
/**
 * Create BigknowTagsInput
 * @param input
 * @param source
 * @constructor
 */
function BigknowTagsInput(input, source) {
    this.originalInput = input;
    this.source = source;
    this.tagsinput = input.tagsinput('input');

    this.init();
}

/**
 * Select select event to create tags
 */
BigknowTagsInput.prototype.init = function(){
    var tagsinput = this.tagsinput;
    var originalInput = this.originalInput;
    tagsinput.typeahead({
        source: this.source,
        autoSelect: true,
        afterSelect: function(selectedItem) {
            originalInput.tagsinput("add", tagsinput.val());
            tagsinput.val('');
        }
    });
};

/**
 * Focus
 */
BigknowTagsInput.prototype.focus = function() {
    this.originalInput.tagsinput('focus');
};

/**
 * Add new tag
 * @param item
 */
BigknowTagsInput.prototype.add = function(item) {
    this.originalInput.tagsinput('add', item);
};

/**
 * Get all tags in array
 */
BigknowTagsInput.prototype.getValues = function() {
    return this.originalInput.tagsinput("items");
};