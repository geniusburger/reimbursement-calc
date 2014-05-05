
ButtonCell.prototype = Object.create(Cell.prototype);

function ButtonCell(invisible) {
	Cell.apply(this, arguments);
	this.invisible = invisible;
}

ButtonCell.prototype.buildContents = function() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "close";
    button.setAttribute("aria-hidden", "true");
    button.innerHTML = "&times;";
	if( this.invisible) {
		button.style.visibility = 'hidden';
	}
    $(button).click(this.onclick);
    return button;
};

ButtonCell.prototype.onclick = function(e) {
    $(this).closest('tr')[0].row.delete();
};