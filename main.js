const printer = require('printer')
const getPixels = require('get-pixels')
const escpos = require("./index")
const Image = require('./image')
// const esc = new escpos({}, {})

function Printer (printerName) {
  this.jobs = []
  this.printerName = printerName
}

Printer.escpos = escpos
Printer.Image = Image
Printer.getPixels = getPixels
Printer.getPrinters = printer.getPrinters

Printer.prototype.print = function (buffer, orderNumber) {
  let jobsLen = this.jobs.length
  let obj = {
    buffer,
    orderNumber: orderNumber || (jobsLen + '' + parseInt(Math.random() * 100000000)),
    jobId: null,
    errorMsg: null,
    success: false
  }
  this.jobs.push(obj)
  jobsLen === 0 && this.do(obj)
}

Printer.prototype.jobHandler = function (jobObject) {
  let that = this
  let jobId = jobObject.jobId
  let printerName = this.printerName
  let jobInfo = {}
  
  try {
    jobInfo = printer.getJob(printerName, jobId)
    console.log('getjob', jobInfo)
  } catch (e) {
    return complete('print failed')
  }

  let status = jobInfo.status

  if (status.includes('ERROR')) {
    try {
      let cancel = printer.setJob(printerName, jobId, 'CANCEL')
      complete('cancel print')
    } catch(e) {
      complete('print error')
    }    
  } else {
    complete()
  }

  // if (jobInfo.status.length === 0 && jobInfo.time === 0) {
  //   // 未打印 两秒后重新拉取下任务信息
  //   setTimeout(function () {
  //     try {
  //       jobInfo = printer.getJob(printerName, jobId)
  //       console.log('getjob2', jobInfo)
  //       if (jobInfo.status.length === 0 && jobInfo.time === 0) {
  //         // 打印失败，取消队列
  //         let cancel = printer.setJob(printerName, jobId, 'CANCEL')
  //         if (!cancel) console.log('cancel print fail')
  //         complete('cancel print')
  //       } else {
  //         // 打印成功
  //         complete()
  //       }
  //     } catch(e) {
  //       console.log(e)
  //       // 防止重复更新打印状态
  //       if (jobObject.success) return
  //       complete(e.message)
  //     }
  //   }, 2000)
  // } else {
  //   // 打印成功
  //   complete()
  // }

  function complete (error) {
    if (error) {
      jobObject.errorMsg = error
    } else {
      jobObject.success = true
    }
    that.printComplete && that.printComplete(jobObject)
    that.doNext(jobId)
    // console.log('print object', {
    //   orderNumber: jobObject.orderNumber,
    //   jobId: jobObject.jobId,
    //   errorMsg: jobObject.errorMsg,
    //   success: jobObject.success
    // })
  }
}

Printer.prototype.do = function (jobObject) {
  let that = this
  let printerName = that.printerName
  printer.printDirect({
    printer: printerName,
    data: jobObject.buffer,
    type: 'RAW',
    success (jobId) {
      console.log("sent to printer with ID: " + jobId)
      jobObject.jobId = jobId
      that.jobHandler(jobObject)
      that.printStart && that.printStart(jobObject)
    },
    error (error) {
      console.log('print error', error)
      if (typeof error === 'object') error = error.message
      jobObject.errorMsg = error
      that.printComplete && that.printComplete(jobObject)
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