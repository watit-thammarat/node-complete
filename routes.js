const fs = require('fs');

module.exports = (req, res) => {
  const { url, method } = req;
  if (url === '/') {
    res.write('<html>');
    res.write('<head><title>Enter Message</title></head><body>');
    res.write(
      '<form action="/message" method="post"><input type="text" name="message"><button type="submit">Send</button></form>'
    );
    res.write('</body></html>');
    res.end();
  } else if (url === '/message' && method === 'POST') {
    const body = [];
    req.on('data', chunk => {
      body.push(chunk);
    });
    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const [_, message] = parsedBody.split('=');
      fs.writeFile('message.txt', message, err => {
        if (err) {
          return console.error(err);
        }
        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end();
      });
    });
  } else {
    res.statusCode = 404;
    res.write('<html>');
    res.write('<head><title>Enter Message</title></head><body>');
    res.write('<body><h1>Not Found</h1></body>');
    res.write('</body></html>');
    res.end();
  }
};
