import Chat from "../model/chat.js";
import User from "../model/user.js";
import Message from "../model/message.js";
import Archive from "../archive.js";


class ChatController {
    static _chats = []

    static get chats() {
        return ChatController._chats
    }

    static getChat(chatID) {
        const chat = ChatController.chats.find(c => Number(c.chatID) === Number(chatID))

        if (chat) {
            return chat
        } else console.error(`Chat with chatID ${chatID} doest not exist.`);
    }

    /**
     * Creates a new chat
     * @param {string} name - Name of the chat
     * @param {int} ownerID - ID of the user creating the chat
     * @returns 
     */
    static async createChat(name, ownerID) {
        const newChat = new Chat(name, ownerID)

        if (newChat) {
            ChatController.chats.push(newChat)
            await this.save();
        }

        return newChat;
    }

    /**
     * Adds a user to a chat
     * @param {int} chatID - ID of the chat to join
     * @param {int} userID - ID of the user joining
     */
    static async addMember(chatID, userID) {
        const chat = this.getChat(chatID)

        if (chat && !chat.members.includes(userID)) {
            chat.members.push(userID)
            await this.save();
        }

    }

    static async deleteChat(chatID) {
        //Finde chat = currentID
        const chatToDelete = this.getChat(chatID)

        if (chatToDelete) {
            //Fjerne chat hos alle members og members fra chat
            // chatToBeDeleted.members.forEach((member, userID) => {
            //     member
            // });

        }
        //Fjerne alle members og fjerne chat fra alle members
        // await this.save()
    }


    /**
    *  Adds a message to ChatController
    * @param {int} chatID - The chat to be
    * @param {Message} Message Message to be saved
    */
    static async addMessage(chatID, message) {
        const chat = this.getChat(chatID)

        chat.messages.push(message)

        // const message = new Message(chat.chatID, userID, text) SKAL SKE I ROUTES

        await this.save();

    }


    /**
     * Delete a message
     * @param {int} messageID 
     */
    static async deleteMessage(chatID, messageID) {
        const chat = this.getChat(Number(chatID))
        
        if (chat) {
            // 1. Find index using the ID
            const index = chat.messages.findIndex(m => Number(m.messageID) === Number(messageID));

            // 2. If the message exists (index is not -1), remove it
            if (index !== -1) {
                chat.messages.splice(index, 1);
                await this.save();
            } else {
                console.error("Message does not exist in this chat!");
            }
        } else {
            console.error("Chat does not exist!");
        }

    }

    static async startUp() {

        let data = await Archive.readFile('./data/chats.json')

        if (data) {
            ChatController.chats = JSON.parse(data)
            const biggestID = ChatController.chats.reduce((accumulator, chat) => {
                return chat.id >= accumulator ? chat.id : accumulator
            }, 0)
            Chat.id = biggestID + 1
        }
    }


    /**
     * Saves all chats
     */
    static async save() {
        await Archive.writeFile('./data/chats.json', JSON.stringify(ChatController.chats, null, 2))
    }


}

export default ChatController

