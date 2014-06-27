/* computational constants */
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

/* graphic constants */
var SIM_WIDTH = 1000;
var SIM_HEIGHT = 600;
canvas = Raphael(0,0,SIM_WIDTH,SIM_HEIGHT);
var emitter = canvas.path("m50,150L150,50,250,150,150,250z");
var LASER_VIEW_BOX_WIDTH = 40;
var LASER_VIEW_BOX_HEIGHT = 30;

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
