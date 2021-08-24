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

        // this.loadOverlappingWavesFM();
        this.loadResoTick();
        // this.loadSpliceFadePad();

    }

    start(){

        this.fadeFilter.start(1, 50);
		this.globalNow = audioCtx.currentTime;

        this.startResoTick();

    }

    loadResoTick(){

        this.resoTick1 = new ResoTick( this );
        this.resoTick1.load();

    }

    startResoTick(){

        const sL = 200;
        let s = new Sequence();
        let r = 0;

        s.randomFloats( sL , 0.1 , 1 );
        s.sumSequence();
        s.add( this.globalNow );

        s = s.sequence;

        const fund = 432 * 1 ;
        const iA = [ 1 , M2 , P5 , M6 , M3 ];
        const oA = [ 1 , 2 , 0.5 ];

        for( let i = 0 ; i < sL ; i++ ){

            this.resoTick1.play( s[ i ] );
            this.resoTick1.f.biquad.frequency.setValueAtTime( fund * randomArrayValue( iA ) * randomArrayValue( oA ) , s[ i ] );
            this.resoTick1.w.wG.gain.gain.setValueAtTime( randomFloat( 0.000025 , 0.0005 ) , s[ i ] );
            this.resoTick1.output.gain.gain.setTargetAtTime( randomFloat( 1 , 1 ) , s[ i ] , 0.2 );

            this.resoTick1.wG.gain.gain.setTargetAtTime( randomFloat( 1 , 1 ) , s[ i ] , 0.2 );
            this.resoTick1.d.output.gain.setTargetAtTime( randomFloat( 0 , 1 ) , s[ i ] , randomFloat( 0.1 , 0.3 ) );
            this.resoTick1.d2.output.gain.setTargetAtTime( randomFloat( 0 , 1 ) , s[ i ] , randomFloat( 0.1 , 0.3 ) );
            this.resoTick1.c.output.gain.setTargetAtTime( randomFloat( 1 , 1 ) , s[ i ] , 0.2 );

        }

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

    loadOverlappingWavesFM(){

        const nSounds = 5;

        this.soundArray = [];

        for( let i = 0 ; i < nSounds ; i++ ){

            this.soundArray[i] = new OverlappingWavesFM( this );
            this.soundArray[i].load( 2 );

        }

    }

    startOverlappingWaves(){

        const sL = 100;
        let s = new Sequence();
        let r = 0;

        s.randomFloats( sL , 5 , 5 );
        s.sumSequence();
        s.add( this.globalNow );

        s = s.sequence;

        for( let i = 0 ; i < sL ; i++ ){

            r = randomInt( 0 , this.soundArrayOW.length );

            this.soundArrayOW[ 0 ].play( s[ i ] );

        }


    }

    loadOverlappingWaves(){

        const nSounds = 1;

        this.soundArrayOW = [];

        for( let i = 0 ; i < nSounds ; i++ ){

            this.soundArrayOW[ i ] = new OverlappingWaves( this );
            this.soundArrayOW[ i ].load( 2 );

        }

    }

    startOverlappingWavesFM(){

        const sL = 100;
        let r = 0;

        for( let i = 0 ; i < sL ; i++ ){

            r = randomInt( 0 , this.soundArray.length );

            this.soundArray[ r ].play( i + this.globalNow );
            this.soundArray[ r ].pan.setPositionAtTime( randomFloat( -1 , 1 ) , i + this.globalNow );

        }

    }

    startOverlappingWavesFM2(){

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

class OverlappingWavesFM extends Piece {

    constructor( piece ){

        super();

        this.output = new MyGain( 4 );
        
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

class ResoTick extends Piece {

    constructor( piece ){

        super();

        this.output = new MyGain( 1 );
        
        this.output.connect( piece.masterGain );

    }

    load(){

        this.buffer = new MyBuffer2( 1 , 1 , audioCtx.sampleRate );
        this.buffer.inverseSawtooth( 10 ).fill( 0 );
        this.buffer.playbackRate = 1;

        // FILTER

        this.f = new MyBiquad( 'bandpass' , 432 , 10 );
        const f2 = new MyBiquad( 'lowpass' , 20000 , 1 );

        // WAVESHAPER

        this.w = new Effect();
        this.w.fmShaper( 432 * 1 , 432 * 2 , 432 * 2 , 1 );
        this.w.on();

        this.w2 = new Effect();
        this.w2.fmShaper( 432 * 1 , 432 * 2 , 432 * 2 , 0.00001 );
        this.w2.on();

        this.wG = new MyGain( 1 );

        // REVERB

        const cLength = 2;

        this.c = new MyConvolver( 2 , cLength , audioCtx.sampleRate );
        const cB = new MyBuffer2( 2 , cLength , audioCtx.sampleRate );
        const lB = new MyBuffer2( 2 , cLength , audioCtx.sampleRate );
        const rB = new MyBuffer2( 2 , cLength , audioCtx.sampleRate );

        let lStart = 0;
        let rStart = 0;
        let lEnd = 0;
        let rEnd = 0;

        this.iA = [ 1 , M2 , M3 , P5 , M6 ];
        const oA = [ 1 , 2 , 0.5 ];

        for( let i = 0 ; i < this.iA.length ; i++ ){

            lStart = randomFloat( 0 , 0.5 );
            lEnd = lStart + randomFloat( 0 , 1 - lStart );
            rStart = randomFloat( 0 , 0.5 );
            rEnd = lStart + randomFloat( 0 , 1 - lStart );

            cB.fm( this.iA[i] * 432 * randomFloat( 0.999 , 1.001 ) * randomArrayValue( oA ) , this.iA[i] * 432 * randomFloat( 0.999 , 1.001 ) * randomArrayValue( oA ) , 1 ).fill( 0 );
            cB.ramp( lStart , lEnd , 0.5 , 0.5 , randomFloat( 1 , 4 ) , randomFloat( 1 , 4 ) ).multiply( 0 );

            lB.bufferShape( cB.buffer ).add( 0 );

            cB.fm( this.iA[i] * 432 * randomFloat( 0.999 , 1.001 ) * randomArrayValue( oA ) , this.iA[i] * 432 * randomFloat( 0.999 , 1.001 ) * randomArrayValue( oA ) , 1 ).fill( 1 );
            cB.ramp( rStart , rEnd , 0.5 , 0.5 , randomFloat( 1 , 4 ) , randomFloat( 1 , 4 ) ).multiply( 1 );

            rB.bufferShape( cB.buffer ).add( 0 );

        }

        for( let i = 0 ; i < this.iA.length ; i++ ){

            lStart = randomFloat( 0 , 0.5 );
            lEnd = lStart + randomFloat( 0 , 1 - lStart );
            rStart = randomFloat( 0 , 0.5 );
            rEnd = lStart + randomFloat( 0 , 1 - lStart );

            cB.am( this.iA[i] * 432 * randomFloat( 0.999 , 1.001 ) * randomArrayValue( oA ) , this.iA[i] * 432 * randomFloat( 0.999 , 1.001 ) * randomArrayValue( oA ) , 1 ).fill( 0 );
            cB.ramp( lStart , lEnd , 0.01 , 0.015 , randomFloat( 0.1 , 2 ) , randomFloat( 1 , 4 ) ).multiply( 0 );

            lB.bufferShape( cB.buffer ).add( 0 );

            cB.am( this.iA[i] * 432 * randomFloat( 0.999 , 1.001 ) * randomArrayValue( oA ) , this.iA[i] * 432 * randomFloat( 0.999 , 1.001 ) * randomArrayValue( oA ) , 1 ).fill( 1 );
            cB.ramp( rStart , rEnd , 0.01 , 0.015 , randomFloat( 0.1 , 2 ) , randomFloat( 1 , 4 ) ).multiply( 1 );

            rB.bufferShape( cB.buffer ).add( 0 );

        }

        lB.normalize( -1 , 1 );
        rB.normalize( -1 , 1 );

        cB.bufferShape( lB.buffer ).fill( 0 );
        cB.bufferShape( rB.buffer ).fill( 1 );

        this.c.setBuffer( cB.buffer );

        // DELAY

        this.d = new Effect();
        this.d.stereoDelay( randomFloat(0.35, 0.6), randomFloat(0.35, 0.6), 0.3 );
        this.d.on();
        this.d.output.gain.value = 0.125;

        this.d2 = new Effect();
        this.d2.stereoDelay( randomFloat(0.35, 0.6), randomFloat(0.35, 0.6), 0.3 );
        this.d2.on();
        this.d2.output.gain.value = 1;

        // SCHWA

        this.s = new SchwaBox( 'ae' );
        this.s.output.gain.value = 0.025;

        // PAN 

        this.pan = new MyPanner2( 0 );

        this.buffer.connect( f2 );
        f2.connect( this.f );
        this.f.connect( this.w );

        this.w.connect( this.wG );
        this.w.connect( this.c );

        this.c.connect( this.d );
        this.c.connect( this.d2 );

        this.c.connect( this.output );
        this.d.connect( this.output );
        this.d2.connect( this.output );

        this.c.connect( this.s );
        this.s.connect( this.output );

    }

    play( time ){

        this.buffer.startAtTime( time );

    }

}