'use strict';

var Twit = require( 'twit' );
var Canvas = require( 'canvas' );
var GIFEncoder = require('gifencoder');

var Mondrian = require( './mondrian' );
var Tweeter = require( './tweeter' );

var config = require( './config' );

const width = 880;
const height = 440;
const borderSize = 4;
var filename = 'temp.gif';

let t = new Twit({
	consumer_key: config.consumer_key,
	consumer_secret: config.consumer_secret,
	access_token: config.access_token,
	access_token_secret: config.access_token_secret,
});


let tweet = function () {

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



};

tweet();
setInterval( () => {
	tweet();
}, 14400 * 1000 );




