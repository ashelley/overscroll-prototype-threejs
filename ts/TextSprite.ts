module Overscroll {
	export class TextSprite {
		public static create(options) {
			var text = options.text;
			var textHeight = 50;

        	var canvas = document.createElement( 'canvas' );

       		var texture = new THREE.Texture( canvas );          
        	
        	var context = canvas.getContext( '2d' );		

            context.font = "bold " + textHeight + "px sans-serif";

           	var measurement = context.measureText(text);        	

        	canvas.height = textHeight;
        	canvas.width = measurement.width;       	        	

			context.fillStyle = "#EE1133";
        	context.fillRect(0,0,canvas.width,canvas.height);

        	context.font = "bold " + textHeight + "px sans-serif";
            context.fillStyle = "#BBEE33";
			context.textBaseline = "top"; 
			//context.textAlign = "center";
           	context.fillText(text, 0, 0);        	

          	texture.needsUpdate = true;

			var material = new THREE.SpriteMaterial( { map: texture } );

			var sprite = new THREE.Sprite(material);         

			sprite.scale.set(canvas.width, canvas.height, 1);
          
          	return sprite;
		}
	}
}