
//////////////////////////////////////////////////////////////////////////////////
////////     ReimbursementEvent Class
//////////////////////////////////////////////////////////////////////////////////

function ReimbursementEvent(reimbursement, index, start) {
    this.reimbursement = reimbursement;
    this.index = index;
    this.start = start;
};

ReimbursementEvent.prototype.isStart = function() {
    return this.start;
};

ReimbursementEvent.prototype.isStop = function() {
    return !this.start;
};

ReimbursementEvent.prototype.getAmount = function() {
    return this.reimbursement.amount;
};

ReimbursementEvent.prototype.getDate = function() {
    return this.start ? this.reimbursement.startDate : this.reimbursement.stopDate;
};

ReimbursementEvent.prototype.getAmountString = function() {
    return "$" + this.reimbursement.dollars + "." + (this.reimbursement.cents < 10 ? "0" : "") + this.reimbursement.cents;
};

ReimbursementEvent.prototype.toString = function() {
    return (this.start ? "+ " : "- ") + this.getDate().toDateString() + " : " + this.getAmountString();
};
