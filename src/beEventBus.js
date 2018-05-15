const BE_EVENT_BUS_DEFAULT_NAMESPACE = "BE_EVENT_BUS_DEFAULT_NAMESPACE"

const eventType = {
    BROADCAST: 0,
    UNICAST: 1,
    MULTICAST: 2,
}

/***
 *
 * @param namespace
 * @param name
 * @param data
 * @param type
 */
const event = function (namespace, name, data, type = eventType.BROADCAST) {
    this.namespace = namespace
    this.name = name
    this.data = data
    this.type = type
}

/***
 *
 * @param namespace
 * @param type
 * @returns {{newEvent: newEvent}}
 */
const eventFactory = function (namespace, type = eventType.MULTICAST) {
    return {
        newEvent: function (name, data) {
            return new event(namespace, name, data, type)
        }
    }
}

const bus = new function () {
    let eventHandler = function (namespace, eventName, action, scope) {
        if(!(action instanceof Function)) {
            return
        }

        this.namespace = namespace
        this.eventName = eventName
        this.action = action
        this.scope = scope
    }

    let eventHandlerMap = {}

    function getHandlers(namespace, eventName) {
        if(!eventHandlerMap[namespace]) {
            return null
        }

        let handlers = eventHandlerMap[namespace][eventName]
        if(!(handlers instanceof Array)) {
            return null
        }

        if(0 === handlers.length) {
            return null
        }

        return handlers
    }

    function sendEvent(handler, data) {
        if(handler.scope instanceof Object) {
            handler.action.call(handler.scope, data)
        } else {
            handler.action(data)
        }
    }

    function sendMultipleEvent(name, handlers, data) {
        for(let i = 0; i < handlers.length; i++) {
            sendEvent(handlers[i], data)
        }
    }

    function broadcastEvent(eventName, data) {
        for(let namespace of Object.keys(eventHandlerMap)) {
            let handlers = getHandlers(namespace, eventName)
            sendMultipleEvent(eventName, handlers, data)
        }
    }

    function unicastEvent(namespace, eventName, data) {
        const handlers = getHandlers(namespace, eventName)
        if(!handlers) {
            return
        }

        sendEvent(handlers[0], data)
    }

    function multicastEvent(namespace, eventName, data) {
        const handlers = getHandlers(namespace, eventName)
        if(!handlers) {
            return
        }
        sendMultipleEvent(eventName, handlers, data)
    }

    return {
        /***
         *
         * @param eventName
         * @param action
         * @param scope
         * @param namespace
         * @returns {eventHandler}
         */
        registerEventHandler(eventName, action, scope = null, namespace = BE_EVENT_BUS_DEFAULT_NAMESPACE) {
            if(!(eventHandlerMap[namespace] instanceof Object)) {
                eventHandlerMap[namespace] = {}
                eventHandlerMap[namespace][eventName] = []
            } else {
                if(!(eventHandlerMap[namespace][eventName] instanceof Array)) {
                    eventHandlerMap[namespace][eventName] = []
                }
            }

            let handler = new eventHandler(namespace, eventName, action, scope)
            eventHandlerMap[namespace][eventName].unshift(handler)
            return handler
        },

        /***
         *
         * @param handler
         */
        deregisterEventHandler(handler) {
            if(!(handler instanceof eventHandler)) {
                return
            }

            let handlers = getHandlers(handler.namespace, handler.eventName)
            if (!handlers) {
                return
            }

            for (let i = 0; i < handlers.length; i++) {
                if(handler === handlers[i]) {
                    handlers.splice(i, 1)
                    break
                }
            }
        },

        /***
         *
         * @param e
         */
        post(e) {
            if(!(e instanceof event)) {
                return
            }

            switch (e.type) {
                case eventType.BROADCAST:
                    broadcastEvent(e.name, e.data)
                    break

                case eventType.UNICAST:
                    unicastEvent(e.namespace, e.name, e.data)
                    break

                case eventType.MULTICAST:
                    multicastEvent(e.namespace, e.name, e.data)
                    break

                default:
                    return
            }
        },
    }
}()


//for vue
/***
 *
 * @type {{install: busForVue.install}}
 */
let busForVue = {
    install: function (Vue, options) {
        Vue.prototype.$BEEventBus = {bus, eventType, event, eventFactory }
    }
}

export {bus, eventType, event, eventFactory, busForVue }


