Init
====

Turn your node daemon into an LSB-compatible init script.

For the impatient
-----------------

    init = require('init');

    init.simple({
        pidfile : '/var/run/myprog.pid',
        logfile : '/var/log/myprog.log',
        command : process.argv[3],
        run     : function () {
            doWhateverMyDaemonDoes();
        }
    })

init.simple() doesn't do what I want
------------------------------------
You're in luck (maybe). simple() just makes the easy case easy. See the api
methods below for more flexible ways to use this module.

API
---

### init.start(options)

Starts your service. This function will not return, and takes the following
keyword arguments:

#### pidfile

Required. This should be a path to a file to lock and store the daemon pid in.
If the daemon is already running according to this pidfile, start succeeds
without doing anything.

#### logfile

Path to a file to redirect your daemon's stdout and stderr to. Defaults to
/dev/null.

#### run

Required. A function to be called after daemon setup is complete. Do your
daemon work here.

#### success (pid, wasRunning)

A function to be called when the start action succeeded (already running or
about to daemonize). 'pid' will be the id of the running process, and
'wasRunning' is true if the process was already running.

#### failure(error)

A function to be called if the start action cannot be performed. Error will be
some sort of stringifiable error object. Defaults to init.startFailed.

### init.stop(pidfile, cb, killer)

Stops your service with one of shutdown functions. Default is
`init.hardKiller(2000)`, but you may pass your own.

### init.status(pidfile, cb)

Gets the status of your service. The status is not returned, but rather will
be passed to cb if you provide it (defaults to init.printStatus). It is an
object of the form: { running: true, pid: 3472, exists: true }.

### init.simple(options)

Higher level method that leaves all the callbacks as defaults and dispatches
to calling the right function depending on the string you provide. Takes the
following keyword arguments:

#### pidfile
#### run
#### logfile
As in init.start()

### killer
As in init.stop()

#### command
A string on which to dispatch. Defaults to your program's first argument
(process.argv[2]). Recognized actions are "start", "stop", "restart",
"try-restart", "force-reload", and "status".

#### killer
As in init.stop()

Shutdown functions
-----------------

### init.hardKiller(delay = 2000)

Sends your service TERM, INT, QUIT, in that order (with 2000 ms delays) and
then KILL until the process is no longer running, then calls cb (defaults to
init.stopped). If the process was running, cb's first argument will be true.
This is the default shutdown function.

### init.softKiller(delay = 2000)

Sends your service TERM and waits until it dies with 2000 ms delays. If it is
more important that your service shutdown gracefully (to preserve data
integrity, etc) than that it exits promptly, this is a good choice.


Default Actions
---------------
These functions are the defaults for various callbacks, but you can call them
from your own custom callbacks if you want to augment them instead of
replacing them.

### init.startSucceeded(pid, wasRunning)

Prints "Started with PID n" or "Already running with PID n" and exits with a 0
status code.

### init.startFailed(error)

Prints error and exits with a 1 status code.

### init.stopped(killed)

Prints "Stopped" or "Not running" and exits with a 0 status code.

### init.printStatus (status)

Prints a human-readable message and exits with an LSB-appropriate error code.

Program is running:

    Process is already running with pid N.
    exit 0

Program is dead (exited without removing pid file)

    Pidfile exists, but process is dead.
    exit 2

Program is not running:

    Not running.
    exit 3
