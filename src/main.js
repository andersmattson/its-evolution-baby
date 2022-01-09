import * as sparkline from './sparkline.js';
import { Environment } from './environment.js';
import Target from './target.js';
import { 
	enableNeuronDefinition,
	disableNeuronDefinition,
	NeuronDefinitionMap, 
	NeuronDefinitions, 
	DisabledNeuronDefinitions, 
	NeuronTypeNames,
	NeuronTypes,
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

updateNeuronDefinitions();

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

	NeuronDefinitions.forEach( ( neuron, i ) => {
		if( stats.neuronsInUse.has( neuron.neuronName ) ) {
			$(`.inuse_${neuron.neuronName}`).classList.add('active');
		} else {
			$(`.inuse_${neuron.neuronName}`).classList.remove('active');
		}
	} );
}

function renderNeuronType( neuron ) {
	let list = $('.neuron_list');
	let def = neuron.neuronName;
	let elem = document.createElement( 'div' );
	elem.classList.add( 'nDef' );
	elem.innerHTML = 
	`<input type="checkbox" value="${def}" class="${def}" checked />
	<div>
		<div>${def} <span class="inuse inuse_${def}">In use</span></div>
		<div class="nDefType">Type: ${NeuronTypeNames[neuron.type]}, affects: ${Object.keys(neuron.affects).join() || 'none'}</div>
		<div class="nDefDesc">f=${NeuronDefinitionMap[def].description}</div>
	</div>`;
	list.appendChild( elem );
}

function renderNeuronCategory( type, title ) {
	let list = $('.neuron_list');
	let genTitle = document.createElement('h3');
	genTitle.innerText = title;
	list.appendChild( genTitle );
	Object.values( NeuronDefinitionMap ).filter( ( def ) => def.type === type ).forEach( renderNeuronType );
}

[ 
	{
		title: 'Sensors',
		type: NeuronTypes.SENSORY,
	},
	{
		title: 'Generators',
		type: NeuronTypes.GENERATOR,
	},
	{
		title: 'Synapses',
		type: NeuronTypes.SYNAPSE,
	},
	{
		title: 'Actors',
		type: NeuronTypes.ACTOR,
	},
].forEach( ( item ) => {
	renderNeuronCategory( item.type, item.title );
} );

$('.apply_neurons').addEventListener( 'click', ( e ) => {
	if( confirm( 'This will reset the current simulation!' ) ){
		$all( '.nDef' ).forEach( elem => {
			let input = elem.querySelector( 'input' );
			if( input.checked ) {
				enableNeuronDefinition( input.value );
				elem.classList.remove( 'disabled' );
			} else {
				disableNeuronDefinition( input.value );
				elem.classList.add( 'disabled' );
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

$('.show_info').addEventListener( 'click', () => {
	$('.neuron_list').classList.toggle( 'info_visible' );
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
	numNeurons: 32,
	numConnections: 64,
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
	$('.mutrate').innerHTML = parseInt( e.target.value );
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
