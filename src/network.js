import { createNeuron, stepNeuron, connectNeuronInput } from './neuron.js';
import {} from './outputfunctions.js';
import { NeuronDefinitions, NeuronTypes } from './neuron.js';
import Constants from './constants.js';

const PI2 = 2 * Math.PI;
const DEG10 = Math.PI / 18;
const DEG15 = Math.PI / 12;
const DEG30 = Math.PI / 6;
const DEG45 = Math.PI / 4;
const DEG90 = Math.PI / 2;
const DEG315 = PI2 - DEG45;
const DEG270 = PI2 - DEG90;
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
	let r;

	ret += fillValue( numNeuronsStr, Constants.NEURON_INDEX_LENGTH );
	ret += fillValue( numConnectionsStr, Constants.CONNECTION_INDEX_LENGTH );
	
	let required = 0;

	NeuronDefinitions.forEach( ( def, i ) => {
		if( def.required ){
			required++;
			ret += fillValue( i.toString( Constants.DNA_BASE ), Constants.NEURON_TYPE_LENGTH );
			ret += fillValue(randomInt( 0, Math.pow( Constants.DNA_BASE, 8 ) ).toString( Constants.DNA_BASE ), Constants.NEURON_DATA_LENGTH );
		}
	});

	for( let i = required; i < numNeurons; i++ ){
		r = randomInt( 0, NeuronDefinitions.length - 1 );
		
		ret += fillValue( r.toString( Constants.DNA_BASE ), Constants.NEURON_TYPE_LENGTH );
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

export function createNetwork( dna, renderScale, startPosition ) {
	
	let dir = Math.random() * PI2;
	let pos = startPosition ? { ...startPosition } : { x: 2 * ( Math.random() - 0.5 ) * renderScale.xRatio, y: 2 * ( Math.random() - 0.5 ) * renderScale.yRatio };
	let network = {
		neurons: [],
		_connectedNeurons: new Set(),
		connectedNeurons: [],
		iteration: 0,
		position: pos,
		previousPosition: { ...pos },
		direction: dir,
		previousDirection: dir,
		speed: 0,
		initialPosition: { x: 0, y: 0 },
		dna: dna,
		totalDistanceTraveled: 0,
		hasCollided: 0,
		targetVisible: 0,
	}

	network.initialPosition = { ...network.position };
	setupFromDNA( network, dna );

	return network;
}

export function setInitialPosition( network, position ) {
	network.position = { ...position };
	network.initialPosition = { ...position };
	network.previousPosition = { ...position };
}

export function setRandomInitialPosition( network, renderScale ) {
	setInitialPosition( network, { x: 2 * ( Math.random() - 0.5 ) * renderScale.xRatio, y: 2 * ( Math.random() - 0.5 ) * renderScale.yRatio } );
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
			let n = createNeuron({ initialValue, type });
			network.neurons.push( n );
			if( NeuronDefinitions[ type ].required ) {
				network._connectedNeurons.add( n );
				network.connectedNeurons.push( n );
			}
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
	
	// Merge all single neurons
	let singles = {};

	for( let i = 0; i < network.connectedNeurons.length; i++ ) {
		let n = network.connectedNeurons[ i ];
		let type = NeuronDefinitions[ n.type ].type;

		if( type === NeuronTypes.ACTOR ){
			
			if( !singles[ n.type ] ) {
				singles[ n.type ] = n;
			} else {
				singles[ n.type ].inputs = singles[ n.type ].inputs.concat( n.inputs );
				singles[ n.type ].hasInputs += n.hasInputs;
				network.connectedNeurons.splice( i, 1 );
				network._connectedNeurons.delete( n );
				i--;
			}

			for( let j = 0; j < n.inputs.length; j++ ) {
				let input = n.inputs[ j ].input;
				let isSingle = NeuronDefinitions[ input.type ].single;
				if( isSingle ) {
					if( !singles[ input.type ] ) {
						singles[ input.type ] = input;
					} else {
						input.hasOutputs--;
						n.inputs[ j ].input = singles[ input.type ];
						singles[ input.type ].hasOutputs++;
					}
				}
			}

		} else if ( type === NeuronTypes.SENSORY ){

		} else if ( type === NeuronTypes.GENERATOR ){
			
		} else {
			for( let j = 0; j < n.inputs.length; j++ ) {
				let input = n.inputs[ j ].input;
				let isSingle = NeuronDefinitions[ input.type ].single;
				if( isSingle ) {
					if( !singles[ input.type ] ) {
						singles[ input.type ] = input;
					} else {
						input.hasOutputs--;
						n.inputs[ j ].input = singles[ input.type ];
						singles[ input.type ].hasOutputs++;
					}
				}
			}
		}

	}

	while( keepGoing ) {
		
		keepGoing = false;
		
		for( let i = 0; i < network.connectedNeurons.length; i++ ){
			let n = network.connectedNeurons[ i ];
			
			if( (NeuronTypes.HASOUTPUTS & n.neuronType) !== 0 && n.hasOutputs < 1 ) {
				
				n.inputs.forEach( ( input ) => {
					input.input.hasOutputs--;
				} );
				
				network.connectedNeurons.splice( i, 1 );
				network._connectedNeurons.delete( n );
				//i--;
				keepGoing = true;
				break;
			} else if(
				NeuronDefinitions[ n.type ].single &&
				(NeuronTypes.HASINPUTS & n.neuronType) !== 0 && 
				n.hasInputs < 1
			) {
				network.connectedNeurons.splice( i, 1 );
				network._connectedNeurons.delete( n );
			}
		}
	}
	return network;
}

export function clone ( network, mutate = 0.01, renderScale, startPosition ) {
	let chance = Math.random();
	let dna = network.dna;

	if ( chance < mutate ) {
		let index = randomInt( Constants.REQUIRED_NEURONS * Constants.NEURON_TOTAL_LENGTH + Constants.NEURON_INDEX_LENGTH + Constants.CONNECTION_INDEX_LENGTH, network.dna.length - 1 );
		dna = network.dna.substring( 0, index - 1 ) + randomInt( 0, Constants.DNA_BASE - 1 ) + network.dna.substring( index );
	}

	return createNetwork( dna, renderScale, startPosition );
}

export function stepNetwork( network, targets, obstacles, obstacleMap, renderScale, obstacleGridSize ) {

	let smallestDistance = Infinity;
	let targetVector = { x: 0, y: 0 };
	let targetVectorLength = 0;
	let targetDirection = 0;
	let direction = 0;
	let speed = 0;
	let targetVisible = 0;
	let diff = 0;
	let targetIdx = -1;

	network.iteration++;
	network.previousPosition = { ...network.position };
	network.previousDirection = network.direction;

	for ( let i = 0; i < targets.length; i++ ) {
		let distance = targets[i].distance( network.position );
		if ( distance < smallestDistance ) {
			targetIdx = i;
			smallestDistance = distance;
			targetVector = { 
				x: targets[i].x - network.position.x, 
				y: targets[i].y - network.position.y
			};
			targetVectorLength = smallestDistance + targets[i].radius;
		}
	}

	if( smallestDistance == 0 ) {
		targetVisible = 1;
	}
	else {
		targetDirection = Math.atan2( targetVector.y, targetVector.x );
		targetDirection += targetDirection < 0 ? PI2 : 0;

		network.targetDirection = targetDirection;
		network.obstacleIndex = -1;

		diff = Math.abs( targetDirection - network.direction );

		if( diff < DEG30 || diff > DEG330 ) {

			targetVisible = 1;

			for( let i = 0; i < obstacles.length; i++ ) {
				let obstacle = obstacles[i];
				let obstacleVector = { x: obstacle.gridPosition.x - network.position.x, y: obstacle.gridPosition.y - network.position.y };
				let obstacleVectorLength = obstacle.distance( network.position );

				let theta = Math.acos( 
					( 
						targetVector.x * obstacleVector.x + 
						targetVector.y * obstacleVector.y 
					) / ( targetVectorLength * obstacleVectorLength )
				);
				
				if( theta > DEG90 ) {
					continue;
				}

				let dist = Math.abs( obstacleVector.x * targetVector.y - targetVector.x * obstacleVector.y ) / targetVectorLength;
				if( dist < obstacle.radius ) {
					network.obstacleIndex = i;
					targetVisible = 0;
					break;
				}

			}
		}
	}

	network.targetVisible = targetVisible;

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
	network.speed = Math.max( 0, Math.min( Constants.MAXIMUM_MOVING_DISTANCE, speed ) );

	let x = network.position.x + Math.cos( network.direction ) * network.speed;
	let y = network.position.y + Math.sin( network.direction ) * network.speed;
	x = Math.min( Math.max( x, -renderScale.xRatio ), renderScale.xRatio );
	y = Math.min( Math.max( y, -renderScale.yRatio ), renderScale.yRatio );

	// Check obstacle collision
	let obstacleId = Math.round( x / obstacleGridSize ) + '_' + Math.round( y / obstacleGridSize );
	if( !obstacleMap[ obstacleId ] ) {
		network.position.x = x;
		network.position.y = y;
		network.totalDistanceTraveled += network.speed;
		network.hasCollided = 0;
	} else {
		network.hasCollided = 1;
	}

}
