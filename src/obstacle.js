import Constants from "./constants";

class Obstacle {

	x;
	y;
	#environment;
	elem;
	id;
	position;
	gridPosition;
	radius;

	constructor ( environment, x, y ) {
		this.#environment = environment;
		this.x = x;
		this.y = y;
		this.position = this.#environment.pixelPosition( { 
			x: this.x * this.#environment.obstacleGridSize, 
			y: this.y * this.#environment.obstacleGridSize 
		} );
		this.gridPosition = {
			x: this.x * this.#environment.obstacleGridSize,
			y: this.y * this.#environment.obstacleGridSize
		};
		this.radius = this.#environment.obstacleGridSize / 2 * Constants.OBSTACLE_APPROX_RADIUS;
		this.id = this.x + '_' + this.y;
		this.render();
	}

	render () {

		if( !this.elem ){
			this.elem = document.createElement( 'div' )
			this.elem.className = 'obstacle';
			this.elem.style.position = 'absolute';
		};

		let w = this.#environment.renderScale.x / this.#environment.renderScale.xRatio * this.#environment.obstacleGridSize;
		let h = this.#environment.renderScale.y / this.#environment.renderScale.yRatio * this.#environment.obstacleGridSize;

		this.elem.style.backgroundColor = '#000';
		this.elem.style.left = (this.position.x-w/2) + 'px';
		this.elem.style.top = (this.position.y-h/2) + 'px';
		this.elem.style.width = w + 'px';
		this.elem.style.height = h + 'px';
	}

	getElement () {
		return this.elem;
	}

	distance ( position ) {
		let x = position.x - this.x;
		let y = position.y - this.y;
		return Math.sqrt( x * x + y * y );
	}

}

export default Obstacle;