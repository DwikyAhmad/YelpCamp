const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose
    .connect("mongodb://127.0.0.1:27017/yelp-camp")
    .then(() => {
        console.log("Database connected");
    })
    .catch((err) => {
        console.log("Connection error", err);
    });

const sample = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "64e6afdb4ae0c57b4debe3a7",
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dsjkgufrz/image/upload/v1703224827/YelpCamp/dqt2mttitd1ozuwwfnys.avif',
                  filename: 'YelpCamp/dqt2mttitd1ozuwwfnys',
                },
                {
                  url: 'https://res.cloudinary.com/dsjkgufrz/image/upload/v1703224826/YelpCamp/wfc70iljeoz00jsprj1t.jpg',
                  filename: 'YelpCamp/wfc70iljeoz00jsprj1t',
                }
              ],
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus amet minima ex qui ipsa natus accusantium esse pariatur, suscipit asperiores ullam quis voluptates architecto iusto laborum non nisi id iure?",
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude,
                ]
            },
        });
        await camp.save();
    }
};

seedDB().then(() => mongoose.connection.close());
