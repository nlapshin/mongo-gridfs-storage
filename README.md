# Mongo gridFS storage.

This is a simple wrapper for the [MongoDB GridFSBucket](http://mongodb.github.io/node-mongodb-native/3.0/tutorials/gridfs/streaming/).

# Install

```sh
npm i mongo-gridfs-storage
```

# Usage

You can use mongoose connection
```js
  const MongoGridFSStore = require('mongo-gridfs-storage');

  const mongoose = await mongoose.connect('mongodb://localhost:27017/db');
  const mongoGridFsStorage = new MongoGridFSStore(mongoose.connection.db, { bucketName: 'uploads' });

  ...
```
or mongo client
```js
  const MongoGridFSStore = require('mongo-gridfs-storage');

  const mongoose = await MongoClient.connect('mongodb://localhost:27017/db');
  const mongoGridFsStorage = new MongoGridFSStore(mongoose.connection.db, { bucketName: 'uploads' });

  ...
```

# MongoGridFSStore

## Constructor

```js
  const mongoGridFsStorage = MongoGridFSStore(connection, options);
```

**connection** - MongoDB connection.

**options** - options for GridFSBucket instance.

**options.bucketName** - The 'files' and 'chunks' collections will be prefixed with the bucket name followed by a dot. Default to 'fs'.

**options.chunkSizeBytes** - Number of bytes stored in each chunk. Defaults to 255KB(255* 1024).

## Methods

### findOne

Method find one file by filename into storage or id and return [https://docs.mongodb.com/manual/core/gridfs/#the-files-collection](simple MongoDB meta-object) as Promise-Object.

```js
  const mongoGridFsStorage = MongoGridFSStore(connection);
  
  const filter = {
    filename: 'filename'
  };

  const options = {};

  const file = await mongoGridFsStorage.findOne(filter, options);
```

**filter** - search options.

**filter._id** - id for file.

**filter.id** - alias for id parameter.

**filter.filename** - filename.

id or filename are required.

**options** - options for [http://mongodb.github.io/node-mongodb-native/3.0/api/GridFSBucket.html#find](GridFSBucket find method).

**options.batchSize** - Batch size. Default to null. Optional.

**options.limit** - limit. Default to null. Optional.

**options.maxTimeMS** - maxTimeMS. Default to null. Optional.

**options.noCursorTimeout** - set cursor's noCursorTimeout flag. Default to null. Optional.

**options.skip** - skip. Default to null. Optional.

**options.sort** - sort. Default to null. Optional.

### find

Method find by filename or id into storage and return array of [https://docs.mongodb.com/manual/core/gridfs/#the-files-collection](simple MongoDB meta-object) as Promise-Object.

```js
  const mongoGridFsStorage = MongoGridFSStore(connection);
  
  const filter = {
    filename: 'filename'
  };

  const options = {};

  const file = await mongoGridFsStorage.find(filter, options);
```

**filter** - search options.

**filter._id** - id for file.

**filter.id** - alias for id parameter.

**filter.filename** - filename.

id or filename are required.

**options** - options for [http://mongodb.github.io/node-mongodb-native/3.0/api/GridFSBucket.html#find](GridFSBucket find method).

**options.batchSize** - Batch size. Default to null. Optional.

**options.limit** - limit. Default to null. Optional.

**options.maxTimeMS** - maxTimeMS. Default to null. Optional.

**options.noCursorTimeout** - set cursor's noCursorTimeout flag. Default to null. Optional.

**options.skip** - skip. Default to null. Optional.

**options.sort** - sort. Default to null. Optional.

### read

Method read file into storage by filename or id and return file buffer as Promise-Object. If file not found, then return null.

```js
  const mongoGridFsStorage = MongoGridFSStore(connection);
  
  const filter = {
    filename: 'filename'
  };

  const fileBuffer = await mongoGridFsStorage.read(filter);
```

**filter** - search options.

**filter._id** - id for file.

**filter.id** - alias for id parameter.

**filter.filename** - filename.

id or filename are required.

### write

Method write stream into storage with filename or id. Return Promise that must be resolved with a 'true' value in the end.

```js
  const mongoGridFsStorage = MongoGridFSStore(connection);

  const stream = getReadableStream();
  
  const options = {
    filename: 'filename'
  };

  const result = await mongoGridFsStorage.write(stream, options);
```

**fileStream** - readable stream.

**filter** - search options.

**filter._id** - id for file.

**filter.id** - alias for id parameter.

**filter.filename** - filename.

id or filename are required.

### delete

Method delete file into storage by filename or id. Return Promise that must be resolved with a 'true' value in the end.

```js
  const mongoGridFsStorage = MongoGridFSStore(connection);
  
  const filter = {
    filename: 'filename'
  };

  const result = await mongoGridFsStorage.delete(filter);
```

**filter** - search options.

**filter._id** - id for file.

**filter.id** - alias for id parameter.

id are required.


### findOneAndRead

Method is composition two methods: findOne and read. Method find by filename or id into storage, read it and return file Buffer. Return null if file not found.

```js
  const mongoGridFsStorage = MongoGridFSStore(connection);
  
  const filter = {
    filename: 'filename'
  };

  const result = await mongoGridFsStorage.delete(filter);
```

**filter** - search options.

**filter._id** - id for file.

**filter.id** - alias for id parameter.

**filter.filename** - filename.

filename or id are required.

# Test

```sh
npm run test
```

# License

MIT © nlapshin