import './estilos.scss';
import Meyda from 'meyda';

import Pneuma from './Pneuma';
const pneuma = new Pneuma();



const gestos= {
  presonus: {
    despertar: {estado: false, esperar: null}
  },
  scarlett: {
    despertar: {estado: false, esperar: null}
  }
}
const gestosPresonus = {};
const lienzoAmplitud = document.getElementById('lienzoAmplitud');
const lienzoFrecuencia = document.getElementById('lienzoFrecuencia');
const ctxAmplitud = lienzoAmplitud.getContext('2d');
const ctxFrecuencia = lienzoFrecuencia.getContext('2d');
const mensaje = document.getElementById('mensaje');
const sss = document.getElementById('sss');

let pasoX = 0;
let analizadorL;
let analizadorR;

const ancho = (lienzoAmplitud.width = lienzoFrecuencia.width = window.innerWidth);
const alto = (lienzoAmplitud.height = lienzoFrecuencia.height = window.innerHeight);
const centroX = ancho / 2;
const centroY = alto / 2;
let anchoBarra = 0;
const permitirRevision = (interfaz, nombreGesto) => {
  gestos[interfaz][nombreGesto].esperar = null;
} 
ctxAmplitud.lineWidth = 2;
ctxAmplitud.strokeStyle = '#e0b1cb';
// ctx.fillRect(0, 0, ancho, alto);

ctxFrecuencia.fillStyle = 'rgba(255, 255, 255, 0.5)';
ctxFrecuencia.lineWidth = 2;
ctxFrecuencia.strokeStyle = '#e0b1cb';
ctxFrecuencia.fillRect(0, 0, ancho, alto);

async function inicio() {
  const scarlett = await pneuma.crearFuenteConMic('focusrite');
  const presonus = await pneuma.crearFuenteConMic('audiobox');

  // pneuma.crearAnalizador(scarlett);
 // pneuma.crearAnalizador(presonus);
 crearAnalizadorMeyda(scarlett);

  const { tamañoBuffer } = scarlett;

  pasoX = ancho / tamañoBuffer;
  anchoBarra = ancho / (tamañoBuffer / 2);

  pintar();

  function pintar() {
    ctxFrecuencia.clearRect(0, 0, ancho, alto);
    ctxAmplitud.clearRect(0, 0, ancho, alto);
    // pintarFrecuencia(scarlett, true);
    //  pintarFrecuencia(presonus, false);
    // pintarAmplitud(scarlett, true);
    pintarAmplitud(presonus, false);

    requestAnimationFrame(pintar);
  }
}

inicio();
let min = Infinity;
let max = -Infinity;

function pintarFrecuencia({ analizador, datosAnalizador, tamañoBuffer }, arriba) {
  analizador.getFloatFrequencyData(datosAnalizador);

  const base = arriba ? 0 : alto;

  for (let i = 0; i < tamañoBuffer / 2; i++) {
    const altoBarra = datosAnalizador[i];
    const direccion = arriba ? -1 : 1;
    const x = anchoBarra * i;

    ctxFrecuencia.fillStyle = `rgb(150, 50, ${altoBarra}, 0.5)`;
    ctxFrecuencia.fillRect(x, base, anchoBarra, altoBarra * direccion);
  }
}

function pintarAmplitud({ analizador, datosAnalizador, tamañoBuffer }, arriba) {
  let x = 0;

 //analizador.getFloatTimeDomainData(datosAnalizador);
 //console.log(datosAnalizador);

  ctxAmplitud.beginPath();
  const baseY = arriba ? alto / 1.5 : alto / 3;

  for (let i = 0; i < tamañoBuffer; i++) {
    const punto = datosAnalizador[i];
    const v = punto * baseY;
    const y = v + baseY;

    if (i === 0) {
      ctxAmplitud.moveTo(x, y);
    } else {
      ctxAmplitud.lineTo(x, y);
    }
    x += pasoX;
  }

  ctxAmplitud.lineTo(ancho, baseY);
  ctxAmplitud.stroke();
}

function crearAnalizadorMeyda(interfaz) {
  const { ctx, fuente } = interfaz;
  let datosAnalizador;
  let analizador;
  if (typeof Meyda === "undefined") {
    console.log("No se encuentra Meyda.");
  } else {
    analizador = Meyda.createMeydaAnalyzer({
      audioContext: ctx,
      source: fuente,
      bufferSize: 512,
      sampleRate: 44100,
      featureExtractors: ["rms", "amplitudeSpectrum", "zcr", "spectralFlatness", "spectralRolloff", "spectralCrest", "mfcc"],
      callback: revisarEstados,
    });
  
    const tamañoBuffer = analizador.bufferSize;
 
   // fuente.connect(analizador);
    analizador.start();
    return Object.assign(interfaz, { analizador, datosAnalizador, tamañoBuffer });
  }
}

function revisarEstados(features) {
  const {rms, zcr} = features;
//console.log(features)
 // console.log(gestos.presonus.despertar.esperar)
  if (!gestos.presonus.despertar.esperar) {
    if (rms > 0.15) {
      gestos.presonus.despertar.esperar = setTimeout(() => {
        permitirRevision('presonus', 'despertar');
      }, 2000);
      mensaje.innerText = 'Hemos despertado';
    } else {
      mensaje.innerText = 'esta dormido...'
    }

  } else {
    mensaje.innerText = 'Ya despertaste';

  }

function desviacionEstandar(array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}
    



/* if(zcr >= 100) {
    sss.innerText = 'sssssssss'
   } else {
     sss.innerText = ''
   } */

   // Detecta qué tan tonal es el sonido
  /*  if(features.spectralFlatness >= 0.02) {
    sss.innerText = 'ruido'
   } else {
     sss.innerText = 'nota'
   } */

    // Detecta qué tan tonal es el sonido
  if(features.spectralRolloff < 9000) {
    sss.innerText = 'tonal'
   } else  {
     sss.innerText = 'ni ideaaa'
   }  

/*    if(features.mfcc[1] >= 25 && features.mfcc[1] < 45) {
    sss.innerText = 'voz'
   } else if (features.spectralKurtosis < 0) {
     sss.innerText = 'nada'
   } */
}

