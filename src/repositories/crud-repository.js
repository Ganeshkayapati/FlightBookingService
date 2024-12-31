const { where } = require("sequelize");
const { logger } = require("../config/");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const response = await this.model.create(data);
    return response;
  }

  async destroy(data) {
    const response = await this.model.destroy({
      where: {
        id: data,
      },
    });
    if(!response){
      throw new AppError("Not able to find the resource",StatusCodes.NOT_FOUND);
    }
    return response;
  }

  async get(data) {
    const response = await this.model.findByPk(data);
    if(!response){
      throw new AppError("Not able to find the resource ",StatusCodes.NOT_FOUND);
    }
    return response;
  }
  async getAll() {
    const response = await this.model.findAll();
    return response;
  }

  async update(id, data) {
    //data -> object

    const [_,count] = await this.model.update(data, {
      where: {
        id: id,
      },
      returning: true,
    });
    console.log(count);
 
    if(count===0){
      throw new AppError("Not able to find the resource",StatusCodes.NOT_FOUND);
    }
    const message = await this.model.findByPk(id);

    console.log(message);
    return message;
  }


}
module.exports = CrudRepository;
