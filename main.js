const printer = require('printer')
const getPixels = require('get-pixels')
const escpos = require("./index")
const Image = require('./image')
const esc = new escpos({}, {})

function Printer (printerName) {
  this.jobs = []
  this.printerName = printerName
}

Printer.esc = esc
Printer.Image = Image
Printer.getPixels = getPixels
Printer.getPrinters = printer.getPrinters

Printer.prototype.print = function (buffer) {
  let jobsLen = this.jobs.length
  let obj = {
    buffer,
    jobId: jobsLen + '' + parseInt(Math.random() * 100000),
    error: null,
    completeId: null
  }
  this.jobs.push(obj)
  jobsLen === 0 && this.do(obj)
}

Printer.prototype.do = function (jobObject) {
  let that = this
  printer.printDirect({
    printer: that.printerName,
    data: jobObject.buffer,
    type: 'RAW',
    success (id) {
      console.log("sent to printer with ID: " + id)
      jobObject.completeId = id
      that.doNext(jobObject.jobId)
    },
    error (err) {
      console.log(err)
      jobObject.error = err
      that.doNext(jobObject.jobId)
    }
  })
}

Printer.prototype.doNext = function (jobObjectId) {
  this.updateJobs(jobObjectId)
  this.jobs.length && this.do(this.jobs[0])
}

Printer.prototype.updateJobs = function (jobObjectId) {
  this.jobs = this.jobs.filter(job => {
    return job.jobId !== jobObjectId
  })
}

module.exports = Printer