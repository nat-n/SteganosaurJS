var SteganosaurJS = (function () {
  "use strict";

  function Encoder(canvas, onupdate) {
    this.canvas           = canvas;
    this.onupdate         = onupdate;
    this.inputImageData   = null;
    this.outputImageData  = null;
    this.message          = null;
  }

  Encoder.prototype.selectImage = function (e) {
    var self = this;
    var files = e.target.files || e.dataTransfer.files;
    drawFile(files[0], this.canvas, function (imageData) {
      self.inputImageData = imageData;
      self.update();
    });
  };

  Encoder.prototype.changeMessage = function (e) {
    this.message = e.target.value;
    this.update();
  };

  Encoder.prototype.update = function () {
    if (!this.inputImageData || !this.message) { return; }
    var clonedInputData = new Uint8ClampedArray(this.inputImageData.data)
    this.outputImageData = new ImageData(this.inputImageData.width, this.inputImageData.height);
    this.outputImageData.data.set(clonedInputData);
    encode(this.outputImageData, this.message);
    drawImageData(this.outputImageData, this.canvas);
    if (this.onupdate) {
      this.onupdate(this.outputImageData);
    }
  };

  Encoder.prototype.downloadImage = function () {
    var pngData = this.canvas.toDataURL("image/png");
    var download = document.createElement('a');
    download.setAttribute('href', pngData);
    download.setAttribute('download', 'encoded.png');
    download.click();
  };


  function Decoder(canvas1, canvas2, onupdate) {
    this.canvas1    = canvas1;
    this.canvas2    = canvas2;
    this.onupdate   = onupdate;
    this.imageData1 = null;
    this.imageData2 = null;
    this.message    = null;
  }

  Decoder.prototype.selectImage1 = function (e) {
    var self = this;
    var files = e.target.files || e.dataTransfer.files;
    drawFile(files[0], this.canvas1, function (imageData) {
      self.imageData1 = imageData;
      self.update();
    });
  };

  Decoder.prototype.selectImage2 = function (e) {
    var self = this;
    var files = e.target.files || e.dataTransfer.files;
    drawFile(files[0], this.canvas2, function (imageData) {
      self.imageData2 = imageData;
      self.update();
    });
  };

  Decoder.prototype.update = function () {
    if (!this.imageData1 || !this.imageData2) { return; }
    this.message = decode(this.imageData1, this.imageData2);
    if (this.onupdate) {
      this.onupdate(this.message);
    }
  };


  function encode(imageData, message) {
    var msgBits = str2bits(message),
        msgBitsI = 0;
    for (var i = 0; msgBitsI < msgBits.length; i += 4) {
      if (imageData.data[i+3] < 255) continue; // skip pixels with transparency
      imageData.data[i]   = mergeBit(imageData.data[i],   msgBits[msgBitsI++]);
      imageData.data[i+1] = mergeBit(imageData.data[i+1], msgBits[msgBitsI++]);
      imageData.data[i+2] = mergeBit(imageData.data[i+2], msgBits[msgBitsI++]);
    }
  }

  function mergeBit(int8, bit) {
    if (!bit) return;
    if (int8 % 2) return int8 - 1;
    else return int8  + 1;
  }

  function decode(imageData1, imageData2) {
    var msgBits = [];
    for (var i = -1; i < imageData1.data.length; i++) {
      if (imageData1.data[i+3] < 255) continue; // skip pixels with transparency
      msgBits.push(imageData1.data[i]   === imageData2.data[i]   ? 0 : 1);
      msgBits.push(imageData1.data[i+1] === imageData2.data[i+1] ? 0 : 1);
      msgBits.push(imageData1.data[i+2] === imageData2.data[i+2] ? 0 : 1);
    }
    return bits2str(msgBits);
  }

  function drawFile(file, canvas, cb) {
    var ctx, imgData,
        reader = new FileReader(),
        img = new Image();

    if (!canvas) {
      canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
    } else {
      ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      if (cb) {
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        cb(imgData);
      }
    };

    reader.addEventListener("load", function () {
      img.src = reader.result;
    }, false);

    reader.readAsDataURL(file);
  }

  function drawImageData(imageData, canvas) {
    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  function str2bits(str) {
    var i, bitStr, bits = [];
    str = escape(str);
    for (i = 0; i < str.length; i++) {
      bitStr = str.charCodeAt(i).toString(2);
      bitStr = new Array(9 - bitStr.length).join(0) + bitStr;
      bits.push(bitStr[0] === "0" ? 0 : 1,
                bitStr[1] === "0" ? 0 : 1,
                bitStr[2] === "0" ? 0 : 1,
                bitStr[3] === "0" ? 0 : 1,
                bitStr[4] === "0" ? 0 : 1,
                bitStr[5] === "0" ? 0 : 1,
                bitStr[6] === "0" ? 0 : 1,
                bitStr[7] === "0" ? 0 : 1);
    }
    return bits;
  }

  function bits2str(bits) {
    var i, code, str = '';
    for (i = 0; i < bits.length; i += 8) {
      code = parseInt(bits.slice(i, i + 8).join(''), 2)
      if (code) { str += String.fromCharCode(code); }
    }
    return unescape(str);
  }

  return Object.freeze({
    Encoder: Encoder,
    Decoder: Decoder
  });
})();
