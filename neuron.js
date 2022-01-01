import Constants from './constants.js';

const NeuronTypes = {
	SENSORY: 1, // Environment inputs only, outputs
	SYNAPSE: 2, // Both input and output
	ACTOR: 4,	// Only Inputs, environment outputs only
	GENERATOR: 8, // No inputs, only outputs

	INPUTS: 6,
	OUTPUTS: 11
};

const NeuronDefinitions = [];

function registerNeuronDefinition( fn, type = NeuronTypes.SYNAPSE, affects = {}, name = '' ) {
	fn.type = type;
	fn.affects = affects;
	fn.neuronName = name;
	NeuronDefinitions.push( fn );
	Constants.NEURON_TYPES = NeuronDefinitions.length;
}

function stepNeuron ( neuron, args ) {
	neuron.iteration++;
	let weightedInput = neuron.selfWeight * neuron.value;

	for( let i = 0; i < neuron.inputs.length; i++ ) {
		weightedInput += neuron.inputs[ i ].input.value * neuron.inputs[ i ].weight;
	}
	
	weightedInput += neuron.selfWeight * neuron.value;

	neuron.value = NeuronDefinitions[ neuron.type ]( {
		iteration: args.iteration, 					// Think of this as the time
		position: args.position, 					// Think of this as the sight
		// targets: args.targets,
		distanceToTarget: args.distanceToTarget,	// Think of this as the strength of a scent
		targetDirectionX: args.targetDirectionX,	// The direction from where the scent is coming
		targetDirectionY: args.targetDirectionY,	// The direction from where the scent is coming
		initialValue: neuron.initialValue,			// The initial value of the neuron, this comes from the DNA
		weightedInput,								// The weighted input to the neuron
		value: neuron.value							// The current value of the neuron
	} );
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
		affects: NeuronDefinitions[ _type ].affects
	};
}

export {
	NeuronTypes,
	createNeuron,
	stepNeuron,
	connectNeuronInput,
	registerNeuronDefinition,
	NeuronDefinitions
};