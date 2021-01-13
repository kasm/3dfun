
/*
TUDO:
1. array correctly shown
*/
//import * from "../live.js";
function MyTexture(THREE) {
    var r = {};


    var s81 = `
 ***   * *** *** * * *** *** *** *** ***
 * *  **   *   * * * *   *     * * * * *
 * *   * *** *** *** *** ***   * *** ***
 * *   * *     *   *   * * *   * * *   *
 ***   * *** ***   * *** ***   * *** ***
    `;

    var s81a = s81.split('\n');
    var s81s = '';
    var s81ai = [];
    for (var i=1; i<6; i++) {
        s81s += s81a[i];
    };
    for (var i=0; i<s81s.length; i++) {
        s81ai[i] = ((s81s[i] == '*') ? 1 : 0);
    }


    // rastr based
    r.addCircleRastr = function (dd, x, y, rad) { // data object (width, heigth, data, step)
        //console.log(x, y, rad)
        var w = dd.width;
        var y0 = y-rad;
        var y1 = y+rad;
        var x0 = x-rad;
        var x1 = x+ rad;
        var x0t = getTextureCoordByPlaneCoord(x0, dd.width, r.p1.uniforms.planeSizeX.value);
        var y0t = getTextureCoordByPlaneCoord(y0, dd.height, r.p1.uniforms.planeSizeY.value);
        if (x0t<0) x0t=0;
        if (y0t<0) y0t=0;
        var x1t = getTextureCoordByPlaneCoord(x1, dd.width, r.p1.uniforms.planeSizeX.value);
        var y1t = getTextureCoordByPlaneCoord(y1, dd.height, r.p1.uniforms.planeSizeY.value);

        if (x1t>dd.width) x1t = dd.width;
        if (y1t>dd.height-1) y1t=dd.height-1;
        x1t = Math.trunc(x1t);
        y1t = Math.trunc(y1t);
        x0t = Math.trunc(x0t);
        y0t = Math.trunc(y0t);
        //console.log('x0t, y0t', x0t, y0t)

        for (var i = y0t; i<y1t; i++) {
            for (var j=x0t; j<x1t; j++) {
                var adr = getAddrByCoords4(dd.data, j, i, dd.width);
                var dx = j-x; var dy=i-y;
                var px = getPlaneCoordByTextureCoord(j, r.p1.uniforms.planeSizeX.value, dd.width);
                var py = getPlaneCoordByTextureCoord(i, r.p1.uniforms.planeSizeY.value, dd.height);
                dx = px - x; dy = py - y;
                var r1 = Math.sqrt(dx*dx +dy*dy);
                if (dx*dx + dy*dy < rad*rad) {
                    dd.data[adr] = 254;
                    dd.data[adr+3] = 1; //* r1/r;
                }
            }
        }
    };

    r['line_point_point'] = function(rez, p0, p1) {
        var a = p0[1] - p1[1];
        var b = p1[0] - p0[0];
        var d = Math.sqrt(a*a + b*b);
        var c = (p0[0]*p1[1] - p1[0]*p0[1]) / d;
        a = a/d; b = b/d;
        rez[0] = a; rez[1] = b; rez[2] = c;
        return rez;
    };
    r['distance_point_line'] = function (point, line) {
        var d = Math.sqrt(line[0]*line[0] + line[1]*line[1]);
        var an = line[0] / d;
        var bn = line[1] / d;
        var cn = line[2] / d;
        return an * point[0] + bn*point[1] + cn;
    };

    r.getPolyLines = function(poly) {
        var points = [];
        for (var i=0; i<poly.length / 2; i++) {
            points[i] = [poly[i*2], poly[i*2 + 1]];
        };
        var center = [0, 0];
        for (var i=0; i<points.length; i++) {
            center[0] += points[i][0] / points.length;
            center[1] += points[i][1] / points.length;
        };
        var linesegs = [];
        var lines = [];
        var dists = [];
        for (var i=0 ; i<points.length; i++) {
            linesegs[i] = [ points[i], points[ (i+1) % points.length] ];
            lines[i] = [];
            r.line_point_point(lines[i], linesegs[i][0], linesegs[i][1])
            dists[i] = r.distance_point_line(center, lines[i])
        };
        return lines;
    };

    r.isInside = function(point, lines) {
        var inside = true;
        var color = .0031111;
        for (var i=0; i<lines.length; i++) {
            if (r.distance_point_line(point, lines[i]) < 0) return 0;
            color *= r.distance_point_line(point, lines[i]);
        }
        if (color > 222) color = 222;
        return color;
    };

    r.addPolysRastr = function(dd, polys) {
        var lines = [];
        for (var i=0; i<polys.length; i++) lines[i] = r.getPolyLines(polys[i]);
        for (var i = 0; i<dd.height; i++) {
            for (var j=0; j<dd.width; j++) {
                var adr = getAddrByCoords4(dd.data, j, i, dd.width);
                var px = getPlaneCoordByTextureCoord(j, r.p1.uniforms.planeSizeX.value, dd.width);
                var py = getPlaneCoordByTextureCoord(i, r.p1.uniforms.planeSizeY.value, dd.height);
                for (var jj=0; jj<lines.length; jj++) {
                    if (px > 30 && px < 49 && py > 0 && py < 10) {
                        //debugger;
                    }
                    if (r.isInside([px, py], lines[jj])) {
                        //dd.data[adr] = 222;
                        dd.data[adr] = r.isInside([px, py], lines[jj]);
                    };

                }
            }
        }
    }

    r.addCircleVector = function(dd, x, y, r1) {

        var n = r.p1.currentCircle*4;
        function getBytesCoord(x, size) {
            var r = 256 * (x + size/2) / size;
            r = Math.trunc(r);
            return r;
        }

        dd.data[n] = getBytesCoord(x, r.planeSizeX);// + r.planeSizeX / 2;
        dd.data[n+1] = getBytesCoord(y, r.planeSizeY);// + r.planeSizeY / 2;
        dd.data[n+2] = r1 * 256 / r.planeSizeX;
        r.p1.currentCircle++;
    }; // addCircle2


    var pOrig = true;
    if(pOrig) {
        r.pOrig = {
            vShader: `
            varying vec2 vUv;
            varying vec4 pos2;
            varying float he;
            uniform float ux;
            uniform float uy;
            uniform float dotsx[120];
            uniform float dotsy[120];
            uniform int dotsn;
            varying float tc2;
            varying float tc1;
            varying float tcn;
            varying float vdata2;
            //uniform sampler2D texData2;

            void main()
            {
            vUv = uv;
                        //vec4 data2 = texture2D(texData2, vUv);
                        //vdata2 = data2[0];


            float dx = position[0] - ux;
            float dy = position[1] - uy;

            float r2 = (dx*dx + 3.0*dy*dy)*.001;
            float change = 0.0;
            if (r2 < 0.15) {
              change = 1.0 - r2;
            };
            tc2 = r2; //change/1.0;
            he = position[2];
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            float dx1 = mvPosition[0] - 0.8;
            float dy1 = mvPosition[1];// - 0.1;
            tc1 = (dx1*dx1 + dy1*dy1)*0.0029;
            pos2 = projectionMatrix * mvPosition;
            gl_Position = projectionMatrix * mvPosition;

            //he = gl_Position[1];
            //gl_Position[2] = position[0]*position[0];

            //gl_Position = 1.0 * mvPosition;
            //gl_Position = vec4( position* 1.2, 1.0 );s


            for (int i=0; i<120; i++) {
              dx = position[0] - dotsx[i];
              dy = position[1] - dotsy[i];
              float r = dx*dx + dy*dy;
              if ( (dx*dx + dy*dy) < 200.0) {
                //gl_Position[1] += r/11.; //+= 10.14102;
                tcn = -0.99;
              };
            };
            //if (dotsx[0] < position[0])
            }
        `,

            fShader: `
                    //varying vec4 vColor;
            varying vec2 vUv;
            varying vec4 pos2;
            varying float he;
            uniform sampler2D originalTexture;
            //uniform sampler2D texture2;
            uniform sampler2D texData2;
            uniform float ux;
            uniform float uy;
            varying float tc2;
            varying float tc1;
            varying float tcn;
            varying float vdata2;


            void main( void ) {

            vec2 position = vUv; //-1.0 + 2.0 * vUv;
            /*
                float red = abs( sin( position.x * position.y + time / 5.0 ) );
                float green = abs( sin( position.x * position.y + time / 4.0 ) );
                float blue = abs( sin( position.x * position.y + time / 3.0 ) );
                //gl_FragColor = vec4( red, green, blue, 1.0 );
                float x = position[0];
                float y = position[1];
                float k = 10.0;
                float c = fract(x*x*k + y*y*k)*(1.5 + sin(time/3.0));
            */
            float c = 0.2;
            gl_FragColor = vec4( vUv[0], vUv[1] , position[1]*1.0, 0.0 );
            //gl_FragColor = texture2D(originalTexture, vUv*1.0);
            //vec4 dd = texture2D(texture2, vUv);
            vec4 data2 = texture2D(texData2, vUv);

            float dx = position[0] - ux;
            float dy = position[1] - uy;
            //if ((position[0] - ux)^2.0 && (position[1] > uy)) gl_FragColor[1] = 1.0;
            float r2 = (dx*dx + dy*dy)*3.0;

            if (r2 < 11110.101) {
            //gl_FragColor[0] = 1.0;
            gl_FragColor[1] = tc2;
            //gl_FragColor[2] += tc1;
            gl_FragColor[3] = 1.0 - r2;
            //gl_FragColor[1] = he*.05;
            };
            //gl_FragColor[1] = tc2;
            //gl_FragColor[0] += tc1;
            gl_FragColor[2] += tcn;
            float d23 = data2[3];
            gl_FragColor[0] = d23*222222.0 * d23;
            //gl_FragColor[1] = data2[0];
            gl_FragColor[0] = data2[0];
            //gl_FragColor[1] = data2[1];
            //gl_FragColor[2] = data2[2];
            
            //gl_FragColor[1] = 0.0;
            //if (position[0] > 0.5) gl_FragColor[1] = 110.0; 
            gl_FragColor[3] = 1.0;//data2[3];

            }
        `
        };

        var tss = 'void main(void) { gl_FragColor[0] = 110.0; gl_FragColor[3] = 110.0; }'

        r.pOrig.uniforms =  {
            ux: {type: 'f', value: 40.1},
            uy: {type: 'f', value: 10.5},
            originalTexture: {
                type: 't',
                value: {}
            },
            /*
                    texture2: {
                        type: 't',
                        value: texture2
                    },*/
            texData2: {
                type: 't',
                value: {} //app.textureData2
            },
            dotsn: {
                type: 'i', value: 3
            },
            dotsx: {
                type: 'fv',
                value: [
                    10.0, -30.0, 20.0
                ]
            },
            dotsy: {
                type: 'fv',
                value: [
                    33.0, -35.0, 20.0
                ]
            }
        };
        r.pOrig.width = 200;
        r.pOrig.height = 200;

    }; // ORIGINAL





    r.rastrff = {                    // rastrff  -  background and circle textures are in fragment shader
        vShader: `
        varying vec2 vUv;
        void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
        }`,
        fShader: `
        varying vec2 vUv;
        uniform sampler2D originalTexture;
        uniform sampler2D texData2;
        
        void main( void ) {
        gl_FragColor = texture2D(originalTexture, vUv);
        vec4 data2 = texture2D(texData2, vUv);
        gl_FragColor[0] = data2[0];
        }`,
        uniforms:  {
            originalTexture: {
                type: 't',
                value: {}
            },
            texData2: {
                type: 't',
                value: {} //app.textureData2
            }
        },
        addCircle: r.addCircleRastr,
        width: 1200,
        height: 1200
    }; //                                             END rastrff


    r.rastrfv = { //                    background in fragment, circle in vertex shader
        vShader: `
            varying vec2 vUv;
            varying vec4 texDataColor; 
            uniform sampler2D texData2;
           
            void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            texDataColor = texture2D(texData2, vUv);
            gl_Position = projectionMatrix * mvPosition;
            }`,
        fShader: `
            varying vec4 texDataColor;
            varying vec2 vUv;
            uniform sampler2D originalTexture;
            
            void main( void ) {
            gl_FragColor = texture2D(originalTexture, vUv);
            gl_FragColor[0] = texDataColor[0]; // / 255.0;
            //gl_FragColor[0] = 255.0;
            }`,
        uniforms:  {
            originalTexture: {
                type: 't',
                value: {}
            },
            texData2: {
                type: 't',
                value: {} //app.textureData2
            }
        },
        addCircle: r.addCircleRastr,
        width: 500,
        height: 500
    };


    r.rastrvv = { //                        both textures in vertex shader
        vShader: `
            varying vec2 vUv;
            varying vec4 texDataColor; 
            uniform sampler2D texData2;
            uniform sampler2D originalTexture;
                       
            void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            texDataColor = texture2D(originalTexture, vUv);
            vec4 tt = texture2D(texData2, vUv);
            texDataColor[0] = tt[0];
            gl_Position = projectionMatrix * mvPosition;
            }`,
        fShader: `
            varying vec4 texDataColor;
            varying vec2 vUv;
            
            void main( void ) {
            gl_FragColor = texDataColor; // / 255.0;
            }`,
        uniforms:  {
            originalTexture: {
                type: 't',
                value: {}
            },
            texData2: {
                type: 't',
                value: {} //app.textureData2
            }
        },
        addCircle: r.addCircleRastr,
        width: 500,  // size of shadow texture
        height: 500
    };

// https://www.john-smith.me/hassles-with-array-access-in-webgl-and-a-couple-of-workarounds.html
    r.data8 = {                                     // DATA8
        vShaderWork: `
            varying vec2 vUv;
            varying vec4 texDataColor; 
            uniform sampler2D texData2;
            uniform sampler2D originalTexture;
            uniform float nCircles;
            uniform float width;
            uniform float height;
                       
            void main() {
            vUv = uv;
            
            //int i;
            float d =0.0;
            for (int i=0; i< 1; i++) {
              vec4 tt = texture2D(texData2, vec2(1./32., 0.)); //float(i))); //+.0, 0.0));
                                //float x = texData2[int(float(i)*4.0+4.0)];
              float x0 = tt[0] - tt[2];
              float x1 = tt[0] - tt[2];
              float y0 = tt[1] - tt[2];
              float y1 = tt[1] + tt[2];
                                //float y = texData2[i*4.0+1.0];
                                //float r = texData2[i*4.0+2.0];
              if (position[0]>tt[1]* 511.0) d=222.0; //position[0];
              float xx1 = position[0];
              float yy1 = position[1];
              float k = .10;
              //if ( (xx1>x0*k) && (xx1<x1*k) && (yy1>y0*k) && (yy1<y1*k)) d=244.0;
              //if ( (xx1>10.1) && (xx1<210.2) && (yy1>10.1) && (yy1<20.2)) d=244.0;
            }
            
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            texDataColor = texture2D(originalTexture, vUv);
            //vec4 tt = texture2D(texData2, vUv);
            texDataColor[0] = d; //tt[0];
            gl_Position = projectionMatrix * mvPosition;
            }`,



        vShader: `
            varying vec2 vUv;
            varying vec4 texDataColor; 
            uniform sampler2D texData2;
            uniform sampler2D originalTexture;
            uniform float nCircles;
            uniform float planeSizeX;
            uniform float planeSizeY;
            uniform int digs[200];
            
            
            float denorm2(float x, float size) {
              float r =  (size * (x / 1. - .5));
              return r;
            }
            
            float norm2(float x, float size) {  // -size/2 .. +size/2  => 0..1
                float r = x / size + 0.5;
                return r;
            }
            
            int arv(int ii) {
                for (int i=0; i<2222; i++) {
                    if (i == ii) return digs[i];
                };               
            }            
            
            float printDigit(float x, float y, int d, float r0) {
                float dx = 10.; float dy=10.; float r = r0;
                float px = position[0]; float py = position[1];
                if (px < x - 0. * dx || py < y - 0. * dy || px > x + 4. *dx || py > y + 5.*dy) return r;
                int ix = int( (px - x) / dx ); int iy = int( (py - y) / dy);
                return float(arv(d*4 + (4 -iy) * 40 + ix));
            }
            
            float printDigits(float x, float y, int dd, float r0) {
                float r = r0;
                int curr = dd;
                int t;
                for (int i =0; i< 3; i++) {
                    t = int(curr / 10);
                    r = printDigit(x + 50. * float(2-i), y, curr - t * 10, r);
                    curr = t;
                };
                return r;                
            }
            
            
                                        float applyCircles(int n) {
                float xx1 = position[0];
                float yy1 = position[1];
                float d = 0.;
                for (int i=0; i<116; i++) {
                    if (i > n) return d;                    
                    //                    data        x             y (in texData2)
                    vec4 tt = texture2D(texData2, vec2(float(i)/321., 0.));  // 0 .. 1                    
                    //d = printDigits(-80., -150., tt[0], d);
                    float x0 = tt[0] - tt[2];
                    float x1 = tt[0] + tt[2];
                    float y0 = tt[1] - tt[2];
                    float y1 = tt[1] + tt[2];
                    x0 = denorm2(x0, planeSizeX); // 0..1 => -size/2 .. +size/2
                    x1 = denorm2(x1, planeSizeX);
                    y0 = denorm2(y0, planeSizeY);
                    y1 = denorm2(y1, planeSizeY);
                    if ( (xx1>x0) && (xx1<x1) && (yy1>y0) && (yy1<y1)) d= 244.0;
                };
            }
            
            float applyCircles2(int n) {
                float xx1 = norm2(position[0], planeSizeX);
                float yy1 = norm2(position[1], planeSizeY);
                float d = 0.;
                for (int i=1; i<111; i++) {
                    if (i > n) return d;
                    vec4 tt = texture2D(texData2, vec2(float(i)/321., 0.));
                    //vec4 tt = texture2D(texData2, vec2(float(22)/321., 0.));
                    d = printDigits(-80., -150., int(tt[0] * 256.), d);
                    float x = tt[0];
                    float y = tt[1];
                    float r = tt[2];
                    float dx = xx1 - x; float dy = yy1 - y;
                    if ( (dx*dx + dy*dy) <= r*r) d = 1.;
                    //if ( xx1 < .1) d = 111.;
                };
            }

            void main() {
            vUv = uv;
            float xx1 = position[0];
            float yy1 = position[1];
            float d = applyCircles2(int(nCircles));
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);            
            texDataColor = texture2D(originalTexture, vUv);
                        
            if ( (xx1>-55.1) && (xx1<-5.2) && (yy1>-44.1) && (yy1<-15.2)) texDataColor[2]=.0;

            texDataColor[0] = d; 
            gl_Position = projectionMatrix * mvPosition;
            }`,

        fShader: `
            varying vec4 texDataColor;
            varying vec2 vUv;            
            void main( void ) {
            gl_FragColor = texDataColor;
            }`,
        uniforms:  {
            originalTexture: {type: 't',value: {} },
            texData2: {type: 't',value: {} },
            digs: {type: 'iv', value: s81ai}

            //nCircles: {type: 'f',value: 4.0},
            //width: {type: 'f', value: 200},
            //height: {type: 'f', value: 400}
        },
        addCircle: r.addCircleVector,
        width:1222,
        height: 1111,

    }; // data8




    //                                          DATA16  (81)
    r.circleTableAddress = 48;
    r.circlesAddress = 0;
    r.cellsPerX = 5;
    r.cellsPerY = 5;
    r.maxCirclesPerCell = 2;
    r.bytesPerCircleNumber = 4;


    r.addCircle16 = function (dd, x, y, r1) {
        var n = r.p1.currentCircle * 8; // 16bit presision
        //var n = r.p1.currentCircle * 4; // 16bit presision will use setInt16

        //var maxCirclesPerCell = 3;
        // bytes per circle number = 2
        //for (var i=0; i< cellsPerY * cellsPerX; i++) dd.cells[i] = 0;
        function getCellByCoord(dd, x, y, r1) {
            var tx = Math.trunc(r.cellsPerX * (x / r.planeSizeX + 0.5));
            var ty = Math.trunc(r.cellsPerY * (y / r.planeSizeY + 0.5));
            return ty * r.cellsPerY + tx;
        };
        function getCellAddr(cellCoord) {
            return cellCoord * r.maxCirclesPerCell * r.bytesPerCircleNumber; // + r.circleTableAddress;
        }
        function getBytesByCoord(x, size) {
            var r = 65536 * (x+size/2) / size;
            //r = 65536 *x / size;
            r = Math.trunc(r);
            //console.log('sss', x, size, r);
            return r;
        };
        var view = new DataView(dd.data.buffer, n + r.circlesAddress);
        var viewt = new DataView(dd.data.buffer, r.circleTableAddress);
        var cc = getCellByCoord(dd, x, y, r1);
        var ca = getCellAddr(cc) + dd.cells[cc] * 2;
        dd.cells[cc]++;
        //console.log(cc, ca, dd.cells)
        viewt.setInt16(ca, r.p1.currentCircle)
        view.setUint16(0, getBytesByCoord(x, r.planeSizeX));
        //view.setInt16(0, getBytesByCoord(x, r.planeSizeX));
        var aa;
        var bu = view.buffer
        aa =  getBytesByCoord(y, r.planeSizeY)

        try {
            view.setUint16(2,aa);
        } catch (e) {
            console.log(e)
            var t;
            debugger
        }

        view.setUint16(4, r1 * 65536 / r.planeSizeY);
        r.p1.currentCircle++;
    };



    r.data81 = {
        vShader: `
            varying vec2 vUv;
            varying vec4 texDataColor; 
            uniform sampler2D texData2;
            uniform sampler2D originalTexture;
            uniform float nCircles;
            uniform float planeSizeX;
            uniform float planeSizeY;
            uniform int maxCirclesPerCell;
            uniform int circleTableAddress;
            uniform int digs[200];

            
            varying float glPos;            
            
            float get16int(float b0, float b1) {
                float r = (b0*256.) * 256. + b1 * 256.;
                return r;
            }
            
            float get65kpos(float x, float size) { 
                float r = 65536. * ( x / size + .5 );
                return r;  
            }
            //int aa[5](0, 1, 1, 0, 1);
            
            int arv(int ii) {
                for (int i=0; i<2222; i++) {
                    if (i == ii) return digs[i];
                };               
            }
            
            float getColorDigit(float d) {                
                float startX = -50.;
                float startY = -170.;
                float dx = 10.;
                float dy = 10.;
                float r = d;
                int index = int( (position[0] - startX) / dx );
                if (position[1] > startY && position[1] < startY + dy &&
                    position[0] > startX && position[0] < startX + dx * 15.) r = float(arv(index))*220.;                    
                return r;  
            }
            
            float printDigit(float x, float y, int d, float r0) {
                float dx = 8.; float dy=8.; float r = r0;
                float px = position[0]; float py = position[1];
                if (px < x - 0. * dx || py < y - 0. * dy || px > x + 4. *dx || py > y + 5.*dy) return r;
                int ix = int( (px - x) / dx ); int iy = int( (py - y) / dy);
                return float(arv(d*4 + (4 -iy) * 40 + ix));
            }
            
            float printDigits(float x, float y, int dd, float r0) {
                float r = r0;
                int curr = dd;
                int t;
                for (int i =0; i< 4; i++) {
                    t = int(curr / 10);
                    r = printDigit(x + 50. * float(2-i), y, curr - t*10 , r); // !!! 10 digits !!!
                    curr = t;
                };
                return r;                
            }
            
            /*            
start:
1   2   3   4   5   texture indexes
0123456789          bytes
012301230123012301230123    bytes in texels
0               1               2       // claster cell, numbers
5   7           4               -       // numbers of circles in claster 
            
            */
            
            float applyCircles(int n) {
                float xx1 = get65kpos(position[0], planeSizeX);
                float yy1 = get65kpos(position[1], planeSizeY);
                float d = 0.;
                for (int i=1; i<111; i++) {
                    if (i > n) return d;
                    vec4 tt = texture2D(texData2, vec2(float(i*2 -1) /3211., 0.));                    
                    vec4 tt1 = texture2D(texData2, vec2( (float(2*i) )/3211., 0.));
                    //d = printDigits(-70., -150., int(tt1[0]*256.), d);
                    float x65 = get16int(tt[0], tt[1]);
                    float y65 = get16int(tt[2], tt[3]);
                    float r = get16int(tt1[0], tt1[1]);
                    float dx = xx1 - x65;
                    float dy = yy1 - y65;
                    if ( (dx*dx + dy*dy) <= r*r) d = 222.;
                }
                return d;                        
            }
            
            int getClasterCell(float x, float y) {  
                int ix = int(5.*x); int iy = int(5.*y);
                int bytesPerValue = 4;
                int bytesPerTexel = 4;
                int adr =  1+(circleTableAddress + maxCirclesPerCell * (iy* 5 + ix) * bytesPerValue) / 
                    bytesPerTexel;   
                return adr;
            }
            
            
            
            void main() {
            vUv = uv;
            float xx1 = get65kpos(position[0], planeSizeX);
            float yy1 = get65kpos(position[1], planeSizeY);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            texDataColor = texture2D(originalTexture, vUv);
            float d = 0.;
            float g = 0.;
            d = applyCircles(int(nCircles));
            int adr = getClasterCell(xx1 / 65536., yy1/65536.);
            d = printDigits(-70., -120., adr, d);
            vec4 tt = texture2D(texData2, vec2(float(adr) /3211., 0.));
            d = printDigits(-70., -180., int(tt[1]*256.), d);
            if (tt[1] > 13. / 256.) g = 222.;
            texDataColor[0] = d;
            texDataColor[1] = g;
            
            
            gl_Position = projectionMatrix * mvPosition;
            glPos = mvPosition[0];
            glPos = gl_Position[0];
            glPos = position[0];
            }`,
        fShader: `
            varying vec4 texDataColor;
            varying vec2 vUv;
            varying float glPos;            
            void main( void ) {
            gl_FragColor = texDataColor;
            //gl_FragColor[0] = glPos / 60.;
            }
        `,
        uniforms: {
            originalTexture: {type: 't',value: {} },
            texData2: {type: 't',value: {} },
            maxCirclesPerCell: {type: 'i', value: r.maxCirclesPerCell},
            planeSizeX: {type: 'f', value: r.planeSizeX},
            planeSizeY: {type: 'f', value: r.planeSizeY},
            circleTableAddress: {type: 'i', value: r.circleTableAddress},
            digs: {type: 'iv', value: s81ai}
        },
        addCircle: r.addCircle16,
        width: 3211,
        height: 1
    }; //                                           data16

    r.circles = [

        {x:-100.1,y:10,r:11},
        {x:-59,y:-181,r:10},
        {x:88,y:-15,r:3},
        {x:50,y:0,r:11},
        {x: -33, y: 6, r: 22},
        {x: 100, y: -181, r: 10}
    ];

    for (var i=0; i<21; i++) {
        r.circles.push({x: Math.random()* 100, y: Math.random()*100, r: 10})
    }


    r.polys = [
        [0, 0,   50,0,  40,50,  20,50],
        [0, 60,   50,60,  40,110,  10,140],
        [0, -160,   50,-160,  40,-80,  10,-110]
    ];



    /*
    create several squares
    for each square store list of shadows
    when shadow changes position, then reconsider placement of shadow in the squares

     */




    //r.p1.dataTexture;

    var current = 'data8';
    //current = 'data16'
    r.p1 = r[current];
    //r.p1.width = 3;
    //r.p1.height = 1;

    function createTextureData (x, y) {
        var size = x*y;
        var a = new Uint8Array( size * 14);
        for (var i=0; i<a.length; i++) a[i]=0;
        var dd = {
            width: x,
            height: y,
            cells: [],
            data: a     // this field for texture
        };
        return dd;
    };

    r.getFormattedData = function(data) {
        var bytesPerLine = 16;
        var count = 0;
        var a = [];
        var aadr = 0;
        for (var i=0; i<333; i++) {
            aadr = Math.trunc( i /bytesPerLine);
            if (i % bytesPerLine == 0) a[ Math.trunc(i / bytesPerLine)] = '';
            a[aadr] += ((data[i] < 10) ? ' ' : '') + data[i] +' ';
        }
        return a;
    }
    
    r.createMaterial = function (p, originalTexture) {
        p.uniforms.originalTexture.value = originalTexture;
        p.uniforms.planeSizeX = {type: 'f', value: r.planeSizeX};
        p.uniforms.planeSizeY = {type: 'f', value: r.planeSizeY};
        p.dd = createTextureData(p.width, p.height);
        p.dataTexture = new THREE.DataTexture( p.dd.data, p.dd.width, p.dd.height, THREE.RGBAFormat);
        this.addCircles(p.dd);

        var bb = r.addPolysRastr(p.dd, r.polys)

        p.uniforms.texData2.value = p.dataTexture; // p.dd.data;
        console.log(r.planeSizeX)
        console.log('uuu',p.uniforms)
        console.log('data', p.uniforms.texData2.value.image.data);
        var bb = r.getFormattedData(p.uniforms.texData2.value.image.data)
        console.log(bb);
        console.log('cells ', p.dd.cells);
        var shaderMaterial = new THREE.ShaderMaterial(
            { uniforms: p.uniforms, vertexShader: p.vShader, fragmentShader: p.fShader}
        );
        return shaderMaterial;
    }


    function  getAddrByCoords4(d, x, y, width) { // data, coords, width
        return (4 * (y*width +x));
    };

    function getTextureCoordByPlaneCoord(x, textureSize, planeSize) {
        var r= (x / planeSize + 0.5) * textureSize ;
        return r;
    };
    function getPlaneCoordByTextureCoord(x, planeSize, textureSize) {
        var r = (x / textureSize - 0.5) * planeSize;
        return r;
    }


    r.addElements = function (dd, elements, cb) {
        for (var i =0; i<elements.length; i++) {
            cb(dd, elements[i].x, elements[i].y, elements[i].r);
        }
    };

    r.addCircles = function (dd) {
        r.p1.uniforms.nCircles = {t: 'f', value: r.circles.length}; ///   only for several cases
        r.p1.currentCircle = 0;
        var im = r.p1.uniforms.texData2.value.image;
        //dd.data.fill(20, 0, dd.data.length);
        dd.cells = Array(32);
        dd.cells.fill(0, 0, 32);
        r.addElements(dd, r.circles, r.p1.addCircle);
        //console.log('cells print', dd.cells);
        var v = new Uint8Array(dd.data.buffer, 100, 200);
        //console.log(v)
    };



    return r;
}



export {MyTexture}