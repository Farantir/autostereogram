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
  downscale : 1,
  pattern_scale : 1,
  pattern_shift : 10,
  remove_hidden_surface : true
}

function create_stereogram(depth,pattern)
{
  var resized_depthmap = scale(depth,autostereogram_settings.upscale)
	var canvas = initialize_canvas(resized_depthmap);
	if(pattern)
  {
    create_image_pattern(canvas, scale(pattern,autostereogram_settings.pattern_scale));
    autostereogram_settings.random_dot = false;
  }
	else 
  {
    create_random_pattern(canvas);
    autostereogram_settings.random_dot = true;
  }
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
  var pattern_y_start = 0;
  var pattern_x_start = 0;
  var pattern_x_end = autostereogram_settings.colum_width;
  if(pattern_image.width < pattern_x_end) 
  {
          pattern_x_end = pattern_image.width;
  }
  do{
    if(pattern_x_start+pattern_image.width > autostereogram_settings.colum_width) pattern_x_end = autostereogram_settings.colum_width - pattern_x_start;
	  var ctx=canvas.getContext("2d");
    fill_row(canvas,pattern_image,pattern_x_start,pattern_x_end,pattern_y_start)

    pattern_y_start -= autostereogram_settings.pattern_shift;
    pattern_x_start += pattern_x_end; 
    pattern_x_end = pattern_image.width;

  }while(pattern_x_start < autostereogram_settings.colum_width);
	return canvas;
}

/*fills a single row of a pattern*/
function fill_row(canvas,image,startx,width,starty)
{
  var start = starty;
  var ctx=canvas.getContext("2d");
  while(start < canvas.height)
  {
    ctx.drawImage(image,0,0,width,image.height,startx,start,width,image.height);
    start+=image.height
  }
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

  /*remove hidden surfaces, if enabeld*/
  if(autostereogram_settings.remove_hidden_surface)
  {
    /*array of "invisible" pixels because of ambiant occulusion (hidden surface removal)*/
    var hidden = []
    for(var y=0; y<=canvas.height; y++)
    { 
      hidden[y] = [];
      for(var x=0;x<=canvas.width;x++) hidden[y][x] = 0;
    }

    /*calculation if pixels are hidden*/
    for(var y = 0; y<canvas.height; y++)
    {
      for(var x = autostereogram_settings.colum_width+1; x<=canvas.width; x++)
      {
        /*calculating the position of the pixel in the image data*/
        var pos = (y*canvas.width*4)+x*4;
        /*recieving offset based on depth map data*/
        var offset = Math.floor((autostereogram_settings.max_shift/255)*canv_data[pos]);
        var hid = 1;
        /*marking every pixel that needs to be filles randomly, because its reference surface is hidden*/
        for(hid = 1; hid<offset; hid++)
        {
          var origin = canv_data[pos]-170*(1-(1/(autostereogram_settings.colum_width/autostereogram_settings.max_shift)))
          var current = canv_data[pos+(hid*4)]+(offset-hid)*(255/autostereogram_settings.max_shift)
          if(origin > current) 
          {
            hidden[y][x+hid] =1;
          }
        }
      }
    }

    /*assining hidden areas a Gradiend so they will blend in nicer*/
    var ones = 0;
    for(var y = 0; y<canvas.height; y++)
    {
      for(var x = autostereogram_settings.colum_width+1; x<=canvas.width; x++)
      {
         if(hidden[y][x]==1) ones++;
         else if(ones > 0)
         {
            /*opacity increase each pixel*/
            if(ones > 10) ones =6;
            var deltaopacity = 1/ones
            for(var i = ones; i>0; i--) hidden[y][x-i] = deltaopacity*i;
             /*resettings count*/
            ones = 0;
         }
      }
    }
  }

  for(var y = 0; y<canvas.height; y++)
  {
    for(var x = autostereogram_settings.colum_width+1; x<=canvas.width; x++)
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
      /*"hidden" pixels need to be filled randomly (or by distorted pattern)*/
    if(autostereogram_settings.remove_hidden_surface)
    {
        if(hidden[y][x] !== 0)
        {
           if(autostereogram_settings.random_dot==false)
           {
            /*shifting each line to create a new pattern based on the original. this avoids unwanted artifacts*/
            var pixel_to_access = pos-(y%(autostereogram_settings.colum_width-16) + 16)*4;

	          canv_data[pos] = get_weight(canv_data[pixel_to_access],canv_data[pos],1-hidden[y][x])
	          canv_data[pos+1] = get_weight(canv_data[pixel_to_access+1],canv_data[pos+1],1-hidden[y][x])
	          canv_data[pos+2] = get_weight(canv_data[pixel_to_access+2],canv_data[pos+2],1-hidden[y][x])
	          canv_data[pos+3] = 255;

           }else
           {
            /*if there is no pattern, we can fill each pixel randomly instead, creating new information and thus avoiding artefacts*/
            canv_data[pos] = Math.floor(autostereogram_settings.rmin + Math.random() * (autostereogram_settings.rmax+1));
	          canv_data[pos+1] = Math.floor(autostereogram_settings.gmin + Math.random() * (autostereogram_settings.gmax+1));
	          canv_data[pos+2] = Math.floor(autostereogram_settings.bmin + Math.random() * (autostereogram_settings.bmax+1));
	          canv_data[pos+3] = 255;
          }
        }
      }
    }
  }

  /*drawing new image data on canvas*/
  ctx.putImageData(canv_data_stuff, 0, 0);
  return canvas;
}
