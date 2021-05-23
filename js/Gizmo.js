
Number.prototype.between = function(a, b) {
    var min = Math.min.apply(Math, [a, b]),
      max = Math.max.apply(Math, [a, b]);
    return this > min && this < max;
  };
class Gizmo extends DefaultObject{

    // static id = 0
    static objectsInView = 3

    static lifeTime = 500
    static children = 1
    constructor(neat,gene){
        super()
        this.type = "GIZMO"
        this.neat = neat
        this.gene = gene

        this.velocity = createVector(0, 0);
        this.acc = createVector(0, 0);



        this.size = 18
        this.leader = false
        this.life = Gizmo.lifeTime


        this.color = Math.random()*360
        this.viewDistante = 300;
        this.angleOfView = 90

        this.input = []
        this.output = []
        this.score=0
        this.active = true
        // this.client = client
        this.insideView = []
    }



    copy_gizmo(){

        const copy = new Gizmo(this.neat,this.gene)
        let born_distante = 25
        copy.position = createVector(this.position.x + born_distante*(Math.random() + 1/2), this.position.y + born_distante*(Math.random() + 1/2));
        copy.color = constrain(this.color + 10*(Math.random()*2-1),0,360)
        copy.id = IdGenerator.get()
        return copy
    }

    sortDistance(a, b){
        return a['distance'] < b['distance'] ? -1 : 1;
    }

    sonar(objects){

        if((this.get_id()+frameCount)%5==0) return


        this.insideView = []
        let eatIndex = []

        objects.forEach((obj,index)=>{
            if(this.id == obj.id){return;}

            let distance = this.position.dist(obj.position)
            if(distance < this.size && obj.type == "FOOD"){
                eatIndex.push(index)
            }
            else if(distance<=this.viewDistante){

                let direction  = createVector(obj.position.x-this.position.x, obj.position.y-this.position.y);
                let angle =  0
                angleMode(DEGREES)
                if(this.velocity.mag()==0){
                    angle = direction.angleBetween(createVector(0,1))
                }else{
                    angle = direction.angleBetween(this.velocity)
                }

                if(math.abs(angle)<this.angleOfView){
                    this.insideView.push({'distance':distance,'obj':obj,'angle':angle})
                }

            }
        })

        this.insideView = this.insideView.sort(this.sortDistance).slice(0, Gizmo.objectsInView);

        this.input = []

        for(let i = 0; i <Gizmo.objectsInView;i++){
            if(this.insideView[i]){

                let obj = this.insideView[i]['obj']
                let mouseHover =
                  mouseX.between(
                    this.position.x - this.size,
                    this.position.x + this.size
                  ) &&
                  mouseY.between(
                    this.position.y - this.size,
                    this.position.y + this.size
                  );

                  if(mouseHover || this.leader){

                    line(obj.position.x,obj.position.y,this.position.x,this.position.y)
                    fill(0)
                    stroke(10)
                    //text(`${nf(insideView[i]['distance'],0,0)}`, obj.position.x+10, obj.position.y+10);


                }



                let angle = this.insideView[i]['angle']
                angle = map(angle,-this.angleOfView,this.angleOfView,-1,1)

                this.input.push(angle)

                let distance = 1-this.insideView[i]['distance']/this.viewDistante
                this.input.push(distance)

                if(obj.type == "FOOD"){
                    this.input.push(1)
                    this.input.push(0)
                }
                else{
                    this.input.push(0)
                    this.input.push(1)
                }
            }
            else{
                this.input.push(0)
                this.input.push(0)
                this.input.push(0)
                this.input.push(0)
            }
        }



        this.output = this.gene.activate(this.input)
        this.eat(objects,eatIndex)
    }




    reset(){
        this.score = 0
        this.life = Gizmo.lifeTime
        this.reset_position()
        this.velocity = createVector(0,1);
        this.acc = createVector(0, 0);
        this.active = true
        this.leader = false
        this.reset_dna()


    }



    eat(objects,eatIndex){

        eatIndex.forEach(index=>{
            objects[index].reset_position()
            let count =0
            while(count<Gizmo.children){
                let newGizmo = this.copy_gizmo()
                let newCreature = Network.crossOver(this.gene, this.gene,false);
                newGizmo.gene = newCreature
                gizmos.push(newGizmo)
                active_gizmos.push(newGizmo)
                count++
            }

        })
        this.score += eatIndex.length*3
        this.life += eatIndex.length * Gizmo.lifeTime

    }
    drawSonar(){


        noFill()
        strokeWeight(1)
        stroke("yellow");

        push()
        rotate(this.velocity.heading())
        colorMode(RGB, 255, 255, 255, 1);
        fill(15,15,15,0.2)
        // arc(0, 0,this.viewDistante*2 , this.viewDistante*2, -this.angleOfView, this.angleOfView)
        pop()


    }
    drawBody(){

        let shine = 50 + 50*this.life/Gizmo.lifeTime
        stroke(0);
        fill(this.color,shine,shine)
        strokeWeight(.5);
        circle(0,0,this.size)




        if(this.leader){
            textSize(20);
            fill(0)
            text(this.score, 10,20);
            stroke(255, 204, 0);
            strokeWeight(2);
            noFill()
            circle(0,0,this.size*3)
            this.drawSonar()
        }


    }

    drawDirection(){
        let dir;
        if(this.velocity.mag()==0){
            dir = createVector(0,1)
        }else{
            dir = this.velocity.copy()
        }
        stroke(0)
        strokeWeight(.5)
        line(0,0,dir.x*5,dir.y*5)



        // let acc = this.acc.copy()
        // strokeWeight(3)
        // line(0,0,acc.x*20,acc.y*20)

    }



    draw(){
        this.life-=1

        if(this.life<0){
            this.active = false
        }
        if(!this.active){
            return;
        }

        push()
        translate(this.position.x,this.position.y)

        this.drawBody()
        this.drawDirection()

        pop()

    }
    deactivate(){
        this.active = false
    }
    stearAcc(obj,max){
        return createVector(obj.position.x-this.position.x,obj.position.y-this.position.y).setMag(max/10)

    }

    move(){
        if(!this.active)return;

        let acc;
        let choices = this.output.slice(0,3)
        const choice = choices.indexOf(max(choices))

        if(abs(this.output[3]) > 0.5 && this.insideView[choice]){
            acc = this.stearAcc(this.insideView[choice]['obj'],this.output[3])

        }else{
            let accX = map(noise(this.output[0]*frameCount/40),0,1,-1,1)
            let accY = map(noise(this.output[1]*frameCount/70),0,1,-1,1)
            acc = createVector(accX,accY).setMag(this.output[3])
        }



        this.velocity.add(acc)
        this.velocity.limit(1.5)
        this.position.add(this.velocity)

        //go to other side
        // if(this.position.x > windowWidth - 5){
        //     this.position.x = windowWidth -5
        // }
        // else if(this.position.x < 5){
        //     this.position.x = 5
        // }

        // if(this.position.y > windowHeight -5){
        //     this.position.y = windowHeight -5
        // }
        // else if(this.position.y < 5){
        //     this.position.y = 5
        // }

        const limit = 0

        if(this.position.x > windowWidth + limit){
            this.deactivate()
        }
        else if(this.position.x < -limit){
            this.deactivate()
        }

        if(this.position.y > windowHeight + limit){
            this.deactivate()
        }
        else if(this.position.y < -limit){
            this.deactivate()
        }


    }
}