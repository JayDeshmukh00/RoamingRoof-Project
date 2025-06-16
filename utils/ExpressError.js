class ExpressError extends Error{
    constructor(status_code,message){
super();
this.status_code=status_code;
this.message=message;
    }

}
module.exports=ExpressError;