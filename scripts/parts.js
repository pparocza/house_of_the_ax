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

        this.loadOverlappingWaves();

    }

    start(){

        this.fadeFilter.start(1, 50);
		this.globalNow = audioCtx.currentTime;

        this.startOverlappingWaves2();

    }

    loadSpliceFadePad(){

        this.sound1 = new SpliceFadePad( this );
        this.sound2 = new SpliceFadePad( this );
        this.sound3 = new SpliceFadePad( this );
        this.sound4 = new SpliceFadePad( this );

        this.sound1.load();
        this.sound2.load();
        this.sound3.load();
        this.sound4.load();

    }

    startSpliceFadePad() {

        this.sound1.play();
        this.sound2.play();
        this.sound3.play();
        this.sound4.play();

    }

    loadOverlappingWaves(){

        const nSounds = 5;

        this.soundArray = [];

        for( let i = 0 ; i < nSounds ; i++ ){

            this.soundArray[i] = new OverlappingWavesFM( this );
            this.soundArray[i].load( 2 );

        }

    }

    startOverlappingWaves(){

        const sL = 100;
        let r = 0;

        for( let i = 0 ; i < sL ; i++ ){

            r = randomInt( 0 , this.soundArray.length );

            this.soundArray[ r ].play( i + this.globalNow );
            this.soundArray[ r ].pan.setPositionAtTime( randomFloat( -1 , 1 ) , i + this.globalNow );

        }

    }

    startOverlappingWaves2(){

        const sL = 100;
        let s = new Sequence();
        let r = 0;

        s.randomFloats( sL , 0.125 , 3 );
        s.sumSequence();
        s.add( this.globalNow );

        s = s.sequence;

        for( let i = 0 ; i < sL ; i++ ){

            r = randomInt( 0 , this.soundArray.length );

            this.soundArray[ r ].play( s[ i ] );
            this.soundArray[ r ].pan.setPositionAtTime( randomFloat( -1 , 1 ) , s[ i ] );

        }

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

class SpliceFMConvolverAndWaveShaper extends Piece {

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
        this.c.output.gain.value = 0.25;

        // shaperBuffer
        this.shB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.sh = new MyWaveShaper();

        this.oBG = new MyGain( 432 * 0.25 );

        this.o = new MyOsc( 'sine' , 432 );
        this.o.start();

        // splice buffer
        this.sB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );

            // detuned sines splice
            const nS = 100;
            const cNS = 50;
            const detuneRange = 0.05;

            // fm splice
            for( let i = 0 ; i < nS ; i++ ){

                this.sB.sine( randomFloat( 1 - detuneRange , 1 + detuneRange ) , 1 ).fill( 0 );

                this.oB.spliceBuffer( this.sB.buffer , i / nS , ( i + 1 ) / nS , i / nS );

            }

            this.oB.movingAverage( 2156 );

            let r = 0;

            // convolver splice 1
            for( let i = 0 ; i < cNS ; i++ ){

                r = randomInt( 0 , 2 );

                if( r == 1 ){
                    this.sB.sine( 432 * randomFloat( 1 - detuneRange , 1 + detuneRange ) , 1 ).fill( 0 );
                } else { this.sB.noise().fill( 0 ); }

                this.cSB.spliceBuffer( this.sB.buffer , i / cNS , ( i + 1 ) / cNS , i / cNS );

            }

            // this.cSB.movingAverage( 2156 );
            bufferGraph( this.cSB.buffer );
            this.cB.bufferShape( this.cSB.buffer ).add( 0 );

            // convolver splice 2
            for( let i = 0 ; i < cNS ; i++ ){

                r = randomInt( 0 , 2 );

                if( r == 1 ){
                    this.sB.sine( 432 * randomFloat( 1 - detuneRange , 1 + detuneRange ) , 1 ).fill( 0 );
                } else { this.sB.noise().fill( 0 ); }

                this.cSB.spliceBuffer( this.sB.buffer , i / cNS , ( i + 1 ) / cNS , i / cNS );

            }

            // this.cSB.movingAverage( 2156 );
            bufferGraph( this.cSB.buffer );
            this.cB.bufferShape( this.cSB.buffer ).add( 1 );

            this.c.setBuffer( this.cB.buffer );

            for( let i = 0 ; i < nS ; i++ ){

                this.sB.sine( randomFloat( 1 - detuneRange , 1 + detuneRange ) , 1 ).fill( 0 );

                this.shB.spliceBuffer( this.sB.buffer , i / nS , ( i + 1 ) / nS , i / nS );

            }

            this.shB.movingAverage( 2156 );
            this.sh.bufferShape( this.shB.buffer );

        // envelope buffer
        this.eB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.eB.ramp( 0 , 1 , 0.01 , 0.015 , 0.1 , 4 ).add( 0 );
        this.eB.playbackRate = 1;

        this.eG = new MyGain( 0 );

        this.oB.connect( this.oBG ); 
        this.oBG.connect( this.o.frequencyInlet );
        this.o.connect( this.eG ); this.eB.connect( this.eG.gain.gain );
        this.eG.connect( this.sh );

        this.sh.connect( this.c );
        
        // this.sh.connect( this.output );
        this.c.connect( this.output );

        bufferGraph( this.oB.buffer );

    }

    play( startTime , playbackRate ) {

        this.oB.bufferSource.playbackRate.setValueAtTime( playbackRate , startTime );
        this.eB.startAtTime( startTime );

    }

}

class SpliceFadePad extends Piece {

    constructor( piece ){

        super();

        this.output = new MyGain ( 0.25 );

        this.output.connect( piece.masterGain );

    }

    load() {

        // oscillator buffer
        this.oB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.oB.playbackRate = 432 * 0.25 * randomArrayValue( [ 1 , M3 , P5 , M6 , P4 , 2 ] );
        this.oB.loop = true;
        this.oB.start();

        // splice buffer
        this.sB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );

            // detuned sines splice
            const nS = randomInt( 20 , 100 );
            const detuneRange = 0.05;

            for( let i = 0 ; i < nS ; i++ ){

                this.sB.am( randomFloat( 1 - detuneRange , 1 + detuneRange ) , 0.5 * randomFloat( 1 - detuneRange , 1 + detuneRange ) , 1 ).fill( 0 );

                this.oB.spliceBuffer( this.sB.buffer , i / nS , ( i + 1 ) / nS , i / nS );

            }

            this.oB.movingAverage( 2156 );

            bufferGraph( this.oB.buffer );


        // envelope buffer

        const peak = randomFloat( 0.3 , 0.7 );

        this.eB = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.eB.unipolarNoise().add( 0 );
        this.eB.ramp( 0 , 1 , 0.00005 , 0.99995 , 1 , 1 ).multiply( 0 );

        this.eB.playbackRate = randomFloat( 0.000006 , 0.000008 );
        this.eB.loop = true;

        this.eG = new MyGain( 0 );

        // fx

        this.cB = new MyBuffer2( 2 , 1 , audioCtx.sampleRate );

        this.cB.noise().fill( 0 );
        this.cB.ramp( 0 , 1 , 0.01 , 0.015 , 0.1 , 2 ).multiply( 0 );

        this.cB.noise().fill( 1 );
        this.cB.ramp( 0 , 1 , 0.01 , 0.015 , 0.1 , 2 ).multiply( 1 );

        this.c = new MyConvolver();
        this.c.setBuffer( this.cB.buffer );

        this.oB.connect( this.eG ); this.eB.connect( this.eG.gain.gain );
        this.eG.connect( this.c );
        this.c.connect(this.output);

    }

    play() {

        this.eB.startAtTime( piece.globalNow + 0 );

    }

}

class OverlappingWaves extends Piece {

    constructor( piece ){

        super();

        this.output = new MyGain( 0.25 );
        
        this.output.connect( piece.masterGain );

    }

    load( bufferLength ){

        const duration = 16;
        const playbackRate = bufferLength/duration;
        const fund = 432 * bufferLength * duration;
        const nH = 20;
        const hA = [ 1 , M2 , P5 , P4 , M6 ];
        const oA = [ 0.25 , 0.5 , 1 ];
        let peak = 0;

        this.buffer = new MyBuffer2( 1 , bufferLength , audioCtx.sampleRate );
        this.buffer.playbackRate = playbackRate;

        this.tempBuffer = new MyBuffer2( 1 , bufferLength , audioCtx.sampleRate);

        for( let i = 0 ; i < nH ; i++ ){

            peak = randomFloat( 0.3 , 0.7 );

            this.tempBuffer.sine( fund * randomArrayValue( hA ) * randomArrayValue( oA ) , 1 ).fill( 0 );
            this.tempBuffer.ramp( 0 , 1 , peak , randomFloat( peak , 0.7 ) , randomFloat( 1 , 2 ) , randomFloat( 1 , 2 ) ).multiply( 0 );
            this.tempBuffer.constant( randomFloat( 0.25 , 1 ) ).multiply( 0 );
    
            this.buffer.bufferShape( this.tempBuffer.buffer ).add( 0 );

        }

        this.buffer.normalize( -1 , 1 );
        this.buffer.ramp( 0 , 1 , 0.5 , 0.5 , 1 , 1 ).multiply( 0 );

        this.buffer.connect( this.output );

    }

    play(){

        this.buffer.start();

    }

}

class OverlappingWavesFM extends Piece {

    constructor( piece ){

        super();

        this.output = new MyGain( 1 );
        
        this.output.connect( piece.masterGain );

    }

    load( bufferLength ){

        const duration = 1;
        const playbackRate = bufferLength/duration;
        const fund = 1 * 432 * bufferLength * duration;
        const nH = 20;
        const hA2 = [ 1 , M2 , M3 , P4 , P5 , M6 , M7 ];
        const oA2 = [ 0.5 , 1 , 2 ];
        let peak = 0;

        this.buffer = new MyBuffer2( 1 , bufferLength , audioCtx.sampleRate );
        this.buffer.playbackRate = playbackRate;

        this.tempBuffer = new MyBuffer2( 1 , bufferLength , audioCtx.sampleRate);

        for( let i = 0 ; i < nH ; i++ ){

            this.tempBuffer.sine( fund * randomArrayValue( hA2 ) * randomArrayValue( oA2 ) , 1 ).fill( 0 );
            this.tempBuffer.ramp( 0 , 1 , 0.01 , 0.015 , 0.1 , 8 ).multiply( 0 );
            this.tempBuffer.constant( randomFloat( 0.25 , 1 ) ).multiply( 0 );
    
            this.buffer.bufferShape( this.tempBuffer.buffer ).add( 0 );

        }

        // this.buffer.ramp( 0 , 1 , 0.5 , 0.5 , 1 , 1 ).multiply( 0 );
        this.buffer.normalize( -1 , 1 );

        const bG = new MyGain( fund * 0.25 );

        const o = new MyOsc( 'sine' , 0 );
        o.start();

        // FILTER

        const f = new MyBiquad( 'highpass' , 50 , 1 );

        // REVERB

        const cLength = randomFloat( 2 , 5 );

        const c = new MyConvolver( 2 , cLength , audioCtx.sampleRate );
        const cB = new MyBuffer2( 2 , cLength , audioCtx.sampleRate);

        cB.noise().fill( 0 );
        cB.ramp( 0 , 1 , 0.01 , 0.015 , randomFloat( 0.05 , 0.2 ) , randomFloat( 2 , 4 ) ).multiply( 0 );
        
        cB.noise().fill( 1 );
        cB.ramp( 0 , 1 , 0.01 , 0.015 , randomFloat( 0.05 , 0.2 ) , randomFloat( 2 , 4 ) ).multiply( 1 );
        
        c.setBuffer( cB.buffer );

        // DELAY

        const d = new Effect();
        d.randomEcho();
        d.on();
        d.output.gain.value = 0.125;

        // PAN 

        this.pan = new MyPanner2( 0 );

        this.buffer.connect( bG );
        bG.connect( o.frequencyInlet );
        o.connect( f );
        
        f.connect( this.pan );
        f.connect( c );
        f.connect( d );

        this.pan.connect( this.output );
        c.connect( this.output );
        d.connect( this.output );

    }

    play( time ){

        this.buffer.startAtTime( time );

    }

}