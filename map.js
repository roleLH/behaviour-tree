const default_map = [
    "+---------------+",
    "|[ ]---------[ ]|",
    "|[s]         [h]|",
    "|[ ]---+ +---[ ]|",
    "|      | |      |",
    "|      | |      |",
    "|      | |      |",
    "|[ ]---+ +---[ ]|",
    "|[g]         [f]|",
    "|[ ]---------[ ]|",
    "+---------------+",
]

class TinyMap {
    constructor(x, y, w ,h, map_data) {
        this.pos = {x : x, y : y};
        this.width = w;
        this.height = h;
        this.map_data = map_data || default_map;
        this.tinyCurses = null;
    }
}

TinyMap.prototype.init = function(tinyCurses) {
    this.tinyCurses = tinyCurses;
    if(this.tinyCurses == null) {
        // emmm... who care 
    }
    this.tinyCurses.resetColor();
    for(let i = 0; i < this.map_data.length; i++) {
        this.tinyCurses.move(this.pos.y + i, this.pos.x);
        this.tinyCurses.write(this.map_data[i]);
    }
}

/*
class Controller {

}
*/

/**
 * @description it's easy for the demo map. if the map data is complex,
 * try other algorithm
 * @param {{x : number, y : number}} start 
 * @param {{x : number, y : number}} end 
 * @param {string[]} map 
 */
let check = (start, end, map) => {
    let result = {x : start.x, y : start.y};
    let x = end.x - start.x;
    if(x < 0) {
        if(map[start.y][start.x -1] == ' ') {
            result.x --;
        }
    } else if(x > 0) {
        if(map[start.y][start.x +1] == ' ') {
            result.x ++;
        }
    }
    let y = end.y - start.y;
    if(y < 0) {
        if(map[start.y -1][start.x] == ' ') {
            result.y --;
        }
    } else if(y > 0) {
        if(map[start.y +1][start.x] == ' ') {
            result.x ++;
        }
    }
    return result;
}

class Creature {
    constructor(x, y, img) {
        this.brain = null;
        this.ai = false;

        this.img = img;
        this.pos = {x : x, y : y};
        this.lastPos = {x : x, y : x};
    }
}

Creature.prototype.up = function() {
    this.pos.y--;
}

Creature.prototype.down = function() {
    this.pos.y++;
}
Creature.prototype.left = function() {
    this.pos.x--;
}
Creature.prototype.right = function() {
    this.pos.x++;
}


class Me extends Creature {
    constructor(x, y, scene) {
        super(x, y, '@');

        this.state = {
            WhiteDay    : false,
            money       : false,
            flower      : false,
        }

        /**
         * @description map<actionId, {
         *      pending : success failed running
         *      action  : Action
         * }>
         */
//        this.actionList = new Map();
        this.actionList = new Set();

       

        this.scene = scene;

        this.brain = buildMyBrain();
//TODO:        this.helper = new TravHelper(brain);
    }
}


Me.prototype.setState = function(newState) {
    this.state = newState;

    this.brain.reset(); // 重置整颗树
    this.helper.reset();
    this.actionList.clear();
    
    this.update()
   
}

Creature.prototype.savePos = function() {
    this.lastPos.x = this.pos.x;
    this.lastPos.y = this.pos.y;
}

/**
 * @description 构建我的大脑，并返回根节点
 */
let buildMyBrain = ()=> {

}




/**
 * start is a State{
 *      
 * }
 */

class Action {
    constructor(start, end) {
        this.start   = start;    
        this.cursor  = start;
        this.end     = end;

        this.success = null;
        this.failed  = null;
    }
}

Action.prototype.update = function() {
    if(!this.cursor.equal(this.end)) {
        this.next();
        return false;
    }
    this.success();
    return true;
}

class MoveAction extends Action {
    constructor(start, end, inst, map) {
        super(
            new MoveState(start.x, start.y),
            new MoveState(end.x, end.y)
        );
        this.inst = inst;
        this.map = map;
    }
}

MoveAction.prototype.next = function() {
    let res = check(this.cursor.state,
                    this.end.state,
                    this.map);
    this.cursor.state.x = res.x;
    this.cursor.state.y = res.y;
    
    this.inst.savePos();
    this.inst.pos.x = res.x;
    this.inst.pos.y = res.y;
}

class MoveState {
    constructor(x, y) {
        this.state = {
            x : x, y : y
        }
    }
}

/**
 * @param{MoveState} s
 */
MoveState.prototype.equal = function(s) {
    if(this.state.x == s.state.x && this.state.y == s.state.y) {
        return true;
    }
    return false;
}

class PlayAction extends Action{
    constructor(start, end, inst) {
        super(
            new TimeState(start),
            new TimeState(end)
        ); 
        this.inst = inst;
    }
}

PlayAction.prototype.next = function() {
    this.cursor.ntick++;
}

class TimeState {
    constructor(t) {
        this.ntick = t;
    }
}

TimeState.prototype.equal = function(s) {
    if(this.ntick == s.ntick) {
        return true;
    }
    return false;
}



Me.prototype.movetoHome = function() {
    return new MoveAction(
        this.pos,
        this.scene.objs.home,
        this,
        this.scene.mapData,
    );
} 
Me.prototype.movetoGFHome = function() {
    return new MoveAction(
        this.pos,
        this.scene.objs.gfhome,
        this,
        this.scene.mapData
    );
} 
Me.prototype.movetoFlower = function() {
    return new MoveAction(
        this.pos,
        this.scene.objs.flower,
        this,
        this.scene.mapData
    );
} 
Me.prototype.movetoStadium = function() {
    return new MoveAction(
        this.pos,
        this.scene.objs.stadium,
        this,
        this.scene.mapData
    );
} 


Me.prototype.playball = function() {
    return new PlayAction(0, -1, this);
}
Me.prototype.idle = function() {
    return new PlayAction(0, -1, this);
}


Me.prototype.buyFlower = function() {

}

Me.prototype.takeMoney = function() {

}

Me.prototype.sendFlower = function() {

}


Me.prototype.addAction = function(action) {
    this.actionList.add(action);
}



Me.prototype.update = function() {
    if(this.scene.state == RUN) {
        this.helper.run();
    } else {
        this.helper.step();
    }
   
    for(let action of this.actionList) {
       action.update();
   }
}



const UNKNOWN   = -1;
const RUN       = 0;
const PAUSE     = 1;
const STEP      = 2;
const STOP      = 3;

class DemoScene {
    constructor(x ,y, tinyCurses) {
        this.objs = {
            home :      { x : 12, y : 2 },
            stadium :   { x : 4, y : 2 },
            gfhome :    { x : 4, y : 8 },
            flower :    { x : 12, y : 8 },
            me :        { x : 8, y : 5 }
        };
        this.mapData = default_map;

        this.pos = {x : x, y : y};
        
        this.state = UNKNOWN;

        this.me = null;

        this.tinyCurses = tinyCurses;

        this.activeList = new Set();
        
    }
}

DemoScene.prototype.init = function() {
    if(this.me == null) {
        this.me = new Me(this.objs.me.x, this.objs.me.y, this);
    }
    this.activeList.add(this.me);

    this.tinyCurses.resetColor();
    for(let i = 0; i < this.mapData.length; i++) {
        this.tinyCurses.move(this.pos.y + i, this.pos.x);
        this.tinyCurses.write(this.mapData[i]);
    }

    this.tinyCurses.move(this.pos.y + this.objs.me.y, this.pos.x + this.objs.me.x);
    this.tinyCurses.write(this.me.img);
}

/*
DemoScene.prototype.update = function() {
    this.me.update();

    ///
    for(let obj of this.activeList) {
        this.tinyCurses.move(this.pos.y + obj.lastPos.y, obj.lastPos.x);
        this.tinyCurses.write(' ');
        this.tinyCurses.move(this.pos.y + obj.pos.y, this.pos.x + obj.pos.x);
        this.write(this.obj.img);
    }
    ///
}
*/

/*
this.state = UNKNOWN;
this.timeout = null;
DemoScene.prototype.run = function() {
    if(this.timeout != null) {
        return;
    }

}
*/
var scene;
(function(tinyCurses) {
    scene = new DemoScene(20, 20, tinyCurses);
    scene.init();

})(tinyCurses);