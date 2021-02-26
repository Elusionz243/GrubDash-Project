const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if(!foundDish) {
    next({ status: 404, message:`Dish id does not exist: ${dishId}` });
    return;
  }
  res.locals.dish = foundDish;
  next();
}

function validateDish(req, res, next) {
  const { data: { name, description, price, image_url } } = req.body;

  const priceInt = Number(price);
  if(res.locals.dish) {
    if(typeof price !== 'number') {
      next({ status: 400, message: 'price must be an integer that is greater than 0' });
      return;
    }
  }

  if(priceInt <= 0){
    next({ status: 400, message: 'price must be an integer that is greater than 0' });
    return;
  }

  const requiredFields = ['name', 'description', 'price', 'image_url'];
  for(const field of requiredFields){
    if(!req.body.data[field]){
      next({ status: 400, message: `Dish must include a ${field}` });
      return;
    }
  }
  next();
}

function list(req, res, next) {
  res.status(200).json({ data: dishes });
}

function read(req, res, next) {
  res.status(200).json({ data: res.locals.dish });
}

function create(req, res, next) {
  const { data: { name, description, price, image_url } } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  }
  res.status(201).json({ data: newDish });
}

function update(req, res, next) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } } = req.body;
  if(req.body.data.id && req.body.data.id !== dish.id){
    next({ status: 400, message: `Can not change id of existing dish: ${req.body.data.id}` });
    return;
  }

  const fields = ['name', 'description', 'price', 'image_url'];
  for(const field of fields) {
    if(req.body.data[field]){
      dish[field] = req.body.data[field];
    }
  }
  res.status(200).json({ data: dish });
}


module.exports = {
  list,
  read: [dishExists, read],
  create: [validateDish, create],
  update: [dishExists, validateDish, update],
}
