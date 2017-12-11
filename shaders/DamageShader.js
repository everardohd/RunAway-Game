/**
 * based SepiaShader.js
 */

THREE.DamageShader = {
    
        uniforms: {
    
            "tDiffuse": { value: null },
            "amount":   { value: 1.0 }
    
        },
    
        vertexShader: [
    
            "varying vec2 vUv;",
    
            "void main() {",
    
                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    
            "}"
    
        ].join( "\n" ),
    
        fragmentShader: [
    
            "uniform float amount;",
    
            "uniform sampler2D tDiffuse;",
    
            "varying vec2 vUv;",
    
            "void main() {",
    
                "vec4 color = texture2D( tDiffuse, vUv );",
                "vec3 c = color.rgb;",    
                "color.r = c.r * amount;",
                "color.g = c.g;",
                "color.b = c.b;",    
                "gl_FragColor =  vec4(color.rgb , color.a);",
    
            "}"
    
        ].join( "\n" )
    
    };
    