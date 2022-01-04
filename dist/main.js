(()=>{"use strict";function t(t,e,n,i){return isNaN(e-i*e/t+n)?0:parseFloat((e-i*e/t+n).toFixed(2))}function e(e,n,i){if(function(t){[...t.querySelectorAll("*")].forEach((e=>t.removeChild(e)))}(e),n.length<=1)return;const s=(i=i||{}).spotRadius||1,r=2*s,a=parseFloat(e.attributes["stroke-width"].value),o=parseFloat(e.attributes.width.value)-2*r,h=parseFloat(e.attributes.height.value)-2*a-r,l=i.max||Math.max(...n)||100,N=o/(n.length-1),u=t(l,h,a+s,n[0]);let d=`M${r} ${u}`;n.forEach(((e,n)=>{const i=n*N+r,o=t(l,h,a+s,e);d+=` L ${i} ${o}`}));const c=function(t,e){const n=document.createElementNS("http://www.w3.org/2000/svg","path");for(let t in e)n.setAttribute(t,e[t]);return n}(0,{class:"sparkline--line",d,stroke:"black",fill:"none"});e.appendChild(c)}const n=new class{DNA_BASE=4;MAX_NEURONS=255;MAX_CONNECTIONS=255;NEURON_DATA_LENGTH=10;CONNECTION_DATA_LENGTH=10;#t=0;NEURON_TOTAL_LENGTH=-1;NEURON_TYPE_LENGTH=-1;CONNECTION_TOTAL_LENGTH=-1;CONNECTION_INDEX_LENGTH=-1;NEURON_INDEX_LENGTH=-1;NEURON_DATA_MIDDLE=-1;MAXIMUM_MOVING_DISTANCE=.001;constructor(){this.DNA_BASE=4,this.MAX_NEURONS=255,this.MAX_CONNECTIONS=255,this.NEURON_DATA_LENGTH=10,this.CONNECTION_DATA_LENGTH=10,this.#t=0,this.NEURON_TOTAL_LENGTH=-1,this.NEURON_TYPE_LENGTH=-1,this.CONNECTION_TOTAL_LENGTH=-1,this.CONNECTION_INDEX_LENGTH=-1,this.NEURON_INDEX_LENGTH=-1,this.NEURON_DATA_MIDDLE=Math.pow(4,this.NEURON_DATA_LENGTH)/2,this.MAXIMUM_MOVING_DISTANCE=.05,this.updateNeuronTypeCount(this.#t)}get NEURON_TYPES(){return this.#t}set NEURON_TYPES(t){this.updateNeuronTypeCount(t)}updateNeuronTypeCount(t){this.#t=t,this.NEURON_TYPE_LENGTH=this.NEURON_TYPES.toString(this.DNA_BASE).length,this.NEURON_TOTAL_LENGTH=this.NEURON_TYPE_LENGTH+this.NEURON_DATA_LENGTH,this.NEURON_INDEX_LENGTH=this.MAX_NEURONS.toString(this.DNA_BASE).length,this.CONNECTION_INDEX_LENGTH=this.MAX_CONNECTIONS.toString(this.DNA_BASE).length,this.CONNECTION_TOTAL_LENGTH=2*this.CONNECTION_INDEX_LENGTH+this.CONNECTION_DATA_LENGTH}},i={SENSORY:1,SYNAPSE:2,ACTOR:4,GENERATOR:8,INPUTS:6,OUTPUTS:11},s=Object.keys(i).reduce(((t,e)=>(t[i[e]]=e,t)),{}),r=[],a=[],o={};function h(t,e=i.SYNAPSE,s={},a="",h=""){if(o[a])throw new Error(`Neuron definition with name '${a}' already exists.`);t.type=e,t.affects=s,t.neuronName=a,t.description=h,r.push(t),o[a]=t,n.NEURON_TYPES=r.length}function l(t,e){t.iteration++;let n,i=t.selfWeight*t.value;for(let e=0;e<t.inputs.length;e++)i+=t.inputs[e].input.value*t.inputs[e].weight;i+=t.selfWeight*t.value,n=i/(t.inputs.length+1),t.value=r[t.type]({time:e.iteration,position:e.position,distanceToTarget:e.distanceToTarget,targetDirectionX:e.targetDirectionX,targetDirectionY:e.targetDirectionY,initialValue:t.initialValue,weightedInput:i,weightedAverage:n,value:t.value,lastWeightedInput:t.lastWeightedInput,lastWeightedAverage:t.lastWeightedAverage}),t.lastWeightedInput=i,t.lastWeightedAverage=n}function N({type:t,initialValue:e}){let n=t||0,i=e||0;return{isNeuron:!0,type:n,initialValue:i,value:i,iteration:0,neuronType:r[n].type,inputs:[],selfWeight:0,affects:r[n].affects,lastWeightedInput:0,lastWeightedAverage:0}}function u(t=0,e=1){return Math.floor(Math.random()*(e-t+1))+t}function d(t,e){let i=t.toString(n.DNA_BASE);return i.length>e?(n.DNA_BASE-1+"").repeat(e):"0".repeat(e-i.length)+i}function c(t,e){let i="",s=t.toString(n.DNA_BASE),a=e.toString(n.DNA_BASE);i+=d(s,n.NEURON_INDEX_LENGTH),i+=d(a,n.CONNECTION_INDEX_LENGTH);for(let e=0;e<t;e++)i+=d(u(0,r.length-1).toString(n.DNA_BASE),n.NEURON_TYPE_LENGTH),i+=d(u(0,Math.pow(n.DNA_BASE,8)).toString(n.DNA_BASE),n.NEURON_DATA_LENGTH);for(let s=0;s<e;s++)i+=d(u(0,t-1).toString(n.DNA_BASE),n.NEURON_INDEX_LENGTH),i+=d(u(0,t-1).toString(n.DNA_BASE),n.NEURON_INDEX_LENGTH),i+=d(u(0,Math.pow(n.DNA_BASE,8)).toString(n.DNA_BASE),n.CONNECTION_DATA_LENGTH);return i}function E(t,e){let i={neurons:[],_connectedNeurons:new Set,connectedNeurons:[],iteration:0,position:{x:2*(Math.random()-.5)*e.xRatio,y:2*(Math.random()-.5)*e.yRatio},direction:2*Math.random()*Math.PI,speed:0,initialPosition:{x:0,y:0},renderScale:{x:1,y:1,xRatio:1,yRatio:1},dna:t,totalDistanceTraveled:0,renderScale:e};return i.initialPosition={...i.position},function(t,e){let i=parseInt(e.substring(0,n.NEURON_INDEX_LENGTH),n.DNA_BASE),s=parseInt(e.substring(n.NEURON_INDEX_LENGTH,n.NEURON_INDEX_LENGTH+n.CONNECTION_INDEX_LENGTH),n.DNA_BASE);for(let s=0;s<i;s++){let i=n.NEURON_INDEX_LENGTH+n.CONNECTION_INDEX_LENGTH+s*n.NEURON_TOTAL_LENGTH,a=parseInt(e.substring(i,i+n.NEURON_TYPE_LENGTH),n.DNA_BASE),o=(parseInt(e.substring(i+n.NEURON_TYPE_LENGTH,i+n.NEURON_TOTAL_LENGTH),n.DNA_BASE)-n.NEURON_DATA_MIDDLE)/n.NEURON_DATA_MIDDLE;a<r.length&&t.neurons.push(N({initialValue:o,type:a}))}for(let r=0;r<s;r++){let s=n.NEURON_INDEX_LENGTH+n.CONNECTION_INDEX_LENGTH+i*n.NEURON_TOTAL_LENGTH+r*n.CONNECTION_TOTAL_LENGTH,a=parseInt(e.substring(s,s+n.NEURON_INDEX_LENGTH),n.DNA_BASE),o=parseInt(e.substring(s+n.NEURON_INDEX_LENGTH,s+n.NEURON_INDEX_LENGTH+n.CONNECTION_INDEX_LENGTH),n.DNA_BASE),h=(parseInt(e.substring(s+n.NEURON_INDEX_LENGTH+n.CONNECTION_INDEX_LENGTH,s+n.CONNECTION_TOTAL_LENGTH),n.DNA_BASE)-n.NEURON_DATA_MIDDLE)/n.NEURON_DATA_MIDDLE;t.neurons[a]&&t.neurons[o]&&p(t,t.neurons[a],t.neurons[o],h)}}(i,t),i}function p(t,e,n,s=1){if(e.isNeuron&&n.isNeuron){const r=function(t,e,n=1){return e===t?0!=(i.INPUTS&t.neuronType)&&0!=(i.OUTPUTS&t.neuronType)&&(t.selfWeight=n,!0):0!=(i.OUTPUTS&e.neuronType)&&0!=(i.INPUTS&t.neuronType)&&(t.inputs.push({input:e,weight:n}),!0)}(n,e,s);return r&&(t._connectedNeurons.has(e)||(t._connectedNeurons.add(e),t.connectedNeurons.push(e)),t._connectedNeurons.has(n)||(t._connectedNeurons.add(n),t.connectedNeurons.push(n))),r}return!1}function g(t,e=.01){let i=Math.random(),s=t.dna;if(i<e){let e=u(n.NEURON_INDEX_LENGTH+n.CONNECTION_INDEX_LENGTH,t.dna.length-1);s=t.dna.substring(0,e-1)+u(0,n.DNA_BASE-1)+t.dna.substring(e)}return E(s,t.renderScale)}function T(t,e){t.iteration++;let i=t.position.x,s=t.position.y,r=0,a=0,o=1/0,h={x:0,y:0};for(let n=0;n<e.length;n++){let i=e[n].distance(t.position);i<o&&(o=i,h={x:e[n].x-t.position.x,y:e[n].y-t.position.y})}h={x:h.x>0?1:-1,y:h.y>0?1:-1};for(let e=0,n=t.connectedNeurons.length;e<n;e++)l(t.connectedNeurons[e],{iteration:t.iteration,position:t.position,direction:t.direction,speed:t.speed,distanceToTarget:o,targetDirectionX:h.x,targetDirectionY:h.y}),t.connectedNeurons[e].affects.x&&(r+=t.connectedNeurons[e].value),t.connectedNeurons[e].affects.y&&(a+=t.connectedNeurons[e].value),t.connectedNeurons[e].affects.direction&&(t.direction+=t.connectedNeurons[e].value),t.connectedNeurons[e].affects.speed&&(t.speed+=t.connectedNeurons[e].value);r+=t.speed*Math.cos(t.direction),a+=t.speed*Math.sin(t.direction),t.position.x+=r>=0?Math.min(r,n.MAXIMUM_MOVING_DISTANCE):Math.max(r,-n.MAXIMUM_MOVING_DISTANCE),t.position.y+=a>=0?Math.min(a,n.MAXIMUM_MOVING_DISTANCE):Math.max(a,-n.MAXIMUM_MOVING_DISTANCE),t.position.x=Math.min(Math.max(t.position.x,-t.renderScale.xRatio),t.renderScale.xRatio),t.position.y=Math.min(Math.max(t.position.y,-t.renderScale.yRatio),t.renderScale.yRatio),0===r&&0===a||(t.totalDistanceTraveled+=Math.sqrt(Math.pow(t.position.x-i,2)+Math.pow(t.position.y-s,2)))}h((function(t){return t.weightedInput}),i.SYNAPSE,{},"WeightedSum","weightedInput"),h((function(t){return t.weightedAverage}),i.SYNAPSE,{},"WeightedAverage","weightedAverage"),h((function(t){return Math.tanh(t.weightedInput)}),i.SYNAPSE,{},"Tanh","tanh( weightedInput )"),h((function(t){return t.weightedInput/(1+t.time)}),i.SYNAPSE,{},"WeightedInputDecay","weightedInput / ( 1 + time )"),h((function(t){return t.weightedInput-t.lastWeightedInput}),i.SYNAPSE,{},"WeightedInputDerivative","weightedInput - lastWeightedInput"),h((function(t){return Math.sin(t.time*t.initialValue)}),i.GENERATOR,{},"Oscillator","sin( time * initialValue )"),h((function(t){return t.initialValue/(1+t.time)}),i.GENERATOR,{},"Decay","initialValue / ( 1 + time )"),h((function(t){return Math.exp(t.time*t.initialValue)}),i.GENERATOR,{},"Exponential","exp( time * initialValue )"),h((function(t){return t.time*t.initialValue}),i.GENERATOR,{},"Growth","time * initialValue"),h((function(t){return t.initialValue}),i.GENERATOR,{},"Constant","initialValue"),h((function(t){return Math.tanh(t.weightedInput)*n.MAXIMUM_MOVING_DISTANCE}),i.ACTOR,{x:!0},"HorizontalMover","tanh( weightedInput ) * MAX_DISTANCE"),h((function(t){return Math.tanh(t.weightedInput)*n.MAXIMUM_MOVING_DISTANCE}),i.ACTOR,{speed:!0},"Speed","tanh( weightedInput ) * MAX_DISTANCE"),h((function(t){return t.position.x}),i.SENSORY,{},"PositionX","position.x"),h((function(t){return t.position.y}),i.SENSORY,{},"PositionY","position.y"),h((function(t){return 1/(1+t.distanceToTarget)}),i.SENSORY,{},"InvertedTargetDistance","1 / ( 1 + distanceToTarget )"),h((function(t){return t.targetDirectionX}),i.SENSORY,{},"TargetDirectionX","targetDirectionX"),h((function(t){return t.targetDirectionY}),i.SENSORY,{},"TargetDirectionY","targetDirectionY");function _(t){return document.querySelector(t)}let S=_(".neuron_list");Object.keys(o).forEach((t=>{let e=o[t],n=document.createElement("div");n.classList.add("neuronDefinition"),n.innerHTML=`<input type="checkbox" value="${t}" class="${t}" checked />\n\t<div>\t\n\t\t<div class="neuronDefinitionName">${t}</div>\n\t\t<div class="neuronDefinitionType">Type: ${s[e.type]}, affects: ${Object.keys(e.affects).join()||"none"}</div>\n\t\t<div class="neuronDefinitionDescription">${o[t].description}</div>\n\t</div>`,S.appendChild(n)})),_(".apply_neurons").addEventListener("click",(t=>{confirm("This will reset the current simulation!")&&((".neuronDefinition",document.querySelectorAll(".neuronDefinition")).forEach((t=>{let e=t.querySelector("input");e.checked?function(t){let e=a.findIndex((e=>e.neuronName===t));-1!==e&&(r.push(a[e]),a.splice(e,1),n.NEURON_TYPES=r.length)}(e.value):function(t){let e=r.findIndex((e=>e.neuronName===t));-1!==e&&(a.push(r[e]),r.splice(e,1),n.NEURON_TYPES=r.length)}(e.value)})),_(".active_neuron_types").innerText=r.length,_(".disabled_neuron_types").innerText=a.length+r.length,A.reset())})),_(".hide_neurons").addEventListener("click",(()=>{_(".neuron_list").classList.toggle("hidden")})),_(".display_neurons").addEventListener("click",(()=>{_(".neuron_list").classList.toggle("hidden")}));let m=new Array(100).fill(0),v={spotRadius:0,max:100};e(_(".sparkline"),m,v);const A=new class extends class{#e={};addEventListener(t,e){this.#e[t]||(this.#e[t]=[]),this.#e[t].push(e)}removeEventListener(t,e){this.#e[t].splice(this.#e[t].indexOf(e),1)}dispatchEvent(t,e){this.#e[t]&&this.#e[t].length&&this.#e[t].forEach((t=>{t.bind(this)(e)}))}}{#n=[];#i=[];renderScale={x:1,y:1,xRatio:1,yRatio:1};#s={x:-2,y:-2};#r;#a=null;#o=0;#h=0;#l=0;#N=0;#u=0;#d=100;#c=100;#E=.01;#p=0;#g=!1;#T=10;#_=10;#S=!1;#m=!1;#v=!1;#A=[];#D=!1;#O=null;#I=null;constructor({canvas:t,maxIterations:e,numNetworks:n,mutationRate:i,waitForStart:s,numNeurons:r,numConnections:a,randomInitSpawn:o,render:h,survivorsOnly:l}){super(),this.#r=t,this.renderScale={x:t.offsetWidth/2,y:t.offsetHeight/2},this.renderScale.x>this.renderScale.y?(this.renderScale.xRatio=this.renderScale.x/this.renderScale.y,this.renderScale.yRatio=1,this.renderScale.pixelScale=this.renderScale.y):(this.renderScale.xRatio=1,this.renderScale.yRatio=this.renderScale.y/this.renderScale.x,this.renderScale.pixelScale=this.renderScale.x),this.#d=e||100,this.#c=n||100,this.#E=i||.01,this.#g=!0,this.#T=r||10,this.#_=a||10,this.#p=this.#c,this.#S=o||!1,this.#m=h||!0,this.#v=l||!1,this.#o=0,this.#u=0,this.initRepresentation(),this.initRandomNetworks(),requestAnimationFrame(this.renderNetworks.bind(this)),s||this.togglePause()}initRepresentation(){this.#i=[];for(let t=0;t<this.#c;t++){let e=document.createElement("div");e.classList.add("network"),e.classList.add(`rep${t}`),this.#r.appendChild(e),this.#i.push(e)}}getRep(t){return this.#i[t]}addNetwork(t){if(this.#n.push(t),this.#m){let e=this.getRep(this.#n.length-1),n=this.pixelPosition(t.position);e.style.display="block",e.style.left=n.x+"px",e.style.top=n.x+"px"}}clearNetworks(){let t=0;for(;this.#n.length;)this.getRep(t).style.display="none",this.#n.shift(),t++}renderNetworks(){for(let t=0;t<this.#n.length;t++){let e=this.pixelPosition(this.#n[t].position),n=this.getRep(t);n.style.left=e.x+"px",n.style.top=e.y+"px",n.style.display="block"}this.#m&&requestAnimationFrame(this.renderNetworks.bind(this))}initRandomNetworks(){this.clearNetworks(),this.#h=0,this.#o++;let t=c(this.#T,this.#_);this.#O=t;for(let e=0;e<this.#c;e++)this.#S&&(t=c(this.#T,this.#_)),this.addNetwork(E(t,this.renderScale))}initNetworksFromDnaSequence(t){this.reset(),this.#O=t.replace(/A/g,"0").replace(/C/g,"1").replace(/G/g,"2").replace(/T/g,"3");for(let t=0;t<this.#c;t++)this.addNetwork(E(this.#O,this.renderScale))}regenerateNetworks(){this.#l=0,this.#h++;let t=[];this.#p=0;let e=[];for(this.#n.forEach(((t,n)=>{let i=this.#A.reduce(((e,n)=>e+n.testFunction(t)),0);i&&(this.#p++,this.#I=t.dna);let s=i+(this.#v?0:1);for(let t=0;t<s;t++)e.push(n)}));t.length<this.#c;)t.push(g(this.#n[e[Math.floor(Math.random()*e.length)]],this.#E));this.clearNetworks(),this.#n=t}step(){this.#A.forEach((t=>{t.step({iteration:this.#l,render:this.#m,renderScale:this.renderScale})}));for(let t=0,e=this.#n.length;t<e;t++)T(this.#n[t],this.#A);this.#l++}start(){0===this.#n.length?this.initRandomNetworks():this.regenerateNetworks(),this.#N=Date.now(),this.#a=setInterval((()=>{this.step(),this.#l>=this.#d&&!this.#D&&this.stop()}),this.#u)}stop(){clearInterval(this.#a);const t=this.stats;t.survivalRate=(100*this.#p/this.#c).toFixed(2),!this.#g&&this.#n.length&&this.start(),this.dispatchEvent("generation",t)}addTarget(t){this.#A.push(t),this.#r.parentNode.appendChild(t.getElement()),t.getElement().style.width=2*t.radius*this.renderScale.x/this.renderScale.xRatio+"px",t.getElement().style.height=2*t.radius*this.renderScale.y/this.renderScale.yRatio+"px"}togglePause(t){return this.#g=void 0===t?!this.#g:t,this.#g?this.dispatchEvent("pause",!0):(this.start(),this.dispatchEvent("pause",!1)),this.#g}toggleRender(){return this.#m=!this.#m,this.#m&&this.renderNetworks(),this.#m}toggleInteractiveMode(){this.#D=!this.#D,this.#A.forEach((t=>{t.setInteractive(this.#D)}))}updateStepDelay(t){this.#u=t||0,clearInterval(this.#a),this.#a=setInterval((()=>{this.step(),this.#l>=this.#d&&!this.#D&&this.stop()}),this.#u)}pixelPosition(t){return{x:this.renderScale.x+t.x*this.renderScale.pixelScale,y:this.renderScale.y+t.y*this.renderScale.pixelScale}}reset(){let t=this.#g;this.togglePause(!0),this.clearNetworks(),clearInterval(this.#a),this.#n.length=0,this.#l=0,this.#h=0,this.#o=0,this.#p=0,this.initRandomNetworks(),this.togglePause(t)}get size(){return this.#n.length}get stats(){let t=0,e=0,n=0,i=0;return this.#n.forEach((s=>{s.position.x!==s.initialPosition.x&&s.position.y!==s.initialPosition.y&&e++,t+=s.connectedNeurons.length,n+=s.totalDistanceTraveled,i+=s.dna.length})),{generation:this.#h,survivalRate:1*(100*this.#n.length/this.#p).toFixed(2),size:this.#n.length,connectedNeurons:t,connectedNeuronsAvg:1*(t/this.#n.length).toFixed(2),outputs:0,hasMoved2D:e,avgDistanceTraveled:1*(n/this.#n.length).toFixed(2),avgDnaLength:1*(i/this.#n.length).toFixed(2),totalDnaLength:i,duration:Date.now()-this.#N,currentDNA:(s=this.#I,s.replace(/0/g,"A").replace(/1/g,"C").replace(/2/g,"G").replace(/3/g,"T"))};var s}get stepDelay(){return this.#u}get mutationRate(){return this.#E}set mutationRate(t){this.#E=Math.min(1,Math.max(0,t))}get numNeurons(){return this.#T}set numNeurons(t){this.#T=parseInt(t),this.reset()}get numConnections(){return this.#_}set numConnections(t){this.#_=parseInt(t),this.reset()}}({canvas:_(".environment"),numNetworks:400,numNeurons:128,numConnections:128,mutationRate:.5,waitForStart:!0,randomInitSpawn:!0,survivorsOnly:!1});A.addTarget(new class{elem;#R=!1;#f=null;#y=!1;#w;#M;constructor(t,e,n,i,s){this.x=e,this.y=n,this.radius=i,this.color=s,this.#f=t,this.elem=document.createElement("div"),this.elem.className="target",this.elem.style.backgroundColor=s,this.elem.style.borderRadius="50%",this.elem.style.position="absolute",this.elem.addEventListener("mousedown",this.onMouseDown.bind(this)),this.elem.addEventListener("mouseup",this.onMouseUp.bind(this)),this.elem.addEventListener("mousemove",this.onMouseMove.bind(this)),this.setPosition(e,n),this.updateEnvironmentPosition()}onMouseDown(t){this.#R&&(this.#y=!0,this.#w={x:t.clientX,y:t.clientY},this.#M={x:this.x,y:this.y})}onMouseUp(t){this.#y=!1}onMouseMove(t){if(this.#R&&this.#y){let e=t.clientX-this.#w.x,n=t.clientY-this.#w.y;this.setPosition(this.#M.x+e/this.#f.renderScale.x,this.#M.y+n/this.#f.renderScale.y),this.updateEnvironmentPosition()}}hit(t,e){return 0==this.distance(t,e)}distance(t){let e=t.x-this.x,n=t.y-this.y;return Math.max(0,Math.sqrt(e*e+n*n)-this.radius)}setPosition(t,e){this.x=Math.min(this.#f.renderScale.xRatio-this.radius,Math.max(-this.#f.renderScale.xRatio+this.radius,t)),this.y=Math.min(this.#f.renderScale.yRatio-this.radius,Math.max(-this.#f.renderScale.yRatio+this.radius,e))}step({iteration:t,render:e}){0===t&&(this.setPosition((2*Math.random()-1)*this.#f.renderScale.xRatio,(2*Math.random()-1)*this.#f.renderScale.yRatio),e&&this.updateEnvironmentPosition())}updateEnvironmentPosition(){let t=this.#f.pixelPosition({x:this.x-this.radius,y:this.y-this.radius});this.elem.style.left=t.x+"px",this.elem.style.top=t.y+"px"}testFunction(t){return 0==this.distance(t.position)?2+(t.totalDistanceTraveled<5?1:0):0}getElement(){return this.elem}setInteractive(t){this.#R=t}}(A,.5,.5,.2,"#ffff00",A.renderScale)),A.addEventListener("generation",(t=>{_(".stats"),["generation","survivalRate","size","connectedNeuronsAvg","connectedNeurons","avgDistanceTraveled","avgDnaLength","duration","currentDNA"].forEach((e=>{_(`.stats .${e}`).innerHTML=t[e]})),m.shift(),m.push(t.survivalRate),e(_(".sparkline"),m,v)})),A.addEventListener("pause",(t=>{_(".pausa").innerHTML=t?"Start":"Pause"})),_(".pausa").addEventListener("click",(()=>A.togglePause())),_(".render").addEventListener("click",(()=>A.toggleRender())),_(".interactive").addEventListener("click",(()=>A.toggleInteractiveMode())),_(".stepDelay").addEventListener("input",(t=>{A.updateStepDelay(t.target.value),_(".speed").innerHTML=A.stepDelay})),_(".mutation_rate").addEventListener("input",(t=>{A.mutationRate=parseInt(t.target.value)/100,_(".mutrate").innerHTML=A.mutationRate.toFixed(2)})),_(".num_neurons").addEventListener("change",(t=>{confirm("This will reset the network.")?A.numNeurons=t.target.value:t.target.value=A.numNeurons,_(".noneurons").innerHTML=A.numNeurons})),_(".num_connections").addEventListener("change",(t=>{confirm("This will reset the network.")?A.numConnections=t.target.value:t.target.value=A.numConnections,_(".noconnections").innerHTML=A.numConnections}))})();