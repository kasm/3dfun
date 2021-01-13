import * as THREE from 'https://threejs.org/build/three.module.js';
import {Geom} from "./geom.js";


/*

shadow plan

1. function to 'draw' array of shapes on texture
 */

var Effects = function(libs) {
    var geom = Geom(THREE);
    var r = {
        vShader: `
    varying vec2 vUv;
    //varying vec4 vColor;
    varying vec4 pos2;

void main()
{
//vColor = gl_Color;
vUv = uv;
vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
pos2 = projectionMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;
//gl_Position[2] = position[0]*position[0];

//gl_Position = 1.0 * mvPosition;
//gl_Position = vec4( position* 1.2, 1.0 );s
}
    `,

        shading: function (geom, fShader, uniforms) {
            var mat = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: this.vShader,
                fragmentShader: fShader
            });
            var mesh = new THREE.Mesh(geom, new THREE.MeshFaceMaterial(mat));
            return mesh;
        },
        shaderMaterial: function (fShader, uniforms) {
            var mat = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: this.vShader,
                fragmentShader: fShader
            });
            return mat;
        },
        shaderMaterial2: function (vShader, fShader, uniforms) {
            var mat = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vShader,
                fragmentShader: fShader
                //,wireframe: true
            });
            return mat;
        },

        addLightBall: function(color, size) { var isize;
            if (size) {
                isize = size;
            } else {
                isize = 0.3
            }
            let lamb = new THREE.MeshLambertMaterial({color: color, emissive: color});
            let g = new THREE.SphereGeometry(isize, 8, 8);
            let m = new THREE.Mesh(g, lamb);
            let li = new THREE.PointLight(color, 1.5, 33);

            libs.scene.add(li);
            libs.scene.add(m);
            m.li = li;
            m.add(li);
            return m;
        },
        addLightBallParent: function(color, intesity, distance, decay) {

            let lamb = new THREE.MeshLambertMaterial({color: color, emissive: color});
            let g = new THREE.SphereGeometry(4, 8, 8);
            let m = new THREE.Mesh(g, lamb);
            let li = new THREE.PointLight(color, intesity, distance, decay); // color, intensity, distance, decay

            //libs.scene.add(li);
            libs.scene.add(m);
            m.li = li;
            m.add(li);
            return m;
        },

        rotateBall: function (elem) {

            function addLightBall22(color) {
                let lamb = new THREE.MeshLambertMaterial({color: color, emissive: color});
                let g = new THREE.SphereGeometry(0.3, 8, 8);
                let m = new THREE.Mesh(g, lamb);
                let li = new THREE.PointLight(color, 1.5, 11);

                libs.scene.add(li);
                libs.scene.add(m);
                m.add(li);
                return m;
            }
            var a = elem.position;
            var r;
            var x = elem.position.x;
            var z = elem.position.z;


            let rl = this.addLightBall(0xff0000);
            let gl = this.addLightBall(0x009900);

            let bl = this.addLightBall(0x0000ff);


            console.log('libs', libs);
/*
            let g = new THREE.SphereGeometry(0.3, 8, 8);
            let s = new THREE.Mesh(g, lamb);
            let li = new THREE.PointLight(0xffffff, 0.5, 25);
            libs.scene.add(li);
            s.add(li);

                s.position.x = a.x;
                s.position.y = a.y;
                s.position.z = a.z;
            libs.scene.add(s);

 */
            var ot = {t: 0};
            let t = new libs.TWEEN.Tween(ot).to({t: 6.28}, 15000).repeat(Infinity).
                onUpdate(cb).start();
            function cb(ob) {
                var r = 2;
                var h = 4;
                /*
                s.position.x = elem.position.x + Math.sin(ob.t) * r;
                s.position.z = elem.position.z + Math.cos(ob.t) * r;
                s.position.y = elem.position.y +4 +Math.cos(ob.t) * r;

                 */

                rl.position.x = elem.position.x + Math.sin(ob.t)* r;
                rl.position.z = elem.position.z + 5 * Math.cos(ob.t)* r;
                rl.position.y = elem.position.y + h + Math.sin(ob.t)* r;

                gl.position.z = elem.position.x + Math.sin(ob.t+ 2)* r;
                gl.position.x = elem.position.z + Math.cos(ob.t+2)* r;
                gl.position.y = elem.position.y + h +5+ Math.sin(ob.t+2)* r;

                bl.position.x = elem.position.x + Math.sin(ob.t+4)* r;
                bl.position.z = elem.position.z + Math.cos(ob.t+4)* r;
                bl.position.y = elem.position.y + h + Math.sin(ob.t+4)* r;
/*
 */
                //console.log('obt', ob.t);
            }
            return [rl, gl, bl];
        }, // rotateBall





        ///                                            GROUP EFFECT

        groupEffect: function (pos, name, params) {
            var number = params.number;

            function uniGen(r) {
                r.t0 = Date.now();
                r.tc0 = Date.now(); // self cycle zero (absolute)
                r.tc = 0;  // from 0 to tcl
                r.tt0 = Date.now(); // tween zero (absolute)
                r.tt = 0;
                r.tcr = 0; //
                r.ttr = 0; // relative, from 0 to 1
                r.ttl = ss.tn;
                r.tcl = 1; // will be overwriten
            };
            function uniAnim(r) {
                var now = Date.now();
                if (now - r.tc0 >= r.tcl) {
                    r.tc0 = now;
                    //ss.gen(r); // ????
                }
                r.tc = now - r.tc0;
                r.tcr = r.tc / r.tcl;
            }
            var spriteSystems = {
                fontain: {

                    // each drop have individual speed, TTL
                    //
                    gen: function (r) {
                        uniGen(r);
                        console.log('gen');
                        r.sprite.position.x=0;
                        r.pos.y=0;
                        r.pos.z=0;
                        r.vx=2*Math.random()-1;
                        r.vy=3*Math.random()+5;
                        r.vz=2*Math.random()-1;
                        r.tcl = Math.random() * this.tn;
                        //r.t0 = Date.now();
                        return r;
                    },
                    anim: function (r) {
                        //console.log(r);

                        var k = 5;
                        /*
                        r.t = Date.now() - r.t0;
                        r.tr = 0; // tr - t relative

                        if (r.t>=r.ttl) {
                            this.gen(r);
                            r.t = Date.now() - r.t0;
                        }
                        r.tr = r.t / r.ttl;
                        r.x = k*r.tr*r.vx; r.y=k*r.tr*r.vy - 30*r.tr*r.tr; r.z=k*r.tr*r.vz;
                        r.mat.opacity = 1 - r.tr;
                        r.sprite.position.x=r.x;
                        r.sprite.position.y=r.y;
                        r.sprite.position.z=r.z;
                        var sc = 0.3 + r.tr;
                        r.sprite.scale.set(sc, sc, sc);
                     */
                        uniAnim(r);
                        r.pos.x = k*r.tcr * r.vx; r.pos.y=k*r.tcr*r.vy - 30*r.tcr*r.tcr; r.pos.z=k*r.tcr*r.vz;
                        r.mat.opacity = 1-r.tcr;
                        //r.mat.opacity = 1;
                        r.mat.transparent = true;
                        //var c = 256*(256*55 + 55) + Math.trunc(254*r.tcr);
                        r.mat.color.setRGB(0.1, 1, Math.trunc(r.tcr*3)); // = c; //.b = 254*r.tcr;
                        var sc = 0.3+r.tcr;
                        r.sprite.scale.set(sc, sc, sc);

                    },
                    tn: 10000,
                    tc: 0
                },
                snowFall: {
                    gen: function (r) {
                        uniGen(r);
                        r.x0= Math.random()*10;
                        r.z0 = Math.random()*10
                        r.pos.x = r.x0;
                        r.pos.z= r.z0;
                        r.pos.y= 55;
                        r.tcl = Math.random() * this.tn+500;
                        r.vy = -0.3 - Math.random();
                    },
                    anim: function (r) {
                        uniAnim(r);
                        var k=10;
                        r.pos.y = 10 +k*r.tcr*r.vy;
                        r.pos.x = r.x0 + Math.sin(r.tcr*10)*0.8;
                        r.pos.z = r.z0 + Math.cos(r.tcr*10)*0.8;
                        r.mat.opacity = 1 - r.tcr;
                    },
                    tn: 10000
                },
                snowFall2: {
                    gen: function (r) {
                        uniGen(r);
                        r.x0= 0; //Math.random()*10;
                        r.z0= Math.random()*10;
                        r.y0= Math.random()*10;
                        r.tcl = Math.random() * this.tn+500;
                        r.vy = -0.1 - 0.3* Math.random();
                        r.vx = 0.1 + Math.random()*3;
                    },
                    anim: function (r) {
                        uniAnim(r);
                        var k=10;
                        r.pos.y = r.y0 +k*r.tcr*r.vy;
                        r.pos.x = r.x0 +k*r.tcr*r.vx;
                        r.pos.z=r.z0;
                        r.mat.opacity = 1 - r.tcr*0.5;
                    },
                    tn: 10000
                },
                burst: {
                    gen: function (r) {
                        uniGen(r);
                        r.x0= 0; //Math.random()*10;
                        r.z0= 0;
                        r.y0= 0;
                        var b = 6;
                        r.tcl = params.time; //5000; //Math.random() * this.tn+500;
                        r.vx =  (Math.random()-0.5)*b;
                        r.vy =  (Math.random()-0.5)*b;
                        r.vz =  (Math.random()-0.5)*b;
                        r.sprite.color = params.color;
                    },
                    anim: function (r) {
                        var k=10;
                        uniAnim(r);
                        r.pos.y = r.y0 +k*r.tcr*r.vy - 50*r.tcr*r.tcr;
                        r.pos.x = r.x0 +k*r.tcr*r.vx;
                        r.pos.z=r.z0 +k*r.tcr*r.vz;
                        r.mat.opacity = 1 - r.tcr*0.5;
                    },
                    tn: 5000
                },
                rotMeshBox: {
                    gen: function (r) {
                        uniGen(r);
                        r.relBox = geom.getRelBox(params.mesh);
                        console.log('ggggggen')

                    },
                    anim: function (r) {
                        uniAnim(r);

                        var v1 = r.relBox[r.i];
                        var v = new THREE.Vector3(v1.x, v1.y, v1.z);
                        v.applyMatrix4(params.mesh.matrix);

                        console.log('vi', r.i, v,r);
                        r.pos.x = v.x;
                        r.pos.y = v.y;
                        r.pos.z = v.z;
                        r.sprite.scale.set(0.3,0.3,0.3);
                    },
                    tn: 5000
                }


            } // spriteSystem

            var ss = spriteSystems[name];
            var textureLoader = new THREE.TextureLoader();
            var group = new THREE.Group();
            libs.scene.add(group);
            group.position.x = pos.x;
            group.position.y = pos.y;
            group.position.z = pos.z;
            var mapC = textureLoader.load( "../mylib/example.png" );
            //var mapC = textureLoader.load( "roundshadow.png" );
            var ot2 = {t:0, t2: 0, tc: 0};

            var fs = [];
            for (var i=0; i<number; i++) {
                var f = {};
                var c = 0xffffff; if (params.color) c = params.color;

                if (params.sprite) {
                    f.mat = new THREE.SpriteMaterial({map: mapC, color: c, fog: false})
                    f.sprite = new THREE.Sprite(f.mat);
                    f.i = i;
                } else {
                    let lamb = new THREE.MeshLambertMaterial({color: c});
                    let g = new THREE.SphereGeometry(0.3, 8, 8);
                    let m = new THREE.Mesh(g, lamb);
                    f.mat = lamb;
                    f.sprite = m;
                }



                f.sprite.position.set(f.x, f.y, f.z);
                f.sprite.scale.set(1,1,1);
                f.pos = f.sprite.position;
                ss.gen(f);
                fs.push(f);
                group.add(f.sprite);
            };

            function cb2(ob) {
                var t=ob.t;
                var t2 = ob.t2;
                //console.log('ob2', ob, ss.tn);
                for (var i=0; i<fs.length; i++) {
                    fs[i].t=t;
                    fs[i].t2 = t2;
                    //console.log(fs[i].sprite.position, ob);
                    ss.anim(fs[i]);
                }
            }
            var tw3 = new libs.TWEEN.Tween(ot2).to({tc: ss.tn}, ss.tn).repeat(Infinity).onUpdate(cb2).start();





/*
//--------------------------------------------
            var materialC = new THREE.SpriteMaterial( { map: mapC, color: 0xffffff, fog: false } );
            var fdata = [
                {z: 0, vx: 0, vy: 0, vz: 1},
                {z: 0, vx: 0, vy: 0, vz: 0.5},
                {z: 0, vx: 1, vy: 0, vz: 0.3}
            ]
            fdata = [];
            function addElem1(felem) {
                var materialC = new THREE.SpriteMaterial( { map: mapC, color: 0xffffff, fog: false } );
                felem.sprite = new THREE.Sprite(materialC);
                felem.sprite.position.set(0, 0, felem.z);
                felem.x=0;felem.y=0;felem.z = 0;
                felem.mat = materialC;
                group.add(felem.sprite);
            };
            fdata.map(addElem1);
            var ot = {t: 0, t2: 0};

            function cb(ob) {
                var t = ob.t;
                for (var i=0; i<fdata.length; i++) {
                    var felem = fdata[i];
                    felem.x = t * felem.vx;
                    felem.y = t * felem.vy;
                    felem.z = t * felem.vz;
                    felem.sprite.position.x = felem.x;
                    felem.sprite.position.y = felem.y;
                    felem.sprite.position.z = felem.z;
                    var ns = (0.2 + t);
                    felem.sprite.scale.set(ns,ns,ns);
                    //console.log('obttt', ob);
                    felem.mat.opacity = 1 - ob.t;
                }
            }; // cb
            var tw = new libs.TWEEN.Tween(ot).to({t: 1, t2: ss.tn}, 4000).repeat(Infinity).onUpdate(cb).start();
//-------------------------------------------
*/
            return tw3;
        }, // group effect


        spriteMat: function () {
            var textureLoader = new THREE.TextureLoader();
            var mapC = textureLoader.load( "example.png" );
            var spriteMat = new THREE.SpriteMaterial({map: mapC, color: 0xff0000, fog: false})

            return spriteMat;
        }
    }; // r
    return r;
}; // function effects


export {Effects}