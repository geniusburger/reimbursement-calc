/**
 * Holds currency values and helps with addition, subtraction, and formatting.
 * @param {string|Currency|undefined} amount
 * @constructor
 */

function Currency(amount) {

    /**
     * Indicates if this object was successfully constructed.
     * @type {boolean}
     */
    this.valid = false;

    /**
     * Indicates if thousand separators should be used when formatting the currency as a string.
     * @type {boolean}
     */
    this.useThousandsSeparators = true;

    /**
     * The number of integer dollars.
     * @type {number}
     * @private
     */
    this.dollars = 0;

    /**
     * The number of integer cents [0,99].
     * @type {number}
     * @private
     */
    this.cents = 0;

    /**
     * Indicates if this is the start of a pair of Currency objects;
     * @type {boolean}
     */
    this.start = true;

    if( typeof amount === 'string') {
        // amount is a currency string with dollars and cents
        amount = amount.replace(/\s|\$|,/g,'');  // Remove all whitespace, commas, and dollar signs
        if( !isNaN(amount) && amount !== '') {
            var parts = amount.split('.');
            this.dollars = parseInt(parts[0]);
	        if( parts.length == 1) {
		        parts.push('0');
	        }
            this.cents = parseInt(parts[1]);

            // Check if no dollars/cents were included
            if( isNaN(this.dollars)) {
                this.dollars = 0;
            }
            if( isNaN(this.cents)) {
                this.cents = 0;
            }
            if( parts[1].length === 1) {
                this.cents *= 10;   // Adjust for single digit cent strings
            }

            this.valid = true;

            if( this.dollars < 0) {
                this.valid = false;
                console.error('Currency constructed with invalid dollars in amount string', this.dollars);
            }
            if( this.cents < 0 || this.cents > 99) {
                this.valid = false;
                console.error('Currency constructed with invalid cents in amount string', this.cents);
            }
        } else {
            console.error('Currency constructed with invalid amount string', amount);
        }
    } else if( typeof amount === 'object') {
        // amount might contain dollar and cents fields
        if( amount instanceof Currency) {
            this.start = false;
            this.dollars = amount.dollars;
            this.cents = amount.cents;
            this.valid = true;
        } else {
            console.error('Currency constructed with invalid amount object', amount);
        }
    }
}

/**
 * Adjusts another Currency object by adding or subtracting this to/from it.
 * @param other The other Currency to adjust.
 * @returns {Currency} other
 */
Currency.prototype.adjust = function(other) {
    if( other.start) {
        return this.add(other);
    } else {
        return this.subtract(other);
    }
};

/**
 * Add another Currency object to this. This object will be updated.
 * @param {Currency} other The other Currency to add.
 * @returns {Currency} this
 */
Currency.prototype.add = function(other) {
    if( other instanceof Currency) {
        this.dollars += other.dollars;
        this.cents += other.cents;
        while( this.cents >= 100) {
            this.dollars++;
            this.cents -= 100;
        }
    } else {
        console.error("Can't add non-Currency type", other);
    }
    return this;
};

/**
 * Subtract another Currency object from this. This object will be updated.
 * @param {Currency} other The other Currency to subtract.
 * @returns {Currency} this
 */
Currency.prototype.subtract = function(other) {
    if( other instanceof Currency) {
        this.dollars -= other.dollars;
        this.cents -= other.cents;
        while( this.cents < 0) {
            this.dollars--;
            this.cents += 100;
        }
        if( this.dollars < 0) {
            console.warn('Resetting negative Currency to zero', this.toString());
            this.dollars = 0;
            this.cents = 0;
        }
    } else {
        console.error("Can't add non-Currency type", other);
    }
    return this;
};

/**
 * Gets just the dollars as a formatted string.
 * @returns {string}
 */
Currency.prototype.getDollarsString = function() {
    if( this.useThousandsSeparators) {
        return this.dollars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
        return this.dollars.toString();
    }
};

/**
 * Gets just the cents as a formatted string.
 * @returns {string}
 */
Currency.prototype.getCentsString = function() {
    if( this.cents >= 10 ) {
        return this.cents.toString();
    }
    return '0' + this.cents;
};

/**
 * Gets this as formatted currency string.
 * @returns {string}
 */
Currency.prototype.toString = function() {
  return '$' + this.getDollarsString() + '.' + this.getCentsString();
};

Currency.prototype.toFloat = function() {
	return parseFloat(this.dollars + '.' + this.cents);
}