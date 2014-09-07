
TextCell.prototype = Object.create(Cell.prototype);

/**
 * @param text
 * @param [options]
 * @constructor
 */
function TextCell(text, options) {
	Cell.apply(this, ['text-center', options]);
	this.text = text;
}

TextCell.prototype.buildContents = function() {
    if( cellUtil.smallSize && this.options.smallText) {
        return document.createTextNode(this.options.smallText);
    } else {
	    return document.createTextNode(this.text);
    }
};