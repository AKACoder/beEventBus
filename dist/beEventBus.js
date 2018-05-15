(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.beEventBus = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var BE_EVENT_BUS_DEFAULT_NAMESPACE = "BE_EVENT_BUS_DEFAULT_NAMESPACE";

    var eventType = {
        BROADCAST: 0,
        UNICAST: 1,
        MULTICAST: 2

        /***
         *
         * @param namespace
         * @param name
         * @param data
         * @param type
         */
    };var event = function event(namespace, name, data) {
        var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : eventType.BROADCAST;

        this.namespace = namespace;
        this.name = name;
        this.data = data;
        this.type = type;
    };

    /***
     *
     * @param namespace
     * @param type
     * @returns {{newEvent: newEvent}}
     */
    var eventFactory = function eventFactory(namespace) {
        var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : eventType.MULTICAST;

        return {
            newEvent: function newEvent(name, data) {
                return new event(namespace, name, data, type);
            }
        };
    };

    var bus = new function () {
        var eventHandler = function eventHandler(namespace, eventName, action, scope) {
            if (!(action instanceof Function)) {
                return;
            }

            this.namespace = namespace;
            this.eventName = eventName;
            this.action = action;
            this.scope = scope;
        };

        var eventHandlerMap = {};

        function getHandlers(namespace, eventName) {
            if (!eventHandlerMap[namespace]) {
                return null;
            }

            var handlers = eventHandlerMap[namespace][eventName];
            if (!(handlers instanceof Array)) {
                return null;
            }

            if (0 === handlers.length) {
                return null;
            }

            return handlers;
        }

        function sendEvent(handler, data) {
            if (handler.scope instanceof Object) {
                handler.action.call(handler.scope, data);
            } else {
                handler.action(data);
            }
        }

        function sendMultipleEvent(name, handlers, data) {
            for (var i = 0; i < handlers.length; i++) {
                sendEvent(handlers[i], data);
            }
        }

        function broadcastEvent(eventName, data) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(eventHandlerMap)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var namespace = _step.value;

                    var handlers = getHandlers(namespace, eventName);
                    sendMultipleEvent(eventName, handlers, data);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        function unicastEvent(namespace, eventName, data) {
            var handlers = getHandlers(namespace, eventName);
            if (!handlers) {
                return;
            }

            sendEvent(handlers[0], data);
        }

        function multicastEvent(namespace, eventName, data) {
            var handlers = getHandlers(namespace, eventName);
            if (!handlers) {
                return;
            }
            sendMultipleEvent(eventName, handlers, data);
        }

        return {
            registerEventHandler: function registerEventHandler(eventName, action) {
                var scope = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
                var namespace = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : BE_EVENT_BUS_DEFAULT_NAMESPACE;

                if (!(eventHandlerMap[namespace] instanceof Object)) {
                    eventHandlerMap[namespace] = {};
                    eventHandlerMap[namespace][eventName] = [];
                } else {
                    if (!(eventHandlerMap[namespace][eventName] instanceof Array)) {
                        eventHandlerMap[namespace][eventName] = [];
                    }
                }

                var handler = new eventHandler(namespace, eventName, action, scope);
                eventHandlerMap[namespace][eventName].unshift(handler);
                return handler;
            },
            deregisterEventHandler: function deregisterEventHandler(handler) {
                if (!(handler instanceof eventHandler)) {
                    return;
                }

                var handlers = getHandlers(handler.namespace, handler.eventName);
                if (!handlers) {
                    return;
                }

                for (var i = 0; i < handlers.length; i++) {
                    if (handler === handlers[i]) {
                        handlers.splice(i, 1);
                        break;
                    }
                }
            },
            post: function post(e) {
                console.log(e instanceof event);
                if (!(e instanceof event)) {
                    return;
                }

                switch (e.type) {
                    case eventType.BROADCAST:
                        broadcastEvent(e.name, e.data);
                        break;

                    case eventType.UNICAST:
                        unicastEvent(e.namespace, e.name, e.data);
                        break;

                    case eventType.MULTICAST:
                        multicastEvent(e.namespace, e.name, e.data);
                        break;

                    default:
                        return;
                }
            }
        };
    }();

    //for vue
    /***
     *
     * @type {{install: busForVue.install}}
     */
    var busForVue = {
        install: function install(Vue, options) {
            Vue.prototype.$BEEventBus = { bus: bus, eventType: eventType, event: event, eventFactory: eventFactory };
        }
    };

    exports.bus = bus;
    exports.eventType = eventType;
    exports.event = event;
    exports.eventFactory = eventFactory;
    exports.busForVue = busForVue;
});
