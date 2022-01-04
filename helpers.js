function getLineIntersection(p0, p1, p2, p3) { 
	let s1 = {}, s2 = {}; 
	
	s1.x = p1.x - p0.x; 
	s1.y = p1.y - p0.y; 
	s2.x = p3.x - p2.x; 
	s2.y = p3.y - p2.y; 

	let den1 = (-s2.x * s1.y + s1.x * s2.y);
	let den2 = (-s2.x * s1.y + s1.x * s2.y);
	
	if( den1 == 0 || den2 == 0 ){
		return false;
	}

	let s, t; 
	
	s = (-s1_y * (p0.x - p2.x) + s1.x * (p0.y - p2.y)) / den1; 
	t = ( s2_x * (p0.y - p2.y) - s2.y * (p0.x - p2.x)) / den2;
	
	if (s >= 0 && s <= 1 && t >= 0 && t <= 1) { 
		return {
			x: p0.x + (t * s1.x),
			y: p0.y + (t * s1.y)
		};
	} 
	return false;
}

function dnaSequenceToNumbers( sequence ) {
	return sequence.replace( /A/g, '0').replace( /C/g, '1').replace( /G/g, '2').replace( /T/g, '3');
}

function numberToDnaSequence( sequence ) {
	return sequence.replace( /0/g, 'A').replace( /1/g, 'C').replace( /2/g, 'G').replace( /3/g, 'T');
}

export {
	getLineIntersection,
	dnaSequenceToNumbers,
	numberToDnaSequence
}