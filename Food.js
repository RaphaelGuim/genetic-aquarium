
class Food extends DefaultObject{
    constructor(){
        super()
        this.type = "FOOD"
        this.color = 60
    }

    draw(){

        push()
        translate(this.position.x,this.position.y)
        fill( this.color,100,100)
        strokeWeight(.1);
        square(0,0,5,2)

        pop()

    }

}