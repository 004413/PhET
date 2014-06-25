//Creates custom svg slider element
function slider(canvas, x, y, w, h, minVal, maxVal) { 
	var body = canvas.rect(x, y, w, h);
	var handle = canvas.rect(x, y, (w/50), h);
	var bodyX = body.attr('x');
	var handleX = handle.attr('x');
	var handleW = handle.attr('width');
	var self = this;
	self.val = parseFloat(minVal).toFixed(3);
	var disp = canvas.text((x + (w/2)), (y - 10), self.val);
	handle.attr({fill:'gray'});
	body.node.setAttribute('class', 'slider');
	
	//move slider bar with mouse
	handle.drag(function(dx,dy,mx,my) { //on move
		var newX = Math.min(bodyX + w - handleW, mx);
		var newX = Math.max(bodyX, newX);
		this.attr({x:newX}) 
	}, 
			function() {}, //on start
			function() { //on end
				var handleX = handle.attr('x');
				var bodyX = body.attr('x');
				var barDist = (handleX + (handleW / 2)) - bodyX;
				var value = (barDist / w) * (maxVal - minVal) + minVal;
				self.val = parseFloat(value).toFixed(3) //value based on position of slider bar
				if (handleX == bodyX) {
					self.val = parseFloat(minVal).toFixed(3);	
				}
				else if ((handleX + handleW) == (bodyX + w)) {
					self.val = parseFloat(maxVal).toFixed(3);	
				}
				disp.attr('text', self.val);
			});
}
