import { Network } from './network.js';
import { EventListener } from './eventlistener.js';

class Environment extends EventListener {

	#networks = [];
	#renderScale = { x: 1, y: 1 };
	#networkOffset = {
		x: -2,
		y: -2
	};

	#canvas;
	#interval = 			null;
	#iteration = 			0;
	#maxIterations = 		100;
	#stepDelay = 			100;
	#numNetworks = 			100;
	#mutationRate = 		0.01;
	#generation = 			0;
	#generationLastSize = 	0;
	#evolution = 			0;
	#testFn = 				() => false;
	#waitForStart = 		false;
	#numNeurons = 			10;
	#numConnections = 		10;
	#randomInitSpawn = 		false;
	#render = 				false;
	#survivorsOnly = 		false;
	#targets = 				[];
	#interactiveMode = 		false;

	constructor( { 
		canvas, 
		maxIterations, 
		stepDelay, 
		numNetworks, 
		mutationRate, 
		testFn, 
		waitForStart,
		numNeurons,
		numConnections,
		randomInitSpawn,
		render,
		survivorsOnly
	} ) {
		super();
		this.#canvas = canvas;
		this.#renderScale = {
			x: canvas.offsetWidth / 2,
			y: canvas.offsetHeight / 2,
		};
		this.#maxIterations = 		maxIterations || 100;
		this.#stepDelay = 			stepDelay || 100;
		this.#numNetworks = 		numNetworks || 100;
		this.#mutationRate = 		mutationRate || 0.01;
		this.#testFn = 				testFn 			|| (() => false);
		this.#waitForStart = 		waitForStart || false;
		this.#numNeurons = 			numNeurons 		|| 10;
		this.#numConnections = 		numConnections 	|| 10;
		this.#generationLastSize = 	this.#numNetworks;
		this.#randomInitSpawn = 	randomInitSpawn || false;
		this.#render = 				render || false;
		this.#survivorsOnly = 		survivorsOnly || false;

		this.initRepresentation();
		this.initRandomNetworks();
		requestAnimationFrame( this.renderNetworks.bind( this ) );
	}

	initRepresentation() {
		for( let i = 0; i < this.#numNetworks; i++ ) {
			let network = this.#networks[i];
			let elem = document.createElement( 'div' );
			elem.classList.add( 'network' );
			elem.classList.add( `rep${i}` );
			this.#canvas.appendChild( elem );
		}
	}

	getRep( index ) {
		return document.querySelector( `.rep${index}` );
	}

	addNetwork ( network ) {
		this.#networks.push( network );
		// this.#canvas.appendChild( network.representation );
		if( this.#render ) {
			let rep = this.getRep( this.#networks.length - 1 );
			rep.style.display = 'block';
			rep.style.left = Math.min( this.#canvas.offsetWidth - 5, Math.max( 0, Math.round( this.#renderScale.x + this.#renderScale.x * ( network.position.x ) - this.#networkOffset.x ))) + 'px';
			rep.style.top = Math.min( this.#canvas.offsetHeight - 5, Math.max( 0, Math.round( this.#renderScale.y + this.#renderScale.y * ( network.position.y ) - this.#networkOffset.y ))) + 'px';
		}
	}

	clearNetworks () {
		let i = 0;
		while( this.#networks.length ) {
			// this.#canvas.removeChild( this.#networks[ 0 ].representation );
			this.getRep( i ).style.display = 'none';
			this.#networks.shift();
			i++;
		}
	}

	renderNetworks () {

		for ( let i = 0; i < this.#networks.length; i++ ) {

		// this.#networks.forEach( (network, idx) => {
			let x = Math.min( this.#canvas.offsetWidth - 5,  Math.max( 0, Math.round( this.#renderScale.x + this.#renderScale.x * ( this.#networks[ i ].position.x ) - this.#networkOffset.x )));
			let y = Math.min( this.#canvas.offsetHeight - 5, Math.max( 0, Math.round( this.#renderScale.y + this.#renderScale.y * ( this.#networks[ i ].position.y ) - this.#networkOffset.y )));
			// network.representation.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
			let rep = this.getRep( i );
			rep.style.left = x + 'px';
			rep.style.top = y + 'px';
			rep.style.display = 'block';
		};

		if( this.#render ) {
			requestAnimationFrame( this.renderNetworks.bind( this ) );
		}
	}

	initRandomNetworks () {
		
		this.clearNetworks();
		this.#generation = 0;

		let dna = Network.randomDNA( this.#numNeurons, this.#numConnections );
		for ( let i = 0; i < this.#numNetworks; i++ ) {
			if( this.#randomInitSpawn ) {
				dna = Network.randomDNA( this.#numNeurons, this.#numConnections );
			}
			this.addNetwork( new Network( { dna } ) );
		}
	}

	regenerateNetworks () {

		this.#iteration = 0;
		this.#generation++;
		let networks = [];
		this.#generationLastSize = 0;
		let networkIndex = [];

		this.#networks.forEach( ( network, idx ) => {

			// let survived = this.#testFn( network );
			let survived = this.#targets.reduce( ( acc, target ) => {
				acc += target.testFunction( network );
				return acc;		
			}, 0 );

			if( survived ) {
				this.#generationLastSize++;
			}

			let offsprings = survived + ( this.#survivorsOnly ? 0 : 1 );

			for ( let i = 0; i < offsprings; i++ ) {
				networkIndex.push( idx );
				// networks.push( network.clone( this.#mutationRate ) );
			}

		} );

		
		// let _oldNetworks = [ ...this.#networks ];
		
		while ( networks.length < this.#numNetworks ) {
			networks.push( this.#networks[ networkIndex[ Math.floor( Math.random() * networkIndex.length ) ] ].clone( this.#mutationRate ) );
			//networks.splice( Math.floor( Math.random() * networks.length ), 1 );
		}
		
		this.clearNetworks();
		this.#networks = networks;

		// networks.forEach( network => {
		// 	this.addNetwork( network );
		// } );

	}

	step() {

		this.#targets.forEach( target => {
			target.step( {
				iteration: this.#iteration,
				render: this.#render,
				renderScale: this.#renderScale,
			} );
		} );
		
		for ( let i = 0, l = this.#networks.length; i < l; i++ ) {
			this.#networks[ i ].step( { targets: this.#targets } );
		// this.#networks.forEach( network => {
			// network.step( { targets: this.#targets } );
		};

	}

	start() {

		if( this.#networks.length === 0 ) {
			this.initRandomNetworks();
		} else {
			this.regenerateNetworks();
		}

		this.#interval = setInterval( () => {
			this.step();
			this.#iteration++;
			if ( this.#iteration >= this.#maxIterations && !this.#interactiveMode ) {
				this.stop();
			}
		}, 0 );

		this.dispatchEvent( 'start' );
	}

	stop() {

		clearInterval( this.#interval );

		const stats = this.stats;

		if( !this.#waitForStart && this.#networks.length ) {
			this.start();
		}
		stats.survivalRate = ( 100 * this.#generationLastSize / this.#numNetworks).toFixed( 2 );
		this.dispatchEvent( 'generation', stats );

	}

	addTarget ( target ) {
		this.#targets.push( target );
		this.#canvas.parentNode.appendChild( target.getElement() );
		target.getElement().style.width = ( target.radius * 2 * this.#renderScale.x) + 'px';
		target.getElement().style.height = ( target.radius * 2 * this.#renderScale.y) + 'px';
	}

	togglePause() {
		this.#waitForStart = !this.#waitForStart;
		if( !this.#waitForStart ) {
			this.start();
		}
		return this.#waitForStart;
	}

	toggleRender () {
		this.#render = !this.#render;
		if( this.#render ) {
			this.renderNetworks();
		}
		return this.#render;
	}

	toggleInteractiveMode () {
		this.#interactiveMode = !this.#interactiveMode;
		this.#targets.forEach( target => {
			target.setInteractive( this.#interactiveMode );
		});
	}

	get size() {
		return this.#networks.length;
	}

	get stats() {
		let connectedNeurons = 0;
		let outputs = 0;
		let hasMoved2D = 0;
		let totalDistanceTraveled = 0;
		let totalDnaLength = 0;
		this.#networks.forEach( network => {

			if( network.position.x !== network.initialPosition.x && network.position.y !== network.initialPosition.y ) {
				hasMoved2D++;
			}
			connectedNeurons += network.numConnectedNeurons;
			totalDistanceTraveled += network.totalDistanceTraveled;
			totalDnaLength += network.dna.length;

		} );

		return {
			generation: this.#generation,
			survivalRate: ( 100 * this.#networks.length / this.#generationLastSize ).toFixed( 2 ) * 1,
			size: this.#networks.length,
			connectedNeurons: connectedNeurons,
			connectedNeuronsAvg: ( connectedNeurons / this.#networks.length ).toFixed( 2 ) * 1,
			outputs: outputs,
			hasMoved2D: hasMoved2D,
			avgDistanceTraveled: ( totalDistanceTraveled / this.#networks.length ).toFixed( 2 ) * 1,
			avgDnaLength: ( totalDnaLength / this.#networks.length ).toFixed( 2 ) * 1,
			totalDnaLength: totalDnaLength,
		}
	}

	get renderScale() {
		return this.#renderScale;
	}
}

export {
	Environment
};