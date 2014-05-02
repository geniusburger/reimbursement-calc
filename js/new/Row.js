rowUtil = {
	table: undefined,
	getRows: function(){return document.querySelectorAll('#tableBody tr');},
	updateOwed: function() {
		var owed = new Currency('0');
		var trs = rowUtil.getRows();
		for( var i = 0; i < trs.length; i++) {
			trs[i].row.update(owed);
		}
	},
	add: function(row) {
		if( !rowUtil.table) {
			console.error('rowUtil.table is undefined');
			return;
		}
		var trs = rowUtil.getRows();
		var added = false;
		var time = row.dateCell.date.getTime();
		for( var i = 0; i < trs.length; i++) {
			if( time < trs[i].row.dateCell.date.getTime()) {
				rowUtil.table.insertBefore(row.build(), trs[i]);
				added = true;
				break;
			}
		}
		if( !added) {
			rowUtil.table.appendChild(row.build());
		}
	}
};

function Row( dateCell, amountCell, owedCell, typeCell, buttonCell) {
	this.dateCell = dateCell;
	this.amountCell = amountCell;
	this.owedCell = owedCell;
	this.cells = [dateCell, typeCell, amountCell, owedCell, buttonCell];
}

Row.prototype.build = function() {
	var tr = document.createElement('tr');
	tr.row = this;
	this.cells.forEach(function(cell){tr.appendChild(cell.buildCell())});
	this.tr = tr;
	return tr;
}

Row.prototype.update = function(currency) {

};

Row.prototype.isStart = function() {
	return this instanceof DateRow && this.amountCell.currency.start;
};