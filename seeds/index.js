if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

const dbUrl = process.env.DB_URL

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log('Database connected')
})

const randArray = arr => arr[Math.floor(Math.random() * arr.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '5fde576dcdabb4009598223a',
            title: `${randArray(descriptors)} ${randArray(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dxaeka3jm/image/upload/v1608072800/YelpCamp/pf0fkrqlh3vbyccd1hpy.jpg',
                    filename: 'YelpCamp/pf0fkrqlh3vbyccd1hpy'
                },
                {
                    url: 'https://res.cloudinary.com/dxaeka3jm/image/upload/v1608072823/YelpCamp/dxbbtqdylhsmskughfhc.jpg',
                    filename: 'YelpCamp/dxbbtqdylhsmskughfhc'
                }
            ],
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi, voluptatibus corporis earum voluptatum totam, ratione similique architecto nulla optio cumque quia provident aut nostrum, esse dolore impedit? Animi, et natus?",
            price: price

        })
        await camp.save()
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close()
    })