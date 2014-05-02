
ButtonCell.prototype = Object.create(Cell.prototype);

function ButtonCell() {
	Cell.apply(this, arguments);
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
    $(this).closest('tr').row.remove();
};