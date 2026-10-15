import User from "../model/user.js"
import Archive from '../archive.js'

class UserController {
    static _users = []

    static get users() {
        return UserController._users
    }

    static set users(value) {
        UserController._users = value;
    }
    
    static getUser(userID) {
        const user = UserController.users.find(user => Number(user.userID) === Number(userID))

        if (!user) {
            throw new Error(`User with userID ${userID} does not exist.`);
        }

        return user
    }

    static getUserChats(userID) {
        const userChats = this.getUser(userID).chats

        return userChats
    }


    static getUserChat(userID, chatID) {
        const userChats = this.getUserChats(userID)

        // We just need to check if the chatID exists in the array.
        const userIsInChat = userChats.includes(chatID);

        if (!userIsInChat) {
            throw new Error(`User ${userID} is not part of Chat ${chatID}.`);
        }

        // Return the integer ID. If the Route needs the ACTUAL Chat data (messages, etc.), 
        // the Route will take this ID and pass it to ChatController.getChat(chatID).
        return chatID;
    }


    /**
     * Creates a new user
     * @param {* The users displayed name} username 
     * @param {* The users password} password 
     */
    static async createUser(username, password) {
        const newUser = new User(username, password)

        console.log("Amount of users in array" + UserController.users.length)

        UserController.users.push(newUser)

        console.log("Amount of users in array" + UserController.users.length)

        await this.save()

        return newUser
    }

    /**
     * Deletes a user
     * @param {* Target userID} userID 
     */
    static async deleteUser(userID) {
        const index = UserController.users.findIndex(u => u.userID === userID);

        if (index !== -1) {
            UserController.users.splice(index, 1);

            await this.save()

            console.log("User deleted and file updated.");

            return true;
        }

        console.log("User not found.");

        return false;
    }

    static async startUp() {

        try {
            const data = await Archive.readFile('./data/users.json')
            if (data) {
                const parsedUsers = JSON.parse(data);

                UserController.users = parsedUsers;

                if (UserController.users.length > 0) {
                    const biggestID = UserController.users.reduce((acc, user) => {
                        return Number(user.userID) >= acc ? Number(user.userID) : acc
                    }, 0)
                    User.id = biggestID + 1
                }
                console.log(`Loaded ${UserController.users.length} users.`);
            }
        } catch (e) {
            console.log("No existing users found or error reading file, starting fresh.");
            UserController.users = [];
        }
    }

    //Validering af user
    static validateUser(username, password) {
        return UserController.users.find(user => user.username === username && user.password === password)
    }


    static async login(username, password) {
        const user = UserController.validateUser(username, password)
        if (user) {
            return user
        } else {
            throw new Error('Invalid username or password')
        }

    }

    static async logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(400).json({ message: "Kunne ikke logge ud" });
            }
            res.json({ message: "Logget ud" });
        });
    }

    /**
     * Adds a chat to the users chats
     * @param {*} userID - ID of the user
     * @param {*} chatID - ChatID to add
     */
    static async addChat(userID, chatID) {
        const user = this.getUser(userID)

        if (!user.chats.includes(chatID)) {
            user.chats.push(Number(chatID))
        }

        await this.save()

    }

    static async addMessage(userID, message) {
        const user = this.getUser(userID)

        user.messages.push(message)

        await this.save();

    }


    /**
    * Saves all Users
    */
    static async save() {
        await Archive.writeFile('./data/users.json', JSON.stringify(UserController.users, null, 2))
    }

}

export default UserController

