/**
 * This requires opentype.js
 *
 * 
 **/


$( document ).ready( function() {

    console.log( 'Init.' );
    
    function animatePath( forwardPaths, rewindPaths, amount ) {

	for( var i in forwardPaths ) {
	    var $path = $( forwardPaths[i] );
	    $path.css( {
		'stroke-dasharray' : ''+(amount*2)+' '+(100-amount),
		'fill-opacity' : amount/100.0
	    } );
	}
	for( var i in rewindPaths ) {
	    var $path = $( rewindPaths[i] );
	    $path.css( {
		'stroke-dasharray' : ''+((100-amount)*2)+' '+(amount),
		'fill-opacity' : (100-amount)/100.0
	    });
	    
	}

	amount++;
	if( amount <= 100 ) {
	    window.setTimeout(
		function() {
		    animatePath(forwardPaths, rewindPaths, amount); },
		12
	    );
	}
    }

    opentype.load('fonts/Courier Prime.ttf', function(err, font) {
    if (err) {
         alert('Font could not be loaded: ' + err);
    } else {
        var ctx = document.getElementById('canvas').getContext('2d');
	// text, x, y, fontSize
        var path1 = font.getPath('1', 0, 150, 144);
        path1.draw(ctx);
	var path2 = font.getPath('2', 00, 150, 144);
        path2.draw(ctx);

	console.log( path1.toSVG() );
	//console.log( path2.toSVG() );
	//console.log( JSON.stringify(path1) );

	var bounds1 = path1.getBoundingBox();
	var bounds2 = path2.getBoundingBox();
	console.log( 'bounds1=' + JSON.stringify(bounds1) );
	var bounds = { x1 : Math.min(bounds1.x1,bounds2.x1),
		       x2 : Math.max(bounds1.x2,bounds2.x2),
		       y1 : Math.min(bounds1.y1,bounds2.y1),
		       y2 : Math.min(bounds1.y2,bounds2.y2)
		     };

	// It is required top create SVG child element with a Namespace!
	// jQuery, somehow, does not support this (or does it?)
	//  -> Use raw javascript here.
	var svg = document.getElementById('svg-canvas');
	function createPath( pathData, classList ) {
	    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	    p.classList = classList; //'animatable';
	    //p.setAttribute('d','M 100 100 L 100 200 L 150 200 z');
	    p.setAttribute('d', pathData  );
	    svg.appendChild( p );
	    return p;
	}

	// Create path from bounding box
	var rect = createPath( 'M '+bounds.x1+','+bounds.y1+' ' + 
			       'L '+bounds.x2+','+bounds.y1+' ' +
			       'L '+bounds.x2+','+bounds.y2+' ' +
			       'L '+bounds.x1+','+bounds.y2+' ' +
			       'z',
			       'animatable thin-stroke no-fill'
			     );

	var p1 = createPath(path1.toPathData(),'animatable thick-stroke with-fill');
	var p2 = createPath(path2.toPathData(),'animatable thick-stroke with-fill');
	// Set initially invisible
	$(p2).css( {
	    'stroke-dasharray' : '0 100',
	    'fill-opacity' : 0
	} );


	
	//animatePath( [p2], [p1], 0 );
	window.setTimeout( function() { animatePath([],[p1],0); },  500 );
	window.setTimeout( function() { animatePath([p2],[],0); }, 1500 );
	//window.setTimeout( function() { animatePath([p2],[],0); }, 1500 );
    }
});

} );
