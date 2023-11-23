const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 6500;


// middleware 
app.use(cors());
app.use(express.json());


// MongoDB connection

const uri = `mongodb+srv://${process.env.DB_USER_ID}:${process.env.DB_USER_PASS}@cluster0.3uv6jjc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const brandShopNameData = client.db("BrandShopDB").collection("brandName");
        const brandProductData = client.db("BrandShopDB").collection("brandProduct");
        const cartDataCollection = client.db("BrandShopDB").collection("cartData");

        app.get("/brands", async (req, res) => {
            const result = await brandShopNameData.find().toArray();
            res.send(result);
        })

        app.post("/brands", async (req, res) => {
            const brand = req.body;
            console.log(brand)
            const result = await brandShopNameData.insertOne(brand);
            res.send(result);
        })


        // for add products section

        app.get("/addproducts", async (req, res) => {
            const result = await brandProductData.find().toArray();
            res.send(result);
        })

        app.get("/addproducts/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await brandProductData.findOne(filter);
            res.send(result);
        })

        // app.put("/addproducts/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const product = req.body;
        //     const filter = { _id: new ObjectId(id) };
        //     const options = { upsert: true };
        //     const updateProduct = {
        //         $set: {
        //             brandName: product.brandName,
        //             productName: product.productName,
        //             imageLink: product.imageLink,
        //             productType: product.productType,
        //             userRating: product.userRating,
        //             productPrice: product.productPrice,
        //             shortDescription: product.shortDescription
        //         }
        //     }
        //     const result = await brandProductData.updateOne(filter, options, updateProduct);
        //     res.send(result);
        // })

        app.put("/addproducts/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const product = req.body;
                const filter = { _id: new ObjectId(id) };
                const updateProduct = {
                    $set: {
                        brandName: product.brandName,
                        productName: product.productName,
                        imageLink: product.imageLink,
                        productType: product.productType,
                        userRating: product.userRating,
                        productPrice: product.productPrice,
                        shortDescription: product.shortDescription,
                    }
                };
                const result = await brandProductData.updateOne(filter, updateProduct);

                if (result.matchedCount > 0) {
                    res.json({ message: "Product update successful" });
                } else {
                    res.status(404).json({ message: "Something went wrong! please check again." });
                }
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });



        app.post("/addproducts", async (req, res) => {
            const body = req.body;
            console.log(body)
            const result = await brandProductData.insertOne(body)
            res.send(result)
        })

        // For cart section

        // app.post("/carts", async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const result = await cartDataCollection.insertOne(filter);
        //     res.send(result);
        // })

        app.get("/carts", async (req, res) => {
            const result = await cartDataCollection.find().toArray();
            res.send(result);
        })

        app.get("/carts/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await cartDataCollection.findOne(filter);
            res.send(result);
        })

        app.post("/carts", async (req, res) => {
            try {
                const cartData = req.body;
                console.log(cartData);
                const result = await cartDataCollection.insertOne(cartData);
                res.send({
                    acknowledged: true,
                    insertedId: result.insertedId,
                    data: cartData,
                });
            } catch (error) {
                if (error.code === 11000) {
                    console.error("Duplicate key error:", error);
                    res.status(400).send("Duplicate _id. Choose a different _id.");
                } else {
                    console.error("Error inserting into carts:", error);
                    res.status(500).send("Internal Server Error");
                }
            }
        });

        app.delete("/carts/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await cartDataCollection.deleteOne(filter);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Brands Shop ready to serve");
})

app.listen(port, () => {
    console.log(`Brands Shop server is successfully running here: ${port}`);
})