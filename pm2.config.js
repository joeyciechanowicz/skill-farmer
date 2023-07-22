module.exports = {
	apps: [
		{
			name: 'app',
			script: 'NODE_ENV=production node -r dotenv/config build',
			args: ''
		}
	]
};
