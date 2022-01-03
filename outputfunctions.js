import { NeuronTypes, registerNeuronDefinition } from './neuron.js';
import Constants from './constants.js';

registerNeuronDefinition( function( args ) {
	return args.weightedInput;
}, NeuronTypes.SYNAPSE, {}, 'WeightedSum' );

registerNeuronDefinition( function( args ) {
	return args.weightedAverage;
}, NeuronTypes.SYNAPSE, {}, 'WeightedAverage' );

registerNeuronDefinition( function( args ) {
	return Math.tanh( args.weightedInput );
}, NeuronTypes.SYNAPSE, {}, 'Tanh' );

registerNeuronDefinition( function( args ) {
	return args.weightedInput / ( 1 + args.iteration );
}, NeuronTypes.SYNAPSE, {}, 'WeightedInputDecay' );

registerNeuronDefinition( function( args ) {
	return args.weightedInput - args.lastWeightedInput;
}, NeuronTypes.SYNAPSE, {}, 'WeightedInputMemory' );

registerNeuronDefinition( function( args ) {
	return Math.sin( args.iteration * args.initialValue );
}, NeuronTypes.GENERATOR, {}, 'Oscillator' );

registerNeuronDefinition( function( args ) {
	return args.initialValue / ( 1 + args.iteration );
}, NeuronTypes.GENERATOR, {}, 'Decay' );

registerNeuronDefinition( function( args ) {
	return Math.exp( args.iteration * args.initialValue );
}, NeuronTypes.GENERATOR, {}, 'Exponential' );

registerNeuronDefinition( function( args ) {
	return args.iteration * args.initialValue;
}, NeuronTypes.GENERATOR, {}, 'Growth' );

registerNeuronDefinition( function ( args ) {
	return args.initialValue;
}, NeuronTypes.GENERATOR, {}, 'Constant' );

// registerNeuronDefinition( function( args ) {
// 	return ( 2 * Math.random() - 1 );
// }, NeuronTypes.GENERATOR, {}, 'Random' );

registerNeuronDefinition( function ( args ) {
	return Math.tanh( args.weightedInput ) * Constants.MAXIMUM_MOVING_DISTANCE;
}, NeuronTypes.ACTOR, { x: true }, 'HorizontalMover' );

registerNeuronDefinition( function ( args ) {
	return Math.tanh( args.weightedInput ) * Constants.MAXIMUM_MOVING_DISTANCE;
}, NeuronTypes.ACTOR, { y: true }, 'VerticalMover' );

registerNeuronDefinition( function ( args ) {
	return args.position.x;
}, NeuronTypes.SENSORY, {}, 'PositionX' );

registerNeuronDefinition( function( args ) {
	return args.position.y;
}, NeuronTypes.SENSORY, {}, 'PositionY' );

registerNeuronDefinition( function( args ) {
	return 1 / ( 1 + args.distanceToTarget );
}, NeuronTypes.SENSORY, {}, 'InvertedTargetDistance' );

// registerNeuronDefinition( function( args ) {
// 	return args.targetDirectionX;
// }, NeuronTypes.SENSORY, {}, 'TargetDirectionX' );

// registerNeuronDefinition( function( args ) {
// 	return args.targetDirectionY;
// }, NeuronTypes.SENSORY, {}, 'TargetDirectionY' );

export default {};