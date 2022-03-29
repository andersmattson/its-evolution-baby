
class Target {

	elem;
	#interactive = false;
	#environment = null;

	#isDragged = false;
	#dragStartCoords;
	#dragStartXY;

	area = 0;

	constructor ( environment, x, y, radius, color ) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.#environment = environment;

		this.area = Math.PI * this.radius * this.radius;

		this.render();

		this.elem.addEventListener( 'mousedown', this.onMouseDown.bind( this ) );
		this.elem.addEventListener( 'mouseup', this.onMouseUp.bind( this ) );
		this.elem.addEventListener( 'mousemove', this.onMouseMove.bind( this ) );

		this.setPosition( x, y );
		this.updateEnvironmentPosition();
	}

	render () {

		if( !this.elem ){
			this.elem = document.createElement( 'div' )
			this.elem.className = 'target';
			this.elem.style.position = 'absolute';
			this.elem.style.borderRadius = '50%';
		};

		this.elem.style.backgroundColor = this.color;
		this.elem.style.left = this.x + 'px';
		this.elem.style.top = this.y + 'px';
		this.elem.style.width = ( this.radius * 2 * this.#environment.renderScale.x / this.#environment.renderScale.xRatio ) + 'px';
		this.elem.style.height = ( this.radius * 2 * this.#environment.renderScale.y / this.#environment.renderScale.yRatio ) + 'px';

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

	step( { iteration, render, obstacleMap, obstacleGridSize } ) {
		if( iteration === 0 ){
			let x, y;
			let redo = true;

			while ( redo ) {
				redo = false;
				x = ( 2 * Math.random() - 1 ) * this.#environment.renderScale.xRatio;
				y = ( 2 * Math.random() - 1 ) * this.#environment.renderScale.yRatio;

				for( let _x = x - this.radius - obstacleGridSize; _x < x + this.radius + obstacleGridSize; _x += obstacleGridSize ){
					for( let _y = y - this.radius - obstacleGridSize; _y < y + this.radius + obstacleGridSize; _y += obstacleGridSize ){
						let obstacleId = Math.round( _x / obstacleGridSize ) + '_' + Math.round( _y / obstacleGridSize );
						if( obstacleMap[obstacleId] ){
							redo = true;
							break;
						}
					}
				}
				//console.log( redo, obstacleGridSize );
			}

			this.setPosition( x, y );

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