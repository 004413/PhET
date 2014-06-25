/* Makes a coordinate plane with x from -X_MAX to X_MAX, y from -Y_MAX to Y_MAX, and RES pixels per integer increment */
var X_MAX = 20;
var X_MIN = -X_MAX;
var Y_MAX = 20;
var Y_MIN = -Y_MAX;
var RES = 12;
var R_WIDTH = RES*(X_MAX-X_MIN);
var R_HEIGHT = RES*(Y_MAX-Y_MIN);
lineCanvas = Raphael(0,0,R_WIDTH,R_HEIGHT);
var X_AXIS = lineCanvas.path("M0 "+R_HEIGHT/2+"L"+R_WIDTH+" "+R_HEIGHT/2);
var Y_AXIS = lineCanvas.path("M"+R_WIDTH/2+" 0L"+R_WIDTH/2+" "+R_HEIGHT);
var GRAPH_SLIDER_MARGIN = 20;
var MARGIN = 20;
var SLOPE_MAX = 60;

/* Takes a point in (x,y) coordinates and converts to Raphael canvas coordinates */
function pointToPathNotation(point){
  var x = point[0];
  var y = point[1];
  var newX = (x-X_MIN) * RES;
  var newY = (Y_MAX-y) * RES;
  return [newX,newY]
}

function drawLine(slope,yintercept){
  lineCanvas.remove();
  lineCanvas = Raphael(0,0,R_WIDTH,R_HEIGHT);
  var X_AXIS = lineCanvas.path("M0 "+R_HEIGHT/2+"L"+R_WIDTH+" "+R_HEIGHT/2);
  var Y_AXIS = lineCanvas.path("M"+R_WIDTH/2+" 0L"+R_WIDTH/2+" "+R_HEIGHT);
  var a = slope; // slope
  var b = yintercept; // y-intercept
  if(a==0){ // case of a horizontal line
    var point1 = [X_MIN,b];
    var point2 = [X_MAX,b];
  } else { // case of a non-horizontal line
    var y_when_x_is_MAX = a*X_MAX+b;
    var y_when_x_is_MIN = a*X_MIN+b;
    var x_when_y_is_MAX = (Y_MAX-b)/a;
    var x_when_y_is_MIN = (Y_MIN-b)/a;
    /* Corner cases in the following are associated with the edge in the clockwise direction */
    var intersectsLeft = ((Y_MIN <= y_when_x_is_MIN)&&(y_when_x_is_MIN < Y_MAX))
    var intersectsBottom = ((X_MIN < x_when_y_is_MIN)&&(x_when_y_is_MIN <= X_MAX))
    var intersectsRight = ((Y_MIN < y_when_x_is_MAX)&&(y_when_x_is_MAX <= Y_MAX))
    var intersectsTop = ((X_MIN <= x_when_y_is_MAX)&&(x_when_y_is_MAX < X_MAX))
    /* Get coordinates of where line intersects the edge of the coordinate grid, to get two points by which to define a line */
    if(intersectsLeft){
      var point1 = [X_MIN , y_when_x_is_MIN];
      if(intersectsBottom){
        var point2 = [x_when_y_is_MIN , Y_MIN];
      }else if(intersectsRight){
        var point2 = [X_MAX , y_when_x_is_MAX];
      }else if(intersectsTop){
        var point2 = [x_when_y_is_MAX , Y_MAX];
      }
    }else if(intersectsBottom){
      var point1 = [x_when_y_is_MIN , Y_MIN];
      if(intersectsRight){
        var point2 = [X_MAX , y_when_x_is_MAX];
      }else if(intersectsTop){
        var point2 = [x_when_y_is_MAX , Y_MAX];
      }
    }else{
      var point1 = [x_when_y_is_MAX , Y_MAX];
      var point2 = [X_MAX , y_when_x_is_max];
    }
  }
  var pathPoint1 = pointToPathNotation(point1);
  var pathPoint2 = pointToPathNotation(point2);
  var plottedLine = lineCanvas.path("M"+pathPoint1[0]+" "+pathPoint1[1]+"L"+pathPoint2[0]+" "+pathPoint2[1]);
}
