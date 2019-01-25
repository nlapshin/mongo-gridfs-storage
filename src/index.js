const pump = require('pump-promise');

const { Readable } = require('stream');
const { isUndefined } = require('lodash');

module.exports = class MongoGridFSStore {
  constructor(config = {}) {
    this.connection = null;
    this.storage = null;

    this.bucketName = config.bucketName || 'fs';
    this.chunkSizeBytes = config.chunkSizeBytes || 255 * 1024;

    if (config.mongoose) {
      const mongoose = config.mongoose;
      const GridFSBucket = config.mongoose.mongo.GridFSBucket;
      
      this.connection = mongoose.connection;

      if (this.connection.readyState !== 1) {
        throw new Error('Mongoose is not connected');
      }

      this.storage = new GridFSBucket(this.connection.db, {
        bucketName: this.bucketName,
        chunkSizeBytes: this.chunkSizeBytes
		  });
    } else {
      throw new Error('Mongo connection is not supported');
    }
  }

  find(filter = {}, options = {}) {
    return new Promise((res, rej) => {
      const cursor = this.storage.find(filter, options);

      if (!cursor) { 
        return rej(new Error('Collection not found')); 
      };

      cursor.next(res);
    });
  }

  read(filter = {}) {

  }

  async write(sourceStream, options = {}) {
    try {
      if ((sourceStream instanceof Readable) !== true) {
        throw new Error('stream is not readable stream');
      }
  
      if (isUndefined(options.filename)) {
        throw new Error('filename is not set');
      }
  
      const { id, filename } = options;
      const gridFSStream = id ? 
        this.storage.openUploadStreamWithId(id, filename, options) :
        this.storage.openUploadStream(filename, options);
  
      await pump(sourceStream, gridFSStream);

      return Promise.resolve(true);
    } catch(error) {
      throw error;
    }
  }

  delete(filter = {}) {

  }
}