module.exports = function(stream) {
	if (!stream.readable) return Promise.resolve([]);

	return new Promise((res, rej) => {
		let buffers = [];

		stream
			.on('data', onData)
			.on('error', onError)
			.on('end', onEnd);

		function onData(buffer) {
			buffers.push(buffer);
		}
    
		function onError(error) {
			rej(error);
			cleanup();
		}

		function onEnd(error) {
			if (error) {
				rej(error);
			} else {
				res(Buffer.concat(buffers));
			}
      
			cleanup();
		}

		function cleanup() {
			stream.removeListener('data', onData);
			stream.removeListener('end', onEnd);
			stream.removeListener('error', onEnd);
		}
	});
};