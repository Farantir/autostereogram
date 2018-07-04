function stereogram()
{
  this.DPI = 135; // Output device has x pixels per inch
  this.E = Math.round(2.3 * DPI); // Eye separation is assumed to be 2.3 in
  this.mu = 1 / 3.0f;
  this.offset = ((1 - mu * 0) * E / (2 - mu * 0)) - Math.floor(((1 - mu * 0) * E / (2 - mu * 0)));

  this.settings = {
    maxAmountR: 255,
    maxAmountG: 255,
    maxAmountB: 255,
    minAmountR: 0,
    minAmountG: 0,
    minAmountB: 0,
    randompattern: true,
  };

  
  this.seperation = function(){return ((1 - mu * Z) * E / (2 - mu * Z)) - offset;}

  /*sets a pixel based on a given texture pattern*/
  this.setpattern = function(OUT, W, x, y, Pattern, PH, PW)
  {
    if(W-x <= PW)
    {
      OUT[y * W * 3 + x * 3 + 0] = Pattern[(y%PH)*PW*3 + (x%PW)*3 + 0];
      OUT[y * W * 3 + x * 3 + 1] = Pattern[(y%PH)*PW*3 + (x%PW)*3 + 1];
      OUT[y * W * 3 + x * 3 + 2] = Pattern[(y%PH)*PW*3 + (x%PW)*3 + 2];
    }else
    {
      OUT[y * W * 3 + x * 3 + 0] = Pattern[(y%PH)*PW*3 + ((y+x)%PW)*3 + 0];
      OUT[y * W * 3 + x * 3 + 1] = Pattern[(y%PH)*PW*3 + ((y+x)%PW)*3 + 1];
      OUT[y * W * 3 + x * 3 + 2] = Pattern[(y%PH)*PW*3 + ((y+x)%PW)*3 + 2];
    }
  }

  this.create_from_depth = function(depth,pattern)
  {
    result = make_constraint_map(scale(depth,autostereogram_settings.upscale));
	  /*if(pattern)
    {
      create_image_pattern(canvas, scale(pattern,autostereogram_settings.pattern_scale));
      autostereogram_settings.random_dot = false;
    }
	  else 
    {
      create_random_pattern(canvas);
      autostereogram_settings.random_dot = true;
    }*/
    result.id = "stereoimage";
	  return result;
  }

  /*fill a given pixel with random walues*/
  this.randomPixel = function(OUT, W, x, y)
  {
    OUT[y * W * 3 + x * 3 + 0] = Math.floor((Math.random() * this.settings.maxAmountR-this.settings.minAmountR) + 1 + this.settings.minAmountR);
    OUT[y * W * 3 + x * 3 + 1] = Math.floor((Math.random() * this.settings.maxAmountG-this.settings.minAmountG) + 1 + this.settings.minAmountG);
    OUT[y * W * 3 + x * 3 + 2] = Math.floor((Math.random() * this.settings.maxAmountB-this.settings.minAmountB) + 1 + this.settings.minAmountB);
  }
  /*capy the value of a pixel to another pixel, based on the constraints*/
  this.copyPixel = function(OUT, W, x, y, fx, fx2, amount)
  {
      OUT[y * W * 3 + x * 3 + 0] = Math.round(OUT[y * W * 3 + fx2 * 3 + 0] * amount + (1-amount) * OUT[y * W * 3 + fx * 3 + 0]);
      OUT[y * W * 3 + x * 3 + 1] = Math.round(OUT[y * W * 3 + fx2 * 3 + 1] * amount + (1-amount) * OUT[y * W * 3 + fx * 3 + 1]);
      OUT[y * W * 3 + x * 3 + 2] = Math.round(OUT[y * W * 3 + fx2 * 3 + 2] * amount + (1-amount) * OUT[y * W * 3 + fx * 3 + 2]);
  }

  /*calculates the constrains of the pixels, using hidden surface removal*/
  this.make_constraint_map = function(depth_map,img_h,img_w)
  {
    rightcontraint = new Uint8Array(img_h*img_w);
    leftcontraint = new Uint8Array(img_h*img_w);
    leftorrightamount = [];

    for (var y = 0; y < img_h; y++)
    {
      for (var x = 0; x < img_w; x++)
      {
          rightcontraint[x*y] = x*y; // Each pixel is initially linked with itself
          leftcontraint[x*y] = x*y;
      }

      for (var x = 0; x < img_w; x++)
      {
        s = separation(depth_map[y * img_w + x]/255);
        left = Math.round(x*y - s / 2); // Pixels at left and right ...
        right = Math.floor(left + s); // ... must be the same ...
        right2 = Math.floor(left + s + 1); // ... must be the same ...
        curdiff = left + s - Math.floor(left + s);
        if (0 <= left && right < img_w && right2 < img_w)
        {                // ... or must they?
            visible; // First, perform hidden-surface removal
            var t = 1;   // We will check the points (x-t,y) and (x+t,y)
            var zt;    // Z-coord of ray at these two points

            do
            {
                zt = (depth_map[y * img_w + x]/255) + 2 * (2 - mu * (depth_map[y * img_w + x]/255)) * t / (mu * E);
                visible = (depth_map[y * img_w + x]/255) < zt && (depth_map[y * img_w + x]/255) < zt; //  False if obscured
                t++;
            } while (visible && zt < 1); // Done hidden-surface removal  ...
            if (visible)
            {                       // ... so record the fact that pixels at
                var oldleft = left;
                var l = leftcontraint[left]; // ... left and right are the same
                while (l != left && l != right)
                    if (l < right)
                    {                   // But first, juggle the pointers ...
                        left = l;       // ... until either same[left]=left
                        l = leftcontraint[left]; // ... or same[left]=right
                    }
                    else
                    {
                        leftcontraint[left] = right;
                        left = right;
                        l = leftcontraint[left];
                        right = l;
                    }

                l = rightcontraint[oldleft]; // ... left and right are the same
                while (l != oldleft && l != right2)
                    if (l < right2)
                    {                   // But first, juggle the pointers ...
                        oldleft = l;       // ... until either same[left]=left
                        l = rightcontraint[oldleft]; // ... or same[left]=right
                    }
                    else
                    {
                        rightcontraint[oldleft] = right2;
                        oldleft = right2;
                        l = rightcontraint[oldleft];
                        right2 = l;
                    }

                leftcontraint[left] = right; // This is where we actually record it
                rightcontraint[oldleft] = right2;
                leftorrightamount[left] = curdiff;
            }
        }
      }
    }    
  }

  this.fill_with_color(same,same2,diff,img_w,img_h)
  {
      for (var y = 0; y < img_h; y++)
      {
        for (var x = img_w - 1; x >= 0; x--)
        {
          if (same[x] == x && same2[x] == x)
          {
              // Free choice; do it randomly
              if(this.settings.randompattern) randomPixel(OUT, W, x, y);
              else setpattern(OUT,W,x,y,Pattern,PH,PW);
          }else if(same2[x] == x)
          {
            copyPixel(OUT, W, x, y, same[x], same[x],diff[x]);
          }else if(same[x] == x)
          {
            copyPixel(OUT, W, x, y, same2[x], same2[x],diff[x]);
          }
          else
          {
              // Constrained choice; obey constraint
              copyPixel(OUT, W, x, y, same[x], same2[x],diff[x]);
          }
        }
      }
  }
}
