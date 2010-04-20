/*
 * Authors:
 * Rex Tsai (chihchun@kalug.linux.org.tw, http://people.debian.org.tw/~chihchun)
 * Thinker Li (thinker@branda.to)
 *
 * Licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt)
*/

;(function($) { // Hide scope, no $ conflict

function StrokeHandler (root) {
   this._xml;

   // create a new svg
   $(root).svg();
   // get the svg 
   this.svg = $(root).svg('get');

   this.strokeN = 0;
   this.trackN = 0;
   this.path;

   this.isDone = 0;
}

$.extend(StrokeHandler.prototype, {
        draw: function () {
            this.loadWord();
        },

        loadWord: function () {
             var handler = this;
             var strokeNum = 0;

             $.ajax({
                type: "GET",
                url: "A676.xml",
                dataType: "xml",
		success: function(xml) {
                    handler._xml = $(xml);
                    $(xml).find('Stroke').each(function() {
                        handler.drawStroke(this, strokeNum);
                        strokeNum++;
                    });
                    // playback
		}
	     });
        },

	clear: function () {
            this.strokeN = 0;
            this.trackN = 0;
            this.isDone = 0;
            this.svg.clear();
            this.draw();
	},

        playback: function () {
             var handle = this;
             this.playtrack();
             function play () {
                 handle.playback();
             }
             if(this.isDone == 0)
                 setTimeout(play, 100);
        },

	playtrack: function () {
            var path = this.path;
            var svg = this.svg;

            if(this._xml == null)
                return;

            var wordMask = "url(#WordMask" + this.strokeN + ")";

            var group = this.svg.group();
            group.setAttribute("transform", "scale(0.1, 0.1)");
            group.setAttribute("mask", wordMask);

            var stroke = this._xml.find('Stroke');
            if(stroke.length < this.strokeN) {
                this.isDone = 1;
                return;
            }

            var track = $(stroke.get(this.strokeN)).find('Track > MoveTo');
            if(track.length < this.trackN) {
                this.strokeN++;
                this.trackN = 0;
                return;
            }

            track = track.get(this.trackN);

            if(this.trackN == 0) {
                path = svg.createPath();
                path = path.move($(track).attr('x'), $(track).attr('y'), false);
            }
            path = path.line($(track).attr('x'), $(track).attr('y'), false);
            svg.circle(group, $(track).attr('x'), $(track).attr('y'), 100, 
                    {fill: 'black', stroke: 'blue', strokeWidth: 0});
            svg.path(group, path, 
                    {fill: 'black', stroke: 'black', strokeWidth: 250});

            this.trackN++;
            this.path = path;
	},

        drawStroke: function (xmlTag, strokeNum) {
            var handler = this;
            var svg = this.svg;

            var mask = this.svg.mask(null, 'WordMask'+strokeNum, 0, 0, 2000, 2000, {maskUnits: 'userSpaceOnUse'});
            this.group = svg.group(mask);
            // outline
            $(xmlTag).find('Outline').each ( function () {
                var path = svg.createPath();
                $(this).children().each( function () {
                    handler._drawOutline(this, path);
                    });
                svg.path(handler.group, path, {fill: 'white', stroke: '#D90000', strokeWidth: 1});
            });
        },

        _drawOutline: function(xmlTag, path) {
            if(xmlTag.tagName == 'MoveTo') {
                path = path.move($(xmlTag).attr('x'), $(xmlTag).attr('y'),false);
            }

            if(xmlTag.tagName == 'QuadTo') {
                path = path.curveQ( $(xmlTag).attr('x1'), $(xmlTag).attr('y1'), $(xmlTag).attr('x2'), $(xmlTag).attr('y2'), false);
            }

            if(xmlTag.tagName == 'LineTo') {
                path = path.line( $(xmlTag).attr('x'), $(xmlTag).attr('y'));
            }

            if(xmlTag.tagName == 'CubicTo') {
                path = path.curveQ( $(xmlTag).attr('x1'), $(xmlTag).attr('y1'), $(xmlTag).attr('x2'), $(xmlTag).attr('y2'), false);
                path = path.curveQ( $(xmlTag).attr('x2'), $(xmlTag).attr('y2'), $(xmlTag).attr('x3'), $(xmlTag).attr('y3'), false);
            }
        },

});

$.fn.stroke = function(options) {
    return new StrokeHandler(this.get(0), options || {});
};

})(jQuery);
