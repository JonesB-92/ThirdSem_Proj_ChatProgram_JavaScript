import express from 'express'
import session from 'express-session'

// Controllers
import ChatController from './controller/chatcontroller.js';
import UserController from './controller/usercontroller.js';

const app = express();

await UserController.startUp()
await ChatController.startUp()

app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json())
app.use('/chat', ChatController);
app.use('/user', UserController);

app.use(session({
    secret: "secret@agent",
    saveUninitialized: true,
    resave: true
}))

// Test setup
const initializeSystem = async () => {
    if (UserController.users.length === 0) {
        console.log("Initializing admin user...");
        
        const admin = await UserController.createUser("123", "123");
        const chat = await ChatController.createChat("MyChat", admin.userID);
        
        UserController.addChat(admin.userID, chat);
        ChatController.addMember(chat.chatID, admin.userID);

        console.log("System initialized with Admin ID:", admin.userID);
    }
};

await initializeSystem();


// Main page
app.get('/', (req, res) => {
    res.render('login')
})

app.get('/frontpage', (req, res) => {
    if (!req.session.userID) return res.redirect('/');

    const user = UserController.users.find(u => Number(u.userID) === Number(req.session.userID));
    if (!user) return res.redirect('/');

    const userChatIDs = user.chats || [];
    const userChatObjects = userChatIDs.map(id => {
        return ChatController.chats.find(c => Number(c.chatID) === Number(id));
    }).filter(chat => chat !== undefined);

    if (!user.currentChatID && user.chats.length > 0) {
        user.currentChatID = user.chats[0].chatID;
    }

    const currentChat = ChatController.chats.find(c => c.chatID === user.currentChatID);

    res.render('frontpage', {
        username: user.username,
        id: user.userID,
        chat: currentChat,
        chats: userChatObjects
    })
})

// Login page
app.post('/login', (req, res) => {
    const { username, password } = req.body
    const user = UserController.users.find(u => u.username === username && u.password === password)

    if (user) {
        req.session.username = user.username
        req.session.userID = user.userID
        return res.redirect('/frontpage')
    } else {
        return res.send('Ugyldigt brugernavn eller kodeord. <a href="/">Prøv igen</a>');
    }
})

// Post message
app.post('/writeMessage', async (req, res) => {
    const { user: userID, content } = req.body
    const user = UserController.getUser(userID);

    if (user && content) {
        try {
            await ChatController.addMessage(user, content);
            res.redirect('/frontpage');
        } catch (error) {
            console.error(error);
            res.status(500).send("Fejl ved afsendelse af besked.");
        }
    } else {
        res.redirect('/frontpage');
    }
})

app.post('/createChat', async (req, res) => {
    const userID = req.session.userID; // Get ID safely from the session
    const { chatName } = req.body;     // Get the name from the form
    
    // const { user: userID, chatName} = req.body
    const user = UserController.getUser(userID)

    if (user && chatName){
        try {
            const newChat = await ChatController.createChat(chatName, userID) //createChat adder chat til controller automatisk
            await UserController.addChat(userID, newChat.chatID)
            user.currentChatID = newChat.chatID
            
            res.redirect('/frontpage')
        } catch (error){
            console.error(error)
            res.status(500).send("Fejl ved oprettelse af chat")
        }
    } else {
        res.redirect('/frontpage')
    }
})

app.get('/switchChat', async (req, res) => {
    if (!req.session.userID) return res.redirect('/');

    const chatID = Number(req.query.chatID);
    const user = UserController.users.find(u => u.userID === req.session.userID);
    const chat = ChatController.chats.find(c => c.chatID === chatID);

    if (user && chat && user.chats.includes(chatID)) {
        user.currentChatID = chatID;
        await UserController.save();
    }
    res.redirect('/frontpage');
})


app.get('/users', (req, res) => {
    if (!req.session.userID) return res.redirect('/');

    const users = UserController.users.map(u => ({ userID: u.userID, username: u.username }));
    res.render('users', { users });
})

app.get('/api/users/:id', (req, res) => {
    if (!req.session.userID) return res.status(401).json({ error: 'Not logged in' });

    const userID = Number(req.params.id);
    const user = UserController.getUser(userID);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userChats = user.chats.map(chatID => {
        return ChatController.getChat(chatID);
    }).filter(chat => chat !== undefined);

    res.json({ user: { userID: user.userID, username: user.username }, userChats });
})

app.listen(5000, () => {
    console.log('Serveren kører på port 5000');
})