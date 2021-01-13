var Debug = function (THREE) {
    var rez = {};
    rez.makeDrag = function(el) {
        rez.el = el;
        el.style = 'position: absolute; left: 50px; color: red; z-index: 100; background-color: wheat;'+
            'padding: 5px; border: 1px solid green; margin: 5px;width: 700px;';
        var dx = 0;
        var dy = 0;

        var moving = 0;
        el.addEventListener('mousedown', (e) => {
            moving = 1;
            var b = el.getBoundingClientRect();
            dx = e.x - b.left;
            dy = e.y - b.top;
        });
        el.addEventListener('mouseup', (e) => moving=0); // function(e) { moving=0; }
        el.addEventListener('mousemove', (e) => {
            if (moving) {
                el.style.left = e.x - dx+'px';
                el.style.top = e.y - dy+'px';
            }
        })

    };
    rez.addDrag = function (text, obj) {
        var e2 = document.createElement('div');
        rez.el.appendChild(e2);
        //e2.innerHTML = text + obj.toJSON();
        window.setInterval((e) => {
            /*
            obj.geometry.computeBoundingBox();

            var boundingBox = obj.geometry.boundingBox;

            var position = new THREE.Vector3();
            position.subVectors( boundingBox.max, boundingBox.min );
            position.multiplyScalar( 0.5 );
            position.add( boundingBox.min );

            position.applyMatrix4( obj.matrixWorld );
*/

            function bb() {
                var ee= new Error();/*
                console.log('ee', ee);
                console.log('ee ts', ee.toString());
                console.log('json', JSON.stringify(ee.stack));
                console.log('obj', ee.stack);*/
            }
            bb();

            e2.innerHTML = text + JSON.stringify(obj.position);
            // var myvar = JSON.parse(text);
        }, 50);
    };

    function parseStack(s) {
        var rez = []; var b=[];
        var t = s.split('\n');
        //console.log(s, JSON.stringify(s));

        //let re = new RegExp('at[\\s]{1,}([\\S]+)');

        let re = /at[\s]{1,}([\S]+) \(([\S]+):([\d]+):([\d]+)\)/;
        //let re = new RegExp('/at ([\S]+) ([^:]+)', 'gi');
        let reMain = /at[\s]{1,}([\S]+):([\d]+):([\d]+)/;
        for (var i=1; i<t.length; i++) {
            let lastChar =t[i][t[i].length-1];
            if (lastChar === ')') {
                b[i] = t[i].match(re, 'gi');
            } else {
                b[i] = t[i].match(reMain, 'gi');
                b[i][3] = b[i][2]; b[i][2]=b[i][1]; b[i][1] = 'MAIN';
            }

            //console.log('ti', t[i], 'bi', b[i]);
        };
        return b;

    };

    rez.print = function (e) {
        var ee = new Error();
        var p= parseStack(ee.stack);
        var url = p[2][2];
        var fname = p[2][1];
        var lineNumber = p[2][3];
        function process(t) {
            var ss = t.split('\n');
            var line = ss[lineNumber-1];
            let re2 = /\(([\S]+)[\s]*\)/;
            var param = line.match(re2)[1];
            var eStr = JSON.stringify(e);
            var eStrTrim = eStr.substring(0, 50);
            console.log('func: ', fname, ' line: ', lineNumber, ' ', param, '=', eStrTrim);
        }
        fetch(url, {method: "GET"}).then((e) => e.text()).then( (e2) => process(e2));

        //console.log('func: ', fname, ' line: ', lineNumber, ' value', e);
    }
    return rez;
};

export {Debug}