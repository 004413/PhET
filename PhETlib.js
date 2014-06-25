//Creates custom svg slider element
function slider(canvas, x, y, w, h, minVal, maxVal) { 
	var body = canvas.rect(x, y, w, h);
	var handle = canvas.rect(x, y, (w/50), h);
	var bodyX = body.attr('x');
	var handleX = handle.attr('x');
	var handleW = handle.attr('width');
	this.val = minVal;
	var self = this;
	//this.getVal = getSliderVal;
	//this.initVal = minVal;
	handle.attr({fill:'gray'});
	body.node.setAttribute('class', 'slider');
	
	//move slider bar with mouse
	handle.drag(function(dx,dy,mx,my) { 
		var newX = Math.min(bodyX + w - handleW, mx);
		var newX = Math.max(bodyX, newX);
		this.attr({x:newX}) 
	}, 
			function() {}, //
			function() {
				var handleX = handle.attr('x');
				var bodyX = body.attr('x');
				var barDist = (handleX + (handleW / 2)) - bodyX;
				self.val = (barDist / w) * (maxVal - minVal) + minVal; //value based on position of slider bar
				if (handleX == bodyX) {
					self.val = minVal;	
				}
				else if ((handleX + handleW) == (bodyX + w)) {
					self.val = maxVal;	
				}
			});
}