import * as Network from './network.js';
import { EventListener } from './eventlistener.js';
import { numberToDnaSequence, dnaSequenceToNumbers } from './helpers.js';

class Environment extends EventListener {

	#networks = 			[];
	#reps = 				[];
	renderScale = 			{ x: 1, y: 1, xRatio: 1, yRatio: 1 };
	#networkOffset = 		{ x: -2, y: -2 };

	#canvas;
	#interval = 			null;
	#evolution = 			0;
	#generation = 			0;
	#iteration = 			0;
	#iterationStartTime = 	0;
	#stepDelay = 			0;
	#maxIterations = 		100;
	#numNetworks = 			100;
	#mutationRate = 		0.01;
	#generationLastSize = 	0;
	#waitForStart = 		false;
	#numNeurons = 			10;
	#numConnections = 		10;
	#randomInitSpawn = 		false;
	#render = 				false;
	#survivorsOnly = 		false;
	#targets = 				[];
	#interactiveMode = 		false;
	#firstDNA = 			null;
	#currentDNA = 			null;

	constructor( { 
		canvas, 
		maxIterations, 
		numNetworks, 
		mutationRate, 
		waitForStart,
		numNeurons,
		numConnections,
		randomInitSpawn,
		render,
		survivorsOnly
	} ) {
		super();
		this.#canvas = canvas;
		
		this.renderScale = {
			x: canvas.offsetWidth / 2,
			y: canvas.offsetHeight / 2,
		};

		if( this.renderScale.x > this.renderScale.y ) {
			this.renderScale.xRatio = this.renderScale.x / this.renderScale.y;
			this.renderScale.yRatio = 1;
			this.renderScale.pixelScale = this.renderScale.y;
		} else {
			this.renderScale.xRatio = 1;
			this.renderScale.yRatio = this.renderScale.y / this.renderScale.x;
			this.renderScale.pixelScale = this.renderScale.x;
		}

		this.#maxIterations = 		maxIterations || 100;
		this.#numNetworks = 		numNetworks || 100;
		this.#mutationRate = 		mutationRate || 0.01;
		this.#waitForStart = 		true;
		this.#numNeurons = 			numNeurons 		|| 10;
		this.#numConnections = 		numConnections 	|| 10;
		this.#generationLastSize = 	this.#numNetworks;
		this.#randomInitSpawn = 	randomInitSpawn || false;
		this.#render = 				render || true;
		this.#survivorsOnly = 		survivorsOnly || false;
		this.#evolution = 			0;
		this.#stepDelay = 			0;

		this.initRepresentation();
		this.initRandomNetworks();

		requestAnimationFrame( this.renderNetworks.bind( this ) );

		if( !waitForStart ) {
			this.togglePause();
		}
	}

	initRepresentation() {
		this.#reps = [];
		for( let i = 0; i < this.#numNetworks; i++ ) {
			let elem = document.createElement( 'div' );
			elem.classList.add( 'network' );
			elem.classList.add( `rep${i}` );
			this.#canvas.appendChild( elem );
			this.#reps.push( elem );
		}
	}

	getRep( index ) {
		return this.#reps[ index ]; //document.querySelector( `.rep${index}` );
	}

	addNetwork ( network ) {
		this.#networks.push( network );
		if( this.#render ) {
			let rep = this.getRep( this.#networks.length - 1 );
			let position = this.pixelPosition( network.position );
			rep.style.display = 'block';
			rep.style.left = position.x + 'px';
			rep.style.top = position.x + 'px';
		}
	}

	clearNetworks () {
		let i = 0;
		while( this.#networks.length ) {
			this.getRep( i ).style.display = 'none';
			this.#networks.shift();
			i++;
		}
	}

	renderNetworks () {

		for ( let i = 0; i < this.#networks.length; i++ ) {

			let position = this.pixelPosition( this.#networks[ i ].position );
			let rep = this.getRep( i );
			rep.style.left = position.x + 'px';
			rep.style.top = position.y + 'px';
			rep.style.display = 'block';

		};

		if( this.#render ) {
			requestAnimationFrame( this.renderNetworks.bind( this ) );
		}
	}

	initRandomNetworks () {
		
		this.clearNetworks();
		this.#generation = 0;
		this.#evolution++;

		let dna = Network.randomDNA( this.#numNeurons, this.#numConnections );
		this.#firstDNA = dna;

		for ( let i = 0; i < this.#numNetworks; i++ ) {
			if( this.#randomInitSpawn ) {
				dna = Network.randomDNA( this.#numNeurons, this.#numConnections );
			}
			this.addNetwork( Network.createNetwork( dna, this.renderScale ) );
		}
	}

	initNetworksFromDnaSequence ( dna ) {

		this.reset();
		this.#firstDNA = dnaSequenceToNumbers( dna );

		for ( let i = 0; i < this.#numNetworks; i++ ) {
			this.addNetwork( Network.createNetwork( this.#firstDNA, this.renderScale ) );
		}
	}

	regenerateNetworks () {

		this.#iteration = 0;
		this.#generation++;
		let networks = [];
		this.#generationLastSize = 0;
		let networkIndex = [];

		this.#networks.forEach( ( network, idx ) => {

			let survived = this.#targets.reduce( ( acc, target ) => {
				acc += target.testFunction( network );
				return acc;		
			}, 0 );

			if( survived ) {
				this.#generationLastSize++;
				this.#currentDNA = network.dna;
			}

			let offsprings = survived + ( this.#survivorsOnly ? 0 : 1 );

			for ( let i = 0; i < offsprings; i++ ) {
				networkIndex.push( idx );
			}

		} );

		while ( networks.length < this.#numNetworks ) {
			networks.push( Network.clone( this.#networks[ networkIndex[ Math.floor( Math.random() * networkIndex.length ) ] ], this.#mutationRate ) );
		}
		
		this.clearNetworks();
		this.#networks = networks;

	}

	step() {

		this.#targets.forEach( target => {
			target.step( {
				iteration: this.#iteration,
				render: this.#render,
				renderScale: this.renderScale,
			} );
		} );
		
		for ( let i = 0, l = this.#networks.length; i < l; i++ ) {
			Network.stepNetwork( this.#networks[ i ], this.#targets );
		};

		this.#iteration++;

	}

	start() {

		if( this.#networks.length === 0 ) {
			this.initRandomNetworks();
		} else {
			this.regenerateNetworks();
		}
		
		this.#iterationStartTime = Date.now();

		this.#interval = setInterval( () => {
			this.step();
			if ( this.#iteration >= this.#maxIterations && !this.#interactiveMode ) {
				this.stop();
			}
		}, this.#stepDelay );

	}

	stop() {

		clearInterval( this.#interval );

		const stats = this.stats;
		stats.survivalRate = ( 100 * this.#generationLastSize / this.#numNetworks).toFixed( 2 );

		if( !this.#waitForStart && this.#networks.length ) {
			this.start();
		}

		this.dispatchEvent( 'generation', stats );

	}

	addTarget ( target ) {
		this.#targets.push( target );
		this.#canvas.parentNode.appendChild( target.getElement() );
		target.getElement().style.width = ( target.radius * 2 * this.renderScale.x / this.renderScale.xRatio ) + 'px';
		target.getElement().style.height = ( target.radius * 2 * this.renderScale.y / this.renderScale.yRatio ) + 'px';
	}

	togglePause( pause ) {
		if( pause === undefined ) {
			this.#waitForStart = !this.#waitForStart;
		} else {
			this.#waitForStart = pause;
		}
		if( !this.#waitForStart ) {
			this.start();
			this.dispatchEvent( 'pause', false );
		} else {
			this.dispatchEvent( 'pause', true );
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

	updateStepDelay ( stepDelay ) {
		this.#stepDelay = stepDelay || 0;
		
		clearInterval( this.#interval );

		this.#interval = setInterval( () => {
			this.step();
			if ( this.#iteration >= this.#maxIterations && !this.#interactiveMode ) {
				this.stop();
			}
		}, this.#stepDelay);
	}

	pixelPosition( position ) {
		return {
			x: this.renderScale.x + position.x * this.renderScale.pixelScale,
			y: this.renderScale.y + position.y * this.renderScale.pixelScale,
		}
	}

	reset() {
		let state = this.#waitForStart;
		this.togglePause( true );
		this.clearNetworks();
		clearInterval( this.#interval );
		this.#networks.length = 0;
		this.#iteration = 0;
		this.#generation = 0;
		this.#evolution = 0;
		this.#generationLastSize = 0;
		this.initRandomNetworks();
		this.togglePause( state );
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
			connectedNeurons += network.connectedNeurons.length;
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
			duration: ( Date.now() - this.#iterationStartTime ),
			currentDNA: numberToDnaSequence( this.#currentDNA )
		}
	}

	get stepDelay() {
		return this.#stepDelay;
	}

	get mutationRate() {
		return this.#mutationRate;
	}

	set mutationRate( mutationRate ) {
		this.#mutationRate = Math.min( 1, Math.max( 0, mutationRate ) );
	}

	get numNeurons() {
		return this.#numNeurons;
	}

	set numNeurons( numNeurons ) {
		this.#numNeurons = parseInt( numNeurons );
		this.reset();
	}

	get numConnections() {
		return this.#numConnections;
	}

	set numConnections( numConnections ) {
		this.#numConnections = parseInt( numConnections );
		this.reset();
	}

}

export {
	Environment
};