import {Effects} from "./effects.js";



// NO SPRITE SYSTEM BECAUSE NEED TO GET COORDINATES OF PLANES !!!!!!!!!!!!
function Geom(THREE, app) {
    var r = {    };
    var textureLoader = new THREE.TextureLoader();
    var mapC = textureLoader.load( "../mylib/example.png" );
    var spriteMaterial = new THREE.SpriteMaterial({map: mapC, color: 0xff0066, fog: false});

    r.linePP = function (p0, p1) {
        var a= p0[1] - p1[1];
        var b = p1[0] - p0[0];
        var d = Math.sqrt(a*a + b*b);
        var c = (p0[0]*p1[1] - p1[0]*p0[1]) / d;
        a = a/d; b = b/d;
        return [a, b, c];
    };

    r.linePP3 = function(p0, p1) {

    };

    r.getAddrByMeshCoords = function(geom, i, j) { // i  - y, j - x
        var arr = geom.attributes.position.array;
        var nx = geom.parameters.widthSegments;
        var ny = geom.parameters.heightSegments;
        var addr = 3 * (i*nx + j);
        return ({ar: arr, adr: addr});
    };

    r.clasterize = function(geom, m, n, k) { // array of vertexes, number of divisions m - x, n - y, k - z
        var nx = geom.parameters.widthSegments;
        var ny = geom.parameters.heightSegments;
        geom.computeBoundingBox();
        var bb = geom.boundingBox;

        var dx0 = bb.min.x; var dx = bb.max.x - bb.min.x;
        var dy0 = bb.min.y; var dy = bb.max.y - bb.min.y;
        var dz0 = bb.min.z; var dz = bb.max.z - bb.min.z;
        var a0 = [];
        for (var i=0; i< m*n*k; i++) a0.push([]);
        function getNumber(x, xmax, n) {
            var r =  Math.trunc( n * x / xmax);
            if (r === n) r--;
            return r;
        };
        function getClasterAdr(x, y, z) {
            return (x + n * (y + n*z));
        }
        function getClasterCoords(ar, adr) {
            var x = ar[adr+0] - dx0;
            var y = ar[adr+1] - dy0;
            var z = ar[adr+2] - dz0;
            return [
                getNumber( x, dx, m),
                getNumber( y, dy, n),
                getNumber( z, dz, k)
            ]
        }; // getClaster coords
        
        function getClaster() {
            for (var i=0; i<ny; i++) {
                for (var j=0; j<nx; j++) {
                    var {ar, adr} = r.getAddrByMeshCoords(geom, i, j);
                    var cc = getClasterCoords(ar, adr);
                    var clasterAdr = getClasterAdr(cc[0], cc[1], cc[2]);
                    a0[clasterAdr].push([i, j]);
                }
            }
        }
        getClaster();
        return a0;
    }; // clasterize

    r.distancePL = function (point, line) {
        var d = Math.sqrt(line[0] * line[0] + line[1]*line[1]);
        var an = line[0] / d;
        var bn = line[1] /d;
        var cn = line[2] / d;
        return (an*point[0] + bn*point[1] + cn);
    };


    r.getRelBox = function (mesh) {
        mesh.geometry.computeBoundingBox();
        var gbb = mesh.geometry.boundingBox;
        var vs = [];
        vs.push(new THREE.Vector3(gbb.min.x, gbb.min.y, gbb.min.z)); // 0
        vs.push(new THREE.Vector3(gbb.min.x, gbb.min.y, gbb.max.z)); // 1
        vs.push(new THREE.Vector3(gbb.min.x, gbb.max.y, gbb.min.z)); // 2
        vs.push(new THREE.Vector3(gbb.min.x, gbb.max.y, gbb.max.z)); // 3
        vs.push(new THREE.Vector3(gbb.max.x, gbb.min.y, gbb.min.z)); // 4
        vs.push(new THREE.Vector3(gbb.max.x, gbb.min.y, gbb.max.z)); // 5
        vs.push(new THREE.Vector3(gbb.max.x, gbb.max.y, gbb.min.z)); // 6
        vs.push(new THREE.Vector3(gbb.max.x, gbb.max.y, gbb.max.z)); // 7
        return vs;
    };



    r.shadowMatrix = function(ps, meshCenter) { // rez: {m: matrix, pos: pos}

        function getCenter(ns) {
            var r = {x:0, y: 0, z: 0};
            for (var i=0; i<ns.length; i++) {
            //    r.x += ps[ns[i]].position.x;
              //  r.y += ps[ns[i]].position.y;
                //r.z += ps[ns[i]].position.z;
                r.x += ps[ns[i]].x;
                r.y += ps[ns[i]].y;
                r.z += ps[ns[i]].z;
            }
            r.x = r.x/ns.length;r.y = r.y/ns.length;r.z = r.z/ns.length;
            return r;
        };

        function getLen(p0, p1) {
            var dx = p0.x - p1.x;
            var dy = p0.y - p1.y;
            var dz = p0.z - p1.z;
            var r = Math.sqrt(dx*dx + dy*dy+ dz*dz);
            return r;
        }

        var cxmin = getCenter([0, 1, 2, 3]);
        var cxmax = getCenter([4, 5, 6, 7]);
        var cymin = getCenter([0, 1, 4, 5]);
        var cymax = getCenter([2, 3, 6, 7]);
        var czmin = getCenter([0, 2, 4, 6]);
        var czmax = getCenter([1, 3, 5, 7]);
        var c = getCenter([0, 1, 2, 3, 4, 5, 6, 7]);

        var xlen = {}; xlen.l = getLen(cxmin, cxmax); xlen.min = cxmin; xlen.max = cxmax;
        var ylen = {}; ylen.l = getLen(cymin, cymax); ylen.min = cymin; ylen.max = cymax;
        var zlen = {}; zlen.l = getLen(cymin, czmax); zlen.min = czmin; zlen.max = czmax;

        var lens = [xlen, ylen, zlen];
        lens.sort((a, b) => (a.l - b.l));

        var line = r.linePP([lens[2].min.x, lens[2].min.z], [lens[2].max.x, lens[2].max.z]);
        var r0 = Math.abs(r.distancePL([lens[0].min.x, lens[0].min.z], line));
        var r1 = Math.abs(r.distancePL([lens[1].min.x, lens[1].min.z], line));
        if (r0>r1) {
            lens[1].min = lens[0].min;
            lens[1].max = lens[0].max;
            r1 = r0;
        }

        var rez = {};
        rez.pnts = [lens[2].min, lens[2].max, lens[1].min, lens[1].max];
        rez.l = getLen(rez.pnts[0], rez.pnts[1]);// + r0;
        rez.l = lens[2].l;// + r0;
        //console.log('lens', lens, lens[2].min, lens[2].max);
        var lmin = getLen(lens[2].min, meshCenter);
        var lmax = getLen(lens[2].max, meshCenter);
        var ddx = lens[2].max.x - lens[2].min.x;
        var ddy = lens[2].max.z - lens[2].min.z;
        if (lens[2].max.x > 42 ) {
        }

        if (lmin>lmax) {
            ddx = -ddx; ddy=-ddy;
            //console.warn('change');
        }
        var dlen = Math.sqrt(ddx*ddx + ddy*ddy);
        ddx /= dlen; ddy /= dlen;
        rez.angle22 = {
            sin: ddy,
            cos: ddx,
            angle: Math.atan2(ddy, ddx)
        };


        rez.w = r1;
        rez.c = c;

        //console.log('rrrrr', rez.angle22);
        return rez;
    };  // shadowMatrix

    r.addSprite3232 = function (mesh, data, cb) {
        var sprite = new THREE.Sprite(effects.spriteMat());
        sprite.scale.set(0.3,0.3,0.3);
        app2.scene.add(sprite);
        sprites.push({s: sprite, m: mesh, data: data, cb: cb});
        return sprite;
    };


    r.getCalcShadow5 = function(gr, mesh, light) {
        var vs = this.getRelBox(mesh);
        var normalPoints = 0;
        var li = light.position;
        var rr = {meshBox: [], shadowPoints: [], shadowCenter: {},
            shadowLength: {}, shadowWidth: {}, shadowSidesCenters: []};
        for (var i =0; i<vs.length; i++) {
            var v1 = vs[i];
            rr.meshBox[i] = new THREE.Vector3(v1.x, v1.y, v1.z);
            rr.meshBox[i].applyMatrix4(mesh.matrix);


            let mb = rr.meshBox[i];
            var dx = mb.x - li.x; var dy = mb.y - li.y; var dz = mb.z - li.z;
            var len = Math.sqrt(dx*dx+ dy*dy + dz*dz);
            var dir = new THREE.Vector3(dx,dy,dz);
            dir.normalize();
            var origin = new THREE.Vector3(li.x, li.y, li.z);

/*
            var ray = new THREE.Raycaster(); ray.set(origin, dir);
            var inter = ray.intersectObject(gr);
*/

            var gry = gr.position.y;
            var dgy = li.y - gry;
            var k = -(mb.y - gry) / dy;
            var inter = [{point: {
                x: mb.x + dx*k,
                y: gry + 0.01, //li.x + dx*k,
                z: mb.z + dz*k,
            }}]


            if (inter.length>0) {
                normalPoints++;
                rr.shadowPoints[i] = {
                    x: inter[0].point.x,
                    y: inter[0].point.y,
                    z: inter[0].point.z
                };
            } else {
                console.error('no intersection')
            }
        }; // i
        rr.normalPoints = normalPoints;
        //console.log('normal points', normalPoints);
        if (normalPoints ==8) {
            let bb = r.shadowMatrix(rr.shadowPoints, mesh.position);
            //r.shadowCenter = r.shadowMatrix(r.shadowPoints);
            rr.shadowSidesCenters = bb.pnts;
            rr.shadowCenter = bb.c;
            rr.shadowLength = bb.l;
            rr.shadowWidth = bb.w;
            rr.angle = bb.angle22.angle;

        };
        return rr;
    };

    r.getSpriteBox4343 = function (mesh, cb) { // main function return object with update() {callback(); } function
        var ss = r.getSpritesArray(8, 0xff0000); // objects's corners sprites
        var sg = r.getSpritesArray(8, 0x0000ff); // projections of corners to the ground sprites
        var sgc = r.getSpritesArray(4, 0x00ffff); // centers of box sides sprites
        //var vs = this.getRelBox(mesh); // array of object's corners
        var rez = {};
        rez.ss=ss;
        rez.sg=sg;
        rez.vs=vs;
        rez.sgc = sgc;
        rez.update = function () {
            var normalPoints =0;
            for (var i=0; i<ss.length; i++) {
                rez.i = i;
                var v1 = vs[i];
                var v = new THREE.Vector3(v1.x, v1.y, v1.z);
                v.applyMatrix4(mesh.matrix);
                ss[i].position.x = v.x;
                ss[i].position.y = v.y;
                ss[i].position.z = v.z;
                if (cb) {
                    if (cb(rez)) normalPoints++
                }

            }; // i

            console.log('getSprite box before shadow matrix');
            var sideCenters;
            if (normalPoints==8) {
                sideCenters = r.shadowMatrix(rez.sg);
                for (var i=0; i<sgc.length; i++) {
                    sgc[i].position.x = sideCenters.pnts[i].x;
                    sgc[i].position.y = sideCenters.pnts[i].y;
                    sgc[i].position.z = sideCenters.pnts[i].z;
                }
            } else {
                console.error('normal points: ', normalPoints);
            }
        }; // update
        return rez;
    };

    r.getSpritesArray = function (n, color) {
        var spriteMaterial = new THREE.SpriteMaterial({map: mapC, color: color, fog: false});
        var ss = [];
        //var sprite = new THREE.Sprite(effects.spriteMat());
        for (var i=0; i<n; i++) {
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(0.3, 0.3, 0.3);
            //sprite.color.setHex(0xff0066);
            app.scene.add(sprite);
            ss.push(sprite);
        }
        return ss;
    };
    r.getTextArray = function (n, color, text) {
        //var tg = THREE.TextGeometry
    }


    //   texture

    r.createTextureData = function(x, y) {
        var size = x*y;
        var a = new Uint8Array( size * 4);
        for (var i=0; i<a.length; i++) a[i]=0;
        var dd = {
            width: x,
            height: y,
            data: a
        };
        return dd;
    };

    function  getAddrByCoords4(d, x, y, width) { // data, coords, width
        return (4 * (y*width +x));
    };

    r.addCircle = function (dd, x, y, r) { // data object (width, heigth, data, step)
        var w = dd.width;
        var y0 = y-r;
        if (y0<0) y0=0;
        var y1 = y+r;
        var x0 = x-r;
        if (x0<0) x0=0;
        var x1 = x+r;
        if (x1>dd.width) x1 = dd.width;
        if (y1>dd.height-1) y1=dd.height-1;
        x1 = Math.trunc(x1);
        y1 = Math.trunc(y1);
        x0 = Math.trunc(x0);
        y0 = Math.trunc(y0);

        for (var i = y0; i<y1; i++) {
            for (var j=x0; j<x1; j++) {
                var adr = getAddrByCoords4(dd.data, j, i, dd.width);
                var dx = j-x; var dy=i-y;
                var r1 = Math.sqrt(dx*dx +dy*dy);
                if (dx*dx + dy*dy < r*r) {
                    dd.data[adr] = 255;
                    dd.data[adr+3] = 1; //* r1/r;

                }
            }
        }
    };

    r.circles = [
        {x:43,y:43,r:30},
        {x:133,y:43,r:30},
        {x:43,y:133,r:30},
        {x:133,y:133,r:30}
    ];
    for (var i=0; i<10000000; i++) {
        //r.circles.push({x: Math.random()*100, y: Math.random()*100, r: 2})
    }

    r.addElements = function (dd, elements, cb) {
        for (var i =0; i<elements.length; i++) {
            cb(dd, elements[i].x, elements[i].y, elements[i].r);
        }
    };
    r.addCircles = function (dd) {
        var circles = r.circles;
        dd.data.fill(0, 0, dd.data.length);
        r.addElements(dd, circles, r.addCircle);
    };




    //  texture>


    return r;
}

export {Geom};