(function() {
  var daemon, fs;
  fs = require('fs');
  daemon = require('daemon');
  exports.printStatus = function(st) {
    if (st.pid) {
      console.log('Process running with pid %d.', st.pid);
      return process.exit(0);
    } else if (st.exists) {
      console.log('Pidfile exists, but process is dead.');
      return process.exit(1);
    } else {
      console.log('Not running.');
      return process.exit(3);
    }
  };
  exports.status = function(pidfile, cb) {
    if (cb == null) {
      cb = exports.printStatus;
    }
    return fs.readFile(pidfile, 'utf8', function(err, data) {
      var match, pid;
      if (err) {
        return cb({
          exists: err.code !== 'ENOENT'
        });
      } else if (match = /^\d+/.exec(data)) {
        pid = parseInt(match[0]);
        try {
          process.kill(pid, 0);
          return cb({
            pid: pid
          });
        } catch (e) {
          return cb({
            exists: true
          });
        }
      } else {
        return cb({
          exists: true
        });
      }
    });
  };
  exports.startSucceeded = function(pid) {
    if (pid) {
      return console.log('Process already running with pid %d.', pid);
    } else {
      return console.log('Started.');
    }
  };
  exports.startFailed = function(err) {
    console.log(err);
    return process.exit(1);
  };
  exports.start = function(_arg) {
    var failure, logfile, pidfile, run, start, success;
    pidfile = _arg.pidfile, logfile = _arg.logfile, run = _arg.run, success = _arg.success, failure = _arg.failure;
    success || (success = exports.startSucceeded);
    failure || (failure = exports.startFailed);
    logfile || (logfile = '/dev/null');
    start = function(err) {
      if (err) {
        return failure(err);
      }
      return fs.open(logfile, 'a+', 0666, function(err, fd) {
        var pid;
        if (err) {
          return failure(err);
        }
        success();
        pid = daemon.start(fd);
        daemon.lock(pidfile);
        return run();
      });
    };
    return exports.status(pidfile, function(st) {
      if (st.pid) {
        return success(st.pid, true);
      } else if (st.exists) {
        return fs.unlink(pidfile, start);
      } else {
        return start();
      }
    });
  };
  exports.stopped = function(killed) {
    if (killed) {
      console.log('Stopped.');
    } else {
      console.log('Not running.');
    }
    return process.exit(0);
  };
  exports.hardKiller = function(timeout) {
    if (timeout == null) {
      timeout = 2000;
    }
    return function(pid, cb) {
      var signals, tryKill;
      signals = ['TERM', 'INT', 'QUIT', 'KILL'];
      tryKill = function() {
        var sig;
        sig = "SIG" + signals[0];
        try {
          process.kill(pid, sig);
          if (signals.length > 1) {
            signals.shift();
          }
          return setTimeout((function() {
            return tryKill(sig);
          }), timeout);
        } catch (e) {
          return cb(signals.length < 4);
        }
      };
      return tryKill();
    };
  };
  exports.softKiller = function(timeout) {
    if (timeout == null) {
      timeout = 2000;
    }
    return function(pid, cb) {
      var sig, tryKill;
      sig = "SIGTERM";
      tryKill = function() {
        var first;
        try {
          process.kill(pid, sig);
          console.log("Waiting for pid " + pid);
          if (sig !== 0) {
            sig = 0;
          }
          first = false;
          return setTimeout(tryKill, timeout);
        } catch (e) {
          return cb(sig === 0);
        }
      };
      return tryKill();
    };
  };
  exports.stop = function(pidfile, cb, killer) {
    if (cb == null) {
      cb = exports.stopped;
    }
    if (killer == null) {
      killer = exports.hardKiller(2000);
    }
    return exports.status(pidfile, function(_arg) {
      var pid;
      pid = _arg.pid;
      if (pid) {
        return killer(pid, function(killed) {
          return fs.unlink(pidfile, function() {
            return cb(killed);
          });
        });
      } else {
        return cb(false);
      }
    });
  };
  exports.simple = function(_arg) {
    var command, killer, logfile, pidfile, run, start;
    pidfile = _arg.pidfile, logfile = _arg.logfile, command = _arg.command, run = _arg.run, killer = _arg.killer;
    command || (command = process.argv[2]);
    killer || (killer = null);
    start = function() {
      return exports.start({
        pidfile: pidfile,
        logfile: logfile,
        run: run
      });
    };
    switch (command) {
      case 'start':
        return start();
      case 'stop':
        return exports.stop(pidfile, null, killer);
      case 'status':
        return exports.status(pidfile);
      case 'restart':
      case 'force-reload':
        return exports.stop(pidfile, start, killer);
      case 'try-restart':
        return exports.stop(pidfile, function(killed) {
          if (killed) {
            return exports.start({
              pidfile: pidfile,
              logfile: logfile,
              run: run
            });
          } else {
            console.log('Not running.');
            return process.exit(1);
          }
        });
      default:
        console.log('Command must be one of: ' + 'start|stop|status|restart|force-reload|try-restart');
        return process.exit(1);
    }
  };
}).call(this);
