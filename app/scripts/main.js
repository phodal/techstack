require.config({
  baseUrl: 'app',
  paths: {
    jquery: 'lib/jquery-2.1.3',
    json: 'lib/json',
    d3: 'lib/d3.min',
    text: 'lib/text'
  },
  'shim': {}
});

require(['scripts/render', 'json!data/data.json'], function (render, data) {
  function entry(quadrant, position, direction) {
    return {
      quadrant: quadrant,
      // position is within the total of horizons.
      position: position,
      // angles are fractions of pi/2 (ie of a quadrant)
      position_angle: 0.5,
      // the learning end point with the total of horizons.
      direction: direction,
      // angles are fractions of pi/2 (ie of a quadrant)
      direction_angle: 0.5
    };
  }

  render.renderPage('#radar', {
    horizons: ['discover', 'assess', 'learn', 'use'],
    quadrants: ['languages', 'frameworks', 'tools', 'others'],
    height: 768,
    width: 768,
    data: [
      {
        name: 'd3',
        history: entry('frameworks', 0.8, 0.6)
      },
      {
        name: 'java',
        history: entry('others', 0.3, 0.6)
      }
    ]
  });
});
