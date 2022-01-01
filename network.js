import { createNeuron, stepNeuron, connectNeuronInput } from './neuron.js';
import {} from './outputfunctions.js';
import { NeuronDefinitions } from './neuron.js';
import Constants from './constants.js';

function structToDNA( struct ) {
	
	let ret = '';

	let numNeurons = struct.neurons.length;
	let numConnections = struct.connections.length;
	ret += fillValue( numNeurons.toString( Constants.DNA_BASE ), Constants.NEURON_INDEX_LENGTH );
	ret += fillValue( numConnections.toString( Constants.DNA_BASE ), Constants.CONNECTION_INDEX_LENGTH );

	for( let i = 0; i < numNeurons; i++ ){
		let n = struct.neurons[i];
		ret += fillValue( ( n.type ).toString( Constants.DNA_BASE ), Constants.NEURON_TYPE_LENGTH );
		ret += fillValue( Math.min( Constants.NEURON_DATA_MIDDLE * 2 - 1, Math.round( n.initialValue * Constants.NEURON_DATA_MIDDLE + Constants.NEURON_DATA_MIDDLE )).toString( Constants.DNA_BASE ), Constants.NEURON_DATA_LENGTH );
	}
	for( let i = 0; i < numConnections; i++ ){
		let n = struct.connections[i];
		ret += fillValue( ( n.input ).toString( Constants.DNA_BASE ), Constants.NEURON_INDEX_LENGTH );
		ret += fillValue( ( n.output ).toString( Constants.DNA_BASE ), Constants.NEURON_INDEX_LENGTH );
		ret += fillValue( Math.min( Constants.NEURON_DATA_MIDDLE * 2 - 1, Math.round( n.weight * Constants.NEURON_DATA_MIDDLE + Constants.NEURON_DATA_MIDDLE )).toString( Constants.DNA_BASE ), Constants.CONNECTION_DATA_LENGTH );
	}
	return ret;

}

function randomInt( min = 0, max = 1 ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

function fillValue( value, length ) {
	let ret = value.toString( Constants.DNA_BASE );
	if( ret.length > length ){
		return ((Constants.DNA_BASE - 1) + "").repeat( length );
	} else {
		return "0".repeat( length - ret.length ) + ret;
	}
		 
}

function randomDNA( numNeurons, numConnections ) {
	let ret = '';
	let numNeuronsStr = numNeurons.toString( Constants.DNA_BASE );
	let numConnectionsStr = numConnections.toString( Constants.DNA_BASE );
	ret += fillValue( numNeuronsStr, Constants.NEURON_INDEX_LENGTH );
	ret += fillValue( numConnectionsStr, Constants.CONNECTION_INDEX_LENGTH );
	for( let i = 0; i < numNeurons; i++ ){
		ret += fillValue(randomInt( 0, NeuronDefinitions.length - 1 ).toString( Constants.DNA_BASE ), Constants.NEURON_TYPE_LENGTH );
		ret += fillValue(randomInt( 0, Math.pow( Constants.DNA_BASE, 8 ) ).toString( Constants.DNA_BASE ), Constants.NEURON_DATA_LENGTH );
	}
	for( let i = 0; i < numConnections; i++ ){
		let inputIndex = fillValue(randomInt( 0, numNeurons - 1 ).toString( Constants.DNA_BASE ), Constants.NEURON_INDEX_LENGTH );
		let outputIndex = fillValue(randomInt( 0, numNeurons - 1 ).toString( Constants.DNA_BASE ), Constants.NEURON_INDEX_LENGTH );
		ret += inputIndex;
		ret += outputIndex;
		ret += fillValue(randomInt( 0, Math.pow( Constants.DNA_BASE, 8 ) ).toString( Constants.DNA_BASE ), Constants.CONNECTION_DATA_LENGTH );
	}
	return ret;
}

class Network {
	
	neurons = [];
	#_connectedNeurons = new Set();
	#connectedNeurons = [];
	iteration = 0;
	position = { x: 0, y: 0 };
	initialPosition = { x: 0, y: 0 };
	// color = '#0000FF';
	// #directions = {x: false, y: false};
	dna = '';
	totalDistanceTraveled = 0;

	constructor ( { dna } ) {
		if( dna ){
			this.dna = dna;
			this.setupFromDNA();
		}
		this.setRandomPosition();
	}

	setupFromDNA () {

		let numNeurons = parseInt( this.dna.substring( 0, Constants.NEURON_INDEX_LENGTH ), Constants.DNA_BASE );
		let numConnections = parseInt( this.dna.substring( Constants.NEURON_INDEX_LENGTH, Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH ), Constants.DNA_BASE );
	
		for( let i = 0; i < numNeurons; i++ ){
			let idx = Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH + i * Constants.NEURON_TOTAL_LENGTH;
			let type = parseInt( this.dna.substring( idx, idx + Constants.NEURON_TYPE_LENGTH ), Constants.DNA_BASE );
			let initialValue = ( parseInt( this.dna.substring( idx + Constants.NEURON_TYPE_LENGTH, idx + Constants.NEURON_TOTAL_LENGTH ), Constants.DNA_BASE ) - Constants.NEURON_DATA_MIDDLE ) / Constants.NEURON_DATA_MIDDLE;

			if( type < NeuronDefinitions.length ) {
				this.addNeuron( createNeuron({ initialValue, type }) );
			}
		}
	
		for( let i = 0; i < numConnections; i++ ){
			let idx = Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH + numNeurons * Constants.NEURON_TOTAL_LENGTH + i * Constants.CONNECTION_TOTAL_LENGTH;
	
			let input = parseInt( this.dna.substring( idx, idx + Constants.NEURON_INDEX_LENGTH ), Constants.DNA_BASE );
			let output = parseInt( this.dna.substring( idx + Constants.NEURON_INDEX_LENGTH, idx + Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH ), Constants.DNA_BASE );
			let weight = ( parseInt( this.dna.substring( idx + Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH, idx + Constants.CONNECTION_TOTAL_LENGTH ), Constants.DNA_BASE ) - Constants.NEURON_DATA_MIDDLE ) / Constants.NEURON_DATA_MIDDLE;

			if( this.neurons[ input ] && this.neurons[ output ] ) {
				this.connect( this.neurons[ input ], this.neurons[ output ], weight );
			}
		}
	}

	setRandomPosition() {
		this.position = { x: 2 * ( Math.random() - 0.5 ), y: 2 * ( Math.random() - 0.5 ) };
		this.initialPosition = { ...this.position };
	}

	static randomDNA ( maxNeurons, maxConnections ) {
		return randomDNA( maxNeurons, maxConnections );
	}

	cloneDNA ( mutate = 0.01 ) {
		let chance = Math.random();
		let dna = this.DNA;

		if ( chance < mutate ) {
			let index = randomInt( Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH, dna.length - 1 );
			dna = dna.substring( 0, index - 1 ) + randomInt( 0, Constants.DNA_BASE - 1 ) + dna.substring( index );
		}

		return dna;
	}

	clone ( mutate = 0.01 ) {
		let dna = this.cloneDNA( mutate );
		return new Network( { dna } );
	}

	get DNA () {
		return this.dna || structToDNA( this.toStruct() );
	}

	toStruct() {
		let ret = {
			neurons: [],
			connections: []
		};
		for ( let i = 0; i < this.neurons.length; i++ ) {
			let { type, initialValue } = this.neurons[i];
			ret.neurons.push( { type, initialValue } );

			let connections = [];

			for ( let j = 0; j < this.neurons[i].inputs.length; j++ ) {
				let { weight, input } = this.neurons[i].inputs[j];
				let inputIndex = this.neurons.indexOf( input );
				connections.push( { input: inputIndex, output: i, weight } );
			}

			ret.connections = [...ret.connections, ...connections];
		}
		return ret;
	}

	addNeuron( neuron = null ) {
		this.neurons.push( neuron );
	}

	connect ( input, output, weight = 1 ) {
		if ( input.isNeuron && output.isNeuron ) {
			const result = connectNeuronInput( output, input, weight );
			if ( result ) {
				if( !this.#_connectedNeurons.has( input ) ) {
					this.#_connectedNeurons.add( input );
					this.#connectedNeurons.push( input );
				}
				if( !this.#_connectedNeurons.has( output ) ) {
					this.#_connectedNeurons.add( output );
					this.#connectedNeurons.push( output );
				}
			}
			return result;
		} else {
			return false;
		}
	}

	step( { targets } ) {
		this.iteration++;
		let currentPosition = { x: this.position.x, y: this.position.y };
		let hasMoved = false;
		let moveX = 0;
		let moveY = 0;
		let smallestDistance = Infinity;
		let closestTargetDirection = { x: 0, y: 0 };

		for ( let i = 0; i < targets.length; i++ ) {
			let distance = targets[i].distance( this.position );
			if ( distance < smallestDistance ) {
				smallestDistance = distance;
				closestTargetDirection = { 
					x: targets[i].x - this.position.x, 
					y: targets[i].y - this.position.y
				};
			}
		}

		closestTargetDirection = { 
			x: closestTargetDirection.x > 0 ? 1 : -1, 
			y: closestTargetDirection.y > 0 ? 1 : -1
		};

		for ( let i = 0, l = this.#connectedNeurons.length; i < l; i++ ) {

		// this.#connectedNeurons.forEach( neuron => {
			stepNeuron( this.#connectedNeurons[i], { 
				iteration: this.iteration,
				position: this.position,
				distanceToTarget: smallestDistance,
				targetDirectionX: closestTargetDirection.x,
				targetDirectionY: closestTargetDirection.y,
			} );

			if( this.#connectedNeurons[i].affects.x ) {
				moveX += this.#connectedNeurons[i].value;
			}
			if( this.#connectedNeurons[i].affects.y ) {
				moveY += this.#connectedNeurons[i].value;
			}
		}

		this.position.x += (moveX >= 0 ? Math.min( moveX, Constants.MAXIMUM_MOVING_DISTANCE ) : Math.max( moveX, -Constants.MAXIMUM_MOVING_DISTANCE ));
		this.position.y += (moveY >= 0 ? Math.min( moveY, Constants.MAXIMUM_MOVING_DISTANCE ) : Math.max( moveY, -Constants.MAXIMUM_MOVING_DISTANCE ));

		if( moveX !== 0 || moveY !== 0 ) {
			this.totalDistanceTraveled += Math.sqrt( Math.pow( this.position.x - currentPosition.x, 2 ) + Math.pow( this.position.y - currentPosition.y, 2 ) );
		}
	}

	get travelDistance() {
		return Math.sqrt( Math.pow( this.initialPosition.x - this.position.x, 2 ) + Math.pow( this.initialPosition.y - this.position.y, 2 ) );
	}

	get numConnectedNeurons() {
		return this.#connectedNeurons.length;
	}
}

export {
	Network
}