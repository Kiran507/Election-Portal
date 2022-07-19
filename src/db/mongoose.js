const mongoose = require('mongoose');
const DATABASE = process.env.DATABASE

mongoose.connect(DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`Database connected`)
}).catch((err) => console.log(`Failed to connect database`));