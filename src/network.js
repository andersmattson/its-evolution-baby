import { createNeuron, stepNeuron, connectNeuronInput } from './neuron.js';
import {} from './outputfunctions.js';
import { NeuronDefinitions, NeuronTypes } from './neuron.js';
import Constants from './constants.js';

const PI2 = 2 * Math.PI;
const DEG10 = Math.PI / 18;
const DEG15 = Math.PI / 12;
const DEG30 = Math.PI / 6;
const DEG45 = Math.PI / 4;
const DEG315 = Math.PI * 7 / 4;
const DEG330 = PI2 - DEG30;
const DEG350 = PI2 - DEG10;

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
		direction: Math.random() * PI2,
		speed: 0,
		initialPosition: { x: 0, y: 0 },
		dna: dna,
		totalDistanceTraveled: 0,
		hasCollided: 0,
	}

	network.initialPosition = { ...network.position };
	setupFromDNA( network, dna );

	return network;
}

export function setRandomInitialPosition( network, renderScale ) {
	let position = { x: 2 * ( Math.random() - 0.5 ) * renderScale.xRatio, y: 2 * ( Math.random() - 0.5 ) * renderScale.yRatio }
	network.position = { ...position };
	network.initialPosition = { ...position };
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

	return cleanupNetwork( network );
}

export function cleanupNetwork ( network ) {
	// let connectedNeurons = [ ...network.connectedNeurons ];
	let keepGoing = true;
	while( keepGoing ) {
		keepGoing = false;
		for( let i = 0; i < network.connectedNeurons.length; i++ ){

			if( (NeuronTypes.OUTPUTS & network.connectedNeurons[ i ].neuronType) !== 0 && network.connectedNeurons[ i ].hasOutputs === 0 ) {
				network.connectedNeurons[ i ].inputs.forEach( ( input ) => {
					input.hasOutputs--;
				} );
				network.connectedNeurons.splice( i, 1 );
				i--;
				keepGoing = true;
			}

			// if( (NeuronTypes.OUTPUTS & network.connectedNeurons[ i ].neuronType) !== 0 && !network.connectedNeurons[ i ].hasOutputs ) {
			// 	network.connectedNeurons.splice( i, 1 );
			// 	i--;
			// } else if( (NeuronTypes.INPUTS & network.connectedNeurons[ i ].neuronType) !== 0 && !network.connectedNeurons[ i ].hasInputs ) {
			// 	network.connectedNeurons.splice( i, 1 );
			// 	i--;
			// }
		}
	}
	return network;
}

export function clone ( network, mutate = 0.01, renderScale ) {
	let chance = Math.random();
	let dna = network.dna;

	if ( chance < mutate ) {
		let index = randomInt( Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH, network.dna.length - 1 );
		dna = network.dna.substring( 0, index - 1 ) + randomInt( 0, Constants.DNA_BASE - 1 ) + network.dna.substring( index );
	}

	return createNetwork( dna, renderScale );
}

export function stepNetwork( network, targets, obstacleMap, renderScale, obstacleResolution ) {

	let smallestDistance = Infinity;
	let closestTargetDirectionCoords = { x: 0, y: 0 };
	let targetDirection = 0;
	let direction = 0;
	let speed = 0;
	let targetAngle = 0;
	let targetVisible = 0;
	let diff = 0;
	let targetIdx = -1;

	network.iteration++;

	for ( let i = 0; i < targets.length; i++ ) {
		let distance = targets[i].distance( network.position );
		if ( distance < smallestDistance ) {
			targetIdx = i;
			smallestDistance = distance;
			closestTargetDirectionCoords = { 
				x: targets[i].x - network.position.x, 
				y: targets[i].y - network.position.y
			};
		}
	}

	if( smallestDistance == 0 ) {
		targetVisible = 1;
	}
	else {
		targetAngle = Math.asin( targets[targetIdx].radius / ( smallestDistance + targets[targetIdx].radius ) );
		targetDirection = Math.atan2( closestTargetDirectionCoords.y, closestTargetDirectionCoords.x );
		targetDirection += targetDirection < 0 ? PI2 : 0;
	
		diff = Math.abs( targetDirection - network.direction );

		if( diff < DEG30 + targetAngle || diff > DEG330 - targetAngle ) {
			targetVisible = 1;
		}
	}

	for ( let i = 0, l = network.connectedNeurons.length; i < l; i++ ) {

		stepNeuron( network.connectedNeurons[i], { 
			iteration: network.iteration,
			distanceToTarget: smallestDistance,
			targetVisible: targetVisible,
			hasCollided: network.hasCollided,
		} );

		if( network.connectedNeurons[i].affects.direction ) {
			direction += network.connectedNeurons[i].value;
		}
		if( network.connectedNeurons[i].affects.speed ) {
			speed += network.connectedNeurons[i].value;
		}
	}

	network.direction = (network.direction + Math.max( -Constants.ANGLE_LIMIT, Math.min( Constants.ANGLE_LIMIT, direction ) ) ) % ( PI2 );
	network.direction += network.direction < 0 ? PI2 : 0;
	network.speed = Math.max( 0, Math.min( Constants.MAXIMUM_MOVING_DISTANCE, network.speed + speed ) );

	let x = network.position.x + Math.cos( network.direction ) * network.speed;
	let y = network.position.y + Math.sin( network.direction ) * network.speed;
	x = Math.min( Math.max( x, -renderScale.xRatio ), renderScale.xRatio );
	y = Math.min( Math.max( y, -renderScale.yRatio ), renderScale.yRatio );

	// Check obstacle collision
	let obstacleId = Math.round( x * obstacleResolution / 2 ) + '_' + Math.round( y * obstacleResolution / 2 );
	if( !obstacleMap[ obstacleId ] ) {
		network.position.x = x;
		network.position.y = y;
		network.totalDistanceTraveled += network.speed;
		network.hasCollided = 0;
	} else {
		network.hasCollided = 1;
	}

}
