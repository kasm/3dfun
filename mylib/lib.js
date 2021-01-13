/*

TODO:
0. add textures
1. Change textures dynamically
2. Change fragmet shaders dynamically
3. compare performance

https://webglfundamentals.org/webgl/lessons/resources/webgl-state-diagram.html

монстры тапать на монстров

домино, текстуры на домино
вывести FPS

linear movement on mouse
светлячков
ambient occlusion
cat's shadow
camera flight
grass shaders


https://www.smashingmagazine.com/2012/11/writing-fast-memory-efficient-javascript/



time framework
use cases:
1. loop change values through table
2. one time change values through table
3. any time stop
4. any time pause/resume
5. able to use callback

app {
timers = Timers();

timerId = timers.add({

name: name,
currentTime: currentTime, // can be stopped by switch active
currentValues: [],
repeat: true (false),
active: true (false),
table: [
{ time: time0, values: [ ..... ] },
{ time: time1, values: [ ..... ] },
{ time: time2, values: [f20, f21, ..... ] },
// function means dependancy from time at current range.
Last function have mo meaning, because no range

if need to create link to other parameter, then curry funciton should be passed:
{ time: time5, values[
  (influencingParameterReference) => () => influencingParameterReference.x + sin(this.currentTime),
  ....
]}

],
cb: cbfunc, //  ((this1) => cbfunc)(this)
cb_end: when timer ended
cb_stop:
cb_pause:
cb_resume:

  // example of implementation
  function cbfunc(this, intervalNumber, rangePosition) {
    this.current = timers.getParamParam(this.t, this.table);
    app.objects[iObject].position  = this.current;
}

stop(timer)
pause(timer)
resume(timer)

}

)
}


 */

function Timer2() {
    var tt = [];

    // input:
    // p -  value from 0 to 1
    // array of states from the beginning to end
    // state is object {t: time, v: array}
    function get_param_param_1(p, a) {
        function getIntervalNumber(v, a) {
            for (var i=0; i<a.length; i++) {
                if (v <= a[i+1]) return i;
            };
            return  a.length-1;
        };
        // return proportion from i and i+1 states bases on distance
        function getIntervalProportion(v, i, a) {
            if (v === a[i]) return 0;
            return (v- a[i]) / (a[i+1] - a[i]);
        }
        var pn = p ; // a[a.length - 1].time - a[0].time;

        var a1 = a.map(e => e.time);
        var i = getIntervalNumber(pn, a1);
        var i1 = getIntervalProportion(pn, i, a1);
        //console.log('------------', pn, i, i1, a1);
        var rez = [];
        for (var j=0; j<a[0].values.length; j++) {
            if (typeof(a[i].values[j]) === 'function') {
                rez.push(a[i].values[j](i1));
            //       rez.push(a[i].v[j])
            } else {
            rez.push(a[i].values[j] + i1 * (a[i+1].values[j] - a[i].values[j]));
            }
        }

        return rez;
    } // get param param

    function get_param_param2(p, a) {
        let delta = a[a.length - 1].time - a[0].time;
        return get_param_param_1(p % delta, a);
    }
//чт 17.00

    var t = {
        tt: tt,
        time: 0,
        add: function (p) {
            //var t1 = Object.assign(p);
            if ( !p.hasOwnProperty('active') ) p.active = true;
            if ( !p.hasOwnProperty('repeat')) p.repeat = false;
            p.currentState = p.table[0].values.slice();
            p.timeStart = p.table[0].time;
            p.timeStartTS = Date.now();
            p.timeEnd = p.table[p.table.length - 1].time;
            p.time = p.timeStart;
            tt.push(p);
            let n = tt.length -1 ;
            if (tt[n].cbStart) tt[n].cbStart(this);
            return n;
        },
        pause: function (ti, cb) {
            tt[ti].active = false;
            if (cb !== undefined) cb();
            if (tt[ti].cbStop) tt[ti].cbPause();

        },
        stop: function (ti, cb) { // same as pause for this moment
            tt[ti].active = false;
            if (cb !== undefined) cb();
            if (tt[ti].cbStop) tt[ti].cbStop();
        },
        start: function(ti) {
            console.log('starting timer .....', ti, tt);
            tt[ti].active = true;
            console.log('tt ', tt[ti]);
        },
        tick: function () {
            var oldTime = this.time;
            this.time = Date.now();
            var deltaTime = this.time - oldTime;
            //console.log('deltatime ',deltaTime, tt);

            for (var i =0; i<tt.length; i++) {
                tt[i].time = this.time - tt[i].timeStartTS;
                //tt[i].time += deltaTime;
                //if ((tt[i].time > tt[i].timeStart + tt[i].timeEnd) && tt[i].repeat === false) tt[i].active = false;
                if ((tt[i].time > tt[i].timeEnd) && tt[i].repeat === false) {
                    tt[i].active = false;
                }
                //if ((deltaTime > tt[i].timeStart + tt[i].timeEnd) && tt[i].repeat === false) tt[i].active = false;
                if (tt[i].active) {

                    tt[i].currentState = get_param_param2(
                        tt[i].time - tt[i].timeStart, tt[i].table);
                    //console.log('assign curr state ', tt[i].currentState, tt[i].time, tt[i])
                    //tt[i].cb(this);
                    tt[i].cb(tt[i]);
                }
            }
        }
    };
    return t;
} // Timer


function getApp1(THREE) {
    let app1 = {
        getGeomByName: function (name) {
            for (let i = 0; i < this.geom.length; i++) {
                if (this.geom[i].name === name) return i;
            }
        },
        geom: [],
        timers: Timer2(),

        arrow: function (x0, y0, z0, x1, y1, z1, color) {
            var dx = x1 - x0;
            var dy = y1 - y0;
            var dz = z1 - z0;
            var dir = new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0);
            var origin = new THREE.Vector3(x0, y0, z0);
            var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
            var arr = new THREE.ArrowHelper(dir, origin, len, color);
            return arr;
        },

        isArray: function (a) {
            return (!!a) && (a.constructor === Array);
        },
        getCenterPoint: function (mesh) {
            var geometry = mesh.geometry;
            geometry.computeBoundingBox();
            console.log('bb', mesh, geometry.boundingBox);
            var center = geometry.boundingBox.getCenter();
            mesh.localToWorld(center);
            console.log('center', center);
            center.x = 10;
            return center;
        },
        getLight: function (coords, color, intensity) {
            var l = new THREE.PointLight(color, intensity, 100);
            if (this.isArray(coords)) {
                l.position.set(coords[0], coords[1], coords[2]);
            } else {
                //console.error('no point light array')
                l.position.set(coords.x, coords.y, coords.z);
            }
            l.intensity = intensity;
            l.decay = 31;
            return l;
        },


        getSphere: function (a, r) { // point, radius
            let lamb = new THREE.MeshLambertMaterial({color: 0x00ffff});
            let g = new THREE.SphereGeometry(r, 8, 8);
            let s = new THREE.Mesh(g, lamb);
            if (this.isArray(a)) {
                s.position.x = a[0];
                s.position.y = a[1];
                s.position.z = a[2];
            } else {
                s.position.x = a.x;
                s.position.y = a.y;
                s.position.z = a.z;
            }
            return s;
        },

// NB - input: box, point  - [0, 1.1, 0];
//  return: abs coords of point
        getPointFromBox: function (m, ort) {
            let geom = m.geometry;
            let b = geom.boundingBox;
            let p = m.position;
            let dx = b.max.x - b.min.x;
            let dy = b.max.y - b.min.y;
            let dz = b.max.z - b.min.z;
            dx = ort[0] * dx / 2;
            dy = ort[1] * dy / 2;
            dz = ort[2] * dz / 2;
            let pnt = [
                p.x + dx,
                p.y + dy,
                p.z + dz
            ];
            return pnt;
        },

// return: array points
        getMeshBoxPoints: function (m) {
            m.geometry.computeBoundingBox();
            //var b = g.boundingBox;
            var bb = [];
            var relCenter;
            relCenter = 0.1;

            bb.push(this.getPointFromBox(m, [relCenter, 0, 0]));
            bb.push(this.getPointFromBox(m, [-relCenter, 0, 0]));
            bb.push(this.getPointFromBox(m, [0, relCenter, 0]));
            bb.push(this.getPointFromBox(m, [0, -relCenter, 0]));
            bb.push(this.getPointFromBox(m, [0, 0, -relCenter]));
            bb.push(this.getPointFromBox(m, [0, 0, relCenter]));


            return (bb);
        },



        initGraphics: function () {
            var app2 = this;
            app2.cameraDefaults = {
                posCamera: new THREE.Vector3( 200.0, 200.0, -100.0 ),
                posCameraTarget: new THREE.Vector3( 50, 110, 110 ),
                near: 0.1,
                far: 10000,
                fov: 45
            };

            app2.cameraTarget = app2.cameraDefaults.posCameraTarget;

            app2.canvas = document.querySelector('#example');
            app2.renderer = new THREE.WebGLRenderer({canvas: app2.canvas, antialias: true,autoClear: true} );
            app2.renderer.setClearColor(0x350505);
            app2.scene = new THREE.Scene();
            //app2.cameraTarget = new THREE.Vector3( 0.0, 0, 0.0 );

            //                                       angle aspect near far
            app2.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000 );
            app2.scene.add(app2.camera);
            app2.camera.position.copy(app2.cameraDefaults.posCamera );
            app2.camera.updateProjectionMatrix();


            app2.renderer.shadowMap.enabled = true;
            app2.renderer.shadowMap.type = THREE.PCFSoftShadowMap;


            let ambientLight = new THREE.AmbientLight( 0x444444 );
            let directionalLight2 = new THREE.DirectionalLight( 0x606060 );
            directionalLight2.position.set( 100, 50, - 100 );

            app2.scene.add( directionalLight2 );
            app2.scene.add( ambientLight );

            var arlen = 10;
            app2.scene.add(app2.arrow(0, 0, 0, arlen, 0, 0, 0xff0000));
            app2.scene.add(app2.arrow(0, 0, 0, 0, arlen, 0, 0x00ff00));
            app2.scene.add(app2.arrow(0, 0, 0, 0, 0, arlen, 0x0000ff));

            //let helper = new THREE.GridHelper( 1200, 60, 0xFF4444, 0x404040 );
            //app2.scene.add( helper );



            app2.resize = function() {
                console.log('resize', app2.controls)
                app2.controls.handleResize();
                app2.recalcAspectRatio();
                app2.renderer.setSize( app2.canvas.offsetWidth, app2.canvas.offsetHeight, false );
                console.log(app2.canvas.offsetWidth, app2.canvas.offsetHeight, app2.aspectRatio);
                app2.updateCamera();
            };

            app2.resizeDisplayGL = function () {
                app2.controls.handleResize();
                app2.recalcAspectRatio();
                app2.renderer.setSize( app2.canvas.offsetWidth, app2.canvas.offsetHeight, false );
                console.log(app2.canvas.offsetWidth, app2.canvas.offsetHeight);
                app2.updateCamera();
            }

            app2.recalcAspectRatio = function () {
                app2.aspectRatio = (app2.canvas.offsetHeight === 0) ? 1 :
                    app2.canvas.offsetWidth / app2.canvas.offsetHeight;
            }

            app2.resetCamera = function () {
                app2.camera.position.copy( app2.cameraDefaults.posCamera );
                app2.cameraTarget.copy( app2.cameraDefaults.posCameraTarget );
                app2.updateCamera();
            }

            app2.updateCamera = function () {
                console.log('camera aspect', app2.camera.aspect);
                app2.camera.aspect = app2.aspectRatio;
                app2.camera.lookAt( app2.cameraTarget );
                app2.camera.lookAt( new THREE.Vector3( 50, 10, 20 ) );
                app2.camera.lookAt( new THREE.Vector3( 50, 10, 20 ) );

                app2.camera.lookAt( {x:10000, y:0, z:0} );
                app2.camera.rotateY(1);
                app2.camera.updateProjectionMatrix();
            }

            app2.render = function () {
                if ( !app2.renderer.autoClear ) app2.renderer.clear();
                app2.controls.update();
                app2.renderer.render( app2.scene, app2.camera );
            }
            window.addEventListener( 'resize', app2.resize, false );
        } // initGraphics


    };
    return  app1;
}

export {getApp1, Timer2};


