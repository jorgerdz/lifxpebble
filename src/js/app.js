/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui')
    token = '',
    ajax = require('lib/ajax.js'),
    api = 'https://api.lifx.com/v1beta1',
    bulb = 'all',
    splashCard = '',
    bulbsMenu = '',
    Vibe = require('ui/vibe'),
    Settings = require('settings');

Settings.config(
  { url: 'http://jorgerdz.github.io/lifxpebble/' },
  function(e) {
    // Reset color to red before opening the webview
    Settings.option('color', 'red');
  },
  function(e) {
    // Show the parsed response
    Settings.data('token', e.options.token);

    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
  }
);

init();
 
//Load bulbs, display "loading" card
function init(){
  if(!Settings.data('token'))
    noToken();
  else{
    token = Settings.data('token');
    splashCard = new UI.Card({
      title: "Please Wait",
      body: "Loading LIFX Bulbs..."
    });
    splashCard.show();
    lookForBulbs();
  }
}

function noToken(){
  splashCard = new UI.Card({
    title: "No Token",
    body: "You need to enter your token under the app configuration in your Pebble app."
  });
  splashCard.show();
}

//Look for available bulbs, display them
function lookForBulbs(){
  ajax({
    url : api + '/lights/all/',
    method : 'GET',
    headers: {
     authorization : 'Basic ' + btoa(token + ':' + '')
    },
    type : 'json'
  }, function(bulbs){
    bulbs.unshift({ label : 'All'});

    bulbs.forEach(function(data){
      data.title = data.label,
      data.subtitle = ""
    });
    bulbsMenu = new UI.Menu({
    sections: [{
        title: 'Available Lights',
        items: bulbs
      }]
    });
    splashCard.hide();
    bulbsMenu.show();

    bulbsMenu.on('select', function(event) {
      openOptions(bulbs[event.itemIndex].title);
    });
  }, function(error){
    showError();
  });
}

var options = [
  {
    title : 'Toggle'
  },
  {
    title : 'Random Color'
  },
  {
    title : 'Restful',
    subtitle : 'Green',
    hex : '#8DF791'
  },
  {
    title : 'Productive',
    subtitle : 'Blue',
    hex : '#8997FA'
  },
  {
    title : 'Energy',
    subtitle : 'Orange',
    hex : '#FF7438'
  },
  {
    title : 'Creative',
    subtitle : 'Purple',
    hex : '#8D6EFF'
  },
  {
    title : 'Calm',
    subtitle : 'Pink',
    hex : '#F093FA'
  },
  {
    title : 'Devil\'s Room',
    subtitle : 'Red',
    hex : '#F51D1D'
  }
];

function openOptions(bulb){
  var optionsMenu = new UI.Menu({
    sections: [{
        title: bulb,
        items: options
    }]
  });
  bulbsMenu.hide();
  optionsMenu.show();

  optionsMenu.on('select', function(event){
    if(event.itemIndex == 0)
      toggleBulb(bulb);
    else if(event.itemIndex == 1)
      setToRandomColor(bulb);
    else
      setToColor(bulb, options[event.itemIndex].hex);
  });
}

function toggleBulb(bulb){
  ajax({
    url : api + '/lights/'+getSelector(bulb)+'/toggle',
    method : 'POST',
    headers: {
     authorization : 'Basic ' + btoa(token + ':' + '')
    },
    type : 'json'
  }, function(json){ 
    Vibe.vibrate('short');
  }, function(error){
    showError();
  });
}

function setToRandomColor(bulb){
  setToColor(bulb, getRandomColor());
}

function setToColor(bulb, color){
  ajax({
    url : api + '/lights/'+getSelector(bulb)+'/color',
    method : 'PUT',
    headers: {
     authorization : 'Basic ' + btoa(token + ':' + '')
    },
    type : 'json',
    data : {
      color : color
    }
  }, function(json){ 
    Vibe.vibrate('short');
  }, function(error){
    showError();
  });
}

function getSelector(bulb){
  return (bulb.toLowerCase() == 'all' ? 'all' : 'label:'+bulb);

}

function showError(){
  splashCard = new UI.Card({
    title: "Error",
    body: "Something went wrong, make sure your token is correct under the configuration."
  });
  splashCard.show();
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  console.log(color)
  return color;
}