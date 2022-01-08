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

function updateStats( stats){

	stats = stats || environment.stats;
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
		'targetAreaRatio'
	].forEach( ( key ) => {
		$(`.stats .${key}`).innerHTML = stats[key];
	} );

	if( $('.currentDNA') !== document.activeElement ) {
		$('.currentDNA').innerHTML = stats.currentDNA;
	}

	plotData.shift();
	plotData.push( stats.survivalRate );

	sparkline.sparkline( $(".sparkline"), plotData, plotOptions );
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
		<div class="neuronDefinitionDescription">f=${NeuronDefinitionMap[def].description}</div>
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

environment.addEventListener( 'generation', updateStats );
environment.addEventListener( 'reset', updateStats );
environment.dispatchEvent( 'reset' );

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

$(".speed_reset").addEventListener( 'click', ( e ) => {
	environment.updateStepDelay( 16 );
	$(".stepDelay").value = 16;
	$('.speed').innerHTML = environment.stepDelay;
} );

$(".mutation_rate").addEventListener( 'input', ( e ) => {
	environment.mutationRate = parseInt( e.target.value ) / 100;
	$('.mutrate').innerHTML = environment.mutationRate.toFixed(2);
} );

$(".num_networks").addEventListener( 'change', ( e ) => {
	if( confirm('This will reset the network.') ) {
		environment.numNetworks = e.target.value;
	} else {
		e.target.value = environment.numNetworks;
	}
	$('.nonetworks').innerHTML = environment.numNetworks;
} );

$(".num_networks").addEventListener( 'input', ( e ) => {
	$('.nonetworks').innerHTML = e.target.value;
} );


$(".num_neurons").addEventListener( 'change', ( e ) => {
	if( confirm('This will reset the network.') ) {
		environment.numNeurons = e.target.value;
	} else {
		e.target.value = environment.numNeurons;
	}
	$('.noneurons').innerHTML = environment.numNeurons;
} );

$(".num_neurons").addEventListener( 'input', ( e ) => {
	$('.noneurons').innerHTML = e.target.value;
} );

$(".num_connections").addEventListener( 'change', ( e ) => {
	if( confirm('This will reset the network.') ) {
		environment.numConnections = e.target.value;
	} else {
		e.target.value = environment.numConnections;
	}
	$('.noconnections').innerHTML = environment.numConnections;
} );

$(".num_connections").addEventListener( 'input', ( e ) => {
	$('.noconnections').innerHTML = e.target.value;
} );

$(".max_iter").addEventListener( 'input', ( e ) => {
	environment.maxIterations = e.target.value;
	$('.noiter').innerHTML = environment.maxIterations;
} );

$(".iter_reset").addEventListener( 'click', ( e ) => {
	environment.maxIterations = 100;
	$(".max_iter").value = 100;
	$('.noiter').innerHTML = environment.maxIterations;
});

let timeout;
$(".currentDNA").addEventListener( 'input', ( e ) => {
	if( environment.generation === 0 && environment.iteration === 0 ) {
		if( timeout ) {
			clearTimeout( timeout );
		}
		timeout = setTimeout( () => {
			environment.initNetworksFromDnaSequence( e.target.value );
			
			$(".connectedNeurons").innerHTML = environment.stats.connectedNeurons;
			$(".connectedNeuronsAvg").innerHTML = environment.stats.connectedNeuronsAvg;
		}, 1000 );
	}
});
