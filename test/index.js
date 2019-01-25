const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const { expect } = chai;
const fs = require('fs');
const path = require('path');

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
		const store = new MongoGridFSStore({
      mongoose: mongo.mongoose
    });
    
		expect(store).to.be.exist;
	});
  
	describe('write', function() {
    it('should throw error if stream is not instance of readable stream', () => {
      const store = new MongoGridFSStore({
        mongoose: mongo.mongoose
      });

      return expect(store.write()).to.eventually.be.rejectedWith(Error, /stream is not readable stream/);
    });

    it('should throw error if filename is not set', () => {
      const store = new MongoGridFSStore({
        mongoose: mongo.mongoose
      });

      const stream = getFixtureReadableStream();

      return expect(store.write(stream)).to.eventually.be.rejectedWith(Error, /filename is not set/);
    });

    it('should write file stream into storage', async () => {
      const store = new MongoGridFSStore({
        mongoose: mongo.mongoose
      });

      const stream = getFixtureReadableStream();
      const filename = 'tester';

      const result = await store.write(stream, { filename });

      expect(result).to.be.true;
    });
	});
});
