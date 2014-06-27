/* Computational constants */
var PI = Math.PI;
var AIR_INDEX = 1;
var WATER_INDEX = 1.33;
var GLASS_INDEX = 1.5;
var MATERIAL1_DEFAULT = "Air";
var MATERIAL2_DEFAULT = "Water";
/* should be rewritten in terms of above constants */
var INDEX1_DEFAULT = AIR_INDEX;
var INDEX2_DEFAULT = WATER_INDEX;
var DEFAULT_ANGLE = PI/4;
var NORMAL_SHOWN_DEFAULT = true;
var STANDARD_MARGIN = 8;
var STANDARD_ROUNDING_RADIUS = 6;
var STANDARD_BEAM_WIDTH = 4;

/* Global variables */
buttonPressed = false;

/* Color constants */
var UPPER_RECT_COLOR = '#E0E0FF';
var LOWER_RECT_COLOR = '#A0A0FF';
var EMITTER_COLOR = '#808080';
var BUTTON_COLOR_UNPRESSED = '#FF0000';
var BUTTON_COLOR_PRESSED = '#800000';
var LASER_VIEW_BOX_COLOR = '#E0E0E0';
var MATERIAL_BOX_COLOR = LASER_VIEW_BOX_COLOR;
var RESET_BUTTON_COLOR = '#E0E000';
var FULL_BEAM_COLOR = "#FF0000";

/* Text constants */
var LASER_VIEW_TITLE_TEXT = "Laser View";
var LASER_VIEW_CHOICES = ["Ray" , "Wave"];
var LASER_VIEW_UNITS = "nm";
var MATERIAL_TAG = "Material: ";
var MATERIAL_IOR_TAG = "Index of Refraction: ";
var RESET_BUTTON_TEXT = "Reset All";

/* Makes a Raphael path for a line from a list of two (X,Y) coordinates */
function makePathForLine(listOfCoordinates){
  var loC = listOfCoordinates;
  return "m"+loC[0][0]+","+loC[0][1]+"L"+loC[1][0]+","+loC[1][1];
}

/* Makes a Raphael path for a polygon from a list of (X,Y) coordinates */
function makePathForPolygon(listOfCoordinates){
  var loC = listOfCoordinates;
  var outStr = "m"+loC[0][0]+","+loC[0][1]+"L"; // syntax for first point
  for(var p=1;p<listOfCoordinates.length;p+=1){
    outStr += loC[p][0]+","+loC[p][1]+","; // syntax for additional points
  }
  outStr = outStr.substring(0,outStr.length-1);
  outStr += "z"; // syntax for closing polygon
  return outStr;
}

/* Graphic constants and entities */
/* Simulation Window */
var SIM_WIDTH = 1000;
var SIM_HEIGHT = 600;
canvas = Raphael(0,0,SIM_WIDTH,SIM_HEIGHT);
var upperRect = canvas.rect(0,0,SIM_WIDTH,SIM_HEIGHT/2)
                      .attr({'fill':UPPER_RECT_COLOR});
var lowerRect = canvas.rect(0,SIM_HEIGHT/2,SIM_WIDTH,SIM_HEIGHT/2)
                      .attr({'fill':LOWER_RECT_COLOR});
var BEAM_CONTACT_POINT_X = 350;
var BEAM_CONTACT_POINT_Y = SIM_HEIGHT/2;
var BEAM_CONTACT_POINT = [BEAM_CONTACT_POINT_X , BEAM_CONTACT_POINT_Y];

/* Emitter (not necessarily constants) */
var EMITTER_CONTACT_DISTANCE = 175*Math.sqrt(2);
var EMITTER_CONTACT_X_DIFF = EMITTER_CONTACT_DISTANCE * Math.sin(DEFAULT_ANGLE);
var EMITTER_CONTACT_Y_DIFF = EMITTER_CONTACT_DISTANCE * Math.cos(DEFAULT_ANGLE);
var EMITTER_CENTER_X = BEAM_CONTACT_POINT_X - EMITTER_CONTACT_X_DIFF;
var EMITTER_CENTER_Y = BEAM_CONTACT_POINT_Y - EMITTER_CONTACT_Y_DIFF;
var EMITTER_LEFT = [EMITTER_CENTER_X-60 , EMITTER_CENTER_Y-30];
var EMITTER_TOP = [EMITTER_CENTER_X-30 , EMITTER_CENTER_Y-60];
var EMITTER_RIGHT = [EMITTER_CENTER_X+60 , EMITTER_CENTER_Y+30];
var EMITTER_BOTTOM = [EMITTER_CENTER_X+30 , EMITTER_CENTER_Y+60];
emitter = canvas.path(makePathForPolygon([EMITTER_LEFT,EMITTER_TOP,EMITTER_RIGHT,EMITTER_BOTTOM]))
                .attr({'fill':EMITTER_COLOR});
var BUTTON_RADIUS = 16;
emitterButton = canvas.circle(EMITTER_CENTER_X,EMITTER_CENTER_Y,BUTTON_RADIUS)
                      .attr({'fill':BUTTON_COLOR_UNPRESSED});

/* Laser View Box */
var LASER_VIEW_TL_X = STANDARD_MARGIN; // TL: top-left
var LASER_VIEW_TL_Y = STANDARD_MARGIN;
var LASER_VIEW_BOX_WIDTH = 100;
var LASER_VIEW_BOX_HEIGHT = 80;
laserViewBox = canvas.rect(LASER_VIEW_TL_X,LASER_VIEW_TL_Y,LASER_VIEW_BOX_WIDTH,LASER_VIEW_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS)
                         .attr({'fill':LASER_VIEW_BOX_COLOR});

/* Material Adjustment Boxen */
var MATERIAL_BOX_WIDTH = 240; // Shared attributes between material boxes
var MATERIAL_BOX_HEIGHT = 160;
var MATERIAL_BOX_VERTICAL_OFFSET = STANDARD_MARGIN + MATERIAL_BOX_HEIGHT/2; // offset to center
var MATERIAL_BOX_CENTER_X = 850;
var UPPER_MATERIAL_BOX_CENTER_Y = SIM_HEIGHT/2 - MATERIAL_BOX_VERTICAL_OFFSET;
var LOWER_MATERIAL_BOX_CENTER_Y = SIM_HEIGHT/2 + MATERIAL_BOX_VERTICAL_OFFSET;
var MATERIAL_BOX_TL_X = MATERIAL_BOX_CENTER_X - MATERIAL_BOX_WIDTH/2;
var UPPER_MATERIAL_BOX_TL_Y = UPPER_MATERIAL_BOX_CENTER_Y - MATERIAL_BOX_HEIGHT/2;
var LOWER_MATERIAL_BOX_TL_Y = LOWER_MATERIAL_BOX_CENTER_Y - MATERIAL_BOX_HEIGHT/2;
upperMaterialViewBox = canvas.rect(MATERIAL_BOX_TL_X,UPPER_MATERIAL_BOX_TL_Y,MATERIAL_BOX_WIDTH,MATERIAL_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':MATERIAL_BOX_COLOR});
lowerMaterialViewBox = canvas.rect(MATERIAL_BOX_TL_X,LOWER_MATERIAL_BOX_TL_Y,MATERIAL_BOX_WIDTH,MATERIAL_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':MATERIAL_BOX_COLOR});

/* Reset Button */
var RESET_BUTTON_WIDTH = 100;
var RESET_BUTTON_HEIGHT = 30;
var RESET_BUTTON_TL_X = 870;
var RESET_BUTTON_VERTICAL_OFFSET = STANDARD_MARGIN + RESET_BUTTON_HEIGHT; // offset to top
var RESET_BUTTON_TL_Y = SIM_HEIGHT - RESET_BUTTON_VERTICAL_OFFSET;
resetButton = canvas.rect(RESET_BUTTON_TL_X,RESET_BUTTON_TL_Y,RESET_BUTTON_WIDTH,RESET_BUTTON_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':RESET_BUTTON_COLOR});

/* Initial Beam (not necessarily constants) */
var EMITTER_CENTER_TO_EMISSION = 45*Math.sqrt(2); // should be redefined in terms of previous constants
// BR: bottom-right
var EMITTER_BR_X = EMITTER_CENTER_X + EMITTER_CENTER_TO_EMISSION * Math.sin(DEFAULT_ANGLE);
var EMITTER_BR_Y = EMITTER_CENTER_Y + EMITTER_CENTER_TO_EMISSION * Math.cos(DEFAULT_ANGLE);
var EMITTER_BR = [EMITTER_BR_X , EMITTER_BR_Y]
initBeam = canvas.path(makePathForLine([EMITTER_BR , BEAM_CONTACT_POINT]))
                 .attr({'stroke':FULL_BEAM_COLOR})
                 .attr({'stroke-width':STANDARD_BEAM_WIDTH});

/* Reflected Beam (not necessarily constants) */


/* Propagating Beam (not necessarily constants) */

/* Angles are with respect to the normal. */

/* Calculate angle of refraction th2 */
/* Angles th1, th2 in radians */
function getNewAngleRefraction(n1,th1,n2){
  return Math.asin(n1*Math.sin(th1)/n2);
}

/* Calculate index of refraction n2 */
/* Angles th1, th2 in radians */
function getNewIndexRefraction(n1,th1,th2){
  return n1*Math.sin(th1)/Math.sin(th2);
}

/* Calculate intensity of reflection */
/* Angles th1, th2 in radians */
function calcReflected(n1,th1,n2,th2){
  return Math.pow((n1*Math.cos(th2)-n2*Math.cos(th1))/(n1*Math.cos(th2)+n2*Math.cos(th1)),2);
}

/* Calculate intensity of transmission */
/* Angles th1, th2 in radians */
function calcTransmitted(n1,th1,n2,th2){
  return 4*n1*n2*Math.cos(th1)*Math.cos(th2)/Math.pow(n1*Math.cos(th2)+n2*Math.cos(th1),2);
}
