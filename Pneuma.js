export default class Pneuma {
  constructor() {
    const ContextoAudio = window.AudioContext || window.webkitAudioContext;
    this.ctx = new ContextoAudio();
  }

  crearOscilador() {
    return this.ctx.createOscillator();
  }

  crearFuenteConArchivo(buffer) {
    const fuente = new AudioBufferSourceNode(this.ctx);
    fuente.buffer = buffer;
    fuente.connect(this.ctx.destination);

    return fuente;
  }

  crearAnalizador(fuente, canal) {
    ////////////////////************ */
    // Crear un divisor ('spliter') para separar L y R.
    // Y un 'merger' para volver a juntar ambas señales.
    const divisor = this.ctx.createChannelSplitter(2);
    const merger = this.ctx.createChannelMerger(2);

    // Crear un nodo para variar la ganancia
    const nodoGanancia = this.ctx.createGain();

    // Conectar la fuente al divisor
    fuente.connect(divisor);

    // Variar la ganancia
    if (canal === 0) {
      nodoGanancia.gain.setValueAtTime(0.9, this.ctx.currentTime);
      nodoGanancia.connect(merger, 0, 0);
      divisor.connect(nodoGanancia, 0);
    } else if (canal === 1) {
      nodoGanancia.gain.setValueAtTime(0.9, this.ctx.currentTime);
      nodoGanancia.connect(merger, 0, 1);
      divisor.connect(nodoGanancia, 1);
    }
    // Variar la ganancia del canal izquierdo solamente conectando a la entrada 0
    // del divisor.

    // Conectar el divisor de vuelta a la segunda entrada del 'merger' (1) para
    //invertir los canales, reversando la imagen estéreo.

    /////////////////

    const analizador = this.ctx.createAnalyser();
    analizador.fftSize = 2048;
    this.tamañoBuffer = analizador.frequencyBinCount;
    this.datosAnalizador = new Uint8Array(this.tamañoBuffer);
    // analizador.getByteTimeDomainData(this.datosAnalizador);

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
