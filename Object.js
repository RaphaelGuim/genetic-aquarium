let IdGenerator =(function(){
    let id = 0
    function get(){
        id +=1
        return id
    }
    return {get:get}
})()

class DefaultObject{
    static id = 0
    constructor(){
        this.position = this.get_new_position();
        this.type = "DefaultObject"
        this.id = IdGenerator.get()

    }
    reset_position(){
        this.position = this.get_new_position()
    }
    get_new_position(){
        return createVector(Math.random()*windowWidth,Math.random()*windowHeight);
    }

    get_id(){

        DefaultObject.id+=1
        return DefaultObject.id
    }


}