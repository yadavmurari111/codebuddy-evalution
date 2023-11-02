// require('dotenv').config();
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const express = require('express');
const app = express();
const port = 5000;

// use the Express JSON middleware
app.use(express.json());

const ACCOUNT_SID = 'ACaae70ff76447aa3604d8838c9ca6016a';
const API_KEY_SID = 'SKf53f8039a45a382f463f74ce51eead09';
const API_KEY_SECRET = 'W9HvAgiUxqzoph6IEqLmSKeOe2xKu1O6';

// create the twilioClient
const twilioClient = require('twilio')(API_KEY_SID, API_KEY_SECRET, {
  accountSid: ACCOUNT_SID,
});

const findOrCreateRoom = async roomName => {
  try {
    // see if the room exists already. If it doesn't, this will throw
    // error 20404.
    await twilioClient.video.rooms(roomName).fetch();
  } catch (error) {
    // the room was not found, so create it
    if (error.code === 20404) {
      await twilioClient.video.rooms.create({
        uniqueName: roomName,
        type: 'go',
      });
    } else {
      // let other errors bubble up
      throw error;
    }
  }
};

const getAccessToken = (roomName, identityName) => {
  try {
    // create an access token
    const token = new AccessToken(
      ACCOUNT_SID,
      API_KEY_SID,
      API_KEY_SECRET,
      // generate a random unique identity for this participant
      {identity: identityName},
    );
    // create a video grant for this specific room
    const videoGrant = new VideoGrant({
      room: roomName,
    });

    // add the video grant
    token.addGrant(videoGrant);
    // serialize the token and return it
    console.log(token.toJwt());
    return token.toJwt();
  } catch (error) {
    // Handle any errors that may occur during token generation
    console.error('Error generating access token:', error);
    return null; // or throw an error, depending on your use case
  }
};

app.post('/join-room', async (req, res) => {
  try {
    console.log('-----calling api-----');
    // return 400 if the request has an empty body or no roomName
    if (!req.body || !req.body.roomName) {
      return res.status(400).send('Must include roomName argument.');
    }
    const roomName = req.body.roomName;
    const identityName = req.body.identityName;
    console.log(roomName, '-----roomName-----');
    console.log(identityName, '-----identityName-----');
    // find or create a room with the given roomName
    await findOrCreateRoom(roomName);
    // generate an Access Token for a participant in this room
    const token = getAccessToken(roomName, identityName);
    res.send({
      token: token,
    });
  } catch (error) {
    console.error('Error in /join-room route:', error);
    res.status(500).send('Internal Server Error'); // or return an appropriate error response
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
