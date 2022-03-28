import * as Network from './network.js';
import { EventListener } from './eventlistener.js';
import { numberToDnaSequence, dnaSequenceToNumbers } from './helpers.js';
import { NeuronDefinitions } from './neuron.js';

const DEG180BYPI = 180 / Math.PI;

class Environment extends EventListener {

	#networks = 			[];
	#reps = 				[];
	renderScale = 			{ x: 1, y: 1, xRatio: 1, yRatio: 1 };

	#canvas;
	#interval = 			null;
	#evolution = 			0;
	#generation = 			0;
	#iteration = 			0;
	#iterationStartTime = 	0;
	#stepDelay = 			16;
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
	#currentDNA = 			'';

	targetArea = 			0;
	area = 					0;
	started = 				false;

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

		this.area = 4 * this.renderScale.xRatio * this.renderScale.yRatio;

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
		this.#stepDelay = 			16;

		this.initRepresentation();
		this.initRandomNetworks();

		requestAnimationFrame( this.renderNetworks.bind( this ) );

		if( !waitForStart ) {
			this.togglePause();
		}
	}

	initRepresentation() {
		this.#reps = [];
		document.querySelectorAll( '.network' ).forEach( ( rep ) => {
			rep.parentElement.removeChild( rep );
		} );
		for( let i = 0; i < this.#numNetworks; i++ ) {
			let elem = document.createElement( 'div' );
			elem.classList.add( 'network' );
			elem.classList.add( `rep${i}` );
			elem.setAttribute( 'data-idx', `${i}` );
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
			if( i < this.#reps.length ) {
				this.getRep( i ).style.display = 'none';
			}
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
			rep.style.transform = `rotate(${this.#networks[ i ].direction * DEG180BYPI}deg)`;

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
		this.#currentDNA = dna;

		for ( let i = 0; i < this.#numNetworks; i++ ) {
			if( this.#randomInitSpawn ) {
				dna = Network.randomDNA( this.#numNeurons, this.#numConnections );
			}
			this.addNetwork( Network.createNetwork( dna, this.renderScale ) );
		}
	}

	initNetworksFromDnaSequence ( dna ) {

		this.reset( false );
		this.initRepresentation();
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
			networks.push( Network.clone( this.#networks[ networkIndex[ Math.floor( Math.random() * networkIndex.length ) ] ], this.#mutationRate, this.renderScale ) );
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
			Network.stepNetwork( this.#networks[ i ], this.#targets, this.renderScale );
		};

		this.#iteration++;

	}

	start() {

		if( this.#networks.length === 0 ) {
			this.initRandomNetworks();
		} else {
			this.regenerateNetworks();
		}

		this.started = true;
		
		this.#iterationStartTime = Date.now();
		let fn = this._step.bind( this );
		for (let i = 0; i < this.#maxIterations; i++) {
			setTimeout( fn, this.#stepDelay * i );
		}

	}

	_step() {
		this.step();
		if ( this.#iteration >= this.#maxIterations && !this.#interactiveMode ) {
			this.stop();
		}
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
		// target.getElement().style.width = ( target.radius * 2 * this.renderScale.x / this.renderScale.xRatio ) + 'px';
		// target.getElement().style.height = ( target.radius * 2 * this.renderScale.y / this.renderScale.yRatio ) + 'px';

		this.targetArea += target.area;
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
	}

	pixelPosition( position ) {
		return {
			x: this.renderScale.x + position.x * this.renderScale.pixelScale,
			y: this.renderScale.y + position.y * this.renderScale.pixelScale,
		}
	}

	reset( init = true ) {
		let state = this.#waitForStart;
		this.togglePause( true );
		this.clearNetworks();
		clearInterval( this.#interval );
		this.#networks.length = 0;
		this.#iteration = 0;
		this.#generation = 0;
		this.#evolution = 0;
		this.#generationLastSize = 0;
		if( init ) {
			this.initRandomNetworks();
		}
		this.togglePause( state );
		this.dispatchEvent( 'reset' );
	}

	getNetwork( idx ) {
		return this.#networks[ idx ];
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
		let neuronsInUse = new Set();
		this.#networks.forEach( network => {

			if( network.position.x !== network.initialPosition.x && network.position.y !== network.initialPosition.y ) {
				hasMoved2D++;
			}
			connectedNeurons += network.connectedNeurons.length;
			totalDistanceTraveled += network.totalDistanceTraveled;
			totalDnaLength += network.dna.length;
			network.connectedNeurons.forEach( neuron => {
				neuronsInUse.add( NeuronDefinitions[neuron.type].neuronName );
			});

		} );

		return {
			generation: this.#generation,
			survivalRate: this.started ? ( 100 * this.#networks.length / this.#generationLastSize ).toFixed( 2 ) * 1 : 0,
			size: this.#networks.length,
			connectedNeurons: connectedNeurons,
			connectedNeuronsAvg: ( connectedNeurons / this.#networks.length ).toFixed( 2 ) * 1,
			outputs: outputs,
			hasMoved2D: hasMoved2D,
			avgDistanceTraveled: ( totalDistanceTraveled / this.#networks.length ).toFixed( 2 ) * 1,
			avgDnaLength: ( totalDnaLength / this.#networks.length ).toFixed( 2 ) * 1,
			totalDnaLength: totalDnaLength,
			duration: this.started ? ( Date.now() - this.#iterationStartTime ) : 0,
			currentDNA: numberToDnaSequence( this.#currentDNA ),
			currentDNANumbers: this.#currentDNA,
			targetAreaRatio: (this.targetAreaRatio * 100).toFixed( 2 ) * 1,
			neuronsInUse: neuronsInUse,
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

	get numNetworks() {
		return this.#numNetworks;
	}

	set numNetworks( numNetworks ) {
		this.#numNetworks = parseInt( numNetworks );
		this.initRepresentation();
		this.reset();
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

	get targetsArea() {
		return this.#targets.reduce( ( area, target ) => {
			return area + target.area;
		}, 0 );
	}

	get targetAreaRatio() {
		return this.targetArea / this.area;
	}

	get maxIterations() {
		return this.#maxIterations;
	}

	set maxIterations( maxIterations ) {
		this.#maxIterations = parseInt( maxIterations );
	}

	get generation() {
		return this.#generation;
	}

	get iteration() {
		return this.#iteration;
	}

	get isPaused() {
		return this.#waitForStart;
	}

}

export {
	Environment
};