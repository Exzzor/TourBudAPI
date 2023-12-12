const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./database.js');
const nanoid = import('nanoid');
require('dotenv').config();

const maxExpire = 3 * 24 * 60 * 60;

const SECRET_STRING = 'dahdaodahod2310317831od '; 
/*const createToken = (id) => jwt.sign({ id }, process.env.SECRET_STRING, {
    expiresIn: maxExpire,
    
});*/

const createToken = (id) => {
    return jwt.sign({ id }, SECRET_STRING, { expiresIn: maxExpire });
  };

exports.getAllMember = async (req, res) => {
    const result = await db.promise().query('SELECT * FROM member');
    res.send(result[0]);
};

exports.signupPost = async (req, res) => {
    const {
        username,
        password,
        email,
    } = req.body;

    const id = nanoid.nanoid;
    
    if (username === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Gagal menambah member baru, username diperlukan!',
        });
        response.status(400);
        return response;
    }
    if (username.length < 6) {
        const response = res.send({
            status: 'Gagal',
            message: 'Panjang username harus 6 karakter atau lebih!',
        });
        response.status(400);
        return response;
    }
    if (password === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Gagal menambah member baru, password diperlukan!',
        });
        response.status(400);
        return response;
    }
    if (password.length < 6) {
        const response = res.send({
            status: 'Gagal',
            message: 'Panjang password harus 6 karakter atau lebih!',
        });
        response.status(400);
        return response;
    }
    if (email === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Gagal menambah member baru, email diperlukan!',
        });
        response.status(400);
        return response;
    }

    /*const [rows] = await db.promise().query(`SELECT * FROM member WHERE id= '${req.body.id}'`);
    if (rows.length !== 0) {
        return res.status(500).json({ message: 'User with that id is already exist' });
    } */

    const [rows] = await db.promise().query(`SELECT * FROM member WHERE username = '${req.body.username}'`);
    if (rows.length !== 0) {
        return res.status(500).json({ message: 'User with that username is already exist' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);


    await db.promise().query(`INSERT INTO member VALUES ('${id}','${username}', '${hashedPassword}', '${email}')`);
    const response = res.send({
        status: 'Sukses',
        message: 'Member baru berhasil ditambahkan.'
    });
    response.status(201);
    return response;
};

exports.login = async (req, res) => {
    const {
        username,
        password,
    } = req.body;

    if (username === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Gagal menambah member baru, username diperlukan!',
        });
        response.status(400);
        return response;
    }
    if (username.length < 6) {
        const response = res.send({
            status: 'Gagal',
            message: 'Panjang username harus 6 karakter atau lebih!',
        });
        response.status(400);
        return response;
    }
    if (password === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Gagal menambah member baru, password diperlukan!',
        });
        response.status(400);
        return response;
    }
    if (password.length < 6) {
        const response = res.send({
            status: 'Gagal',
            message: 'Panjang password harus 6 karakter atau lebih!',
        });
        response.status(400);
        return response;
    }

    const [rows] = await db.promise().query(`SELECT * FROM member WHERE username = '${req.body.username}'`);
    if (rows.length !== 0) {
        const auth = bcrypt.compareSync(password, rows[0].password);
        if (auth) {
            const token = createToken(rows[0].id);
            res.cookie('jwt', token, { httpOnly: false, maxAge: maxExpire * 1000 });
            const response = res.status(200).json({
                message: 'Logged in!',
                user_id: rows[0].id,
            });
            return response;
        }
        const response = res.status(404).json({ message: 'Password salah!' });
        return response;
    }
    const response = res.status(404).json({ message: 'Username tidak ditemukan!' });
    return response;
};

exports.logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    const response = res.status(200).json({ message: 'Logout sukses!' });
    return response;
};
