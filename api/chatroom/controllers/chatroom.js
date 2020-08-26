'use strict';
const { sanitizeEntity } = require('strapi-utils');
const { v4: uuidV4 } = require('uuid')
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
*/

module.exports = {
    async create(ctx) {
        let entity;
        const { id } = ctx.state.user
        if (ctx.is('multipart')) {
            return ctx.throw(400, "Don't include files here")
        } else {
            const { createRoom, roomname } = ctx.request.body
            if(createRoom){
                entity = await strapi.services.chatroom.create({
                    roomid: uuidV4(),
                    roomname,
                    users: [id]
                });
            }else{
                return ctx.throw(400, "Room not created")
            }
        }
        return sanitizeEntity(entity, { model: strapi.models.chatroom });
    },
    async join(ctx) {
        const roomId  = ctx.params.id;
        const { id } = ctx.state.user

        let entity;
        if (ctx.is('multipart')) {
            return ctx.throw(400, "Don't include files here")
        } else {
            const { addUser } = ctx.request.body
            if(addUser){
                let { _id, users } = await strapi.services.chatroom.findOne({ 
                    roomid: roomId,  
                })

                const found = users.find( user => user._id == id)
                
                /* if(user._id == id){
                    return ctx.throw(400, "User already in the room")
                } */
                if(users.length < 2 || found ){
                    entity = await strapi.services.chatroom.update({ _id },{users: [...users, id]})
                }else{
                    return ctx.throw(400, "Room is full")
                }
            }else{
                return ctx.throw(400, "User not added the in the room")
            }
        }
        return sanitizeEntity(entity, { model: strapi.models.chatroom });
    },
};

