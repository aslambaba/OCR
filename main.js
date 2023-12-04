(function () {
  'use strict';
  var video = document.querySelector('video');
  var canvas = document.createElement('canvas'); // Create a canvas element for taking snapshots
  var img = document.createElement('img'); // Create an img element for displaying snapshots
  document.getElementById('uploadInput').addEventListener('change', readURL);
  document.getElementById('recgBtn').addEventListener('click', takeSnapshot);
  document.getElementById('btnCameraAccess').addEventListener('click', accessCamera);

  // Specify the highlight area (adjust as needed)
  var highlightArea = document.querySelector('.highlight-area');
  var highlightX = highlightArea.offsetLeft;
  var highlightY = highlightArea.offsetTop;
  var highlightWidth = highlightArea.offsetWidth;
  var highlightHeight = highlightArea.offsetHeight;

  /**
   * Access to camera
   */
  function accessCamera() {
    if (navigator.mediaDevices) {
      // Access the web cam
      navigator.mediaDevices.getUserMedia({ video: true })
        // Permission granted
        .then(function (stream) {
          video.srcObject = stream; // Updated to use srcObject instead of URL.createObjectURL
          document.getElementById('btnCameraAccess').style.display = 'none';
          document.getElementById('recgBtn').style.display = 'block';
        })
        // Permission denied
        .catch(function (error) {
          console.error(error);
          document.body.textContent = 'Could not access the camera. Error: ' + error.name;
        });
    }
  }

  /**
   * Take a still photo of a video
   */
  function takeSnapshot() {

    // use MediaDevices API
    // docs: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

    video.style.display = "inline";
    let context;
    let width = video.offsetWidth,
      height = video.offsetHeight;

    canvas = canvas || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);

    // Crop the image using the highlight area
    var croppedCanvas = cropCanvas(canvas, highlightX, highlightY, highlightWidth, highlightHeight);

    // Display the snapshot on the browser
    // displaySnapshot(croppedCanvas.toDataURL('image/png'));

    // Recognize the cropped image
    recognizeImage(croppedCanvas.toDataURL('image/png'));
 
    // // Display the snapshot on the browser
    // displaySnapshot(canvas.toDataURL('image/png'));

    // recognizeImage(canvas.toDataURL('image/png'));
  }

    /**
   * Crop a canvas to a specified rectangular area
   * @param {HTMLCanvasElement} sourceCanvas - The source canvas to be cropped
   * @param {number} x - X-coordinate of the top-left corner of the rectangular area
   * @param {number} y - Y-coordinate of the top-left corner of the rectangular area
   * @param {number} width - Width of the rectangular area
   * @param {number} height - Height of the rectangular area
   * @returns {HTMLCanvasElement} - The cropped canvas
   */
    function cropCanvas(sourceCanvas, x, y, width, height) {
      var destCanvas = document.createElement('canvas');
      destCanvas.width = width;
      destCanvas.height = height;
      destCanvas.getContext('2d').drawImage(sourceCanvas, x, y, width, height, 0, 0, width, height);
      return destCanvas;
    }

  /**
   * Display the snapshot on the browser
   * @param {string} snapshotSrc - The data URL of the snapshot
   */
  function displaySnapshot(snapshotSrc) {
    // Update or create an img element for displaying snapshots
    img = img || document.createElement('img');
    img.setAttribute('src', snapshotSrc);
    img.setAttribute('width', 500);

    // Append the img element to the result container or any other container you want
    var resultContainer = document.getElementById('confidence');
    resultContainer.innerHTML = ''; // Clear previous content
    resultContainer.appendChild(img);
  }

  /**
   * Read upload image
   */
  function readURL() {
    if (this.files && this.files[0]) {
      let reader = new FileReader();
      reader.onload = function (e) {
        img = document.querySelector('img') || document.createElement('img');
        img.setAttribute('src', e.target.result);
        img.setAttribute('width', 500);
        recognizeImage(e.target.result);
      }
      reader.readAsDataURL(this.files[0]);
    }
  }

  /**
   * Recognize image src via Tesseract
   * @param {string} image - The data URL of the image
   */
  function recognizeImage(image) {
    Tesseract.recognize(image)
      .progress(message => document.getElementById('result').innerHTML = "<h3>Recognizing..</h3>")
      .then(function (result) {
        const filtered = filter_card(result.text);

        // Create a span element with the filtered words
        const card_result = `<p><strong>Card : ${filtered}</strong></p>`;
        document.getElementById('result').innerHTML += card_result;
        // document.getElementById('confidence').innerHTML = `Recognition confidence: ${result.confidence}`;
      })
      .catch(err => console.error(err))
  }

  /**
   * Filter the card text
   * @param {string} text - The text to filter
   * @returns {string} - The filtered text
   */
  function filter_card(text) {
    console.log(text);
    // Remove any non-alphanumeric characters and spaces
    const filteredText = text.replace(/[^a-zA-Z0-9]/g, '');

    // Extract the first two letters
    const firstTwoLetters = filteredText.substring(0, 2);

    // Check if the first two letters are alphanumeric
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    const isValid = alphanumericRegex.test(firstTwoLetters);

    // Return the valid result or handle as needed
    return isValid ? firstTwoLetters : 'Invalid';
  }

})();
