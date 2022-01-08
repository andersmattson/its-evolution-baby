import { createNeuron, stepNeuron, connectNeuronInput } from './neuron.js';
import {} from './outputfunctions.js';
import { NeuronDefinitions } from './neuron.js';
import Constants from './constants.js';

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

export function randomDNA( numNeurons, numConnections ) {
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

export function createNetwork( dna, renderScale ) {

	let network = {
		neurons: [],
		_connectedNeurons: new Set(),
		connectedNeurons: [],
		iteration: 0,
		position: { x: 2 * ( Math.random() - 0.5 ) * renderScale.xRatio, y: 2 * ( Math.random() - 0.5 ) * renderScale.yRatio },
		direction: Math.random() * 2 * Math.PI,
		speed: 0,
		initialPosition: { x: 0, y: 0 },
		renderScale: { x: 1, y: 1, xRatio: 1, yRatio: 1 },
		dna: dna,
		totalDistanceTraveled: 0,
		renderScale: renderScale,
	}

	network.initialPosition = { ...network.position };
	setupFromDNA( network, dna );

	return network;
}

export function connectNeurons ( network, input, output, weight = 1 ) {
	if ( input.isNeuron && output.isNeuron ) {
		const result = connectNeuronInput( output, input, weight );
		if ( result ) {
			if( !network._connectedNeurons.has( input ) ) {
				network._connectedNeurons.add( input );
				network.connectedNeurons.push( input );
			}
			if( !network._connectedNeurons.has( output ) ) {
				network._connectedNeurons.add( output );
				network.connectedNeurons.push( output );
			}
		}
		return result;
	} else {
		return false;
	}
}


function setupFromDNA ( network, dna ) {

	let numNeurons = parseInt( dna.substring( 0, Constants.NEURON_INDEX_LENGTH ), Constants.DNA_BASE );
	let numConnections = parseInt( dna.substring( Constants.NEURON_INDEX_LENGTH, Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH ), Constants.DNA_BASE );

	for( let i = 0; i < numNeurons; i++ ){
		let idx = Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH + i * Constants.NEURON_TOTAL_LENGTH;
		let type = parseInt( dna.substring( idx, idx + Constants.NEURON_TYPE_LENGTH ), Constants.DNA_BASE );
		let initialValue = ( parseInt( dna.substring( idx + Constants.NEURON_TYPE_LENGTH, idx + Constants.NEURON_TOTAL_LENGTH ), Constants.DNA_BASE ) - Constants.NEURON_DATA_MIDDLE ) / Constants.NEURON_DATA_MIDDLE;

		if( type < NeuronDefinitions.length ) {
			network.neurons.push( createNeuron({ initialValue, type }) );
		}
	}

	for( let i = 0; i < numConnections; i++ ){
		let idx = Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH + numNeurons * Constants.NEURON_TOTAL_LENGTH + i * Constants.CONNECTION_TOTAL_LENGTH;

		let input = parseInt( dna.substring( idx, idx + Constants.NEURON_INDEX_LENGTH ), Constants.DNA_BASE );
		let output = parseInt( dna.substring( idx + Constants.NEURON_INDEX_LENGTH, idx + Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH ), Constants.DNA_BASE );
		let weight = ( parseInt( dna.substring( idx + Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH, idx + Constants.CONNECTION_TOTAL_LENGTH ), Constants.DNA_BASE ) - Constants.NEURON_DATA_MIDDLE ) / Constants.NEURON_DATA_MIDDLE;

		if( network.neurons[ input ] && network.neurons[ output ] ) {
			connectNeurons( network, network.neurons[ input ], network.neurons[ output ], weight );
		}
	}
}

export function clone ( network, mutate = 0.01 ) {
	let chance = Math.random();
	let dna = network.dna;

	if ( chance < mutate ) {
		let index = randomInt( Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH, network.dna.length - 1 );
		dna = network.dna.substring( 0, index - 1 ) + randomInt( 0, Constants.DNA_BASE - 1 ) + network.dna.substring( index );
	}

	return createNetwork( dna, network.renderScale );
}

export function stepNetwork( network, targets ) {
	network.iteration++;
	let smallestDistance = Infinity;
	let closestTargetDirectionCoords = { x: 0, y: 0 };
	let targetDirection = 0;
	let direction = 0;
	let speed = 0;

	for ( let i = 0; i < targets.length; i++ ) {
		let distance = targets[i].distance( network.position );
		if ( distance < smallestDistance ) {
			smallestDistance = distance;
			closestTargetDirectionCoords = { 
				x: targets[i].x - network.position.x, 
				y: targets[i].y - network.position.y
			};
		}
	}

	targetDirection = Math.atan2( closestTargetDirectionCoords.y, closestTargetDirectionCoords.x );

	for ( let i = 0, l = network.connectedNeurons.length; i < l; i++ ) {

		stepNeuron( network.connectedNeurons[i], { 
			iteration: network.iteration,
			position: network.position,
			direction: network.direction,
			speed: network.speed,
			distanceToTarget: smallestDistance,
			targetDirection: targetDirection,
		} );

		if( network.connectedNeurons[i].affects.direction ) {
			direction += network.connectedNeurons[i].value;
		}
		if( network.connectedNeurons[i].affects.speed ) {
			speed += network.connectedNeurons[i].value;
		}
	}

	network.direction += Math.max( -Constants.ANGLE_LIMIT, Math.min( Constants.ANGLE_LIMIT, direction ) );
	network.speed = Math.max( 0, Math.min( Constants.MAXIMUM_MOVING_DISTANCE, network.speed + speed ) );
	network.position.x += network.speed * Math.cos( network.direction );
	network.position.y += network.speed * Math.sin( network.direction );

	network.position.x = Math.min( Math.max( network.position.x, -network.renderScale.xRatio ), network.renderScale.xRatio );
	network.position.y = Math.min( Math.max( network.position.y, -network.renderScale.yRatio ), network.renderScale.yRatio );

	network.totalDistanceTraveled += network.speed;
}
