import { __awaiter } from "tslib";
export function openDatabase(indexedDB, dbName, version, upgradeCallback) {
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
export function openDatabaseIfExists(indexedDB, dbName, version) {
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
export function CreateObjectStore(indexedDB, dbName, version, storeSchemas, migrationFactory) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWluZGV4ZWQtZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtaW5kZXhlZC1kYi9zcmMvbGliL25neC1pbmRleGVkLWRiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxNQUFNLFVBQVUsWUFBWSxDQUMxQixTQUFxQixFQUNyQixNQUFjLEVBQ2QsT0FBZSxFQUNmLGVBQW9EO0lBRXBELE9BQU8sSUFBSSxPQUFPLENBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNkLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1NBQ25DO1FBQ0QsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEQsSUFBSSxFQUFlLENBQUM7UUFDcEIsT0FBTyxDQUFDLFNBQVMsR0FBRyxDQUFDLEtBQVksRUFBRSxFQUFFO1lBQ25DLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNkLENBQUMsQ0FBQztRQUNGLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtZQUNqQyxNQUFNLENBQUMsb0JBQW9CLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQztRQUNGLElBQUksT0FBTyxlQUFlLEtBQUssVUFBVSxFQUFFO1lBQ3pDLE9BQU8sQ0FBQyxlQUFlLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtnQkFDekMsZUFBZSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUM7U0FDSDtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELE1BQU0sVUFBZ0Isb0JBQW9CLENBQ3hDLFNBQXFCLEVBQ3JCLE1BQWMsRUFDZCxPQUFnQjs7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b3J0IHsgT2JqZWN0U3RvcmVNZXRhLCBPYmplY3RTdG9yZVNjaGVtYSB9IGZyb20gJy4vbmd4LWluZGV4ZWQtZGIubWV0YSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuRGF0YWJhc2UoXG4gIGluZGV4ZWREQjogSURCRmFjdG9yeSxcbiAgZGJOYW1lOiBzdHJpbmcsXG4gIHZlcnNpb246IG51bWJlcixcbiAgdXBncmFkZUNhbGxiYWNrPzogKGE6IEV2ZW50LCBiOiBJREJEYXRhYmFzZSkgPT4gdm9pZFxuKTogUHJvbWlzZTxJREJEYXRhYmFzZT4ge1xuICByZXR1cm4gbmV3IFByb21pc2U8SURCRGF0YWJhc2U+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoIWluZGV4ZWREQikge1xuICAgICAgcmVqZWN0KCdJbmRleGVkREIgbm90IGF2YWlsYWJsZScpO1xuICAgIH1cbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4oZGJOYW1lLCB2ZXJzaW9uKTtcbiAgICBsZXQgZGI6IElEQkRhdGFiYXNlO1xuICAgIHJlcXVlc3Qub25zdWNjZXNzID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgZGIgPSByZXF1ZXN0LnJlc3VsdDtcbiAgICAgIHJlc29sdmUoZGIpO1xuICAgIH07XG4gICAgcmVxdWVzdC5vbmVycm9yID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgcmVqZWN0KGBJbmRleGVkREIgZXJyb3I6ICR7cmVxdWVzdC5lcnJvcn1gKTtcbiAgICB9O1xuICAgIGlmICh0eXBlb2YgdXBncmFkZUNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0Lm9udXBncmFkZW5lZWRlZCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgdXBncmFkZUNhbGxiYWNrKGV2ZW50LCBkYik7XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuRGF0YWJhc2VJZkV4aXN0cyhcbiAgaW5kZXhlZERCOiBJREJGYWN0b3J5LFxuICBkYk5hbWU6IHN0cmluZyxcbiAgdmVyc2lvbj86IG51bWJlclxuKTogUHJvbWlzZTxJREJEYXRhYmFzZT4ge1xuICBpZiAoISgnZGF0YWJhc2VzJyBpbiBpbmRleGVkREIpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbmRleGVkREIgZGF0YWJhc2VzKCkgbWV0aG9kIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyLicpO1xuICB9XG5cbiAgLy8gQHRzLWlnbm9yZVxuICBjb25zdCBkYXRhYmFzZXMgPSBhd2FpdCBpbmRleGVkREIuZGF0YWJhc2VzKCk7XG4gIGNvbnN0IGRiRXhpc3RzID0gZGF0YWJhc2VzLnNvbWUoKGRiKSA9PiBkYi5uYW1lID09PSBkYk5hbWUpO1xuXG4gIGlmICghZGJFeGlzdHMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYERhdGFiYXNlIFwiJHtkYk5hbWV9XCIgZG9lcyBub3QgZXhpc3QuYCk7XG4gIH1cblxuICBjb25zb2xlLmxvZygnZGJFeGlzdHMnLCBkYkV4aXN0cyk7XG5cbiAgcmV0dXJuIG9wZW5EYXRhYmFzZShpbmRleGVkREIsIGRiTmFtZSwgdmVyc2lvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDcmVhdGVPYmplY3RTdG9yZShcbiAgaW5kZXhlZERCOiBJREJGYWN0b3J5LFxuICBkYk5hbWU6IHN0cmluZyxcbiAgdmVyc2lvbjogbnVtYmVyLFxuICBzdG9yZVNjaGVtYXM6IE9iamVjdFN0b3JlTWV0YVtdLFxuICBtaWdyYXRpb25GYWN0b3J5PzogKCkgPT4geyBba2V5OiBudW1iZXJdOiAoZGI6IElEQkRhdGFiYXNlLCB0cmFuc2FjdGlvbjogSURCVHJhbnNhY3Rpb24pID0+IHZvaWQgfVxuKTogdm9pZCB7XG4gIGlmICghaW5kZXhlZERCKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHJlcXVlc3Q6IElEQk9wZW5EQlJlcXVlc3QgPSBpbmRleGVkREIub3BlbihkYk5hbWUsIHZlcnNpb24pO1xuXG4gIHJlcXVlc3Qub251cGdyYWRlbmVlZGVkID0gKGV2ZW50OiBJREJWZXJzaW9uQ2hhbmdlRXZlbnQpID0+IHtcbiAgICBjb25zdCBkYXRhYmFzZTogSURCRGF0YWJhc2UgPSAoZXZlbnQudGFyZ2V0IGFzIGFueSkucmVzdWx0O1xuXG4gICAgc3RvcmVTY2hlbWFzLmZvckVhY2goKHN0b3JlU2NoZW1hOiBPYmplY3RTdG9yZU1ldGEpID0+IHtcbiAgICAgIGlmICghZGF0YWJhc2Uub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhzdG9yZVNjaGVtYS5zdG9yZSkpIHtcbiAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSBkYXRhYmFzZS5jcmVhdGVPYmplY3RTdG9yZShzdG9yZVNjaGVtYS5zdG9yZSwgc3RvcmVTY2hlbWEuc3RvcmVDb25maWcpO1xuICAgICAgICBzdG9yZVNjaGVtYS5zdG9yZVNjaGVtYS5mb3JFYWNoKChzY2hlbWE6IE9iamVjdFN0b3JlU2NoZW1hKSA9PiB7XG4gICAgICAgICAgb2JqZWN0U3RvcmUuY3JlYXRlSW5kZXgoc2NoZW1hLm5hbWUsIHNjaGVtYS5rZXlwYXRoLCBzY2hlbWEub3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3Qgc3RvcmVNaWdyYXRpb25zID0gbWlncmF0aW9uRmFjdG9yeSAmJiBtaWdyYXRpb25GYWN0b3J5KCk7XG4gICAgaWYgKHN0b3JlTWlncmF0aW9ucykge1xuICAgICAgT2JqZWN0LmtleXMoc3RvcmVNaWdyYXRpb25zKVxuICAgICAgICAubWFwKChrKSA9PiBwYXJzZUludChrLCAxMCkpXG4gICAgICAgIC5maWx0ZXIoKHYpID0+IHYgPiBldmVudC5vbGRWZXJzaW9uKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYSAtIGIpXG4gICAgICAgIC5mb3JFYWNoKCh2KSA9PiB7XG4gICAgICAgICAgc3RvcmVNaWdyYXRpb25zW3ZdKGRhdGFiYXNlLCByZXF1ZXN0LnRyYW5zYWN0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGF0YWJhc2UuY2xvc2UoKTtcbiAgfTtcblxuICByZXF1ZXN0Lm9uc3VjY2VzcyA9IChlOiBhbnkpID0+IHtcbiAgICBlLnRhcmdldC5yZXN1bHQuY2xvc2UoKTtcbiAgfTtcbn1cbiJdfQ==