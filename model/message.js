import Chat from "./chat.js"
import User from "./user.js"

class Message {
    constructor(text, userID, chatID){
        this.messageID = Message.id++
        this.text = text
        this.timeCreated = new Date()
        this.userID = userID
        this.chatID = chatID
    }
    static id = 1;
}

export default Message

