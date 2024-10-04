import { __awaiter } from "tslib";
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CreateObjectStore, openDatabaseIfExists } from './ngx-indexed-db';
import { createTransaction, optionsGenerator, validateBeforeTransaction } from '../utils';
import { CONFIG_TOKEN, DBMode } from './ngx-indexed-db.meta';
import { isPlatformBrowser } from '@angular/common';
import { from, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
export class NgxIndexedDBService {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWluZGV4ZWQtZGIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1pbmRleGVkLWRiL3NyYy9saWIvbmd4LWluZGV4ZWQtZGIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2hFLE9BQU8sRUFBZ0IsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUN6RixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDMUYsT0FBTyxFQUFFLFlBQVksRUFBZ0QsTUFBTSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDM0csT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDcEQsT0FBTyxFQUF3QixJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd0QyxNQUFNLE9BQU8sbUJBQW1CO0lBSTlCLFlBQTBDLFFBQWtCLEVBQStCLFVBQWU7UUFBaEUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUErQixlQUFVLEdBQVYsVUFBVSxDQUFLO1FBQ3hHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsK0RBQStELENBQUMsQ0FBQztTQUNsRjtRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUVBQW1FLENBQUMsQ0FBQztTQUN0RjtRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BELElBQUksSUFB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b250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIEluamVjdCwgUExBVEZPUk1fSUQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IG9wZW5EYXRhYmFzZSwgQ3JlYXRlT2JqZWN0U3RvcmUsIG9wZW5EYXRhYmFzZUlmRXhpc3RzIH0gZnJvbSAnLi9uZ3gtaW5kZXhlZC1kYic7XG5pbXBvcnQgeyBjcmVhdGVUcmFuc2FjdGlvbiwgb3B0aW9uc0dlbmVyYXRvciwgdmFsaWRhdGVCZWZvcmVUcmFuc2FjdGlvbiB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IENPTkZJR19UT0tFTiwgREJDb25maWcsIEtleSwgUmVxdWVzdEV2ZW50LCBPYmplY3RTdG9yZU1ldGEsIERCTW9kZSB9IGZyb20gJy4vbmd4LWluZGV4ZWQtZGIubWV0YSc7XG5pbXBvcnQgeyBpc1BsYXRmb3JtQnJvd3NlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBPYnNlcnZlciwgZnJvbSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgdGFrZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5neEluZGV4ZWREQlNlcnZpY2Uge1xuICBwcml2YXRlIHJlYWRvbmx5IGlzQnJvd3NlcjogYm9vbGVhbjtcbiAgcHJpdmF0ZSBpbmRleGVkREI6IElEQkZhY3Rvcnk7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChDT05GSUdfVE9LRU4pIHByaXZhdGUgZGJDb25maWc6IERCQ29uZmlnLCBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IGFueSkge1xuICAgIGlmICghZGJDb25maWcubmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZ3hJbmRleGVkREI6IFBsZWFzZSwgcHJvdmlkZSB0aGUgZGJOYW1lIGluIHRoZSBjb25maWd1cmF0aW9uJyk7XG4gICAgfVxuICAgIGlmICghZGJDb25maWcudmVyc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZ3hJbmRleGVkREI6IFBsZWFzZSwgcHJvdmlkZSB0aGUgZGIgdmVyc2lvbiBpbiB0aGUgY29uZmlndXJhdGlvbicpO1xuICAgIH1cbiAgICB0aGlzLmlzQnJvd3NlciA9IGlzUGxhdGZvcm1Ccm93c2VyKHRoaXMucGxhdGZvcm1JZCk7XG4gICAgaWYgKHRoaXMuaXNCcm93c2VyKSB7XG4gICAgICB0aGlzLmluZGV4ZWREQiA9XG4gICAgICAgIHdpbmRvdy5pbmRleGVkREIgfHxcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLm1vekluZGV4ZWREQiB8fFxuICAgICAgICAod2luZG93IGFzIGFueSkud2Via2l0SW5kZXhlZERCIHx8XG4gICAgICAgICh3aW5kb3cgYXMgYW55KS5tc0luZGV4ZWREQjtcbiAgICAgIENyZWF0ZU9iamVjdFN0b3JlKFxuICAgICAgICB0aGlzLmluZGV4ZWREQixcbiAgICAgICAgZGJDb25maWcubmFtZSxcbiAgICAgICAgZGJDb25maWcudmVyc2lvbixcbiAgICAgICAgZGJDb25maWcub2JqZWN0U3RvcmVzTWV0YSxcbiAgICAgICAgZGJDb25maWcubWlncmF0aW9uRmFjdG9yeVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIHRvIGNyYXRlIGEgbmV3IG9iamVjdCBzdG9yZSBhZC1ob2NcbiAgICogQHBhcmFtIHN0b3JlTmFtZSBUaGUgbmFtZSBvZiB0aGUgc3RvcmUgdG8gYmUgY3JlYXRlZFxuICAgKiBAcGFyYW0gbWlncmF0aW9uRmFjdG9yeSBUaGUgbWlncmF0aW9uIGZhY3RvcnkgaWYgZXhpc3RzXG4gICAqL1xuICBjcmVhdGVPYmplY3RTdG9yZShcbiAgICBzdG9yZVNjaGVtYTogT2JqZWN0U3RvcmVNZXRhLFxuICAgIG1pZ3JhdGlvbkZhY3Rvcnk/OiAoKSA9PiB7IFtrZXk6IG51bWJlcl06IChkYjogSURCRGF0YWJhc2UsIHRyYW5zYWN0aW9uOiBJREJUcmFuc2FjdGlvbikgPT4gdm9pZCB9XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHN0b3JlU2NoZW1hczogT2JqZWN0U3RvcmVNZXRhW10gPSBbc3RvcmVTY2hlbWFdO1xuICAgIENyZWF0ZU9iamVjdFN0b3JlKHRoaXMuaW5kZXhlZERCLCB0aGlzLmRiQ29uZmlnLm5hbWUsICsrdGhpcy5kYkNvbmZpZy52ZXJzaW9uLCBzdG9yZVNjaGVtYXMsIG1pZ3JhdGlvbkZhY3RvcnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgbmV3IGVudHJ5IGluIHRoZSBzdG9yZSBhbmQgcmV0dXJucyBpdHMga2V5XG4gICAqIEBwYXJhbSBzdG9yZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHN0b3JlIHRvIGFkZCB0aGUgaXRlbVxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIGVudHJ5IHRvIGJlIGFkZGVkXG4gICAqIEBwYXJhbSBrZXkgVGhlIG9wdGlvbmFsIGtleSBmb3IgdGhlIGVudHJ5XG4gICAqL1xuICBhZGQ8VD4oc3RvcmVOYW1lOiBzdHJpbmcsIHZhbHVlOiBULCBrZXk/OiBhbnkpOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIHJldHVybiBmcm9tKFxuICAgICAgbmV3IFByb21pc2U8bnVtYmVyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIG9wZW5EYXRhYmFzZUlmRXhpc3RzKHRoaXMuaW5kZXhlZERCLCB0aGlzLmRiQ29uZmlnLm5hbWUsIHRoaXMuZGJDb25maWcudmVyc2lvbilcbiAgICAgICAgICAudGhlbigoZGI6IElEQkRhdGFiYXNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbiA9IGNyZWF0ZVRyYW5zYWN0aW9uKGRiLCBvcHRpb25zR2VuZXJhdG9yKERCTW9kZS5yZWFkd3JpdGUsIHN0b3JlTmFtZSwgcmVqZWN0LCByZXNvbHZlKSk7XG4gICAgICAgICAgICBjb25zdCBvYmplY3RTdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHN0b3JlTmFtZSk7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0OiBJREJSZXF1ZXN0PElEQlZhbGlkS2V5PiA9IEJvb2xlYW4oa2V5KVxuICAgICAgICAgICAgICA/IG9iamVjdFN0b3JlLmFkZCh2YWx1ZSwga2V5KVxuICAgICAgICAgICAgICA6IG9iamVjdFN0b3JlLmFkZCh2YWx1ZSk7XG5cbiAgICAgICAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gKGV2dDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gKGV2dC50YXJnZXQgYXMgSURCT3BlbkRCUmVxdWVzdCkucmVzdWx0O1xuICAgICAgICAgICAgICByZXNvbHZlKChyZXN1bHQgYXMgdW5rbm93bikgYXMgbnVtYmVyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4gcmVqZWN0KHJlYXNvbikpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgbmV3IGVudHJpZXMgaW4gdGhlIHN0b3JlIGFuZCByZXR1cm5zIGl0cyBrZXlcbiAgICogQHBhcmFtIHN0b3JlTmFtZSBUaGUgbmFtZSBvZiB0aGUgc3RvcmUgdG8gYWRkIHRoZSBpdGVtXG4gICAqIEBwYXJhbSB2YWx1ZXMgVGhlIGVudHJpZXMgdG8gYmUgYWRkZWQgY29udGFpbmluZyBvcHRpb25hbCBrZXkgYXR0cmlidXRlXG4gICAqL1xuICBidWxrQWRkPFQ+KHN0b3JlTmFtZTogc3RyaW5nLCB2YWx1ZXM6IFQgJiB7IGtleT86IGFueSB9W10pOiBPYnNlcnZhYmxlPG51bWJlcltdPiB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSB2YWx1ZXMubWFwKCh2YWx1ZSkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPG51bWJlcj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBvcGVuRGF0YWJhc2VJZkV4aXN0cyh0aGlzLmluZGV4ZWREQiwgdGhpcy5kYkNvbmZpZy5uYW1lLCB0aGlzLmRiQ29uZmlnLnZlcnNpb24pXG4gICAgICAgICAgLnRoZW4oKGRiOiBJREJEYXRhYmFzZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSBjcmVhdGVUcmFuc2FjdGlvbihkYiwgb3B0aW9uc0dlbmVyYXRvcihEQk1vZGUucmVhZHdyaXRlLCBzdG9yZU5hbWUsIHJlamVjdCwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuXG4gICAgICAgICAgICBjb25zdCBrZXkgPSB2YWx1ZS5rZXk7XG4gICAgICAgICAgICBkZWxldGUgdmFsdWUua2V5O1xuXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0OiBJREJSZXF1ZXN0PElEQlZhbGlkS2V5PiA9IEJvb2xlYW4oa2V5KVxuICAgICAgICAgICAgICA/IG9iamVjdFN0b3JlLmFkZCh2YWx1ZSwga2V5KVxuICAgICAgICAgICAgICA6IG9iamVjdFN0b3JlLmFkZCh2YWx1ZSk7XG5cbiAgICAgICAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gKGV2dDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gKGV2dC50YXJnZXQgYXMgSURCT3BlbkRCUmVxdWVzdCkucmVzdWx0O1xuICAgICAgICAgICAgICByZXNvbHZlKChyZXN1bHQgYXMgdW5rbm93bikgYXMgbnVtYmVyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4gcmVqZWN0KHJlYXNvbikpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZyb20oUHJvbWlzZS5yZXNvbHZlKFByb21pc2UuYWxsKHByb21pc2VzKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgbmV3IGVudHJ5IGluIHRoZSBzdG9yZSBhbmQgcmV0dXJucyB0aGUgaXRlbSB0aGF0IHdhcyBhZGRlZFxuICAgKiBAcGFyYW0gc3RvcmVOYW1lIFRoZSBuYW1lIG9mIHRoZSBzdG9yZSB0byBhZGQgdGhlIGl0ZW1cbiAgICogQHBhcmFtIHZhbHVlIFRoZSBlbnRyeSB0byBiZSBhZGRlZFxuICAgKiBAcGFyYW0ga2V5IFRoZSBvcHRpb25hbCBrZXkgZm9yIHRoZSBlbnRyeVxuICAgKi9cbiAgYWRkSXRlbTxUPihzdG9yZU5hbWU6IHN0cmluZywgdmFsdWU6IFQsIGtleT86IGFueSk6IE9ic2VydmFibGU8VD4ge1xuICAgIHJldHVybiBmcm9tKFxuICAgICAgbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBvcGVuRGF0YWJhc2VJZkV4aXN0cyh0aGlzLmluZGV4ZWREQiwgdGhpcy5kYkNvbmZpZy5uYW1lLCB0aGlzLmRiQ29uZmlnLnZlcnNpb24pXG4gICAgICAgICAgLnRoZW4oKGRiOiBJREJEYXRhYmFzZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSBjcmVhdGVUcmFuc2FjdGlvbihkYiwgb3B0aW9uc0dlbmVyYXRvcihEQk1vZGUucmVhZHdyaXRlLCBzdG9yZU5hbWUsIHJlamVjdCwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuICAgICAgICAgICAgY29uc3QgaGFzS2V5ID0gQm9vbGVhbihrZXkpO1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdDogSURCUmVxdWVzdDxJREJWYWxpZEtleT4gPSBoYXNLZXkgPyBvYmplY3RTdG9yZS5hZGQodmFsdWUsIGtleSkgOiBvYmplY3RTdG9yZS5hZGQodmFsdWUpO1xuXG4gICAgICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IChldnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IChldnQudGFyZ2V0IGFzIElEQk9wZW5EQlJlcXVlc3QpLnJlc3VsdDtcbiAgICAgICAgICAgICAgY29uc3QgaXRlbUtleSA9IGhhc0tleSA/IGtleSA6ICgocmVzdWx0IGFzIHVua25vd24pIGFzIG51bWJlcik7XG4gICAgICAgICAgICAgIHRoaXMuZ2V0QnlLZXkoc3RvcmVOYW1lLCBpdGVtS2V5KS5zdWJzY3JpYmUoKG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShuZXdWYWx1ZSBhcyBUKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHJlamVjdChyZWFzb24pKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIG5ldyBlbnRyeSBpbiB0aGUgc3RvcmUgYW5kIHJldHVybnMgdGhlIGl0ZW0gdGhhdCB3YXMgYWRkZWRcbiAgICogQHBhcmFtIHN0b3JlTmFtZSBUaGUgbmFtZSBvZiB0aGUgc3RvcmUgdG8gYWRkIHRoZSBpdGVtXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgZW50cnkgdG8gYmUgYWRkZWRcbiAgICogQHBhcmFtIGtleSBUaGUga2V5IGZvciB0aGUgZW50cnlcbiAgICovXG4gIGFkZEl0ZW1XaXRoS2V5PFQ+KHN0b3JlTmFtZTogc3RyaW5nLCB2YWx1ZTogVCwga2V5OiBJREJWYWxpZEtleSk6IE9ic2VydmFibGU8VD4ge1xuICAgIHJldHVybiBmcm9tKFxuICAgICAgbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBvcGVuRGF0YWJhc2VJZkV4aXN0cyh0aGlzLmluZGV4ZWREQiwgdGhpcy5kYkNvbmZpZy5uYW1lLCB0aGlzLmRiQ29uZmlnLnZlcnNpb24pXG4gICAgICAgICAgLnRoZW4oKGRiOiBJREJEYXRhYmFzZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSBjcmVhdGVUcmFuc2FjdGlvbihkYiwgb3B0aW9uc0dlbmVyYXRvcihEQk1vZGUucmVhZHdyaXRlLCBzdG9yZU5hbWUsIHJlamVjdCwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuXG4gICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmdldEJ5S2V5KHN0b3JlTmFtZSwga2V5KS5zdWJzY3JpYmUoKG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShuZXdWYWx1ZSBhcyBUKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBvYmplY3RTdG9yZS5hZGQodmFsdWUsIGtleSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4gcmVqZWN0KHJlYXNvbikpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZW50cnkgYnkga2V5LlxuICAgKiBAcGFyYW0gc3RvcmVOYW1lIFRoZSBuYW1lIG9mIHRoZSBzdG9yZSB0byBxdWVyeVxuICAgKiBAcGFyYW0ga2V5IFRoZSBlbnRyeSBrZXlcbiAgICovXG4gIGdldEJ5S2V5PFQ+KHN0b3JlTmFtZTogc3RyaW5nLCBrZXk6IElEQlZhbGlkS2V5KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIGZyb20oXG4gICAgICBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIG9wZW5EYXRhYmFzZUlmRXhpc3RzKHRoaXMuaW5kZXhlZERCLCB0aGlzLmRiQ29uZmlnLm5hbWUsIHRoaXMuZGJDb25maWcudmVyc2lvbilcbiAgICAgICAgICAudGhlbigoZGI6IElEQkRhdGFiYXNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbiA9IGNyZWF0ZVRyYW5zYWN0aW9uKGRiLCBvcHRpb25zR2VuZXJhdG9yKERCTW9kZS5yZWFkb25seSwgc3RvcmVOYW1lLCByZWplY3QsIHJlc29sdmUpKTtcbiAgICAgICAgICAgIGNvbnN0IG9iamVjdFN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc3RvcmVOYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSBvYmplY3RTdG9yZS5nZXQoa2V5KSBhcyBJREJSZXF1ZXN0PFQ+O1xuICAgICAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIHJlc29sdmUoKGV2ZW50LnRhcmdldCBhcyBJREJSZXF1ZXN0PFQ+KS5yZXN1bHQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcXVlc3Qub25lcnJvciA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgcmVqZWN0KGV2ZW50KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4gcmVqZWN0KHJlYXNvbikpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZW50cnkgYnkgaWQuXG4gICAqIEBwYXJhbSBzdG9yZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHN0b3JlIHRvIHF1ZXJ5XG4gICAqIEBwYXJhbSBpZCBUaGUgZW50cnkgaWRcbiAgICovXG4gIGdldEJ5SUQ8VD4oc3RvcmVOYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcgfCBudW1iZXIpOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICByZXR1cm4gZnJvbShcbiAgICAgIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgb3BlbkRhdGFiYXNlSWZFeGlzdHModGhpcy5pbmRleGVkREIsIHRoaXMuZGJDb25maWcubmFtZSwgdGhpcy5kYkNvbmZpZy52ZXJzaW9uKVxuICAgICAgICAgIC50aGVuKChkYjogSURCRGF0YWJhc2UpID0+IHtcbiAgICAgICAgICAgIHZhbGlkYXRlQmVmb3JlVHJhbnNhY3Rpb24oZGIsIHN0b3JlTmFtZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uID0gY3JlYXRlVHJhbnNhY3Rpb24oZGIsIG9wdGlvbnNHZW5lcmF0b3IoREJNb2RlLnJlYWRvbmx5LCBzdG9yZU5hbWUsIHJlamVjdCwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdDogSURCUmVxdWVzdCA9IG9iamVjdFN0b3JlLmdldChpZCkgYXMgSURCUmVxdWVzdDxUPjtcbiAgICAgICAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICByZXNvbHZlKChldmVudC50YXJnZXQgYXMgSURCUmVxdWVzdDxUPikucmVzdWx0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4gcmVqZWN0KHJlYXNvbikpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZW50cnkgYnkgaW5kZXguXG4gICAqIEBwYXJhbSBzdG9yZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHN0b3JlIHRvIHF1ZXJ5XG4gICAqIEBwYXJhbSBpbmRleE5hbWUgVGhlIGluZGV4IG5hbWUgdG8gZmlsdGVyXG4gICAqIEBwYXJhbSBrZXkgVGhlIGVudHJ5IGtleS5cbiAgICovXG4gIGdldEJ5SW5kZXg8VD4oc3RvcmVOYW1lOiBzdHJpbmcsIGluZGV4TmFtZTogc3RyaW5nLCBrZXk6IElEQlZhbGlkS2V5KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIGZyb20oXG4gICAgICBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIG9wZW5EYXRhYmFzZUlmRXhpc3RzKHRoaXMuaW5kZXhlZERCLCB0aGlzLmRiQ29uZmlnLm5hbWUsIHRoaXMuZGJDb25maWcudmVyc2lvbilcbiAgICAgICAgICAudGhlbigoZGIpID0+IHtcbiAgICAgICAgICAgIHZhbGlkYXRlQmVmb3JlVHJhbnNhY3Rpb24oZGIsIHN0b3JlTmFtZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uID0gY3JlYXRlVHJhbnNhY3Rpb24oZGIsIG9wdGlvbnNHZW5lcmF0b3IoREJNb2RlLnJlYWRvbmx5LCBzdG9yZU5hbWUsIHJlamVjdCwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBvYmplY3RTdG9yZS5pbmRleChpbmRleE5hbWUpO1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdCA9IGluZGV4LmdldChrZXkpIGFzIElEQlJlcXVlc3Q8VD47XG4gICAgICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgoZXZlbnQudGFyZ2V0IGFzIElEQlJlcXVlc3Q8VD4pLnJlc3VsdCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHJlamVjdChyZWFzb24pKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYWxsIGVsZW1lbnRzIGZyb20gb25lIHN0b3JlXG4gICAqIEBwYXJhbSBzdG9yZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHN0b3JlIHRvIHNlbGVjdCB0aGUgaXRlbXNcbiAgICovXG4gIGdldEFsbDxUPihzdG9yZU5hbWU6IHN0cmluZyk6IE9ic2VydmFibGU8VFtdPiB7XG4gICAgcmV0dXJuIGZyb20oXG4gICAgICBuZXcgUHJvbWlzZTxUW10+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgb3BlbkRhdGFiYXNlSWZFeGlzdHModGhpcy5pbmRleGVkREIsIHRoaXMuZGJDb25maWcubmFtZSwgdGhpcy5kYkNvbmZpZy52ZXJzaW9uKVxuICAgICAgICAgIC50aGVuKChkYikgPT4ge1xuICAgICAgICAgICAgdmFsaWRhdGVCZWZvcmVUcmFuc2FjdGlvbihkYiwgc3RvcmVOYW1lLCByZWplY3QpO1xuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSBjcmVhdGVUcmFuc2FjdGlvbihkYiwgb3B0aW9uc0dlbmVyYXRvcihEQk1vZGUucmVhZG9ubHksIHN0b3JlTmFtZSwgcmVqZWN0LCByZXNvbHZlKSk7XG4gICAgICAgICAgICBjb25zdCBvYmplY3RTdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHN0b3JlTmFtZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3Q6IElEQlJlcXVlc3QgPSBvYmplY3RTdG9yZS5nZXRBbGwoKTtcblxuICAgICAgICAgICAgcmVxdWVzdC5vbmVycm9yID0gKGV2dDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgcmVqZWN0KGV2dCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9ICh7IHRhcmdldDogeyByZXN1bHQ6IFJlc3VsdEFsbCB9IH06IFJlcXVlc3RFdmVudDxUPikgPT4ge1xuICAgICAgICAgICAgICByZXNvbHZlKFJlc3VsdEFsbCBhcyBUW10pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaCgocmVhc29uKSA9PiByZWplY3QocmVhc29uKSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgaXRlbXMgZnJvbSB0aGUgc3RvcmUgYWZ0ZXIgdXBkYXRlLlxuICAgKiBAcGFyYW0gc3RvcmVOYW1lIFRoZSBuYW1lIG9mIHRoZSBzdG9yZSB0byB1cGRhdGVcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUgZm9yIHRoZSBlbnRyeVxuICAgKiBAcGFyYW0ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIHVwZGF0ZSBpZiBleGlzdHNcbiAgICovXG4gIHVwZGF0ZTxUPihzdG9yZU5hbWU6IHN0cmluZywgdmFsdWU6IFQsIGtleT86IGFueSk6IE9ic2VydmFibGU8VFtdPiB7XG4gICAgcmV0dXJuIGZyb20oXG4gICAgICBuZXcgUHJvbWlzZTxUW10+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgb3BlbkRhdGFiYXNlSWZFeGlzdHModGhpcy5pbmRleGVkREIsIHRoaXMuZGJDb25maWcubmFtZSwgdGhpcy5kYkNvbmZpZy52ZXJzaW9uKVxuICAgICAgICAgIC50aGVuKChkYikgPT4ge1xuICAgICAgICAgICAgdmFsaWRhdGVCZWZvcmVUcmFuc2FjdGlvbihkYiwgc3RvcmVOYW1lLCByZWplY3QpO1xuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSBjcmVhdGVUcmFuc2FjdGlvbihkYiwgb3B0aW9uc0dlbmVyYXRvcihEQk1vZGUucmVhZHdyaXRlLCBzdG9yZU5hbWUsIHJlamVjdCwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuXG4gICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmdldEFsbChzdG9yZU5hbWUpXG4gICAgICAgICAgICAgICAgLnBpcGUodGFrZSgxKSlcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKChuZXdWYWx1ZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3VmFsdWVzIGFzIFRbXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBrZXkgPyBvYmplY3RTdG9yZS5wdXQodmFsdWUsIGtleSkgOiBvYmplY3RTdG9yZS5wdXQodmFsdWUpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHJlamVjdChyZWFzb24pKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpdGVtIHlvdSB1cGRhdGVkIGZyb20gdGhlIHN0b3JlIGFmdGVyIHRoZSB1cGRhdGUuXG4gICAqIEBwYXJhbSBzdG9yZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHN0b3JlIHRvIHVwZGF0ZVxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIG5ldyB2YWx1ZSBmb3IgdGhlIGVudHJ5XG4gICAqIEBwYXJhbSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gdXBkYXRlXG4gICAqL1xuICB1cGRhdGVCeUtleTxUPihzdG9yZU5hbWU6IHN0cmluZywgdmFsdWU6IFQsIGtleTogSURCVmFsaWRLZXkpOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICByZXR1cm4gZnJvbShcbiAgICAgIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgb3BlbkRhdGFiYXNlSWZFeGlzdHModGhpcy5pbmRleGVkREIsIHRoaXMuZGJDb25maWcubmFtZSwgdGhpcy5kYkNvbmZpZy52ZXJzaW9uKVxuICAgICAgICAgIC50aGVuKChkYikgPT4ge1xuICAgICAgICAgICAgdmFsaWRhdGVCZWZvcmVUcmFuc2FjdGlvbihkYiwgc3RvcmVOYW1lLCByZWplY3QpO1xuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSBjcmVhdGVUcmFuc2FjdGlvbihkYiwgb3B0aW9uc0dlbmVyYXRvcihEQk1vZGUucmVhZHdyaXRlLCBzdG9yZU5hbWUsIHJlamVjdCwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuXG4gICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmdldEJ5S2V5KHN0b3JlTmFtZSwga2V5KS5zdWJzY3JpYmUoKG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShuZXdWYWx1ZSBhcyBUKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBvYmplY3RTdG9yZS5wdXQodmFsdWUsIGtleSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4gcmVqZWN0KHJlYXNvbikpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIGl0ZW1zIGZyb20gdGhlIHN0b3JlIGFmdGVyIGRlbGV0ZS5cbiAgICogQHBhcmFtIHN0b3JlTmFtZSBUaGUgbmFtZSBvZiB0aGUgc3RvcmUgdG8gaGF2ZSB0aGUgZW50cnkgZGVsZXRlZFxuICAgKiBAcGFyYW0ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGJlIGRlbGV0ZWRcbiAgICovXG4gIGRlbGV0ZTxUPihzdG9yZU5hbWU6IHN0cmluZywga2V5OiBLZXkpOiBPYnNlcnZhYmxlPFRbXT4ge1xuICAgIHJldHVybiBmcm9tKFxuICAgICAgbmV3IFByb21pc2U8VFtdPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIG9wZW5EYXRhYmFzZUlmRXhpc3RzKHRoaXMuaW5kZXhlZERCLCB0aGlzLmRiQ29uZmlnLm5hbWUsIHRoaXMuZGJDb25maWcudmVyc2lvbilcbiAgICAgICAgICAudGhlbigoZGIpID0+IHtcbiAgICAgICAgICAgIHZhbGlkYXRlQmVmb3JlVHJhbnNhY3Rpb24oZGIsIHN0b3JlTmFtZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uID0gY3JlYXRlVHJhbnNhY3Rpb24oZGIsIG9wdGlvbnNHZW5lcmF0b3IoREJNb2RlLnJlYWR3cml0ZSwgc3RvcmVOYW1lLCByZWplY3QsIHJlc29sdmUpKTtcbiAgICAgICAgICAgIGNvbnN0IG9iamVjdFN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc3RvcmVOYW1lKTtcbiAgICAgICAgICAgIG9iamVjdFN0b3JlLmRlbGV0ZShrZXkpO1xuXG4gICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmdldEFsbChzdG9yZU5hbWUpXG4gICAgICAgICAgICAgICAgLnBpcGUodGFrZSgxKSlcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKChuZXdWYWx1ZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3VmFsdWVzIGFzIFRbXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHJlamVjdChyZWFzb24pKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgZnJvbSB0aGUgc3RvcmUgYWZ0ZXIgYSBzdWNjZXNzZnVsIGRlbGV0ZS5cbiAgICogQHBhcmFtIHN0b3JlTmFtZSBUaGUgbmFtZSBvZiB0aGUgc3RvcmUgdG8gaGF2ZSB0aGUgZW50cnkgZGVsZXRlZFxuICAgKiBAcGFyYW0ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGJlIGRlbGV0ZWRcbiAgICovXG4gIGRlbGV0ZUJ5S2V5KHN0b3JlTmFtZTogc3RyaW5nLCBrZXk6IEtleSk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBmcm9tKFxuICAgICAgbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBvcGVuRGF0YWJhc2VJZkV4aXN0cyh0aGlzLmluZGV4ZWREQiwgdGhpcy5kYkNvbmZpZy5uYW1lLCB0aGlzLmRiQ29uZmlnLnZlcnNpb24pXG4gICAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgICAgICB2YWxpZGF0ZUJlZm9yZVRyYW5zYWN0aW9uKGRiLCBzdG9yZU5hbWUsIHJlamVjdCk7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbiA9IGNyZWF0ZVRyYW5zYWN0aW9uKGRiLCBvcHRpb25zR2VuZXJhdG9yKERCTW9kZS5yZWFkd3JpdGUsIHN0b3JlTmFtZSwgcmVqZWN0LCByZXNvbHZlKSk7XG4gICAgICAgICAgICBjb25zdCBvYmplY3RTdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHN0b3JlTmFtZSk7XG5cbiAgICAgICAgICAgIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBvYmplY3RTdG9yZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaCgocmVhc29uKSA9PiByZWplY3QocmVhc29uKSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHN1Y2Nlc3NmdWxseSBkZWxldGUgYWxsIGVudHJpZXMgZnJvbSB0aGUgc3RvcmUuXG4gICAqIEBwYXJhbSBzdG9yZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHN0b3JlIHRvIGhhdmUgdGhlIGVudHJpZXMgZGVsZXRlZFxuICAgKi9cbiAgY2xlYXIoc3RvcmVOYW1lOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gZnJvbShcbiAgICAgIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgb3BlbkRhdGFiYXNlSWZFeGlzdHModGhpcy5pbmRleGVkREIsIHRoaXMuZGJDb25maWcubmFtZSwgdGhpcy5kYkNvbmZpZy52ZXJzaW9uKVxuICAgICAgICAgIC50aGVuKChkYikgPT4ge1xuICAgICAgICAgICAgdmFsaWRhdGVCZWZvcmVUcmFuc2FjdGlvbihkYiwgc3RvcmVOYW1lLCByZWplY3QpO1xuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSBjcmVhdGVUcmFuc2FjdGlvbihkYiwgb3B0aW9uc0dlbmVyYXRvcihEQk1vZGUucmVhZHdyaXRlLCBzdG9yZU5hbWUsIHJlamVjdCwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuICAgICAgICAgICAgb2JqZWN0U3RvcmUuY2xlYXIoKTtcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHJlamVjdChyZWFzb24pKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgc3VjY2Vzc2Z1bGx5IGRlbGV0ZSB0aGUgREIuXG4gICAqL1xuICBkZWxldGVEYXRhYmFzZSgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gZnJvbShcbiAgICAgIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBkYiA9IGF3YWl0IG9wZW5EYXRhYmFzZUlmRXhpc3RzKHRoaXMuaW5kZXhlZERCLCB0aGlzLmRiQ29uZmlnLm5hbWUsIHRoaXMuZGJDb25maWcudmVyc2lvbik7XG4gICAgICAgICAgYXdhaXQgZGIuY2xvc2UoKTtcbiAgICAgICAgICBjb25zdCBkZWxldGVEQlJlcXVlc3QgPSB0aGlzLmluZGV4ZWREQi5kZWxldGVEYXRhYmFzZSh0aGlzLmRiQ29uZmlnLm5hbWUpO1xuICAgICAgICAgIGRlbGV0ZURCUmVxdWVzdC5vbnN1Y2Nlc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgZGVsZXRlREJSZXF1ZXN0Lm9uZXJyb3IgPSByZWplY3Q7XG4gICAgICAgICAgZGVsZXRlREJSZXF1ZXN0Lm9uYmxvY2tlZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGRlbGV0ZSBkYXRhYmFzZSBiZWNhdXNlIGl0J3MgYmxvY2tlZGApO1xuICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGV2dCkge1xuICAgICAgICAgIHJlamVjdChldnQpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3BlbiBjdXJzb3IgZXZlbnRcbiAgICogQHBhcmFtIHN0b3JlTmFtZSBUaGUgbmFtZSBvZiB0aGUgc3RvcmUgdG8gaGF2ZSB0aGUgZW50cmllcyBkZWxldGVkXG4gICAqIEBwYXJhbSBrZXlSYW5nZSBUaGUga2V5IHJhbmdlIHdoaWNoIHRoZSBjdXJzb3Igc2hvdWxkIGJlIG9wZW4gb25cbiAgICovXG4gIG9wZW5DdXJzb3Ioc3RvcmVOYW1lOiBzdHJpbmcsIGtleVJhbmdlPzogSURCS2V5UmFuZ2UpOiBPYnNlcnZhYmxlPEV2ZW50PiB7XG4gICAgcmV0dXJuIGZyb20oXG4gICAgICBuZXcgUHJvbWlzZTxFdmVudD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBvcGVuRGF0YWJhc2VJZkV4aXN0cyh0aGlzLmluZGV4ZWREQiwgdGhpcy5kYkNvbmZpZy5uYW1lLCB0aGlzLmRiQ29uZmlnLnZlcnNpb24pXG4gICAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgICAgICB2YWxpZGF0ZUJlZm9yZVRyYW5zYWN0aW9uKGRiLCBzdG9yZU5hbWUsIHJlamVjdCk7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbiA9IGNyZWF0ZVRyYW5zYWN0aW9uKGRiLCBvcHRpb25zR2VuZXJhdG9yKERCTW9kZS5yZWFkb25seSwgc3RvcmVOYW1lLCByZWplY3QsIHJlc29sdmUpKTtcbiAgICAgICAgICAgIGNvbnN0IG9iamVjdFN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc3RvcmVOYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSBrZXlSYW5nZSA9PT0gdW5kZWZpbmVkID8gb2JqZWN0U3RvcmUub3BlbkN1cnNvcigpIDogb2JqZWN0U3RvcmUub3BlbkN1cnNvcihrZXlSYW5nZSk7XG5cbiAgICAgICAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICByZXNvbHZlKGV2ZW50KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4gcmVqZWN0KHJlYXNvbikpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gYSBjdXJzb3IgYnkgaW5kZXggZmlsdGVyLlxuICAgKiBAcGFyYW0gc3RvcmVOYW1lIFRoZSBuYW1lIG9mIHRoZSBzdG9yZSB0byBxdWVyeS5cbiAgICogQHBhcmFtIGluZGV4TmFtZSBUaGUgaW5kZXggbmFtZSB0byBmaWx0ZXIuXG4gICAqIEBwYXJhbSBrZXlSYW5nZSBUaGUgcmFuZ2UgdmFsdWUgYW5kIGNyaXRlcmlhIHRvIGFwcGx5IG9uIHRoZSBpbmRleC5cbiAgICovXG4gIG9wZW5DdXJzb3JCeUluZGV4KFxuICAgIHN0b3JlTmFtZTogc3RyaW5nLFxuICAgIGluZGV4TmFtZTogc3RyaW5nLFxuICAgIGtleVJhbmdlOiBJREJLZXlSYW5nZSxcbiAgICBtb2RlOiBEQk1vZGUgPSBEQk1vZGUucmVhZG9ubHlcbiAgKTogT2JzZXJ2YWJsZTxFdmVudD4ge1xuICAgIGNvbnN0IG9icyA9IG5ldyBTdWJqZWN0PEV2ZW50PigpO1xuXG4gICAgb3BlbkRhdGFiYXNlSWZFeGlzdHModGhpcy5pbmRleGVkREIsIHRoaXMuZGJDb25maWcubmFtZSwgdGhpcy5kYkNvbmZpZy52ZXJzaW9uKVxuICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgIHZhbGlkYXRlQmVmb3JlVHJhbnNhY3Rpb24oZGIsIHN0b3JlTmFtZSwgKHJlYXNvbikgPT4ge1xuICAgICAgICAgIG9icy5lcnJvcihyZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSBjcmVhdGVUcmFuc2FjdGlvbihcbiAgICAgICAgICBkYixcbiAgICAgICAgICBvcHRpb25zR2VuZXJhdG9yKFxuICAgICAgICAgICAgbW9kZSxcbiAgICAgICAgICAgIHN0b3JlTmFtZSxcbiAgICAgICAgICAgIChyZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgb2JzLmVycm9yKHJlYXNvbik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICBvYnMubmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuICAgICAgICBjb25zdCBpbmRleCA9IG9iamVjdFN0b3JlLmluZGV4KGluZGV4TmFtZSk7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleC5vcGVuQ3Vyc29yKGtleVJhbmdlKTtcblxuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICBvYnMubmV4dChldmVudCk7XG4gICAgICAgIH07XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChyZWFzb24pID0+IG9icy5lcnJvcihyZWFzb24pKTtcblxuICAgIHJldHVybiBvYnM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgaXRlbXMgYnkgYW4gaW5kZXguXG4gICAqIEBwYXJhbSBzdG9yZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHN0b3JlIHRvIHF1ZXJ5XG4gICAqIEBwYXJhbSBpbmRleE5hbWUgVGhlIGluZGV4IG5hbWUgdG8gZmlsdGVyXG4gICAqIEBwYXJhbSBrZXlSYW5nZSAgVGhlIHJhbmdlIHZhbHVlIGFuZCBjcml0ZXJpYSB0byBhcHBseSBvbiB0aGUgaW5kZXguXG4gICAqL1xuICBnZXRBbGxCeUluZGV4PFQ+KHN0b3JlTmFtZTogc3RyaW5nLCBpbmRleE5hbWU6IHN0cmluZywga2V5UmFuZ2U6IElEQktleVJhbmdlKTogT2JzZXJ2YWJsZTxUW10+IHtcbiAgICBjb25zdCBkYXRhOiBUW10gPSBbXTtcbiAgICByZXR1cm4gZnJvbShcbiAgICAgIG5ldyBQcm9taXNlPFRbXT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBvcGVuRGF0YWJhc2VJZkV4aXN0cyh0aGlzLmluZGV4ZWREQiwgdGhpcy5kYkNvbmZpZy5uYW1lLCB0aGlzLmRiQ29uZmlnLnZlcnNpb24pXG4gICAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgICAgICB2YWxpZGF0ZUJlZm9yZVRyYW5zYWN0aW9uKGRiLCBzdG9yZU5hbWUsIHJlamVjdCk7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbiA9IGNyZWF0ZVRyYW5zYWN0aW9uKGRiLCBvcHRpb25zR2VuZXJhdG9yKERCTW9kZS5yZWFkb25seSwgc3RvcmVOYW1lLCByZWplY3QsIHJlc29sdmUpKTtcbiAgICAgICAgICAgIGNvbnN0IG9iamVjdFN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc3RvcmVOYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gb2JqZWN0U3RvcmUuaW5kZXgoaW5kZXhOYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleC5vcGVuQ3Vyc29yKGtleVJhbmdlKTtcbiAgICAgICAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGN1cnNvcjogSURCQ3Vyc29yV2l0aFZhbHVlID0gKGV2ZW50LnRhcmdldCBhcyBJREJSZXF1ZXN0PElEQkN1cnNvcldpdGhWYWx1ZT4pLnJlc3VsdDtcbiAgICAgICAgICAgICAgaWYgKGN1cnNvcikge1xuICAgICAgICAgICAgICAgIGRhdGEucHVzaChjdXJzb3IudmFsdWUpO1xuICAgICAgICAgICAgICAgIGN1cnNvci5jb250aW51ZSgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4gcmVqZWN0KHJlYXNvbikpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIHByaW1hcnkga2V5cyBieSBhbiBpbmRleC5cbiAgICogQHBhcmFtIHN0b3JlTmFtZSBUaGUgbmFtZSBvZiB0aGUgc3RvcmUgdG8gcXVlcnlcbiAgICogQHBhcmFtIGluZGV4TmFtZSBUaGUgaW5kZXggbmFtZSB0byBmaWx0ZXJcbiAgICogQHBhcmFtIGtleVJhbmdlICBUaGUgcmFuZ2UgdmFsdWUgYW5kIGNyaXRlcmlhIHRvIGFwcGx5IG9uIHRoZSBpbmRleC5cbiAgICovXG4gIGdldEFsbEtleXNCeUluZGV4KFxuICAgIHN0b3JlTmFtZTogc3RyaW5nLFxuICAgIGluZGV4TmFtZTogc3RyaW5nLFxuICAgIGtleVJhbmdlOiBJREJLZXlSYW5nZVxuICApOiBPYnNlcnZhYmxlPHsgcHJpbWFyeUtleTogYW55OyBrZXk6IGFueSB9W10+IHtcbiAgICBjb25zdCBkYXRhOiB7IHByaW1hcnlLZXk6IGFueTsga2V5OiBhbnkgfVtdID0gW107XG4gICAgcmV0dXJuIGZyb20oXG4gICAgICBuZXcgUHJvbWlzZTx7IHByaW1hcnlLZXk6IGFueTsga2V5OiBhbnkgfVtdPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIG9wZW5EYXRhYmFzZUlmRXhpc3RzKHRoaXMuaW5kZXhlZERCLCB0aGlzLmRiQ29uZmlnLm5hbWUsIHRoaXMuZGJDb25maWcudmVyc2lvbilcbiAgICAgICAgICAudGhlbigoZGIpID0+IHtcbiAgICAgICAgICAgIHZhbGlkYXRlQmVmb3JlVHJhbnNhY3Rpb24oZGIsIHN0b3JlTmFtZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uID0gY3JlYXRlVHJhbnNhY3Rpb24oZGIsIG9wdGlvbnNHZW5lcmF0b3IoREJNb2RlLnJlYWRvbmx5LCBzdG9yZU5hbWUsIHJlamVjdCwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBvYmplY3RTdG9yZS5pbmRleChpbmRleE5hbWUpO1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdCA9IGluZGV4Lm9wZW5LZXlDdXJzb3Ioa2V5UmFuZ2UpO1xuICAgICAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgY3Vyc29yOiBJREJDdXJzb3IgPSAoZXZlbnQudGFyZ2V0IGFzIElEQlJlcXVlc3Q8SURCQ3Vyc29yPikucmVzdWx0O1xuICAgICAgICAgICAgICBpZiAoY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoKHsgcHJpbWFyeUtleTogY3Vyc29yLnByaW1hcnlLZXksIGtleTogY3Vyc29yLmtleSB9KTtcbiAgICAgICAgICAgICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHJlamVjdChyZWFzb24pKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygcm93cyBpbiBhIHN0b3JlLlxuICAgKiBAcGFyYW0gc3RvcmVOYW1lIFRoZSBuYW1lIG9mIHRoZSBzdG9yZSB0byBxdWVyeVxuICAgKiBAcGFyYW0ga2V5UmFuZ2UgIFRoZSByYW5nZSB2YWx1ZSBhbmQgY3JpdGVyaWEgdG8gYXBwbHkuXG4gICAqL1xuICBjb3VudChzdG9yZU5hbWU6IHN0cmluZywga2V5UmFuZ2U/OiBJREJWYWxpZEtleSB8IElEQktleVJhbmdlKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gZnJvbShcbiAgICAgIG5ldyBQcm9taXNlPG51bWJlcj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBvcGVuRGF0YWJhc2VJZkV4aXN0cyh0aGlzLmluZGV4ZWREQiwgdGhpcy5kYkNvbmZpZy5uYW1lLCB0aGlzLmRiQ29uZmlnLnZlcnNpb24pXG4gICAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgICAgICB2YWxpZGF0ZUJlZm9yZVRyYW5zYWN0aW9uKGRiLCBzdG9yZU5hbWUsIHJlamVjdCk7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbiA9IGNyZWF0ZVRyYW5zYWN0aW9uKGRiLCBvcHRpb25zR2VuZXJhdG9yKERCTW9kZS5yZWFkb25seSwgc3RvcmVOYW1lLCByZWplY3QsIHJlc29sdmUpKTtcbiAgICAgICAgICAgIGNvbnN0IG9iamVjdFN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc3RvcmVOYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3Q6IElEQlJlcXVlc3QgPSBvYmplY3RTdG9yZS5jb3VudChrZXlSYW5nZSk7XG4gICAgICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoZSkgPT4gcmVqZWN0KGUpO1xuICAgICAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoZSkgPT4gcmVzb2x2ZSgoKGUudGFyZ2V0IGFzIElEQk9wZW5EQlJlcXVlc3QpLnJlc3VsdCBhcyB1bmtub3duKSBhcyBudW1iZXIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHJlamVjdChyZWFzb24pKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuIl19