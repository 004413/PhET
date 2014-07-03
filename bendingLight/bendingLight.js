/* Throughout, angles are with respect to the normal, measured in radians. */

/* Computational constants */
var PI = Math.PI;
var AIR_INDEX = 1;
var WATER_INDEX = 1.33;
var GLASS_INDEX = 1.5;

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

/* Defaults */
var INDICES = {'Air':AIR_INDEX,'Water':WATER_INDEX,'Glass':GLASS_INDEX};
var MATERIAL1_DEFAULT = "Air";
var MATERIAL2_DEFAULT = "Water";
var INDEX1_DEFAULT = INDICES[MATERIAL1_DEFAULT];
var INDEX2_DEFAULT = INDICES[MATERIAL2_DEFAULT];
var DEFAULT_ANGLE = 0;
var NORMAL_SHOWN_DEFAULT = true;

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

/* Converts a fraction of red quantity (in intensity compared to white) to color string */
function convertFracOfRedToColorString(frac){ 
  /* 257 (0x0101): to remove equal amounts of green and blue */
  var intQuantity = Math.pow(16,6)-1 - 257*Math.round(255*frac);
  return "#"+intQuantity.toString(16);
}

/* Simulation Setup */
var SIM_WIDTH = 1200; 
var SIM_HEIGHT = 600;
var WH_MIN = Math.min(SIM_WIDTH,SIM_HEIGHT); // Minimum of simulation window width and height
canvas = Raphael(0,0,SIM_WIDTH,SIM_HEIGHT);
var UPPER_RECT = canvas.rect(0,0,SIM_WIDTH,SIM_HEIGHT/2)
                       .attr({'fill':UPPER_RECT_COLOR});
var LOWER_RECT = canvas.rect(0,SIM_HEIGHT/2,SIM_WIDTH,SIM_HEIGHT/2)
                       .attr({'fill':LOWER_RECT_COLOR});

/* Standard graphical constants */
var STANDARD_MARGIN = Math.min(8,WH_MIN/8);
var STANDARD_TEXT_MARGIN = Math.min(12,WH_MIN/12);
var STANDARD_SLIDER_MARGIN = Math.min(20,SIM_HEIGHT/10);
var STANDARD_ROUNDING_RADIUS = Math.min(6,WH_MIN/20);
var STANDARD_BEAM_WIDTH = Math.min(4,WH_MIN/24);

var SLIDER_HEIGHT = Math.min(50,SIM_WIDTH/10);
var SLIDER_WIDTH = Math.min(300,SIM_WIDTH/3);

/* Sliders */
var SLIDER_SPACING = SLIDER_HEIGHT+20;
var upperIndexSlider = new slider(canvas,0,SIM_HEIGHT-SLIDER_HEIGHT-2*SLIDER_SPACING,SLIDER_WIDTH,SLIDER_HEIGHT,1,2.5,"Upper Material Index of Refraction");
var lowerIndexSlider = new slider(canvas,0,SIM_HEIGHT-SLIDER_HEIGHT-SLIDER_SPACING,SLIDER_WIDTH,SLIDER_HEIGHT,1,2.5,"Lower Material Index of Refraction");
var angleSlider = new slider(canvas,0,SIM_HEIGHT-SLIDER_HEIGHT,SLIDER_WIDTH,SLIDER_HEIGHT,0,PI/2-0.001,"Angle of Incidence (Radians)");

/* Global variables */
buttonPressed = false;
material1 = MATERIAL1_DEFAULT;
material2 = MATERIAL2_DEFAULT;
index1 = INDEX1_DEFAULT;
index2 = INDEX2_DEFAULT;
angle = PI/4;
normalShown = NORMAL_SHOWN_DEFAULT;

/* Beam Contact Constants */
var BEAM_CONTACT_POINT_X = Math.min(350,2*SIM_WIDTH/5);
var BEAM_CONTACT_POINT_Y = SIM_HEIGHT/2;
var BEAM_CONTACT_POINT = [BEAM_CONTACT_POINT_X , BEAM_CONTACT_POINT_Y];

/* Emitter Constants */
var EMITTER_CONTACT_DISTANCE = Math.min(175*Math.sqrt(2),WH_MIN/3);
var EMITTER_LENGTH = Math.min(126,WH_MIN/4);
var EMITTER_WIDTH = EMITTER_LENGTH/3;
var EMITTER_LENGTH_HALF = EMITTER_LENGTH/2;
var EMITTER_WIDTH_HALF = EMITTER_WIDTH/2;
var BUTTON_MARGIN = Math.min(5,WH_MIN/96);
var BUTTON_RADIUS = Math.max(1,EMITTER_WIDTH/2-BUTTON_MARGIN);

/* Emitter Setup */
function emitterUpdate(){
  var emitter_contact_x_diff = EMITTER_CONTACT_DISTANCE * Math.sin(angle);
  var emitter_contact_y_diff = EMITTER_CONTACT_DISTANCE * Math.cos(angle);
  emitter_center_x = BEAM_CONTACT_POINT_X - emitter_contact_x_diff;
  emitter_center_y = BEAM_CONTACT_POINT_Y - emitter_contact_y_diff;
  var emitter_left_x = emitter_center_x - EMITTER_LENGTH_HALF*Math.sin(angle) - EMITTER_WIDTH_HALF*Math.cos(angle);
  var emitter_left_y = emitter_center_y - EMITTER_LENGTH_HALF*Math.cos(angle) + EMITTER_WIDTH_HALF*Math.sin(angle);
  var emitter_left = [emitter_left_x , emitter_left_y];
  var emitter_top_x = emitter_center_x - EMITTER_LENGTH_HALF*Math.sin(angle) + EMITTER_WIDTH_HALF*Math.cos(angle);
  var emitter_top_y = emitter_center_y - EMITTER_LENGTH_HALF*Math.cos(angle) - EMITTER_WIDTH_HALF*Math.sin(angle);
  var emitter_top = [emitter_top_x , emitter_top_y];
  var emitter_right_x = emitter_center_x + EMITTER_LENGTH_HALF*Math.sin(angle) + EMITTER_WIDTH_HALF*Math.cos(angle);
  var emitter_right_y = emitter_center_y + EMITTER_LENGTH_HALF*Math.cos(angle) - EMITTER_WIDTH_HALF*Math.sin(angle);
  var emitter_right = [emitter_right_x , emitter_right_y];
  var emitter_bottom_x = emitter_center_x + EMITTER_LENGTH_HALF*Math.sin(angle) - EMITTER_WIDTH_HALF*Math.cos(angle);
  var emitter_bottom_y = emitter_center_y + EMITTER_LENGTH_HALF*Math.cos(angle) + EMITTER_WIDTH_HALF*Math.sin(angle);
  var emitter_bottom = [emitter_bottom_x , emitter_bottom_y];
  emitter = canvas.path(makePathForPolygon([emitter_left,emitter_top,emitter_right,emitter_bottom]))
                  .attr({'fill':EMITTER_COLOR})
                  .attr({'id':'emitter'})
                  //.glow();
  emitterButton = canvas.circle(emitter_center_x,emitter_center_y,BUTTON_RADIUS)
                        .attr({'fill':BUTTON_COLOR_UNPRESSED})
                        .attr({'id':'emitterButton'});
}

$(document).ready(function(){
  console.log("This is a hi!");
  console.log(emitterButton);
  emitterButton.click(function(){
    console.log("Hi!");
    if(emitterButton.attr('fill')==BUTTON_COLOR_UNPRESSED){
      console.log("Hi, again!");
      emitterButton.attr({'fill':BUTTON_COLOR_PRESSED});
    }
  });
});

/* Laser View Box Constants */
var LASER_VIEW_TL_X = STANDARD_MARGIN; // TL: top-left
var LASER_VIEW_TL_Y = STANDARD_MARGIN;
var LASER_VIEW_BOX_WIDTH = Math.min(100,SIM_WIDTH/8);
var LASER_VIEW_BOX_HEIGHT = 4*LASER_VIEW_BOX_WIDTH/5;

/* Laser View Box Setup */
laserViewBox = canvas.rect(LASER_VIEW_TL_X,LASER_VIEW_TL_Y,LASER_VIEW_BOX_WIDTH,LASER_VIEW_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS)
                     .attr({'fill':LASER_VIEW_BOX_COLOR})
                     .attr({'id':'laserViewBox'});

/* Material Adjustment Boxen Constants */
var MATERIAL_BOX_WIDTH = Math.min(200,SIM_WIDTH/6); // Shared attributes between material boxes
var MATERIAL_BOX_HEIGHT = 2*MATERIAL_BOX_WIDTH/3;
var MATERIAL_BOX_VERTICAL_OFFSET = STANDARD_MARGIN + MATERIAL_BOX_HEIGHT/2; // offset to center
var MATERIAL_BOX_CENTER_X = 7*SIM_WIDTH/8-10; // Calculate and adjust later to fit with above
var UPPER_MATERIAL_BOX_CENTER_Y = SIM_HEIGHT/2 - MATERIAL_BOX_VERTICAL_OFFSET;
var LOWER_MATERIAL_BOX_CENTER_Y = SIM_HEIGHT/2 + MATERIAL_BOX_VERTICAL_OFFSET;
var MATERIAL_BOX_TL_X = MATERIAL_BOX_CENTER_X - MATERIAL_BOX_WIDTH/2;
var UPPER_MATERIAL_BOX_TL_Y = UPPER_MATERIAL_BOX_CENTER_Y - MATERIAL_BOX_HEIGHT/2;
var LOWER_MATERIAL_BOX_TL_Y = LOWER_MATERIAL_BOX_CENTER_Y - MATERIAL_BOX_HEIGHT/2;

/* Material Adjustment Boxen Setup */
upperMaterialViewBox = canvas.rect(MATERIAL_BOX_TL_X,UPPER_MATERIAL_BOX_TL_Y,MATERIAL_BOX_WIDTH,MATERIAL_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':MATERIAL_BOX_COLOR});
lowerMaterialViewBox = canvas.rect(MATERIAL_BOX_TL_X,LOWER_MATERIAL_BOX_TL_Y,MATERIAL_BOX_WIDTH,MATERIAL_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':MATERIAL_BOX_COLOR});

/* Reset Button Constants */
var RESET_BUTTON_WIDTH = Math.min(100,SIM_WIDTH/8);
var RESET_BUTTON_HEIGHT = Math.min(30,SIM_HEIGHT/12);
var RESET_BUTTON_TL_X = 7*SIM_WIDTH/8-20;
var RESET_BUTTON_VERTICAL_OFFSET = STANDARD_MARGIN + RESET_BUTTON_HEIGHT; // offset from screen bottom to top
var RESET_BUTTON_TL_Y = SIM_HEIGHT - RESET_BUTTON_VERTICAL_OFFSET;

/* Reset Button Setup */
resetButton = canvas.rect(RESET_BUTTON_TL_X,RESET_BUTTON_TL_Y,RESET_BUTTON_WIDTH,RESET_BUTTON_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':RESET_BUTTON_COLOR});

/* Normal Line Constants */
var NORMAL_LINE_LENGTH = Math.min(300,SIM_HEIGHT/2);
var NORMAL_LINE_TOP = [BEAM_CONTACT_POINT_X , BEAM_CONTACT_POINT_Y - NORMAL_LINE_LENGTH/2];
var NORMAL_LINE_BOTTOM = [BEAM_CONTACT_POINT_X , BEAM_CONTACT_POINT_Y + NORMAL_LINE_LENGTH/2];

/* Normal Line */
if(normalShown){
  normalLine = canvas.path(makePathForLine([NORMAL_LINE_TOP , NORMAL_LINE_BOTTOM]))
                     .attr({'stroke-dasharray':'--'})
                     .attr({'id':'normalLine'});
}

/* Initial Beam Setup and Update */
function initBeamUpdate(){
  var emitter_br_x = emitter_center_x + EMITTER_LENGTH_HALF * Math.sin(angle); // br: bottom-right
  var emitter_br_y = emitter_center_y + EMITTER_LENGTH_HALF * Math.cos(angle);
  var emitter_br = [emitter_br_x , emitter_br_y]
  initBeam = canvas.path(makePathForLine([emitter_br , BEAM_CONTACT_POINT]))
                   .attr({'stroke':FULL_BEAM_COLOR})
                   .attr({'stroke-width':STANDARD_BEAM_WIDTH})
                   .attr({'id':'initBeam'});
}

/* Reflected Beam Setup and Update */
function reflBeamUpdate(fracRefl){
  var ur_x = Math.tan(angle)*SIM_HEIGHT/2+BEAM_CONTACT_POINT_X; // ur: upper-right
  var ur_y = 0;
  var ur = [ur_x , ur_y];
  var color = convertFracOfRedToColorString(fracRefl);
  reflBeam = canvas.path(makePathForLine([ur , BEAM_CONTACT_POINT]))
                   .attr({'stroke':color})
                   .attr({'stroke-width':STANDARD_BEAM_WIDTH})
                   .attr({'id':'reflBeam'});
}

/* Propagating Beam Setup and Update */
function propBeamUpdate(fracProp,angle){
  var prop_lr_x = Math.tan(angle)*SIM_HEIGHT/2+BEAM_CONTACT_POINT_X; // lr: lower-right
  var prop_lr_y = SIM_HEIGHT;
  var prop_lr = [prop_lr_x , prop_lr_y];
  var color = convertFracOfRedToColorString(fracProp);
  propBeam = canvas.path(makePathForLine([prop_lr , BEAM_CONTACT_POINT]))
                   .attr({'stroke':color})
                   .attr({'stroke-width':STANDARD_BEAM_WIDTH})
                   .attr({'id':'propBeam'});
}

reflBeamUpdate(0);
emitterUpdate();
initBeamUpdate();
propBeamUpdate(1,0);

canvas.text(LASER_VIEW_TL_X+LASER_VIEW_BOX_WIDTH/2,LASER_VIEW_TL_Y+STANDARD_TEXT_MARGIN,LASER_VIEW_TITLE_TEXT);
canvas.text(MATERIAL_BOX_TL_X+MATERIAL_BOX_WIDTH/2,UPPER_MATERIAL_BOX_TL_Y+STANDARD_TEXT_MARGIN,MATERIAL_TAG);
canvas.text(MATERIAL_BOX_TL_X+MATERIAL_BOX_WIDTH/2,LOWER_MATERIAL_BOX_TL_Y+STANDARD_TEXT_MARGIN,MATERIAL_TAG);
canvas.text(RESET_BUTTON_TL_X+RESET_BUTTON_WIDTH/2,RESET_BUTTON_TL_Y+STANDARD_TEXT_MARGIN,RESET_BUTTON_TEXT);

/* Angles are with respect to the normal. */

/* Calculate angle of refraction th2 */
/* Angles th1, th2 in radians */
function getNewAngleRefraction(n1,th1,n2){
  if(n1*Math.sin(th1)/n2<=1){
    return Math.asin(n1*Math.sin(th1)/n2);
  }else{
    return "total";
  }
}

/* Calculate index of refraction n2 */
/* Angles th1, th2 in radians */
function getNewIndexRefraction(n1,th1,th2){
  return n1*Math.sin(th1)/Math.sin(th2);
}

/* Calculate intensity of reflection */
/* Angles th1, th2 in radians */
function calcReflected(n1,th1,n2,th2){
  return Math.pow((n1*Math.cos(th1)-n2*Math.cos(th2))/(n1*Math.cos(th1)+n2*Math.cos(th2)),2);
}

/* Calculate intensity of transmission */
/* Angles th1, th2 in radians */
function calcPropagated(n1,th1,n2,th2){
  return 4*n1*n2*Math.cos(th1)*Math.cos(th2)/Math.pow(n1*Math.cos(th1)+n2*Math.cos(th2),2);
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
/*
$(document).ready(function(){
  $('emitterButton').click(function(){
    console.log("Test.");
  });
});
*/

function updateAngle(){
  initBeam.remove();
  reflBeam.remove();
  propBeam.remove();
  emitter.remove();
  emitterButton.remove();
  angle = angleSlider.val;
  index1 = upperIndexSlider.val;
  index2 = lowerIndexSlider.val;
  var propAngle = getNewAngleRefraction(index1,angle,index2);
  if(propAngle=="total"){
    var fracRefl = 1;
    var fracProp = 0;
  }else{
    var fracRefl = calcReflected(index1,angle,index2,propAngle);
    var fracProp = calcPropagated(index1,angle,index2,propAngle);
  }
  reflBeamUpdate(fracRefl);
  emitterUpdate();
  initBeamUpdate();
  propBeamUpdate(fracProp,propAngle);
}

/* Calls updateAngle() every 20 milliseconds */
setInterval(updateAngle,20);
