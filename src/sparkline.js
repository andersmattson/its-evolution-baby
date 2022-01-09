function getY(max, height, diff, value) {
	if (isNaN(height - (value * height / max) + diff)) {
		return 0;
	}
	return parseFloat((height - (value * height / max) + diff).toFixed(2));
}

function removeChildren(svg) {
	[...svg.querySelectorAll("*")].forEach(element => svg.removeChild(element));
}

function buildElement(tag, attrs) {
	const element = document.createElementNS("http://www.w3.org/2000/svg", tag);

	for (let name in attrs) {
		element.setAttribute(name, attrs[name]);
	}

	return element;
}

export function sparkline(svg, entries, options) {
	removeChildren(svg);

	if (entries.length <= 1) {
		return;
	}

	options = options || {};

	// Define how big should be the spot area.
	const spotRadius = options.spotRadius || 1;
	const spotDiameter = spotRadius * 2;

	// Get the stroke width; this is used to compute the
	// rendering offset.
	const strokeWidth = parseFloat(svg.attributes["stroke-width"].value);

	// The rendering width will account for the spot size.
	const width = parseFloat(svg.attributes.width.value) - spotDiameter * 2;

	// Get the SVG element's full height.
	// This is used
	const fullHeight = parseFloat(svg.attributes.height.value);

	// The rendering height accounts for stroke width and spot size.
	const height = fullHeight - (strokeWidth * 2) - spotDiameter;

	// The maximum value. This is used to calculate the Y coord of
	// each sparkline datapoint.
	const max = options.max || Math.max(...entries) || 100;

	// Cache the last item index.
	const lastItemIndex = entries.length - 1;

	// Calculate the X coord base step.
	const offset = width / lastItemIndex;

	// Hold the line coordinates.
	const pathY = getY(max, height, strokeWidth + spotRadius, entries[0]);
	let pathCoords = `M${spotDiameter} ${pathY}`;

	entries.forEach((value, index) => {
		const x = index * offset + spotDiameter;
		const y = getY(max, height, strokeWidth + spotRadius, value);
		pathCoords += ` L ${x} ${y}`;
	});

	const path = buildElement("path", {
		class: "sparkline--line",
		d: pathCoords,
		stroke: "black",
		fill: "none"
	});

	svg.appendChild(path);

}

export default sparkline;