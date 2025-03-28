import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

export const CreateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation: Check if name is provided
    if (!name) {
      return res.status(401).send({
        success: false,
        message: "Error! Name is Required",
      });
    }

    // Check if category already exists
    const ExistingCategory = await categoryModel.findOne({ name });
    if (ExistingCategory) {
      return res.status(401).send({
        success: false,
        message: "Category Already Exists",
      });
    }

    // Create a new category
    const Category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();

    // Respond with success
    res.status(200).send({
      success: true,
      message: "Category Created",
      Category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating category",
    });
  }
};


//update category
export const updateCategoryController =  async (req,res)=>{
    try{
        const {name} =req.body
        const {id} =req.params
        const category = await categoryModel.findByIdAndUpdate(id , {name,slug:slugify(name)},{new:true});
        res.status(200).send({
            success: true,
            message : "category updated successfully",
            category
        });
    }
    catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error while updating category'
        })
    }

};


//get all cat
export const categoryControlller = async (req, res) => {
    try {
      const category = await categoryModel.find({});
      res.status(200).send({
        success: true,
        message: "All Categories List",
        category,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error while getting all categories",
      });
    }
  };

  //single category
  export const singleCategoryController = async (req,res)=>{
    try{
        const category = await categoryModel.findOne({slug:req.params.slug});
        res.status(200).send({
            success:true,
            message:'Get Single Category Successfully',
            category
        })
    }
    catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error in getting single category"
        })
    }
  }

  //delete category
  export const deleteCategoryController = async (req,res)=>{
    try{
        const {id} = req.params;
        await categoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success:true,
            message:"Category deleted Successfully",
        })
    }
    catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Erroe deleting category"
        })
    }
  }