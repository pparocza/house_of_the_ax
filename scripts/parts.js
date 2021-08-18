class Piece {
    
    constructor(){

    }

    initMasterChannel(){

        this.globalNow = 0;

        this.gain = audioCtx.createGain();
        this.gain.gain.value = 1;
    
        this.fadeFilter = new FilterFade(0);
    
        this.masterGain = audioCtx.createGain();
        this.masterGain.connect(this.gain);
        this.gain.connect(this.fadeFilter.input);
        this.fadeFilter.connect(audioCtx.destination);

    }

    load() {

        this.sound1 = new SpliceFMConvolver( this );

        this.sound1.load();

    }

    start() {

        this.fadeFilter.start(1, 50);
		this.globalNow = audioCtx.currentTime;

        this.sound1.play( 0 + this.globalNow , 432 * 0.25 );
        this.sound1.play( 1.25 + this.globalNow , 432 * 0.5 );

    }

    stop() {

        this.fadeFilter.start(0, 20);
        startButton.innerHTML = "reset";

    }

}

class BufferSplice extends Piece {

    constructor( piece ){

        super();

        this.output = new MyGain ( 0.25 );

        this.output.connect( piece.masterGain );

    }

    load() {

        // oscillator buffer
        this.oB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.oB.playbackRate = 432;
        this.oB.loop = true;
        this.oB.start();

        // splice buffer
        this.sB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );

            // sine splice
            this.sB.sine( 1 , 1 ).fill( 0 );

            this.oB.spliceBuffer( this.sB.buffer , 0 , 0.2 , 0 );
            this.oB.spliceBuffer( this.sB.buffer , 0.5 , 0.625 , 0.5 );

            this.sB.sine( 1.01 , 1 ).fill( 0 );

            this.oB.spliceBuffer( this.sB.buffer , 0.625 , 0.75 , 0.625 );

            // sawtooth splice
            this.sB.inverseSawtooth( 4 ).fill( 0 );

            this.oB.spliceBuffer( this.sB.buffer , 0.2 , 0.5 , 0.2 );

            // noise splice
            this.sB.noise().fill( 0 );

            this.oB.spliceBuffer( this.sB.buffer , 0.75 , 1 , 0.75 );

        this.oB.ramp( 0 , 1 , 0.5 , 0.5 , 1 , 1 ).multiply( 0 );


        // envelope buffer
        this.eB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.eB.ramp( 0 , 1 , 0.5 , 0.5 , 1 , 1 ).add( 0 );
        this.eB.playbackRate = 1;

        this.eG = new MyGain( 0 );

        this.oB.connect( this.eG ); this.eB.connect( this.eG.gain.gain );
        this.eG.connect( this.output );

        bufferGraph( this.oB.buffer );

    }

    play() {

        this.eB.startAtTime( piece.globalNow + 0 );

    }

}

class DetuneSplice extends Piece {

    constructor( piece ){

        super();

        this.output = new MyGain ( 1 );

        this.output.connect( piece.masterGain );

    }

    load() {

        // oscillator buffer
        this.oB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.oB.playbackRate = 432 * 0.125 ;
        this.oB.loop = true;
        this.oB.start();

        // splice buffer
        this.sB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );

            // detuned sines splice
            const nS = 100;
            const detuneRange = 0.05;

            for( let i = 0 ; i < nS ; i++ ){

                this.sB.fm( randomFloat( 1 - detuneRange , 1 + detuneRange ) * randomArrayValue( [ 1 , 2 , 4 , 0.5 ] ) , randomFloat( 1 - detuneRange , 1 + detuneRange ) * randomArrayValue( [ 1 , 2 , 4 , 0.5 ] ) , 1 ).fill( 0 );

                this.oB.spliceBuffer( this.sB.buffer , i / nS , ( i + 1 ) / nS , i / nS );

            }

            this.oB.movingAverage( 2156 );


        // envelope buffer
        this.eB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.eB.ramp( 0 , 1 , 0.01 , 0.015 , 0.1 , 4 ).add( 0 );
        this.eB.playbackRate = 1;

        this.eG = new MyGain( 0 );

        this.oB.connect( this.eG ); this.eB.connect( this.eG.gain.gain );
        this.eG.connect( this.output );

        bufferGraph( this.oB.buffer );

    }


    play( startTime , playbackRate ) {

        this.oB.bufferSource.playbackRate.setValueAtTime( playbackRate , startTime );
        this.eB.startAtTime( startTime );

    }

}

class ScaleSplice extends Piece {

    constructor( piece ){

        super();

        this.output = new MyGain ( 1 );

        this.output.connect( piece.masterGain );

    }

    load() {

        // oscillator buffer
        this.oB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.oB.playbackRate = 432 * 0.125 ;
        this.oB.loop = true;
        this.oB.start();

        // splice buffer
        this.sB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );

            // detuned sines splice
            const nS = 10;
            const detuneRange = 0.05;

            for( let i = 0 ; i < nS ; i++ ){

                this.sB.sine( randomArrayValue( [ 1 , 2 , P5 , M3 ] ) , 1 ).fill( 0 );

                this.oB.spliceBuffer( this.sB.buffer , i / nS , ( i + 1 ) / nS , i / nS );

            }

            this.oB.movingAverage( 2156 );


        // envelope buffer
        this.eB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.eB.ramp( 0 , 1 , 0.01 , 0.015 , 0.1 , 4 ).add( 0 );
        this.eB.playbackRate = 1;

        this.eG = new MyGain( 0 );

        this.oB.connect( this.eG ); this.eB.connect( this.eG.gain.gain );
        this.eG.connect( this.output );

        bufferGraph( this.oB.buffer );

    }

    play( startTime , playbackRate ) {

        this.oB.bufferSource.playbackRate.setValueAtTime( playbackRate , startTime );
        this.eB.startAtTime( startTime );

    }

}

class SpliceFM extends Piece {

    constructor( piece ){

        super();

        this.output = new MyGain ( 0.5 );

        this.output.connect( piece.masterGain );

    }

    load() {

        // oscillator buffer
        this.oB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.oB.playbackRate = 432 * 0.125 ;
        this.oB.loop = true;
        this.oB.start();

        this.oBG = new MyGain( 432 * 0.25 );

        this.o = new MyOsc( 'sine' , 432 );
        this.o.start();

        // splice buffer
        this.sB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );

            // detuned sines splice
            const nS = 100;
            const detuneRange = 0.05;

            for( let i = 0 ; i < nS ; i++ ){

                this.sB.sine( randomFloat( 1 - detuneRange , 1 + detuneRange ) , 1 ).fill( 0 );

                this.oB.spliceBuffer( this.sB.buffer , i / nS , ( i + 1 ) / nS , i / nS );

            }

            this.oB.movingAverage( 2156 );


        // envelope buffer
        this.eB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.eB.ramp( 0 , 1 , 0.01 , 0.015 , 0.1 , 4 ).add( 0 );
        this.eB.playbackRate = 1;

        this.eG = new MyGain( 0 );

        this.oB.connect( this.oBG ); 
        this.oBG.connect( this.o.frequencyInlet );
        this.o.connect( this.eG ); this.eB.connect( this.eG.gain.gain );
        this.eG.connect( this.output );

        bufferGraph( this.oB.buffer );

    }

    play( startTime , playbackRate ) {

        this.oB.bufferSource.playbackRate.setValueAtTime( playbackRate , startTime );
        this.eB.startAtTime( startTime );

    }

}

class SpliceFMConvolver extends Piece {

    constructor( piece ){

        super();

        this.output = new MyGain ( 0.5 );

        this.output.connect( piece.masterGain );

    }

    load() {

        // oscillator buffer
        this.oB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.oB.playbackRate = 432 * 0.125 ;
        this.oB.loop = true;
        this.oB.start();

        // convolverBuffer
        this.cB = new MyBuffer2( 2 , 1 , audioCtx.sampleRate );
        this.cSB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.c = new MyConvolver();
        this.c.output.gain.value = 2;

        this.oBG = new MyGain( 432 * 0.25 );

        this.o = new MyOsc( 'sine' , 432 );
        this.o.start();

        // splice buffer
        this.sB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );

            // detuned sines splice
            const nS = 100;
            const detuneRange = 0.05;

            for( let i = 0 ; i < nS ; i++ ){

                this.sB.sine( randomFloat( 1 - detuneRange , 1 + detuneRange ) , 1 ).fill( 0 );

                this.oB.spliceBuffer( this.sB.buffer , i / nS , ( i + 1 ) / nS , i / nS );

            }

            this.oB.movingAverage( 2156 );

            for( let i = 0 ; i < nS ; i++ ){

                this.sB.fm( 432 * randomFloat( 1 - detuneRange , 1 + detuneRange ) , 432 * randomFloat( 1 - detuneRange , 1 + detuneRange ) , 1 ).fill( 0 );

                this.cSB.spliceBuffer( this.sB.buffer , i / nS , ( i + 1 ) / nS , i / nS );

            }

            this.cSB.movingAverage( 2156 );
            this.cB.bufferShape( this.cSB.buffer ).add( 0 );

            for( let i = 0 ; i < nS ; i++ ){

                this.sB.fm( 432 * randomFloat( 1 - detuneRange , 1 + detuneRange ) , 432 * randomFloat( 1 - detuneRange , 1 + detuneRange ) , 1 ).fill( 0 );

                this.cSB.spliceBuffer( this.sB.buffer , i / nS , ( i + 1 ) / nS , i / nS );

            }

            this.cSB.movingAverage( 2156 );
            this.cB.bufferShape( this.cSB.buffer ).add( 1 );

        this.c.setBuffer( this.cB.buffer );


        // envelope buffer
        this.eB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.eB.ramp( 0 , 1 , 0.01 , 0.015 , 0.1 , 4 ).add( 0 );
        this.eB.playbackRate = 1;

        this.eG = new MyGain( 0 );

        this.oB.connect( this.oBG ); 
        this.oBG.connect( this.o.frequencyInlet );
        this.o.connect( this.eG ); this.eB.connect( this.eG.gain.gain );
        this.eG.connect( this.c );
        this.c.connect( this.output );
        this.eG.connect( this.output );

        bufferGraph( this.oB.buffer );

    }

    play( startTime , playbackRate ) {

        this.oB.bufferSource.playbackRate.setValueAtTime( playbackRate , startTime );
        this.eB.startAtTime( startTime );

    }

}