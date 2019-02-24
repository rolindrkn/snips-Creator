/** Using snips.ai voice recognition software to manipulate the LEDs on the Matrix Creator
 * @author: Carlos Chacin
 * @author: Rosalind Ng
 */
// MATRIX functions
var matrix = require(__dirname+'/matrix.js');
// Snips.ai Dependencies
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://' + '127.0.0.1', { port: 1883 });

//snips username
var snipsUserName = 'rolindrkn';

// Snips session end & utter text given
client.snipsRespond = function(payload){
  client.publish('hermes/dialogueManager/endSession', JSON.stringify({
    sessionId: payload.sessionId,
    text: payload.text
  }));
};

// MQTT Topics
var wakeword = 'hermes/hotword/default/detected';
var sessionEnd = 'hermes/dialogueManager/sessionEnded';

//lightState app
var lightState = 'hermes/intent/'+snipsUserName+':lightState';

//smartLight app
var lightIntensity = 'hermes/intent/'+snipsUserName+':lightIntensity';

// On connection to Snips' MQTT server
client.on('connect', function() {
  console.log('Connected to Snips MQTT server\n');
  // Subscribe to each event (MQTT Topic)
	client.subscribe(wakeword);
  client.subscribe(sessionEnd);

  client.subscribe(lightState);
  client.subscribe(lightIntensity);
  
});

//ON data from Snips'  MQTT server
var lightsOn = false;
var smartLightOn = false;

// On data from Snips' MQTT server
client.on('message', function(topic, message) {

  //extract message (convert string to JSON)
  var message = JSON.parse(message);

  switch(topic) {
    // * On Wakeword
    case wakeword:
      matrix.led({blue: 50});
      console.log('Wakeword Detected');
      break;

    case lightState:
      // Turn lights On/Off
      try{
        if (message.slots[0].rawValue === 'on'){
          matrix.led({green: 69});
          lightsOn = true;
          console.log('Lights On');
        }
        else{
          matrix.led({});
          lightsOn = false;
          smartLightOn = false;
          console.log('Lights Off');
        }
        // Snips Response
        client.snipsRespond({
          sessionId: message.sessionId, 
          text: 'I have changed the lights!'
        });
      }
      // Expect error if `on` or `off` is not heard
      catch(e){
        console.log('Did not receive an On/Off state')
      }
    break;

    // * On Conversation End
    case sessionEnd:
      console.log('ending');
      if(smartLightOn) {
        matrix.activate();
      }
      else if(lightsOn){
        matrix.led({green: 69});
      }
      else {
        matrix.led({});
        console.log('Session Ended\n');
      }
    break;
  }
});




