import './estilos.scss';
import Pneuma from './Pneuma';
//const soploRapido = 'soplo-rapido.wav';
const soploRapido = 'Los Días.mp3';
const pneuma = new Pneuma();

const mensaje = document.getElementById('mensaje');
const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
let audioCargado = false;
let reproduciendo = false;
let pasoX = 0;
let analizador;
let animar = false;

const ancho = (lienzo.width = window.innerWidth);
const alto = (lienzo.height = window.innerHeight);
const centroX = ancho / 2;
const centroY = alto / 2;
ctx.fillStyle = '#faf4f4';
ctx.lineWidth = 2;
ctx.strokeStyle = '#e0b1cb';
ctx.fillRect(0, 0, ancho, alto);

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
  analizador = pneuma.crearAnalizador(fuente);
  console.log(pneuma.tamañoBuffer);
  pasoX = ancho / pneuma.tamañoBuffer;
  mensaje.innerText = 'Audio Cargado';

  document.body.onclick = () => {
    fuente.onended = () => {
      animar = false;
    };
    animar = true;
    pintar();

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
const vel = 3;
let fotogramaActual = 0;
let fotogramaActualFondo = 0;
let fotogramaActualLinea1 = 0;
const umbralAbajo = -0.58;
const umbralArriba = 0.3;
let animarGolpe = false;

function pintar() {
  if (tick === vel) {
    let x = 0;
    ctx.drawImage(
      fondo[fotogramaActualFondo],
      0,
      0,
      anchoImgFondo,
      altoImgFondo,
      centroX - centroImgXFondo,
      centroY - centroImgYFondo,
      anchoImgFondo,
      altoImgFondo
    );

    ctx.save();
    ctx.beginPath();
    ctx.globalCompositeOperation = 'darken';

    analizador.getByteTimeDomainData(pneuma.datosAnalizador);
    // console.log(pneuma.datosAnalizador);
    const t0 = performance.now();
    let tocaUmbralAbajo = false;
    let tocaUmbralArriba = false;

    for (let i = 0; i < pneuma.tamañoBuffer; i++) {
      const punto = pneuma.datosAnalizador[i];

      const v = ((255 / punto) * alto) / 2;
      const y = v - alto / 2;
      //console.log(pneuma.datosAnalizador[i], v);

      max = punto > max ? punto : max;
      min = punto < min ? punto : min;

      if (punto < umbralAbajo) tocaUmbralAbajo = true;
      if (punto > umbralArriba) tocaUmbralArriba = true;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += pasoX;
    }

    if (tocaUmbralAbajo && tocaUmbralArriba) {
      animarGolpe = true;
    }

    if (!animarGolpe) {
      ctx.drawImage(
        ciclo[fotogramaActual],
        0,
        0,
        anchoImg,
        altoImg,
        centroX - centroImgX,
        centroY - centroImgY,
        anchoImg,
        altoImg
      );
      fotogramaActual = (fotogramaActual + 1) % 7;
    } else {
      ctx.drawImage(
        linea1[fotogramaActualLinea1],
        0,
        0,
        anchoImg,
        altoImg,
        centroX - centroImgX,
        centroY - centroImgY,
        anchoImg,
        altoImg
      );

      if (fotogramaActualLinea1 < 7) {
        fotogramaActualLinea1 = fotogramaActualLinea1 + 1;
      } else {
        animarGolpe = false;
        fotogramaActualLinea1 = 0;
      }
    }

    fotogramaActualFondo = (fotogramaActualFondo + 1) % 3;

    ctx.lineTo(ancho, alto / 2);
    ctx.stroke();
    ctx.restore();

    const t1 = performance.now();
    mensaje.innerText = `min: ${min}, max: ${max} \n ${(t1 - t0) / 1000}`;
    tick = 0;
  }

  tick++;
  if (animar) {
    requestAnimationFrame(pintar);
  } else {
    console.log(min, max);
  }
}
