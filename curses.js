 
const CBlack 	= 0
const CRed		= 1
const CGreen	= 2
const CBrown	= 3
const CBlue		= 4
const CPurple	= 5
const CCyan		= 6
const CLightGray= 7

const CDarkGray		= 10
const CLightRed		= 11
const CLightGreen   = 12
const CYellow		= 13
const CLightBlue	= 14
const CLightPurple	= 15
const CLightCyan	= 16
const CWrite		= 17


class TinyCurses {
	constructor(term) {
		this.term = term;
		this.isOpen = false;
		function defaultWrite(str) {
			term.write(str)
		}
		
		if(term == null) {
			this.term = new Term(80, 30, defaultWrite, 10000);
		}
		
		this.escStr = "\x1b["

		/**
		 * so, why i take the shit-code to here? hehe, fuck the const!!
		 * btw, you can referring the color defend. :) 
		 */
		this.colors = {
			fg : {
				0 		: 30,
				1		: 31,
				2		: 32,
				3		: 33,
				4		: 34,
  				5		: 35,
  				6		: 36,
  				7		: 37,

  				10		: "1;30",
  				11		: "1;31",
				12 		: "1;32",
				13		: "1;33",
				14		: "1;34",
				15		: "1;35",
				16		: "1;36",
				17		: "1;37",
			},
			bg : {
				0 		: 40,
				1		: 41,
				2		: 42,
				3		: 43,
				4		: 44,
  				5		: 45,
  				6		: 46,
  				7		: 47,

  				10		: 40,
  				11		: 40,
				12 		: 40,
				13		: 40,
				14		: 40,
				15		: 40,
				16		: 40,
				17		: 40,
			}
		}
	}
}

	/**
	 * @description open a terminal and set the font size
	 * @param {number} fontSize
	 */
	TinyCurses.prototype.open = function(fontSize) {
		if(this.isOpen) {
			return;
		}
		this.isOpen = true;
		term.open(document.getElementById("term_container"));
        term.term_el.style.fontSize = fontSize + "px";
	}
	
	TinyCurses.prototype.move = function(y, x) {
		let str = this.escStr + y + ";" + x + "H";
		term.write(str);
	}

	TinyCurses.prototype.getyx = function() {
		return {x : this.term.x, y : this.term.y};
	}


	TinyCurses.prototype.write = function(str) {
		term.write(str);
	}

	/**
	 * @description color list
	 * 
	 * // normal for fg and bg 
	 * fg | bg
	 * 30 | 40 "#000000",
     * 31 | 41 "#aa0000",
     * 32 | 42 "#00aa00",
     * 33 | 43"#aa5500",
	 * 34 | 44"#0000aa",
     * 35 | 45"#aa00aa",
     * 36 | 46"#00aaaa",
	 * 37 | 47"#aaaaaa",
	 * 
	 * // bright only for fg
	 * 
     *  1;30 "#555555",
     *  1;31 "#ff5555",
     *  1;32 "#55ff55",
     *  1;33 "#ffff55",
     *  1;34 "#5555ff",
     *  1;35 "#ff55ff",
     *  1;36 "#55ffff",
     *  1;37 "#ffffff" 
	 * 
	 * other information: http://www.tldp.org/HOWTO/Bash-Prompt-HOWTO/x329.html
	 */
	TinyCurses.prototype.setColor = function(fg, bg) {
		this.setFGColor(fg);
		this.setBGColor(bg);
	}

	TinyCurses.prototype.setFGColor = function(fg) {
		let c = this.colors.fg[fg]
		if(c) {
			str = this.escStr + c + "m";
			this.term.write(str);
		}
	}
	TinyCurses.prototype.setBGColor = function(bg) {
		let c = this.colors.bg[bg]
		if(c) {
			str = this.escStr + c + "m";
			this.term.write(str);
		}
	}
	
	TinyCurses.prototype.resetColor = function() {
		str = this.escStr + "0m";
		this.term.write(str);
	}

	/**
	 * @warning this is a low-level function, it will change the buffer line at terminal.
	 * take care.
	 */
	TinyCurses.prototype.setLineBGColor = function(bg, l, xmin, xmax) {
		if(l < 1) return ;
		let line = this.term.lines[l - 1];
		let bgnum = bg;
		if(xmin < 0) xmin = 0;
		if(xmax > line.length) xmax = line.length;

		for(let i = xmin; i < xmax; i++) {
			let char = line[i] & 0xffff;
			let attr = line[i] >> 20;
			attr = (attr << 4) | bgnum;
			line[i] = char | (attr << 16)
		}
	}

	TinyCurses.prototype.updateLine = function(line) {
		this.term.refresh(line, line);
	}
