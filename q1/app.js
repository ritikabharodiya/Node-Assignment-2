const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/admin');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    profilePic: String,
    documents: [String]
});

const User = mongoose.model('User', userSchema);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type'));
    }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('register');
});

app.post('/register', upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'documents', maxCount: 5 }]), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const profilePic = req.files['profilePic'] ? req.files['profilePic'][0].filename : '';
        const documents = req.files['documents'] ? req.files['documents'].map(file => file.filename) : [];

        const newUser = new User({
            name,
            email,
            password,
            profilePic,
            documents
        });

        await newUser.save();
        res.redirect('/files');
    } catch (error) {
        res.status(500).send('Error during registration: ' + error.message);
    }
});

app.get('/files', async (req, res) => {
    try {
        const users = await User.find();
        const files = users.flatMap(user => [user.profilePic, ...user.documents]);
        res.render('files', { files: files.filter(Boolean) });
    } catch (error) {
        res.status(500).send('Error retrieving files: ' + error.message);
    }
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filepath)) {
        res.download(filepath, filename, (err) => {
            if (err) {
                res.status(500).send('Error downloading file: ' + err.message);
            }
        });
    } else {
        res.status(404).send('File not found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});