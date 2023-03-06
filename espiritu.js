import './estilos.scss';
import Pneuma from './Pneuma';
//const soploRapido = 'soplo-rapido.wav';
const soploRapido = 'prueba2.mp3';
const pneuma = new Pneuma();

const mensaje = document.getElementById('mensaje');
const lienzo = document.getElementById('lienzo');
const lienzoFrecuencia = document.getElementById('lienzoFrecuencia');
const ctx = lienzo.getContext('2d');
const ctxFrecuencia = lienzoFrecuencia.getContext('2d');
let audioCargado = false;
let reproduciendo = false;
let pasoX = 0;
let analizadorL;
let analizadorR;
let animar = false;

const ancho = (lienzo.width = lienzoFrecuencia.width = window.innerWidth);
const alto = (lienzo.height = lienzoFrecuencia.height = window.innerHeight);
const centroX = ancho / 2;
const centroY = alto / 2;
ctx.fillStyle = '#faf4f4';
ctx.lineWidth = 2;
ctx.strokeStyle = '#e0b1cb';
ctx.fillRect(0, 0, ancho, alto);

ctxFrecuencia.fillStyle = 'rgba(255, 255, 255, 0.5)';
ctxFrecuencia.lineWidth = 2;
ctxFrecuencia.strokeStyle = '#e0b1cb';
ctxFrecuencia.fillRect(0, 0, ancho, alto);

const fotogramasCiclo = 7;
const fotogramasLinea1 = 7;
const fotogramasFondo = 3;
const totalImgs = fotogramasCiclo + fotogramasLinea1 + fotogramasFondo + 2;
const ciclo = [];
const fondo = [];
const linea1 = [];
let framesCargados = 0;
let anchoImg = 0;
let altoImg = 0;
let anchoImgFondo = 0;
let altoImgFondo = 0;
let centroImgX = 0;
let centroImgY = 0;
let centroImgXFondo = 0;
let centroImgYFondo = 0;

//fondo
for (let i = 0; i <= fotogramasCiclo; i++) {
  const img = new Image();
  img.onload = () => {
    anchoImg = img.naturalWidth;
    altoImg = img.naturalHeight;
    centroImgX = anchoImg / 2;
    centroImgY = altoImg / 2;
    ciclo.push(img);
    framesCargados = framesCargados + 1;

    if (framesCargados === totalImgs) {
      inicio();
    }
  };
  img.src = `/frames/pajaro-ciclo/pajaro_00${i + 1}.jpg`;
}

for (let i = 0; i <= fotogramasFondo; i++) {
  const img = new Image();
  img.onload = () => {
    anchoImgFondo = img.naturalWidth;
    altoImgFondo = img.naturalHeight;
    centroImgXFondo = anchoImgFondo / 2;
    centroImgYFondo = altoImgFondo / 2;
    fondo.push(img);
    framesCargados = framesCargados + 1;
    if (framesCargados === totalImgs) {
      inicio();
    }
  };
  img.src = `/frames/fondos/${i + 1}.jpg`;
}

for (let i = 0; i <= fotogramasLinea1; i++) {
  const img = new Image();
  img.onload = () => {
    linea1.push(img);
    framesCargados = framesCargados + 1;
    if (framesCargados === totalImgs) {
      inicio();
    }
  };
  img.src = `/frames/linea-arriba/pajaro_0${i === 0 ? '0' : ''}${i + 9}.jpg`;
}

async function inicio() {
  console.log(ciclo, fondo, linea1);
  const fuente = await pneuma.cargarAudio(soploRapido);
  analizadorL = pneuma.crearAnalizador(fuente, 0);
  analizadorR = pneuma.crearAnalizador(fuente, 1);
  //console.log(pneuma.tamañoBuffer);
  pasoX = ancho / pneuma.tamañoBuffer;
  mensaje.innerText = 'Audio Cargado';

  document.body.onclick = () => {
    fuente.onended = () => {
      animar = false;
    };
    animar = true;

    pintar();
    mensaje.innerText = '';

    fuente.start();
  };
}

// const fuente = pneuma.crearOscilador();
// "sine", "square", "sawtooth", "triangle" and "custom"
// fuente.type = 'triangle';
// pneuma.definirFrecuencia(fuente, 20);

// fuente.connect(pneuma.ctx.destination);
// fuente.start();

inicio();
let min = Infinity;
let max = -Infinity;
let tick = 0;
const vel = 1;
let fotogramaActual = 0;
let fotogramaActualFondo = 0;
let fotogramaActualLinea1 = 0;
const umbralAbajo = -0.58;
const umbralArriba = 0.3;
let animarGolpe = false;

function pintar() {
  // if (tick === vel) {
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  ctxFrecuencia.clearRect(0, 0, ancho, alto);
  pintarL();
  pintarR();
  pintarFrecuenciaL();
  pintarFrecuenciaR();
  //   tick = 0;
  // }

  // tick++;
  if (animar) {
    requestAnimationFrame(pintar);
  } else {
    console.log(min, max);
  }
}

// POR HACER: Unir las dos funciones en una
function pintarL() {
  let x = 0;
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = '#1ec4cd';

  analizadorL.getByteTimeDomainData(pneuma.datosAnalizador);

  for (let i = 0; i < pneuma.tamañoBuffer; i++) {
    const punto = pneuma.datosAnalizador[i];

    const v = ((255 / punto) * alto) / 2;
    const y = v - alto / 1.5;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += pasoX;
  }

  ctx.lineTo(ancho, alto / 2);
  ctx.stroke();
  ctx.restore();
}

function pintarR() {
  let x = 0;

  ctx.save();
  ctx.beginPath();

  analizadorR.getByteTimeDomainData(pneuma.datosAnalizador);

  for (let i = 0; i < pneuma.tamañoBuffer; i++) {
    const punto = pneuma.datosAnalizador[i];

    const v = ((255 / punto) * alto) / 2;
    const y = v - alto / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += pasoX;
  }

  ctx.lineTo(ancho, alto / 2);
  ctx.stroke();
  ctx.restore();
}

function pintarFrecuenciaL() {
  analizadorL.getByteFrequencyData(pneuma.datosAnalizador);

  const anchoBarra = (ancho / pneuma.tamañoBuffer) * 2.5;
  let altoBarra;
  let x = 0;

  for (let i = 0; i < pneuma.tamañoBuffer; i++) {
    altoBarra = pneuma.datosAnalizador[i];

    ctxFrecuencia.fillStyle = `rgb(150, 50, ${altoBarra}, 0.5)`;
    ctxFrecuencia.fillRect(x, alto - altoBarra / 2, anchoBarra, altoBarra / 2);

    x += anchoBarra + 1;
  }
}

function pintarFrecuenciaR() {
  analizadorR.getByteFrequencyData(pneuma.datosAnalizador);

  const anchoBarra = (ancho / pneuma.tamañoBuffer) * 2.5;
  let altoBarra;
  let x = 0;

  for (let i = 0; i < pneuma.tamañoBuffer; i++) {
    altoBarra = pneuma.datosAnalizador[i];

    ctxFrecuencia.fillStyle = `rgb(10, 150, ${altoBarra}, 0.5)`;
    ctxFrecuencia.fillRect(x, 0, anchoBarra, altoBarra / 2);

    x += anchoBarra + 1;
  }
}
