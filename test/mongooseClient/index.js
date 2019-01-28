const mongoose = require('mongoose');

module.exports = class MongooseClient {
	static mongooseInitialize() {
		mongoose.Promise = global.Promise;
		mongoose.set('useNewUrlParser', true);
		mongoose.set('useFindAndModify', false);
		mongoose.set('useCreateIndex', true);
	}

	constructor(config = {}) {
		MongooseClient.mongooseInitialize();

		this.config = config;
		this.mongoose = mongoose;
	}

	start() {
		const { url } = this.config;
		const mongooseOptions = {
			useNewUrlParser: true
		};
    
		return mongoose.connect(url, mongooseOptions);
	}

	drop() {
		return mongoose.connection.dropDatabase();
	}

	stop() {
		return mongoose.connection.close();
	}
};