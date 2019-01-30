const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const { expect } = chai;
const fs = require('fs');
const path = require('path');
const streamToPromise = require('stream-to-promise');

const MongoGridFSStore = require('../src');

const MongooseClient = require('./mongooseClient');
const mongo = new MongooseClient({ url: 'mongodb://127.0.0.1:27017/test-db' });

function getFixtureReadableStream() {
	const filePath = path.join(__dirname, 'fixtures', 'lorem_ipsum');
	return fs.createReadStream(filePath);
}

describe('MongoGridFSStore', () => {
	beforeEach(async () => {
		await mongo.start();
	});
  
	afterEach(async() => {
		await mongo.drop();
		await mongo.stop();
	});
  
	it('should execute', () => {
		const store = new MongoGridFSStore(mongo.mongoose.connection.db);
    
		expect(store).to.be.exist;
	});
  
	describe('write', function() {
		this.slow(2000);

		it('should throw error if stream is not instance of readable stream', () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			return expect(store.write()).to.eventually.be.rejectedWith(Error, /stream is not readable stream/);
		});

		it('should throw error if filename is not set', () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = getFixtureReadableStream();

			return expect(store.write(stream)).to.eventually.be.rejectedWith(Error, /filename is not set/);
		});

		it('should write file stream into storage', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = getFixtureReadableStream();
			const filename = 'tester';

			const initFiles = await store.find({ filename });

			expect(initFiles.length).to.equal(0);

			const result = await store.write(stream, { filename });

			expect(result).to.exist;

			const resultFiles = await store.find({ filename });
      
			expect(resultFiles.length).to.equal(1);
		});
	});

	describe('read', function() {
		this.slow(2000);

		it('should throw error if filename and id is not set', () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			return expect(store.read({})).to.eventually.be.rejectedWith(Error, /id or filename is not set/);
		});

		it('should read file from storage', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = getFixtureReadableStream();
			const file = await streamToPromise(getFixtureReadableStream());
			const filename = 'tester';

			await store.write(stream, { filename });
			const result = await store.read({ filename });

			expect(Buffer.compare(result, file)).to.equal(0);
		});
	});

	describe('delete', function() {
		this.slow(2000);

		it('should throw error if id is not set', () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			return expect(store.delete({})).to.eventually.be.rejectedWith(Error, /id is not set/);
		});

		it('should delete file from storage', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = getFixtureReadableStream();
			const filename = 'tester';

			await store.write(stream, { filename });
			const initFile = await store.findOne({ filename });

			expect(initFile).to.be.not.null;

			const result = await store.delete({ id: initFile._id });
			expect(result).to.be.exist;

			const endFile = await store.findOne({ filename });
			expect(endFile).to.be.null;
		});
	});

	describe('findOne', function() {
		this.slow(2000);

		it('should return null if file not found', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const filename = 'tester';

			const resultFile = await store.findOne({ filename });

			expect(resultFile).to.be.null;
		});


		it('should find one file with meta inforamtion', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = getFixtureReadableStream();
			const filename = 'tester';

			await store.write(stream, { filename });

			const resultFile = await store.findOne({ filename });

			expect(resultFile.filename).to.equal(filename);
		});
	});
  
	describe('find', function() {
		this.slow(2000);

		it('should return empty list if file not found', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const filename = 'tester';

			const resultFiles = await store.find({ filename });

			expect(resultFiles.length).to.equal(0);
		});

		it('should find meta list of files', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = getFixtureReadableStream();
			const filename = 'tester';

			await store.write(stream, { filename });

			const resultFiles = await store.find({ filename });

			expect(resultFiles.length).to.equal(1);

			const file = resultFiles[0];

			expect(file.filename).to.equal(filename);
		});
	});
  
	describe('findOneAndRead', function() {
		this.slow(2000);

		it('should return null if file not found', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const filename = 'tester';

			const resultFile = await store.findOneAndRead({ filename });

			expect(resultFile).to.be.null;
		});

		it('should find one file and then read it', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = getFixtureReadableStream();
			const filename = 'tester';
			const file = await streamToPromise(getFixtureReadableStream());

			await store.write(stream, { filename });

			const result = await store.findOneAndRead({ filename });

			expect(Buffer.compare(result, file)).to.equal(0);
		});
	});
});
