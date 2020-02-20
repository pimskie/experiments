const moons = [
	{ planet: 'earth', moons: ['moon'] },
	{ planet: 'mars', moons: ['Deimos', 'Phobos'] },
	{ planet: 'jupiter', moons: ["Adrastea","Aitne","Amalthea","Ananke","Aoede","Arche","Autonoe","Callirrhoe","Callisto","Carme","Carpo","Chaldene","Cyllene","Dia","Eirene","Elara","Erinome","Ersa","Euanthe","Eukelade","Eupheme","Euporie","Europa","Eurydome","Ganymede","Harpalyke","Hegemone","Helike","Hermippe","Herse","Himalia","Io","Iocaste","Isonoe","Jupiter LI","Jupiter LII","Kale","Kallichore","Kalyke","Kore"] },
	{ planet: 'Saturn', moons: ["Aegaeon","Aegir","Albiorix","Anthe","Atlas","Bebhionn","Bergelmir","Bestla","Calypso","Daphnis","Dione","Enceladus","Epimetheus","Erriapus","Farbauti","Fenrir","Fornjot","Greip","Hati","Helene","Hyperion","Hyrrokkin","Iapetus","Ijiraq","Janus","Jarnsaxa","Kari","Kiviuq","Loge","Methone","Mimas","Mundilfari","Narvi","Paaliaq","Pallene","Pan","Pandora","Phoebe","Polydeuces","Prometheus"] },
];

const planets = [
	{'name':'Mercury','color': '#a8aaac', 'mass':0.0553,'diameter':0.383,'density':0.984,'gravity':0.378,'escapeVelocity':0.384,'rotationPeriod':58.8,'lengthofDay':175.9,'distancefromSun':0.387,'perihelion':0.313,'aphelion':0.459,'orbitalPeriod':0.241,'orbitalVelocity':1.59,'orbitalEccentricity':12.3,'obliquitytoOrbit':0.001,'surfacePressure':0,'numberofMoons':0,'ringSystem':0,'globalMagneticField':0,' ':0},
	{'name':'Venus','color': '#ffa10f','mass':0.815,'diameter':0.949,'density':0.951,'gravity':0.907,'escapeVelocity':0.926,'rotationPeriod':-244,'lengthofDay':116.8,'distancefromSun':0.723,'perihelion':0.731,'aphelion':0.716,'orbitalPeriod':0.615,'orbitalVelocity':1.18,'orbitalEccentricity':0.401,'obliquitytoOrbit':0.113,'surfacePressure':92,'numberofMoons':0,'ringSystem':0,'globalMagneticField':0,' ':0},
	{'name':'Earth','color': '#3682ab','mass':1,'diameter':1,'density':1,'gravity':1,'escapeVelocity':1,'rotationPeriod':1,'lengthofDay':1,'distancefromSun':1,'perihelion':1,'aphelion':1,'orbitalPeriod':1,'orbitalVelocity':1,'orbitalEccentricity':1,'obliquitytoOrbit':1,'surfacePressure':1,'numberofMoons':1,'ringSystem':0,'globalMagneticField':0,' ':0},
	{'name':'Moon','color': '#a8aaac','mass':0.0123,'diameter':0.2724,'density':0.605,'gravity':0.166,'escapeVelocity':0.213,'rotationPeriod':27.4,'lengthofDay':29.5,'distancefromSun':0.00257,'perihelion':0.00247,'aphelion':0.00267,'orbitalPeriod':0.0748,'orbitalVelocity':0.0343,'orbitalEccentricity':3.29,'obliquitytoOrbit':0.285,'surfacePressure':0,'numberofMoons':0,'ringSystem':0,'globalMagneticField':0,' ':0},
	{'name':'Mars','color': '#e71e23','mass':0.107,'diameter':0.532,'density':0.713,'gravity':0.377,'escapeVelocity':0.45,'rotationPeriod':1.03,'lengthofDay':1.03,'distancefromSun':1.52,'perihelion':1.41,'aphelion':1.64,'orbitalPeriod':1.88,'orbitalVelocity':0.808,'orbitalEccentricity':5.6,'obliquitytoOrbit':1.07,'surfacePressure':0.01,'numberofMoons':2,'ringSystem':0,'globalMagneticField':0,' ':0},
	{'name':'Jupiter','color': '#e5ba83','mass':317.8,'diameter':11.21,'density':0.24,'gravity':2.36,'escapeVelocity':5.32,'rotationPeriod':0.415,'lengthofDay':0.414,'distancefromSun':5.2,'perihelion':5.03,'aphelion':5.37,'orbitalPeriod':11.9,'orbitalVelocity':0.439,'orbitalEccentricity':2.93,'obliquitytoOrbit':0.134,'surfacePressure':0,'numberofMoons':79,'ringSystem':0,'globalMagneticField':0,' ':0},
	{'name':'Saturn','color': '#f6db16','mass':95.2,'diameter':9.45,'density':0.125,'gravity':0.916,'escapeVelocity':3.17,'rotationPeriod':0.445,'lengthofDay':0.444,'distancefromSun':9.58,'perihelion':9.2,'aphelion':9.96,'orbitalPeriod':29.4,'orbitalVelocity':0.325,'orbitalEccentricity':3.38,'obliquitytoOrbit':1.14,'surfacePressure':0,'numberofMoons':82,'ringSystem':0,'globalMagneticField':0,' ':0},
	{'name':'Uranus','color': '#57c8f8','mass':14.5,'diameter':4.01,'density':0.23,'gravity':0.889,'escapeVelocity':1.9,'rotationPeriod':-0.72,'lengthofDay':0.718,'distancefromSun':19.2,'perihelion':18.64,'aphelion':19.75,'orbitalPeriod':83.7,'orbitalVelocity':0.228,'orbitalEccentricity':2.74,'obliquitytoOrbit':4.17,'surfacePressure':0,'numberofMoons':27,'ringSystem':0,'globalMagneticField':0,' ':0},
	{'name':'Neptune','color': '#5267d7','mass':17.1,'diameter':3.88,'density':0.297,'gravity':1.12,'escapeVelocity':2.1,'rotationPeriod':0.673,'lengthofDay':0.671,'distancefromSun':30.05,'perihelion':30.22,'aphelion':29.89,'orbitalPeriod':163.7,'orbitalVelocity':0.182,'orbitalEccentricity':0.677,'obliquitytoOrbit':1.21,'surfacePressure':0,'numberofMoons':14,'ringSystem':0,'globalMagneticField':0,' ':0},
	{'name':'Pluto','color': '#969698','mass':0.0025,'diameter':0.186,'density':0.38,'gravity':0.071,'escapeVelocity':0.116,'rotationPeriod':6.41,'lengthofDay':6.39,'distancefromSun':39.48,'perihelion':30.16,'aphelion':48.49,'orbitalPeriod':247.9,'orbitalVelocity':0.157,'orbitalEccentricity':14.6,'obliquitytoOrbit':2.45,'surfacePressure':0.00001,'numberofMoons':5,'ringSystem':0,'globalMagneticField':0,' ':0}
].map((planet => {
	const { name } = planet;
	const planetMoons = moons.find(m => m.planet === name.toLowerCase()) || [];

	return { ...planet, moons: planetMoons.moons };
}));

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const PI = Math.PI;
const TAU = PI * 2;
let phase = 0;

const width = 800;
const height = 800;
const midX = width >> 1;
const midY = height >> 1;

const EARTH_DIAMETER = 3;
const EARTH_DISTANCE = 30;
const EARTH_ORBIT_SPEED = 0.04;

canvas.width = width;
canvas.height = height;

const drawMoon = ({ x, y, radius }, angle) => {
	const moonX = x + (Math.cos(angle) * radius);
	const moonY = y + (Math.sin(angle) * radius);

	ctx.save();
	ctx.translate(midX, midY);

	ctx.beginPath();
	ctx.fillStyle = '#fff';
	ctx.arc(moonX, moonY, 1, 0, TAU, false);
	ctx.fill();
	ctx.closePath();

	ctx.restore();
};

const updatePlanet = (planet) => {
	let { angle = 0, orbitalPeriod, orbitalVelocity } = planet;

	angle += orbitalVelocity * EARTH_ORBIT_SPEED;

	planet.angle = angle;
};

const drawPlanet = (planet, phase) => {
	const { angle, color, moons = [] } = planet;
	const x = Math.cos(angle) * planet.distancefromSun * EARTH_DISTANCE;
	const y = Math.sin(angle) * planet.distancefromSun * EARTH_DISTANCE;
	const radius = planet.diameter * EARTH_DIAMETER;

	ctx.save();
	ctx.translate(midX, midY);

	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(x, y, radius, 0, TAU, false);
	ctx.fill();
	ctx.closePath();

	ctx.restore();

	moons.forEach((moon, index) => {
		drawMoon({ x, y, radius: radius + 5 }, phase + ((TAU / moons.length) * index));
	});
};


const phaseSpeed = 0.02;

(function loop() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	planets.forEach((planet) => {
		updatePlanet(planet);
		drawPlanet(planet, phase);
	});

	phase += phaseSpeed;

	requestAnimationFrame(loop);
})();
