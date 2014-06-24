function slider(canvas, x, y, w, h) { 
	var body = canvas.rect(x, y, w, h);
	var handle = canvas.rect(x, y, (w/10), h);
	handle.attr({fill:'gray'});
	body.node.setAttribute('class', 'slider');
	
	handle.drag(function(dx,dy,mx,my) { 
		var bodyX = body.attr('x');
		var handleX = this.attr('x');
		var handleW = this.attr('width');
		var newX = Math.min(bodyX + w - handleW, mx);
		var newX = Math.max(bodyX, newX);
		this.attr({x:newX});
	});
	
	
}