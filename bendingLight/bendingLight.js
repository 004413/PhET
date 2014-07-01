/* Angles are with respect to the normal. */

/* Computational constants */
var PI = Math.PI;
var AIR_INDEX = 1;
var WATER_INDEX = 1.33;
var GLASS_INDEX = 1.5;

/* Defaults */
var INDICES = {'Air':AIR_INDEX,'Water':WATER_INDEX,'Glass':GLASS_INDEX};
var MATERIAL1_DEFAULT = "Air";
var MATERIAL2_DEFAULT = "Water";
var INDEX1_DEFAULT = INDICES[MATERIAL1_DEFAULT];
var INDEX2_DEFAULT = INDICES[MATERIAL2_DEFAULT];
var DEFAULT_ANGLE = 0;
var NORMAL_SHOWN_DEFAULT = true;

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

/* Simulation Setup */
var SIM_WIDTH = 900; 
var SIM_HEIGHT = 450;
var WH_MIN = Math.min(SIM_WIDTH,SIM_HEIGHT); // Minimum of simulation window width and height
canvas = Raphael(0,0,SIM_WIDTH,SIM_HEIGHT);
var UPPER_RECT = canvas.rect(0,0,SIM_WIDTH,SIM_HEIGHT/2)
                      .attr({'fill':UPPER_RECT_COLOR});
var LOWER_RECT = canvas.rect(0,SIM_HEIGHT/2,SIM_WIDTH,SIM_HEIGHT/2)
                      .attr({'fill':LOWER_RECT_COLOR});

/* Standard graphical constants */
var STANDARD_MARGIN = Math.min(8,WH_MIN/8);
var STANDARD_TEXT_MARGIN = Math.min(12,WH_MIN/12);
var STANDARD_ROUNDING_RADIUS = Math.min(6,WH_MIN/20);
var STANDARD_BEAM_WIDTH = Math.min(4,WH_MIN/24);

var SLIDER_HEIGHT = Math.min(50,SIM_WIDTH/10);
var SLIDER_WIDTH = Math.min(300,SIM_WIDTH/2);
var angleSlider = new slider(canvas,0,SIM_HEIGHT-SLIDER_HEIGHT,SLIDER_WIDTH,SLIDER_HEIGHT,0,PI/2,"Angle");

/* Global variables */
buttonPressed = false;
material1 = MATERIAL1_DEFAULT;
material2 = MATERIAL2_DEFAULT;
index1 = INDEX1_DEFAULT;
index2 = INDEX2_DEFAULT;
angle = PI/4;
normalShown = NORMAL_SHOWN_DEFAULT;

/* Text constants */
var LASER_VIEW_TITLE_TEXT = "Laser View";
var LASER_VIEW_CHOICES = ["Ray" , "Wave"];
var LASER_VIEW_UNITS = "nm";
var MATERIAL_TAG = "Material: ";
var MATERIAL_IOR_TAG = "Index of Refraction: ";
var RESET_BUTTON_TEXT = "Reset All";

/* Makes a Raphael path for a line from a list of two (X,Y) coordinates */
function makePathForLine(loC){ // loC is a list of coordinates
  return "m"+loC[0][0]+","+loC[0][1]+"L"+loC[1][0]+","+loC[1][1];
}

/* Makes a Raphael path for a polygon from a list of (X,Y) coordinates */
function makePathForPolygon(loC){ // loC is a list of coordinates
  var outStr = "m"+loC[0][0]+","+loC[0][1]+"L"; // syntax for first point
  for(var p=1;p<loC.length;p+=1){
    outStr += loC[p][0]+","+loC[p][1]+","; // syntax for additional points
  }
  outStr = outStr.substring(0,outStr.length-1);
  outStr += "z"; // syntax for closing polygon
  return outStr;
}

/* Graphical constants and entities */
var BEAM_CONTACT_POINT_X = Math.min(350,2*SIM_WIDTH/5);
var BEAM_CONTACT_POINT_Y = SIM_HEIGHT/2;
var BEAM_CONTACT_POINT = [BEAM_CONTACT_POINT_X , BEAM_CONTACT_POINT_Y];

/* Emitter (not necessarily constants) */
var EMITTER_CONTACT_DISTANCE = Math.min(175*Math.sqrt(2),WH_MIN/3);
emitter_contact_x_diff = EMITTER_CONTACT_DISTANCE * Math.sin(angle);
emitter_contact_y_diff = EMITTER_CONTACT_DISTANCE * Math.cos(angle);
emitter_center_x = BEAM_CONTACT_POINT_X - emitter_contact_x_diff;
emitter_center_y = BEAM_CONTACT_POINT_Y - emitter_contact_y_diff;
var EMITTER_LENGTH = Math.min(126,WH_MIN/4);
var EMITTER_WIDTH = EMITTER_LENGTH/3;
var EMITTER_LENGTH_HALF = EMITTER_LENGTH/2;
var EMITTER_WIDTH_HALF = EMITTER_WIDTH/2;
emitter_left_x = emitter_center_x - EMITTER_LENGTH_HALF*Math.sin(angle) - EMITTER_WIDTH_HALF*Math.cos(angle);
emitter_left_y = emitter_center_y - EMITTER_LENGTH_HALF*Math.cos(angle) + EMITTER_WIDTH_HALF*Math.sin(angle);
emitter_left = [emitter_left_x , emitter_left_y];
emitter_top_x = emitter_center_x - EMITTER_LENGTH_HALF*Math.sin(angle) + EMITTER_WIDTH_HALF*Math.cos(angle);
emitter_top_y = emitter_center_y - EMITTER_LENGTH_HALF*Math.cos(angle) - EMITTER_WIDTH_HALF*Math.sin(angle);
emitter_top = [emitter_top_x , emitter_top_y];
emitter_right_x = emitter_center_x + EMITTER_LENGTH_HALF*Math.sin(angle) + EMITTER_WIDTH_HALF*Math.cos(angle);
emitter_right_y = emitter_center_y + EMITTER_LENGTH_HALF*Math.cos(angle) - EMITTER_WIDTH_HALF*Math.sin(angle);
emitter_right = [emitter_right_x , emitter_right_y];
emitter_bottom_x = emitter_center_x + EMITTER_LENGTH_HALF*Math.sin(angle) - EMITTER_WIDTH_HALF*Math.cos(angle);
emitter_bottom_y = emitter_center_y + EMITTER_LENGTH_HALF*Math.cos(angle) + EMITTER_WIDTH_HALF*Math.sin(angle);
emitter_bottom = [emitter_bottom_x , emitter_bottom_y];
emitter = canvas.path(makePathForPolygon([emitter_left,emitter_top,emitter_right,emitter_bottom]))
                .attr({'fill':EMITTER_COLOR})
                .attr({'id':'emitter'});
var BUTTON_MARGIN = 5;
var BUTTON_RADIUS = Math.max(1,EMITTER_WIDTH/2-BUTTON_MARGIN);
emitterButton = canvas.circle(emitter_center_x,emitter_center_y,BUTTON_RADIUS)
                      .attr({'fill':BUTTON_COLOR_UNPRESSED})
                      .attr({'id':'emitterButton'});

/* Laser View Box */
var LASER_VIEW_TL_X = STANDARD_MARGIN; // TL: top-left
var LASER_VIEW_TL_Y = STANDARD_MARGIN;
var LASER_VIEW_BOX_WIDTH = Math.min(100,SIM_WIDTH/5);
var LASER_VIEW_BOX_HEIGHT = 4*LASER_VIEW_BOX_WIDTH/5;
laserViewBox = canvas.rect(LASER_VIEW_TL_X,LASER_VIEW_TL_Y,LASER_VIEW_BOX_WIDTH,LASER_VIEW_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS)
                         .attr({'fill':LASER_VIEW_BOX_COLOR})
                         .attr({'id':'laserViewBox'});

/* Material Adjustment Boxen */
var MATERIAL_BOX_WIDTH = Math.min(200,SIM_WIDTH/5); // Shared attributes between material boxes
var MATERIAL_BOX_HEIGHT = 2*MATERIAL_BOX_WIDTH/3;
var MATERIAL_BOX_VERTICAL_OFFSET = STANDARD_MARGIN + MATERIAL_BOX_HEIGHT/2; // offset to center
var MATERIAL_BOX_CENTER_X = 7*SIM_WIDTH/8-10; // Calculate and adjust later to fit with above
var UPPER_MATERIAL_BOX_CENTER_Y = SIM_HEIGHT/2 - MATERIAL_BOX_VERTICAL_OFFSET;
var LOWER_MATERIAL_BOX_CENTER_Y = SIM_HEIGHT/2 + MATERIAL_BOX_VERTICAL_OFFSET;
var MATERIAL_BOX_TL_X = MATERIAL_BOX_CENTER_X - MATERIAL_BOX_WIDTH/2;
var UPPER_MATERIAL_BOX_TL_Y = UPPER_MATERIAL_BOX_CENTER_Y - MATERIAL_BOX_HEIGHT/2;
var LOWER_MATERIAL_BOX_TL_Y = LOWER_MATERIAL_BOX_CENTER_Y - MATERIAL_BOX_HEIGHT/2;
upperMaterialViewBox = canvas.rect(MATERIAL_BOX_TL_X,UPPER_MATERIAL_BOX_TL_Y,MATERIAL_BOX_WIDTH,MATERIAL_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':MATERIAL_BOX_COLOR});
lowerMaterialViewBox = canvas.rect(MATERIAL_BOX_TL_X,LOWER_MATERIAL_BOX_TL_Y,MATERIAL_BOX_WIDTH,MATERIAL_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':MATERIAL_BOX_COLOR});

/* Reset Button */
var RESET_BUTTON_WIDTH = Math.min(100,SIM_WIDTH/8);
var RESET_BUTTON_HEIGHT = Math.min(30,SIM_HEIGHT/12);
var RESET_BUTTON_TL_X = 7*SIM_WIDTH/8-20;
var RESET_BUTTON_VERTICAL_OFFSET = STANDARD_MARGIN + RESET_BUTTON_HEIGHT; // offset from screen bottom to top
var RESET_BUTTON_TL_Y = SIM_HEIGHT - RESET_BUTTON_VERTICAL_OFFSET;
resetButton = canvas.rect(RESET_BUTTON_TL_X,RESET_BUTTON_TL_Y,RESET_BUTTON_WIDTH,RESET_BUTTON_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':RESET_BUTTON_COLOR});

/* Normal Line */
var NORMAL_LINE_LENGTH = Math.min(300,SIM_HEIGHT/2);
var NORMAL_LINE_TOP = [BEAM_CONTACT_POINT_X , BEAM_CONTACT_POINT_Y - NORMAL_LINE_LENGTH/2];
var NORMAL_LINE_BOTTOM = [BEAM_CONTACT_POINT_X , BEAM_CONTACT_POINT_Y + NORMAL_LINE_LENGTH/2];
normalLine = canvas.path(makePathForLine([NORMAL_LINE_TOP , NORMAL_LINE_BOTTOM]))
                   .attr({'stroke-dasharray':'--'})
                   .attr({'id':'normalLine'});

/* Initial Beam (not necessarily constants) */
// BR: bottom-right
emitter_br_x = emitter_center_x + EMITTER_LENGTH_HALF * Math.sin(angle);
emitter_br_y = emitter_center_y + EMITTER_LENGTH_HALF * Math.cos(angle);
emitter_br = [emitter_br_x , emitter_br_y]
initBeam = canvas.path(makePathForLine([emitter_br , BEAM_CONTACT_POINT]))
                 .attr({'stroke':FULL_BEAM_COLOR})
                 .attr({'stroke-width':STANDARD_BEAM_WIDTH})
                 .attr({'id':'initBeam'});

/* Reflected Beam (not necessarily constants) */
// ur: upper-right
ur_x = Math.tan(angle)*SIM_HEIGHT/2+BEAM_CONTACT_POINT_X;
ur_y = 0;
ur = [ur_x , ur_y];
reflBeam = canvas.path(makePathForLine([ur , BEAM_CONTACT_POINT]))
                 .attr({'stroke':FULL_BEAM_COLOR})
                 .attr({'stroke-width':STANDARD_BEAM_WIDTH})
                 .attr({'id':'reflBeam'});

/* Propagating Beam (not necessarily constants) */
newAngle = getNewAngleRefraction(index1,angle,index2);
// LR: lower-right
var PROP_LR_X = Math.tan(newAngle)*SIM_HEIGHT/2+BEAM_CONTACT_POINT_X;
var PROP_LR_Y = SIM_HEIGHT;
var PROP_LR = [PROP_LR_X , PROP_LR_Y]
propBeam = canvas.path(makePathForLine([PROP_LR , BEAM_CONTACT_POINT]))
                 .attr({'stroke':FULL_BEAM_COLOR})
                 .attr({'stroke-width':STANDARD_BEAM_WIDTH})
                 .attr({'id':'propBeam'});

canvas.text(LASER_VIEW_TL_X+LASER_VIEW_BOX_WIDTH/2,LASER_VIEW_TL_Y+STANDARD_TEXT_MARGIN,LASER_VIEW_TITLE_TEXT);
canvas.text(MATERIAL_BOX_TL_X+MATERIAL_BOX_WIDTH/2,UPPER_MATERIAL_BOX_TL_Y+STANDARD_TEXT_MARGIN,MATERIAL_TAG);
canvas.text(MATERIAL_BOX_TL_X+MATERIAL_BOX_WIDTH/2,LOWER_MATERIAL_BOX_TL_Y+STANDARD_TEXT_MARGIN,MATERIAL_TAG);
canvas.text(RESET_BUTTON_TL_X+RESET_BUTTON_WIDTH/2,RESET_BUTTON_TL_Y+STANDARD_TEXT_MARGIN,RESET_BUTTON_TEXT);

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

/* Not working for some reason 
$(document).ready(function(){
  $('#emitterButton').click(function(){
    console.log(canvas.getByID('emitterButton'));
    canvas.getById('emitterButton')
          .attr({'fill':BUTTON_COLOR_PRESSED});
  });
});
*/

function updateAngle(){
  angle = angleSlider.val;
  emitter_contact_x_diff = EMITTER_CONTACT_DISTANCE * Math.sin(angle);
  emitter_contact_y_diff = EMITTER_CONTACT_DISTANCE * Math.cos(angle);
  emitter_center_x = BEAM_CONTACT_POINT_X - emitter_contact_x_diff;
  emitter_center_y = BEAM_CONTACT_POINT_Y - emitter_contact_y_diff;
  emitter_left_x = emitter_center_x - EMITTER_LENGTH_HALF*Math.sin(angle) - EMITTER_WIDTH_HALF*Math.cos(angle);
  emitter_left_y = emitter_center_y - EMITTER_LENGTH_HALF*Math.cos(angle) + EMITTER_WIDTH_HALF*Math.sin(angle);
  emitter_left = [emitter_left_x , emitter_left_y];
  emitter_top_x = emitter_center_x - EMITTER_LENGTH_HALF*Math.sin(angle) + EMITTER_WIDTH_HALF*Math.cos(angle);
  emitter_top_y = emitter_center_y - EMITTER_LENGTH_HALF*Math.cos(angle) - EMITTER_WIDTH_HALF*Math.sin(angle);
  emitter_top = [emitter_top_x , emitter_top_y];
  emitter_right_x = emitter_center_x + EMITTER_LENGTH_HALF*Math.sin(angle) + EMITTER_WIDTH_HALF*Math.cos(angle);
  emitter_right_y = emitter_center_y + EMITTER_LENGTH_HALF*Math.cos(angle) - EMITTER_WIDTH_HALF*Math.sin(angle);
  emitter_right = [emitter_right_x , emitter_right_y];
  emitter_bottom_x = emitter_center_x + EMITTER_LENGTH_HALF*Math.sin(angle) - EMITTER_WIDTH_HALF*Math.cos(angle);
  emitter_bottom_y = emitter_center_y + EMITTER_LENGTH_HALF*Math.cos(angle) + EMITTER_WIDTH_HALF*Math.sin(angle);
  emitter_bottom = [emitter_bottom_x , emitter_bottom_y];
  emitter = canvas.path(makePathForPolygon([emitter_left,emitter_top,emitter_right,emitter_bottom]))
                  .attr({'fill':EMITTER_COLOR})
                  .attr({'id':'emitter'});
  emitterButton = canvas.circle(emitter_center_x,emitter_center_y,BUTTON_RADIUS)
                        .attr({'fill':BUTTON_COLOR_UNPRESSED})
                        .attr({'id':'emitterButton'});
/* Initial Beam (not necessarily constants) */
// BR: bottom-right
  emitter_br_x = emitter_center_x + EMITTER_LENGTH_HALF * Math.sin(angle);
  emitter_br_y = emitter_center_y + EMITTER_LENGTH_HALF * Math.cos(angle);
  emitter_br = [emitter_br_x , emitter_br_y]
  initBeam = canvas.path(makePathForLine([emitter_br , BEAM_CONTACT_POINT]))
                   .attr({'stroke':FULL_BEAM_COLOR})
                   .attr({'stroke-width':STANDARD_BEAM_WIDTH})
                   .attr({'id':'initBeam'});

/* Reflected Beam (not necessarily constants) */
// ur: upper-right
  ur_x = Math.tan(angle)*SIM_HEIGHT/2+BEAM_CONTACT_POINT_X;
  ur_y = 0;
  ur = [ur_x , ur_y];
  reflBeam = canvas.path(makePathForLine([ur , BEAM_CONTACT_POINT]))
                   .attr({'stroke':FULL_BEAM_COLOR})
                   .attr({'stroke-width':STANDARD_BEAM_WIDTH})
                   .attr({'id':'reflBeam'});

/* Propagating Beam (not necessarily constants) */
  newAngle = getNewAngleRefraction(index1,angle,index2);
// LR: lower-right
  propBeam = canvas.path(makePathForLine([PROP_LR , BEAM_CONTACT_POINT]))
                   .attr({'stroke':FULL_BEAM_COLOR})
                   .attr({'stroke-width':STANDARD_BEAM_WIDTH})
                   .attr({'id':'propBeam'});
}

setInterval(updateAngle,10);
