import { NeuronTypes, registerNeuronDefinition } from './neuron.js';
import Constants from './constants.js';

registerNeuronDefinition( function( args ) {
	return args.weightedInput;
}, NeuronTypes.SYNAPSE, {}, 'WeightedSum', 'weightedInput' );

registerNeuronDefinition( function( args ) {
	return args.weightedAverage;
}, NeuronTypes.SYNAPSE, {}, 'WeightedAverage', 'weightedAverage' );

registerNeuronDefinition( function( args ) {
	return Math.tanh( args.weightedInput );
}, NeuronTypes.SYNAPSE, {}, 'Tanh', 'tanh( weightedInput )' );

registerNeuronDefinition( function( args ) {
	return args.weightedInput / ( 1 + args.time );
}, NeuronTypes.SYNAPSE, {}, 'WeightedInputDecay', 'weightedInput / ( 1 + time )' );

registerNeuronDefinition( function( args ) {
	return args.weightedInput - args.lastWeightedInput;
}, NeuronTypes.SYNAPSE, {}, 'WeightedInputDerivative', 'weightedInput - lastWeightedInput' );

registerNeuronDefinition( function( args ) {
	return Math.sin( args.time * args.initialValue );
}, NeuronTypes.GENERATOR, {}, 'Oscillator', 'sin( time * initialValue )' );

registerNeuronDefinition( function( args ) {
	return args.initialValue / ( 1 + args.time );
}, NeuronTypes.GENERATOR, {}, 'Decay', 'initialValue / ( 1 + time )' );

registerNeuronDefinition( function( args ) {
	return Math.exp( args.time * args.initialValue );
}, NeuronTypes.GENERATOR, {}, 'Exponential', 'exp( time * initialValue )' );

registerNeuronDefinition( function( args ) {
	return args.time * args.initialValue;
}, NeuronTypes.GENERATOR, {}, 'Growth', 'time * initialValue' );

registerNeuronDefinition( function ( args ) {
	return args.initialValue;
}, NeuronTypes.GENERATOR, {}, 'Constant', 'initialValue' );

// registerNeuronDefinition( function( args ) {
// 	return ( 2 * Math.random() - 1 );
// }, NeuronTypes.GENERATOR, {}, 'Random', 'random()' );

registerNeuronDefinition( function ( args ) {
	return Math.tanh( args.weightedInput ) * Constants.MAXIMUM_MOVING_DISTANCE;
}, NeuronTypes.ACTOR, { x: true }, 'HorizontalMover', 'tanh( weightedInput ) * MAX_DISTANCE' );

/*
registerNeuronDefinition( function ( args ) {
	return Math.tanh( args.weightedInput ) * Constants.MAXIMUM_MOVING_DISTANCE;
}, NeuronTypes.ACTOR, { y: true }, 'VerticalMover', 'tanh( weightedInput ) * MAX_DISTANCE' );

registerNeuronDefinition( function ( args ) {
	return Math.tanh( args.weightedInput ) * 2 * Math.PI;
}, NeuronTypes.ACTOR, { direction: true }, 'Direction', 'tanh( weightedInput ) * 2π' );
*/

registerNeuronDefinition( function ( args ) {
	return Math.tanh( args.weightedInput ) * Constants.MAXIMUM_MOVING_DISTANCE;
}, NeuronTypes.ACTOR, { speed: true }, 'Speed', 'tanh( weightedInput ) * MAX_DISTANCE' );

registerNeuronDefinition( function ( args ) {
	return args.position.x;
}, NeuronTypes.SENSORY, {}, 'PositionX', 'position.x' );

registerNeuronDefinition( function( args ) {
	return args.position.y;
}, NeuronTypes.SENSORY, {}, 'PositionY', 'position.y' );

registerNeuronDefinition( function( args ) {
	return 1 / ( 1 + args.distanceToTarget );
}, NeuronTypes.SENSORY, {}, 'InvertedTargetDistance', '1 / ( 1 + distanceToTarget )' );

registerNeuronDefinition( function( args ) {
	return args.targetDirectionX;
}, NeuronTypes.SENSORY, {}, 'TargetDirectionX', 'targetDirectionX' );

registerNeuronDefinition( function( args ) {
	return args.targetDirectionY;
}, NeuronTypes.SENSORY, {}, 'TargetDirectionY', 'targetDirectionY' );

export default {};