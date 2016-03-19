
var encoderCanvas = document.getElementById('encoderCanvas');
var encoderTextarea = document.getElementById('encoderTextarea');
var encoderUploader = document.getElementById('encoderUploader');

var decoderCnvs1 = document.getElementById('decoder-canvas-1');
var decoderCnvs2 = document.getElementById('decoder-canvas-2');
var src1Uploader = document.getElementById('file1');
var src2Uploader = document.getElementById('file2');
var reveal = document.getElementById('reveal');

var encodingSuccess = false;

function downloadEncoded() {
  if (encodingSuccess) {
    encoder.downloadImage();
  }
}

var testDecoder = new SteganosaurJS.Decoder(undefined, undefined, function (msg) {
  encodingSuccess = encoder.message === testDecoder.message;
  if (encodingSuccess) {
    document.getElementById('download-btn').disabled = false;
  } else {
    alert("Hmm, looks like something went wrong with encoding this message.")
  }
});

var encoder = new SteganosaurJS.Encoder(encoderCanvas, function () {
  // automatically verify encoding
  testDecoder.imageData1 = encoder.inputImageData;
  testDecoder.imageData2 = encoder.outputImageData;
  testDecoder.update();
});

var decoder = new SteganosaurJS.Decoder(decoderCnvs1, decoderCnvs2, function (msg) {
  reveal.value = msg;
})


encoderUploader.addEventListener('change', function (e) {
  document.getElementById('download-btn').disabled = true;
  encoder.selectImage(e);
});
encoderTextarea.addEventListener('change', function (e) {
  document.getElementById('download-btn').disabled = true;
  encoder.changeMessage(e);
});
src1Uploader.addEventListener('change', decoder.selectImage1.bind(decoder));
src2Uploader.addEventListener('change', decoder.selectImage2.bind(decoder));

function updateTab() {
  if (location.hash === "#decoder") {
    document.getElementById('encoder-tab').classList.remove('active');
    document.getElementById('decoder-tab').classList.add('active');
    document.getElementById('encoder-box').style.display = 'none';
    document.getElementById('decoder-box').style.display = 'block';
  } else {
    document.getElementById('encoder-tab').classList.add('active');
    document.getElementById('decoder-tab').classList.remove('active');
    document.getElementById('encoder-box').style.display = 'block';
    document.getElementById('decoder-box').style.display = 'none';
  }
}

updateTab();
window.addEventListener("hashchange", updateTab, false);
