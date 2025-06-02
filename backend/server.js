const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const db = require("./config/db");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const errorHandler = require("./middlewares/errorHandler");
//MODELS
require("./models/User");
require("./models/Category");
require("./models/Brand");
require("./models/Product");



const authRoutes = require("./routes/authRoute");
const categoryRoutes = require("./routes/categoriesRoute");
const brandRoutes = require("./routes/brandsRoute");
const productRoutes = require("./routes/productsRoute");


dotenv.config();
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/brand', brandRoutes);
app.use('/api/v1/product', productRoutes);

app.use(errorHandler);

db(); // MongoDB bağlantısını başlat
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
