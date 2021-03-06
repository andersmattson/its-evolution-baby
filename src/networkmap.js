import * as d3 from "d3";
import { NeuronDefinitions, NeuronTypes } from "./neuron.js";

var map = document.querySelector(".networkmap");
var desc = document.querySelector(".networkmap .desc");

var svg = d3.select(".networkmapSvg"),
	width = +map.offsetWidth,
	height = +map.offsetHeight,
	radius = 20;

var simulation = d3.forceSimulation()
	.force("link", d3.forceLink().distance(0).id(function (d) { return d.id; }))
	.force("charge", d3.forceManyBody().strength(50))
	.force("center", d3.forceCenter(width / 2, height / 2))
	.force("collision", d3.forceCollide().radius(radius * 2));

export function displayNetworkMap( network ) {
	map.classList.remove("hidden");
	
	desc.innerHTML = `
		Target visible: ${network.targetVisible}<br>
	`;
	
	svg = d3.select(".networkmapSvg");
	width = +map.offsetWidth;
	height = +map.offsetHeight;
	radius = 20;
	simulation = d3.forceSimulation()
	.force("link", d3.forceLink().distance(0).id(function (d) { return d.id; }))
	.force("charge", d3.forceManyBody().strength(50))
	.force("center", d3.forceCenter(width / 2, height / 2))
	.force("collision", d3.forceCollide().radius(radius * 2));
	generateMapFromNetwork( network );
}

export function generateMapFromNetwork ( network ) {
	let data = getMapData(network);
	resetMap();
	renderMap(data);
	simulation.restart();
}

function getMapData ( network ) {
	const data = {
		nodes: [],
		links: []
	}

	network.connectedNeurons.forEach((neuron) => {
		let node = {
			id: neuron.id,
			name: NeuronDefinitions[neuron.type].shortName,
			group: NeuronDefinitions[neuron.type].type
		};

		data.nodes.push(node);
		neuron.inputs.forEach((input) => {
			data.links.push({
				source: input.input.id,
				target: neuron.id,
				value: 1
			});
		});
	});

	return data;
}

function color(node, text = false) {
	switch (node.group) {
		case NeuronTypes.ACTOR:
			return text ? "#ffffff" : "#0000ff";
		case NeuronTypes.SYNAPSE:
			return text ? "#000000" : "#00ff00";
		case NeuronTypes.GENERATOR:
			return text ? "#000000" : "#00ffff";
		case NeuronTypes.SENSORY:
			return text ? "#000000" : "#ffff00";
	}
}

function renderMap(graph) {

	let link = svg.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(graph.links)
		.enter().append("line")
		.attr("stroke-width", function (d) { return Math.sqrt(Math.abs(d.value)); })
		.attr("stroke", "#aaa");

	let node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("g")
		.data(graph.nodes)
		.enter()
		.append("circle")
		.attr("r", radius)
		.attr("fill", function (d) { return color(d); })
		.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended));

	var label = svg.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(graph.nodes)
		.enter().append("text")
		.attr("class", "label")
		.attr("fill", function (d) { return color(d, true); })
		.attr("text-anchor", "middle")
		.text(function (d) { return d.name; });

	simulation
		.nodes(graph.nodes)
		.on("tick", ticked);
	//console.log( graph.links );
	simulation.force("link")
		.links(graph.links);

	function ticked() {
		link
			.attr("x1", function (d) { return Math.max(radius,Math.min(d.source.x, width-radius)); })
			.attr("y1", function (d) { return Math.max(radius,Math.min(d.source.y, height-radius)); })
			.attr("x2", function (d) { return Math.max(radius,Math.min(d.target.x, width-radius)); })
			.attr("y2", function (d) { return Math.max(radius,Math.min(d.target.y, height-radius)); });

		node
			.attr("cx", function (d) { return Math.max(radius,Math.min(d.x, width-radius)); })
			.attr("cy", function (d) { return Math.max(radius,Math.min(d.y, height-radius)); });
		
		label
			.attr("x", function (d) { return Math.max(radius,Math.min(d.x, width-radius)); })
			.attr("y", function (d) { return Math.max(radius,Math.min(d.y, height-radius)) + 3; });
	}
};

function dragstarted(event, d) {
	if (!event.active) simulation.alphaTarget(0.3).restart();
	d.fx = d.x, d.fy = d.y;
}

function dragged(event, d) {
	d.fx = event.x, d.fy = event.y;
}

function dragended(event, d) {
	if (!event.active) simulation.alphaTarget(0);
	d.fx = null, d.fy = null;
}

export function resetMap() {
	simulation.stop();
	svg.selectAll("*").remove();
}