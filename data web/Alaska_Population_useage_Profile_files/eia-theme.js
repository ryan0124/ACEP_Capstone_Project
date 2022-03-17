/**
* EIA Highcharts Theme v1.1.4 2012-02-28
*
* Created by Shivan Computers Corporation on behalf 
* of the U.S. Energy Information Administration:
* Author : Ryan Lynch (Ryan.Lynch@eia.gov)
**/

(function(){

	///////////////////////
	// Private Variables //
	///////////////////////
	
	// Shortcuts
	var HC = Highcharts,
	Chart = HC.Chart,
	StockChart = HC.StockChart,
	extend = HC.extend,
	each = HC.each,
	map = HC.map,
	// For compatability with Highcharts and Highstocks,
	// splat is undefined in the former
	splat = HC.splat ||
	function (obj) {
		if (!$.isArray(obj)) {
			obj = [obj];
		}
		return obj; 
	},
	merge = HC.merge,
	max = Math.max,
	min = Math.min,
	pow = Math.pow,
	abs = Math.abs,
	doc = document,
	win = window,
	// Function for prototypal inheritence, from
	// http://webreflection.blogspot.com/2010/02/javascript-override-patterns.html
	chain = (function () {
		// recycled empty callback
		// used to avoid constructors execution
		// while extending
		function proto() {}

		// chain function
		return function ($prototype) {
			// associate the object/prototype
			// to the __proto__.prototype
			proto.prototype = $prototype;
			// and create a chain
			return new proto;
		};
	}()),
	isIE = navigator.userAgent.match(/MSIE/) != null,
	// References for caching default x and y axis options
	defaultYAxisOptions,
	defaultXAxisOptions,
	// Flag to determine if an axis redraw is needed
	axisLabelRedraw,
	buttonOffset;
	
	// We extend Highcharts with the colors and logo enumerations
	// first so we can reference them later
	
	extend(HC, {
		///////////////////
		// Theme Version //
		///////////////////
		
		eia_theme_version : '1.1.3',
	
		///////////////////////
		// Logo Enumerations //
		///////////////////////
		
		logos:{
			none : 0,
			eia : 1,
			reuters : 2
		},
	
		////////////////
		// EIA Colors //
		////////////////
		
		eia_blue : '#0096d7',  //Blue
		eia_tan : '#bd732a',  //Tan
		eia_green : '#5D9732',  //Green
		eia_yellow : '#ffc702',  //Yellow
		eia_red : '#a33340',  //Red
		eia_brown : '#403203',  //Brown
		eia_lt_blue : '#76d5ff',  //Light Blue
		eia_lt_green : '#bed5ad',  //Light Green
		eia_dk_red : '#410e14',  //Dark Red
		eia_grey : '#666666',  //Grey
		eia_dk_blue : '#003953',  //Dark Blue
		eia_dk_green : '#2a4b11',  //Dark Green
		eia_dk_grey : '#333333', //Dark Grey
        
		/////////////////////////////////
		// EIA Plotlines and Plotbands //
		/////////////////////////////////
		
		eia_projections_line: {
			color: '#888',
			dashStyle: 'Dash',
			width : 1,
			zIndex: 3
			// value: {projection start time / category}
		},
		eia_projections_label: {
			color: '#888',
			fontWeight: 'bold'
		},
		
		// For use where the yAxis min is non-zero
		eia_zero_axis_line : {
			color: '#000',
			dashStyle: 'Solid',
			zIndex:1,
			width: 1,
			value : 0
		}
	});
	
	extend(HC, {
	
		///////////////
		// EIA Theme //
		///////////////
		
		eiaTheme : {
			chart: {
				animation:!isIE, // Turn of animation in IE to improve performance
				plotBackgroundColor: 'rgba(255, 255, 255, .1)',
				defaultSeriesType: 'line',
				spacingBottom:20,
				// Determies the logo displayed on the chart.  See logo enumerations
				// above
				logo:HC.logos.eia,
				events:{
					redraw:function(){
						onRedraw.apply(this, arguments);
					}
				},
				style: {
					fontFamily: 'Arial, Verdana, Helvetica, sans-serif'
				},
				lineUpYAxisZeros : false,
				borderColor : '#ffffff'
			},
			colors: [
				HC.eia_blue,
				HC.eia_tan,
				HC.eia_green,
				HC.eia_yellow,
				HC.eia_red,
				HC.eia_brown,
				HC.eia_lt_blue,
				HC.eia_lt_green,
				HC.eia_dk_red,
				HC.eia_grey,
				HC.eia_dk_blue,
				HC.eia_dk_green,
				HC.eia_dk_grey
			],
			title: {
				align: 'left',
				margin: 35,
				style: {
					color: 'black',
					fontSize: '16px',
					fontWeight: 'bold'
				}
			},
			subtitle: {
				style: { 
					color: '#333',
					fontSize: '12px'
				},
				align: 'left',
				floating: true,
				y:40
			},
			credits: {
				style: {
					color: '#888',
					fontSize: '11px'
				},
				text: 'Source: U.S. Energy Information Administration',
				href: 'http://www.eia.gov',
				position: {
					align: 'left',
					verticalAlign: 'bottom',
					x:15
				}
			},
			labels: {
				style: {
					fontSize: '12px',
					color: '#333'
				}
			},
			xAxis: {
				labels: {
				style: {
					color: 'black'
				}
				},
				endOnTick: false,
				startOnTick: false,
				tickColor: '#000',
				lineColor: '#000',
				title: {
					style: {
						color: '#888',
						fontWeight: 'bold',
						fontSize: '12px'
					}               
				},
				dateTimeLabelFormats : {
					day: '%e. %b, %y',
					week: '%e. %b, %y',
					month: '%b \'%y',
					year: '%Y'
				}
			},
			yAxis: {
				labels: {
					style: {
						color: '#333'
						// formatter : see preprocessChart::preprocessAxis()
					}
				},
				lineColor: '#A0A0A0',
				minorTickInterval: null,
				tickColor: '#A0A0A0', 
				//zero based axis is the EIA default.  In the future, it would
				// be useful to preprocess the data and determine if the chart
				// contains negative values, and override this default when
				// neccesary.
				min: 0, 
				tickWidth: 0,
				title: {
					align:'above',
					style: {
						color: '#888',
						fontWeight: 'bold',
						fontSize: '12px'
					}               
				}
			},
			tooltip: {
				backgroundColor: 'rgba(255, 255, 255, 0.75)',
				style: {
					fontSize: '12px',
					color: '#000000',
					padding: 5
					},
					formatter:function(){
						// We wrap this in a function, because we haven't defined
						// the universal tooltip function yet
						return HC.universalTooltipFormatter.apply(this, arguments);
					}
			},  
			plotOptions: {
				series: {
					animation:!isIE, // Turn of animation in IE to improve performance
					tooltip:{
						// Determines whether or not to display the name of the series
						// in the tooltip.  As with all plot options, this can be
						// applied to the individual series as well.
						showName: true
						// The precision for rounding numbers in the tooltip.
						// precision:0
					}
				},
				line: {
					shadow:0,
					lineWidth: 2,
					borderWidth:0,
					dataLabels: {
						color: '#333'
					},
					marker: {
						enabled: false,
						states: {
							hover: {
								enabled: true,
								radius: 5
							}
						}
					}
				},
				area: {
					borderWidth: 0,
					shadow: false,
					lineWidth: 0,
					marker: {
						enabled: false,
						states: {
							hover: {
								enabled: true,
								radius: 4
							}
						}
					}
				},
				spline: {
					marker: {
						lineColor: '#333'
					}
				},
				column: {
					borderWidth: 0,
					shadow: false,
					lineWidth: 0
				},
				bar: {
					shadow: false
				},  
				pie: {
					allowPointSelect: true,
					shadow: false,
					dataLabels: {
						style: {
							fontSize: '12px',
							color: 'red'
						}
					}
				},          
				scatter: {
					marker: {
						radius: 3,
						symbol: 'circle',
						states: {
							hover: {
								enabled: true,
								lineColor: 'rgb(100,100,100)'
							}
						}
					},
					states: {
						hover: {
							marker: {
								radius: 3,
								enabled: true
							}
						}
					}
				}
			},      
			legend: {
				floating: false,
				borderWidth: 1,
				borderColor: '#e4e4e4',
				backgroundColor: '#f1f1f1',
				borderRadius: 0,
				symbolPadding: 5,                   
				itemStyle: {
					textDecoration: 'none'
				},
				itemHoverStyle: {
					color: '#189bd7',
					textDecoration: 'underline'
				},
				itemHiddenStyle: {
					color: '#CCC'
				}
			},
			lang: {
				exportButtonTitle: 'Export an image or data'
			},
			exporting: {
				buttons : {
					contextButton:{
						menuItems: [{
							text: 'Print Chart',
							onclick : function() {
								printChart.apply(this);
							}
						}, {
							separator: true
						}, {
							text: 'Download Image',
							onclick: function(){
								this.exportChart(
									{
										url : '/global/scripts/jquery/highcharts/exporting-server/index.cfm',
										width : this.chartWidth
									}, 
									HC.generateEIAExportOptions.apply(this)
								);
							}
						},
					/* commented out due to problem incorporating images such as logos.  The other formats bake it in.  Added final null button
					{
							text: 'Download SVG',
							onclick: function(){
								this.exportChart(
									{type: 'image/svg+xml'},
									HC.generateEIAExportOptions.apply(this)
								);
							}
						}, */
						{
							text: 'Download PDF',
							onclick: function(){
								this.exportChart(
									{
										url : '/global/scripts/jquery/highcharts/exporting-server/index.cfm',
										type: 'application/pdf'
									},
									HC.generateEIAExportOptions.apply(this)
								);
							}
						},
						{
							text: 'Download Data',
							onclick: function(){
								this.generateCSV()
							}
						},
						null
						]
					}
				}
			}
		},
		
		// X Value Types Labels, and Zooms
		
		// These correspond to the indices of the label
		// and zoom arrays.  They also give oridnality
		// to the various period types.
		
		yTypes : {
			mixed : 0,
			positive : 1
		},
		
		xTypes: {
			category:0,
			annual:1,
			quaterly:2, // Not currently implemented
			monthly:3,
			weekly:4,
			daily:5
		},
		
		// Labels used in the csv export
		csvXLabels: [
			'Category',
			'Year',
			'Quarter',
			'Month',
			'Week of',
			'Day'
		],
		// Labels used in the tooltip
		tooltipXLabels: [
			'',
			'Year',
			'Quarter',
			'Month',
			'Week of',
			'Day'
		],
		// Max zooms for the various xTypes
		xMaxZooms : [
			1, // 1 Categories
			126144E6, // 4 years
			31536E6, // 1 Year
			107136E5, // 4 months
			24192E5, // 4 weeks
			6048E5 // 1 Week
		],
		
		// X Value Parser
		
		/**
		* Parses X Values based on the passed x value type
		**/
		parseXValue : function(xType, xValue){
			var ret;
			
			switch(xType)
			{
				case HC.xTypes.annual:
					ret = HC.dateFormat('%Y', xValue);
					break;
				case HC.xTypes.monthly:
					ret = HC.dateFormat('%b %Y', xValue);
					break;
				case HC.xTypes.weekly:
					ret = HC.dateFormat('%m/%e/%Y', xValue);
					break;
				case HC.xTypes.daily:
					ret = HC.dateFormat('%m/%e/%Y', xValue);
					break;
				default:
					ret = xValue;
					break;
			}
			
			return ret;
		},
		
		// Universal Tooltip function
		
		/**
		* Returns tooltip strings for non-shared and shared tooltips.
		**/
		universalTooltipFormatter : function(){
			var ret = '';

			if(this.point != void 0){ // shared == false
				var xString, 
				yString,
				nameString,
				series = this.series,
				chart = this.series.chart,
				seriesOpts = series.options,
				tipOpts = seriesOpts.tooltip,
				chartOpts = chart.options,
				isPie = chartOpts.chart.defaultSeriesType == 'pie',
				isDateTime = isPie ? false : chartOpts.xAxis.type == 'datetime',
				seriesName = series.name,
				// If we haven't determined xTypes, then treat it as a category axis
				xType = series.options.xType,
				xLabel = isPie ? '' : series.xAxis.options.categoryTitle || 
					series.xAxis.options.title.text || HC.tooltipXLabels[xType] || '',
				yLabel = isPie ? '' : series.yAxis.options.title.text || '';
				
				if(!isPie){
					nameString = seriesName; 
					xString = (xLabel.length > 0 ? xLabel + ' : ' : '') +
						HC.parseXValue(xType,
							// used by the seasonal analysis to display a different date in the tooltip
							this.point.options && this.point.options.tooltipX !== void 0 ? this.point.options.tooltipX : this.x
						);
					yString = series.options.compare != null ?
						HC.numberFormat(this.point.change, tipOpts.precision || void 0) + ' ' + yLabel:
						HC.numberFormat(this.y, tipOpts.precision || void 0) + ' ' + yLabel;
				}
				else{
					nameString = this.point.name;
					xString = xLabel;
					yString = this.y;
				}
				
				ret = (series.options.tooltip.showName ? '<b>' + nameString + '</b><br/>' : '') + 
					xString + (xString != '' ? '<br/>' : '')  + yString;
			}
			else{ // shared == true
				var xString,
				yString = '',
				nameString, i,
				series, point, yLabel, seriesOpts, tipOpts,
				points = this.points,
				chart = points[0].series.chart,
				isPie = chart.options.chart.defaultSeriesType == 'pie',
				isDateTime = isPie ? false : chart.options.xAxis.type == 'datetime',
				xType = chart.options.maxXType,
				xLabel = HC.tooltipXLabels[xType];
				
				if(!isPie){
					xString = (xLabel != '' ? xLabel + ' : ' : '') + 
						HC.parseXValue(xType, this.x);
					ret += xString + '<br/>';
					for(i=0; i<points.length; i++){
						point = points[i];
						series = points[i].series;
						seriesOpts = series.options;
						tipOpts = seriesOpts.tooltip;
						seriesName = series.name;
						nameString = seriesName;
						yLabel = series.yAxis.options.title.text || '';
						yString =  HC.numberFormat(point.y, tipOpts.precision || void 0) + ' ' + yLabel;
						ret += '<b>' + nameString + '</b>' + ' ' + yString;
						if(i < points.length)
							ret += '<br/>'
					}
				}
				else{
					for(i=0; i<points.length; i++){
						point = points[i];
						nameString = point.point.name;
						yString = HC.numberFormat(point.y, void 0);
						ret += '<b>' + nameString + '</b>' + ' ' + yString;
						if(i < points.length)
							ret += '</br>'
					}
				}
			}
			
			return ret;
		},
		
		/**
		* Currently, this function doesn't do anything.  It is stubbed here for later
		* use.  For example, we may want to change some font sizes to account for 
		* different fonts on the exporting server.
		**/
		generateEIAExportOptions : function(){
			var chart = this,
			ret = {};
			return ret;
		},
		
		/**
		* Overrides the default number formatter so that a null value for decimals
		* returns the number formatted without rounding/truncation, and a null value
		* for number returns an empty string instead of 0.00.
		**/
		numberFormat : function(number, decimals, decPoint, thousandsSep) {
			if(number !== null && number !== void 0 && !isNaN(number)){
				var lang = HC.getOptions().lang,
					// http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_number_format/
					n = number,
					c = isNaN(decimals = Math.abs(decimals)) ?
					// Here is the difference with the highcharts implementation, we default to the number of
					// existing decimal places, they default to 2 when decimals is not defined.  Number#toFixed
					// can only work with a maximum of 20 decimal places, so we check and min it.
					Math.min(n.toString().match(/\d+\.?(\d*)/)[1].length, 20) :
					decimals,
					d = decPoint === undefined ? lang.decimalPoint : decPoint,
					t = thousandsSep === undefined ? lang.thousandsSep : thousandsSep,
					s = n < 0 ? "-" : "",
					i = String(parseInt(n = Math.abs(+n || 0).toFixed(c))),
					j = i.length > 3 ? i.length % 3 : 0;
			
				return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
					(c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
			}
			else
				return '';
		},
		
		/**
		* Alternate constructor for EIA Highcharts.  This function inherits all the
		* properties and methods of the super Highcharts.Chart, and takes the same
		* arguments
		*
		* @param {Object} options : The Chart options
		* @param {Function} callback : Chart onload callback function
		**/
		
		Chart : constructorGenerator(Chart, {}),
		
		/**
		* Alternate constructor for EIA Highstocks charts.  This function inherits
		*  all the properties and methods of the super Highcharts.StockChart, and 
		* takes the same arguments
		*
		* @param {Object} options : The StockChart options
		* @param {Function} callback : StockChart onload callback function
		**/
		
		StockChart : HC.StockChart ? constructorGenerator(StockChart, {
				xAxis:{
					type : 'dateTime'
				}
			}) 
			: void 0
	});
	
	function constructorGenerator(originalConstructor, forcedOptions){
		var ret = function(options, callback){   
			var chart = this,
			forcedOptions = forcedOptions || {};
			isPie = options.chart.defaultSeriesType != void 0 && options.chart.defaultSeriesType == 'pie';
			
			// Added for upgrade to v3.0.0 of exporting module - Scott Gearhart 3/25/2013
			buttonOffset = 0;
	
			ops = jQuery.extend(true, {}, HC.getOptions(), options);
			
			// preprocess xAxis options
			ops.xAxis = map(splat(ops.xAxis || {}), function (xAxisOptions) {
				return merge(defaultXAxisOptions, xAxisOptions, forcedOptions.xAxis || {});
			});
		
			// preprocess yAxisOptions
			ops.yAxis = map(splat(ops.yAxis || {}), function (yAxisOptions) {
				opposite = yAxisOptions.opposite;
				return merge(defaultYAxisOptions, yAxisOptions, forcedOptions.yAxis || {});
			});
			
			// Preprocess the options common to pie and non-pie charts
			preprocessLogoOptions(ops);
			preprocessContainers(ops);
			
			if(isPie)
				chart = processPieChart.call(chart, originalConstructor, ops, callback);
			else
				chart = processNonPieChart.call(chart, originalConstructor, ops, callback);
			
			return chart;
		}
		
		ret.prototype = chain(originalConstructor.prototype);
		
		return ret;
	}
	
	///////////////////////////////
	// Reset and Title Functions //
	///////////////////////////////
	
	extend(Chart.prototype, {
		/**
		* Resets the zoom for the chart.  The code is the same as the callback
		* for the "Reset Zoom" control that appears on the chart when zoomed.
		**/
		resetZoom: function(){
			var chart = this, axes = chart.xAxis;
			each(axes, function (axis) {
				axis.setExtremes(null, null, false);
			});
		},
		
		/**
		* Resets the chart to contain only the original series that existed at
		* creation time.  Set redraw to true to redraw the chart after adding
		* the series.
		**/
		resetSeries: function(redraw){
			var chart = this, i, s, remArr = [];
			if(redraw === void 0) redraw = true;
			chart.removeAllSeries(redraw);
			for(i=0; i<chart.options.originalSeriesOptions.length; i++)
				chart.addSeries(chart.options.originalSeriesOptions[i], false);
			chart.counters.color = chart.options.originalColorCounter;
			if(redraw)
				chart.redraw();
		},
		/**
		* Removes all series from the chart.  Set redraw to true to redraw the 
		* chart after removing all series.
		**/
		removeAllSeries : function(redraw){
			var chart = this, i, remSeries = [];
			if(redraw === void 0) redraw = true;
			for(i=0; i<chart.series.length; i++)
				remSeries.push(chart.series[i]);
			for(i=0; i<remSeries.length; i++)
				remSeries[i].remove(false);
			chart.counters.color = 0;
			if(redraw)
				chart.redraw();
		},
		/**
		 * Adjusts the alignment of the title and subtitle to account for spacing
		 * for the yAxis title.
		 **/
		adjustTitleAlignment : function(title, subtitle){
			var chart = this,
			spacingTopAdjust = chart.options.chart.spacingTopAdjust,
			titleAdjust = ops.chart.titleAdjust,
			titleAttrs = [];
			if(title) titleAttrs.push('title');
			if(subtitle) titleAttrs.push('subtitle');
			// Now adjust the title and subtitle to account for the height of
			// any above axis titles
			if(spacingTopAdjust !== void 0 && titleAdjust !== void 0)
				each(titleAttrs, function(attr){
					if(chart.hasOwnProperty(attr) && spacingTopAdjust != 0){
						var alignOptions = $.extend(true, {}, chart[attr].alignOptions);
						var alignAttrs = $.extend(true, {}, chart[attr].alignAttrs);
						var ele = $(chart[attr].element)
						alignAttrs.y -= spacingTopAdjust + (attr == 'subtitle' ? titleAdjust : 0);
						ele.attr('y', ele.attr('y') - (spacingTopAdjust + (attr == 'subtitle' ? titleAdjust : 0)));
						ele.css('top', (parseInt(ele.css('top').substring(0, ele.css('top').indexOf('px')) - spacingTopAdjust) + 'px'))
						alignOptions.y -= spacingTopAdjust;
						chart[attr].alignAttrs = alignAttrs;
						chart[attr].alignOptions = alignOptions;
					}
				});
		},
		/**
		* Splits the text into lines according to the width of the text and the
		* Font Size.  Assumes a ratio of 2:1 for FontSize:CharacterWidth.
		* 
		* @param style object
		* @param textWidth integer
		*
		**/
		splitText : function(text, style, textWidth, renderer){
			var lines = [], charWidth, lastBreak = 0,
			end, k = 0, l, i, e, lineHeight, word, line, tmpLine, boxWidth,
			// This regex finds all words, and treats html tags as single words
			rWords = /(<\s*(\w+)[^>]*>.*?<\s*\/\2\s*>|<\s*\/[^>]+>|[^<>\s]+|(<[^>]+>))/g;
			// We add an extra blank word to the array to ensure that the loop
			// one more time if the last word is on it's own line.
			words = text.match(rWords).concat('');
			
			while(k < words.length){
				k = lastBreak;
				tmpLine = '';
				do{
					if(e){
						// We get the line height before adding the new word
						lineHeight = e.getBBox().height;
						e.destroy();
					}
					word = words[k];
					tmpLine += word + ' ';
					// Prerender the text
					e = renderer.text(tmpLine, -9999, -9999).css(style).add();
					k++;
					if(word.match(/<\s*\/?\s*br\/?\s*>/)){
						// END OF LINE
						words.splice(k-1, 1);
						break;
					}
					boxWidth = e.getBBox().width;
				}
				while(boxWidth < textWidth && k < words.length)
				// Where we have a realllly big word, or one word
				if(k - 1 == lastBreak){
					// we get the line height here, because in
					// this case the above loop ran only once.
					lineHeight = e.element.offsetHeight;
					line = words[k-1];
					lastBreak = k;
				}
				else{
					// Join the words with spaces, then remove spaces around html tags to prevent
					// extra space from being rendered when they are split into seperate spans
					line = words.slice(lastBreak, k-1).join(' ')
					// For IE, Highcharts renders text as regular HTML text, so we want to 
					// preserve the spaces.  For SVG text, we want to elimate them, since
					// there will already be a space between tspan elements.
					if(!isIE)
						line = line.replace(/\s+</g, '<').replace(/>\s+/g, '>');
					lastBreak = k - 1;
				}
				// Push the line into the collection
				lines.push({
						line : line,
						lineHeight : lineHeight
					});
				
				// Clean up
				e.destroy();
				e = null;
			}
			return lines;
		}
	});
	
	Chart.prototype.callbacks.push(function(){
		var oldSetTitle = this.setTitle;
		
		this.adjustTitleAlignment(true, true);
		/**
		 * Overrides the setTitle function to account for spacing adjustments
		 **/
		this.setTitle = function(title, subtitle){
			oldSetTitle.call(this, title, subtitle);
			if(title)
				this.options.title = merge(this.options.title, title);
			if(subtitle)
				this.options.subtitle = merge(this.options.subtitle, subtitle);
			this.adjustTitleAlignment(title, subtitle);
		};
	});
	
	/////////////////////
	// Private Methods //
	/////////////////////
	
	/**
	* Processes pie charts options to apply various styles and
	* initializes the chart object.
	**/
	function processPieChart(chartConstructor, ops, callback){
		var chart = this;
		// Wait, this function does nothing!! This may change
		// in the future...
		chart = chartConstructor.call(chart, ops, callback) || chart;
		
		return chart;
	}
	/**
	* Preprocess non-pie chart options to apply various styles
	* and initializes the chart object.
	**/
	function processNonPieChart(chartConstructor, ops, callback)
	{
		var chart = this, renderTo = ops.chart.renderTo,
		container = typeof(renderTo) == "string" ? $('#' + renderTo) : $(renderTo),
		spacingTopAdjust = 0,
		titleAdjust = 0,
		i, xAndYTypes, assocAxis,
		chart, xAxis,
		yAxisOptions = $.isArray(ops.yAxis) ? ops.yAxis : [ops.yAxis],
		dummyChart = {
			options : ops,
			// Copy of Highcarts ChartCounter object
			counters : {
				wrapColor: function (length) {
					if (this.color >= length) {
						this.color = 0;
					}
				},

				wrapSymbol: function (length) {
					if (this.symbol >= length) {
						this.symbol = 0;
					}
				},
				color:0,
				symbol:0
			},
			series : [],
			// Added for compatibility with Highstocks Series.bindAxis method
			xAxis : [],
			yAxis : []
		},
		// create a sandbox and a renderer to prerender the axis
		// titles and chart title
		sandbox = $('<div></div>')
			.appendTo('body').css({position:'absolute',top:-9999}),
		sandboxRenderer = new HC.Renderer(sandbox[0], 0, 0);
		
		var i;
		
		if(ops.xAxis instanceof Array) {
			for(i = 0; i < ops.xAxis.length; i++) {
				ops.xAxis[i].index = i;
				dummyChart.xAxis.push({'options' : ops.xAxis[i], 'series' : []});
			}
		}
		else {
			ops.xAxis.index = 0;
			dummyChart.xAxis.push({'options' : ops.xAxis, 'series' : []});
		}
		if(ops.yAxis instanceof Array) {
			for(i = 0; i < ops.yAxis.length; i++) {
				ops.yAxis[i].index = i;
				dummyChart.yAxis.push({'options' : ops.yAxis[i], 'series' : []});
			}
		}
		else {
			ops.yAxis.index = 0;
			dummyChart.yAxis.push({'options' : ops.yAxis, 'series' : []});
		}
		// For some reason this set of operations breaks the export routine
		// Have to look into this further at a later time.  Besides, these
		// options don't really need to be processed for exported charts.
		if(!ops.chart.forExport){
			// Initialize the series on the dummy chart
			// object and determine the series xTYpes
			if(ops.series) each(ops.series, function(seriesOps){
				var serie = new HC.Series;
				// Series.init modifies the series options, so we
				// clone the series options with $.extend when
				// creating the fake series here
				serie.init(dummyChart, $.extend(true, {}, seriesOps));
				dummyChart.series.push(serie);
				xAndYTypes = determineSeriesXAndYType.call(dummyChart, serie);
				seriesOps.xType = serie.options.xType = 
					seriesOps.xType !== void 0 ? seriesOps.xType : xAndYTypes.xType;
				if(xAndYTypes.yType === HC.yTypes.mixed){
					assocAxis = yAxisOptions[seriesOps.yAxis !== void 0 ? seriesOps.yAxis : 0];
					// only set the min to null if the min in the options is zero or otherwise falsey
					assocAxis.min = assocAxis.min ? assocAxis.min : null;
				}
			});
			// Determine the min and max xType
			ops.minXType = determineMaxMinXType.call(dummyChart, min);
			ops.maxXType = determineMaxMinXType.call(dummyChart, max);
			ops.chart.zoomType = ops.chart.zoomType !== void 0 ? ops.chart.zoomType : determineZoomType.call(dummyChart);
			// Set the max zoom to the maximum zoom for the
			// Minimum xType.  So if there is annual and monthly
			// data, our max zoom will be the annual max zoom.
			xAxis = splat(ops.xAxis)
			xAxis[0].maxZoom = xAxis[0].maxZoom !== void 0 ? xAxis[0].maxZoom : HC.xMaxZooms[ops.minXType];
			// Determine the appropriate zoom type
			
		}
		// Enable the crosshairs for shared tooltips
		ops.tooltip.crosshairs = ops.tooltip.shared;
		// Process the yAxis options
		for(i=0; i<yAxisOptions.length; i++){
			spacingTopAdjust = Math.max(
				spacingTopAdjust,
				preprocessAxis.call(chart, yAxisOptions[i], sandboxRenderer)
			);
			if(yAxisOptions[i].type == 'logarithmic') yAxisOptions[i].min = yAxisOptions.min !== void 0 ? yAxisOptions.min : null;
		}
		// Adjust for the axis title
		spacingTopAdjust += titleAdjust = preprocessChartTitle.call(
			chart,
			ops.title,
			sandboxRenderer,
			(ops.chart.width || container.width() || 600) - 75 //For exporting buttons
		);
		// Remove the sandbox
		sandbox.remove();
		// set the top spacing
		if(!ops.chart.forExport)
			ops.chart.spacingTop += spacingTopAdjust;
		else
			ops.chart.spacingTop += spacingTopAdjust - ops.chart.spacingTopAdjust;
		ops.chart.spacingTopAdjust = spacingTopAdjust;
		ops.chart.titleAdjust = titleAdjust;
		// Create the chart
		chart = chartConstructor.call(chart, ops, function(){
			var chart = this;
			// Call onLoad
			onLoad.apply(this, arguments);
			// Call the original callback function
			if(callback) callback.apply(chart, arguments);
		}) || chart;
		
		return chart;
	};
	
	/**
	* Creates the outer and print containers for the chart.  These are used to
	* captions, controls, ect.  Only children of the print container are included
	* in the printed output.  Note that no children of either container are
	* included when the chart is exported to an image.
	**/
	function preprocessContainers(options){
		if(
			!options.chart.outerContainer && 
			!options.chart.printContainer
		){
			var renderTo = options.chart.renderTo,
			container = typeof(renderTo) == "string" ? $('#' + renderTo) : $(renderTo),
			outerContainer = container.closest('.outerChartContainer'),
			printContainer = container.closest('.printChartContainer');
			
			if(outerContainer.length == 0 && printContainer.length == 0){
				outerContainer = $('<div></div>').css({
					height:'auto', 
					width:'auto'
				}).addClass('outerChartContainer');
				printContainer = $('<div></div>').css({
					height:'auto', 
					width:'auto'
				}).addClass('printChartContainer');
				
				// Set up the outer and print containers. We
				// add the outer container before the container
				// so that it will occupy it's index when we 
				// remove it and add it to the outer continer.
				container.before(outerContainer);
				printContainer.appendTo(outerContainer);
				container.appendTo(printContainer);
			}
			
			options.chart.outerContainer = outerContainer[0];
			options.chart.printContainer = printContainer[0];
			options.chart.container = container[0];
		}
	}
	
	/**
	* Preprocesses the options for vertical axis objects.  This function
	* processes above axis titles, and applies the label formatter which
	* formats labels with consistent precision.  Note that the formatter
	* will never decrease precision, because of the danger of an infinite
	* loop.  Sometimes this results in excess precision in the final
	* lables if a higher precision was found on first render, or if the 
	* chart has been resized.
	**/
	function preprocessAxis(axisOptions, renderer){
		var chart = this,
		opts = jQuery.extend(
			true, 
			{}, 
			defaultYAxisOptions, 
			axisOptions
		), 
		titleOpts = opts.title,
		yAxisPrecision = 0,
		newYAxisPrecision = 0,
		titleSpan,
		originalAlign = titleOpts.originalAlign || titleOpts.align.toLowerCase(),
		spacingTopAdjust = 0;
		
		if(originalAlign == 'above'){
			// return if the text is undefined, null, or empty
			if(titleOpts.text == void 0 || opts.text == ''){
				// Set the align to middle so that we don't have
				// any rendering issues, since 'above' is not
				// actually a valid align
				jQuery.extend(true, axisOptions, {
					align:'middle',
					originalAlign:'middle'
				});
			}
			else{
				titleSpan = renderer.text(
					titleOpts.text,
					0,
					0
				).attr({
					rotation:0
				})
				.css(titleOpts.style).add();
				
				var titleBox = titleSpan.getBBox();
				// Extend the axis options with the highcharts options
				// that will position the title above the axis
				if(titleOpts.align == 'above')
					jQuery.extend(true, axisOptions, {
						title:{
							margin: -1 * titleBox.width,
							rotation: 0,
							align:'high',
							x:axisOptions.opposite ? titleBox.width : 0,
							y: -1 * titleBox.height
						}
					});
				
				spacingTopAdjust = titleBox.height;
			}
		}
		
		// Store the original align so we can shift the yAxis title
		// on export for above axis titles
		jQuery.extend(true, axisOptions, {
			title:{
				originalAlign:originalAlign
			}
		});
		
		if(!axisOptions.labels || !axisOptions.labels.formatter){
			jQuery.extend(true, axisOptions, {
				labels:{
					// This function has to be defined in preprocessAxis because it 
					// needs to be applied to each axis, and because we store the 
					// yAxisPrecision in a reference scoped to that closure.
					formatter : function() {
						var ret = this.value.toString(),
						decimalRegex = /\d+\.?(\d*)/;
						if(decimalRegex.test(ret)){
							// Determine The number of numeric characters 
							// after the decimal point.
							newYAxisPrecision= Math.max(this.value.toString()
								.match(decimalRegex)[1].length,
								newYAxisPrecision);
							// If we haven't defined a yAxisPrecision for this
							// axis, then lets do it here.
							if(yAxisPrecision === void 0)
								yAxisPrecision = newYAxisPrecision;
							// If this value has a greater precision than
							// the one we've previously recorded, set the
							// value on the chart and force a redraw.
							if(this.isLast){
								if(newYAxisPrecision != yAxisPrecision){
									yAxisPrecision = newYAxisPrecision;
									// Set the axisLabelRedraw flag so that the yAxis
									// will be redrawn on load or on redraw
									axisLabelRedraw = true;
								}
								newYAxisPrecision = 0;
								ret = HC.numberFormat(this.value, yAxisPrecision,'.',',');
							}
							// Otherwise, round and format the number
							else{
								ret = HC.numberFormat(this.value, yAxisPrecision,'.',',');
							}
						}
						return ret;
					}
				}
			});
		}
		
		return spacingTopAdjust;
	}
	
	function preprocessChartTitle(titleOps, renderer, chartWidth){
		var spacingTopAdjust = 0,
		titleLines, titleBox;
		if(titleOps && titleOps.text){
			titleOps.text = titleOps.text.replace(/<br\/?>/gi," ");
			titleLines = Chart.prototype.splitText(titleOps.text, titleOps.style, chartWidth, renderer);
			titleOps.text = $.map(titleLines, function(item){return item.line}).join('<br/>');
			if(titleLines.length > 1){
				for(i=1; i<titleLines.length; i++){
					spacingTopAdjust += titleLines[i].lineHeight;
				}
			}
		}
		return spacingTopAdjust;
	}
	
	/**
	* Determines the periodicity of the passed series.  Returns
	* a category type if the XAxis is a category axis.
	**/
	function determineSeriesXAndYType(s){
		var chart = this,
		isDateTime = splat(chart.options.xAxis)[0].type == 'datetime',
		yIsMixed = false,
		sameMonth, sameDate, sameDay,
		lastMonth, lastDate, lastDay,
		month, date, day, 
		xType, yType, j, p, d;
		
		
		sameMonth = sameDate = sameDay = true;
		lastMonth = lastDate = lastDay = null;
		// For compatability with Highcharts and Highstocks
		var xArr = s.xData || s.data;
		var yArr = s.yData || s.data;
		
		for(j = 0; j < xArr.length; j++){
			if(isDateTime){
				// also for compatability with Highcharts and Highstocks
				d = new Date(xArr[j].x !== void 0 ? xArr[j].x : xArr[j]);
				
				month = d.getUTCMonth();
				date = d.getUTCDate();
				day = d.getUTCDay();
				
				if(lastMonth !== null && lastDate !== null && lastDay !== null){
					sameMonth &= month == lastMonth;
					sameDate &= date == lastDate;
					sameDay &= day == lastDay;
				}
				
				lastMonth = month;
				lastDate = date;
				lastDay = day;
			}
			
			yIsMixed |= (yArr[j] && yArr[j].y !== void 0 ? yArr[j].y : yArr[j]) < 0;
		}
		
		if(isDateTime){
			if(sameMonth && sameDate)
				xType = HC.xTypes.annual;
			else if(sameDate)
				xType = HC.xTypes.monthly;
			else if(sameDay)
				xType = HC.xTypes.weekly;
			else
				xType = HC.xTypes.daily;
		}
		else{
			xType = HC.xTypes.category;
		}
		
		return {
			xType : xType,
			yType : yIsMixed ? HC.yTypes.mixed : HC.yTypes.positive
		};
	};
	
	/**
	* Determines the maximum series periodicity for a given
	* chart.  Maximum in this case would be the smallest 
	* time interval, so Month > Year, Week > Month, etc.
	**/
	function determineMaxMinXType(checker){
		var chart = this,
		i, s, maxType, xType
		;
		
		for(i=0; i<chart.series.length; i++){
			s = chart.series[i];
			xType = s.options.xType;
			if(!isNaN(maxType))
				maxType = checker(maxType, xType);
			else
				maxType = xType
		}
		
		return maxType;
	};
	
	/**
	* Determines the zoom type for a chart based on the types
	* of series it contains.
	**/
	function determineZoomType(){
		var chart = this,
		i, s, containsColumnOrBar = false;
		
		for(i=0; i<chart.series.length; i++){
			s = chart.series[i];
			containsColumnOrBar |= /column|bar/.test(s.type);
			if(containsColumnOrBar)
				break;
		}
		if(containsColumnOrBar)
			return '';
		else
			return 'xy';
	}
	
	/**
	* This is basically a copy of print chart from the Highcharts
	* source, only with the container variable set to the charts
	* print container. We also add some code to hide the export
	* buttons on print.
	* See the exporting module print() function version 3.0.0 for original. Added lines are annotated.
	**/
	function printChart(){
		var chart = this,
			container = chart.options.chart.printContainer, // Changed this line from exporting module - Scott Gearhart 3/25/2013
			origDisplay = [],
			origParent = container.parentNode,
			body = doc.body,
			childNodes = body.childNodes;

		if (chart.isPrinting) { // block the button while in printing mode
			return;
		}

		chart.isPrinting = true;
		
		// Added these lines  - Scott Gearhart 3/25/2013
		$(container).width(chart.chartWidth)
		.height(chart.chartHeight);
		// End of Line Addition - Scott Gearhart 3/25/2013

		// hide all body content
		each(childNodes, function (node, i) {
			if (node.nodeType === 1) {
				origDisplay[i] = node.style.display;
				node.style.display = 'none'; // Changed NONE to string value - Scott Gearhart 3/25/2013
			}
		});

		// pull out the chart
		body.appendChild(container);
		
		// Added these lines  - Scott Gearhart 3/25/2013
		// hide the export buttons
		chart.buttonGroup.hide();
		// End of Line Addition - Scott Gearhart 3/25/2013
		

		// print
		win.focus(); // #1510
		win.print();

		// allow the browser to prepare before reverting
		setTimeout(function () {

			// put the chart back in
			origParent.appendChild(container);
			
			// Added these lines  - Scott Gearhart 3/25/2013
			// Show the export buttons
			chart.buttonGroup.show();
			// End of Line Addition - Scott Gearhart 3/25/2013
			
			// restore all body content
			each(childNodes, function (node, i) {
				if (node.nodeType === 1) {
					node.style.display = origDisplay[i];
				}
			});
			
			// Added these lines  - Scott Gearhart 3/25/2013
			$(container).width('auto')
			.height('auto');
			// End of Line Addition - Scott Gearhart 3/25/2013
		
			chart.isPrinting = false;

		}, 1000);

	}
	
	/**
	* This function runs when the chart is redrawn, and determines the
	* xType of any series that have been added to the chart.
	**/
	function onRedraw(){
		var chart = this, s, xAndYType, extremes;
		
		for(i=0; i<chart.series.length; i++){
			s = chart.series[i];
			if(!s.options.hasOwnProperty('xType')){
				xAndYType = determineSeriesXAndYType.call(chart, s);
				s.options.xType = xAndYType.xType;
				if(xAndYType.yType === HC.yTypes.mixed){
					extremes = s.yAxis.getExtremes();
					// Only set the min to null if the min is equal to zero or otherwise falsey
					s.yAxis.setExtremes(extremes.min ? extremes.min : null, extremes.max, false);
				}
			}
		}
		
		adjustYAxis.apply(chart);
	}
	
	/**
	* This function runs on chart load.  It sets some additional options
	* for the charts original series and color counter, and redraws
	* the yAxis if appropriate
	**/
	function onLoad(){
		var chart = this;
		
		// We use this array and counter when reseting the chart after
		// modifications to the chart series (see Chart.resetSeries)
		if(!chart.options.originalSeriesOptions){
			// We check and see if this option already exists, as it
			// may have been carried over when a chart is "recreated"
			chart.options.originalSeriesOptions = map(
				chart.series, 
				function(s){
					// copy the options and preserve the original color
					return jQuery.extend({color:s.color}, s.options);
				}
			);
		}
        
		chart.options.originalColorCounter = this.counters.color;
        
        adjustYAxis.apply(chart);
	}
	
    function adjustYAxis(){
        var chart = this,
        minMaxChanged = chart.options.chart.lineUpYAxisZeros ?
			lineUpYAxisZeros.apply(chart) : false;

		if(axisLabelRedraw){
			axisLabelRedraw = false;
			if(!minMaxChanged){
				redrawYAxis.apply(chart);
			}
		}
    }
    
	/**
	 * Lines up the zero ticks for multiple axis
	 **/
	function lineUpYAxisZeros(){
		var chart = this,
		minMaxChanged = false,
		ratios = [],
		allPositive = true,
		allNegative = true,
		minimumRatioDiff = void 0,
		optimumRatios = {},
		axis = chart.yAxis,
		axi,
		minimum,
		maximum,
		axisLength,
		extremes;
		
		if(axis.length > 1){
			for(i = 0; i < chart.yAxis.length; i++){
				axi = axis[i];
				extremes = axi.getExtremes();
				ratios[i] = {
					min : minimum = Math.abs(extremes.min),
					max : maximum = Math.abs(extremes.max),
					axisLength : axisLength = maximum + minimum,
					positiveRatio : Math.abs(maximum) / axisLength,
					negativeRatio : Math.abs(minimum) / axisLength
				};
			}
			
			for(i = 0; i < ratios.length; i++){
				var positiveRatio = ratios[i].positiveRatio;
				var negativeRatio = ratios[i].negativeRatio;
				var ratioDiff = Math.abs(positiveRatio - negativeRatio);
				
				if(!isNaN(positiveRatio) && !isNaN(negativeRatio)){
					allPositive &= positiveRatio == 1;
					allNegative &= negativeRatio == 1;
					if(minimumRatioDiff === void 0 || ratioDiff < minimumRatioDiff){
						minimumRatioDiff = ratioDiff;
						optimumRatios = {
							positiveRatio : positiveRatio,
							negativeRatio : negativeRatio
						}
					}
				}
			}
			
			if(minimumRatioDiff == 1 && (!allPositive && !allNegative)){
				optimumRatios = {
					positiveRatio : 0.5,
					negativeRatio : 0.5
				};
			}

			for(i=0; i<chart.yAxis.length; i++){
				if(ratios[i].positiveRatio != optimumRatios.positiveRatio && !isNaN(ratios[i].min) && !isNaN(ratios[i].max)){
					var adjustMin = 0;
					var adjustMax = 0;
					minMaxChanged = true;
					if(optimumRatios.positiveRatio < ratios[i].positiveRatio)
						axis[i].setExtremes(
							-1 * (ratios[i].max * optimumRatios.negativeRatio / optimumRatios.positiveRatio),
							ratios[i].max,
							false
						);
					else
						axis[i].setExtremes(
							-1 * ratios[i].min,
							ratios[i].min * optimumRatios.positiveRatio / optimumRatios.negativeRatio,
							false
						);
				}
			}
		}
		
		if(minMaxChanged) redrawYAxis.apply(chart);
		
		return minMaxChanged;
	}
	
	/**
	 * Forces a redraw of all yAxis in a chart
	 **/
	function redrawYAxis(){
		var chart = this,
		i, yAxis = $.isArray(chart.yAxis) ? chart.yAxis : [chart.yAxis];
		for(i=0; i < yAxis.length; i++)
			yAxis[i].isDirty = true;
		for(i=0; i < chart.series.length; i++)
			chart.series[i].isDirty = true;
		// Chart redraw is null when this is called on
		// chart redraw, so we call detachedredraw if
		// this is the case.
		if(chart.redraw !== null)
			chart.redraw(false);
		else
			chart.detachedredraw(false);
	}
	
	// Since 1.1.1, it is impossible to get the default
	// highcharts axis options, so we use ours instead.
	// These are set to null after we set the default
	// options, so we cache a reference to them first.
	defaultYAxisOptions = HC.eiaTheme.yAxis;
	defaultXAxisOptions = HC.eiaTheme.xAxis;
	// Set the default theme
	HC.setOptions(HC.eiaTheme);
	
	///////////
	// Logos //
	///////////
	
	var eia_logoScale = 0.15,
	eia_logoHeight = eia_logoScale * 138,
	eia_logoWidth = eia_logoScale * 188,
	eia_logoPadding = 5;
	reuters_logoURL = 'http://www.eia.gov/global/images/logos/Thomson_Reuters_logo.png'
	reuters_logoHeight = 30,
	reuters_logoWidth = 135,
	reuters_logoPadding = 5;
	
	/**
	* Sets the spacing and positions the credits relative to the logo size and position.
	**/
	function preprocessLogoOptions(options){
	
		switch(options.chart.logo){
			case HC.logos.eia:
				if(!options.chart.forExport) options.chart.spacingBottom += eia_logoHeight + eia_logoPadding * 2;
				options.credits.position.x = eia_logoWidth + eia_logoPadding +  10;
				if (options.credits.position.y == -5){options.credits.position.y = -(eia_logoHeight + eia_logoPadding)/3};
				break;
			case HC.logos.reuters:
				if(!options.chart.forExport) options.chart.spacingBottom += reuters_logoHeight + reuters_logoPadding * 2;
				options.credits.position.x = reuters_logoWidth + reuters_logoPadding +  10;
				options.credits.position.y = -(reuters_logoHeight + reuters_logoPadding)/3;
				break;
			case HC.logos.none:
			default:
				break;
		}
	};
	
	/**
	* Determines the logo type and calls the appropriate draw function.
	**/
	function drawLogo(){
		var chart = this;
		switch(chart.options.chart.logo){
			case HC.logos.eia:
				drawEIALogo.call(chart);
				break;
			case HC.logos.reuters:
				drawReutersLogo.call(chart);
				break;
			case HC.logos.none:
			default:
				break;
		}
	};
	
	/**
	* Draws the EIA logo.  The paths for the EIA logo are not calculated
	* such that the radius is equivilent to a pixel amount, rather the
	* radius variable is a ratio of the original svg size.
	**/
	function drawEIALogo(){
		var chart = this, i, symbol, element,
		logoColors = {
			eia_logo1 : HC.eia_yellow,
			eia_logo2 : HC.eia_green,
			eia_logo3 : HC.eia_blue,
			eia_logo4 : HC.eia_dk_grey,
			eia_logo5 : HC.eia_dk_grey,
			eia_logo6 : 'white'
		},
		
		logoSymbols = {
			eia_logo1 : function(x, y, radius){
				return [
					'M',x+(16)*radius, y+(62)*radius,
					'L',x+(45)*radius, y+(34.1705)*radius,
					'L',x+(92)*radius, y+(2)*radius,
					'C',x+(83.9494)*radius, y-(1.37057)*radius, x+(71.9437)*radius, y+(4.34737)*radius, x+(65)*radius, y+(8.4537)*radius,
					'C',x+(44.8839)*radius, y+(20.3498)*radius, x+(27.4976)*radius, y+(41.8202)*radius, x+(16)*radius,y+(62)*radius,
					'Z'
				];
			},
			
			eia_logo2 : function(x, y, radius){
				return [
					'M',x+(23)*radius, y+(60)*radius,
					'C',x+(39.3556)*radius, y+(54.5752)*radius, x+(54.2654)*radius, y+(39.2377)*radius, x+(70)*radius,y+(31.3704)*radius,
					'C',x+(100.899)*radius, y+(15.9208)*radius, x+(131.025)*radius, y+(10.9963)*radius, x+(165)*radius,y+(11)*radius,
					'C',x+(156.155)*radius, y-(0.263321)*radius, x+(135.73)*radius, y+(1.08018)*radius, x+(123)*radius,y+(2.8696)*radius,
					'C',x+(95.3696)*radius, y+(6.75337)*radius, x+(69.9894)*radius, y+(21.66)*radius, x+(48)*radius,y+(38.1265)*radius,
					'C',x+(39.4055)*radius, y+(44.5625)*radius, x+(29.5512)*radius, y+(51.4338)*radius, x+(23)*radius,y+(60)*radius,
					'Z'
				];
			},
			
			eia_logo3 : function(x, y, radius){
				return [
					'M',x+(32)*radius, y+(59)*radius,
					'L',x+(32)*radius, y+(60)*radius,
					'C',x+(42.4037)*radius, y+(57.0029)*radius,x+(51.8736)*radius, y+(50.2186)*radius,x+(62)*radius, y+(46.2037)*radius,
					'C',x+(98.2707)*radius, y+(31.8232)*radius,x+(166.685)*radius, y+(21.9476)*radius,x+(177.55)*radius, y+(75)*radius,
					'C',x+(180.002)*radius, y+(86.9709)*radius,x+(176.017)*radius, y+(96.333)*radius,x+(175)*radius, y+(108)*radius,
					'C',x+(182.09)*radius, y+(104.111)*radius,x+(185.321)*radius, y+(93.5466)*radius,x+(186.739)*radius, y+(86)*radius,
					'C',x+(191.28)*radius, y+(61.8382)*radius,x+(180.61)*radius, y+(40.0222)*radius,x+(157)*radius, y+(31.2292)*radius,
					'C',x+(115.647)*radius, y+(15.8281)*radius,x+(66.292)*radius, y+(35.8662)*radius,x+(32)*radius, y+(59)*radius,
					'Z'
				];
			},
			
			eia_logo4 : function(x, y, radius){
				return [
					'M',x+(79.1481)*radius, y+(51.0285)*radius,
					'C',x+(72.0614)*radius, y+(55.1825)*radius,x+(78.3783)*radius, y+(66.6077)*radius,x+(85.8665)*radius, y+(62.6667)*radius,
					'C',x+(93.8297)*radius, y+(58.4757)*radius,x+(86.9336)*radius, y+(46.465)*radius,x+(79.1481)*radius, y+(51.0285)*radius,
					'Z'
				];
			},
			
			eia_logo5 : function(x, y, radius){
				return [
					'M',x+(61)*radius, y+(123)*radius,
					'C',x+(53.7575)*radius, y+(121.404)*radius,x+(49.0999)*radius, y+(129.434)*radius,x+(42)*radius, y+(130.67)*radius,
					'C',x+(23.8086)*radius, y+(133.836)*radius,x+(15.0402)*radius, y+(112.575)*radius,x+(15)*radius, y+(98)*radius,
					'L',x+(60)*radius, y+(98)*radius,
					'C',x+(59.7112)*radius, y+(63.5736)*radius,x+(10.8165)*radius, y+(62.9047)*radius,x+(2.7608)*radius, y+(94)*radius,
					'C',x-(0.369467)*radius, y+(106.083)*radius,x+(1.7841)*radius, y+(119.952)*radius,x+(11.0934)*radius, y+(128.815)*radius,
					'C',x+(24.6222)*radius, y+(141.694)*radius,x+(51.982)*radius, y+(140.372)*radius,x+(61)*radius, y+(123)*radius,
					'M',x+(66)*radius, y+(73)*radius,
					'L',x+(66)*radius, y+(77)*radius,
					'C',x+(69.5125)*radius, y+(77.0318)*radius,x+(73.7251)*radius, y+(76.8004)*radius,x+(75.821)*radius, y+(80.2284)*radius,
					'C',x+(77.7922)*radius, y+(83.4524)*radius,x+(77)*radius, y+(88.3932)*radius,x+(77)*radius, y+(92)*radius,
					'C',x+(77)*radius, y+(101.054)*radius, x+(80.598)*radius, y+(119.959)*radius, x+(75.821)*radius,y+(127.772)*radius,
					'C',x+(73.7251)*radius, y+(131.2)*radius,x+(69.5125)*radius, y+(130.968)*radius,x+(66)*radius, y+(131)*radius,
					'L',x+(66)*radius, y+(135)*radius,
					'L',x+(100)*radius, y+(135)*radius,
					'L',x+(100)*radius, y+(131)*radius,
					'C',x+(89.9728)*radius, y+(130.451)*radius,x+(90)*radius, y+(123.295)*radius,x+(90)*radius, y+(115)*radius,
					'L',x+(90)*radius, y+(71)*radius,
					'L',x+(66)*radius, y+(73)*radius,
					'M',x+(112)*radius, y+(92)*radius,
					'C',x+(114.524)*radius, y+(86.1526)*radius,x+(118.273)*radius, y+(80.4355)*radius,x+(125)*radius, y+(79.1451)*radius,
					'C',x+(132.873)*radius, y+(77.6349)*radius,x+(142.683)*radius, y+(85.3874)*radius,x+(140.667)*radius, y+(93.956)*radius,
					'C',x+(138.426)*radius, y+(103.48)*radius,x+(115.803)*radius, y+(102.597)*radius,x+(109.653)*radius, y+(111.043)*radius,
					'C',x+(103.061)*radius, y+(120.094)*radius,x+(108.427)*radius, y+(133.668)*radius,x+(119)*radius, y+(136.442)*radius,
					'C',x+(128.207)*radius, y+(138.858)*radius,x+(134.671)*radius, y+(134.823)*radius,x+(142)*radius, y+(130)*radius,
					'C',x+(148.248)*radius, y+(143.073)*radius,x+(161.824)*radius, y+(135.846)*radius,x+(165)*radius, y+(125)*radius,
					'L',x+(162)*radius, y+(124)*radius,
					'C',x+(160.224)*radius, y+(126.135)*radius,x+(156.781)*radius, y+(130.128)*radius,x+(154.742)*radius, y+(125.833)*radius,
					'C',x+(146.822)*radius, y+(109.143)*radius,x+(165.86)*radius, y+(73.6233)*radius,x+(135)*radius, y+(71.0934)*radius,
					'C',x+(126.653)*radius, y+(70.409)*radius,x+(118.109)*radius, y+(72.3735)*radius,x+(112.532)*radius, y+(79.0934)*radius,
					'C',x+(109.261)*radius, y+(83.0354)*radius,x+(105.924)*radius, y+(89.5494)*radius,x+(112)*radius, y+(92)*radius,
					'Z'
				];
			},
			
			eia_logo6 : function(x, y, radius){
				return [
					'M',x+(15)*radius, y+(94)*radius,
					'L',x+(47)*radius, y+(94)*radius,
					'C',x+(46.4989)*radius, y+(70.4755)*radius,x+(16.059)*radius, y+(70.8807)*radius,x+(15)*radius, y+(94)*radius,
					'M',x+(140)*radius, y+(102)*radius,
					'C',x+(135.245)*radius, y+(104.506)*radius,x+(129.419)*radius, y+(105.518)*radius,x+(125.055)*radius, y+(108.699)*radius,
					'C',x+(109.174)*radius, y+(120.273)*radius,x+(133.711)*radius, y+(139.579)*radius,x+(140.397)*radius, y+(121.985)*radius,
					'C',x+(141.539)*radius, y+(118.979)*radius,x+(141)*radius, y+(115.154)*radius,x+(141)*radius, y+(112)*radius,
					'C',x+(141)*radius, y+(108.581)*radius,x+(141.328)*radius, y+(105.166)*radius,x+(140)*radius, y+(102)*radius,'Z'
				];
			}
		}
		
		for(symbol in logoSymbols){
			if(logoSymbols.hasOwnProperty(symbol)){
				symbolFn = logoSymbols[symbol];
				chart.renderer.symbols[symbol] = symbolFn;
				element = chart.renderer.symbol(symbol, 0, 0, eia_logoScale)
					.attr({
						stroke: 'none',
						fill:logoColors[symbol]
					}).add().align({
						verticalAlign:'bottom',
						align:'left',
						y:-(eia_logoHeight + eia_logoPadding),
						x:eia_logoPadding
					});
			}
		}
	};
	
	/**
	* "Draws" the reuters logo.  In fact, the Reuters logo is an image, so
	* in reality we add the image to the chart renderer.
	**/
	function drawReutersLogo(){
		var chart = this;
		
		chart.renderer.image(
			reuters_logoURL, 
			0, 0,
			reuters_logoWidth,
			reuters_logoHeight
		).align({
			verticalAlign:'bottom',
			align:'left',
			y:-(reuters_logoHeight + reuters_logoPadding),
			x:reuters_logoPadding
		}).add();
	};
	
	// Push the callback
	Chart.prototype.callbacks.push(drawLogo);
	
	///////////////////////
	// CSV Export Module //
	///////////////////////
	
	HC.setOptions($.extend(true, HC.eiaTheme, {
		exporting:{
			csvOptions:{
				// Setting this value overrides the csv export, and redirects to the 
				// override url.
				overrideURL:null,
				// The location of the csv exporter cfm page
				postURL:'/global/scripts/jquery/highcharts/exporting-server/csv_exporter.cfm'
			}
		}
	}));
	
	extend(Chart.prototype, {
		generateCSV : function(){
			function addToCatagoriesHash(cat){
				if(!categoriesHash.hasOwnProperty(cat)){
					if(isDateTime){
						// If dateTime, splice the date in it's sorted position
						for(k = categories.length - 1; k >= 0 ; k--)
							if(cat < categories[k]) break;
						categories.splice(k+1, 0, cat); 
					}
					else categories.push(cat);
					// Add it to the hash so we know we've processed it
					categoriesHash[cat] = 1;
				}
			}
			// "Constants"
			var chart = this,
			POST_URL = chart.options.exporting.csvOptions.postURL,
			OVERRIDE_URL = chart.options.exporting.csvOptions.overrideURL,
			//// CSV Characters
			NULL_STRING = '--',
			FIELD_DELIM_REGEXP = /,/g,
			RECORD_DELIM_REGEXP = /\n/g,
			//// Other REGEXP
			HTML_TAG_REGEXP = /<[\/\w]+>/g,
			FILE_CHAR_REGEXP = /[\?%\*:\|"\<\>\\,]/g,
			PER_REGEXP = /\//g,
			MULTI_SPACE_REGEXP = /\s+/g,
			// Variables
			i, j, k, cat, p, s, d, xTitle, propertiesHash, linkHeaders,
			csvArr, headers, record, dataHash, input1, input2, dataStart,
			xType, xAxisOps = splat(chart.options.xAxis)[0], keyHeaders,
			firstTime = true,
			isDateTime = false,
			categories = [],
			dataHashes = {},
			propertiesHashes = {},
			categoriesHash = {},
			hasSourceLink = false,
			hasSourceKey = false,
			chartTitle = 'chartData';
			// If we have an override URL, then we change the window location and return
			if(OVERRIDE_URL)
				return window.location = OVERRIDE_URL;
			// See if we have a chart title, if so, use for the file name
			try{
				if(chart.options.title.text !== void 0 && chart.options.title.text.length > 0)
					chartTitle = chart.options.title.text
						.replace(HTML_TAG_REGEXP, ' ')
						.replace(FILE_CHAR_REGEXP, '')
						.replace(PER_REGEXP, ' per ')
						.replace(MULTI_SPACE_REGEXP, ' ');
				if(chart.options.subtitle.text !== void 0 && chart.options.subtitle.text.length > 0)
					chartTitle += ' (' + chart.options.subtitle.text
						.replace(HTML_TAG_REGEXP, ' ')
						.replace(FILE_CHAR_REGEXP, '')
						.replace(PER_REGEXP, ' per ')
						.replace(MULTI_SPACE_REGEXP, ' ') + ')';
			}catch(e){/*DO NOTHING*/}
			// See if we are dealing with a date time or a category axis
			try{
				isDateTime = xAxisOps.type == 'datetime';
			}catch(e){/*DO NOTHING*/}
			// See if we have an XAxis title, if so use for the date/category header
			try{
				if(
					
					xAxisOps.title.text !== void 0 && 
					xAxisOps.title.text.length > 0
				) xTitle = xAxisOps.title.text;
			}catch(e){/*DO NOTHING*/}
			// Loop through the chart series
			for(i=0; i<chart.series.length; i++){
				s = chart.series[i];
				// Create a new hash to store the <x, y> pairs
				if(!chart.options.navigator){
					var seriesHeader = s.name + (s.yAxis && s.yAxis.axisTitle ? ' ' + s.yAxis.axisTitle.textStr : '');
					dataHash = dataHashes[seriesHeader] = {};
					// Store the sourceKey and 
					propertiesHashes[seriesHeader] = {
						sourceKey : s.options.sourceKey,
						sourceLink : s.options.sourceLink
					};
					// We use this flag later to determine if we should add a
					// row for source links in the csv file
					hasSourceLink |= typeof propertiesHashes[seriesHeader].sourceLink != 'undefined';
					hasSourceKey |= typeof propertiesHashes[seriesHeader].sourceKey != 'undefined';
					for(j=0; j<s.data.length; j++){
						p = s.data[j];
						// Store the value, with the category as the key
						cat = p.category !== void 0 ? p.category : p.name;
						dataHash[cat] = HC.numberFormat(
							s.options.compare ? p.change : p.y,
							s.options.tooltip.precision ? s.options.tooltip.precision : void 0,
							'.',
							''
						);
						// Add the category to the categories list
						if(!categoriesHash.hasOwnProperty(cat)){
							if(isDateTime){
								// If dateTime, splice the date in it's sorted position
								for(k = categories.length - 1; k >= 0 ; k--)
									if(cat < categories[k]) break;
								categories.splice(k+1, 0, cat);	
							}
							else categories.push(cat);
							// Add it to the hash so we know we've processed it
							categoriesHash[cat] = 1;
						}
					}
				}
				else if(!chart.options.navigator.enabled || s.name != 'Navigator'){
					var seriesHeader = s.name + ' ' + s.yAxis.axisTitle.textStr;
					dataHash = dataHashes[seriesHeader] = {};
					if(s.type == 'pie'){
						for(j=0; j<s.points.length; j++){
							p = s.points[j];
							// Store the value, with the name as the key
							cat = p.name;
							dataHash[cat] = HC.numberFormat(
								p.y,
								s.options.tooltip.precision ? s.options.tooltip.precision : void 0,
								'.',
								''
							);
							// Add the category to the categories hash
							addToCatagoriesHash(cat);
						}
					}
					else{
						for(j=0; j<s.points.length; j++){
							// Store the y value, with the x value as the key
							p = s.points[j];
							cat = p.x;
							dataHash[cat] = HC.numberFormat(
								s.options.compare ? p.change : p.y,
								s.options.tooltip.precision ? s.options.tooltip.precision : void 0,
								'.',
								''
							);
							// Add the category to the categories hash
							addToCatagoriesHash(cat);
						}
					}
				}
			}
			
			// Determine the period type
			xType = chart.options.maxXType;
			if(xTitle === void 0) xTitle = HC.csvXLabels[xType] || HC.csvXLabels[HC.xTypes.category];
			// Begin generating our CSV array, starting with the chart info.
			csvArr = [[chartTitle]];
			csvArr.push([window.location.href.toString()]);
			csvArr.push([new Date().toTimeString()]);
			csvArr.push([chart.options.credits.text]);
			// If we have source links
			if(hasSourceLink) csvArr.push(linkHeaders = ['Series Link']);
			if(hasSourceKey) csvArr.push(keyHeaders = ['Series Key']);
			// Now the headers
			csvArr.push(headers = [xTitle]);
			// Determine the row position to begin inputing data
			dataStart = csvArr.length;
			// Loop through the categories again
			for(i=0; i <categories.length; i++){
				j = categories[i];
				// Begin the record with the parsed date time, or category
				record = csvArr[i+dataStart] = [HC.parseXValue(xType, j)];
				// Loop through our series hashes
				for(k in dataHashes){
					if(dataHashes.hasOwnProperty(k)){
						dataHash = dataHashes[k];
						propertiesHash = propertiesHashes[k];
						// Add the series name to the header row
						if(firstTime){
							headers.push(
								k.replace(FIELD_DELIM_REGEXP, '')
								.replace(RECORD_DELIM_REGEXP, ' ')
								.replace(HTML_TAG_REGEXP, ' ')
							);
							if(hasSourceLink)
								linkHeaders.push(
									typeof propertiesHash.sourceLink != 'undefined' ?
									propertiesHash.sourceLink : ''
								);
							if(hasSourceKey)
								keyHeaders.push(
									typeof propertiesHash.sourceKey != 'undefined' ?
									propertiesHash.sourceKey : ''
								)
						}
						// Determine if the series has a value for this category
						// append the record accordingly
						if(dataHash.hasOwnProperty(j)){
							if(dataHash[j] == null)
								record.push(NULL_STRING);
							else
								record.push(dataHash[j])
						}
						else
							record.push('');
					}
				}
				firstTime = false;
			}
			// Now, create a hidden form, and post the json data to the server to be processed
			// into a CSV
			input1 = $('<input type="hidden" name="csvArr"/>').val(JSON.stringify(csvArr));
			input2 = $('<input type="hidden" name="fileName"/>').val(chartTitle.replace(' ', '_'));
			
			jQuery('<form style="display:none;" action="'+ POST_URL +'" method="post"></form>')
			.append(input1).append(input2) .appendTo('body').submit().remove();
		}
	});
	
	/////////////////////
	// Export Override //
	/////////////////////
	
	extend(Chart.prototype,{

		// Add the export button to the chart.  This overrides the addButton
		// function found in the export module to add the buttons to a group,
		// so they can be hidden when the chart is printed.

		addButton: function (options) {
			var chart = this,
				renderer = chart.renderer,
				btnOptions = merge(chart.options.navigation.buttonOptions, options),
				onclick = btnOptions.onclick,
				menuItems = btnOptions.menuItems,
				symbol,
				button,
				symbolAttr = {
					stroke: btnOptions.symbolStroke,
					fill: btnOptions.symbolFill
				},
				symbolSize = btnOptions.symbolSize || 12,
				menuKey;

			if (!chart.btnCount) {
				chart.btnCount = 0;
			}
			menuKey = chart.btnCount++;

			// Keeps references to the button elements
			if (!chart.exportDivElements) {
				chart.exportDivElements = [];
				chart.exportSVGElements = [];
			}

			if (btnOptions.enabled === false) {
				return;
			}
			
			// Added these lines  - Scott Gearhart 3/25/2013
			if(!chart.buttonGroup) {
				chart.buttonGroup = renderer.g('buttonGroup').add();
				chart.exportSVGElements.push(chart.buttonGroup);
			}
			// End of Line Addition - Scott Gearhart 3/25/2013
			
			var attr = btnOptions.theme,
				states = attr.states,
				hover = states && states.hover,
				select = states && states.select,
				callback;

			delete attr.states;

			if (onclick) {
				callback = function () {
					onclick.apply(chart, arguments);
				};

			} else if (menuItems) {
				callback = function () {
					chart.contextMenu(
						'contextmenu', 
						menuItems, 
						button.translateX, 
						button.translateY, 
						button.width, 
						button.height,
						button
					);
					button.setState(2);
				};
			}


			if (btnOptions.text && btnOptions.symbol) {
				attr.paddingLeft = Highcharts.pick(attr.paddingLeft, 25);
			
			} else if (!btnOptions.text) {
				extend(attr, {
					width: btnOptions.width,
					height: btnOptions.height,
					padding: 0
				});
			}

			button = renderer.button(btnOptions.text, 0, 0, callback, attr, hover, select)
				.attr({
					title: chart.options.lang[btnOptions._titleKey],
					'stroke-linecap': 'round'
				});

			if (btnOptions.symbol) {
				symbol = renderer.symbol(
						btnOptions.symbol,
						btnOptions.symbolX - (symbolSize / 2),
						btnOptions.symbolY - (symbolSize / 2),
						symbolSize,				
						symbolSize
					)
					.attr(extend(symbolAttr, {
						'stroke-width': btnOptions.symbolStrokeWidth || 1,
						zIndex: 1
					})).add(button);
			}

			button.add()// Changed this line from exporting module, added chart.buttonGroup as parameter - Scott Gearhart 3/25/2013
				.align(extend(btnOptions, {
					width: button.width,
					x: buttonOffset
				}), true, 'spacingBox');

			buttonOffset += (button.width + btnOptions.buttonSpacing) * (btnOptions.align === 'right' ? -1 : 1);

			chart.exportSVGElements.push(button, symbol);

		}
	});
}());
