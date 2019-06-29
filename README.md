# node-printer-escpos
node-printer-escpos

# example
<pre>
<code>
const Printer = require('./main')
const { esc, Image, getPixels, getPrinters } = Printer

let usbPrinter = getPrinters().find(p => {
  return p.portName === 'USB001'
})
const printer = new Printer(usbPrinter.name)
</code>
</pre>

# print text
<pre>
<code>
esc.init().text('这里打印第一行吧？123！').flush()
printer.print(esc.buffer._buffer)
</code>
</pre>

# print text、barcode、qrcode
<pre>
<code>
esc
  .init()
  .text('test print qrcode')
  .text('测试下打印二维码')
  .align('CT')
  .barcode('1234567', 'EAN8')
  .qrimage('https://vip.com', function(err){
    this.flush()
    printer.print(this.buffer._buffer)
  })
</code>
</pre>

# print custom image
<pre>
<code>
getPixels('https://b.appsimg.com/upload/momin/2019/02/21/133/1550737570483.png', function(err, pixels) {
  this.image(new Image(pixels))
  this.flush()
  printer.print(esc.buffer._buffer)
})
</code>
</pre>

# thanks


https://github.com/tojocky/node-printer


https://github.com/song940/node-escpos


https://github.com/alexeyten/qr-image


https://github.com/scijs/get-pixels


nd so on/etc.
