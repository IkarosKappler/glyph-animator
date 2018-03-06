/**
 * This requires opentype.js
 *
 * @author  Ikaros Kappler
 * @date    2018-03-03
 * @version 1.0.0
 **/

$( document ).ready( function() {

    console.log( 'Init.' );

    /**
     * This function animates the paths using requestAnimationFrame.
     **/
    function animatePaths( forwardPaths, rewindPaths, duration_ms, options ) {
	var startTime = Date.now();
	//var endTime   = startTime + duration_ms;
	function aStep() {
	    var currentTime = Date.now();
	    var amount = 100 * ((currentTime-startTime)/duration_ms);
	    amount = Math.max(0, Math.min(100,amount));
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
	    if( amount < 100 )
		window.requestAnimationFrame( aStep );
	    else if( options && options.complete )
		options.complete();
	}
	window.requestAnimationFrame( aStep );
    }


    /**
     * This function animates the paths using requestAnimationFrame.
     **/
    function animateBox( boxPaths, duration_ms, options ) {
	var startTime = Date.now();
	var endTime   = startTime + duration_ms;
	//console.log( 'startTime=' + startTime + ', endTime=' + endTime + ', duration_ms=' + duration_ms );
	function bStep() {
	    var currentTime = Date.now();
	    var amount = 100 * ((currentTime-startTime)/duration_ms);
	    amount = Math.max(0, Math.min(100,amount));
	    //console.log( 'currentTime=' + currentTime + ', duration=' + (currentTime-startTime) + ' , amount=' + amount );	    
	    for( var i in boxPaths ) {
		var $path = $( boxPaths[i] );
		$path.css( {
		    'stroke-dasharray' : ''+(amount*4)+' '+(amount*16),
		    'stroke-dashoffset' : (25+amount)+'%'  // Will be invisible at the end of animation
		} );
	    }

	    if( amount < 100 )
		window.requestAnimationFrame( bStep );
	    else if( options && options.complete )
		options.complete();
	}	
	window.requestAnimationFrame( bStep );
    }


    function perform() {
	
	/**
	 * Load the font file using opentype.js
	 **/
	opentype.load( 'fonts/Courier Prime.ttf', function(err, font) {
	    if( err ) {
		alert('Font could not be loaded: ' + err);
	    } else {
		// Fetch input
		var text1 = $('input#input1').val();
		var text2 = $('input#input2').val();
		if( !text1 || (text1 = text1.trim()).length == 0 ) {
		    alert( 'Please enter a From-text' );
		    return;
		}if( !text2 || (text2 = text2.trim()).length == 0 ) {
		    alert( 'Please enter a To-text' );
		    return;
		}
		
		
		// Clear old paths at beginning of animation
		$( 'g#main-group' ).empty();
		
		// Generate new paths
		var path1 = font.getPath(text1, 0, 200, 288);
		var path2 = font.getPath(text2, 0, 200, 288);
		
		var bounds1 = path1.getBoundingBox();
		var bounds2 = path2.getBoundingBox();
		console.log( 'bounds1=' + JSON.stringify(bounds1) );
		var bounds = { x1 : Math.min(bounds1.x1,bounds2.x1),
			       x2 : Math.max(bounds1.x2,bounds2.x2),
			       y1 : Math.min(bounds1.y1,bounds2.y1),
			       y2 : Math.min(bounds1.y2,bounds2.y2)
			     };
		bounds.width = (bounds.x2-bounds.x1);
		bounds.height = (bounds.y2-bounds.y1);

		// It is required top create SVG child element with a Namespace!
		// jQuery, somehow, does not support this (or does it?)
		//  -> Use raw javascript here.
		var svg = document.getElementById('main-group');
		function createPath( pathData, classList ) {
		    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		    p.setAttribute('class',classList);
		    p.setAttribute('d', pathData  );
		    svg.appendChild( p );
		    return p;
		}

		// Create rect path from bounding box
		var rect = createPath( 'M '+bounds.x1+','+bounds.y1+' ' + 
				       'L '+bounds.x2+','+bounds.y1+' ' +
				       'L '+bounds.x2+','+bounds.y2+' ' +
				       'L '+bounds.x1+','+bounds.y2+' ' +
				       'z',
				       'animatable thin-stroke no-fill'
				     );
		// Create a circle path from bounding box (starting from tip middle)
		var circle = createPath( 'M '+(bounds.x1+bounds.width*0.5)+','+bounds.y1+' ' + 

					 // Upper left curve
					 'C '+(bounds.x1+bounds.width*0.25)+','+bounds.y1+' ' +
					 (bounds.x1)+','+(bounds.y1+bounds.height*0.25)+' ' +
					 (bounds.x1)+','+(bounds.y1+bounds.height*0.5)+' ' +

					 // Lower left curve
					 'C '+(bounds.x1)+','+(bounds.y1+bounds.height*0.75)+' ' +
					 (bounds.x1+bounds.width*0.25)+','+(bounds.y2)+' ' +
					 (bounds.x1+bounds.width*0.5)+','+(bounds.y2)+' ' +

					 // Lower right curve
					 'C '+(bounds.x1+bounds.width*0.75)+','+(bounds.y2)+' ' +
					 (bounds.x2)+','+(bounds.y1+bounds.height*0.75)+' ' +
					 (bounds.x2)+','+(bounds.y1+bounds.height*0.5)+' ' +

					 // Upper right curve
					 'C '+(bounds.x2)+','+(bounds.y1+bounds.height*0.25)+' ' +
					 (bounds.x1+bounds.width*0.75)+','+(bounds.y1)+' ' +
					 (bounds.x1+bounds.width*0.5)+','+(bounds.y1)+' ' +
					 
					 'z',
					 'animatable thin-stroke no-fill'
				       );

		var p1 = createPath(path1.toPathData(),'animatable thick-stroke with-fill');
		var p2 = createPath(path2.toPathData(),'animatable thick-stroke with-fill');
		// Set second path initially invisible
		$(p2).css( {
		    'stroke-dasharray' : '0 100',
		    'fill-opacity' : 0
		} );
		// Set rect and circle initially invisible
		$([rect,circle]).each( function(index,elem) {
		    var amount = 100;
		    $(elem).css( {
			'stroke-dasharray' : ''+(amount*4)+' '+(amount*16),
			'stroke-dashoffset' : (25+amount)+'%'  // Will be invisible at the end of animation
		    } );
		} );


		var $btn = $('button#animate');
		var animationTerminated = function() {
		    console.log( 'Animation terminated. Starting reverse.' );
		    $btn.prop('disabled',false);

		    // Animate all paths with some delay (reverse)
		    var delay = 1000;
		    window.setTimeout( function() { animatePaths([],[p2],2000); },  delay+500 );
		    window.setTimeout( function() { animatePaths([p1],[],2000,{ complete : function() { console.log('Animation terminated.'); } }); }, delay+1500 );
		    window.setTimeout( function() { animateBox([rect,circle],2000); }, delay+1000 );
		}
		$btn.prop('disabled',true);
		
		// Animate all paths with some delay
		window.setTimeout( function() { animatePaths([],[p1],2000); },  500 );
		window.setTimeout( function() { animatePaths([p2],[],2000,{ complete : animationTerminated }); }, 1500 );
		window.setTimeout( function() { animateBox([rect,circle],2000); }, 1000 );
	    }
	});
    } // END function perfmr


    // Install listener
    $('button#animate').click( perform );
    perform();
} );
