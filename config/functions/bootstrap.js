'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/v3.x/concepts/configurations.html#bootstrap
 */

module.exports = () => {
    const io = require('socket.io')(strapi.server);
    const { PeerServer } = require('peer')
    // const { addUser, removeUser, getUser, getUsersInRoom } = require('./user')
    const peerServer = PeerServer({port: 4000, path: '/webrtcApp' })        
    io.on('connect', socket => {
        console.log('Socket initiated sucessfully')

        socket.on('JoinRoom',({userId, roomId, userName }, callback) => {
            
            socket.join(roomId)

            socket.to(roomId).broadcast.emit('UserConnected', {userId: userId, socket: socket.id, userName: userName})
            
            socket.on('Message', async ({message,userId}) => {
                io.to(roomId).emit('NewMessage', {message,userId})
                await strapi.services.chat.create({
                    chat: message,
                    user: userId,
                    chatroom: await strapi.services.chatroom.findOne({ roomid: roomId })
                });
            })

            socket.on('PeerId', peerId => {
                socket.to(roomId).emit('IncommingCall','Phone')
                socket.to(roomId).emit('Peer', peerId)
            })

            socket.on('disconnect', () => {
                socket.to(roomId).broadcast.emit('LeftRoom',userName + ' has left the room')
            })

            callback()
        })

        socket.on('disconnect', () => console.log('a user disconnected'));
  });
  strapi.io = io;
};