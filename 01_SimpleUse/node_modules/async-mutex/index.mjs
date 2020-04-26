var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Semaphore {
    constructor(_value) {
        this._value = _value;
        this._queue = [];
        if (_value <= 0) {
            throw new Error('semaphore must be intitialized to a positive value');
        }
    }
    acquire() {
        const locked = this.isLocked();
        const ticket = new Promise((r) => this._queue.push(r));
        if (!locked)
            this._dispatch();
        return ticket;
    }
    runExclusive(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const [value, release] = yield this.acquire();
            try {
                return yield callback(value);
            }
            finally {
                release();
            }
        });
    }
    isLocked() {
        return this._value <= 0;
    }
    _dispatch() {
        const nextConsumer = this._queue.shift();
        if (!nextConsumer)
            return;
        let released = false;
        const release = () => {
            if (released)
                return;
            released = true;
            this._value++;
            this._dispatch();
        };
        nextConsumer([this._value--, release]);
    }
}

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Mutex {
    constructor() {
        this._semaphore = new Semaphore(1);
    }
    acquire() {
        return __awaiter$1(this, void 0, void 0, function* () {
            const [, releaser] = yield this._semaphore.acquire();
            return releaser;
        });
    }
    runExclusive(callback) {
        return this._semaphore.runExclusive(() => callback());
    }
    isLocked() {
        return this._semaphore.isLocked();
    }
}

var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function withTimeout(sync, timeout, timeoutError = new Error('timeout')) {
    return {
        acquire: () => new Promise((resolve, reject) => __awaiter$2(this, void 0, void 0, function* () {
            let isTimeout = false;
            setTimeout(() => {
                isTimeout = true;
                reject(timeoutError);
            }, timeout);
            const ticket = yield sync.acquire();
            if (isTimeout) {
                const release = Array.isArray(ticket) ? ticket[1] : ticket;
                release();
            }
            else {
                resolve(ticket);
            }
        })),
        runExclusive(callback) {
            return __awaiter$2(this, void 0, void 0, function* () {
                let release = () => undefined;
                try {
                    const ticket = yield this.acquire();
                    if (Array.isArray(ticket)) {
                        release = ticket[1];
                        return yield callback(ticket[0]);
                    }
                    else {
                        release = ticket;
                        return yield callback();
                    }
                }
                finally {
                    release();
                }
            });
        },
        isLocked: () => sync.isLocked(),
    };
}

export { Mutex, Semaphore, withTimeout };
