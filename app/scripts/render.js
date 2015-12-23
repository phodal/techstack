define(['d3', 'lettuce', 'text!templates/description.html', 'jquery.tooltipster'], function (d3, Lettuce, description_template) {
  'use strict';
  // Copyright (c) 2014 @simonellistonball
  //https://github.com/simonellistonball/techradar
  //Apache License
  //Version 2.0, January 2004
  //http://www.apache.org/licenses/
  //
  //  TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
  function polar_to_cartesian(r, t) {
    var x = r * Math.cos(t);
    var y = r * Math.sin(t);
    return [x, y];
  }

  function identity(i) {
    return i;
  }

  /**
   * Uses d3 to plot the radar
   */
  function renderPage(id, data) {
    var width = data.width || 768, height = data.height || 768;
    var cx = width / 2, cy = height / 2;
    var horizonWidth = 0.95 * (width > height ? height : width) / 2;
    var quad_angle = 2 * Math.PI / data.quadrants.length;
    var color_scale = d3.scale.category10();

    var svg = d3.select(id).append('svg')
      .attr("width", width)
      .attr("height", height);
    svg.append('marker')
      .attr('id', 'arrow')
      .attr('orient', "auto")
      .attr('markerWidth', '2')
      .attr('markerHeight', '4')
      .attr('refX', 0.1)
      .attr('refY', 2)
      .append('path').attr('d', 'M0,0 V4 L2,2 Z');

    function process_radar_data(data) {
      var results = [];
      for (var i in data.data) {
        var entry = data.data[i];
        var trend = entry.trend;

        var quadrant_delta = 0;

        // figure out which quadrant this is
        for (var j = 0, len = data.quadrants.length; j < len; j++) {
          if (data.quadrants[j] == trend.quadrant) {
            quadrant_delta = quad_angle * j;
          }
        }

        var theta = (trend.position_angle * quad_angle) + quadrant_delta,
          r = trend.position * horizonWidth,
          cart = polar_to_cartesian(r, theta);
        var blip = {
          id: i,
          name: entry.name,
          quadrant: trend.quadrant,
          important: entry.important,
          usage: entry.usage,
          description: entry.description,
          r: r,
          theta: theta,
          x: cart[0],
          y: cart[1]
        };

        if (trend.direction) {
          var r2 = trend.direction * horizonWidth,
            theta2 = (trend.direction_angle * quad_angle) + quadrant_delta,
            vector = polar_to_cartesian(r2, theta2);

          blip.dx = vector[0] - cart[0];
          blip.dy = vector[1] - cart[1];
        }
        results.push(blip);
      }
      return results;
    }

    function add_quadrants(base) {
      var quadrants = base
        .append('g')
        .attr('class', 'quadrants');

      function quadrant_class(d) {
        return 'quadrant quadarant-' + d.name.toLowerCase().replace(/ /, '-');
      }

      quadrants.selectAll('line.quadrant')
        .data(data.quadrants, identity)
        .enter().append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', function (d, i) {
          return (Math.cos(quad_angle * i) * horizonWidth);
        })
        .attr('y2', function (d, i) {
          return (Math.sin(quad_angle * i) * horizonWidth);
        })
        //.attr('class', quadrant_class)
        .attr('stroke', function (d, i) {
          return color_scale(i);
        });

      var arc_function = d3.svg.arc()
        .outerRadius(function (d, i) {
          return d.outerRadius * horizonWidth;
        })
        .innerRadius(function (d, i) {
          return d.innerRadius * horizonWidth;
        })
        .startAngle(function (d, i) {
          return d.quadrant * quad_angle + Math.PI / 2;
        })
        .endAngle(function (d, i) {
          return (d.quadrant + 1) * quad_angle + Math.PI / 2;
        });

      var quads = [];
      for (var i = 0, ilen = data.quadrants.length; i < ilen; i++) {
        for (var j = 0, jlen = data.horizons.length; j < jlen; j++) {
          quads.push({
            outerRadius: (j + 1) / jlen,
            innerRadius: j / jlen,
            quadrant: i,
            horizon: j,
            name: data.quadrants[i]
          });
        }
      }
      var text_angle = (360 / data.quadrants.length);

      quadrants.selectAll('text.quadrant')
        .data(quads.filter(function (d) {
          return d.horizon == 0;
        }))
        .enter()
        .append('text')
        .attr('class', 'quadrant')
        .attr('dx', horizonWidth / data.horizons.length)
        .attr('transform', function (d) {
          return 'rotate(' + (d.quadrant * text_angle + text_angle ) + ')'
        })
        .text(function (d) {
          return d.name;
        });

      quadrants.selectAll('path.quadrant')
        .data(quads)
        .enter()
        .append('path')
        .attr('d', arc_function)
        .attr('fill', function (d, i) {
          var rgb = d3.rgb(color_scale(d.quadrant));
          return rgb.brighter(d.horizon / data.horizons.length * 3);
        })
        .attr('class', quadrant_class);
    }

    function draw_radar() {
      var base = svg.append('g')
        .attr('transform', "translate(" + cx + "," + cy + ")");

      add_quadrants(base);

      var blip_data = process_radar_data(data);
      blip_data.sort(
        function (a, b) {
          if (a.quadrant < b.quadrant)
            return -1;
          if (a.quadrant > b.quadrant)
            return 1;
          return 0;
        });

      var blips = base.selectAll('.blip')
        .data(blip_data)
        .enter().append('g')
        .attr('class', 'blip')
        .attr('id', function (d) {
          return 'blip-' + d.id;
        })
        .attr('transform', function (d) {
          return "translate(" + (d.x) + "," + (d.y) + ")";
        })
        .on('mouseout', function (d) {
          var lettuce = new Lettuce();
          var data = {
            id: id,
            name: d.name,
            description: d.description
          };

          var results = lettuce.Template.tmpl(description_template, data);

          $(this).tooltipster({
            content: $(results),
            contentAsHTML: true,
            position: 'top',
            animation: 'grow',
            interactive: true
          });
          $(this).find('rect').css('fill', '#ecf0f1');
          d3.select(this).select("text.name").style({opacity: '1.0'});
        });

      blips.append('line')
        .attr('class', 'direction')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', function (d) {
          return d.dx;
        })
        .attr('y2', function (d) {
          return d.dy;
        });

      blips.append('circle')
        .style("fill", function (d) {
          var colorTypes = ['white', '#2ECC71', '#2980B9', '#3498DB', '#2C3E50'];
          return colorTypes[d.important - 1];
        })
        .attr('r', function (d) {
          var usageMap = [5, 7, 9, 11, 13];
          return usageMap[d.usage - 1]  + 'px';
        })
      ;

      blips.append("text")
        .attr("dy", "20px")
        .style("text-anchor", "middle")
        .attr('class', 'name')
        .text(function (d) {
          return d.name;
        });
    }

    draw_radar();
  }

  return {
    renderPage: renderPage
  };
});
