autostereogram_settings ={
	/*repeting Pattern width in px*/
	colum_width : 140,
	/*max shift e.g. shift by "white" pixels oft the grayscale*/
	max_shift : 30,
	/*max and min values for colors*/
	rmin : 0,
	rmax : 255,
	bmin : 0,
	bmax : 255,
	gmin : 0,
	gmax : 255,
  filter_linear : true,
  upscale : 1,
  downscale : 1
}

function create_stereogram(depth,pattern)
{
  var resized_depthmap = scale(depth,autostereogram_settings.upscale)
	var canvas = initialize_canvas(resized_depthmap);
	if(pattern) create_image_pattern(canvas, pattern)
	else create_random_pattern(canvas)
  var result = scale(make_stereogram(canvas),1/autostereogram_settings.downscale)
  result.id = "stereoimage";
	return result;
}

/*upsamples/downsamples image*/
function scale(image,amount)
{ 
  var canv = document.createElement("canvas");
  canv.height = image.height*amount;
  canv.width = image.width*amount;
  var context=canv.getContext("2d");
  context.drawImage(image, 0, 0, image.width*amount, image.height*amount);
  return canv
}

/*creates a canvas of the apropriate size*/
function initialize_canvas(depth_map)
{
  var canv = document.createElement("canvas");
  canv.height = depth_map.height;
  canv.width = depth_map.width + autostereogram_settings.colum_width;

  /*initialising canvas with depth map*/
  var ctx=canv.getContext("2d");

  ctx.drawImage(depth_map, autostereogram_settings.colum_width,0);

  return canv;
}

/*Fills th first colum of the canvas with a given pattern image*/
function create_image_pattern(canvas, pattern_image)
{
	var ctx=canvas.getContext("2d");
	var pat=ctx.createPattern(pattern_image,"repeat");
	ctx.rect(0,0,autostereogram_settings.colum_width,canvas.height);
	ctx.fillStyle=pat;
	ctx.fill();
	return canvas;
}

/*fills the first Colum of the canvas with random dot pattern*/
function create_random_pattern(canv)
{
	var ctx=canv.getContext("2d");
  /*filling the random pattern*/
  for(var y = 0; y<canv.height; y++)
  {
    for(var x = 0; x<=autostereogram_settings.colum_width; x++)
    {
      make_random_dot(ctx,x,y);
    }
  }
  return canv;
}

/*weightet value of to inputs*/
function get_weight(x,y,weight) {return weight*y+(1-weight)*x}

/*draws a single random dot on th given canvas context*/
function make_random_dot(ctx,x,y)
{
  var r = Math.floor(autostereogram_settings.rmin + Math.random() * (autostereogram_settings.rmax+1));
  var b = Math.floor(autostereogram_settings.bmin + Math.random() * (autostereogram_settings.bmax+1));
  var g = Math.floor(autostereogram_settings.gmin +  Math.random() * (autostereogram_settings.gmax+1));
  ctx.fillStyle="rgb("+r+", "+g+", "+b+")";
  ctx.fillRect(x,y,1,1); 
}

/*takes a canvas witch first colum was filled with a pattern. uses deth map information to generate 3d Image*/
function make_stereogram(canvas)
{
  var ctx=canvas.getContext("2d");
  /*recieving image data from canvas for manipulation*/
  var canv_data_stuff = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var canv_data = canv_data_stuff.data;
  /*shifting pixesls using depth map information*/
  for(var y = 0; y<canvas.height; y++)
  {
    for(var x = autostereogram_settings.colum_width; x<=canvas.width; x++)
    {
      /*calculating the position of the pixel in the image data*/
      var pos = (y*canvas.width*4)+x*4;
      /*recieving offset based on depth map data*/
      var offset = Math.floor((autostereogram_settings.max_shift/255)*canv_data[pos]);
      /*using no Filter for image*/
      if(autostereogram_settings.filter_linear == false)
      {
	      /*assining the correct color value to the pixel*/
	      var pixel_to_access = pos-((autostereogram_settings.colum_width-offset)*4);

	      canv_data[pos] = canv_data[pixel_to_access];
	      canv_data[pos+1] = canv_data[pixel_to_access+1];
	      canv_data[pos+2] = canv_data[pixel_to_access+2];
	      canv_data[pos+3] = 255;
       /*Using linear filter*/
      }else
      {
	      /*assining the correct color value to the pixel*/
	      var pixel_to_access = pos-((autostereogram_settings.colum_width-offset)*4);

        /*Calculates the weight of the selctet pixel*/
        var weigth = (autostereogram_settings.max_shift/255)*canv_data[pos] - offset;
	      canv_data[pos] = get_weight(canv_data[pixel_to_access],canv_data[pixel_to_access+4],weigth);
	      canv_data[pos+1] = get_weight(canv_data[pixel_to_access+1],canv_data[pixel_to_access+5],weigth);
	      canv_data[pos+2] = get_weight(canv_data[pixel_to_access+2],canv_data[pixel_to_access+6],weigth);
	      canv_data[pos+3] = 255;
      }
    }
  }

  /*drawing new image data on canvas*/
  ctx.putImageData(canv_data_stuff, 0, 0);
  return canvas;
}