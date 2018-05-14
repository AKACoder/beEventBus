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

        function sendEvent(handler, data) {
            if (handler.scope instanceof Object) {
                handler.action.call(handler.scope, data);
            } else {
                handler.action(data);
            }
        }

        function sendMultipleEvent(name, handlers, data) {
            for (var i = 0; i < handlers.length; i++) {
                if (name !== handlers[i].eventName) {
                    continue;
                }
                sendEvent(handlers[i], data);
            }
        }

        function broadcastEvent(name, data) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.values(eventHandlerMap)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var handlers = _step.value;

                    sendMultipleEvent(name, handlers, data);
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

        function unicastEvent(namespace, name, data) {
            if (!eventHandlerMap[namespace]) {
                return;
            }

            var handlers = eventHandlerMap[namespace];
            if (1 > handlers.length) {
                return;
            }

            sendEvent(handlers[0], data);
        }

        function multicastEvent(namespace, name, data) {
            if (!eventHandlerMap[namespace]) {
                return;
            }

            var handlers = eventHandlerMap[namespace];
            sendMultipleEvent(name, handlers, data);
        }

        return {
            registerEventHandler: function registerEventHandler(eventName, action) {
                var scope = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
                var namespace = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : BE_EVENT_BUS_DEFAULT_NAMESPACE;

                if (!(eventHandlerMap[namespace] instanceof Array)) {
                    eventHandlerMap[namespace] = [];
                }

                var handler = new eventHandler(namespace, eventName, action, scope);
                eventHandlerMap[namespace].unshift(handler);
                return handler;
            },
            deregisterEventHandler: function deregisterEventHandler(handler) {
                if (!(handler instanceof eventHandler)) {
                    return;
                }

                if (!eventHandlerMap[handler.namespace]) {
                    return;
                }

                var handlers = eventHandlerMap[handler.namespace];

                for (var i = 0; i < handlers.length; i++) {
                    if (handler === handlers[i]) {
                        handlers.splice(i, 1);
                        break;
                    }
                }
            },
            post: function post(e) {
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
