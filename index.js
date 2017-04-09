'use strict';

const Twit = require( 'twit' );
const Canvas = require( 'canvas' );
const GIFEncoder = require('gifencoder');

const Mondrian = require( './mondrian' );
const Tweeter = require( './tweeter' );

const config = require( './config' );

const width = 880;
const height = 440;
const borderSize = 4;
const filename = 'temp.gif';

let t = new Twit({
	consumer_key: config.consumer_key,
	consumer_secret: config.consumer_secret,
	access_token: config.access_token,
	access_token_secret: config.access_token_secret,
});


function tweet () {

	let canvas = new Canvas( width, height )
	let context = canvas.getContext( '2d' );

	let encoder = new GIFEncoder( width, height );

	let mondrian = new Mondrian( {
		width: width,
		height: height,
		borderSize: borderSize,
		filename: filename
	} );

	mondrian.render( context, encoder, () => {

		let meta = mondrian.getMeta();

		let tweeter = new Tweeter( {
			t: t,
			filename: filename,
			title: meta.title,
			status: meta.status
		} );

		tweeter.tweet();
	} );
}

tweet();
setInterval( () => {
	tweet();
}, 14400 * 1000 );

