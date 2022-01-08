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

	MAXIMUM_MOVING_DISTANCE = 0.001;
	ANGLE_LIMIT = Math.PI * 4;

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
	
		this.NEURON_DATA_MIDDLE = Math.pow( 4, this.NEURON_DATA_LENGTH ) / 2;
	
		this.MAXIMUM_MOVING_DISTANCE = 0.03;
		this.ANGLE_LIMIT = Math.PI * 4;

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
		this.NEURON_TYPE_LENGTH = this.NEURON_TYPES.toString( this.DNA_BASE ).length;
		this.NEURON_TOTAL_LENGTH = this.NEURON_TYPE_LENGTH + this.NEURON_DATA_LENGTH;
		this.NEURON_INDEX_LENGTH = this.MAX_NEURONS.toString( this.DNA_BASE ).length;
		this.CONNECTION_INDEX_LENGTH = this.MAX_CONNECTIONS.toString( this.DNA_BASE ).length;
		this.CONNECTION_TOTAL_LENGTH = this.CONNECTION_INDEX_LENGTH * 2 + this.CONNECTION_DATA_LENGTH;
	}
}

const Constants = new ConstantsClass();
export default Constants;