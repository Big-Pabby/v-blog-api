
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt')

const app = express();
const PORT = process.env.PORT || 5000

app.use(bodyParser.json());
app.use(cors());

const db = knex({
    client: 'pg',
    connection: {
      connectionString : process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      // host : '127.0.0.1',
      // user : 'postgres',
      // password : 'Adebayo7',
      // database : 'V-blog-database'
    }
});

app.get('/blogPost', (req, res) => {
  db.select('*').from('blogposts').then(posts => {
      res.json(posts)
  })
})

app.post('/publishPost', (req, res) => {
    const {blogTitle, blogContent, blogImageURL, blogCategory, blogImageName} = req.body;
    db('blogposts').insert({
        blogtitle: blogTitle,
        blogcontent: blogContent,
        blogcategory: blogCategory,
        blogimagename: blogImageName,
        blogimageurl: blogImageURL,
        created: new Date().toDateString()
    }).returning('*').then(post => {
        res.json(post[0])
        console.log(post[0])
    })
});

app.get('/blogPost/:id', (req, res) => {
    const {id} = req.params;
    db.select('*').from('blogposts').where('blogid', '=', id).then(post => {
        res.json(post[0])
    })
})

app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await db.select('*').from('users').where('email', '=', email);
        if(user) {
            const isValid = await bcrypt.compare(password, user[0].hashpassword);
            if(isValid) {
                res.status(200).json(user[0])
            } else {
                res.status(400).json('Invalid Password')
            }
        } else {
            res.status(400).json('Email is not registered')
        }
    } catch {
        res.status(500).json('Email is not registered')
    }
})

app.post('/register', async (req, res) => {
    try {
        const {firstName, lastName, email, password,} = req.body;
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(salt)
        console.log(hashedPassword)
        await db('users').insert({
            firstname: firstName,
            lastname: lastName,
            email: email,
            hashpassword: hashedPassword,
            joined: new Date().toDateString()
        }).returning('*').then(user => {
            res.json(user[0])
            console.log(user[0])
        }).catch(err => {
            console.log(err)
            res.status(400).json('email already exist')
        })
    } catch {
        res.status(500).send()
    }
})

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
})
