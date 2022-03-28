
class Obstacle {

	x;
	y;
	#environment;
	elem;
	id;

	constructor ( environment, x, y ) {
		this.#environment = environment;
		this.x = x;
		this.y = y;

		this.id = this.x + '_' + this.y;
		this.render();
	}

	render () {

		if( !this.elem ){
			this.elem = document.createElement( 'div' )
			this.elem.className = 'obstacle';
			this.elem.style.position = 'absolute';
		};

		let w = this.#environment.renderScale.x / this.#environment.renderScale.xRatio * 2 / this.#environment.obstacleResolution;
		let h = this.#environment.renderScale.y / this.#environment.renderScale.yRatio * 2 / this.#environment.obstacleResolution;

		let position = this.#environment.pixelPosition( { x: this.x/this.#environment.obstacleResolution*2, y: this.y/this.#environment.obstacleResolution*2 } );

		this.elem.style.backgroundColor = '#000';
		this.elem.style.left = (position.x-w/2) + 'px';
		this.elem.style.top = (position.y-h/2) + 'px';
		this.elem.style.width = w + 'px';
		this.elem.style.height = h + 'px';
	}

	getElement () {
		return this.elem;
	}

}

export default Obstacle;