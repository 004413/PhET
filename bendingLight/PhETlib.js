function roundTo3(x) {
	return parseFloat(x).toFixed(3);
}

//Creates custom svg slider element
function slider(canvas, x, y, w, h, minVal, maxVal, defaultVal, handleColor, label, labelVerticalOffset) { 
	var body = canvas.rect(x, y, w, h);
	var defaultPercentage = (defaultVal-minVal) / (maxVal-minVal);
	var handle = canvas.rect(x + 39*w/40*defaultPercentage, y, (w/40), h);
	var bodyX = body.attr('x');
	var handleX = handle.attr('x');
	var handleW = handle.attr('width');
	var self = this;
	self.val = roundTo3(defaultVal); //initial value to be changed when dragged
	self.maxVal = roundTo3(maxVal);
	self.handle = handle;
	var disp = canvas.text((x + (w/2)), (y + labelVerticalOffset), label + ': ' + self.val);
	disp.attr('font-weight', 'bold');
	body.attr({fill:'white'});
	handle.attr({fill:handleColor});
	body.node.className = 'slider';
	canvas.text(x, (y + labelVerticalOffset), minVal);
	canvas.text((x + w), (y + labelVerticalOffset), maxVal);
	
	function updateDisplay() {
		var handleX = handle.attr('x');
		var bodyX = body.attr('x');
		var barDist = handleX - bodyX;
		var val = (barDist / w) * (maxVal - minVal) + minVal; //value based on position of slider bar
		self.val = roundTo3(val); 
		if (handleX == bodyX) {
			self.val = roundTo3(minVal);	
		}
		else if ((handleX + handleW) == (bodyX + w)) {
			self.val = roundTo3(maxVal);	
		}
		disp.attr('text', label + ': ' +self.val);
	}
	
	//move slider bar with mouse
	handle.drag(function(dx,dy,mx,my) { //on move
		var newX = Math.min(bodyX + w - handleW, mx);
		newX = Math.max(bodyX, newX);
		this.attr({x:newX});
		updateDisplay();
	}, 
			function() {}, //on start
			function() {} //on end
	);
	
	//clicks on slider body bring slider bar to click position
	body.drag(function(dx,dy,mx,my) { 
		var newX = Math.min(bodyX + w - handleW, mx);
		newX = Math.max(bodyX, newX);
		handle.attr({x:newX});
		updateDisplay();
	}, 
			function() {},
			function() {} 
	);
	
	body.mousedown(function(event) {
		var newX = Math.min(bodyX + w - handleW, event.clientX);
		newX = Math.max(bodyX, newX);
		handle.attr({x:newX}) 
		updateDisplay();	
	});
	
	//change cursor on mouseover
	body.attr('cursor', 'pointer');
	handle.attr('cursor', 'pointer');
}
