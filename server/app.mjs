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
import invoicesRouter from "./routes/invoicesRouter.mjs";
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
// Allow any origin while supporting credentials by echoing the request origin.
// Also explicitly allow common headers and methods so preflight succeeds.
const corsOptions = {
  origin: true, // reflect request origin
  credentials: true, // necessary for cookies/sessions
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Enable preflight across the board
app.options('*', cors(corsOptions));

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
  .connect(DATABASE_URL, {
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

// capture raw body for debugging when needed (won't break normal parsing)
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      req.rawBody = buf.toString();
    } catch (e) {
      req.rawBody = undefined;
    }
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Accept requests that send JSON but with Content-Type: text/plain
app.use(express.text({ type: 'text/*', limit: '10mb' }));
app.use((req, res, next) => {
  // If body was parsed as text but contains JSON, parse it into req.body
  if (req.is('text') && typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (err) {
      // leave req.body as the raw string if it's not valid JSON
    }
  }
  next();
});
app.use("/api/users", authRouter);
app.use("/api/users", userRouter);
app.use("/api/profile", userRouter);
app.use("/api/orders", protect, orderRouter);
app.use("/api/products", productRouter);
app.use("/api/marcas", marcasRouter);
app.use("/api/categorias", categoryRouter);
app.use("/api/featuredproducts", featuredProductsRouter);
app.use("/api/invoices", invoicesRouter);
app.use('/uploads', express.static('uploads'));

// Servir Angular
/* app.use(express.static(path.join(__dirname, './../client/dist/client/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './../client/dist/client/browser/index.html'));
}); */
app.listen(PORT, () => {
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
