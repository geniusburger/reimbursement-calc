
cellUtil = {
    smallSize: false,
    /**
     * Set the size and rebuild all cells if it has changed
     * @param {boolean} small true to set the size to small
     * @return {boolean} true if size changed
     */
    setSmallSize: function(small) {
        if( cellUtil.smallSize !== small) {
            console.log('changing small size to ' + small);
            cellUtil.smallSize = small;
            rowUtil.getCells().forEach(function(cell){
                cell.rebuildCell();
            });
            return true;
        }
        return false;
    }
};

/**
 * @param alignmentClass
 * @param [options]
 * @constructor
 */
function Cell(alignmentClass, options) {
	this.alignmentClass = alignmentClass;
	this.options = options ? options : {};
}

Cell.prototype.buildContents = function() {
	return document.createTextNode('');	// default to blank
};

Cell.prototype.makeBold = function(contents) {
	var strong = document.createElement('strong');
	strong.appendChild(contents);
	return strong;
};

Cell.prototype.formatCell = function() {
    var contents = this.buildContents();

    if( cellUtil.smallSize && this.options.smallAlternateText) {
        contents = document.createTextNode(this.options.smallAlternateText);
    } else if( this.options.alternateText) {
        contents = document.createTextNode(this.options.alternateText);
    }

    if( this.options.hiddenText) {
        var wrapper = document.createElement('div');
        wrapper.style.position = 'relative';

        var hidden = document.createElement('div');
        hidden.appendChild(document.createTextNode(this.options.hiddenText));
        hidden.className = 'hidden-cell';

        wrapper.appendChild(hidden);
        wrapper.appendChild(contents);
        contents = wrapper;
    }

    if( this.options.bold) {
        contents = this.makeBold(contents);
    }

    if( this.options.invisible) {
        wrapper = document.createElement('div');
        wrapper.style.visibility = 'hidden';
        wrapper.appendChild(contents);
        contents = wrapper;
    }
    return contents;
};

Cell.prototype.buildCell = function() {
	var td = document.createElement('td');
	var div = document.createElement('div');
    var contents = this.formatCell();

	div.appendChild(contents);
	if( this.alignmentClass) {
		td.className = this.alignmentClass;
	}
	td.appendChild(div);
	this.td = td;
	this.contentHolder = div;
	return td;
};

Cell.prototype.rebuildCell = function() {
    console.log('before', this.contentHolder);
    util.removeChildren(this.contentHolder);
    this.contentHolder.appendChild(this.formatCell());
    console.log('after', this.contentHolder);
};