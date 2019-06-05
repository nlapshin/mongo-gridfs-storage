# Mongo gridFS storage.

This is a simple wrapper for the [MongoDB GridFSBucket](http://mongodb.github.io/node-mongodb-native/3.0/tutorials/gridfs/streaming/).

# Install

```sh
npm i mongo-gridfs-storage
```

# Usage

You can use **mongoose** connection
```js
  const MongoGridFSStore = require('mongo-gridfs-storage');

  const mongoose = await mongoose.connect('mongodb://localhost:27017/db');
  const mongoGridFsStorage = new MongoGridFSStore(mongoose.connection.db, { bucketName: 'uploads' });

  ...
```
or **mongo** client
```js
  const MongoGridFSStore = require('mongo-gridfs-storage');

  const mongoose = await MongoClient.connect('mongodb://localhost:27017/db');
  const mongoGridFsStorage = new MongoGridFSStore(mongoose.connection.db, { bucketName: 'uploads' });

  ...
```

Methods short-list
```js
  const mongoGridFsStorage = new MongoGridFSStore(...);

  // Find
  const file = await mongoGridFsStorage.findOne({ filename: 'filename' }); // find one file into store.
  const files = await mongoGridFsStorage.find({ filename: 'filename' }); // find files into store.
  
  // Read
  const file = await mongoGridFsStorage.read({ filename: 'filename' }); // read file buffer into store.

  // Write
  const result = await mongoGridFsStorage.write(stream, { filename: 'filename' }); // write stream into store.

  // Delete
  const result = await mongoGridFsStorage.delete({ filename: 'filename' }); // delete file from store.

  // FindOneAndRead
  const result = await mongoGridFsStorage.findOneAndRead({ filename: 'filename' }); // find file and read buffer.
```

# MongoGridFSStore

## Constructor

* **Description**

    Created instance of mongo-gridfs-store.

* **Sample call**

    ```js
      const mongoGridFsStorage = MongoGridFSStore(connection, options);
    ```

* **Params**

    **Requried**
    
    **connection** - MongoDB connection.

  **Optional**
  
    **options** - options for GridFSBucket instance.

    **options.bucketName** - The 'files' and 'chunks' collections will be prefixed with the bucket name followed by a dot. Default to 'fs'.

    **options.chunkSizeBytes** - Number of bytes stored in each chunk. Defaults to 255KB(255* 1024).

## Methods

### findOne

* **Description**

     Method find file into MongoDB file storage by filename or id. Return array of [simple MongoDB file meta-object](https://docs.mongodb.com/manual/core/gridfs/#the-files-collection) as Promise-Object.
   
* **Sample call**

    ```js
      const mongoGridFsStorage = MongoGridFSStore(connection);
      
      const filter = {
        filename: 'filename'
      };
    
      const options = {};
    
      const file = await mongoGridFsStorage.findOne(filter, options);
    ```

* **Params**

    **Requried**
    
    **filter** - search options.

    **filter._id** - id for file.

    **filter.id** - alias for id parameter.

    **filter.filename** - filename.
    
    id or filename are required.
    
    **Optional**
    
    **options** - options for [GridFSBucket find method](http://mongodb.github.io/node-mongodb-native/3.0/api/GridFSBucket.html#find).

    **options.batchSize** - Batch size. Default to null. Optional.

    **options.limit** - limit. Default to null. Optional.

    **options.maxTimeMS** - maxTimeMS. Default to null. Optional.

    **options.noCursorTimeout** - set cursor's noCursorTimeout flag. Default to null. Optional.

    **options.skip** - skip. Default to null. Optional.

    **options.sort** - sort. Default to null. Optional.

### find

* **Description**

     Method find files into MongoDB file storage by filename or id. Return array of [simple MongoDB file meta-object](https://docs.mongodb.com/manual/core/gridfs/#the-files-collection) as Promise-Object.
   
* **Sample call**

    ```js
      const mongoGridFsStorage = MongoGridFSStore(connection);
      
      const filter = {
        filename: 'filename'
      };
    
      const options = {};
    
      const file = await mongoGridFsStorage.find(filter, options);
    ```

* **Params**

    **Requried**
    
    **filter** - search options.

    **filter._id** - id for file.

    **filter.id** - alias for id parameter.

    **filter.filename** - filename.
    
    id or filename are required.
    
    **Optional**
    
    **options** - options for [GridFSBucket find method](http://mongodb.github.io/node-mongodb-native/3.0/api/GridFSBucket.html#find).

    **options.batchSize** - Batch size. Default to null. Optional.

    **options.limit** - limit. Default to null. Optional.

    **options.maxTimeMS** - maxTimeMS. Default to null. Optional.

    **options.noCursorTimeout** - set cursor's noCursorTimeout flag. Default to null. Optional.

    **options.skip** - skip. Default to null. Optional.

    **options.sort** - sort. Default to null. Optional.

### read

* **Description**

     Method read file into MongoDB file chunk storage by filename or id. Return Buffer [simple MongoDB file meta-object](https://docs.mongodb.com/manual/core/gridfs/#the-files-collection) as Promise-Object. If file not found, then return null.
   
* **Sample call**

    ```js
      const mongoGridFsStorage = MongoGridFSStore(connection);
  
      const filter = {
        filename: 'filename'
      };

      const fileBuffer = await mongoGridFsStorage.read(filter);
    ```

* **Params**

    **Requried**
    
    **filter** - search options.

    **filter._id** - id for file.

    **filter.id** - alias for id parameter.

    **filter.filename** - filename.
    
    id or filename are required.

### write

* **Description**

     Method write readable stream into MongoDB file chunk storage and save it with filename or id, then has been set. Return Promise that must be resolved with a file id value in the end.
   
* **Sample call**

    ```js
      const mongoGridFsStorage = MongoGridFSStore(connection);

      const stream = getReadableStream();
      
      const options = {
        filename: 'filename'
      };

      const result = await mongoGridFsStorage.write(stream, options);
    ```

* **Params**

    **Requried**

    **stream** - readable stream.
    
    **filter** - search options.

    **filter._id** - id for file.

    **filter.id** - alias for id parameter.

    **filter.filename** - filename.
    
    id or filename are required.

### writeBuffer

* **Description**

    Method write buffer into MongoDB file chunk storage and save it with filename or id, then has been set. Return Promise that must be resolved with a file id value in the end.
   
* **Sample call**

    ```js
      const mongoGridFsStorage = MongoGridFSStore(connection);

      const buffer = getBuffer();
      
      const options = {
        filename: 'filename'
      };

      const result = await mongoGridFsStorage.writeBuffer(buffer, options);
    ```

* **Params**

    **Requried**

    **buffer** - Node JS buffer.
    
    **filter** - search options.

    **filter._id** - id for file.

    **filter.id** - alias for id parameter.

    **filter.filename** - filename.
    
    id or filename are required.

### delete

* **Description**

    Method remove file into MongoDB file storage by id. Return Promise that must be resolved with a file id in the end.
   
* **Sample call**

    ```js
      const mongoGridFsStorage = MongoGridFSStore(connection);
      
      const filter = {
        id: <Object ID>
      };

      const result = await mongoGridFsStorage.delete(filter);
    ```

* **Params**

    **Requried**

    **filter** - search options.

    **filter._id** - id for file.

    **filter.id** - alias for id parameter.

### findOneAndRead

* **Description**

    Method is composition two methods: findOne and read. Method find by filename or id into storage, read it and return file Buffer. Return null if file not found.
   
* **Sample call**

    ```js
      const mongoGridFsStorage = MongoGridFSStore(connection);
      
      const filter = {
        filename: 'filename'
      };

      const result = await mongoGridFsStorage.findOneAndRead(filter);
    ```

* **Params**

    **Requried**

    **stream** - readable stream.
    
    **filter** - search options.
    
    **filter._id** - id for file.

    **filter.id** - alias for id parameter.

    **filter.filename** - filename.
    
    id or filename are required.

# Test

```sh
npm run test
```

# License

MIT © [nlapshin](https://www.npmjs.com/~nlapshin)