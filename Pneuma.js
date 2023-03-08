export default class Pneuma {
  constructor() {
    const ContextoAudio = window.AudioContext || window.webkitAudioContext;
    this.ctx = new ContextoAudio();
  }

  crearOscilador() {
    return this.ctx.createOscillator();
  }

  // Función para crear fuente desde archivo
  async crearFuenteConArchivo(buffer) {
    const fuente = new AudioBufferSourceNode(this.ctx);
    fuente.buffer = buffer;
    fuente.connect(this.ctx.destination);

    return fuente;
  }

  /**
   * Función para crear fuente desde entradas externas de audio (micrófonos, interfaces).
   * @param {string} entrada 'interfaz' o 'microfono' para elegir la entrada de audio.
   */
  async crearFuenteConMic(entrada) {
    const scarlett = 'fabd64e8943bf541c093f953dc75a199a0b2abe1d83a012518e433159704f509';
    const solapa = '08fff73e79a69980fac392a396384cf5340ee5ad28ee624b946301d14fb54a9c';

    let entradaElegida;

    if (entrada === 'interfaz') {
      entradaElegida = scarlett;
    }
    if (entrada === 'microfono') {
      entradaElegida = solapa;
    }

    /** Elegir la entrada que corresponde con el id de 'entrada'
     * PORHACER: Elegir por el nombre en un menú.
     */
    const flujo = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: {
          exact: entradaElegida,
        },
      },
      video: false,
    });

    const fuente = this.ctx.createMediaStreamSource(flujo);

    fuente.connect(this.ctx.destination);

    /** Imprimir dispositivos disponibles */
    // console.log(navigator.mediaDevices.enumerateDevices());

    return fuente;
  }

  /**
   * Crear un analizador y conectarlo con una fuente y dividir separar los canales
   * L de R para trabajarlos por separado.
   * Por ahora solo se pueden separar si la fuente viene de un archivo de audio.
   * @param {MediaStreamSource | AudioBufferSourceNode} fuente (MediaStreamSource o AudioBufferSourceNode)
   * @param {Number} canal (0, 1)
   */
  crearAnalizador(fuente, canal) {
    /* Crear un divisor ('spliter') para separar L y R.
    Y un 'merger' para volver a juntar ambas señales. */
    const divisor = this.ctx.createChannelSplitter(2);
    const merger = this.ctx.createChannelMerger(2);

    // Crear un nodo para variar la ganancia
    const nodoGanancia = this.ctx.createGain();

    // Conectar la fuente al divisor
    fuente.connect(divisor);

    // Variar la ganancia de cada canal (L (0) y R (1)) por separado
    if (canal === 0) {
      nodoGanancia.gain.setValueAtTime(0.9, this.ctx.currentTime);
      nodoGanancia.connect(merger, 0, 0);
      divisor.connect(nodoGanancia, 0);
    } else if (canal === 1) {
      nodoGanancia.gain.setValueAtTime(0.9, this.ctx.currentTime);
      nodoGanancia.connect(merger, 0, 1);
      divisor.connect(nodoGanancia, 1);
    }

    const analizador = this.ctx.createAnalyser();
    analizador.fftSize = 2048;
    this.tamañoBuffer = analizador.frequencyBinCount;
    this.datosAnalizador = new Uint8Array(this.tamañoBuffer);

    merger.connect(analizador);
    return analizador;
  }

  async cargarAudio(url) {
    const audioCrudo = await fetch(url).then((respuesta) => respuesta.arrayBuffer());
    const audioDecodificado = await this.ctx.decodeAudioData(audioCrudo);
    return this.crearFuenteConArchivo(audioDecodificado);
  }

  definirFrecuencia(fuente, frecuencia, tiempo = this.ctx.currentTime) {
    fuente.frequency.setValueAtTime(frecuencia, tiempo);
  }
}
