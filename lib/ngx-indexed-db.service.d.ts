import { DBConfig, Key, ObjectStoreMeta, DBMode } from './ngx-indexed-db.meta';
import { Observable } from 'rxjs';
export declare class NgxIndexedDBService {
    private dbConfig;
    private platformId;
    private readonly isBrowser;
    private indexedDB;
    constructor(dbConfig: DBConfig, platformId: any);
    /**
     * Allows to crate a new object store ad-hoc
     * @param storeName The name of the store to be created
     * @param migrationFactory The migration factory if exists
     */
    createObjectStore(storeSchema: ObjectStoreMeta, migrationFactory?: () => {
        [key: number]: (db: IDBDatabase, transaction: IDBTransaction) => void;
    }): void;
    /**
     * Adds new entry in the store and returns its key
     * @param storeName The name of the store to add the item
     * @param value The entry to be added
     * @param key The optional key for the entry
     */
    add<T>(storeName: string, value: T, key?: any): Observable<number>;
    /**
     * Adds new entries in the store and returns its key
     * @param storeName The name of the store to add the item
     * @param values The entries to be added containing optional key attribute
     */
    bulkAdd<T>(storeName: string, values: T & {
        key?: any;
    }[]): Observable<number[]>;
    /**
     * Adds new entry in the store and returns the item that was added
     * @param storeName The name of the store to add the item
     * @param value The entry to be added
     * @param key The optional key for the entry
     */
    addItem<T>(storeName: string, value: T, key?: any): Observable<T>;
    /**
     * Adds new entry in the store and returns the item that was added
     * @param storeName The name of the store to add the item
     * @param value The entry to be added
     * @param key The key for the entry
     */
    addItemWithKey<T>(storeName: string, value: T, key: IDBValidKey): Observable<T>;
    /**
     * Returns entry by key.
     * @param storeName The name of the store to query
     * @param key The entry key
     */
    getByKey<T>(storeName: string, key: IDBValidKey): Observable<T>;
    /**
     * Returns entry by id.
     * @param storeName The name of the store to query
     * @param id The entry id
     */
    getByID<T>(storeName: string, id: string | number): Observable<T>;
    /**
     * Returns entry by index.
     * @param storeName The name of the store to query
     * @param indexName The index name to filter
     * @param key The entry key.
     */
    getByIndex<T>(storeName: string, indexName: string, key: IDBValidKey): Observable<T>;
    /**
     * Return all elements from one store
     * @param storeName The name of the store to select the items
     */
    getAll<T>(storeName: string): Observable<T[]>;
    /**
     * Returns all items from the store after update.
     * @param storeName The name of the store to update
     * @param value The new value for the entry
     * @param key The key of the entry to update if exists
     */
    update<T>(storeName: string, value: T, key?: any): Observable<T[]>;
    /**
     * Returns the item you updated from the store after the update.
     * @param storeName The name of the store to update
     * @param value The new value for the entry
     * @param key The key of the entry to update
     */
    updateByKey<T>(storeName: string, value: T, key: IDBValidKey): Observable<T>;
    /**
     * Returns all items from the store after delete.
     * @param storeName The name of the store to have the entry deleted
     * @param key The key of the entry to be deleted
     */
    delete<T>(storeName: string, key: Key): Observable<T[]>;
    /**
     * Returns true from the store after a successful delete.
     * @param storeName The name of the store to have the entry deleted
     * @param key The key of the entry to be deleted
     */
    deleteByKey(storeName: string, key: Key): Observable<boolean>;
    /**
     * Returns true if successfully delete all entries from the store.
     * @param storeName The name of the store to have the entries deleted
     */
    clear(storeName: string): Observable<boolean>;
    /**
     * Returns true if successfully delete the DB.
     */
    deleteDatabase(): Observable<boolean>;
    /**
     * Returns the open cursor event
     * @param storeName The name of the store to have the entries deleted
     * @param keyRange The key range which the cursor should be open on
     */
    openCursor(storeName: string, keyRange?: IDBKeyRange): Observable<Event>;
    /**
     * Open a cursor by index filter.
     * @param storeName The name of the store to query.
     * @param indexName The index name to filter.
     * @param keyRange The range value and criteria to apply on the index.
     */
    openCursorByIndex(storeName: string, indexName: string, keyRange: IDBKeyRange, mode?: DBMode): Observable<Event>;
    /**
     * Returns all items by an index.
     * @param storeName The name of the store to query
     * @param indexName The index name to filter
     * @param keyRange  The range value and criteria to apply on the index.
     */
    getAllByIndex<T>(storeName: string, indexName: string, keyRange: IDBKeyRange): Observable<T[]>;
    /**
     * Returns all primary keys by an index.
     * @param storeName The name of the store to query
     * @param indexName The index name to filter
     * @param keyRange  The range value and criteria to apply on the index.
     */
    getAllKeysByIndex(storeName: string, indexName: string, keyRange: IDBKeyRange): Observable<{
        primaryKey: any;
        key: any;
    }[]>;
    /**
     * Returns the number of rows in a store.
     * @param storeName The name of the store to query
     * @param keyRange  The range value and criteria to apply.
     */
    count(storeName: string, keyRange?: IDBValidKey | IDBKeyRange): Observable<number>;
}
