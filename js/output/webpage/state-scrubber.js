/* eslint-disable no-var */
/* TODO: Fix the lint errors */
/**
 * StateScrubber
 * Resets the global javascript state in the browser
 * (timeouts, intervals and global variables)
 */
export default class StateScrubber {

    constructor (target) {
        this.target = target;
        this.firstTimeout = target.setTimeout(function() {}, 0);

        // We will record all the variables that we see on window on startup
        // these will be the only keys we leave intact when we reset window
        this.globalVariables = {};
        for (var prop in target) {
            if (target.hasOwnProperty(prop)) {
                this.globalVariables[prop] = true;
            }
        }

        // Since variables initially on window will not be reset, try to freeze them to
        // avoid state leaking between executions.
        /* jshint forin:false */
        Object.keys(this.globalVariables).forEach((prop) => {
            try {
                var propDescriptor =
                    Object.getOwnPropertyDescriptor(target, prop);
                if (!propDescriptor || propDescriptor.configurable) {
                    Object.defineProperty(target, prop, {
                        value: target[prop],
                        writable: false,
                        configurable: false
                    });
                }
            } catch(e) {
                // Couldn't access property for permissions reasons,
                // like window.frame
                // Only happens on prod where it's cross-origin
            }
        });
        // Completely lock down window's prototype chain
        Object.freeze(Object.getPrototypeOf(target));
    }

    clearGlobals () {
        for (var prop in this.target) {
            if (!this.globalVariables[prop] && this.target.hasOwnProperty(prop)) {
                // This should get rid of variables which cannot be deleted
                // http://perfectionkills.com/understanding-delete/
                this.target[prop] = undefined;
                // delete operator throws an error in strict mode,
                // so we use ES6 deleteProperty instead
                Reflect.deleteProperty(this.target, prop);
            }
        }
    }

    clearTimeoutsAndIntervals () {
    	// Intervals are acutally also timeouts under the hood, so clearing all the
    	// timeouts since last time is sufficient.
    	// (If you're interested intervals are timeouts with the repeat flag set to true:
    	// www.w3.org/TR/html5/webappapis.html#timers)
        var lastTimeout = this.target.setTimeout(function() {}, 0);

        for (var i=this.firstTimeout; i<lastTimeout; i++) {
            this.target.clearTimeout(i);
        }

        this.firstTimeout = lastTimeout;
    }

    clearAll () {
        this.clearGlobals();
    	this.clearTimeoutsAndIntervals();
    }
}