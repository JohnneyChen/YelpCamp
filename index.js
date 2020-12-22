if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const passport = require('passport')
const passportLocal = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoDBStore = require('connect-mongo')(session);

const { campgroundsRoutes } = require('./routes/campgrounds');
const { reviewsRoutes } = require('./routes/reviews');
const { userRoutes } = require('./routes/user');
const { AppError } = require('./utilities/AppError');

const User = require('./models/user')

const dbUrl = process.env.DB_URL

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log('Database connected')
})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate)

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://cdn.jsdelivr.net/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dxaeka3jm/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = new MongoDBStore({
    url: dbUrl,
    secret: secret,
    touchAfter: 24 * 3600
})

const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next()
})

//campgrounds Routes
app.use('/campgrounds', campgroundsRoutes)
//reviews Routes
app.use('/campgrounds/:id/reviews', reviewsRoutes)
//user Routes
app.use('/', userRoutes)

//home
app.get('/', (req, res) => {
    res.render('home')
})

//404 catcher
app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404))
})

//error handler
app.use((err, req, res, next) => {
    if (!err.message) {
        err.message = "Oh No! There's an Error!"
    }
    if (!err.statusCode) {
        err.statusCode = 500
    }
    res.status(err.statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server up on port ${port}`)
})