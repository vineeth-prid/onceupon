const net = require('net');

const client = new net.Socket();
client.connect(6381, '127.0.0.1', function() {
  console.log('Connected to Redis on 6381');
  client.write('PING\r\n');
});

client.on('data', function(data) {
  console.log('Received: ' + data);
  client.destroy();
});

client.on('error', function(err) {
  console.error('Connection error:', err.message);
});
