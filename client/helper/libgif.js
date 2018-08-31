/* eslint-disable */
class Stream {
  constructor(data) {
    this.data = data;
    this.pos = 0;

  }

  readByte() {
    if (this.data.length <= 0) {
      throw new Error('Attempted to read past end of stream.');
    }
    if (this.data instanceof Uint8Array) {
      return this.data[ this.pos++ ];
    }
    return this.data.charCodeAt(this.pos++) & 0xFF;
  }

  readBytes(n) {
    const bytes = [];
    for (let i = 0; i < n; i++) {
      bytes.push(this.readByte());
    }
    return bytes;
  }

  read(n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      s += String.fromCharCode(this.readByte());
    }
    return s;
  }

  readUnsigned() { // Little-endian.
    const a = this.readBytes(2);
    return (a[ 1 ] << 8) + a[ 0 ];
  }

}

const bitsToNum = ba => {
  return ba.reduce((s, n) => {
    return s * 2 + n;
  }, 0);
};

const byteToBitArr = bite => {
  const a = [];
  for (let i = 7; i >= 0; i--) {
    a.push(!!(bite & (1 << i)));
  }
  return a;
};

const lzwDecode = (minCodeSize, data) => {
  // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
  let pos = 0; // Maybe this streaming thing should be merged with the Stream?
  const readCode = function(size) {
    let code = 0;
    for (let i = 0; i < size; i++) {
      if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
        code |= 1 << i;
      }
      pos++;
    }
    return code;
  };

  const output = [];

  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  let codeSize = minCodeSize + 1;

  let dict = [];

  const clear = () => {
    dict = [];
    codeSize = minCodeSize + 1;
    for (let i = 0; i < clearCode; i++) {
      dict[ i ] = [ i ];
    }
    dict[ clearCode ] = [];
    dict[ eoiCode ] = null;

  };

  let code;
  let last;

  while (true) {
    last = code;
    code = readCode(codeSize);

    if (code === clearCode) {
      clear();
      continue;
    }
    if (code === eoiCode) break;

    if (code < dict.length) {
      if (last !== clearCode) {
        dict.push(dict[ last ].concat(dict[ code ][ 0 ]));
      }
    } else {
      if (code !== dict.length) throw new Error('Invalid LZW code.');
      dict.push(dict[ last ].concat(dict[ last ][ 0 ]));
    }
    output.push.apply(output, dict[ code ]);

    if (dict.length === (1 << codeSize) && codeSize < 12) {
      // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
      codeSize++;
    }
  }

  // I don't know if this is technically an error, but some GIFs do it.
  // if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
  return output;
};

const parseGIF = (st, handler) => {
  handler || (handler = {});

  // LZW (GIF-specific)
  const parseCT = function(entries) { // Each entry is 3 bytes, for RGB.
    const ct = [];
    for (let i = 0; i < entries; i++) {
      ct.push(st.readBytes(3));
    }
    return ct;
  };

  const readSubBlocks = function() {
    let size,
      data;
    data = '';
    do {
      size = st.readByte();
      data += st.read(size);
    } while (size !== 0);
    return data;
  };

  const parseHeader = function() {
    const hdr = {};
    hdr.sig = st.read(3);
    hdr.ver = st.read(3);
    if (hdr.sig !== 'GIF') throw new Error('Not a GIF file.'); // XXX: This should probably be handled more nicely.
    hdr.width = st.readUnsigned();
    hdr.height = st.readUnsigned();

    const bits = byteToBitArr(st.readByte());
    hdr.gctFlag = bits.shift();
    hdr.colorRes = bitsToNum(bits.splice(0, 3));
    hdr.sorted = bits.shift();
    hdr.gctSize = bitsToNum(bits.splice(0, 3));

    hdr.bgColor = st.readByte();
    hdr.pixelAspectRatio = st.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    if (hdr.gctFlag) {
      hdr.gct = parseCT(1 << (hdr.gctSize + 1));
    }
    handler.hdr && handler.hdr(hdr);
  };

  const parseExt = function(block) {
    const parseGCExt = function(block) {
      const blockSize = st.readByte(); // Always 4
      const bits = byteToBitArr(st.readByte());
      block.reserved = bits.splice(0, 3); // Reserved; should be 000.
      block.disposalMethod = bitsToNum(bits.splice(0, 3));
      block.userInput = bits.shift();
      block.transparencyGiven = bits.shift();

      block.delayTime = st.readUnsigned();
      block.transparencyIndex = st.readByte();

      block.terminator = st.readByte();

      handler.gce && handler.gce(block);
    };

    const parseComExt = function(block) {
      block.comment = readSubBlocks();
      handler.com && handler.com(block);
    };

    const parsePTExt = function(block) {
      // No one *ever* uses this. If you use it, deal with parsing it yourself.
      const blockSize = st.readByte(); // Always 12
      block.ptHeader = st.readBytes(12);
      block.ptData = readSubBlocks();
      handler.pte && handler.pte(block);
    };

    const parseAppExt = function(block) {
      const parseNetscapeExt = function(block) {
        const blockSize = st.readByte(); // Always 3
        block.unknown = st.readByte(); // ??? Always 1? What is this?
        block.iterations = st.readUnsigned();
        block.terminator = st.readByte();
        handler.app && handler.app.NETSCAPE && handler.app.NETSCAPE(block);
      };

      const parseUnknownAppExt = function(block) {
        block.appData = readSubBlocks();
        // FIXME: This won't work if a handler wants to match on any identifier.
        handler.app && handler.app[ block.identifier ] && handler.app[ block.identifier ](block);
      };

      const blockSize = st.readByte(); // Always 11
      block.identifier = st.read(8);
      block.authCode = st.read(3);
      switch (block.identifier) {
        case 'NETSCAPE':
          parseNetscapeExt(block);
          break;
        default:
          parseUnknownAppExt(block);
          break;
      }
    };

    const parseUnknownExt = function(block) {
      block.data = readSubBlocks();
      handler.unknown && handler.unknown(block);
    };

    block.label = st.readByte();
    switch (block.label) {
      case 0xF9:
        block.extType = 'gce';
        parseGCExt(block);
        break;
      case 0xFE:
        block.extType = 'com';
        parseComExt(block);
        break;
      case 0x01:
        block.extType = 'pte';
        parsePTExt(block);
        break;
      case 0xFF:
        block.extType = 'app';
        parseAppExt(block);
        break;
      default:
        block.extType = 'unknown';
        parseUnknownExt(block);
        break;
    }
  };

  const parseImg = function(img) {
    const deinterlace = function(pixels, width) {
      // Of course this defeats the purpose of interlacing. And it's *probably*
      // the least efficient way it's ever been implemented. But nevertheless...
      const newPixels = new Array(pixels.length);
      const rows = pixels.length / width;
      const cpRow = function(toRow, fromRow) {
        const fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
        newPixels.splice.apply(newPixels, [ toRow * width, width ].concat(fromPixels));
      };

      // See appendix E.
      const offsets = [ 0, 4, 2, 1 ];
      const steps = [ 8, 8, 4, 2 ];

      let fromRow = 0;
      for (let pass = 0; pass < 4; pass++) {
        for (let toRow = offsets[ pass ]; toRow < rows; toRow += steps[ pass ]) {
          cpRow(toRow, fromRow);
          fromRow++;
        }
      }

      return newPixels;
    };

    img.leftPos = st.readUnsigned();
    img.topPos = st.readUnsigned();
    img.width = st.readUnsigned();
    img.height = st.readUnsigned();

    const bits = byteToBitArr(st.readByte());
    img.lctFlag = bits.shift();
    img.interlaced = bits.shift();
    img.sorted = bits.shift();
    img.reserved = bits.splice(0, 2);
    img.lctSize = bitsToNum(bits.splice(0, 3));

    if (img.lctFlag) {
      img.lct = parseCT(1 << (img.lctSize + 1));
    }

    img.lzwMinCodeSize = st.readByte();

    const lzwData = readSubBlocks();

    img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData);

    if (img.interlaced) { // Move
      img.pixels = deinterlace(img.pixels, img.width);
    }

    handler.img && handler.img(img);
  };

  var parseBlock = function() {
    const block = {};
    block.sentinel = st.readByte();

    switch (String.fromCharCode(block.sentinel)) { // For ease of matching
      case '!':
        block.type = 'ext';
        parseExt(block);
        break;
      case ',':
        block.type = 'img';
        parseImg(block);
        break;
      case ';':
        block.type = 'eof';
        handler.eof && handler.eof(block);
        break;
      default:
        throw new Error('Unknown block: 0x' + block.sentinel.toString(16)); // TODO: Pad this with a 0.
    }

    if (block.type !== 'eof') setTimeout(parseBlock, 0);
  };

  const parse = function() {
    parseHeader();
    setTimeout(parseBlock, 0);
  };

  parse();
};

class SuperGif {
  /**
   * @param {object} opts 配置对象
   * container      dom容器
   * loop_mode      Optional. Setting this to false will force disable looping of the gif.
   * auto_play      Optional. Same as the rel:auto_play attribute above, this arg overrides the img tag info.
   * max_width      Optional. Scale images over max_width down to max_width. Helpful with mobile.
   * on_end        Optional. Add a callback for when the gif reaches the end of a single loop (one iteration). The first argument passed will be the gif HTMLElement.
   * loop_delay      Optional. The amount of time to pause (in ms) after each single loop (iteration).
   * draw_while_loading  Optional. Determines whether the gif will be drawn to the canvas whilst it is loaded.
   * show_progress_bar  Optional. Only applies when draw_while_loading is set to true.
   */
  constructor(opts) {
    const options = {
      // viewport position
      vp_l: 0,
      vp_t: 0,
      vp_w: null,
      vp_h: null,
      // canvas sizes
      c_w: null,
      c_h: null,
    };
    for (const i in opts) {
      options[ i ] = opts[ i ];
    }
    if (options.vp_w && options.vp_h) options.is_vp = true;

    let stream;
    let hdr;

    let loadError = null;
    let loading = false;

    let transparency = null;
    let delay = null;
    let disposalMethod = null;
    let disposalRestoreFromIdx = null;
    let lastDisposalMethod = null;
    let frame = null;
    let lastImg = null;

    let playing = true;
    const forward = true;

    let ctx_scaled = false;

    let frames = [];
    const frameOffsets = []; // elements have .x and .y properties

    const container = options.container;
    if (typeof options.auto_play === 'undefined') {
      options.auto_play = 0;
    }

    const onEndListener = (options.hasOwnProperty('on_end') ? options.on_end : null);
    const onPlayListener = (options.hasOwnProperty('on_play') ? options.on_play : null);
    const loopDelay = (options.hasOwnProperty('loop_delay') ? options.loop_delay : 0);
    const overrideLoopMode = (options.hasOwnProperty('loop_mode') ? options.loop_mode : 'auto');
    let drawWhileLoading = (options.hasOwnProperty('draw_while_loading') ? options.draw_while_loading : true);
    const showProgressBar = drawWhileLoading ? (options.hasOwnProperty('show_progress_bar') ? options.show_progress_bar : true) : false;
    const progressBarHeight = (options.hasOwnProperty('progressbar_height') ? options.progressbar_height : 25);
    const progressBarBackgroundColor = (options.hasOwnProperty('progressbar_background_color') ? options.progressbar_background_color : 'rgba(255,255,255,0.4)');
    const progressBarForegroundColor = (options.hasOwnProperty('progressbar_foreground_color') ? options.progressbar_foreground_color : 'rgba(255,0,22,.8)');

    const clear = function() {
      transparency = null;
      delay = null;
      lastDisposalMethod = disposalMethod;
      disposalMethod = null;
      frame = null;
    };

    // XXX: There's probably a better way to handle catching exceptions when
    // callbacks are involved.
    const doParse = function() {
      try {
        parseGIF(stream, handler);
      } catch (err) {
        doLoadError('parse');
      }
    };

    const setSizes = function(w, h) {
      canvas.width = w * get_canvas_scale();
      canvas.height = h * get_canvas_scale();
      addItemCanvas.width = canvas.width;
      addItemCanvas.height = canvas.height;
      toolbar.style.minWidth = (w * get_canvas_scale()) + 'px';

      tmpCanvas.width = w;
      tmpCanvas.height = h;
      tmpCanvas.style.width = w + 'px';
      tmpCanvas.style.height = h + 'px';
      tmpCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
    };

    const setFrameOffset = function(frame, offset) {
      if (!frameOffsets[ frame ]) {
        frameOffsets[ frame ] = offset;
        return;
      }
      if (typeof offset.x !== 'undefined') {
        frameOffsets[ frame ].x = offset.x;
      }
      if (typeof offset.y !== 'undefined') {
        frameOffsets[ frame ].y = offset.y;
      }
    };

    const doShowProgress = function(pos, length, draw) {
      if (draw && showProgressBar) {
        let height = progressBarHeight;
        let left,
          mid,
          top,
          width;
        if (options.is_vp) {
          if (!ctx_scaled) {
            top = (options.vp_t + options.vp_h - height);
            height = height;
            left = options.vp_l;
            mid = left + (pos / length) * options.vp_w;
            width = canvas.width;
          } else {
            top = (options.vp_t + options.vp_h - height) / get_canvas_scale();
            height = height / get_canvas_scale();
            left = (options.vp_l / get_canvas_scale());
            mid = left + (pos / length) * (options.vp_w / get_canvas_scale());
            width = canvas.width / get_canvas_scale();
          }
          // some debugging, draw rect around viewport
          if (false) {
            if (!ctx_scaled) {
              var l = options.vp_l,
                t = options.vp_t;
              var w = options.vp_w,
                h = options.vp_h;
            } else {
              var l = options.vp_l / get_canvas_scale(),
                t = options.vp_t / get_canvas_scale();
              var w = options.vp_w / get_canvas_scale(),
                h = options.vp_h / get_canvas_scale();
            }
            ctx.rect(l, t, w, h);
            ctx.stroke();
          }
        } else {
          top = (canvas.height - height) / (ctx_scaled ? get_canvas_scale() : 1);
          mid = ((pos / length) * canvas.width) / (ctx_scaled ? get_canvas_scale() : 1);
          width = canvas.width / (ctx_scaled ? get_canvas_scale() : 1);
          height /= ctx_scaled ? get_canvas_scale() : 1;
        }

        ctx.fillStyle = progressBarBackgroundColor;
        ctx.fillRect(mid, top, width - mid, height);

        ctx.fillStyle = progressBarForegroundColor;
        ctx.fillRect(0, top, mid, height);
      }
    };

    var doLoadError = function(originOfError) {
      const drawError = function() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, options.c_w ? options.c_w : hdr.width, options.c_h ? options.c_h : hdr.height);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.moveTo(0, 0);
        ctx.lineTo(options.c_w ? options.c_w : hdr.width, options.c_h ? options.c_h : hdr.height);
        ctx.moveTo(0, options.c_h ? options.c_h : hdr.height);
        ctx.lineTo(options.c_w ? options.c_w : hdr.width, 0);
        ctx.stroke();
      };

      loadError = originOfError;
      hdr = {
        width: container.width,
        height: container.height,
      }; // Fake header.
      frames = [];
      drawError();
    };

    const doHdr = function(_hdr) {
      hdr = _hdr;
      setSizes(hdr.width, hdr.height);
    };

    const doGCE = function(gce) {
      pushFrame();
      clear();
      transparency = gce.transparencyGiven ? gce.transparencyIndex : null;
      delay = gce.delayTime;
      disposalMethod = gce.disposalMethod;
      // We don't have much to do with the rest of GCE.
    };

    var pushFrame = function() {
      if (!frame) return;
      frames.push({
        data: frame.getImageData(0, 0, hdr.width, hdr.height),
        delay,
      });
      frameOffsets.push({ x: 0, y: 0 });
    };

    const doImg = function(img) {
      if (!frame) frame = tmpCanvas.getContext('2d');

      const currIdx = frames.length;

      // ct = color table, gct = global color table
      const ct = img.lctFlag ? img.lct : hdr.gct; // TODO: What if neither exists?

      /*
      Disposal method indicates the way in which the graphic is to
      be treated after being displayed.

      Values :    0 - No disposal specified. The decoder is
                      not required to take any action.
                  1 - Do not dispose. The graphic is to be left
                      in place.
                  2 - Restore to background color. The area used by the
                      graphic must be restored to the background color.
                  3 - Restore to previous. The decoder is required to
                      restore the area overwritten by the graphic with
                      what was there prior to rendering the graphic.

                      Importantly, "previous" means the frame state
                      after the last disposal of method 0, 1, or 2.
      */
      if (currIdx > 0) {
        if (lastDisposalMethod === 3) {
          // Restore to previous
          // If we disposed every frame including first frame up to this point, then we have
          // no composited frame to restore to. In this case, restore to background instead.
          if (disposalRestoreFromIdx !== null) {
            frame.putImageData(frames[ disposalRestoreFromIdx ].data, 0, 0);
          } else {
            frame.clearRect(lastImg.leftPos, lastImg.topPos, lastImg.width, lastImg.height);
          }
        } else {
          disposalRestoreFromIdx = currIdx - 1;
        }

        if (lastDisposalMethod === 2) {
          // Restore to background color
          // Browser implementations historically restore to transparent; we do the same.
          // http://www.wizards-toolkit.org/discourse-server/viewtopic.php?f=1&t=21172#p86079
          frame.clearRect(lastImg.leftPos, lastImg.topPos, lastImg.width, lastImg.height);
        }
      }
      // else, Undefined/Do not dispose.
      // frame contains final pixel data from the last frame; do nothing

      // Get existing pixels for img region after applying disposal method
      const imgData = frame.getImageData(img.leftPos, img.topPos, img.width, img.height);

      // apply color table colors
      img.pixels.forEach(function(pixel, i) {
        // imgData.data === [R,G,B,A,R,G,B,A,...]
        if (pixel !== transparency) {
          imgData.data[ i * 4 + 0 ] = ct[ pixel ][ 0 ];
          imgData.data[ i * 4 + 1 ] = ct[ pixel ][ 1 ];
          imgData.data[ i * 4 + 2 ] = ct[ pixel ][ 2 ];
          imgData.data[ i * 4 + 3 ] = 255; // Opaque.
        }
      });

      frame.putImageData(imgData, img.leftPos, img.topPos);

      if (!ctx_scaled) {
        ctx.scale(get_canvas_scale(), get_canvas_scale());
        ctx_scaled = true;
      }

      // We could use the on-page canvas directly, except that we draw a progress
      // bar for each image chunk (not just the final image).
      if (drawWhileLoading) {
        ctx.drawImage(tmpCanvas, 0, 0);
        drawWhileLoading = options.auto_play;
      }

      lastImg = img;
    };

    const player = (function() {
      let i = -1;
      let iterationCount = 0;

      const showingInfo = false;
      const pinned = false;

      /**
       * Gets the index of the frame "up next".
       * @return {number}
       */
      const getNextFrameNo = function() {
        const delta = (forward ? 1 : -1);
        return (i + delta + frames.length) % frames.length;
      };

      const stepFrame = function(amount) { // XXX: Name is confusing.
        i = i + amount;

        putFrame();
      };

      const step = (function() {
        let stepping = false;

        const completeLoop = function() {
          if (onEndListener !== null) {
            onEndListener(container);
          }
          iterationCount++;

          if (overrideLoopMode !== false || iterationCount < 0) {
            doStep();
          } else {
            stepping = false;
            playing = false;
          }
        };

        var doStep = function() {
          stepping = playing;
          if (!stepping) return;

          stepFrame(1);
          let delay = frames[ i ].delay * 10;
          if (!delay) delay = 100; // FIXME: Should this even default at all? What should it be?

          const nextFrameNo = getNextFrameNo();
          if (onPlayListener) {
            onPlayListener(delay);
          }
          if (nextFrameNo === 0) {
            delay += loopDelay;
            setTimeout(completeLoop, delay);
          } else {
            setTimeout(doStep, delay);
          }
        };

        return function() {
          if (!stepping) setTimeout(doStep, 0);
        };
      }());

      var putFrame = function() {
        let offset;
        i = parseInt(i, 10);

        if (i > frames.length - 1) {
          i = 0;
        }

        if (i < 0) {
          i = 0;
        }

        offset = frameOffsets[ i ];

        tmpCanvas.getContext('2d').putImageData(frames[ i ].data, offset.x, offset.y);
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(tmpCanvas, 0, 0);
      };

      const play = function() {
        playing = true;
        step();
      };

      const pause = function() {
        playing = false;
      };


      return {
        init() {
          if (loadError) return;

          if (!(options.c_w && options.c_h)) {
            ctx.scale(get_canvas_scale(), get_canvas_scale());
          }

          if (options.auto_play) {
            step();
          } else {
            i = 0;
            putFrame();
          }
        },
        step,
        play,
        pause,
        playing,
        move_relative: stepFrame,
        current_frame() {
          return i;
        },
        length() {
          return frames.length;
        },
        move_to(frame_idx) {
          i = frame_idx;
          putFrame();
        },
      };
    }());

    const doDecodeProgress = function(draw) {
      doShowProgress(stream.pos, stream.data.length, draw);
    };

    const doNothing = function() {
    };
    /**
     * @param{boolean=} draw Whether to draw progress bar or not; this is not idempotent because of translucency.
     *                       Note that this means that the text will be unsynchronized with the progress bar on non-frames;
     *                       but those are typically so small (GCE etc.) that it doesn't really matter. TODO: Do this properly.
     */
    const withProgress = function(fn, draw) {
      return function(block) {
        fn(block);
        doDecodeProgress(draw);
      };
    };


    var handler = {
      hdr: withProgress(doHdr),
      gce: withProgress(doGCE),
      com: withProgress(doNothing),
      // I guess that's all for now.
      app: {
        // TODO: Is there much point in actually supporting iterations?
        NETSCAPE: withProgress(doNothing),
      },
      img: withProgress(doImg, true),
      eof(block) {
        // toolbar.style.display = '';
        pushFrame();
        doDecodeProgress(false);
        if (!(options.c_w && options.c_h)) {
          canvas.width = hdr.width * get_canvas_scale();
          canvas.height = hdr.height * get_canvas_scale();
        }
        player.init();
        loading = false;
        if (load_callback) {
          load_callback(frames[ 0 ].delay * 10 || 100, container);
        }

      },
    };

    const init = function() {
      container.innerHTML = '';

      const div = document.createElement('div');
      addItemCanvas = document.createElement('canvas');
      addItemCanvas.id = 'addItemCanvas';
      canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
      toolbar = document.createElement('div');

      tmpCanvas = document.createElement('canvas');

      div.width = canvas.width = addItemCanvas.height = container.width;
      div.height = canvas.height = addItemCanvas.height = container.height;
      toolbar.style.minWidth = container.width + 'px';

      div.className = 'jsgif';
      toolbar.className = 'jsgif_toolbar';
      div.appendChild(canvas);
      div.appendChild(addItemCanvas);
      div.appendChild(toolbar);

      container.appendChild(div, container);

      if (options.c_w && options.c_h) setSizes(options.c_w, options.c_h);
      initialized = true;
    };

    var get_canvas_scale = function() {
      let scale;
      if (options.max_width && hdr && hdr.width > options.max_width) {
        scale = options.max_width / hdr.width;
      } else {
        scale = 1;
      }
      return scale;
    };

    let canvas,
      addItemCanvas,
      ctx,
      toolbar,
      tmpCanvas;
    var initialized = false;
    var load_callback = false;

    const load_setup = function(callback) {
      if (loading) return false;
      if (callback) load_callback = callback;
      else load_callback = false;

      loading = true;
      frames = [];
      clear();
      disposalRestoreFromIdx = null;
      lastDisposalMethod = null;
      frame = null;
      lastImg = null;

      return true;
    };

    return {
      // play controls
      play: player.play,
      pause: player.pause,
      move_relative: player.move_relative,
      move_to: player.move_to,

      // getters for instance vars
      get_playing() {
        return playing;
      },
      get_canvas() {
        return canvas;
      },
      get_canvas_scale() {
        return get_canvas_scale();
      },
      get_loading() {
        return loading;
      },
      get_auto_play() {
        return options.auto_play;
      },
      get_length() {
        return player.length();
      },
      get_current_frame() {
        return player.current_frame();
      },
      load(data, callback) {
        if (!load_setup(callback)) return;
        if (!initialized) init();
        stream = new Stream(data);
        setTimeout(doParse, 0);
      },
      set_frame_offset: setFrameOffset,
    };
  }
}

export default SuperGif;
