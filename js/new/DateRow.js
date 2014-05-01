dateRowUtil = {
	onmouseover: function() {this.row.highlight(true, true);},
	onmouseout: function() {this.row.highlight(false, true);}
};

DateRow.prototype = Object.create(Row.prototype);

function DateRow(date, amount, owed) {
	Row.apply(this, arguments);
	this.highlightClass = amount.start ? 'danger' : 'success';
};

DateRow.prototype.remove = function () {
	$([this.tr,this.pair.tr]).remove();
};

DateRow.prototype.highlight = function (enable, recursive) {
	if(enable) {
		$(this.tr).addClass(this.highlightClass);
	} else {
		$(this.tr).removeClass(this.highlightClass);
	}

	if( recursive) {
		this.pair.highlight(enable, false);
	}
};

Row.prototype.build = function () {
	var tr = Row.prototype.build.apply(this, []);
	tr.onmouseover = dateRowUtil.onmouseover;
	tr.onmouseout = dateRowUtil.onmouseout;
	return tr;
};