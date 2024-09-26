class Apierrors extends Error{
    constructor(
        statusCode,
        message="something went wrong",
        errors = [],
        stack=""
    ){
super(message)
this.statusCode=statusCode, 
this.data=null,
this.message=message,
this.success=false;
this.errors= errors


if(stack){
    this.stack
}
else{
    Error.caputureStackTrace(this,this.constructor)
}
    }
}
export {Apierrors}