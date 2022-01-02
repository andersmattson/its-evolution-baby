
class Target {

	elem;
	#interactive = false;
	#environment = null;

	#isDragged = false;
	#dragStartCoords;
	#dragStartXY;

	constructor ( environment, x, y, radius, color ) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.#environment = environment;

		this.elem = document.createElement( 'div' );
		this.elem.className = 'target';
		this.elem.style.backgroundColor = color;
		this.elem.style.borderRadius = '50%';
		this.elem.style.position = 'absolute';
		this.elem.addEventListener( 'mousedown', this.onMouseDown.bind( this ) );
		this.elem.addEventListener( 'mouseup', this.onMouseUp.bind( this ) );
		this.elem.addEventListener( 'mousemove', this.onMouseMove.bind( this ) );

		this.setPosition( x, y );
		this.updateEnvironmentPosition();
	}

	onMouseDown( e ) {
		if ( this.#interactive ) {
			this.#isDragged = true;
			this.#dragStartCoords = {
				x: e.clientX,
				y: e.clientY,
			};
			this.#dragStartXY = {
				x: this.x,
				y: this.y,
			};
		}
	}

	onMouseUp( e ) {
		this.#isDragged = false;
	}

	onMouseMove( e ) {
		if ( this.#interactive && this.#isDragged ) {

			let deltaX = e.clientX - this.#dragStartCoords.x;
			let deltaY = e.clientY - this.#dragStartCoords.y;

			this.setPosition( this.#dragStartXY.x + deltaX / this.#environment.renderScale.x, this.#dragStartXY.y + deltaY / this.#environment.renderScale.y );
			this.updateEnvironmentPosition();
		}
	}
			

	hit ( x, y ) {
		return this.distance( x, y ) == 0;
	}

	distance ( position ) {
		let dx = position.x - this.x;
		let dy = position.y - this.y;
		return Math.max( 0, Math.sqrt( dx * dx + dy * dy ) - this.radius );
	}

	setPosition ( x, y ) {
		this.x = Math.min( this.#environment.renderScale.xRatio - this.radius, Math.max( -this.#environment.renderScale.xRatio + this.radius, x ) );
		this.y = Math.min( this.#environment.renderScale.yRatio - this.radius, Math.max( -this.#environment.renderScale.yRatio + this.radius, y ) );
	}

	step( { iteration, render } ) {
		if( iteration === 0 ){
			this.setPosition( ( 2 * Math.random() - 1 ) * this.#environment.renderScale.xRatio, ( 2 * Math.random() - 1 ) * this.#environment.renderScale.yRatio );

			if( render ){
				this.updateEnvironmentPosition();
			}
		}
	}

	updateEnvironmentPosition() {
		let position = this.#environment.pixelPosition( {
			x: this.x - this.radius,
			y: this.y - this.radius,
		} );
		this.elem.style.left = position.x + 'px';
		this.elem.style.top = position.y + 'px';
	}

	testFunction( network ) {
		return this.distance( network.position ) == 0 ? 
			(2 + ( network.totalDistanceTraveled < 5 ? 1 : 0 ) ) : 
			0;
	}

	getElement() {
		return this.elem;
	}

	setInteractive( bool ) {
		this.#interactive = bool;
	}

}

export default Target;