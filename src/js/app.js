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
    Settings = require('settings'),
    bulbs = {};

var url = 'http://jorgerdz.github.io/lifxpebble?';

var options = [
  {
    title : 'Toggle'
  },
  {
    title : 'Random Color'
  },
  {
    title : 'White Light',
    subtitle : 'White Heat',
    color : 'hue:0 saturation:0 brightness:1'
  },
  {
    title : 'Western Skyline',
    subtitle : 'Warm Brights',
    color : 'hue:10 saturation:0.3 brightness:0.8'
  },
  {
    title : 'Low Key',
    subtitle : 'Dim & Warm',
    color : 'hue:40 saturation:0.5 brightness:0.4'
  },
  {
    title : 'Blue Flower/Blue Flame',
    subtitle : 'Productive',
    color : 'hue:200 saturation:0.3 brightness:0.9'
  },
  {
    title : 'Sky Blue Sky',
    subtitle : 'Productive',
    color : 'hue:180 saturation:0.4 brightness:1'
  },
  {
    title : 'Pale Green Things',
    subtitle : 'Restful',
    color : 'hue:120 saturation:0.45 brightness:0.9'
  },
  {
    title : 'Channel Orange',
    subtitle : 'Energy',
    color : 'hue:40 saturation:0.7 brightness:0.9'
  },
  {
    title : 'Purple Rain',
    subtitle : 'Creative',
    color : 'hue:220 saturation:0.3 brightness:1'
  },
  {
    title : 'Pink Moon',
    subtitle : 'Calm',
    color : 'hue:300 saturation:0.3 brightness:1'
  },
  {
    title : 'Red House Painters',
    subtitle : 'Emotionally Intense',
    color : 'hue:360 saturation:0.8 brightness:1'
  }
];


if(Settings.option('opt')){
  if(Settings.option('opt').token){
    url += 'token='+Settings.option('opt').token+'&';
  }

  if(Settings.option('opt').default){
    url += 'default='+Settings.option('opt').default;
  }
}else if(Settings.data('token')){
  Settings.option('opt', {token : Settings.data('token'), default : null});
}

Settings.config(
  { url: url },
  function(e) {
    if(e.options.token)
      Settings.option('opt', e.options);

    if(Settings.option('opt') && Settings.option('opt').default){
      openDefaultBulb();
    } else {
      var opt = {token : Settings.option('opt').token,
                default : null};
      Settings.option('opt', opt);
      init();
    }

    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
  }
);

init();
 
//Load bulbs, display "loading" card
function init(){
  if(!Settings.option('opt') || !Settings.option('opt').token){
    noToken();
  }
  else if(Settings.option('opt') && Settings.option('opt').default){
    openDefaultBulb();
  }
  else {
    token = Settings.option('opt').token;
    splashCard = new UI.Card({
      title: "Please Wait",
      body: "Loading LIFX Bulbs..."
    });
    splashCard.show();
    lookForBulbs();
  }
};

function openDefaultBulb(){
  token = Settings.option('opt').token;
  openOptions(Settings.option('opt').default);
};

function noToken(){
  splashCard = new UI.Card({
    title: "No Token",
    body: "You need to enter your token under the app configuration in your Pebble app."
  });
  splashCard.show();
}

function uniq(a) {
  return a.sort().filter(function(item, pos, ary) {
      return !pos || item != ary[pos - 1];
  });
}

//Look for available bulbs, display them
function lookForBulbs(){
  //var auth = btoa() ?  
  ajax({
    url : api + '/lights/all/',
    method : 'GET',
    headers: {
     authorization : 'Basic ' + base64_encode(token + ':' + '')
    },
    type : 'json'
  }, function(response){
    var groups = [];
    bulbs = response;

    bulbs.forEach(function(data){
      data.title = data.label;
      data.subtitle = 'Single Bulb';
      data.type = 'single';
      groups.push(data.group.name);
    });

    groups = uniq(groups);

    groups.forEach(function(data){
      data.title = data;
      bulbs.unshift({title : data, subtitle : 'Group', type : 'group'});
    });

    bulbs.unshift({ title : 'All', type : 'all'});

    bulbsMenu = new UI.Menu({
    sections: [{
        title: 'Available Lights',
        items: bulbs
      }]
    });
    splashCard.hide();
    bulbsMenu.show();

    bulbsMenu.on('select', function(event) {
      openOptions(bulbs[event.itemIndex]);
    });
  }, function(error){
    showError();
  });
};

function openOptions(bulb){
  var optionsMenu = new UI.Menu({
    sections: [{
        title: bulb.title,
        items: options
    }]
  });

  if(bulbsMenu)
    bulbsMenu.hide();

  optionsMenu.show();

  optionsMenu.on('select', function(event){
    if(event.itemIndex == 0)
      toggleBulb(bulb);
    else if(event.itemIndex == 1)
      setToRandomColor(bulb);
    else
      setToColor(bulb, options[event.itemIndex].color);
  });
}

function toggleBulb(bulb){
  var url = api + '/lights/'+getSelector(bulb)+'/toggle';
  ajax({
    url : encodeURI(url),
    method : 'POST',
    headers: {
     authorization : 'Basic ' + base64_encode(token + ':' + '')
    },
    type : 'json'
  }, function(json){ 
    Vibe.vibrate('short');
  }, function(error){
    showError();
  });
}

function setToRandomColor(bulb){
  if(bulb.type == 'group'){
    bulbs.forEach(function(b){
      if(b.group && b.group.name == bulb.title)
        setToColor(b, getRandomColor());
    });
  } else
    setToColor(bulb, getRandomColor());
}

function setToColor(bulb, color){
  var url = api + '/lights/'+getSelector(bulb)+'/color';
  ajax({
    url : encodeURI(url),
    method : 'PUT',
    headers: {
     authorization : 'Basic ' + base64_encode(token + ':' + '')
    },
    type : 'json',
    data : {
      color :color
    }
  }, function(json){ 
    Vibe.vibrate('short');
  }, function(error){
    showError();
  });
}

function getSelector(bulb){
  switch(bulb.type){
    case 'all':
      return 'all';
    case 'single':
      return 'label:'+bulb.title;
    case 'group':
      return 'group:'+bulb.title;
  }
}

function showError(){
  splashCard = new UI.Card({
    title: "Error",
    body: "Something went wrong, make sure your token is correct under the configuration and your selected bulb is online."
  });
  splashCard.show();
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function base64_encode(data) {
  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    enc = '',
    tmp_arr = [];

  if (!data) {
    return data;
  }

  do { // pack three octets into four hexets
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    bits = o1 << 16 | o2 << 8 | o3;

    h1 = bits >> 18 & 0x3f;
    h2 = bits >> 12 & 0x3f;
    h3 = bits >> 6 & 0x3f;
    h4 = bits & 0x3f;

    // use hexets to index into b64, and append result to encoded string
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);

  enc = tmp_arr.join('');

  var r = data.length % 3;

  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}