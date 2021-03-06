const TICK_HEIGHT = 6;
const TICK_WIDTH = 2;
const AXIS_COLOR = 'transparent';
const TICK_COLOR = "white";
window.__timeSlider = {
  callbacks: {},
  timer: null,
  current: 0,
  from: 0,
  to: 0,
  nIntervals: 15,
  transformFn: null,
  init: function(elm, from, to, current, nIntervals) {
    this.current = +current;
    this.nIntervals = nIntervals
    this.from = +from;
    this.to = +to;

    let p = d3.select(elm);
    let button = p.append("div");
    button.attr("class", "play-btn").on('click', () => {
      if (this.timer) this.pause();
      else this.play(1000, 6 * 60 * 60 * 1000);
    });
    button.html(`<div class='icon'>
                    <span class='font-icon-play'></span>
                </div>`);
    let slider = p.append('div');
    slider.attr("class", 'slider');
    slider.append('div').attr('class', 'slider-bg');
    let steps = slider.append('div').attr('class', 'slider-step');
    steps.on('click', (evt) => {
      this.current = +this.transformFn.invert(evt.offsetX);
      this.update();
    });
    let cuePoint = slider.append('div').attr('class', 'slider-run');
    let timeLabel = cuePoint.append('div').attr('class', 'point-drag').append('div').attr('class', 'time-label');
    let dragger = d3.drag().on("start", (evt) => {console.log('started', evt)})
            .on("drag", (evt) => cuePoint.style('width', evt.x))
            .on("end", evt => console.log("end", evt));
    cuePoint.select('.point-drag').call(dragger);
    console.log(steps.node().clientWidth)
    let svg = steps.append('svg').attr('width', steps.node().clientWidth)
                      .attr('height', '20px')
                      .style('overflow', 'visible');
    this.update();
  },
  update: function() {
    let slider = d3.select('.slider');
    let steps = d3.select('.slider-step');
    let button = d3.select('.play-btn span');
    if (this.timer === null) {
      button.attr('class', 'font-icon-play');
    }
    else {
      button.attr('class', 'font-icon-pause');
    }
    steps.selectAll('g').remove();
    let cuePoint = slider.select('.slider-run');
    let timeLabel = slider.select('.time-label');
    
    let sF = d3.scaleTime().domain([this.from, this.to]).range([0, steps.node().clientWidth]);
    this.transformFn = sF;
    let ticks = sF.ticks(this.nIntervals);
    let axis = d3.axisBottom().scale(sF).tickValues(ticks).tickSize(TICK_HEIGHT);
    let svg = steps.select('svg');
    svg.append('g').call(axis);
    svg.selectAll('.tick text').attr('fill', function(d) {
      let date = new Date(d);
      if (date.getHours() === 0) return '#000'
      return '#00000080';
    });
    svg.selectAll('.tick text').attr('dy', 12);
    svg.selectAll('.domain').attr('stroke', AXIS_COLOR);
    svg.selectAll('.tick line').attr('stroke', TICK_COLOR);
    svg.selectAll('.tick line').attr('stroke-width', TICK_WIDTH);
    cuePoint.style('width', sF(this.current) + 'px');
    timeLabel.text(new Date(this.current).toLocaleString());
    for (let cb of (this.callbacks['update'] || [])) {
      cb(this.current);
    }
  },
  play: function( delay, timeStep ) {
    console.log("play");
    let doIt = () => {
      if (this.current + timeStep > this.to) {
        this.current = this.to;
        clearTimeout(this.timer);
        this.timer = null;
      }
      else {
        this.current += timeStep;
      }
      this.update();
    }
    this.timer = setInterval(doIt, delay);
    doIt();
  },
  toggle: function() {
    if (this.timer) {
      this.pause();
    }
    else this.play();
  },
  pause: function() {
    console.log("pause");
    clearTimeout(this.timer);
    this.timer = null;
    this.update();
  },
  on: function(eventName, fn) {
    this.callbacks[eventName] = this.callbacks[eventName] || [];
    this.callbacks[eventName].push(fn);
  }
}
document.addEventListener('DOMContentLoaded', function(event) {
  console.log('Time slider');
  let elem = document.querySelector('.slider-container');
  let now = Date.now();
  __timeSlider.on('update', function(datetime) {
    console.log("Time slider updated. param= " + datetime);
  });
  __timeSlider.init(elem, now - 3 * 25 * 60 * 60 * 1000, now + 3 * 25 * 60 * 60 * 1000, now, 15);
});
