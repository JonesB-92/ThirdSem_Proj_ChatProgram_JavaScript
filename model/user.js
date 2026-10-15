import Chat from "./chat.js";

class User {
    //En ejer består af et id, et brugernavn og et kodeord samt en oprettelsesdato og brugerniveau
    // (1-3)

    constructor(username, password) {
        this.userID = User.id++
        this.username = username
        this.password = password
        this.dateCreated = new Date()
        
        this.messages = [];
        this.chats = [];
        this.currentChatID = 0
        this.isGM = false;
    }
    static id = 1
    
}

export default User