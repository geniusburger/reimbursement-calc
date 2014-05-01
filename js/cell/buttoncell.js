
ButtonCell.prototype = Object.create(Cell.prototype);

function ButtonCell(dateIndex, onclick) {
	Cell.apply(this, arguments);
	this.dateIndex = dateIndex;
	this.onclick = onclick;
}

ButtonCell.prototype.buildContents = function() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "close";
    button.setAttribute("aria-hidden", "true");
    button.innerHTML = "&times;";
    button.dateIndex = this.dateIndex;
    $(button).click(this.onclick);
    return button;
};

ButtonCell.prototype.onclick = function(e) {
    $(this).closest('tr').row.remove();
};