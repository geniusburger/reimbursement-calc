sizeRowUtil = {
	sizeRow: null,
	add: function() {
		if( !sizeRowUtil.sizeRow) {
            sizeRowUtil.sizeRow = new SizeRow();
			rowUtil.add(sizeRowUtil.sizeRow);
		}
	},
    getTextCellText: function() {
        return dateRowUtil.DATE_START_TEXT.length > dateRowUtil.DATE_STOP_TEXT.length ? dateRowUtil.DATE_START_TEXT : dateRowUtil.DATE_STOP_TEXT;
    },
    getTextCellOptions: function() {
        return {
            invisible: true,
            smallText : dateRowUtil.DATE_SMALL_START_TEXT.length > dateRowUtil.DATE_SMALL_STOP_TEXT.length ? dateRowUtil.DATE_SMALL_START_TEXT : dateRowUtil.DATE_SMALL_STOP_TEXT
        };
    }
};

SizeRow.prototype = Object.create(Row.prototype);

function SizeRow() {
	Row.apply(this, [
		'size-row',
		new DateCell(new Date(0), {alternateText: 'OOO OOO 00 0000', smallAlternateText: '00/00/0000', invisible: true}),
		new TextCell('$00,000.00', {invisible: true, smallText: '$00,000'}),
		new TextCell('$00,000.00', {invisible: true, smallText: '$00,000'}),
		new TextCell(sizeRowUtil.getTextCellText(), sizeRowUtil.getTextCellOptions()),
		new ButtonCell({invisible: true})]);
}