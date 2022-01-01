class EventListener {
	#events = {};

	addEventListener( event, callback ) {
		if( !this.#events[ event ] ) {
			this.#events[ event ] = [];
		}
		this.#events[ event ].push( callback );
	}

	removeEventListener( event, callback ) {
		this.#events[ event ].splice( this.#events[ event ].indexOf( callback ), 1 );
	}

	dispatchEvent( event, obj ) {
		const self = this;
		if( this.#events[ event ] && this.#events[ event ].length ) {
			
			this.#events[ event ].forEach( callback => {
				callback.bind( this )( obj );
			});
		}
	}
}

export {
	EventListener
}