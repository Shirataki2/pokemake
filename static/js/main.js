'use strict';
(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const maxUndo = 15;
  const bgColor = '#ffffff';
  const reader = new FileReader();
  let undoStack = [];
  let redoStack = [];
  let size = 8;
  let isErase = false;
  let image = new Image();
  let file;
  let rcolor = '#000000';
  let alpha = 1.0;
  let mouseX = '';
  let mouseY = '';

  function sleep(milli_seconds) {
    return new Promise(resolve => setTimeout(() => {
      resolve();
    }, milli_seconds));
  }
  // 初期化
  ctx.beginPath();
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 395, 395);

  // 描画
  canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1 || e.which === 1) {
      const rect = e.target.getBoundingClientRect();
      const X = ~~(e.clientX - rect.left);
      const Y = ~~(e.clientY - rect.top);
      draw(X, Y);
    }
  }, false);
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length == 1) {
      e.preventDefault();
      let pos = getPosT(e);
      draw(pos.x, pos.y);
    }
  }, false);

  function beforeDraw() {
    redoStack = [];
    if (undoStack.length >= maxUndo) {
      undoStack.pop();
    }
    undoStack.unshift(ctx.getImageData(0, 0, 360, 360));
  }

  canvas.addEventListener('mousedown', (e) => {
    beforeDraw();
    if (e.buttons === 0) {
      let rect = e.target.getBoundingClientRect();
      let X = ~~(e.clientX - rect.left);
      let Y = ~~(e.clientY - rect.top);
      draw(X, Y);
    }
  }, false);
  canvas.addEventListener('touchstart', (e) => {
    beforeDraw();
    if (e.touches.length == 1) {
      e.preventDefault();
      let pos = getPosT(e);
      draw(pos.x, pos.y);
    }
  }, false);


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
    let mX = e.touches[0].clientX - e.target.getBoundingClientRect().left
      + scrollX();
    let mY = e.touches[0].clientY - e.target.getBoundingClientRect().top + scrollY();
    return {
      'x': mX,
      'y': mY
    };
  }

  function drawEnd() {
    mouseX = '';
    mouseY = '';
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
    ctx.lineWidth = size;
    ctx.strokeStyle = isErase ? bgColor : rcolor;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    mouseX = X;
    mouseY = Y;
  };

  // 操作
  $('.menu')
    .on('click', (e) => {
      rcolor = '#' + e.target.id;
      $('.menu').removeClass('col-active');
      $(`#${e.target.id}`).addClass('col-active');
    });

  $('div.tool').on('click', (e) => {
    let ctl = e.target.className.split(' ').slice(-1)[0].split('-');
    if (ctl[0] === 'width') {
      $('.w').removeClass('tool-active');
      $('.w').addClass('tool-inactive');
      $(`.w.width-${~~ctl[1]}`).addClass('tool-active');
      $(`.w.width-${~~ctl[1]}`).removeClass('tool-inactive');
      size = ~~ctl[1];
    }
    if (ctl[0] === 't') {
      if (ctl[1] === 'draw') {
        isErase = false;
        $('.tool.t-erase').removeClass('tool-active');
        $('.tool.t-erase').addClass('tool-inactive');
        $('.tool.t-draw').removeClass('tool-inactive');
        $('.tool.t-draw').addClass('tool-active');
      }
      if (ctl[1] === 'erase') {
        isErase = true;
        $('.tool.t-erase').removeClass('tool-inactive');
        $('.tool.t-erase').addClass('tool-active');
        $('.tool.t-draw').removeClass('tool-active');
        $('.tool.t-draw').addClass('tool-inactive');
      }
      if (ctl[1] === 'delete') {
        if (confirm('すべて消去してもよろしいですか')) {
          beforeDraw();
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, 360, 360);
          ctx.globalAlpha = 1.0;
          $('#name').html('なまえ');
          $('#H').html('0');
          $('#A').html('0');
          $('#B').html('0');
          $('#C').html('0');
          $('#D').html('0');
          $('#S').html('0');
          $('#type-1').html('タイプ');
          $('#type-2').html('タイプ');
        }
      }
    }
    if (ctl[0] === 'p') {
      if (ctl[1] === 'undo') {
        if (undoStack.length > 0) {
          redoStack.unshift(ctx.getImageData(0, 0, 360, 360));
          const undoData = undoStack.shift();
          ctx.putImageData(undoData, 0, 0);
        }
      }
      if (ctl[1] === 'redo') {
        if (redoStack.length > 0) {
          undoStack.unshift(ctx.getImageData(0, 0, 360, 360));
          const redoData = redoStack.shift();
          ctx.putImageData(redoData, 0, 0);
        }
      }
    }
  });

  // 予測
  const btn = $('#predict-btn');

  function toImg() {
    let tmp = document.createElement('canvas');
    tmp.width = 360;
    tmp.height = 360;
    let tmpctx = tmp.getContext('2d');
    tmpctx.drawImage(canvas, 0, 0, 360, 360, 0, 0, 360, 360);
    let img = tmp.toDataURL('image/jpeg');
    return img;
  }
  btn.on('click', () => {
    btn.prop('disabled', true);
    btn.html('計算中．．．');
    $.ajax({
      'url':  'run',
      'type': 'POST',
      'data': JSON.stringify({
        'img': toImg()
      }),
      'contentType': 'application/json',
      'dataType':    'json',
    })
      .done((data) => {
        $('#name').html(data.name);
        $('#H').html(data.H);
        $('#A').html(data.A);
        $('#B').html(data.B);
        $('#C').html(data.C);
        $('#D').html(data.D);
        $('#S').html(data.S);
        $('#type-1').html(data['type-1']);
        $('#type-2').html(data['type-2']);
        btn.html('待機中!');

        function reenable() {
          btn.prop('disabled', false);
          btn.html('判定!');
        }
        sleep(3000).then(() => {
          reenable();
        });
      })
      .error(() => {
        btn.removeClass('btn-primary');
        btn.addClass('btn-danger');
        btn.html('エラー発生！');
      });
  });

  // 画像アップロード
  $('input[type=file]').change(() => {
    file = $('input[type=file]').prop('files')[0];
    if (file.type != 'image/jpeg' && file.type != 'image/png') {
      file = null;
      Snackbar.show({
        'text':            '対応している画像ファイル形式ではありません',
        'pos':             'top-center',
        'actionText':      'OK',
        'backgrounfColor': '#e95132',
        'actionTextColor': '#fff0f0',
        'duration':        3000
      });
    }


    reader.onload = (e) => {
      image.onload = () => {
        let w, h;
        const maxSize = 360;
        if (image.width > image.height) {
          w = maxSize;
          h = Math.floor(maxSize * image.height / image.width);
        } else {
          w = Math.floor(maxSize * image.width / image.height);
          h = maxSize;
        }
        beforeDraw();
        const start = [(maxSize - w) / 2, (maxSize - h) / 2];
        ctx.beginPath();
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 395, 395);

        ctx.clearRect(0, 0, 360, 360);
        ctx.drawImage(image, start[0], start[1], w, h);
      };
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
})();