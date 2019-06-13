const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const { expect } = chai;
const fs = require('fs');
const path = require('path');
const md5File = require('md5-file');

const MongoGridFSStore = require('../src');
const streamToPromise = require('../src/stream-to-promise');

const MongooseClient = require('./mongooseClient');
const mongo = new MongooseClient({ url: 'mongodb://dcloud_dev_db:10501/test-db' });

const filePaths = {
	lorem_ipsum: path.join(__dirname, 'fixtures', 'lorem_ipsum'),
	big_file: path.join(__dirname, 'fixtures', 'big_file'),
	temp_file: path.join(__dirname, 'fixtures', 'temp_file')
};

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
		this.timeout(3000);

		it('should throw error if stream is not instance of readable stream', () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			return expect(store.write()).to.eventually.be.rejectedWith(Error, /stream is not readable stream/);
		});

		it('should throw error if filename is not set', () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = fs.createReadStream(filePaths.lorem_ipsum);
			return expect(store.write(stream)).to.eventually.be.rejectedWith(Error, /filename is not set/);
		});

		it('should write file stream into storage', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = fs.createReadStream(filePaths.lorem_ipsum);
			const filename = 'tester';

			const initFiles = await store.find({ filename });
			expect(initFiles.length).to.equal(0);

			const result = await store.write(stream, { filename });
			expect(result).to.exist;

			const resultFiles = await store.find({ filename });
			expect(resultFiles.length).to.equal(1);
		});
	});

	describe('writeBuffer', function() {
		this.slow(2000);
		this.timeout(3000);

		it('should throw error if source data is not buffer', () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			return expect(store.writeBuffer()).to.eventually.be.rejectedWith(Error, /source data is not buffer/);
		});

		it('should write buffer into storage', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const buffer = fs.readFileSync(filePaths.lorem_ipsum);
			const filename = 'tester';

			const initFiles = await store.find({ filename });
			expect(initFiles.length).to.equal(0);

			const result = await store.writeBuffer(buffer, { filename });
			expect(result).to.exist;

			const resultFiles = await store.find({ filename });
			expect(resultFiles.length).to.equal(1);
		});
	});

	describe('read', function() {
		this.slow(2000);
		this.timeout(3000);

		it('should throw error if filename and id is not set', () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			return expect(store.read({})).to.eventually.be.rejectedWith(Error, /id or filename is not set/);
		});

		it('should read file from storage', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = fs.createReadStream(filePaths.lorem_ipsum);
			const file = await streamToPromise(fs.createReadStream(filePaths.lorem_ipsum));
			const filename = 'tester';

			await store.write(stream, { filename });
			const result = await store.read({ filename });

			expect(Buffer.compare(result, file)).to.equal(0);
		});
	});

	describe('delete', function() {
		this.slow(2000);
		this.timeout(3000);

		it('should throw error if id is not set', () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			return expect(store.delete({})).to.eventually.be.rejectedWith(Error, /id is not set/);
		});

		it('should delete file from storage', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = fs.createReadStream(filePaths.lorem_ipsum);
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
		this.timeout(3000);

		it('should return null if file not found', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const filename = 'tester';

			const resultFile = await store.findOne({ filename });
			expect(resultFile).to.be.null;
		});


		it('should find one file with meta inforamtion', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const stream = fs.createReadStream(filePaths.lorem_ipsum);
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

			const stream = fs.createReadStream(filePaths.lorem_ipsum);
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

			const stream = fs.createReadStream(filePaths.lorem_ipsum);
			const filename = 'tester';
			const file = await streamToPromise(fs.createReadStream(filePaths.lorem_ipsum));

			await store.write(stream, { filename });

			const result = await store.findOneAndRead({ filename });
			expect(Buffer.compare(result, file)).to.equal(0);
		});
	});

	describe('e2e', function() {
		it('should correct write big file into storage and correct read it', async () => {
			const store = new MongoGridFSStore(mongo.mongoose.connection.db);

			const inputBuffer = fs.readFileSync(filePaths.big_file);

			const inputCompareParams = {
				buffer: inputBuffer,
				length: inputBuffer.length,
				md5: md5File.sync(filePaths.big_file)
			};

			const id = await store.writeBuffer(inputBuffer, { filename: 'filename' });
			const outputFile = await store.read({ id });

			fs.writeFileSync(filePaths.temp_file, outputFile);
			const outputBuffer = fs.readFileSync(filePaths.temp_file);

			const outputCompareParams = {
				buffer: outputBuffer,
				length: outputBuffer.length,
				md5: md5File.sync(filePaths.temp_file)
			};

			fs.unlinkSync(filePaths.temp_file);

			expect(inputCompareParams.length).to.equal(outputCompareParams.length);
			expect(inputCompareParams.md5).to.equal(outputCompareParams.md5);
			expect(Buffer.compare(inputCompareParams.buffer, outputCompareParams.buffer) === 0).to.be.true;
		}).slow(2000);
	});
});
