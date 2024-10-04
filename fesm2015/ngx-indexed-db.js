import { InjectionToken, Injectable, Inject, PLATFORM_ID, NgModule } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { __awaiter } from 'tslib';
import { from, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

function openDatabase(indexedDB, dbName, version, upgradeCallback) {
    return new Promise((resolve, reject) => {
        if (!indexedDB) {
            reject('IndexedDB not available');
        }
        const request = indexedDB.open(dbName, version);
        let db;
        request.onsuccess = (event) => {
            db = request.result;
            resolve(db);
        };
        request.onerror = (event) => {
            reject(`IndexedDB error: ${request.error}`);
        };
        if (typeof upgradeCallback === 'function') {
            request.onupgradeneeded = (event) => {
                upgradeCallback(event, db);
            };
        }
    });
}
function openDatabaseIfExists(indexedDB, dbName, version) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!('databases' in indexedDB)) {
            throw new Error('IndexedDB databases() method is not supported in this browser.');
        }
        // @ts-ignore
        const databases = yield indexedDB.databases();
        const dbExists = databases.some((db) => db.name === dbName);
        if (!dbExists) {
            throw new Error(`Database "${dbName}" does not exist.`);
        }
        console.log('dbExists', dbExists);
        return openDatabase(indexedDB, dbName, version);
    });
}
function CreateObjectStore(indexedDB, dbName, version, storeSchemas, migrationFactory) {
    if (!indexedDB) {
        return;
    }
    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = (event) => {
        const database = event.target.result;
        storeSchemas.forEach((storeSchema) => {
            if (!database.objectStoreNames.contains(storeSchema.store)) {
                const objectStore = database.createObjectStore(storeSchema.store, storeSchema.storeConfig);
                storeSchema.storeSchema.forEach((schema) => {
                    objectStore.createIndex(schema.name, schema.keypath, schema.options);
                });
            }
        });
        const storeMigrations = migrationFactory && migrationFactory();
        if (storeMigrations) {
            Object.keys(storeMigrations)
                .map((k) => parseInt(k, 10))
                .filter((v) => v > event.oldVersion)
                .sort((a, b) => a - b)
                .forEach((v) => {
                storeMigrations[v](database, request.transaction);
            });
        }
        database.close();
    };
    request.onsuccess = (e) => {
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
        reject(`objectStore does not exists: ${storeName}`);
    }
}
function createTransaction(db, options) {
    const trans = db.transaction(options.storeName, options.dbMode);
    trans.onerror = options.error;
    trans.oncomplete = options.complete;
    trans.onabort = options.abort;
    return trans;
}
function optionsGenerator(type, storeName, reject, resolve) {
    return {
        storeName,
        dbMode: type,
        error: (e) => {
            reject(e);
        },
        complete: (e) => {
            resolve(e);
        },
        abort: (e) => {
            reject(e);
        },
    };
}

var DBMode;
(function (DBMode) {
    DBMode["readonly"] = "readonly";
    DBMode["readwrite"] = "readwrite";
})(DBMode || (DBMode = {}));
const CONFIG_TOKEN = new InjectionToken(null);

class NgxIndexedDBService {
    constructor(dbConfig, platformId) {
        this.dbConfig = dbConfig;
        this.platformId = platformId;
        if (!dbConfig.name) {
            throw new Error('NgxIndexedDB: Please, provide the dbName in the configuration');
        }
        if (!dbConfig.version) {
            throw new Error('NgxIndexedDB: Please, provide the db version in the configuration');
        }
        this.isBrowser = isPlatformBrowser(this.platformId);
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
    createObjectStore(storeSchema, migrationFactory) {
        const storeSchemas = [storeSchema];
        CreateObjectStore(this.indexedDB, this.dbConfig.name, ++this.dbConfig.version, storeSchemas, migrationFactory);
    }
    /**
     * Adds new entry in the store and returns its key
     * @param storeName The name of the store to add the item
     * @param value The entry to be added
     * @param key The optional key for the entry
     */
    add(storeName, value, key) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                const request = Boolean(key)
                    ? objectStore.add(value, key)
                    : objectStore.add(value);
                request.onsuccess = (evt) => {
                    const result = evt.target.result;
                    resolve(result);
                };
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Adds new entries in the store and returns its key
     * @param storeName The name of the store to add the item
     * @param values The entries to be added containing optional key attribute
     */
    bulkAdd(storeName, values) {
        const promises = values.map((value) => {
            return new Promise((resolve, reject) => {
                openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                    .then((db) => {
                    const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, reject, resolve));
                    const objectStore = transaction.objectStore(storeName);
                    const key = value.key;
                    delete value.key;
                    const request = Boolean(key)
                        ? objectStore.add(value, key)
                        : objectStore.add(value);
                    request.onsuccess = (evt) => {
                        const result = evt.target.result;
                        resolve(result);
                    };
                })
                    .catch((reason) => reject(reason));
            });
        });
        return from(Promise.resolve(Promise.all(promises)));
    }
    /**
     * Adds new entry in the store and returns the item that was added
     * @param storeName The name of the store to add the item
     * @param value The entry to be added
     * @param key The optional key for the entry
     */
    addItem(storeName, value, key) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                const hasKey = Boolean(key);
                const request = hasKey ? objectStore.add(value, key) : objectStore.add(value);
                request.onsuccess = (evt) => {
                    const result = evt.target.result;
                    const itemKey = hasKey ? key : result;
                    this.getByKey(storeName, itemKey).subscribe((newValue) => {
                        resolve(newValue);
                    });
                };
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Adds new entry in the store and returns the item that was added
     * @param storeName The name of the store to add the item
     * @param value The entry to be added
     * @param key The key for the entry
     */
    addItemWithKey(storeName, value, key) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                transaction.oncomplete = () => {
                    this.getByKey(storeName, key).subscribe((newValue) => {
                        resolve(newValue);
                    });
                };
                objectStore.add(value, key);
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Returns entry by key.
     * @param storeName The name of the store to query
     * @param key The entry key
     */
    getByKey(storeName, key) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                const request = objectStore.get(key);
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                request.onerror = (event) => {
                    reject(event);
                };
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Returns entry by id.
     * @param storeName The name of the store to query
     * @param id The entry id
     */
    getByID(storeName, id) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                const request = objectStore.get(id);
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Returns entry by index.
     * @param storeName The name of the store to query
     * @param indexName The index name to filter
     * @param key The entry key.
     */
    getByIndex(storeName, indexName, key) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                const index = objectStore.index(indexName);
                const request = index.get(key);
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Return all elements from one store
     * @param storeName The name of the store to select the items
     */
    getAll(storeName) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                const request = objectStore.getAll();
                request.onerror = (evt) => {
                    reject(evt);
                };
                request.onsuccess = ({ target: { result: ResultAll } }) => {
                    resolve(ResultAll);
                };
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Returns all items from the store after update.
     * @param storeName The name of the store to update
     * @param value The new value for the entry
     * @param key The key of the entry to update if exists
     */
    update(storeName, value, key) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                transaction.oncomplete = () => {
                    this.getAll(storeName)
                        .pipe(take(1))
                        .subscribe((newValues) => {
                        resolve(newValues);
                    });
                };
                key ? objectStore.put(value, key) : objectStore.put(value);
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Returns the item you updated from the store after the update.
     * @param storeName The name of the store to update
     * @param value The new value for the entry
     * @param key The key of the entry to update
     */
    updateByKey(storeName, value, key) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                transaction.oncomplete = () => {
                    this.getByKey(storeName, key).subscribe((newValue) => {
                        resolve(newValue);
                    });
                };
                objectStore.put(value, key);
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Returns all items from the store after delete.
     * @param storeName The name of the store to have the entry deleted
     * @param key The key of the entry to be deleted
     */
    delete(storeName, key) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                objectStore.delete(key);
                transaction.oncomplete = () => {
                    this.getAll(storeName)
                        .pipe(take(1))
                        .subscribe((newValues) => {
                        resolve(newValues);
                    });
                };
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Returns true from the store after a successful delete.
     * @param storeName The name of the store to have the entry deleted
     * @param key The key of the entry to be deleted
     */
    deleteByKey(storeName, key) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                transaction.oncomplete = () => {
                    resolve(true);
                };
                objectStore.delete(key);
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Returns true if successfully delete all entries from the store.
     * @param storeName The name of the store to have the entries deleted
     */
    clear(storeName) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                objectStore.clear();
                transaction.oncomplete = () => {
                    resolve(true);
                };
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Returns true if successfully delete the DB.
     */
    deleteDatabase() {
        return from(new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version);
                yield db.close();
                const deleteDBRequest = this.indexedDB.deleteDatabase(this.dbConfig.name);
                deleteDBRequest.onsuccess = () => {
                    resolve(true);
                };
                deleteDBRequest.onerror = reject;
                deleteDBRequest.onblocked = () => {
                    throw new Error(`Unable to delete database because it's blocked`);
                };
            }
            catch (evt) {
                reject(evt);
            }
        })));
    }
    /**
     * Returns the open cursor event
     * @param storeName The name of the store to have the entries deleted
     * @param keyRange The key range which the cursor should be open on
     */
    openCursor(storeName, keyRange) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                const request = keyRange === undefined ? objectStore.openCursor() : objectStore.openCursor(keyRange);
                request.onsuccess = (event) => {
                    resolve(event);
                };
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Open a cursor by index filter.
     * @param storeName The name of the store to query.
     * @param indexName The index name to filter.
     * @param keyRange The range value and criteria to apply on the index.
     */
    openCursorByIndex(storeName, indexName, keyRange, mode = DBMode.readonly) {
        const obs = new Subject();
        openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
            .then((db) => {
            validateBeforeTransaction(db, storeName, (reason) => {
                obs.error(reason);
            });
            const transaction = createTransaction(db, optionsGenerator(mode, storeName, (reason) => {
                obs.error(reason);
            }, () => {
                obs.next();
            }));
            const objectStore = transaction.objectStore(storeName);
            const index = objectStore.index(indexName);
            const request = index.openCursor(keyRange);
            request.onsuccess = (event) => {
                obs.next(event);
            };
        })
            .catch((reason) => obs.error(reason));
        return obs;
    }
    /**
     * Returns all items by an index.
     * @param storeName The name of the store to query
     * @param indexName The index name to filter
     * @param keyRange  The range value and criteria to apply on the index.
     */
    getAllByIndex(storeName, indexName, keyRange) {
        const data = [];
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                const index = objectStore.index(indexName);
                const request = index.openCursor(keyRange);
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        data.push(cursor.value);
                        cursor.continue();
                    }
                    else {
                        resolve(data);
                    }
                };
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Returns all primary keys by an index.
     * @param storeName The name of the store to query
     * @param indexName The index name to filter
     * @param keyRange  The range value and criteria to apply on the index.
     */
    getAllKeysByIndex(storeName, indexName, keyRange) {
        const data = [];
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                const index = objectStore.index(indexName);
                const request = index.openKeyCursor(keyRange);
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        data.push({ primaryKey: cursor.primaryKey, key: cursor.key });
                        cursor.continue();
                    }
                    else {
                        resolve(data);
                    }
                };
            })
                .catch((reason) => reject(reason));
        }));
    }
    /**
     * Returns the number of rows in a store.
     * @param storeName The name of the store to query
     * @param keyRange  The range value and criteria to apply.
     */
    count(storeName, keyRange) {
        return from(new Promise((resolve, reject) => {
            openDatabaseIfExists(this.indexedDB, this.dbConfig.name, this.dbConfig.version)
                .then((db) => {
                validateBeforeTransaction(db, storeName, reject);
                const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, reject, resolve));
                const objectStore = transaction.objectStore(storeName);
                const request = objectStore.count(keyRange);
                request.onerror = (e) => reject(e);
                request.onsuccess = (e) => resolve(e.target.result);
            })
                .catch((reason) => reject(reason));
        }));
    }
}
NgxIndexedDBService.decorators = [
    { type: Injectable }
];
NgxIndexedDBService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [CONFIG_TOKEN,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] }
];

class NgxIndexedDBModule {
    static forRoot(dbConfig) {
        return {
            ngModule: NgxIndexedDBModule,
            providers: [NgxIndexedDBService, { provide: CONFIG_TOKEN, useValue: dbConfig }]
        };
    }
}
NgxIndexedDBModule.decorators = [
    { type: NgModule, args: [{
                declarations: [],
                imports: [CommonModule]
            },] }
];

/**
 * Generated bundle index. Do not edit.
 */

export { CONFIG_TOKEN, DBMode, NgxIndexedDBModule, NgxIndexedDBService };
//# sourceMappingURL=ngx-indexed-db.js.map
