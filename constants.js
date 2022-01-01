// const Constants = {
// 	DNA_BASE: 4,
// 	MAX_NEURONS: 255,
// 	MAX_CONNECTIONS: 255,
// 	NEURON_DATA_LENGTH: 10,
// 	CONNECTION_DATA_LENGTH: 10,

// 	NEURON_TYPES: 0, // Set from neuron.js
// 	NEURON_TOTAL_LENGTH: -1, // Calculated
// 	NEURON_TYPE_LENGTH: -1, // Calculated
// 	CONNECTION_TOTAL_LENGTH: -1, // Calculated
// 	NEURON_INDEX_LENGTH: -1, // Calculated

// 	NEURON_DATA_MIDDLE: -1, // Calculated

// 	MAXIMUM_MOVING_DISTANCE: 0.1
// }

// function UpdateNeuronTypeCount ( count ) {
// 	Constants.NEURON_TYPES = count;
// 	Constants.NEURON_TYPE_LENGTH = Constants.NEURON_TYPES.toString(4).length;
// 	Constants.NEURON_TOTAL_LENGTH = Constants.NEURON_TYPE_LENGTH + Constants.NEURON_DATA_LENGTH;
// 	Constants.NEURON_INDEX_LENGTH = Constants.MAX_NEURONS.toString(4).length;
// 	Constants.CONNECTION_INDEX_LENGTH = Constants.MAX_CONNECTIONS.toString(4).length;
// 	Constants.CONNECTION_TOTAL_LENGTH = Constants.CONNECTION_INDEX_LENGTH * 2 + Constants.CONNECTION_DATA_LENGTH;
// 	Constants.NEURON_DATA_MIDDLE = Math.pow( 2, ( Constants.NEURON_TOTAL_LENGTH - 2 ) * 2 - 1 );
// }

// Constants.NEURON_TYPE_LENGTH = Constants.NEURON_TYPES.toString(4).length;
// Constants.NEURON_TOTAL_LENGTH = Constants.NEURON_TYPE_LENGTH + Constants.NEURON_DATA_LENGTH;
// Constants.NEURON_INDEX_LENGTH = Constants.MAX_NEURONS.toString(4).length;
// Constants.CONNECTION_INDEX_LENGTH = Constants.MAX_CONNECTIONS.toString(4).length;
// Constants.CONNECTION_TOTAL_LENGTH = Constants.CONNECTION_INDEX_LENGTH * 2 + Constants.CONNECTION_DATA_LENGTH;
// Constants.NEURON_DATA_MIDDLE = Math.pow( 2, ( Constants.NEURON_TOTAL_LENGTH - 2 ) * 2 - 1 );

class ConstantsClass {
	DNA_BASE = 4;
	MAX_NEURONS = 255;
	MAX_CONNECTIONS = 255;
	NEURON_DATA_LENGTH = 10;
	CONNECTION_DATA_LENGTH = 10;

	#NEURON_TYPES = 0; // Set from neuron.js
	NEURON_TOTAL_LENGTH = -1; // Calculated
	NEURON_TYPE_LENGTH = -1; // Calculated
	CONNECTION_TOTAL_LENGTH = -1; // Calculated
	CONNECTION_INDEX_LENGTH = -1; // Calculated
	NEURON_INDEX_LENGTH = -1; // Calculated

	NEURON_DATA_MIDDLE = -1; // Calculated

	MAXIMUM_MOVING_DISTANCE = 0.02;

	constructor () {

		this.DNA_BASE = 4;
		this.MAX_NEURONS = 255;
		this.MAX_CONNECTIONS = 255;
		this.NEURON_DATA_LENGTH = 10;
		this.CONNECTION_DATA_LENGTH = 10;
	
		this.#NEURON_TYPES = 0; // Set from neuron.js
		this.NEURON_TOTAL_LENGTH = -1; // Calculated
		this.NEURON_TYPE_LENGTH = -1; // Calculated
		this.CONNECTION_TOTAL_LENGTH = -1; // Calculated
		this.CONNECTION_INDEX_LENGTH = -1; // Calculated
		this.NEURON_INDEX_LENGTH = -1; // Calculated
	
		this.NEURON_DATA_MIDDLE = -1; // Calculated
	
		this.MAXIMUM_MOVING_DISTANCE = 0.1;
	
		this.updateNeuronTypeCount( this.#NEURON_TYPES );
	}

	get NEURON_TYPES () {
		return this.#NEURON_TYPES;
	}

	set NEURON_TYPES ( count ) {
		this.updateNeuronTypeCount( count );
	}

	updateNeuronTypeCount ( count ) {
		this.#NEURON_TYPES = count;
		this.NEURON_TYPE_LENGTH = this.NEURON_TYPES.toString(4).length;
		this.NEURON_TOTAL_LENGTH = this.NEURON_TYPE_LENGTH + this.NEURON_DATA_LENGTH;
		this.NEURON_INDEX_LENGTH = this.MAX_NEURONS.toString(4).length;
		this.CONNECTION_INDEX_LENGTH = this.MAX_CONNECTIONS.toString(4).length;
		this.CONNECTION_TOTAL_LENGTH = this.CONNECTION_INDEX_LENGTH * 2 + this.CONNECTION_DATA_LENGTH;
		this.NEURON_DATA_MIDDLE = Math.pow( 2, ( this.NEURON_TOTAL_LENGTH - 2 ) * 2 - 1 );
	}
}

const Constants = new ConstantsClass();
export default Constants;