'use strict';

class Region {



	constructor ( options ) {

		// Options should have a width, height, and borderSize, all in px.
		this.width = options.width;
		this.height = options.height;
		this.borderSize = options.borderSize;
		this.left = options.left;
		this.top = options.top;

		// Holds any subregions for this region.
		this.subregions = [];

		// Holds any border lines that will be in this region.
		this.borders = [];

		// The padding--left and right--before we allow splits.
		this.splitPadding = 0.25; // Convert percent -> decimal.

		// Given the padding, calculate where the split could happen.
		this.splitRange = 1 - ( this.splitPadding * 2 );

	}



	/**
	 * @function _getSplitLocation
	 * @param {number} dimension The dimension (width or height) along which we're splitting.
	 * @returns {number}
	 */
	getSplitLocation ( dimension ) {
		return ( dimension * this.splitPadding ) + Math.floor( Math.random() * ( dimension * 0.5 ) );
	}



	/**
	 * @function _split
	 * @param {string} direction Either 'vertical' or 'horizontal'--the direction to split.
	 */
	split ( direction ) {

		// If we're splitting vertically...
		if ( direction === 'vertical' ) {
			let location = this.getSplitLocation( this.width );
			this.subregions.push( new Region( {
				width: location,
				height: this.height,
				borderSize: this.borderSize,
				top: this.top,
				left: this.left
			} ) );
			this.subregions.push( new Region( {
				width: this.width - location,
				height: this.height,
				borderSize: this.borderSize,
				top: this.top,
				left: this.left + location
			} ) );
			this.borders.push( {
				width: this.borderSize,
				height: this.height,
				top: this.top,
				left: this.left + ( location - ( this.borderSize / 2 ) )
			} );

		// Otherwise, if we're splitting horozontally...
		} else if ( direction === 'horizontal' ) {
			let location = this.getSplitLocation( this.height );
			this.subregions.push( new Region( {
				width: this.width,
				height: location,
				borderSize: this.borderSize,
				top: this.top,
				left: this.left
			} ) );
			this.subregions.push( new Region( {
				width: this.width,
				height: this.height - location,
				borderSize: this.borderSize,
				top: this.top + location,
				left: this.left
			} ) );
			this.borders.push( { 
				width: this.width,
				height: this.borderSize,
				top: this.top + ( location - ( this.borderSize / 2 ) ),
				left: this.left
			} );
		}

	}



}

module.exports = Region;