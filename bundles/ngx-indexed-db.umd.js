(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('ngx-indexed-db', ['exports', '@angular/core', '@angular/common', 'rxjs', 'rxjs/operators'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['ngx-indexed-db'] = {}, global.ng.core, global.ng.common, global.rxjs, global.rxjs.operators));
}(this, (function (exports, core, common, rxjs, operators) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    function openDatabase(indexedDB, dbName, version, upgradeCallback) {
        return new Promise(function (resolve, reject) {
            if (!indexedDB) {
                reject('IndexedDB not available');
            }
            var request = indexedDB.open(dbName, version);
            var db;
            request.onsuccess = function (event) {
                db = request.result;
                resolve(db);
            };
            request.onerror = function (event) {
                reject("IndexedDB error: " + request.error);
            };
            if (typeof upgradeCallback === 'function') {
                request.onupgradeneeded = function (event) {
                    upgradeCallback(event, db);
                };
            }
        });
    }
    function openDatabaseIfExists(indexedDB, dbName, version) {
        return __awaiter(this, void 0, void 0, function () {
            var databases, dbExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!('databases' in indexedDB)) {
                            throw new Error('IndexedDB databases() method is not supported in this browser.');
                        }
                        return [4 /*yield*/, indexedDB.databases()];
                    case 1:
                        databases = _a.sent();
                        dbExists = databases.some(function (db) { return db.name === dbName; });
                        if (!dbExists) {
                            throw new Error("Database \"" + dbName + "\" does not exist.");
                        }
                        console.log('dbExists', dbExists);
                        return [2 /*return*/, openDatabase(indexedDB, dbName, version)];
                }
            });
        });
    }
    function CreateObjectStore(indexedDB, dbName, version, storeSchemas, migrationFactory) {
        if (!indexedDB) {
            return;
        }
        var request = indexedDB.open(dbName, version);
        request.onupgradeneeded = function (event) {
            var database = event.target.result;
            storeSchemas.forEach(function (storeSchema) {
                if (!database.objectStoreNames.contains(storeSchema.store)) {
                    var objectStore_1 = database.createObjectStore(storeSchema.store, storeSchema.storeConfig);
                    storeSchema.storeSchema.forEach(function (schema) {
                        objectStore_1.createIndex(schema.name, schema.keypath, schema.options);
                    });
                }
            });
            var storeMigrations = migrationFactory && migrationFactory();
            if (storeMigrations) {
                Object.keys(storeMigrations)
                    .map(function (k) { return parseInt(k, 10); })
                    .filter(function (v) { return v > event.oldVersion; })
                    .sort(function (a, b) { return a - b; })
                    .forEach(function (v) {
                    storeMigrations[v](database, request.transaction);
                });
            }
            database.close();
        };
        request.onsuccess = function (e) {
            e.target.result.close();
        };
    }

    function validateStoreName(db, storeName) {
        return db.objectStoreNames.contains(storeName);
    }
    function validateBeforeTransaction(db, storeName, reject) {
        if (!db) {
            reject('You need to use the openDatabase function to create a database before you query it!');
        }
        if (!validateStoreName(db, storeName)) {
            reject("objectStore does not exists: " + storeName);
        }
    }
    function createTransaction(db, options) {
        var trans = db.transaction(options.storeName, options.dbMode);
        trans.onerror = options.error;
        trans.oncomplete = options.complete;
        trans.onabort = options.abort;
        return trans;
    }
    function optionsGenerator(type, storeName, reject, resolve) {
        return {
            storeName: storeName,
            dbMode: type,
            error: function (e) {
                reject(e);
            },
            complete: function (e) {
                resolve(e);
            },
            abort: function (e) {
                reject(e);
            },
        };
    }

    exports.DBMode = void 0;
    (function (DBMode) {
        DBMode["readonly"] = "readonly";
        DBMode["readwrite"] = "readwrite";
    })(exports.DBMode || (exports.DBMode = {}));
    var CONFIG_TOKEN = new core.InjectionToken(null);

    var NgxIndexedDBService = /** @class */ (function () {
        function NgxIndexedDBService(dbConfig, platformId) {
            this.dbConfig = dbConfig;
            this.platformId = platformId;
            if (!dbConfig.name) {
                throw new Error('NgxIndexedDB: Please, provide the dbName in the configuration');
            }
            if (!dbConfig.version) {
                throw new Error('NgxIndexedDB: Please, provide the db version in the configuration');
            }
            this.isBrowser = common.isPlatformBrowser(this.platformId);
            if (this.isBrowser) {
                this.indexedDB =
                    window.indexedDB ||
                        window.mozIndexedDB ||
                        window.webkitIndexedDB ||
                        window.msIndexedDB;
                CreateObjectStore(this.indexedDB, dbConfig.name, dbConfig.version, dbConfig.objectStoresMeta, dbConfig.migrationFactory);
            }
        }
        /**
         * Allows to crate a new object store ad-hoc
         * @param storeName The name of the store to be created
         * @param migrationFactory The migration factory if exists
         */
        NgxIndexedDBService.prototype.createObjectStore = function (storeSchema, migrationFactory) {
            var storeSchemas = [storeSchema];
            CreateObjectStore(this.indexedDB, this.dbConfig.name, ++this.dbConfig.version, storeSchemas, migrationFactory);
        };
        /**
         * Adds new entry in the store and returns its key
         * @param storeName The name of the store to add the item
         * @param value The entry to be added
         * @param key The optional key for the entry
         */
        NgxIndexedDBService.prototype.add = function (storeName, value, key) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readwrite, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    var request = Boolean(key)
                        ? objectStore.add(value, key)
                        : objectStore.add(value);
                    request.onsuccess = function (evt) {
                        var result = evt.target.result;
                        resolve(result);
                    };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Adds new entries in the store and returns its key
         * @param storeName The name of the store to add the item
         * @param values The entries to be added containing optional key attribute
         */
        NgxIndexedDBService.prototype.bulkAdd = function (storeName, values) {
            var _this = this;
            var promises = values.map(function (value) {
                return new Promise(function (resolve, reject) {
                    openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                        .then(function (db) {
                        var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readwrite, storeName, reject, resolve));
                        var objectStore = transaction.objectStore(storeName);
                        var key = value.key;
                        delete value.key;
                        var request = Boolean(key)
                            ? objectStore.add(value, key)
                            : objectStore.add(value);
                        request.onsuccess = function (evt) {
                            var result = evt.target.result;
                            resolve(result);
                        };
                    })
                        .catch(function (reason) { return reject(reason); });
                });
            });
            return rxjs.from(Promise.resolve(Promise.all(promises)));
        };
        /**
         * Adds new entry in the store and returns the item that was added
         * @param storeName The name of the store to add the item
         * @param value The entry to be added
         * @param key The optional key for the entry
         */
        NgxIndexedDBService.prototype.addItem = function (storeName, value, key) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readwrite, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    var hasKey = Boolean(key);
                    var request = hasKey ? objectStore.add(value, key) : objectStore.add(value);
                    request.onsuccess = function (evt) {
                        var result = evt.target.result;
                        var itemKey = hasKey ? key : result;
                        _this.getByKey(storeName, itemKey).subscribe(function (newValue) {
                            resolve(newValue);
                        });
                    };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Adds new entry in the store and returns the item that was added
         * @param storeName The name of the store to add the item
         * @param value The entry to be added
         * @param key The key for the entry
         */
        NgxIndexedDBService.prototype.addItemWithKey = function (storeName, value, key) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readwrite, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    transaction.oncomplete = function () {
                        _this.getByKey(storeName, key).subscribe(function (newValue) {
                            resolve(newValue);
                        });
                    };
                    objectStore.add(value, key);
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Returns entry by key.
         * @param storeName The name of the store to query
         * @param key The entry key
         */
        NgxIndexedDBService.prototype.getByKey = function (storeName, key) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readonly, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    var request = objectStore.get(key);
                    request.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                    request.onerror = function (event) {
                        reject(event);
                    };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Returns entry by id.
         * @param storeName The name of the store to query
         * @param id The entry id
         */
        NgxIndexedDBService.prototype.getByID = function (storeName, id) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readonly, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    var request = objectStore.get(id);
                    request.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Returns entry by index.
         * @param storeName The name of the store to query
         * @param indexName The index name to filter
         * @param key The entry key.
         */
        NgxIndexedDBService.prototype.getByIndex = function (storeName, indexName, key) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readonly, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    var index = objectStore.index(indexName);
                    var request = index.get(key);
                    request.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Return all elements from one store
         * @param storeName The name of the store to select the items
         */
        NgxIndexedDBService.prototype.getAll = function (storeName) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readonly, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    var request = objectStore.getAll();
                    request.onerror = function (evt) {
                        reject(evt);
                    };
                    request.onsuccess = function (_a) {
                        var ResultAll = _a.target.result;
                        resolve(ResultAll);
                    };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Returns all items from the store after update.
         * @param storeName The name of the store to update
         * @param value The new value for the entry
         * @param key The key of the entry to update if exists
         */
        NgxIndexedDBService.prototype.update = function (storeName, value, key) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readwrite, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    transaction.oncomplete = function () {
                        _this.getAll(storeName)
                            .pipe(operators.take(1))
                            .subscribe(function (newValues) {
                            resolve(newValues);
                        });
                    };
                    key ? objectStore.put(value, key) : objectStore.put(value);
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Returns the item you updated from the store after the update.
         * @param storeName The name of the store to update
         * @param value The new value for the entry
         * @param key The key of the entry to update
         */
        NgxIndexedDBService.prototype.updateByKey = function (storeName, value, key) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readwrite, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    transaction.oncomplete = function () {
                        _this.getByKey(storeName, key).subscribe(function (newValue) {
                            resolve(newValue);
                        });
                    };
                    objectStore.put(value, key);
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Returns all items from the store after delete.
         * @param storeName The name of the store to have the entry deleted
         * @param key The key of the entry to be deleted
         */
        NgxIndexedDBService.prototype.delete = function (storeName, key) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readwrite, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    objectStore.delete(key);
                    transaction.oncomplete = function () {
                        _this.getAll(storeName)
                            .pipe(operators.take(1))
                            .subscribe(function (newValues) {
                            resolve(newValues);
                        });
                    };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Returns true from the store after a successful delete.
         * @param storeName The name of the store to have the entry deleted
         * @param key The key of the entry to be deleted
         */
        NgxIndexedDBService.prototype.deleteByKey = function (storeName, key) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readwrite, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    transaction.oncomplete = function () {
                        resolve(true);
                    };
                    objectStore.delete(key);
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Returns true if successfully delete all entries from the store.
         * @param storeName The name of the store to have the entries deleted
         */
        NgxIndexedDBService.prototype.clear = function (storeName) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readwrite, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    objectStore.clear();
                    transaction.oncomplete = function () {
                        resolve(true);
                    };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Returns true if successfully delete the DB.
         */
        NgxIndexedDBService.prototype.deleteDatabase = function () {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var db, deleteDBRequest, evt_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)];
                        case 1:
                            db = _a.sent();
                            return [4 /*yield*/, db.close()];
                        case 2:
                            _a.sent();
                            deleteDBRequest = this.indexedDB.deleteDatabase(this.dbConfig.name);
                            deleteDBRequest.onsuccess = function () {
                                resolve(true);
                            };
                            deleteDBRequest.onerror = reject;
                            deleteDBRequest.onblocked = function () {
                                throw new Error("Unable to delete database because it's blocked");
                            };
                            return [3 /*break*/, 4];
                        case 3:
                            evt_1 = _a.sent();
                            reject(evt_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }));
        };
        /**
         * Returns the open cursor event
         * @param storeName The name of the store to have the entries deleted
         * @param keyRange The key range which the cursor should be open on
         */
        NgxIndexedDBService.prototype.openCursor = function (storeName, keyRange) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readonly, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    var request = keyRange === undefined ? objectStore.openCursor() : objectStore.openCursor(keyRange);
                    request.onsuccess = function (event) {
                        resolve(event);
                    };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Open a cursor by index filter.
         * @param storeName The name of the store to query.
         * @param indexName The index name to filter.
         * @param keyRange The range value and criteria to apply on the index.
         */
        NgxIndexedDBService.prototype.openCursorByIndex = function (storeName, indexName, keyRange, mode) {
            if (mode === void 0) { mode = exports.DBMode.readonly; }
            var obs = new rxjs.Subject();
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then(function (db) {
                validateBeforeTransaction(db, storeName, function (reason) {
                    obs.error(reason);
                });
                var transaction = createTransaction(db, optionsGenerator(mode, storeName, function (reason) {
                    obs.error(reason);
                }, function () {
                    obs.next();
                }));
                var objectStore = transaction.objectStore(storeName);
                var index = objectStore.index(indexName);
                var request = index.openCursor(keyRange);
                request.onsuccess = function (event) {
                    obs.next(event);
                };
            })
                .catch(function (reason) { return obs.error(reason); });
            return obs;
        };
        /**
         * Returns all items by an index.
         * @param storeName The name of the store to query
         * @param indexName The index name to filter
         * @param keyRange  The range value and criteria to apply on the index.
         */
        NgxIndexedDBService.prototype.getAllByIndex = function (storeName, indexName, keyRange) {
            var _this = this;
            var data = [];
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readonly, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    var index = objectStore.index(indexName);
                    var request = index.openCursor(keyRange);
                    request.onsuccess = function (event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            data.push(cursor.value);
                            cursor.continue();
                        }
                        else {
                            resolve(data);
                        }
                    };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Returns all primary keys by an index.
         * @param storeName The name of the store to query
         * @param indexName The index name to filter
         * @param keyRange  The range value and criteria to apply on the index.
         */
        NgxIndexedDBService.prototype.getAllKeysByIndex = function (storeName, indexName, keyRange) {
            var _this = this;
            var data = [];
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readonly, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    var index = objectStore.index(indexName);
                    var request = index.openKeyCursor(keyRange);
                    request.onsuccess = function (event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            data.push({ primaryKey: cursor.primaryKey, key: cursor.key });
                            cursor.continue();
                        }
                        else {
                            resolve(data);
                        }
                    };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        /**
         * Returns the number of rows in a store.
         * @param storeName The name of the store to query
         * @param keyRange  The range value and criteria to apply.
         */
        NgxIndexedDBService.prototype.count = function (storeName, keyRange) {
            var _this = this;
            return rxjs.from(new Promise(function (resolve, reject) {
                openDatabaseIfExists(_this.indexedDB, _this.dbConfig.name, _this.dbConfig.version)
                    .then(function (db) {
                    validateBeforeTransaction(db, storeName, reject);
                    var transaction = createTransaction(db, optionsGenerator(exports.DBMode.readonly, storeName, reject, resolve));
                    var objectStore = transaction.objectStore(storeName);
                    var request = objectStore.count(keyRange);
                    request.onerror = function (e) { return reject(e); };
                    request.onsuccess = function (e) { return resolve(e.target.result); };
                })
                    .catch(function (reason) { return reject(reason); });
            }));
        };
        return NgxIndexedDBService;
    }());
    NgxIndexedDBService.decorators = [
        { type: core.Injectable }
    ];
    NgxIndexedDBService.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [CONFIG_TOKEN,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [core.PLATFORM_ID,] }] }
    ]; };

    var NgxIndexedDBModule = /** @class */ (function () {
        function NgxIndexedDBModule() {
        }
        NgxIndexedDBModule.forRoot = function (dbConfig) {
            return {
                ngModule: NgxIndexedDBModule,
                providers: [NgxIndexedDBService, { provide: CONFIG_TOKEN, useValue: dbConfig }]
            };
        };
        return NgxIndexedDBModule;
    }());
    NgxIndexedDBModule.decorators = [
        { type: core.NgModule, args: [{
                    declarations: [],
                    imports: [common.CommonModule]
                },] }
    ];

    /**
     * Generated bundle index. Do not edit.
     */

    exports.CONFIG_TOKEN = CONFIG_TOKEN;
    exports.NgxIndexedDBModule = NgxIndexedDBModule;
    exports.NgxIndexedDBService = NgxIndexedDBService;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-indexed-db.umd.js.map
