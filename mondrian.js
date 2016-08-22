'use strict';

var fs = require( 'fs' );
var _ = require( 'underscore' );

var Region = require( './region' );

class Mondrian {



	constructor ( options ) {

		var options = options || {};

		this.width = options.width || 440; // PX
		this.height = options.height || 220; // PX
		this.borderSize = options.borderSize || 2; // PX
		this.delay = options.delay || 100; // MS
		this.filename = options.filename || 'temp.gif';
		this.quality = options.quality || 100; // %
		this.holdCount = options.holdCOunt || 10;  // Number of frames to hold at the end.

		// The directionVariance controls the liklihood of two veritical or horizontal
		// directions being set in a row.
		this.directionHinge = 0.5;
		this.originalDirectionHinge = 0.5;
		this.directionHingeIncriment = 0.33;

		// The splitMin/splitMax is the min and max numbers of splits a region can have.
		this.splitMin = 1;
		this.splitMax = 1;

		// The depth is the number of layers deep to recurse.
		this.depth = 4;

		this.bottomRegions = [];
		this.borders = [];

		this.colors = {
			white: '#ffffff',
			blue: '#0028f9',
			red: '#e02727',
			yellow: '#fffa28',
			black: '#000000'
		};

		this.reverseColors = {
			'#ffffff': 'white',
			'#0028f9': 'blue',
			'#e02727': 'red',
			'#fffa28': 'yellow',
			'#000000': 'black'
		};

		this.primaries = [ 'blue', 'red', 'yellow' ];

		this.usedColors = [];

	}



	getDirection () {

		let rando = Math.random()

		if ( rando > 1 ) {
			this.directionHinge = this.originalDirectionHinge;
			return 'horizontal';
		} else if ( rando < 0 ) {
			this.directionHinge = this.originalDirectionHinge;
			return 'vertical';
		} else if ( rando > this.directionHinge && rando < 1 ) {
			this.directionHinge += this.directionHingeIncriment;
			return 'horizontal';
		} else {
			this.directionHinge -= this.directionHingeIncriment;
			return 'vertical';
		}

	}


	split ( depth, regions ) {

		if ( depth < this.depth ) {

			depth++;

			for ( let i = 0, l = regions.length; i < l; i++ ) {

				let direction = depth === 0 ? 'vertical' : this.getDirection();

				let splits = Math.floor( Math.random() * ( this.splitMax - this.splitMin ) ) + this.splitMin;

				for ( let j = 0; j < splits; j++ ) {
					regions[i].split( direction );
				}

				this.borders = this.borders.concat( regions[i].borders );

				if ( depth === this.depth ) {
					this.bottomRegions = this.bottomRegions.concat( regions[i].subregions );
				}

				this.split( depth, regions[i].subregions );

			}

		}

	}


	createRegions () {

		var base = new Region( {
			width: this.width,
			height: this.height,
			borderSize: this.borderSize,
			top: 0,
			left: 0
		} );

		this.split( 0, [ base ] );

		return { regions: this.bottomRegions, borders: this.borders };

	}



	render ( context, encoder, callback ) {

		let bottoms = this.createRegions();
		let regions = bottoms.regions;
		let borders = bottoms.borders;

		encoder.start();
		encoder.setRepeat( 0 ); // 0 = repeat; -1 = no repeat.
		encoder.setDelay( this.delay );
		encoder.setQuality( this.quality );

		context.fillStyle = this.colors.white;
		context.fillRect( 0, 0, this.width, this.height );
		encoder.addFrame( context );

		this.usedColors = [];

		for ( let i = 0, l = regions.length; i < l; i++ ) {
			let region = regions[i];
			let rando = Math.random();
			let color = rando > 0.75 ? this.colors[this.primaries[Math.floor( Math.random() * this.primaries.length )]] : this.colors.white;
			context.fillStyle = color;
			context.fillRect( region.left, region.top, region.width, region.height );
			if ( color !== this.colors.white ) {
				let usedColor = this.reverseColors[color];
				if ( this.usedColors.indexOf( usedColor ) === -1 ) {
					this.usedColors.push( usedColor );
				}
				encoder.addFrame( context );
			}
		}



		for ( let i = 0, l = borders.length; i < l; i++ ) {
			let border = borders[i];
			context.fillStyle = this.colors.black;
			context.fillRect( border.left, border.top, border.width, border.height );
			encoder.addFrame( context );
		}

		// We want to hold on the last frame for a bit...
		for ( let i = 0; i < this.holdCount; i++ ) {
			encoder.addFrame( context );
		}

		encoder.finish();

		fs.writeFile( this.filename, encoder.out.getData(), function ( error ) {
			if ( error ) {
				console.log( error );
			} else {
				callback();
			}
		});

	}



	getMeta () {

		var title = 'Composition';
		var number = ( Math.round( Math.random() * 10000 ) + 100 ) / 100;

		if ( this.usedColors.length === 1 ) {

			title += ' with ' + this.usedColors[0];

		} else if ( this.usedColors.length > 1 ) {

			title += ' with';

			for ( let i = 0, l = this.usedColors.length; i < l; i++ ) {
				if ( i === this.usedColors.length - 2 ) {
					title += ' ' + this.usedColors[i] + ' and';
				} else if ( i === this.usedColors.length - 1 ) {
					title += ' ' + this.usedColors[i];
				} else {
					title += ' ' + this.usedColors[i] + ',';
				}
			}

		}

		title += ', number ' + number + '.';

		let status = title + '\n\nPixels on screen.';

		return { title: title, status: status };

	}


}

module.exports = Mondrian;