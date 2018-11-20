(function () {
  const canvas = document.getElementById('mainCanvas');
  const ctx = canvas.getContext('2d');
  let bgColor = '#000000';
  let defColor = '#ffffff';
  let defSize = 15;
  let defAlpha = 1.0;
  let mouseX = '';
  let mouseY = '';
  ctx.beginPath();
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 375, 375);
  canvas.addEventListener('mousemove', onMove, false);
  canvas.addEventListener('touchmove', onMoveMoba, false);
  canvas.addEventListener('mousedown', onClick, false);
  canvas.addEventListener('touchstart', onClickMoba, false);
  canvas.addEventListener('mouseup', drawEnd, false);
  canvas.addEventListener('mouseout', drawEnd, false);
  canvas.addEventListener('touchend', drawEnd, false);

  function scrollX() {
    return document.documentElement.scrollLeft || document.body.scrollLeft;
  }

  function scrollY() {
    return document.documentElement.scrollTop || document.body.scrollTop;
  }

  function getPosT(e) {
    var mX = e.touches[0].clientX - e.target.getBoundingClientRect().left +
      scrollX();
    var mY =
      e.touches[0].clientY - e.target.getBoundingClientRect().top + scrollY();
    return {
      x: mX,
      y: mY
    };
  }

  function onMove(e) {
    if (e.buttons === 1 || e.witch === 1) {
      let rect = e.target.getBoundingClientRect();
      let X = ~~(e.clientX - rect.left);
      let Y = ~~(e.clientY - rect.top);
      //:+1:
      draw(X, Y);
    }
  }

  function onMoveMoba(e) {
    if (e.touches.length == 1) {
      e.preventDefault();
      let pos = getPosT(e);
      draw(pos.x, pos.y);
    }
  }


  function onClick(e) {
    if (e.buttons === 0) {
      let rect = e.target.getBoundingClientRect();
      let X = ~~(e.clientX - rect.left);
      let Y = ~~(e.clientY - rect.top);
      draw(X, Y);
    }
  }

  function onClickMoba(e) {
    if (e.touches.length == 1) {
      e.preventDefault();
      let pos = getPosT(e);
      draw(pos.x, pos.y);
    }
  }

  function draw(X, Y) {
    ctx.beginPath();
    ctx.globalAlpha = 1.0;
    if (mouseX === '') {
      ctx.moveTo(X, Y);
    } else {
      ctx.moveTo(mouseX, mouseY);
    }
    ctx.lineTo(X, Y);
    ctx.lineCap = 'round';
    ctx.lineWidth = defSize;
    ctx.strokeStyle = defColor;
    ctx.globalAlpha = defAlpha;
    ctx.stroke();
    mouseX = X;
    mouseY = Y;
  }

  function drawEnd() {
    mouseX = '';
    mouseY = '';
  }

  let wrange = document.getElementById('lineWidth');
  let wdisplay = document.getElementById('width');
  let wrangeValue = function (wrange, wdisplay) {
    return function (e) {
      wdisplay.innerHTML = wrange.value;
      defSize = wrange.value;
      console.log(ctx);
    }
  }
  wrange.addEventListener('input', wrangeValue(wrange, wdisplay));

  let trange = document.getElementById('lineTransp');
  let tdisplay = document.getElementById('transp');
  let trangeValue = function (trange, tdisplay) {
    return function (e) {
      tdisplay.innerHTML = trange.value;
      defAlpha = trange.value / 255.0;
      console.log(ctx);
    }
  }
  trange.addEventListener('input', trangeValue(trange, tdisplay));

  let menuIcons = document.getElementsByClassName('drawMenu');
  for (let i = 0; i < menuIcons.length; i++) {
    menuIcons[i].addEventListener('click', drawMenu, false);
  }

  function drawMenu() {
    if (this.id.indexOf('draw') + 1) {
      defColor = document.getElementById('color-display').style.color;
    }
    if (this.id.indexOf('erase') + 1) {
      defColor = bgColor;
    }
    if (this.id.indexOf('clear') + 1) {
      if (confirm('すべて消去してもよろしいですか')) {
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 375, 375);
        ctx.globalAlpha = defAlpha;
        defColor = document.getElementById('color-display').style.color;
      }
    }
  }

  function toImg() {
    let tmp = document.createElement('canvas');
    tmp.width = 375;
    tmp.height = 375;
    let tmpctx = tmp.getContext('2d');
    tmpctx.drawImage(canvas, 0, 0, 375, 375, 0, 0, 375, 375);
    let img = tmp.toDataURL('image/jpeg');
    return img;
  }

  $('.predict-btn').on('click', () => {
    $('.resultField').html('予測中...');
    let img = toImg();
    let dic = {
      img: img
    };
    $.ajax({
        url: 'run',
        type: 'POST',
        data: JSON.stringify(dic),
        success: function (dic) {
          console.log(dic)
        },
        error: function (e) {
          console.log(e)
        },
        contentType: 'application/json',
        dataType: 'json',
      })
      .done(function (data) {
        console.log('Successfully Image Posted');
        $('.resultField').html(`予測結果:${data['result']}`)
      })
      .error(function (data) {
        console.log('Error Occured!');
        $('.resultField').html('結果の取得に失敗しました...')
      })
  });

  $('.hidden-draw-tool').on('click', () => {
    let open = document.getElementById('tool-content');
    if (open.className == 'Close') {
      $('#tool-pointer').html('▲')
    } else {
      $('#tool-pointer').html('▼')
    }
    open.className = (open.className == 'Close') ? 'Expand' : 'Close';
  })

  $('.hidden-color-palette')
    .on('click',
      () => {
        let open = document.getElementById('palette-content');
        if (open.className == 'Close') {
          $('#palette-pointer').html('▲')
        } else {
          $('#palette-pointer').html('▼')
        }
        open.className = (open.className == 'Close') ? 'Expand' : 'Close';
      })

  // パレット描画部分
  let palette = document.getElementById('palette');
  let pctx = palette.getContext('2d');
  const pw = palette.width;
  const ph = palette.height;
  let dat = pctx.getImageData(0, 0, pw, ph);
  let arr = dat.data;
  let hue = document.getElementById('hue');

  function hsv2rgb(hue, s, v) {
    let h = hue / 60.0;
    const i = Math.floor(h);
    let r = v;
    let g = v;
    let b = v;
    if (s === 0) {
      r = Math.floor(r * 255);
      g = Math.floor(g * 255);
      b = Math.floor(b * 255);
      return [r, g, b];
    }
    const f = h - Math.floor(h);

    if (i === 1) {
      r *= 1 - s * f;
      b *= 1 - s;
    } else if (i === 2) {
      r *= 1 - s;
      b *= 1 - s * (1 - f);
    } else if (i === 3) {
      g *= 1 - s * f;
      r *= 1 - s;
    } else if (i === 4) {
      g *= 1 - s;
      r *= 1 - s * (1 - f);
    } else if (i === 5) {
      g *= 1 - s;
      b *= 1 - s * f;
    } else {
      g *= 1 - s * (1 - f);
      b *= 1 - s;
    }
    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);
    return [r, g, b];
  }
  $(document)
    .ready(() => {
      updateCanvas(0);
    })

  function updateCanvas(hue) {
    for (let j = 0; j < ph; ++j) {
      for (let i = 0; i < pw; ++i) {
        const base = (j * pw + i) * 4;
        c = hsv2rgb(hue, i / pw, 1 - j / ph);
        arr[base] = c[0];
        arr[base + 1] = c[1];
        arr[base + 2] = c[2];
        arr[base + 3] = 255;
      }
    }
    pctx.putImageData(dat, 0, 0);
  }
  hue.addEventListener('input', () => {
    updateCanvas(hue.value);
  });

  function zeroPadding(num, length) {
    return ('0000000000' + num).slice(-length);
  }

  function colorPick(e) {
    const rect = e.target.getBoundingClientRect();
    const X = ~~(e.clientX - rect.left);
    const Y = ~~(e.clientY - rect.top);
    const pick = arr.slice((Y * pw + X) * 4, (Y * pw + X + 1) * 4);
    const pickr = zeroPadding(pick[0].toString(16), 2);
    const pickg = zeroPadding(pick[1].toString(16), 2);
    const pickb = zeroPadding(pick[2].toString(16), 2);
    const col = `#${pickr}${pickg}${pickb}`;
    defColor = col;
    $('#curcolor-code').html(col);
    const colorDisplay = document.getElementById('color-display');
    colorDisplay.style.color = col;
  }

  palette.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
      colorPick(e);
    }
  }, false);
  palette.addEventListener('mousedown', (e) => {
    colorPick(e);
  }, false);
})();