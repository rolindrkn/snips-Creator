/** Connection to the Matrix LED Modules
 * @author: Carlos Chacin
 * @author: Rosalind Ng
 */
// MATRIX Core Dependencies
var zmq = require('zeromq');
var core = require('matrix-protos').matrix_io.malos.v1;
var matrix_ip = '127.0.0.1';
var everloop_base_port = 20021;
var led_count = 35;// # of LEDs on MATRIX device

// - Set MATRIX LEDs to an RGBW color
function led(colors){
  // Create & connect Pusher socket to Base Port
  var configSocket = zmq.socket('push');
  configSocket.connect('tcp://' + matrix_ip + ':' + everloop_base_port);

  // Create an empty Everloop image
  var image = core.io.EverloopImage.create();
  // Set each LED color in Everloop image
  image.led = new Array(led_count).fill(colors);

  // Create MATRIX configuration and add Everloop image
  var config = core.driver.DriverConfig.create({'image': image});
  // Send configuration
  configSocket.send(core.driver.DriverConfig.encode(config).finish());
}

// Export MATRIX functions
module.exports = {
  'led': function(colors){
    led(colors);
  }
}