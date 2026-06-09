(function () {
  'use strict';

  const canvas = document.getElementById('universe');
  if (!canvas) return;

  const isPostPage = Boolean(document.getElementById('post') && document.getElementById('article-container'));
  if (isPostPage) {
    canvas.style.display = 'none';
    return;
  }

  const requestFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

  if (!requestFrame) return;

  let width = 0;
  let height = 0;
  let starCount = 0;
  let context = null;
  let firstRun = true;
  let stars = [];
  const speed = 0.04;
  const color = '226,225,224';
  const isHome = Boolean(document.getElementById('site-info'));
  const density = isHome ? 0.13 : 0.07;

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function chance(rate) {
    return Math.floor(1000 * Math.random()) + 1 < 10 * rate;
  }

  function Star() {
    this.reset = function () {
      this.giant = chance(3);
      this.comet = !this.giant && !firstRun && chance(isHome ? 7 : 3);
      this.x = random(0, width - 10);
      this.y = random(0, height);
      this.r = random(1.1, 2.5);
      this.dx = random(speed, 6 * speed) + (this.comet ? speed * random(36, 84) : 0) + 0.08;
      this.dy = -random(speed, 6 * speed) - (this.comet ? speed * random(36, 84) : 0);
      this.fadingOut = null;
      this.fadingIn = true;
      this.opacity = 0;
      this.opacityTarget = random(0.18, this.comet ? 0.62 : 0.9);
      this.opacityDelta = random(0.0005, 0.002) + (this.comet ? 0.001 : 0);
    };

    this.fadeIn = function () {
      if (!this.fadingIn) return;
      this.fadingIn = !(this.opacity > this.opacityTarget);
      this.opacity += this.opacityDelta;
    };

    this.fadeOut = function () {
      if (!this.fadingOut) return;
      this.fadingOut = !(this.opacity < 0);
      this.opacity -= this.opacityDelta / 2;
      if (this.x > width || this.y < 0) {
        this.fadingOut = false;
        this.reset();
      }
    };

    this.draw = function () {
      context.beginPath();
      if (this.giant) {
        context.fillStyle = `rgba(180,184,240,${this.opacity})`;
        context.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
      } else if (this.comet) {
        context.fillStyle = `rgba(${color},${this.opacity})`;
        context.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, false);
        for (let index = 0; index < 18; index += 1) {
          context.fillStyle = `rgba(${color},${this.opacity - this.opacity / 18 * index})`;
          context.rect(this.x - this.dx / 4 * index, this.y - this.dy / 4 * index - 2, 2, 2);
          context.fill();
        }
      } else {
        context.fillStyle = `rgba(226,225,142,${this.opacity})`;
        context.rect(this.x, this.y, this.r, this.r);
      }
      context.closePath();
      context.fill();
    };

    this.move = function () {
      this.x += this.dx;
      this.y += this.dy;
      if (this.fadingOut === false) this.reset();
      if (this.x > width - width / 4 || this.y < 0) this.fadingOut = true;
    };

    window.setTimeout(() => {
      firstRun = false;
    }, 50);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    starCount = Math.max(56, Math.floor(width * density));
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    stars = Array.from({ length: starCount }, () => {
      const star = new Star();
      star.reset();
      return star;
    });
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    for (let index = 0; index < stars.length; index += 1) {
      const star = stars[index];
      star.move();
      star.fadeIn();
      star.fadeOut();
      star.draw();
    }
  }

  function tick() {
    if (!document.hidden && document.documentElement.getAttribute('data-theme') === 'dark') {
      draw();
    }
    requestFrame(tick);
  }

  context = canvas.getContext('2d');
  if (!context) return;

  resize();
  window.addEventListener('resize', resize, { passive: true });
  tick();
})();
