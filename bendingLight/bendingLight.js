/* Throughout, angles are with respect to the normal, measured in radians. */

/* Computational constants */
var PI = Math.PI;
var AIR_INDEX = 1;
var WATER_INDEX = 1.33;
var GLASS_INDEX = 1.6;

/* Color constants */
var EMITTER_COLOR = '#808080';
// var BUTTON_COLOR_UNPRESSED = '#FF0000';
// var BUTTON_COLOR_PRESSED = '#800000';
// var LASER_VIEW_BOX_COLOR = '#E0E0E0';
// var MATERIAL_BOX_COLOR = LASER_VIEW_BOX_COLOR;
// var RESET_BUTTON_COLOR = '#E0E000';
var FULL_BEAM_COLOR = "#FF0000";
var REFL_TEXT_MAX_COLOR = "#FFA000";
var REFL_TEXT_MIN_COLOR = "#906000";
var PROP_TEXT_MAX_COLOR = "#A0FF00";
var PROP_TEXT_MIN_COLOR = "#609000";
var INDEX_SLIDER_COLOR = "#00A000";
var ANGLE_SLIDER_COLOR = "#FFFF00";
var BLACK = "#000000";

/* Text constants */
// var LASER_VIEW_TITLE_TEXT = "Laser View";
// var LASER_VIEW_CHOICES = ["Ray" , "Wave"];
// var LASER_VIEW_UNITS = "nm";
// var MATERIAL_TAG = "Material: ";
// var MATERIAL_IOR_TAG = "Index of Refraction: ";
// var RESET_BUTTON_TEXT = "Reset All";

/* Defaults */
var INDICES = {'Air':AIR_INDEX,'Water':WATER_INDEX,'Glass':GLASS_INDEX};
var MATERIAL1_DEFAULT = "Air";
var MATERIAL2_DEFAULT = "Glass";
var INDEX1_DEFAULT = INDICES[MATERIAL1_DEFAULT];
var INDEX2_DEFAULT = INDICES[MATERIAL2_DEFAULT];
var DEFAULT_ANGLE = PI/6;
var NORMAL_SHOWN_DEFAULT = true;
var DEFAULT_UPPER_RECT_COLOR = '#E0E0FF';
var DEFAULT_LOWER_RECT_COLOR = '#A0A0FF';

/* Rounds a number to three decimal places */
function roundTo3(x){
  return parseFloat(x).toFixed(3);
}

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

/* Remaps a number between 1 and 2.5 to a number between 0.25 and 1 */
function mapToFrac(numBetweenOneAndTwoPointFive){
  return (numBetweenOneAndTwoPointFive-0.5)/2;
}

/* Converts a fraction of red quantity (in intensity compared to white) to color string */
function convertFracOfRedToColorString(frac){ // frac ranges from 0 to 1 here
  /* 257 (0x0101): to remove equal amounts of green and blue */
  var intQuantity = Math.pow(16,6)-1 - 257*Math.round(255*frac);
  return "#"+intQuantity.toString(16);
}

/* Converts a fraction of blue quantity (in intensity compared to a really light blue) to color string */
function convertFracOfBlueToColorString(frac){ // frac ranges from 0.25 to 1 here
  /* 65792 (0x010100): to remove equal amounts of red and green */
  var intQuantity = Math.pow(16,6)-1 - 65792*Math.round(255*frac);
  if(intQuantity>=Math.pow(16,5)){
    return "#"+intQuantity.toString(16);
  }else if(intQuantity>=Math.pow(16,4)){
    return "#0"+intQuantity.toString(16);
  }else{
    return "#0000"+intQuantity.toString(16);
  }
}

/* Get color a fraction of the way from A to B */
function getColorFracFromAToB(colorA,colorB,fracFromAToB){
  var redEnds = [colorA.substring(1,3),colorB.substring(1,3)];
  var redEndsNums = [parseInt(redEnds[0],16),parseInt(redEnds[1],16)];
  var greenEnds = [colorA.substring(3,5),colorB.substring(3,5)];
  var greenEndsNums = [parseInt(greenEnds[0],16),parseInt(greenEnds[1],16)];
  var blueEnds = [colorA.substring(5,7),colorB.substring(5,7)]
  var blueEndsNums = [parseInt(blueEnds[0],16),parseInt(blueEnds[1],16)];
  var newRed = Math.round(redEndsNums[0]+fracFromAToB*(redEndsNums[1]-redEndsNums[0]));
  var newRedStr = newRed.toString(16);
  if(newRedStr.length==1){
    newRedStr = "0" + newRedStr;
  }
  var newGreen = Math.round(greenEndsNums[0]+fracFromAToB*(greenEndsNums[1]-greenEndsNums[0]));
  var newGreenStr = newGreen.toString(16);
  if(newGreenStr.length==1){
    newGreenStr = "0" + newGreenStr;
  }
  var newBlue = Math.round(blueEndsNums[0]+fracFromAToB*(blueEndsNums[1]-blueEndsNums[0]));
  var newBlueStr = newBlue.toString(16)
  if(newBlueStr.length==1){
    newBlueStr = "0" + newBlueStr;
  }
  return "#"+newRedStr+newGreenStr+newBlueStr;
}

/* Simulation Setup */
var SIM_WIDTH = Math.min(1200,$(window).width()); 
var SIM_HEIGHT = Math.min(600,$(window).width());
var WH_MIN = Math.min(SIM_WIDTH,SIM_HEIGHT); // Minimum of simulation window width and height
canvas = Raphael(0,0,SIM_WIDTH,SIM_HEIGHT);
function backgroundUpdate(upColor,loColor){
  upperRect = canvas.rect(0,0,SIM_WIDTH,SIM_HEIGHT/2)
                    .attr({'fill':upColor});
  lowerRect = canvas.rect(0,SIM_HEIGHT/2,SIM_WIDTH,SIM_HEIGHT/2)
                    .attr({'fill':loColor});
}

backgroundUpdate(DEFAULT_UPPER_RECT_COLOR,DEFAULT_LOWER_RECT_COLOR);

/* Standard graphical constants */
var STANDARD_MARGIN = Math.min(8,WH_MIN/8);
var STANDARD_TEXT_MARGIN = Math.min(12,WH_MIN/12);
var STANDARD_SLIDER_MARGIN = Math.min(20,SIM_HEIGHT/10);
var STANDARD_ROUNDING_RADIUS = Math.min(6,WH_MIN/20);
var STANDARD_BEAM_WIDTH = Math.min(4,WH_MIN/24);

var SLIDER_HEIGHT = Math.min(30,SIM_WIDTH/10);
var SLIDER_WIDTH = Math.min(300,SIM_WIDTH/3);

var COMPARISONS_OFFSET = 20;
var LABEL_OFFSET = 10;
var MIDDLE_TEXT_OFFSET = 11; // Derived quantity, could be redefined in terms of other constants

/* Global variables */
buttonPressed = false;
material1 = MATERIAL1_DEFAULT;
material2 = MATERIAL2_DEFAULT;
index1 = INDEX1_DEFAULT;
index2 = INDEX2_DEFAULT;
angle = DEFAULT_ANGLE;
normalShown = NORMAL_SHOWN_DEFAULT;

/* Sliders */
var SLIDER_SPACING = SLIDER_HEIGHT+20;
var upperIndexSlider = new slider(canvas,STANDARD_MARGIN,SIM_HEIGHT-SLIDER_HEIGHT-SLIDER_SPACING*2-COMPARISONS_OFFSET-STANDARD_MARGIN,SLIDER_WIDTH,SLIDER_HEIGHT,1,2.5,INDEX1_DEFAULT,INDEX_SLIDER_COLOR,"Top Refractive Index",-LABEL_OFFSET);
var lowerIndexSlider = new slider(canvas,STANDARD_MARGIN,SIM_HEIGHT-SLIDER_HEIGHT-SLIDER_SPACING-COMPARISONS_OFFSET-STANDARD_MARGIN,SLIDER_WIDTH,SLIDER_HEIGHT,1,2.5,INDEX2_DEFAULT,INDEX_SLIDER_COLOR,"Bottom Refractive Index",SLIDER_HEIGHT+LABEL_OFFSET);
var angleSlider = new slider(canvas,STANDARD_MARGIN,SIM_HEIGHT-SLIDER_HEIGHT-STANDARD_MARGIN,SLIDER_WIDTH,SLIDER_HEIGHT,0,roundTo3(PI/2-0.001),DEFAULT_ANGLE,ANGLE_SLIDER_COLOR,"Angle of Incidence, \u03B8",-LABEL_OFFSET);

var AIR_TEXT_X_LOCATION = SLIDER_WIDTH/80+STANDARD_MARGIN;
var WATER_TEXT_X_LOCATION = 17*SLIDER_WIDTH/75+STANDARD_MARGIN;
var GLASS_TEXT_X_LOCATION = 2*SLIDER_WIDTH/5+STANDARD_MARGIN;
var DIAMOND_TEXT_X_LOCATION = 19*SLIDER_WIDTH/20+STANDARD_MARGIN;

var airText = canvas.text(AIR_TEXT_X_LOCATION,SIM_HEIGHT-SLIDER_HEIGHT-SLIDER_SPACING-COMPARISONS_OFFSET-MIDDLE_TEXT_OFFSET-STANDARD_MARGIN,"Air");
var waterText = canvas.text(WATER_TEXT_X_LOCATION,SIM_HEIGHT-SLIDER_HEIGHT-SLIDER_SPACING-COMPARISONS_OFFSET-MIDDLE_TEXT_OFFSET-STANDARD_MARGIN,"Water");
var glassText = canvas.text(GLASS_TEXT_X_LOCATION,SIM_HEIGHT-SLIDER_HEIGHT-SLIDER_SPACING-COMPARISONS_OFFSET-MIDDLE_TEXT_OFFSET-STANDARD_MARGIN,"Glass");
var diamondText = canvas.text(DIAMOND_TEXT_X_LOCATION,SIM_HEIGHT-SLIDER_HEIGHT-SLIDER_SPACING-COMPARISONS_OFFSET-MIDDLE_TEXT_OFFSET-STANDARD_MARGIN,"Diamond");

/* Beam Contact Constants */
var BEAM_CONTACT_POINT_X = SIM_WIDTH/2;
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
/*  emitterButton = canvas.circle(emitter_center_x,emitter_center_y,BUTTON_RADIUS)
                        .attr({'fill':BUTTON_COLOR_UNPRESSED})
                        .attr({'id':'emitterButton'});
*/
}

/*
$(document).ready(function(){
  emitterButton.click(function(){
    console.log("Hi!");
    if(emitterButton.attr('fill')==BUTTON_COLOR_UNPRESSED){
      console.log("Hi, again!");
      emitterButton.attr({'fill':BUTTON_COLOR_PRESSED});
    }
  });
});
*/

/* Laser View Box Constants */
var LASER_VIEW_TL_X = STANDARD_MARGIN; // TL: top-left
var LASER_VIEW_TL_Y = STANDARD_MARGIN;
var LASER_VIEW_BOX_WIDTH = Math.min(100,SIM_WIDTH/8);
var LASER_VIEW_BOX_HEIGHT = 4*LASER_VIEW_BOX_WIDTH/5;

/* Laser View Box Setup */
/*laserViewBox = canvas.rect(LASER_VIEW_TL_X,LASER_VIEW_TL_Y,LASER_VIEW_BOX_WIDTH,LASER_VIEW_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS)
                     .attr({'fill':LASER_VIEW_BOX_COLOR})
                     .attr({'id':'laserViewBox'});
*/

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
/*upperMaterialViewBox = canvas.rect(MATERIAL_BOX_TL_X,UPPER_MATERIAL_BOX_TL_Y,MATERIAL_BOX_WIDTH,MATERIAL_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':MATERIAL_BOX_COLOR});
lowerMaterialViewBox = canvas.rect(MATERIAL_BOX_TL_X,LOWER_MATERIAL_BOX_TL_Y,MATERIAL_BOX_WIDTH,MATERIAL_BOX_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':MATERIAL_BOX_COLOR});
*/

/* Reset Button Constants */
var RESET_BUTTON_WIDTH = Math.min(100,SIM_WIDTH/8);
var RESET_BUTTON_HEIGHT = Math.min(30,SIM_HEIGHT/12);
var RESET_BUTTON_TL_X = 7*SIM_WIDTH/8-20;
var RESET_BUTTON_VERTICAL_OFFSET = STANDARD_MARGIN + RESET_BUTTON_HEIGHT; // offset from screen bottom to top
var RESET_BUTTON_TL_Y = SIM_HEIGHT - RESET_BUTTON_VERTICAL_OFFSET;

/* Reset Button Setup */
/*
resetButton = canvas.rect(RESET_BUTTON_TL_X,RESET_BUTTON_TL_Y,RESET_BUTTON_WIDTH,RESET_BUTTON_HEIGHT,STANDARD_ROUNDING_RADIUS).attr({'fill':RESET_BUTTON_COLOR});
*/

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
function reflBeamUpdate(fracRefl,background){
  var ur_x = Math.tan(angle)*SIM_HEIGHT/2+BEAM_CONTACT_POINT_X; // ur: upper-right
  var ur_y = 0;
  var ur = [ur_x , ur_y];
  var color = getColorFracFromAToB(background,FULL_BEAM_COLOR,fracRefl);
  reflBeam = canvas.path(makePathForLine([ur , BEAM_CONTACT_POINT]))
                   .attr({'stroke':color})
                   .attr({'stroke-width':STANDARD_BEAM_WIDTH})
                   .attr({'id':'reflBeam'});
}

/* Propagating Beam Setup and Update */
function propBeamUpdate(fracProp,propAngle,background){
  var prop_lr_x = Math.tan(propAngle)*SIM_HEIGHT/2+BEAM_CONTACT_POINT_X; // lr: lower-right
  var prop_lr_y = SIM_HEIGHT;
  var prop_lr = [prop_lr_x , prop_lr_y];
  var color = getColorFracFromAToB(background,FULL_BEAM_COLOR,fracProp);
  propBeam = canvas.path(makePathForLine([prop_lr , BEAM_CONTACT_POINT]))
                   .attr({'stroke':color})
                   .attr({'stroke-width':STANDARD_BEAM_WIDTH})
                   .attr({'id':'propBeam'});
}

propBeamUpdate(1,getNewAngleRefraction(index1,DEFAULT_ANGLE,index2),DEFAULT_LOWER_RECT_COLOR);
reflBeamUpdate(0,DEFAULT_UPPER_RECT_COLOR);
emitterUpdate();
initBeamUpdate();

var THETA_SYMBOL_SCALING_FACTOR = 30;

function thetaSymbolUpdate(incidenceAngle){
  //if(incidenceAngle>0.5){
    var labelX = BEAM_CONTACT_POINT_X - EMITTER_CONTACT_DISTANCE/4 * Math.sin(incidenceAngle/2);
    var labelY = BEAM_CONTACT_POINT_Y - EMITTER_CONTACT_DISTANCE/4 * Math.cos(incidenceAngle/2);
    thetaSymbol = canvas.text(labelX,labelY,'\u03B8')
                        .attr({'font-size':THETA_SYMBOL_SCALING_FACTOR*incidenceAngle});
  //}
}

thetaSymbolUpdate(angle);

/* Reflection and Propagation Quantity Text Constants */
var BIG_FONT_SIZE=Math.min(20,WH_MIN/31);
var BIG_TEXT_MARGIN=BIG_FONT_SIZE/4;
var QUANT_HORIZ_OFFSET=8.5*BIG_FONT_SIZE;

/* The coefficient of 3 in the below is derived from being half the ratio of conversion 
from BIG_FONT_SIZE to BIG_TEXT_MARGIN, plus 1 for the margin itself, since the vertical
point of reference for text is the center. */

/* Calculate color to make reflective beam text from index of refraction */
function getReflTextColor(ioR1){
  var indexFrac = mapToFrac(ioR1);
  return getColorFracFromAToB(REFL_TEXT_MIN_COLOR,REFL_TEXT_MAX_COLOR,indexFrac);
}

/* Calculate color to make reflective beam text from index of refraction */
function getPropTextColor(ioR2){
  var indexFrac = mapToFrac(ioR2);
  return getColorFracFromAToB(PROP_TEXT_MIN_COLOR,PROP_TEXT_MAX_COLOR,indexFrac);
}

/* Reflection and Propagation Quantity Text Setup and Update */
function reflPropTextUpdate(fracRefl,fracProp,ioR1,ioR2){
  var reflTextColor = getReflTextColor(ioR1);
  var propTextColor = getPropTextColor(ioR2);
  reflLabel = canvas.text(BIG_TEXT_MARGIN,SIM_HEIGHT/2-3*BIG_TEXT_MARGIN,"Reflected:")
                    .attr({'font-size':BIG_FONT_SIZE})
                    .attr({'fill':reflTextColor})
                    .attr({'text-anchor':'start'}); // left aligns
  propLabel = canvas.text(BIG_TEXT_MARGIN,SIM_HEIGHT/2+3*BIG_TEXT_MARGIN,"Propagated:")
                    .attr({'font-size':BIG_FONT_SIZE})
                    .attr({'fill':propTextColor})
                    .attr({'text-anchor':'start'}); // left aligns
  var percentRefl = Math.round(100*fracRefl);
  var percentProp = Math.round(100*fracProp);
  reflText = canvas.text(BIG_TEXT_MARGIN+QUANT_HORIZ_OFFSET,SIM_HEIGHT/2-3*BIG_TEXT_MARGIN,percentRefl+"%")
                   .attr({'font-size':BIG_FONT_SIZE})
                   .attr({'fill':reflTextColor})
                   .attr({'text-anchor':'end'}); // right aligns
  propText = canvas.text(BIG_TEXT_MARGIN+QUANT_HORIZ_OFFSET,SIM_HEIGHT/2+3*BIG_TEXT_MARGIN,percentProp+"%")
                   .attr({'font-size':BIG_FONT_SIZE})
                   .attr({'fill':propTextColor})
                   .attr({'text-anchor':'end'}); // right aligns
}

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

var newAngle = getNewAngleRefraction(index1,angle,index2);
reflPropTextUpdate(calcReflected(index1,angle,index2,newAngle),calcPropagated(index1,angle,index2,newAngle),index1,index2);

/*
canvas.text(LASER_VIEW_TL_X+LASER_VIEW_BOX_WIDTH/2,LASER_VIEW_TL_Y+STANDARD_TEXT_MARGIN,LASER_VIEW_TITLE_TEXT);
canvas.text(MATERIAL_BOX_TL_X+MATERIAL_BOX_WIDTH/2,UPPER_MATERIAL_BOX_TL_Y+STANDARD_TEXT_MARGIN,MATERIAL_TAG);
canvas.text(MATERIAL_BOX_TL_X+MATERIAL_BOX_WIDTH/2,LOWER_MATERIAL_BOX_TL_Y+STANDARD_TEXT_MARGIN,MATERIAL_TAG);
*/
/*
canvas.text(RESET_BUTTON_TL_X+RESET_BUTTON_WIDTH/2,RESET_BUTTON_TL_Y+STANDARD_TEXT_MARGIN,RESET_BUTTON_TEXT);
*/

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

/* Remove old entities to make room for the updated versions */
function removeOldVersions(){
  initBeam.remove();
  reflBeam.remove();
  propBeam.remove();
  emitter.remove();
  //emitterButton.remove();
  upperRect.remove();
  lowerRect.remove();
  reflLabel.remove();
  propLabel.remove();
  reflText.remove();
  propText.remove();
  thetaSymbol.remove();
}

function updateAngle(){
  removeOldVersions();
  angle = angleSlider.val;
  index1 = upperIndexSlider.val;
  index2 = lowerIndexSlider.val;
  fracifiedIndex1 = mapToFrac(index1);
  fracifiedIndex2 = mapToFrac(index2);
  var backgroundColor1 = convertFracOfBlueToColorString(fracifiedIndex1);
  var backgroundColor2 = convertFracOfBlueToColorString(fracifiedIndex2);
  backgroundUpdate(backgroundColor1, backgroundColor2);
  upperRect.toBack();
  lowerRect.toBack();
  var propAngle = getNewAngleRefraction(index1,angle,index2);
  if(propAngle=="total"){
    var fracRefl = 1;
    var fracProp = 0;
  }else{
    var fracRefl = calcReflected(index1,angle,index2,propAngle);
    var fracProp = calcPropagated(index1,angle,index2,propAngle);
  }
  if(fracRefl>0.5){
    propBeamUpdate(fracProp,propAngle,backgroundColor2);
    reflBeamUpdate(fracRefl,backgroundColor1);
  }else{
    reflBeamUpdate(fracRefl,backgroundColor1);
    propBeamUpdate(fracProp,propAngle,backgroundColor2);
  }
  initBeamUpdate();
  emitterUpdate();
  reflPropTextUpdate(fracRefl,fracProp,index1,index2);
  reflLabel.toFront();
  propLabel.toFront();
  thetaSymbolUpdate(angle);
}

/* Calls updateAngle() every 20 milliseconds */
setInterval(updateAngle,10);
