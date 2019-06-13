const { GridFSBucket } = require('mongodb');

const pump = require('pump-promise');

const { Readable } = require('stream');

const streamToPromise = require('./stream-to-promise');
const isUndefined = require('./is-undefined');

module.exports = class MongoGridFSStore {
	constructor(connection = null, config = {}) {
		this.connection = connection;
		this.storage = null;

		this.bucketName = config.bucketName || 'fs';
		this.chunkSizeBytes = config.chunkSizeBytes || 255 * 1024;

		this.storage = new GridFSBucket(this.connection, {
			bucketName: this.bucketName,
			chunkSizeBytes: this.chunkSizeBytes
		});
	}

	find(filter = {}, options = {}) {
		const cursor = this.storage.find(filter, options);

		if (!cursor) { 
			throw new Error('Collection not found'); 
		}

		return cursor.toArray();
	}

	findOne(filter = {}, options = {}) {
		options.limit = 1;

		const cursor = this.storage.find(filter, options);

		if (!cursor) { 
			throw new Error('Collection not found'); 
		}

		return cursor.next();
	}

	async read(filter = {}) {
		try {
			if (isUndefined(filter._id) && isUndefined(filter.id) && isUndefined(filter.filename)) {
				throw new Error('id or filename is not set');
			}
  
			const { _id, id, filename } = filter;
			const __id = _id ? _id : id;

			const gridFSStream = __id ? 
				this.storage.openDownloadStream(__id) :
				this.storage.openDownloadStreamByName(filename);
  
			const result = await streamToPromise(gridFSStream);

			return Promise.resolve(result);
		} catch(error) {
			throw error;
		}
	}

	async write(sourceStream, options = {}) {
		try {
			if ((sourceStream instanceof Readable) !== true) {
				throw new Error('stream is not readable stream');
			}
  
			if (isUndefined(options.filename)) {
				throw new Error('filename is not set');
			}
  
			const { _id, id, filename } = options;
			const __id = _id ? _id : id;

			const gridFSStream = __id ? 
				this.storage.openUploadStreamWithId(__id, filename, options) :
				this.storage.openUploadStream(filename, options);
  
			await pump(sourceStream, gridFSStream);

			return Promise.resolve(gridFSStream.id);
		} catch(error) {
			throw error;
		}
	}

	async writeBuffer(sourceBuffer, options = {}) {
		if (Buffer.isBuffer(sourceBuffer) !== true) {
			throw new Error('source data is not buffer');
		}

		const sourceStream = new Readable();

		sourceStream.push(sourceBuffer);
		sourceStream.push(null);
		
		return this.write(sourceStream, options);
	}

	async delete(filter = {}) {
		try {
			if (isUndefined(filter._id) && isUndefined(filter.id)) {
				throw new Error('id is not set');
			}
  
			const { _id, id } = filter;
			const __id = _id ? _id : id;

			const gridFSStream = this.storage.delete(__id);
			await streamToPromise(gridFSStream);

			return Promise.resolve(__id);
		} catch(error) {
			throw error;
		}
	}
  
	async findOneAndRead(filter = {}) {
		const file = await this.findOne(filter);

		if (file) {
			return this.read(file);
		}

		return null;
	}
};