const fs = require( 'fs' );

class Tweeter {



	constructor ( options ) {

		this.t = options.t;
		this.filename = options.filename;
		this.status = options.status;
		this.title = options.title;

    console.log(this.status, this.title);
	}



	tweet () {

		const content = fs.readFileSync( this.filename, { encoding: 'base64' } );

		// First we must post the media to Twitter.
		this.t.post( 'media/upload', { media_data: content }, ( error, data, response ) => {

			if ( !error ) {

				const mediaId = data.media_id_string;
				const alt = this.title;
				const mediaMetaParams = { media_id: mediaId, alt_text: { text: alt } };

				this.t.post('media/metadata/create', mediaMetaParams, ( error, data, response ) => {

					if ( !error ) {

						// Now we can reference the media and post a tweet (media will attach to the tweet).
						const params = { status: this.status, media_ids: [ mediaId ] }

						this.t.post('statuses/update', params, function ( error, data, response ) {

							console.log( error ? error : 'Tweet posted.' );

						} );

					} else {
						console.log( error );
					}

				} );

			} else {
				console.log( error );
			}

		} );

	}


}


module.exports = Tweeter;
