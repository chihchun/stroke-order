/*
 * Authors:
 * Rex Tsai (chihchun@kalug.linux.org.tw)
 * Thinker Li (thinker@branda.to)
 *
 * Licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt)
*/

;(function($) { // Hide scope, no $ conflict

function StrokeHandler (root) {
   this._root = root; 
   this._xml;
   this.svg;


   this.strokeN = 0;
   this.trackN = 0;
   this.path;
}

$.extend(StrokeHandler.prototype, {
        draw: function () {
            this.loadWord();
        },

        loadWord: function () {
             var handler = this;
             // create a new svg
             $('#svgbasics').svg();
             // get the svg 
             this.svg = $('#svgbasics').svg('get');
	     this.strokeNum = 0;
             
             $.ajax({
                type: "GET",
                url: "B3B0.xml",
                // url: "C1A6.xml",
                dataType: "xml",
		success: function(xml) {
                    handler._xml = $(xml);
                    $(xml).find('Stroke').each(function() {
                        handler.drawStroke(this);
                    });
		}
	     });
        },


	clean: function () {
		this.svg = $('#svgbasics').svg('get');
		this.svg.clear();
		// this.svg.
	},

	drawStrokeMask: function (xmlTag) {

	},

	playback: function () 
	{
		var path = this.path;
                var svg = this.svg;

		// the xml is not ready
		if(this._xml == null)
			return;
		var wordMask = "url(#WordMask" + this.strokeN + ")";

                this.group = this.svg.group();
                this.group.setAttribute("transform", "scale(0.1, 0.1)");
                this.group.setAttribute("mask", wordMask);

		xmlTag = this._xml.find('Stroke').get(this.strokeN);

                var stroke = this._xml.find('Stroke');
                if(stroke.length < this.strokeN)
                {
                    return;
                }


                var moveto = $(xmlTag).find('Track > MoveTo');
                if(moveto.length < this.trackN)
                {
                    this.strokeN++
                    this.trackN = 0;
                    return;
                }

		xmlTag = $(xmlTag).find('Track > MoveTo').get(this.trackN);

		if(this.trackN == 0) {
	            path = svg.createPath();
  	            path = path.move($(xmlTag).attr('x'), $(xmlTag).attr('y'), false);
		}
		path = path.line($(xmlTag).attr('x'), $(xmlTag).attr('y'), false);
                svg.circle(this.group, $(xmlTag).attr('x'), $(xmlTag).attr('y'), 100, 
			{fill: 'black', stroke: 'blue', strokeWidth: 0});
                svg.path(this.group, path, 
			{fill: 'red', stroke: 'black', strokeWidth: 100});

		this.trackN++;
                this.path = path;
	},
	

        drawStroke: function (xmlTag) {
                var handler = this;
                var svg = this.svg;
                var path = svg.createPath(); 
		var strokeNum = this.strokeNum;
		var wordMask = "url(#WordMask" + this.strokeNum + ")";
		mask = this.svg.mask(null, 'WordMask'+this.strokeNum, 0, 0, 2000, 2000, {maskUnits: 'userSpaceOnUse'});
                this.group = svg.group(mask);

                // outline
                $(xmlTag).find('Outline').each ( function () {
                        path = svg.createPath();
                        $(this).children().each( function () {
                            handler._drawOutline(this, path);
                        });
                        svg.path(handler.group, path, {fill: 'white', stroke: '#D90000', strokeWidth: 1});
                });

                // tracks
                // this.group = this.svg.group();
                // this.group.setAttribute("transform", "scale(0.1, 0.1)");
                // this.group.setAttribute("id", this.strokeNum);

		// initalize the path.
                var loc =  $(xmlTag).find('Track > MoveTo').get(0);
                path = svg.createPath();
                path = path.move($(loc).attr('x'), $(loc).attr('y'), false);

                $(xmlTag).find('Track').children().each ( function () {
                        var xmlTag = this;
                        if(this.tagName == 'MoveTo') {
                            // path = path.line($(xmlTag).attr('x'), $(xmlTag).attr('y'), false);
                            // svg.circle(handler.group, $(xmlTag).attr('x'), $(xmlTag).attr('y'), 100, 
				// {fill: 'black', stroke: 'blue', strokeWidth: 0, mask: wordMask});
                        }
                });
                // svg.path(handler.group, path, 
		//	{fill: 'red', stroke: 'black', strokeWidth: 100, mask: wordMask});

		this.strokeNum++;
        },

        _drawOutline: function(xmlTag, path) {
            if(xmlTag.tagName == 'MoveTo') {
                path = path.move($(xmlTag).attr('x'), $(xmlTag).attr('y'),false);
            }

            if(xmlTag.tagName == 'QuadTo') {
                path = path.curveQ(
                    $(xmlTag).attr('x1'), 
                    $(xmlTag).attr('y1'),
                    $(xmlTag).attr('x2'),
                    $(xmlTag).attr('y2'), 
                    false);
            }

            if(xmlTag.tagName == 'LineTo') {
                path = path.line(
                    $(xmlTag).attr('x'), 
                    $(xmlTag).attr('y')
                    );
            }

            if(xmlTag.tagName == 'CubicTo') {
                path = path.curveQ(
                        $(xmlTag).attr('x1'), 
                        $(xmlTag).attr('y1'),
                        $(xmlTag).attr('x2'),
                        $(xmlTag).attr('y2'), 
                        false);
                path = path.curveQ(
                        $(xmlTag).attr('x2'), 
                        $(xmlTag).attr('y2'),
                        $(xmlTag).attr('x3'),
                        $(xmlTag).attr('y3'), 
                        false);
            }
        },

});

$.fn.stroke = function(options) {
    return new StrokeHandler(this.get(0), options || {});
};

})(jQuery);
