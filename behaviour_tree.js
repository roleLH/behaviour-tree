
/**
 * @note brhaviour tree 
 * 行为树主要有三种类型的节点，分别是：
 * 1. Composite Node 复合节点
 * 2. Decorator Node 修饰节点
 * 3. Leaf Node      叶节点
 * @time 2019-04-21
 */

 const NODE_STATE_SUCCESS   = "success"
 const NODE_STATE_FAILED    = "failed"
 const NODE_STATE_RUNNING   = "running"
 const NODE_STATE_READY     = "ready"

 class BTStateGraph {
     constructor(x, y, width, height) {
          this.infos = null;
          this.pos = {x : x, y : y};
          this.width = width;
          this.height = height;

          this.colors = new NodesColorInfo();

          this.tinyCurses = null;
          this.curLine = '>';
          this.node = null;
          this.step = false;

          this.lastLine = 0;
     }
 }

 /**
  * @param{Map} infos
  */
 BTStateGraph.prototype.init = function (tinyCurses, infos) {
    this.tinyCurses = tinyCurses;
    this.infos = infos;

    let ox = 2, oy = 1;
    for(let infoPair of this.infos) {
        let info = infoPair[1];
        let x = info.tab + ox + this.pos.x;
        let y = info.line + oy + this.pos.y;
        let color = this.colors.nodeColor(info.info.nodeType);
        this.tinyCurses.move(y, x);
        this.tinyCurses.setFGColor(color);
        this.tinyCurses.write(info.info.name);
    }

 }

 BTStateGraph.prototype.update = function(curNode) {
     if(!this.step) {
         return;
     }
     if(this.node == curNode) {
         return;
     }
     this.node = curNode
     this.setCurNodeLine(this.node);
 }

 BTStateGraph.prototype.setCurNodeLine = function (node) {
    let oy = 1;
    let l = this.infos.get(node).line;
    this.tinyCurses.move(this.pos.y + oy + this.lastLine, 0);
    this.tinyCurses.write(' ');
    this.tinyCurses.setLineBGColor(CBlack, this.lastLine + this.pos.y + oy, 
        this.pos.x +1, this.pos.x + this.width);

    this.lastLine = l;
    this.tinyCurses.move(this.pos.y + oy + l, 0);
    this.tinyCurses.write(this.curLine);
    this.tinyCurses.setLineBGColor(CRed, l + this.pos.y + oy, this.pos.x +1, this.pos.x + this.width);
 }


 const TRAVEL_STATE_FINISHED = "finished"
 const TRAVEL_STATE_UNFINISHED = "unfinished"
 
 const UNKNOWNED_NODE	= -1;
 const CONDITION_NODE	= 0;
 const SEQUENCE_NODE	= 1;
 const SELECTOR_NODE	= 2;
 const PARALLEL_NODE	= 3;
 const ACTION_NODE		= 4;
 
 
 class NodesColorInfo {
	 constructor() {
		 this.infos = {};
		 
		 this.infos[CONDITION_NODE] 	= CLightRed;
		 this.infos[SEQUENCE_NODE]	= CLightGreen;
		 this.infos[SELECTOR_NODE]	= CYellow;
		 this.infos[PARALLEL_NODE]	= CLightBlue;
		 this.infos[ACTION_NODE]		= CLightPurple;
		 
	 }
 }
 
 /**
  * @description ---- ununsed ----
  */
NodesColorInfo.prototype.register = function (nodeType, color) {
    this.infos[node] = color;
}

NodesColorInfo.prototype.nodeColor = function (nodeType) {
    return this.infos[nodeType];
}

 class TravHelper {
	constructor(node) {
		this.curNode	= node;
		this.nextNode	= this.curNode.nextChild();
		this.prevNode	= node.parent;
		
		this.root = node;
        this.node2Info = new Map();

        
	}

}

TravHelper.prototype.start = function () {
    //    this.nextNode = this.curNode.nextChild();
}

TravHelper.prototype.step = function () {
    let tmp = this.nextNode;
    let flag = false;
    if(this.curNode.travelState == TRAVEL_STATE_FINISHED) {
        if(this.nextNode.isFinished(this.curNode)) {
            if(this.nextNode == null) {	// 已经到达根节点且已经完成。
                return false;
            }
            flag = true;
        } else {
            this.nextNode = this.nextNode.nextChild();
        }
    } else {
        this.nextNode = this.nextNode.nextChild();
    }
    
    this.prevNode = this.curNode;
    this.curNode = tmp;
    if(this.nextNode == null || flag) {
        if(this.nextNode == null) {
            this.curNode.process() // process(this.curNode)
        }
        this.nextNode = this.curNode.parent;
    }
    return true;
}

TravHelper.prototype.run = function() {
    while(this.step());
}

TravHelper.prototype.reset = function() {
    
}

TravHelper.prototype.init = function() {
    let i = 0;
    let stk = new Array();
    stk.push({node : this.root, tab : 0});
    while(stk.length) {
        let node = stk.pop();
        let tab = node.tab;
        node = node.node;
        let info = node.getInfo();
        this.node2Info.set(node, {
            line : i,
            info : info,
            tab  : tab,
        })
        i++;
        let nodes = node.children;
        if( nodes && nodes.length) {
            for(let j = nodes.length -1; j >=0; j--) {
                stk.push({
                    node : nodes[j],
                    tab : tab + 4,
                });
            }
        }
    }
}
    
    TravHelper.prototype.getAllInfos = function () {
        return this.node2Info;
    }



/**
 * Behaviour Node --- base class 
 */
 class BehaviourNode {
     constructor(name, ...children) {
        this.name = name || "";
        this.children = children || null;
        this.state = NODE_STATE_READY;
        this.parent = null;

        this.travelState = TRAVEL_STATE_UNFINISHED;
        if(this.children != null) {
            for(let i = 0; i < this.children.length; i++) {
                this.children[i].parent = this;
            }
        } 
		
		this.nodeType = UNKNOWNED_NODE;
     }
 }

BehaviourNode.prototype.visit = function() {
    this.state = NODE_STATE_FAILED
}

BehaviourNode.prototype.isFinished = function(node) {
    return true;
}
BehaviourNode.prototype.process = function() {

}
BehaviourNode.prototype.nextChild = function() {
    return null;
}
BehaviourNode.prototype.toStr = function() {
    return this.name;
}

BehaviourNode.prototype.getInfo = function() {
    return {
        name : this.name,
        nodeType : this.nodeType
    }
}


 class ConditionNode extends BehaviourNode {
     constructor(name, fn) {
        super(name || "Condition-Node")
        this.fn = fn;
        this.nodeType = CONDITION_NODE;
     }
 }

 ConditionNode.prototype.visit = function() {
    if(this.fn()) {
        this.state = NODE_STATE_SUCCESS;
    } else {
        this.state = NODE_STATE_FAILED
    }
 }

 ConditionNode.prototype.process = function() {
     this.visit();
     this.travelState = TRAVEL_STATE_FINISHED;
 }

 class SequenceNode extends BehaviourNode {
     constructor(name, ...children) {
         super(name || "Sequence-Node", ...children);
         this.index = 0;
         this.nodeType = SEQUENCE_NODE;
     }
 }

 SequenceNode.prototype.isFinished = function(child) {
    if(child.state == NODE_STATE_RUNNING || child.state == NODE_STATE_FAILED) {
        this.state = child.state;
        this.travelState = TRAVEL_STATE_FINISHED;
        return true;
    } else {
        this.index ++;
        if(this.index == this.children.length) {
            this.state = NODE_STATE_SUCCESS;
            this.travelState = TRAVEL_STATE_FINISHED;
        }
        return false;
    }
 }
 
 SequenceNode.prototype.nextChild = function() {
     if(this.index == this.children.length) {
         return null;
     } else {
         return this.children[this.index];
     }
 }



 class SelectorNode extends BehaviourNode {
     constructor(name, ...children) {
         super(name || "Selector-Node", ...children);
         this.index = 0;
         this.nodeType = SELECTOR_NODE;
     }
 }

SelectorNode.prototype.isFinished = function(child) {
    if(child.state == NODE_STATE_RUNNING || child.state == NODE_STATE_SUCCESS) {
        this.state = child.state;
        this.travelState = TRAVEL_STATE_FINISHED;
        return true;
    } else {
       if(this.index == this.children.length) {
           this.state = NODE_STATE_FAILED;
           this.travelState = TRAVEL_STATE_FINISHED;
       }
        this.index ++;
        return false;
    }
}

SelectorNode.prototype.nextChild = function() {
   if(this.index == this.children.length) {
       return null;
   } else {
       return this.children[this.index];
   }
}

/**
 * @description 需要指出的是，并行节点只有与running节点配合才具有一定的意义。
 */
 class ParallelNode extends BehaviourNode{
     constructor(name, ...children) {
         super(name || "Parallel-Node", ...children);
         this.index = 0;
         this.done = true;

         this.nodeType = PARALLEL_NODE;
    }
 }
 
 ParallelNode.prototype.isFinished = function(child) {
    if(child.state == NODE_STATE_FAILED) {
        this.state = NODE_STATE_FAILED;
        this.travelState = TRAVEL_STATE_FINISHED;
        return true;
    } else if(child.state == NODE_STATE_RUNNING) {
        this.done = false;
    }
    this.index++;
    if(this.index == this.children.length) {
       if(this.done) {
           this.state = NODE_STATE_SUCCESS;
           this.travelState = TRAVEL_STATE_FINISHED;
           return true;
       } else {
           this.state = NODE_STATE_RUNNING;
       }
    }
}
ParallelNode.prototype.nextChild = function() {
   if(this.index == this.children.length) {
       return null;
   } else {
       return this.children[this.index];
   }
}

class ActionNode extends BehaviourNode {
    constructor(name, action) {
        super(name || "Action-Node");
        this.action = action;

        this.nodeType = ACTION_NODE;
    }

}

ActionNode.prototype.process = function() {
    this.action();
    this.state = NODE_STATE_SUCCESS;
    this.travelState = TRAVEL_STATE_FINISHED;
}

class ActionNode2 extends BehaviourNode {
    constructor(name, inst, getActionFn) {
        super(name || "Action-Node2");
        this.inst = inst;
        this.getActionFn = getActionFn;
    }
}

ActionNode2.prototype.process = function() {

    if(this.state == NODE_STATE_READY) {
        let action = this.getActionFn();
        
        action.success = () => {
            this.state = NODE_STATE_SUCCESS;
        }
        action.failed = () => {
            this.state = NODE_STATE_FAILED;
        }
        this.inst.addAction(action);
        this.state = NODE_STATE_RUNNING;
    } 
    /*
    if(this.state == NODE_STATE_RUNNING) {
        
    }

    if(this.action()) {
        return NODE_STATE_SUCCESS;
    } 
    */
    return this.state;
}


let action1 = () => {
    console.log("hello action1.");
}

let action2 = () => {
    console.log("hello action2.");
}

let action3 = () => {
    console.log("hello action3.");
}

let sequenceNode3 = 

new SequenceNode("测试", 
    new ParallelNode("test2", 
        new ActionNode("action2", action1),
        new ActionNode("action3", action2),
        new ActionNode("action4", action3)
        ),     
);

buildMyBrain = function() { 
return  new SelectorNode("AI",
            new SequenceNode("去球场打球",
                new ConditionNode("不是情人节", null),
                new ActionNode("去球场", null),
                new ActionNode("打球", null)),
            new SelectorNode("约会")
    );
}



let helper = new TravHelper(sequenceNode3);

//export default helper;

var term;
var tinyCurses;
var bt;
(function() {
        var term_wrap_el = document.getElementById("term_wrap");
        term_wrap_el.style.display = "block";
        /* start the terminal */

        function write(str) {
                term.write(str)
        //        term.down
        }
    

        term = new Term(120, 30, write, 10000);
        tinyCurses = new TinyCurses(term);
        tinyCurses.open(15);

        helper.init();

        bt = new BTStateGraph(1, 1, 30, 20);
        bt.init(tinyCurses, helper.getAllInfos());
        bt.step = true;
//        bt.update(sequenceNode3);
})();

function step() {
    console.log("step");
    helper.step();
    console.log("prv-node: ", helper.prevNode.toStr());
    console.log("cur-node: ", helper.curNode.toStr(), helper.curNode.state)
    if(helper.nextNode) {
        console.log("nex-node: ", helper.nextNode.toStr());
    }
    bt.update(helper.curNode);
}
