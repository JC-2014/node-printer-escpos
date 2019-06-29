const Printer = require('./main')
const { esc, Image, getPixels, getPrinters } = Printer

let usbPrinter = getPrinters().find(p => {
  return p.portName === 'USB001'
})
const printer = new Printer(usbPrinter.name)

// print text
esc.init().text('这里打印第一行吧？123！').flush()
printer.print(esc.buffer._buffer)

// print text、barcode、qrcode
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

// print custom image
getPixels('https://b.appsimg.com/upload/momin/2019/02/21/133/1550737570483.png', function(err, pixels) {
  esc.image(new Image(pixels))
  esc.flush()
  printer.print(esc.buffer._buffer)
})
