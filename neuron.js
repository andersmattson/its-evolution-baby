import Constants from './constants.js';

const NeuronTypes = {
	SENSORY: 1, 	// Environment inputs only, outputs
	SYNAPSE: 2, 	// Both input and output
	ACTOR: 4,		// Only Inputs, environment outputs only
	GENERATOR: 8, 	// No inputs, only outputs

	INPUTS: 6,
	OUTPUTS: 11
};

const NeuronTypeNames = Object.keys( NeuronTypes ).reduce( ( acc, key ) => {
	acc[ NeuronTypes[ key ] ] = key;
	return acc;
}, {} );

const NeuronDefinitions = [];
const DisabledNeuronDefinitions = [];
const NeuronDefinitionMap = {};

function registerNeuronDefinition( fn, type = NeuronTypes.SYNAPSE, affects = {}, name = '', description = '' ) {

	if( NeuronDefinitionMap[ name ] ) {
		throw new Error( `Neuron definition with name '${ name }' already exists.` );
	}

	fn.type = type;
	fn.affects = affects;
	fn.neuronName = name;
	fn.description = description;
	NeuronDefinitions.push( fn );
	NeuronDefinitionMap[ name ] = fn;
	Constants.NEURON_TYPES = NeuronDefinitions.length;
}

function enableNeuronDefinition( name ) {
	let idx = DisabledNeuronDefinitions.findIndex( ( def ) => def.neuronName === name );
	if( idx !== -1 ) {
		NeuronDefinitions.push( DisabledNeuronDefinitions[idx] );
		DisabledNeuronDefinitions.splice( idx, 1 );
		Constants.NEURON_TYPES = NeuronDefinitions.length;
	}
}

function disableNeuronDefinition( name ) {
	let idx = NeuronDefinitions.findIndex( ( def ) => def.neuronName === name );
	if( idx !== -1 ) {
		DisabledNeuronDefinitions.push( NeuronDefinitions[idx] );
		NeuronDefinitions.splice( idx, 1 );
		Constants.NEURON_TYPES = NeuronDefinitions.length;
	}
}

function stepNeuron ( neuron, args ) {
	neuron.iteration++;
	let weightedInput = neuron.selfWeight * neuron.value;
	let weightedAverage;

	for( let i = 0; i < neuron.inputs.length; i++ ) {
		weightedInput += neuron.inputs[ i ].input.value * neuron.inputs[ i ].weight;
	}
	
	weightedInput += neuron.selfWeight * neuron.value;
	weightedAverage = weightedInput / ( neuron.inputs.length + 1 );

	neuron.value = NeuronDefinitions[ neuron.type ]( {
		time: args.iteration, 						// Think of this as the time
		position: args.position, 						// Think of this as the sight
		distanceToTarget: args.distanceToTarget,		// Think of this as the strength of a scent
		targetDirectionX: args.targetDirectionX,		// The direction from where the scent is coming
		targetDirectionY: args.targetDirectionY,		// The direction from where the scent is coming
		initialValue: neuron.initialValue,				// The initial value of the neuron, this comes from the DNA
		weightedInput,									// The weighted input to the neuron
		weightedAverage,								// The weighted average of the inputs
		value: neuron.value,							// The current value of the neuron
		lastWeightedInput: neuron.lastWeightedInput,	// The last weighted input to the neuron
		lastWeightedAverage: neuron.lastWeightedAverage,// The last weighted average of the inputs
	} );

	neuron.lastWeightedInput = weightedInput;
	neuron.lastWeightedAverage = weightedAverage;
}

function connectNeuronInput ( neuron, input, weight = 1 ) {
	if( input === neuron ) {
		if( (NeuronTypes.INPUTS & neuron.neuronType) !== 0 && (NeuronTypes.OUTPUTS & neuron.neuronType) !== 0 ) {
			neuron.selfWeight = weight;
			return true;
		}
		return false;
	} else if ( (NeuronTypes.OUTPUTS & input.neuronType) !== 0 && (NeuronTypes.INPUTS & neuron.neuronType) !== 0 ) {
		neuron.inputs.push( { input, weight } );
		return true;
	}
	return false;
}

function createNeuron( { type, initialValue } ) {
	let _type = type || 0;
	let _initialValue = initialValue || 0;
	return {
		isNeuron: true,
		type: _type,
		initialValue: _initialValue,
		value: _initialValue,
		// nextValue: 0,
		// previousValue: _initialValue,
		iteration: 0,
		neuronType: NeuronDefinitions[ _type ].type,
		inputs: [],
		selfWeight: 0,
		affects: NeuronDefinitions[ _type ].affects,
		lastWeightedInput: 0,
		lastWeightedAverage: 0,
	};
}

export {
	NeuronTypes,
	createNeuron,
	stepNeuron,
	connectNeuronInput,
	registerNeuronDefinition,
	NeuronDefinitions,
	DisabledNeuronDefinitions,
	enableNeuronDefinition,
	disableNeuronDefinition,
	NeuronDefinitionMap,
	NeuronTypeNames
};