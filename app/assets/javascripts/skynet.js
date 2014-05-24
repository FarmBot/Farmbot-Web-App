function skynet (config, cb) {
  if (!cb && typeof config === 'function') {
    cb = config
    config = {}
  }

  function loadScript(url, callback)
  {
      // Adding the script tag to the head as suggested before
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;

      // Then bind the event to the callback function.
      // There are several events for cross browser compatibility.
      script.onreadystatechange = callback;
      script.onload = callback;

      // Fire the loading
      head.appendChild(script);
  }

  var authenticate = function() {

      var socket = io.connect(config.host || "http://skynet.im", {
          port: config.port || 80
      });

      socket.on('connect', function(){
        console.log('Requesting websocket connection to Skynet');

        socket.on('identify', function(data){
          console.log('Websocket connecting to Skynet with socket id: ' + data.socketid);
          //console.log('Sending device uuid: ' + config.uuid);
          if (config.uuid && config.token) socket.emit('identity', {uuid: config.uuid, socketid: data.socketid, token: config.token});
          else socket.emit('register', config, function (ident) {
            config = ident
            socket.emit('identity', {uuid: config.uuid, socketid: data.socketid, token: config.token});
            console.log(config)
          })
        });

        socket.on('notReady', function(data){
          cb(new Error('Authentication Error'), socket);
        });
        socket.on('ready', function(data){
          // cb(null, socket);
          cb(null, socket, data);
        });

      });

  };

  loadScript("//skynet.im/socket.io/socket.io.js", authenticate);
};