const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;

module.exports = {
  connectDB,
  create,
  save,
  deleteById,
  findById,
  findOne,
  updateById,
  findByFieldSorted,
  countDocuments,
  findAll
}

async function connectDB() {
  if (mongoose.connections[0].readyState) return
  await mongoose.connect(MONGO_URL)
}

async function create(model, data) {
  return new model(data)
}

async function save(document) {
  await document.save()
  return document
}

async function deleteById(model, id) {
  return await model.findByIdAndDelete(id)
}

async function findById(model, id) {
  return await model.findById(id)
}

async function findOne(model, query) {
  return await model.findOne(query)
}

async function updateById(model, id, updateData) {
  return await model.findByIdAndUpdate(
    // id, updateData, { new: true }
    id, updateData, { returnDocument: 'after' }
  )
}

async function findByFieldSorted(model, fieldName, fieldValue, projection = '', sortBy = { _id: -1 }) {
  return await model
    .find({ [fieldName]: fieldValue }, projection)
    .sort(sortBy)
}

async function countDocuments(model, filter) {
  const count = await model.countDocuments(filter)
  return count
}

async function findAll(model, projection = '') {
  return await model.find({}, projection);
}