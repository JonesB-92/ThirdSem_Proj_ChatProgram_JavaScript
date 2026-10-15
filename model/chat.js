import User from "./user.js"

class Chat {
    constructor(name, ownerID) {
        this.name = name
        this.ownerID = ownerID
        
        this.members = [ownerID]
        this.messages = []
        
        this.timeCreated = new Date()
        this.chatID = Chat.id++
    }

    static id = 1;
}

export default Chat
