import * as sparkline from './sparkline.js';
import { Environment } from './environment.js';
import Target from './target.js';
import { 
	enableNeuronDefinition,
	disableNeuronDefinition,
	NeuronDefinitionMap, 
	NeuronDefinitions, 
	DisabledNeuronDefinitions, 
	NeuronTypeNames 
} from './neuron.js';

function $(selector) {
	return document.querySelector(selector);
}

function $all(selector) {
	return document.querySelectorAll(selector);
}

function updateNeuronDefinitions() {
	$('.active_neuron_types').innerText = NeuronDefinitions.length;
	$('.disabled_neuron_types').innerText = DisabledNeuronDefinitions.length + NeuronDefinitions.length;
}

let list = $('.neuron_list');
Object.keys( NeuronDefinitionMap ).forEach( def => {
	let neuron = NeuronDefinitionMap[def];
	let elem = document.createElement( 'div' );
	elem.classList.add( 'neuronDefinition' );
	elem.innerHTML = 
	`<input type="checkbox" value="${def}" class="${def}" checked />
	<div>	
		<div class="neuronDefinitionName">${def}</div>
		<div class="neuronDefinitionType">Type: ${NeuronTypeNames[neuron.type]}, affects: ${Object.keys(neuron.affects).join() || 'none'}</div>
		<div class="neuronDefinitionDescription">${NeuronDefinitionMap[def].description}</div>
	</div>`;
	list.appendChild( elem );
});

$('.apply_neurons').addEventListener( 'click', ( e ) => {
	if( confirm( 'This will reset the current simulation!' ) ){
		$all( '.neuronDefinition' ).forEach( elem => {
			let input = elem.querySelector( 'input' );
			if( input.checked ) {
				enableNeuronDefinition( input.value );
			} else {
				disableNeuronDefinition( input.value );
			}
		});
		updateNeuronDefinitions();
		environment.reset();
	}
} );

$('.hide_neurons').addEventListener( 'click', () => {
	$('.neuron_list').classList.toggle( 'hidden' );
});

$('.display_neurons').addEventListener( 'click', () => {
	$('.neuron_list').classList.toggle( 'hidden' );
});

let plotData = new Array(100).fill(0);

let plotOptions = {
	spotRadius: 0,
	max: 100
};

sparkline.sparkline( $(".sparkline"), plotData, plotOptions );

const environment = new Environment({ 
	canvas: $('.environment'),
	numNetworks: 400,
	numNeurons: 128,
	numConnections: 128,
	mutationRate: 0.5,
	waitForStart: true,
	randomInitSpawn: true,
	survivorsOnly: false,
} );

environment.addTarget( new Target( environment, 0.5, 0.5, 0.2, '#ffff00', environment.renderScale ) );

environment.addEventListener( 'generation', ( stats ) => {

	const target = $(".stats");
	[ 
		'generation', 
		'survivalRate',
		'size', 
		'connectedNeuronsAvg',
		'connectedNeurons',
		'avgDistanceTraveled',
		'avgDnaLength',
		'duration',
		'currentDNA'
	].forEach( ( key ) => {
		$(`.stats .${key}`).innerHTML = stats[key];
	} );

	plotData.shift();
	plotData.push( stats.survivalRate );
	// console.log( Math.min(...plotData), Math.max(...plotData) );
	sparkline.sparkline( $(".sparkline"), plotData, plotOptions );
} );

environment.addEventListener( 'pause', ( state ) => {
	$('.pausa').innerHTML = state ? 'Start' : 'Pause';
} );

$(".pausa").addEventListener( 'click', () => environment.togglePause() );

$(".render").addEventListener( 'click', () => environment.toggleRender());

$(".interactive").addEventListener( 'click', () => environment.toggleInteractiveMode() );

$(".stepDelay").addEventListener( 'input', ( e ) => {
	environment.updateStepDelay( e.target.value );
	$('.speed').innerHTML = environment.stepDelay;
} );

$(".mutation_rate").addEventListener( 'input', ( e ) => {
	environment.mutationRate = parseInt( e.target.value ) / 100;
	$('.mutrate').innerHTML = environment.mutationRate.toFixed(2);
} );

$(".num_neurons").addEventListener( 'change', ( e ) => {
	if( confirm('This will reset the network.') ) {
		environment.numNeurons = e.target.value;
	} else {
		e.target.value = environment.numNeurons;
	}
	$('.noneurons').innerHTML = environment.numNeurons;
} );

$(".num_connections").addEventListener( 'change', ( e ) => {
	if( confirm('This will reset the network.') ) {
		environment.numConnections = e.target.value;
	} else {
		e.target.value = environment.numConnections;
	}
	$('.noconnections').innerHTML = environment.numConnections;
} );
