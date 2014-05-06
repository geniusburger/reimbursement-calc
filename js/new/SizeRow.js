sizeRowUtil = {
	exists: false,
	add: function() {
		if( !sizeRowUtil.exists) {
			rowUtil.add(new SizeRow());
			sizeRowUtil.exists = true;
		}
	}
};

SizeRow.prototype = Object.create(Row.prototype);

function SizeRow() {
	Row.apply(this, [
		'size-row',
		new DateCell(new Date(0), {alternateText: 'OOO OOO 00 0000', invisible: true}),
		new TextCell('$00,000.00', {invisible: true}),
		new TextCell('$00,000.00', {invisible: true}),
		new TextCell(dateRowUtil.DATE_START_TEXT.length > dateRowUtil.DATE_STOP_TEXT.length ? dateRowUtil.DATE_START_TEXT : dateRowUtil.DATE_STOP_TEXT, {invisible: true}),
		new ButtonCell({invisible: true})]);
}