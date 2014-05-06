
ButtonCell.prototype = Object.create(Cell.prototype);

function ButtonCell(options) {
	Cell.apply(this, [null, options]);
}

ButtonCell.prototype.buildContents = function() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "close";
    button.setAttribute("aria-hidden", "true");
    button.innerHTML = "&times;";
    $(button).click(this.onclick);
    return button;
};

ButtonCell.prototype.onclick = function(e) {
    $(this).closest('tr')[0].row.delete();
};