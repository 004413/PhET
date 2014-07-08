function roundTo3(x) {
	return parseFloat(x).toFixed(3);
}

//Creates custom svg slider element
function slider(canvas, x, y, w, h, minVal, maxVal, label) { 
	var body = canvas.rect(x, y, w, h);
	var handle = canvas.rect(x, y, (w/50), h);
	var bodyX = body.attr('x');
	var handleX = handle.attr('x');
	var handleW = handle.attr('width');
	var self = this;
	self.val = roundTo3(minVal); //initial value to be changed when dragged
	self.maxVal = roundTo3(maxVal);
	self.handle = handle;
	var disp = canvas.text((x + (w/2)), (y - 10), label + ': ' + self.val);
	body.attr({fill:'white'});
	handle.attr({fill:'gray'});
	body.node.className = 'slider';
	
	function updateDisplay() {
		var handleX = handle.attr('x');
		var bodyX = body.attr('x');
		var barDist = (handleX) - bodyX;
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
		this.attr({x:newX}) 
		updateDisplay();
	}, 
			function() {}, //on start
			function() {} //on end
	);
	
	//clicks on slider body bring slider bar to click position
	body.drag(function(dx,dy,mx,my) { 
		var newX = Math.min(bodyX + w - handleW, mx);
		newX = Math.max(bodyX, newX);
		handle.attr({x:newX}) 
		updateDisplay();
	}, 
			  function() {},
			  function() {} 
	);
	
	//change cursor on mouseover
	body.attr('cursor', 'pointer');
	handle.attr('cursor', 'pointer');
}