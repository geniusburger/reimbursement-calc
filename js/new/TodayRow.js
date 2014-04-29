
TodayRow.prototype = Object.create(Row.prototype);

function TodayRow() {
    Row.apply(this, arguments);
}