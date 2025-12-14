import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";

import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import appError from "./utils/appError.mjs";
import authRouter from "./routes/authRouter.mjs";
import userRouter from "./routes/userRouter.mjs";
import orderRouter from "./routes/orderRouter.mjs";
import productRouter from "./routes/productRouter.mjs";
import featuredProductsRouter from "./routes/featuredProductsRouter.mjs";
import marcasRouter from "./routes/marcasRouter.mjs";
import categoryRouter from "./routes/categoryRouter.mjs";
import { protect } from "./controllers/authController.mjs";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.on("uncaughtException", (err) => {
  console.log("uncaught exception ... shutting down");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./.env" });

const app = express();
app.use(cors({
	origin: ["*"], // O el dominio de tu frontend
  credentials: true, // 👈 necesario para cookies/sesión
}));

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
app.use(
  session({
    secret: "tu_secreto_aqui", // pon uno seguro en producción
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // usa true si estás en HTTPS
  })
);
app.disable('x-powered-by');
mongoose
  .connect(DATABASE_URL,{
	useNewUrlParser: true,
 	useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection", error.message);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", authRouter);
app.use("/api/users", userRouter);
app.use("/api/profile", userRouter);
app.use("/api/orders", protect, orderRouter);
app.use("/api/products", productRouter);
app.use("/api/marcas", marcasRouter);
app.use("/api/categorias", categoryRouter);
app.use("/api/featuredproducts", featuredProductsRouter);
app.use('/uploads', express.static('uploads'));

// Servir Angular
app.use(express.static(path.join(__dirname, './../client/dist/client/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './../client/dist/client/browser/index.html'));
});
app.listen(PORT,() => {
  console.log(`Listening on http://127.0.0.1:${PORT}`);
});

app.all("*", (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server`));
});

// HANDLE UNHANDLED REJECTED PROMISES
process.on("unhandledRejection", (err) => {
  console.log("unhandled rejection ... shutting down");
  console.log(err.name, err.message);
  // 0 : success , 1 : uncaught exception
  server.close(() => {
    process.exit(1);
  });
});
