rowUtil = {
	table: undefined,
	getRows: function(){return util.toArray(document.querySelectorAll('#tableBody tr.exists'));},
	updateOwed: function() {
		var owed = new Currency('0');
		var trs = rowUtil.getRows();
        var today = null;
        var nextExpiration = null;
		for( var i = 0; i < trs.length; i++) {
            var row = trs[i].row;
            row.update(owed);

            if( row instanceof TodayRow) {
                today = row;
            }

            if( today && row.isStop()) {
                nextExpiration = {
                    days: (util.stripTime(row.dateCell.date) - util.stripTime(today.dateCell.date)) / 86400000,
                    row: i-1
                };
                today = null; // Make sure it won't get populated again
            }
		}
        return nextExpiration;
	},
	add: function(row) {
		if( !rowUtil.table) {
			console.error('rowUtil.table is undefined');
			return;
		}
		var trs = rowUtil.getRows();
		var added = false;
		var time = row.dateCell.date.getTime();
        var tr = row.build();
		for( var i = 0; i < trs.length; i++) {
			if( time < trs[i].row.dateCell.date.getTime()) {
				rowUtil.table.insertBefore(tr, trs[i]);
				added = true;
				break;
			}
		}
		if( !added) {
			rowUtil.table.appendChild(tr);
		}
	}
};

function Row( className, dateCell, amountCell, owedCell, typeCell, buttonCell) {
	this.className = className;
	this.dateCell = dateCell;
	this.amountCell = amountCell;
	this.owedCell = owedCell;
	this.typeCell = typeCell;
	this.cells = [dateCell, typeCell, amountCell, owedCell, buttonCell];
}

Row.prototype.build = function() {
	var tr = document.createElement('tr');
	tr.row = this;
	tr.className = this.className;
	this.cells.forEach(function(cell){tr.appendChild(cell.buildCell())});
	this.tr = tr;
	return tr;
};

Row.prototype.update = function(currency) {

};

Row.prototype.isStart = function() {
	return this instanceof DateRow && this.amountCell.currency.start;
};

Row.prototype.isStop = function() {
    return this instanceof DateRow && !this.amountCell.currency.start;
};