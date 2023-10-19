const Twilio = require('twilio');

// Set your Twilio Account SID and Auth Token
const ACCOUNT_SID = 'YOUR_TWILIO_ACCOUNT_SID';
const AUTH_TOKEN = 'YOUR_TWILIO_AUTH_TOKEN';

// Initialize Twilio with your credentials
const twilioClient = Twilio(ACCOUNT_SID, AUTH_TOKEN);

// Create a Verify AccessToken
twilioClient.verify
  .services('VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
  .accessTokens.create({identity: 'identity', factorType: 'push'})
  .then(accessToken => {
    console.log(accessToken.sid);
  })
  .catch(error => {
    console.error('Error generating Verify AccessToken:', error);
  });
