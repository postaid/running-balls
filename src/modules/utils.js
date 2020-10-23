const flush = new Set();
let queued = false;

export function queueFunction (fn) {
	flush.add(fn);
	if (!queued) {
		queued = true;
		queueMicrotask(__flushCallbacks);
	}
}

function __flushCallbacks () {
	queued = false;
	for (const cb of flush) {
		cb();
	}
	flush.clear();
}
