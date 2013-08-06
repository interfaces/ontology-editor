/*global define, d3 */
define(
  [
    'flight/lib/component',
    'jquery',
    'd3',
    'd3chart'
  ],

  function(defineComponent)  {
    'use strict';

    function ontologyVis() {
      var vis
        , color = d3.scale.category10()
        , force = d3.layout.force();

      function init(el, attr) {
        var w = attr.width
          , h = attr.height;

        vis = d3.select(el).append('svg')
          .attr('width', w)
          .attr('height', h);

        force.size([w, h])
          .linkDistance( d3.min([w, h]) / 2 )
          .charge( -(w * 0.8) )
          .start();
      }

      function parent(el) {
        return el.parentNode.__data__;
      }

      function update(evt, d) {
        var d = JSON.parse(d.text)
          , r = 12;

        // adjust edge attributes to work with d3.force
        d.edges.map(function (d) {
          d.source = parseInt(d._inV, 10);
          d.target = parseInt(d._outV, 10);
        });

        var drag = force.drag()
          .on('dragstart', function dragstart(d) {
            d.fixed = true;
            d3.select(this).classed("fixed", true);
          });

        // See modifying a force layout: http://bl.ocks.org/mbostock/1095795
        d.edges.forEach(function(d) { force.links().push(d); });
        d.vertices.forEach(function(d) { force.nodes().push(d); });

        force.stop();

        var link = vis.selectAll('.link')
          .data( force.links(), function(d) { return d._id; } );

        link.exit().remove();

        var linkGroup = link.enter().append('g')
          .attr('class', 'link');

        // enter
        linkGroup.append('line')
          .style('stroke-width', 1)
          .style('stroke', 'black');

        linkGroup.append('text')
          .attr('class', 'linktext');

        // update
        link.selectAll('text')
          .text(function(d) { return parent(this)._label; });

        var node = vis.selectAll('.node')
          .data(force.nodes(), function(d) { return d._id; });

        node.exit().remove();

        var nodeGroup = node.enter().append('g')
          .attr('class', 'node');

        // enter
        nodeGroup.append('circle')
          .attr('r', r);

        nodeGroup.append('title');

        nodeGroup.append('text')
          .attr('class', 'nodetext')
          .attr('x', r)
          .attr('dy', '.35em');
        
        // update
        node.selectAll('circle')
          .style('fill', function(d) { return color(parent(this).group); })
          .call(drag);

        node.selectAll('title')
          .text(function(d) { return parent(this).group; });

        node.selectAll('.nodetext')
          .text(function(d) { return parent(this).name; });

        force.on('tick', function() {
          link.selectAll('line')
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

          link.selectAll('.linktext')
            .attr('dx', function(d) { return (d.source.x + d.target.x)/2; })
            .attr('dy', function(d) { return (d.source.y + d.target.y)/2; });

          node.selectAll('.nodetext')
            .attr('dx', function(d) { return d.x; })
            .attr('dy', function(d) { return d.y; });

          node.selectAll('circle')
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
        });

        force.start();
      }

      this.after('initialize', function() {
        init(this.node, this.attr);
        this.on('#ontologyText', 'textChange', update);
      });

    }

    return defineComponent(ontologyVis);
  }
);
