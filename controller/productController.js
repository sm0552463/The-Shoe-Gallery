import slugify from "slugify";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import fs from "fs";
import categoryModel from "../models/categoryModel.js";
import Razorpay from "razorpay";
import CryptoJS from "crypto-js";
import uploadFile from "../utility/upload.js";

import dotenv from 'dotenv';

dotenv.config();

export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
      const { photo } = req.files;
    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "name is required" });
      case !description:
        return res.status(500).send({ error: "description is required" });
      case !price:
        return res.status(500).send({ error: "price is required" });
      case !category:
        return res.status(500).send({ error: "category is required" });
      case !quantity:
        return res.status(500).send({ error: "quantity is required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is required and should be less than 1 mb" });
    }
    const photoUrl = await uploadFile(photo.path, "Home");
   
    
    const products = new productModel({
      ...req.fields,
      slug: slugify(name),
      photo: photoUrl,
    });
    await products.save();
    res.status(201).send({
      success: true,
      message: "product created successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Creating Product",
    });
  }
};

//get all product
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      total_count: products.length,
      message: "All Products",
      products,
    });
    console.log(products);
    
  } catch (error) {
    console.log(error),
      res.status(500).send({
        succes: false,
        message: "Error in getting product",
        error: error.message,
      });
  }
};

//get single product
export const getSingleProduct = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .populate("category");
    res.status(200).send({
      success: true,
      message: "single product found",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in finding single product",
      error,
    });
  }
};

//get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error Deleting product",
      error,
    });
  }
};

//update controller
export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "name is required" });
      case !description:
        return res.status(500).send({ error: "description is required" });
      case !price:
        return res.status(500).send({ error: "price is required" });
      case !category:
        return res.status(500).send({ error: "category is required" });
      case !quantity:
        return res.status(500).send({ error: "quantity is required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is required and should be less than 1 mb" });
    }
    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "product updated successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in update Product",
    });
  }
};

//filter controller
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while Filtering Products",
      error,
    });
  }
};

//product count controller
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,

      success: false,
    });
  }
};

//product per page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in per page ctrl",
      error,
    });
  }
};

//search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in search  product api",
      error,
    });
  }
};

//similar product
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while getting similar products",
      error,
    });
  }
};

//category wise products controller
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "error in getting products",
    });
  }
};


export const razorpayCreateOrder = async (req, res) => {
  const { amount, currency } = req.body;
  console.log(amount, currency);
  console.log(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);

  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: amount * 100, // Razorpay requires the amount in paise (multiply by 100 for INR and cents for USD)
      currency: currency || "USD", // Default to USD
      receipt: `receipt_${Date.now()}`,
    });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const razorpayVerifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, cart } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const generatedSignature = CryptoJS.HmacSHA256(body, process.env.RAZORPAY_KEY_SECRET).toString(CryptoJS.enc.Hex);


  if (generatedSignature === razorpay_signature) {
    try {
      const order = new orderModel({
        products: cart,
        payment: {
          razorpay_payment_id,
          razorpay_order_id,
          status: "Paid",
        },
        buyers: req.user._id,
        status: "Not Process",
      });

      await order.save();

      res.json({ success: true, order });
    } catch (error) {
      console.error("Error while processing order:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to save order", error });
    }
  } else {
    res.json({ success: false, message: "Payment verification failed!" });
  }
};