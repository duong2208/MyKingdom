var express = require('express')
var session = require('express-session')

const { MongoDBNamespace } = require('mongodb')
//declare ObjectId from mongodb module
const ObjectId = require('mongodb').ObjectId;

var app = express()

app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'sea2208',
    resave: false
}))

function isAuthenticated(req, res, next) {
    let noLogin = !req.session.userName
    if (noLogin)
        res.redirect('login')
    else
        next()
}

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb+srv://sea2208:D228n169@1644assignment2.zmdbn.mongodb.net/test'

app.get('/login', (req, res)=>{
    let noLogin = !req.session.userName  //kiểm tra xem người dùng đã đăng nhập chưa 

    res.render('login', {'noLogin': noLogin})
})

app.post('/login', async (req, res)=>{
    let username = req.body.username
    let pass = req.body.pass

    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    
    let result = await dbo.collection('user').find({$and :[{'username': username, 'pass': pass}]  }).toArray()
    // let name2 = name.toString()
    if (result.length > 0) {
        req.session.userName = username
        res.redirect('/')
    }
    else {
        res.render('login', {'username': username, 'pass': pass})
    }
})

app.get('/logout',(req,res)=>{
    req.session.userName = null
    req.session.save((err)=>{
        req.session.regenerate((err2)=>{
            res.redirect('/')
        })
    })
})

app.get('/signup', (req, res)=>{
    res.render('signup')
})

app.post('/signup', async (req, res)=>{
    let name = req.body.name
    let username = req.body.username
    let pass = req.body.pass
    let phone = req.body.phone
    let email = req.body.email
    let address = req.body.address

    let newUser = {
        'name': name,
        'username': username,
        'pass': pass,
        'phone': phone,
        'email': email,
        'address': address
    }

    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    await dbo.collection('user').insertOne(newUser)
    req.session.userName = username
    res.redirect('login')
})

app.get('/', isAuthenticated, async (req, res) => {
    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    
    let newUser = await dbo.collection('user').find({$and :[{'username': req.session.userName}]}).limit(1).toArray()
    // let name2 = name.toString()
    console.log(newUser[0])
    let toy = await dbo.collection('toy').find().toArray()
   res.render('index', { 'username': req.session.userName, 'newUser': newUser[0], 'toy': toy})
})

app.get('/toy', isAuthenticated,  async (req, res) => {
    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")

    let toys = await dbo.collection('toy').find().toArray()
    res.render('toy', { 'toys': toys })
})

app.get('/category', isAuthenticated, (req, res) => {
    res.render('category')
})

app.get('/user', isAuthenticated, async (req, res) => {
    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")

    let users = await dbo.collection('user').find().toArray()
    res.render('user', { 'users': users })
})

app.get('/addToy', isAuthenticated, (req, res) => {
    res.render('addToy')
})

app.post('/addToy', async (req, res) => {
    let nameToy = req.body.nameToy
    let imgToy = req.body.imgToy
    let priceToy = req.body.priceToy
    let desToy = req.body.desToy

    let toy = {
        'nameToy': nameToy,
        'imgToy': imgToy,
        'priceToy': priceToy,
        'desToy': desToy
    }
    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    //insert product vao database
    await dbo.collection('toy').insertOne(toy)
    //quay lai trang Home
    res.redirect('toy')
})

app.post('/searchToy', async (req, res) => {
    let nameToy = req.body.search
    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    let toys = await dbo.collection('toy').find({ 'nameToy': new RegExp(nameToy, 'i') }).toArray()
    res.render('toy', { 'toys': toys })
})

app.get('/updateToy/:_id', isAuthenticated,  async (req, res) => {
    //transform your param into an ObjectId
    var id = req.params._id;
    var good_id = new ObjectId(id);
    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    let toys = await dbo.collection('toy').find({ '_id': good_id }).limit(1).toArray()
    console.log(toys[0])
    res.render('updateToy', { 'toys': toys[0] })
})

app.post('/editToy/:_id', async (req, res) => {
    let nameToy = req.body.nameToy
    let imgToy = req.body.imgToy
    let priceToy = req.body.priceToy
    let desToy = req.body.desToy

    //transform your param into an ObjectId
    var id = req.params._id;
    var good_id = new ObjectId(id);

    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    await dbo.collection('toy').updateOne({ '_id': good_id }, { $set: { '_id': good_id, 'nameToy': nameToy, 'imgToy': imgToy, 'priceToy': priceToy, 'desToy': desToy } })
    res.redirect('/toy')
})

app.get('/deleteToy/:_id', isAuthenticated,  async (req, res) => {
    //transform your param into an ObjectId
    var id = req.params._id;
    var good_id = new ObjectId(id);
    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    let toys = await dbo.collection('toy').find({ '_id': good_id }).limit(1).toArray()
    console.log(toys[0])
    res.render('deleteToy', { 'toys': toys[0] })
})

app.post('/deleteToy/:_id', async (req, res) => {
    //transform your param into an ObjectId
    var id = req.params._id;
    var good_id = new ObjectId(id);

    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    await dbo.collection('toy').deleteOne({ '_id': good_id })
    res.redirect('/toy')
})

app.get('/deleteUser/:_id', async (req, res) => {
    //transform your param into an ObjectId
    var id = req.params._id;
    var good_id = new ObjectId(id);

    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    await dbo.collection('user').deleteOne({ '_id': good_id })
    res.redirect('/user')
})

app.get('/updateUser/:_id', isAuthenticated,  async (req, res) => {
    //transform your param into an ObjectId
    var id = req.params._id;
    var good_id = new ObjectId(id);
    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    let users = await dbo.collection('user').find({ '_id': good_id }).limit(1).toArray()
    console.log(users[0])
    res.render('updateUser', { 'users': users[0] })
})

app.post('/editUser/:_id', async (req, res) => {
    let name = req.body.name
    let username = req.body.username
    let pass = req.body.pass
    let phone = req.body.phone
    let email = req.body.email
    let address = req.body.address

    //transform your param into an ObjectId
    var id = req.params._id;
    var good_id = new ObjectId(id);

    //1. kết nối đến server có địa chỉ trong url
    let server = await MongoClient.connect(url) // await là đợi công việc này hoàn thành mới làm công việc tiếp theo. 
    //phải có async mới dùng được await 
    //2. truy cập database ATNToys
    let dbo = server.db("MyKingdom")
    await dbo.collection('user').updateOne({ '_id': good_id }, { $set: { '_id': good_id, 'name': name, 'username': username, 'pass': pass, 'phone': phone, 'email': email, 'address': address} })
    res.redirect('/user')
})

const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log('SERVER IS RUNNING')